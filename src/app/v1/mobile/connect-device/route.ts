// ============================================================
// src/app/api/mobile/connect-device/route.ts
// POST — Link a mobile device using connection key or QR
//
// Connection flow:
//   merchants.device_connection_key → ConnectionType = 'merchant'
//   businesses.device_connection_key → ConnectionType = 'business'
//
// On success: registers device in merchant_devices_vault or
//             business_devices, returns JWT tokens.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getMobileDb } from '@/lib/mobile/db';
import {
  generateMobileAccessToken,
  generateMobileRefreshToken,
} from '@/lib/mobile/jwt';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { auditLog, AUDIT } from '@/lib/mobile/audit';
import { connectDeviceSchema, validate } from '@/lib/mobile/validators';
import { getActiveGatewaysForDevice, SMS_PROVIDERS } from '@/lib/mobile/gateway-service';
import type { AuthContext } from '@/lib/mobile/auth-middleware';

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // ── Rate limit: 10 connect attempts per IP per 15 min ────
  const rl = rateLimit(`connect:${ip}`, LIMITS.DEVICE_CONNECT.max, LIMITS.DEVICE_CONNECT.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many connection attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } }
    );
  }

  // ── Parse & validate body ────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = validate(connectDeviceSchema, body);
  if (error || !data) {
    return NextResponse.json({ success: false, message: error ?? 'Invalid request body' }, { status: 400 });
  }

  const {
    connection_key,
    device_name,
    device_model,
    android_version,
    app_version,
    device_fingerprint,
  } = data;

  const db = getMobileDb();

  // ── Resolve connection key against merchants first ────────
  const { data: merchant } = await db
    .from('merchants')
    .select('id, name, email, status, subscription_status')
    .eq('device_connection_key', connection_key)
    .maybeSingle();

  if (merchant) {
    // ── Merchant key: validate account health ─────────────
    if (merchant.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account suspended or inactive.' },
        { status: 403 }
      );
    }

    if (merchant.subscription_status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Subscription expired. Please renew.' },
        { status: 403 }
      );
    }

    // ── Upsert device in merchant_devices_vault ───────────
    const deviceRow = await upsertMerchantDevice(db, {
      merchant_id: merchant.id,
      connection_key,
      device_name,
      device_model,
      android_version,
      app_version,
    });

    // ── Generate tokens ────────────────────────────────────
    const tokenPayload = {
      device_id: deviceRow.id,
      merchant_id: merchant.id,
      business_id: null as string | null,
      connection_type: 'merchant' as const,
      device_fingerprint,
    };

    const [accessToken, refreshToken] = await Promise.all([
      generateMobileAccessToken(tokenPayload),
      generateMobileRefreshToken(deviceRow.id),
    ]);

    // ── Fetch active providers ─────────────────────────────
    const ctx: AuthContext = {
      ...tokenPayload,
      ip,
    };
    const { activeProviders } = await getActiveGatewaysForDevice(ctx);

    await auditLog({
      action: AUDIT.DEVICE_CONNECTED,
      entity_id: deviceRow.id,
      ip,
      details: {
        merchant_id: merchant.id,
        device_name,
        connection_type: 'merchant',
      },
    });

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      device_id: deviceRow.id,
      merchant_id: merchant.id,
      business_id: null,
      business_name: merchant.name,
      email: merchant.email,
      connection_type: 'merchant',
      active_providers: activeProviders.length > 0 ? activeProviders : SMS_PROVIDERS,
    });
  }

  // ── Try business key ──────────────────────────────────────
  const { data: business } = await db
    .from('businesses')
    .select('id, merchant_id, business_name, support_email, status')
    .eq('device_connection_key', connection_key)
    .maybeSingle();

  if (business) {
    if (business.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Business account is not active.' },
        { status: 403 }
      );
    }

    // ── Verify parent merchant is active ──────────────────
    const { data: parentMerchant } = await db
      .from('merchants')
      .select('id, status, subscription_status')
      .eq('id', business.merchant_id)
      .maybeSingle();

    if (!parentMerchant || parentMerchant.status !== 'active' || parentMerchant.subscription_status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Parent merchant account is not active.' },
        { status: 403 }
      );
    }

    // ── Upsert device in business_devices ─────────────────
    const deviceRow = await upsertBusinessDevice(db, {
      business_id: business.id,
      connection_key,
      device_name,
      device_model,
      android_version,
      app_version,
    });

    const tokenPayload = {
      device_id: deviceRow.id,
      merchant_id: business.merchant_id,
      business_id: business.id,
      connection_type: 'business' as const,
      device_fingerprint,
    };

    const [accessToken, refreshToken] = await Promise.all([
      generateMobileAccessToken(tokenPayload),
      generateMobileRefreshToken(deviceRow.id),
    ]);

    const ctx: AuthContext = {
      ...tokenPayload,
      ip,
    };
    const { activeProviders } = await getActiveGatewaysForDevice(ctx);

    await auditLog({
      action: AUDIT.DEVICE_CONNECTED,
      entity_id: deviceRow.id,
      ip,
      details: {
        business_id: business.id,
        merchant_id: business.merchant_id,
        device_name,
        connection_type: 'business',
      },
    });

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      device_id: deviceRow.id,
      merchant_id: business.merchant_id,
      business_id: business.id,
      business_name: business.business_name,
      email: business.support_email ?? '',
      connection_type: 'business',
      active_providers: activeProviders.length > 0 ? activeProviders : SMS_PROVIDERS,
    });
  }

  // ── Key not found ─────────────────────────────────────────
  await auditLog({
    action: AUDIT.INVALID_AUTH,
    ip,
    details: { reason: 'invalid_connection_key' },
  });

  return NextResponse.json(
    { success: false, message: 'Invalid connection key.' },
    { status: 401 }
  );
}

