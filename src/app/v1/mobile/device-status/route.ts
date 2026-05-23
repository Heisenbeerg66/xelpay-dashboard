// ============================================================
// src/app/api/mobile/device-status/route.ts
// GET — Returns current device status and today's stats
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getMobileDb } from '@/lib/mobile/db';
import { getActiveGatewaysForDevice } from '@/lib/mobile/gateway-service';

async function handler(req: NextRequest, ctx: AuthContext) {
  const db = getMobileDb();

  // ── Fetch device row ──────────────────────────────────────
  let deviceData: {
    device_name: string | null;
    is_active: boolean;
    last_sync: string | null;
    battery_level: string | null;
    app_version: string | null;
  } | null = null;

  if (ctx.connection_type === 'merchant') {
    const { data } = await db
      .from('merchant_devices_vault')
      .select('device_name, is_active, last_sync, battery_level, app_version')
      .eq('id', ctx.device_id)
      .maybeSingle();
    deviceData = data;
  } else {
    const { data } = await db
      .from('business_devices')
      .select('device_name, is_active, last_sync, battery_level, app_version')
      .eq('id', ctx.device_id)
      .maybeSingle();
    deviceData = data;
  }

  if (!deviceData) {
    return NextResponse.json(
      { success: false, message: 'Device not found.' },
      { status: 404 }
    );
  }

  // ── Today's SMS stats (using existing sms_transactions) ───
  const merchantId = ctx.merchant_id!;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: todayCount } = await db
    .from('sms_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .gte('created_at', todayStart.toISOString());

  // ── Active providers ──────────────────────────────────────
  const { activeProviders } = await getActiveGatewaysForDevice(ctx);

  return NextResponse.json({
    success: true,
    is_active: deviceData.is_active,
    connection_type: ctx.connection_type,
    device_name: deviceData.device_name ?? 'Unknown Device',
    last_sync: deviceData.last_sync,
    battery_level: deviceData.battery_level,
    app_version: deviceData.app_version,
    active_providers: activeProviders,
    today_sms_count: todayCount ?? 0,
    pending_sync_count: 0, // device tracks this locally
  });
}

export const GET = withMobileAuth(handler);
