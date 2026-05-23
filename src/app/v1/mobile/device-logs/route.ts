// ============================================================
// src/app/api/mobile/device-logs/route.ts
// POST — Receive device-side logs for remote diagnostics
//         Stored in audit_logs (reuses existing table)
//         Errors logged immediately; info/warn batched
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getMobileDb } from '@/lib/mobile/db';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { auditLog, AUDIT } from '@/lib/mobile/audit';
import { deviceLogsSchema, validate } from '@/lib/mobile/validators';

async function handler(req: NextRequest, ctx: AuthContext) {
  // ── Rate limit ────────────────────────────────────────────
  const rl = rateLimit(`logs:${ctx.device_id}`, LIMITS.LOGS.max, LIMITS.LOGS.windowMs);
  if (!rl.allowed) {
    return NextResponse.json({ success: true }); // silently accept
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = validate(deviceLogsSchema, body);
  if (error || !data) {
    return NextResponse.json({ success: false, message: error ?? 'Invalid request body' }, { status: 400 });
  }

  const db = getMobileDb();

  // ── Insert logs into audit_logs ───────────────────────────
  const logEntries = data.logs.map((log) => ({
    action: `mobile.device.log.${log.level}`,
    user_id: null,
    ip_address: ctx.ip,
    details: {
      device_id: ctx.device_id,
      merchant_id: ctx.merchant_id,
      business_id: ctx.business_id,
      message: log.message,
      context: log.context ?? {},
      device_timestamp: log.timestamp,
      source: 'mobile_device',
    },
    created_at: new Date().toISOString(),
  }));

  // Only store error-level logs to save DB space
  // info/warn are counted but not stored individually
  const errorLogs = logEntries.filter((l) => l.action.includes('.error'));
  if (errorLogs.length > 0) {
    await db.from('audit_logs').insert(errorLogs);
  }

  await auditLog({
    action: AUDIT.LOG_RECEIVED,
    entity_id: ctx.device_id,
    ip: ctx.ip,
    details: {
      total_logs: data.logs.length,
      error_count: data.logs.filter((l) => l.level === 'error').length,
      warn_count: data.logs.filter((l) => l.level === 'warn').length,
    },
  });

  return NextResponse.json({
    success: true,
    received: data.logs.length,
  });
}

export const POST = withMobileAuth(handler);