// ─── Upsert merchant device ───────────────────────────────────

async function upsertMerchantDevice(
  db: ReturnType<typeof getMobileDb>,
  data: {
    merchant_id: string;
    connection_key: string;
    device_name: string;
    device_model?: string;
    android_version?: string;
    app_version?: string;
  }
) {
  // Check if device already registered for this merchant + key
  const { data: existing } = await db
    .from('merchant_devices_vault')
    .select('id')
    .eq('merchant_id', data.merchant_id)
    .eq('connection_key', data.connection_key)
    .maybeSingle();

  if (existing) {
    // Update existing device
    await db
      .from('merchant_devices_vault')
      .update({
        device_name: data.device_name,
        device_model: data.device_model,
        android_version: data.android_version,
        app_version: data.app_version,
        is_active: true,
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    return existing;
  }

  // Insert new device
  const { data: inserted, error } = await db
    .from('merchant_devices_vault')
    .insert({
      merchant_id: data.merchant_id,
      connection_key: data.connection_key,
      device_name: data.device_name,
      device_model: data.device_model,
      android_version: data.android_version,
      app_version: data.app_version,
      is_active: true,
      last_sync: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to register merchant device: ${error?.message}`);
  }

  return inserted;
}

// ─── Upsert business device ───────────────────────────────────

async function upsertBusinessDevice(
  db: ReturnType<typeof getMobileDb>,
  data: {
    business_id: string;
    connection_key: string;
    device_name: string;
    device_model?: string;
    android_version?: string;
    app_version?: string;
  }
) {
  const { data: existing } = await db
    .from('business_devices')
    .select('id')
    .eq('business_id', data.business_id)
    .eq('connection_key', data.connection_key)
    .maybeSingle();

  if (existing) {
    await db
      .from('business_devices')
      .update({
        device_name: data.device_name,
        device_model: data.device_model,
        android_version: data.android_version,
        app_version: data.app_version,
        is_active: true,
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    return existing;
  }

  const { data: inserted, error } = await db
    .from('business_devices')
    .insert({
      business_id: data.business_id,
      connection_key: data.connection_key,
      device_name: data.device_name,
      device_model: data.device_model,
      android_version: data.android_version,
      app_version: data.app_version,
      is_active: true,
      last_sync: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to register business device: ${error?.message}`);
  }

  return inserted;
}
