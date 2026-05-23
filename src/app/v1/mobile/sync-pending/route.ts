// ============================================================
// src/app/api/mobile/sync-pending/route.ts
// POST — Re-sync previously failed transactions from device
//         Same logic as sync-sms but semantically distinct
//         (app uses this for offline queue drain after reconnect)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { processSmsTransactions } from '@/lib/mobile/sms-service';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { smsSyncSchema, validate } from '@/lib/mobile/validators';

async function handler(req: NextRequest, ctx: AuthContext) {
  // ── Rate limit (shared with sms-sync bucket) ──────────────
  const rl = rateLimit(
    `sms-sync:${ctx.device_id}`,
    LIMITS.SMS_SYNC.max,
    LIMITS.SMS_SYNC.windowMs
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = validate(smsSyncSchema, body);
  if (error || !data) {
    return NextResponse.json({ success: false, message: error ?? 'Invalid request body' }, { status: 400 });
  }

  // Timestamp check relaxed for pending sync (allow up to 24h old)
  const ageMs = Date.now() - data.timestamp;
  if (ageMs > 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { success: false, message: 'Pending sync data is too old (>24h).' },
      { status: 400 }
    );
  }

  try {
    const result = await processSmsTransactions(data.transactions, ctx);

    return NextResponse.json({
      success: true,
      synced: result.synced,
      skipped: result.skipped,
      failed: result.failed,
      details: result.details,
      message: `Pending sync complete: ${result.synced} synced, ${result.skipped} skipped.`,
    });
  } catch (err) {
    console.error('[sync-pending] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal error during pending sync.' },
      { status: 500 }
    );
  }
}

export const POST = withMobileAuth(handler);
