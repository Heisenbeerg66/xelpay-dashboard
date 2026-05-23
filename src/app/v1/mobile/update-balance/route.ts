// ============================================================
// src/app/api/mobile/update-balance/route.ts
// POST — Update provider account balance from mobile app
// Updates business_gateways or merchant_payment_vault
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getMobileDb } from '@/lib/mobile/db';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { auditLog, AUDIT } from '@/lib/mobile/audit';
import { balanceUpdateSchema, validate } from '@/lib/mobile/validators';

async function handler(req: NextRequest, ctx: AuthContext) {
  // ── Rate limit ────────────────────────────────────────────
  const rl = rateLimit(`balance:${ctx.device_id}`, LIMITS.BALANCE.max, LIMITS.BALANCE.windowMs);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, message: 'Rate limit exceeded.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = validate(balanceUpdateSchema, body);
  if (error || !data) {
    return NextResponse.json({ success: false, message: error ?? 'Invalid request body' }, { status: 400 });
  }

  const db = getMobileDb();

  if (ctx.connection_type === 'business' && ctx.business_id) {
    // ── Update business_gateways ──────────────────────────
    const { data: gateway, error: gwError } = await db
      .from('business_gateways')
      .select('id, business_id')
      .eq('id', data.gateway_id)
      .eq('business_id', ctx.business_id) // ownership check
      .maybeSingle();

    if (gwError || !gateway) {
      return NextResponse.json(
        { success: false, message: 'Gateway not found or access denied.' },
        { status: 404 }
      );
    }

    // business_gateways doesn't have a balance column by default
    // Store in mobile_balances extension table
    await db.from('mobile_balances').upsert(
      {
        entity_type: 'business',
        entity_id: ctx.business_id,
        gateway_id: data.gateway_id,
        account_number: data.account_number,
        provider: data.provider,
        balance: data.balance,
        updated_at: data.updated_at,
        updated_by_device: ctx.device_id,
      },
      { onConflict: 'entity_id,gateway_id,account_number' }
    );
  } else if (ctx.connection_type === 'merchant' && ctx.merchant_id) {
    // ── Update merchant_payment_vault ─────────────────────
    const { data: vault, error: vaultError } = await db
      .from('merchant_payment_vault')
      .select('id, merchant_id')
      .eq('id', data.gateway_id)
      .eq('merchant_id', ctx.merchant_id) // ownership check
      .maybeSingle();

    if (vaultError || !vault) {
      return NextResponse.json(
        { success: false, message: 'Payment vault entry not found.' },
        { status: 404 }
      );
    }

    await db.from('mobile_balances').upsert(
      {
        entity_type: 'merchant',
        entity_id: ctx.merchant_id,
        gateway_id: data.gateway_id,
        account_number: data.account_number,
        provider: data.provider,
        balance: data.balance,
        updated_at: data.updated_at,
        updated_by_device: ctx.device_id,
      },
      { onConflict: 'entity_id,gateway_id,account_number' }
    );
  }

  await auditLog({
    action: AUDIT.BALANCE_UPDATED,
    entity_id: ctx.device_id,
    ip: ctx.ip,
    details: {
      gateway_id: data.gateway_id,
      provider: data.provider,
      account_number: data.account_number,
      balance: data.balance,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Balance updated successfully.',
    provider: data.provider,
    balance: data.balance,
    updated_at: data.updated_at,
  });
}

export const POST = withMobileAuth(handler);
