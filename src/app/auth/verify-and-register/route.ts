// app/auth/verify-and-register/route.ts
//
// Server-side OTP verification + merchant registration in a single atomic
// request. This eliminates the race condition where the client verified the
// OTP, then called a server action, and the middleware fired in between
// before the merchant row existed in the database.
//
// Flow:
//   1. Client POSTs { email, token, ...merchantPayload }
//   2. Server verifies OTP with Supabase admin client (no client session needed)
//   3. Server inserts merchant row atomically in the same request
//   4. Server sets Supabase session cookies via SSR cookie helpers
//   5. Returns { ok: true, merchantDisplayId } — client shows success modal
//   6. Client does window.location.href = '/dashboard' (full reload, cookies
//      are already committed — middleware sees session + merchant immediately)

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// ── Admin client (service role) — used for DB writes only ───────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Helpers (mirrored from auth.ts to keep this route self-contained) ────────
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function incrementReferrer(referCode: string): Promise<void> {
  if (!referCode) return;
  const { data: referrer } = await supabaseAdmin
    .from('merchants')
    .select('id, total_refer')
    .eq('refer_id', referCode)
    .maybeSingle();
  if (!referrer) return;
  await supabaseAdmin
    .from('merchants')
    .update({ total_refer: (referrer.total_refer ?? 0) + 1 })
    .eq('id', referrer.id);
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      token,          // 6-digit OTP from the user
      userId,         // pre-auth userId from supabase.auth.signUp() — may be '' for ghost users
      fullName,
      phone,
      address,
      referCode,
      planId,
      planPrice,
      merchantDisplayId,
    } = body;

    // ── Basic input validation ─────────────────────────────────────────────
    if (!email || !token || token.length !== 6 || !fullName || !merchantDisplayId) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    // ── 1. Verify OTP server-side and obtain a real session ────────────────
    //    We use the SSR Supabase client so the resulting session cookies are
    //    written directly into the HTTP response — the browser receives them
    //    in the same round-trip, before any navigation happens.
    const cookieStore = await cookies();
    const supabaseSSR = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                // localhost-এ secure: true হলে cookie set হয় না (HTTP),
                // তাই production ছাড়া secure: false রাখতে হবে।
                secure: process.env.NODE_ENV === 'production',
              })
            );
          },
        },
      }
    );

    const { data: verifyData, error: verifyError } = await supabaseSSR.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (verifyError || !verifyData?.user) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please try again.' },
        { status: 401 }
      );
    }

    const verifiedUserId = verifyData.user.id;

    // ── 2. Resolve the final userId ────────────────────────────────────────
    //    For ghost users the client-side userId was empty string; we now have
    //    the real one from the verified session.
    const finalUserId = userId || verifiedUserId;

    // ── 3. Idempotency — if merchant row already exists, return it ─────────
    const { data: existingById } = await supabaseAdmin
      .from('merchants')
      .select('id, merchant_id_display')
      .eq('id', finalUserId)
      .maybeSingle();

    if (existingById) {
      return NextResponse.json({ ok: true, merchantDisplayId: existingById.merchant_id_display });
    }

    // ── 4. Email duplicate check ───────────────────────────────────────────
    const { data: existingByEmail } = await supabaseAdmin
      .from('merchants')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingByEmail) {
      // A merchant with this email exists under a different auth user — sign
      // out the newly verified session to avoid limbo state, then report.
      await supabaseSSR.auth.signOut();
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      );
    }

    // ── 5. Insert merchant row ─────────────────────────────────────────────
    const referId = `XEL-${merchantDisplayId}`;
    const accountStatus = (planPrice ?? 0) === 0 ? 'active' : 'pending';

    const { error: insertError } = await supabaseAdmin.from('merchants').insert({
      id: finalUserId,
      merchant_id_display: merchantDisplayId,
      name: fullName,
      email,
      phone: phone || null,
      address: address || null,
      slug: null,
      currency: 'BDT',
      status: accountStatus,
      subscription_status: accountStatus,
      plan_id: planId || null,
      refer_id: referId,
      referred_by: referCode || null,
      total_refer: 0,
      affiliate_wallet: 0,
      is_demo: false,
      is_email_verified: true,
      telegram_link_code: generateRandomString(12),
      device_connection_key: generateRandomString(24),
    });

    if (insertError) {
      // Race condition: another request inserted between our check and insert
      if (insertError.code === '23505') {
        const { data: raceRow } = await supabaseAdmin
          .from('merchants')
          .select('merchant_id_display')
          .eq('id', finalUserId)
          .maybeSingle();
        if (raceRow) {
          return NextResponse.json({ ok: true, merchantDisplayId: raceRow.merchant_id_display });
        }
      }
      console.error('[verify-and-register] Insert error:', JSON.stringify(insertError));
      return NextResponse.json(
        { error: `Failed to save profile. (${insertError.code}: ${insertError.message})` },
        { status: 500 }
      );
    }

    // ── 6. Increment referrer count if applicable ──────────────────────────
    if (referCode) {
      await incrementReferrer(referCode);
    }

    // ── 7. Respond with success ────────────────────────────────────────────
    //    Session cookies were already written to the response by the SSR
    //    client in step 1 — the browser now has a valid authenticated session
    //    AND the merchant row exists. Middleware will see both on the next
    //    request, so window.location.href = '/dashboard' works immediately.
    return NextResponse.json({ ok: true, merchantDisplayId });

  } catch (err) {
    console.error('[verify-and-register] Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}