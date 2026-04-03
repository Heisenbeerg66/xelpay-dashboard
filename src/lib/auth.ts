'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generate6DigitID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// ─── INCREMENT REFERRER'S total_refer COUNT ─────────────────────────────────
async function incrementReferrer(referCode: string): Promise<void> {
  if (!referCode) return;

  // Find the referrer merchant whose refer_id matches the provided referCode
  const { data: referrer } = await supabaseAdmin
    .from('merchants')
    .select('id, total_refer')
    .eq('refer_id', referCode)
    .maybeSingle();

  if (!referrer) return; // Invalid referral code — silently skip

  await supabaseAdmin
    .from('merchants')
    .update({ total_refer: (referrer.total_refer ?? 0) + 1 })
    .eq('id', referrer.id);
}

// ─── REGISTER MERCHANT (Email/Password) ────────────────────────────────────
export async function registerMerchant(payload: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  referCode: string | null;
  planId: string | null;
  planPrice: number;
  merchantDisplayId: string;
}) {
  const {
    userId, email, fullName, phone, address,
    referCode, planId, planPrice, merchantDisplayId,
  } = payload;

  // Idempotency check — if userId already exists, return early
  const { data: existingById } = await supabaseAdmin
    .from('merchants')
    .select('id, merchant_id_display')
    .eq('id', userId)
    .maybeSingle();

  if (existingById) {
    return { merchantDisplayId: existingById.merchant_id_display };
  }

  // Email duplicate check
  const { data: existingByEmail } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail) {
    return { error: 'Email already registered. Please login instead.' };
  }

  // ─── Affiliate: Generate this merchant's unique refer_id ───
  const referId = `XEL-${merchantDisplayId}`;
  const accountStatus = planPrice === 0 ? 'active' : 'pending';

  const { error: insertError } = await supabaseAdmin.from('merchants').insert({
    id: userId,
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
    // ─── Affiliate columns ───
    refer_id: referId,
    referred_by: referCode || null,
    total_refer: 0,
    affiliate_wallet: 0,
    // ────────────────────────
    is_demo: false,
    is_email_verified: true, // OTP already verified before calling this function
    telegram_link_code: generateRandomString(12),
    device_connection_key: generateRandomString(24),
  });

  if (insertError) {
    console.error('[registerMerchant] Insert error:', JSON.stringify(insertError));
    if (insertError.code === '23505') {
      const { data: raceData } = await supabaseAdmin
        .from('merchants')
        .select('merchant_id_display')
        .eq('id', userId)
        .maybeSingle();
      if (raceData) return { merchantDisplayId: raceData.merchant_id_display };
    }
    return { error: `Failed to save profile. (${insertError.code}: ${insertError.message})` };
  }

  // ─── Affiliate: Increment referrer's count if a valid code was used ───
  if (referCode) {
    await incrementReferrer(referCode);
  }

  return { merchantDisplayId };
}

// ─── REGISTER MERCHANT VIA GOOGLE OAUTH ────────────────────────────────────
export async function registerMerchantOAuth(payload: {
  userId: string;
  email: string;
  fullName: string;
  planId: string | null;
  planPrice: number;
  referCode: string | null;
}) {
  const { userId, email, fullName, planId, planPrice, referCode } = payload;

  const { data: existingById } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingById) return { alreadyExists: true };

  const { data: existingByEmail } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail) {
    return { error: 'Email already registered. Please login with your existing account.' };
  }

  const merchantDisplayId = generate6DigitID();
  const referId = `XEL-${merchantDisplayId}`;
  const accountStatus = planPrice === 0 ? 'active' : 'pending';

  const { error: insertError } = await supabaseAdmin.from('merchants').insert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    name: fullName,
    email,
    phone: null,
    address: null,
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
    is_email_verified: false,
    telegram_link_code: generateRandomString(12),
    device_connection_key: generateRandomString(24),
  });

  if (insertError) {
    console.error('[registerMerchantOAuth] Insert error:', JSON.stringify(insertError));
    if (insertError.code === '23505') return { alreadyExists: true };
    return { error: `Failed to save profile. (${insertError.code}: ${insertError.message})` };
  }

  if (referCode) {
    await incrementReferrer(referCode);
  }

  return { merchantDisplayId };
}

// ─── REGISTER MERCHANT VIA INVITE ──────────────────────────────────────────
export async function registerMerchantInvite(payload: {
  userId: string;
  email: string;
  fullName: string;
  planId: string | null;
  planPrice: number;
  referCode: string | null;
}) {
  const { userId, email, fullName, planId, planPrice, referCode } = payload;

  const { data: existingById } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingById) return { alreadyExists: true };

  const { data: existingByEmail } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail) {
    return { error: 'Email already registered. Please login with your existing account.' };
  }

  const merchantDisplayId = generate6DigitID();
  const referId = `XEL-${merchantDisplayId}`;
  const accountStatus = planPrice === 0 ? 'active' : 'pending';

  const { error: insertError } = await supabaseAdmin.from('merchants').insert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    name: fullName,
    email,
    phone: null,
    address: null,
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
    // Invited users are admin-verified — mark email as already confirmed
    is_email_verified: true,
    telegram_link_code: generateRandomString(12),
    device_connection_key: generateRandomString(24),
  });

  if (insertError) {
    console.error('[registerMerchantInvite] Insert error:', JSON.stringify(insertError));
    if (insertError.code === '23505') return { alreadyExists: true };
    return { error: `Failed to save profile. (${insertError.code}: ${insertError.message})` };
  }

  if (referCode) {
    await incrementReferrer(referCode);
  }

  return { merchantDisplayId };
}

export async function syncEmailVerified(userId: string) {
  await supabaseAdmin
    .from('merchants')
    .update({ is_email_verified: true })
    .eq('id', userId);
}

export async function getMerchantStatus(userId: string) {
  const { data } = await supabaseAdmin
    .from('merchants')
    .select('status, is_demo, subscription_status')
    .eq('id', userId)
    .single();
  return data;
}