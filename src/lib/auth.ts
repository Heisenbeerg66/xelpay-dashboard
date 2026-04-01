'use server';

import { createClient } from '@supabase/supabase-js';

// Use service role for server-side operations (bypasses RLS securely)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // never exposed to client
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generate6DigitID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// র‍্যান্ডম কোড জেনারেট করার ফাংশন
function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
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
  merchantDisplayId: string; // <-- ইমেইল সিঙ্কের জন্য ক্লায়েন্ট থেকে আসছে
}) {
  const { userId, email, fullName, phone, address, referCode, planId, planPrice, merchantDisplayId } = payload;

  // Double-check duplicate (server-side — cannot be bypassed from client)
  const { data: existing } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .maybeSingle();

  if (existing) {
    return { error: 'Email or phone already registered.' };
  }

  const accountStatus = planPrice === 0 ? 'active' : 'pending';
  
  // টেলিগ্রাম এবং ডিভাইসের জন্য কোড জেনারেট
  const telegramCode = generateRandomString(12);
  const deviceKey = generateRandomString(24);

  const { error } = await supabaseAdmin.from('merchants').upsert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    slug: null,
    name: fullName,
    email,
    phone,
    address,
    currency: 'BDT',
    status: accountStatus,
    plan_id: planId,
    referred_by: referCode || null,
    is_demo: false,
    subscription_status: accountStatus,
    telegram_id_code: telegramCode,        // <-- স্টোর হচ্ছে
    device_connection_key: deviceKey       // <-- স্টোর হচ্ছে
  });

  if (error) {
    console.error('[registerMerchant] DB error:', error);
    return { error: 'Failed to create merchant profile. Contact support.' };
  }

  return { merchantDisplayId };
}

// ─── REGISTER MERCHANT VIA GOOGLE OAUTH (called from /auth/callback) ───────
export async function registerMerchantOAuth(payload: {
  userId: string;
  email: string;
  fullName: string;
  planId: string;
  planPrice: number;
  referCode: string | null;
}) {
  const { userId, email, fullName, planId, planPrice, referCode } = payload;

  // Check if merchant already exists (Google re-auth case)
  const { data: existing } = await supabaseAdmin
    .from('merchants')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return { alreadyExists: true };

  const merchantDisplayId = generate6DigitID();
  const accountStatus = planPrice === 0 ? 'active' : 'pending'; 

  // টেলিগ্রাম এবং ডিভাইসের জন্য কোড জেনারেট
  const telegramCode = generateRandomString(12);
  const deviceKey = generateRandomString(24);

  const { error } = await supabaseAdmin.from('merchants').insert({
    id: userId,
    merchant_id_display: merchantDisplayId,
    slug: null,
    name: fullName,
    email,
    phone: null,        // <-- Google auth এ ফোন null থাকবে
    address: null,      // <-- Google auth এ অ্যাড্রেস null থাকবে
    currency: 'BDT',
    status: accountStatus, 
    plan_id: planId,
    referred_by: referCode || null,
    is_demo: false,
    subscription_status: accountStatus, 
    is_email_verified: true, // Google accounts are pre-verified
    telegram_id_code: telegramCode,        // <-- স্টোর হচ্ছে
    device_connection_key: deviceKey       // <-- স্টোর হচ্ছে
  });

  if (error) {
    console.error('[registerMerchantOAuth] DB error:', error);
    return { error: 'Failed to create merchant profile.' };
  }

  return { merchantDisplayId };
}

// ─── SYNC EMAIL VERIFIED FLAG (called after login) ──────────────────────────
export async function syncEmailVerified(userId: string) {
  await supabaseAdmin
    .from('merchants')
    .update({ is_email_verified: true })
    .eq('id', userId);
}

// ─── GET MERCHANT STATUS (for login gate checks) ────────────────────────────
export async function getMerchantStatus(userId: string) {
  const { data } = await supabaseAdmin
    .from('merchants')
    .select('status, is_demo')
    .eq('id', userId)
    .single();
  return data;
}