// ============================================================
// src/lib/mobile/auth-middleware.ts
// Validates mobile JWT, checks device is still active in DB
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken, extractBearerToken } from './jwt';
import { getMobileDb } from './db';
import { auditLog } from './audit';
import type { MobileTokenPayload } from '@/types/mobile';

export interface AuthContext {
  device_id: string;
  merchant_id: string | null;
  business_id: string | null;
  connection_type: 'merchant' | 'business';
  device_fingerprint: string;
  ip: string;
}

type RouteHandler = (
  req: NextRequest,
  ctx: AuthContext
) => Promise<NextResponse>;

// ─── withMobileAuth HOC ──────────────────────────────────────

export function withMobileAuth(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';

    // 1. Extract token
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing token' },
        { status: 401 }
      );
    }

    // 2. Verify JWT signature + expiry
    const payload = await verifyMobileToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // 3. Verify device still active in DB
    const db = getMobileDb();
    const isActive = await checkDeviceActive(db, payload);
    if (!isActive) {
      await auditLog({
        action: 'mobile.auth.device_inactive',
        entity_id: payload.device_id,
        ip,
        details: { device_id: payload.device_id },
      });
      return NextResponse.json(
        { success: false, message: 'Forbidden: Device disconnected or inactive' },
        { status: 403 }
      );
    }

    // 4. Replay attack prevention: check X-Request-ID uniqueness
    const requestId = req.headers.get('x-request-id');
    const timestamp = req.headers.get('x-timestamp');
    if (requestId && timestamp) {
      const replayBlocked = await checkReplayAttack(db, requestId, timestamp);
      if (replayBlocked) {
        return NextResponse.json(
          { success: false, message: 'Bad Request: Duplicate request detected' },
          { status: 400 }
        );
      }
    }

    // 5. Call handler with auth context
    const ctx: AuthContext = {
      device_id: payload.device_id,
      merchant_id: payload.merchant_id,
      business_id: payload.business_id,
      connection_type: payload.connection_type,
      device_fingerprint: payload.device_fingerprint,
      ip,
    };

    return handler(req, ctx);
  };
}

// ─── Check device is active ──────────────────────────────────

async function checkDeviceActive(
  db: ReturnType<typeof getMobileDb>,
  payload: MobileTokenPayload
): Promise<boolean> {
  if (payload.connection_type === 'merchant') {
    const { data } = await db
      .from('merchant_devices_vault')
      .select('id, is_active')
      .eq('id', payload.device_id)
      .eq('is_active', true)
      .maybeSingle();
    return !!data;
  } else {
    const { data } = await db
      .from('business_devices')
      .select('id, is_active')
      .eq('id', payload.device_id)
      .eq('is_active', true)
      .maybeSingle();
    return !!data;
  }
}

// ─── Replay attack prevention ────────────────────────────────
// Stores request IDs in audit_logs; rejects duplicates within 5 min window

async function checkReplayAttack(
  db: ReturnType<typeof getMobileDb>,
  requestId: string,
  timestampHeader: string
): Promise<boolean> {
  // Validate timestamp is within 5 minutes
  const ts = parseInt(timestampHeader, 10);
  const now = Date.now();
  if (Math.abs(now - ts) > 5 * 60 * 1000) return true; // too old/future

  // Check if request ID was seen in last 10 minutes
  const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();
  const { data } = await db
    .from('audit_logs')
    .select('id')
    .eq('action', 'mobile.request.seen')
    .eq('ip_address', requestId) // repurpose ip_address to store request_id
    .gte('created_at', tenMinutesAgo)
    .maybeSingle();

  if (data) return true; // duplicate

  // Record this request ID
  await db.from('audit_logs').insert({
    action: 'mobile.request.seen',
    ip_address: requestId,
    details: { timestamp: ts },
  });

  return false;
}
