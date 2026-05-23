// ============================================================
// src/lib/mobile/sms-service.ts
// SMS transaction validation, duplicate prevention, DB storage
// Integrates with existing sms_transactions table
// ============================================================

import { getMobileDb } from './db';
import { isProviderActive } from './gateway-service';
import { auditLog, AUDIT } from './audit';
import type { AuthContext } from './auth-middleware';
import type { SmsTransactionInput } from '@/types/mobile';
import { createHash } from 'crypto';

// Play Store compliant: blocked sender patterns (OTP, personal, marketing)
const BLOCKED_SMS_PATTERNS = [
  /\bOTP\b/i,
  /\bone.time.password\b/i,
  /\bverification.code\b/i,
  /\bdo not share\b/i,
  /\bnever share\b/i,
];

// ─── Process batch of SMS transactions ───────────────────────

export interface ProcessResult {
  trx_id: string;
  status: 'synced' | 'duplicate' | 'invalid' | 'blocked';
  reason?: string;
}

export async function processSmsTransactions(
  transactions: SmsTransactionInput[],
  ctx: AuthContext
): Promise<{ synced: number; skipped: number; failed: number; details: ProcessResult[] }> {
  const db = getMobileDb();
  const results: ProcessResult[] = [];
  let synced = 0, skipped = 0, failed = 0;

  for (const txn of transactions) {
    const result = await processSingle(db, txn, ctx);
    results.push(result);

    if (result.status === 'synced') synced++;
    else if (result.status === 'duplicate') skipped++;
    else failed++;
  }

  // Bulk audit log for the sync
  await auditLog({
    action: AUDIT.SMS_SYNCED,
    entity_id: ctx.device_id,
    ip: ctx.ip,
    details: {
      merchant_id: ctx.merchant_id,
      business_id: ctx.business_id,
      synced,
      skipped,
      failed,
      total: transactions.length,
    },
  });

  return { synced, skipped, failed, details: results };
}

// ─── Process a single SMS transaction ────────────────────────

async function processSingle(
  db: ReturnType<typeof getMobileDb>,
  txn: SmsTransactionInput,
  ctx: AuthContext
): Promise<ProcessResult> {
  const { trx_id, method, sender, message, amount, sms_hash, received_at } = txn;

  // 1. Basic validation
  if (!trx_id || !method || !sender || !message || amount <= 0) {
    return { trx_id: trx_id || 'unknown', status: 'invalid', reason: 'Missing required fields' };
  }

  // 2. Amount sanity check
  if (amount < 1 || amount > 10_000_000) {
    return { trx_id, status: 'invalid', reason: 'Amount out of valid range' };
  }

  // 3. Play Store compliance: block OTP / personal SMS patterns
  if (BLOCKED_SMS_PATTERNS.some((p) => p.test(message))) {
    await auditLog({ action: AUDIT.SMS_BLOCKED, entity_id: ctx.device_id, details: { trx_id, reason: 'otp_pattern' } });
    return { trx_id, status: 'blocked', reason: 'OTP or personal SMS not allowed' };
  }

  // 4. Check provider is active for this device
  const providerActive = await isProviderActive(ctx, method);
  if (!providerActive) {
    await auditLog({ action: AUDIT.SMS_BLOCKED, entity_id: ctx.device_id, details: { trx_id, provider: method, reason: 'provider_inactive' } });
    return { trx_id, status: 'blocked', reason: `Provider '${method}' is not active` };
  }

  // 5. Duplicate check by trx_id per merchant
  const merchantId = ctx.merchant_id!;
  const { data: existingTrx } = await db
    .from('sms_transactions')
    .select('id')
    .eq('merchant_id', merchantId)
    .eq('trx_id', trx_id)
    .maybeSingle();

  if (existingTrx) {
    return { trx_id, status: 'duplicate', reason: 'Transaction already exists' };
  }

  // 6. SMS hash duplicate check (secondary guard against relay attacks)
  if (sms_hash) {
    const serverHash = computeSmsHash(sender, message);
    const { data: hashExists } = await db
      .from('mobile_sms_hashes')
      .select('id')
      .eq('sms_hash', serverHash)
      .maybeSingle();

    if (hashExists) {
      return { trx_id, status: 'duplicate', reason: 'SMS hash already processed' };
    }

    // Store hash
    await db.from('mobile_sms_hashes').insert({
      sms_hash: serverHash,
      merchant_id: merchantId,
      trx_id,
    }).select();
  }

  // 7. Insert into sms_transactions (existing table)
  const { error: insertError } = await db
    .from('sms_transactions')
    .insert({
      merchant_id: merchantId,
      sender: sender.substring(0, 20),
      method: method.substring(0, 50),
      message,
      trx_id: trx_id.substring(0, 100),
      amount,
      received_at: received_at ?? new Date().toISOString(),
      is_used: false,
    });

  if (insertError) {
    // Handle unique constraint violations gracefully
    if (insertError.code === '23505') {
      return { trx_id, status: 'duplicate', reason: 'Unique constraint violation' };
    }
    console.error('[sms-service] Insert error:', insertError.message);
    return { trx_id, status: 'invalid', reason: 'Database error' };
  }

  // 8. Try to match pending orders (best-effort)
  await tryMatchPendingOrder(db, merchantId, txn, ctx);

  return { trx_id, status: 'synced' };
}

// ─── Match SMS transaction to pending orders ──────────────────

async function tryMatchPendingOrder(
  db: ReturnType<typeof getMobileDb>,
  merchantId: string,
  txn: SmsTransactionInput,
  ctx: AuthContext
): Promise<void> {
  try {
    const { data: order } = await db
      .from('orders')
      .select('id, amount, status')
      .eq('merchant_id', merchantId)
      .eq('trx_id', txn.trx_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (order && Math.abs(order.amount - txn.amount) < 1) {
      await db
        .from('orders')
        .update({ status: 'success' })
        .eq('id', order.id);
    }
  } catch {
    // Best-effort only — don't fail the SMS sync
  }
}

// ─── Compute server-side SMS hash ────────────────────────────

function computeSmsHash(sender: string, message: string): string {
  return createHash('sha256')
    .update(`${sender}:${message}`)
    .digest('hex');
}
