import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { processSmsTransactions } from '@/lib/mobile/sms-service';
import { rateLimit, LIMITS } from '@/lib/mobile/rate-limit';
import { smsSyncSchema, validate } from '@/lib/mobile/validators';

async function handler(req: NextRequest, ctx: AuthContext) {
  const rl = rateLimit(
    `sms-sync:${ctx.device_id}`,
    LIMITS.SMS_SYNC.max,
    LIMITS.SMS_SYNC.windowMs
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded. Slow down sync.' },
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
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ success: false, message: "No valid data provided" }, { status: 400 });
  }

  const ageMs = Math.abs(Date.now() - data.timestamp);
  if (ageMs > 5 * 60 * 1000) {
    return NextResponse.json(
      { success: false, message: 'Request timestamp is too old or too far in the future.' },
      { status: 400 }
    );
  }

  if (data.device_fingerprint !== ctx.device_fingerprint) {
    return NextResponse.json(
      { success: false, message: 'Device fingerprint mismatch.' },
      { status: 403 }
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
    });
  } catch (err) {
    console.error('[sync-sms] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error during sync.' },
      { status: 500 }
    );
  }
}

export const POST = withMobileAuth(handler);