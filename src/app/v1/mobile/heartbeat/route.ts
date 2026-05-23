// ============================================================
// src/app/api/mobile/heartbeat/route.ts
// POST — Periodic ping from device: updates last_sync,
//         battery_level, app_version, and device health
// Called every 5 minutes by the Flutter app
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getMobileDb } from '@/lib/mobile/db';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { auditLog, AUDIT } from '@/lib/mobile/audit';
import { heartbeatSchema, validate } from '@/lib/mobile/validators';

async function handler(req: NextRequest, ctx: AuthContext) {
  // ── Rate limit: 60/min per device ────────────────────────
  const rl = rateLimit(
    `heartbeat:${ctx.device_id}`,
    LIMITS.HEARTBEAT.max,
    LIMITS.HEARTBEAT.windowMs
  );
  if (!rl.allowed) {
    // Silently accept to avoid breaking the app — just don't process
    return NextResponse.json({ success: true, message: 'ok' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = validate(heartbeatSchema, body);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }

  const db = getMobileDb();
  const now = new Date().toISOString();

  const updateData = {
    battery_level: data.battery_level,
    app_version: data.app_version,
    android_version: data.android_version,
    device_model: data.device_model,
    last_sync: now,
    updated_at: now,
  };

  if (ctx.connection_type === 'merchant') {
    await db
      .from('merchant_devices_vault')
      .update(updateData)
      .eq('id', ctx.device_id);
  } else {
    await db
      .from('business_devices')
      .update(updateData)
      .eq('id', ctx.device_id);
  }

  // Log low battery as a warning
  const batteryNum = parseInt(data.battery_level, 10);
  if (!isNaN(batteryNum) && batteryNum < 15) {
    await auditLog({
      action: AUDIT.HEARTBEAT,
      entity_id: ctx.device_id,
      ip: ctx.ip,
      details: {
        warning: 'low_battery',
        battery_level: data.battery_level,
        is_sms_permission_granted: data.is_sms_permission_granted,
      },
    });
  }

  return NextResponse.json({
    success: true,
    server_time: now,
    message: 'ok',
  });
}

export const POST = withMobileAuth(handler);
