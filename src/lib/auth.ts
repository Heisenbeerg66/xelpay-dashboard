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

// ─── REGISTER MERCHANT (Email/Password) ────────────────────────────────────
export async function registerMerchant(payload: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  referCode: string | null;
  planId: string;
  planPrice: number;
  merchantDisplayId: string;
}) {
  const { userId, email, fullName, phone, address, referCode, planId, planPrice, merchantDisplayId } = payload;

  // ১. আগে userId দিয়ে check করো — duplicate signup হলে gracefully handle করো
  const { data: existingById } = await supabaseAdmin
    .from('merchants')
    .select('id, merchant_id_display')
    .eq('id', userId)
    .maybeSingle();

  if (existingById) {
    // ইতিমধ্যে আছে — same merchantDisplayId return করো (idempotent)
    return { merchantDisplayId: existingById.merchant_id_display };
  }

  // ২. Email বা phone duplicate check
  const orFilter = phone
    ? `email.eq.${email},phone.eq.${phone}`
    : `email.eq.${email}`;

  const { data: existingByContact } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .or(orFilter)
    .maybeSingle();

  if (existingByContact) {
    return { error: 'Email or phone already registered. Please login.' };
  }

  const accountStatus = planPrice === 0 ? 'active' : 'pending';
  const telegramCode = generateRandomString(12);
  const deviceKey = generateRandomString(24);

  const { error } = await supabaseAdmin.from('merchants').insert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    slug: null,
    name: fullName,
    email,
    phone: phone || null,
    address: address || null,
    currency: 'BDT',
    status: accountStatus,
    subscription_status: accountStatus,
    plan_id: planId,
    referred_by: referCode || null,
    is_demo: false,
    is_email_verified: false,
    telegram_id_code: telegramCode,
    device_connection_key: deviceKey,
  });

  if (error) {
    console.error('[registerMerchant] DB error:', error.message, error.details);
    // Duplicate key error — userId already exists (race condition)
    if (error.code === '23505') {
      const { data: race } = await supabaseAdmin
        .from('merchants')
        .select('merchant_id_display')
        .eq('id', userId)
        .maybeSingle();
      if (race) return { merchantDisplayId: race.merchant_id_display };
    }
    return { error: 'Failed to create merchant profile. Contact support.' };
  }

  return { merchantDisplayId };
}

// ─── REGISTER MERCHANT VIA GOOGLE OAUTH ────────────────────────────────────
export async function registerMerchantOAuth(payload: {
  userId: string;
  email: string;
  fullName: string;
  planId: string;
  planPrice: number;
  referCode: string | null;
}) {
  const { userId, email, fullName, planId, planPrice, referCode } = payload;

  // ১. userId দিয়ে check — পুরনো user হলে alreadyExists return করো
  const { data: existingById } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingById) return { alreadyExists: true };

  // ২. Email দিয়ে check — অন্য account এ এই email আছে কিনা
  const { data: existingByEmail } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail) {
    return { error: 'Email already registered. Please login with your existing account.' };
  }

  const merchantDisplayId = generate6DigitID();
  const accountStatus = planPrice === 0 ? 'active' : 'pending';
  const telegramCode = generateRandomString(12);
  const deviceKey = generateRandomString(24);

  const { error } = await supabaseAdmin.from('merchants').insert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    slug: null,
    name: fullName,
    email,
    phone: null,
    address: null,
    currency: 'BDT',
    status: accountStatus,
    subscription_status: accountStatus,
    plan_id: planId,
    referred_by: referCode || null,
    is_demo: false,
    is_email_verified: true, // Google accounts pre-verified
    telegram_id_code: telegramCode,
    device_connection_key: deviceKey,
  });

  if (error) {
    console.error('[registerMerchantOAuth] DB error:', error.message, error.details);
    if (error.code === '23505') {
      // Race condition — already inserted
      return { alreadyExists: true };
    }
    return { error: 'Failed to create merchant profile.' };
  }

  return { merchantDisplayId };
}

// ─── SYNC EMAIL VERIFIED FLAG ──────────────────────────────────────────────
export async function syncEmailVerified(userId: string) {
  await supabaseAdmin
    .from('merchants')
    .update({ is_email_verified: true })
    .eq('id', userId);
}

// ─── GET MERCHANT STATUS ───────────────────────────────────────────────────
export async function getMerchantStatus(userId: string) {
  const { data } = await supabaseAdmin
    .from('merchants')
    .select('status, is_demo, subscription_status')
    .eq('id', userId)
    .single();
  return data;
}