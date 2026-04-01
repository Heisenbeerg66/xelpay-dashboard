'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { registerMerchantOAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      // login page থেকে এলে source=login থাকবে
      const source = searchParams.get('source');

      if (code) {
        // ১. কোডটিকে সেশনে রূপান্তর করে কুকিতে সেভ করা
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !exchangeData.session) {
          console.error("Exchange Error:", exchangeError);
          router.push('/login');
          return;
        }

        const user = exchangeData.session.user;
        const planId = searchParams.get('plan_id') || '1';
        const referCode = searchParams.get('ref');
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'XelPay Merchant';

        // ── LOGIN FLOW: merchant না থাকলে error দিয়ে login এ ফেরত পাঠাও ──
        if (source === 'login') {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('status')
            .eq('id', user.id)
            .maybeSingle();

          if (!merchant) {
            // Merchant নেই — sign out করে login page এ error সহ পাঠাও
            await supabase.auth.signOut();
            router.push('/login?error=no_account');
            return;
          }

          // Suspended check
          if (merchant.status === 'suspended') {
            await supabase.auth.signOut();
            router.push('/login?error=suspended');
            return;
          }

          // সফল login — dashboard এ পাঠাও
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
          return;
        }

        // ── SIGNUP FLOW: same email দিয়ে আগে account থাকলে block করো ──
        try {
          const result = await registerMerchantOAuth({
            userId: user.id,
            email: user.email!,
            fullName: fullName,
            planId: planId,
            planPrice: 0,
            referCode: referCode,
          });

          if (result.error) {
            // Email already exists — sign out করে signup page এ error সহ পাঠাও
            await supabase.auth.signOut();
            router.push('/signup?error=email_exists');
            return;
          }

          // alreadyExists = true মানে এটা re-login, dashboard এ পাঠাও
          // (এই case signup flow তে হওয়ার কথা না, তবু safe থাকা ভালো)
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);

        } catch (err) {
          console.error("Database Save Error:", err);
          setTimeout(() => router.push('/dashboard'), 1500);
        }

      } else {
        // কোড না থাকলে ডাইরেক্ট সেশন চেক
        const { data: { session } } = await supabase.auth.getSession();
        if (session) router.push('/dashboard');
        else router.push('/login');
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="bg-slate-50 dark:bg-[#111827] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-500">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Setting Up Workspace...</h2>
      <p className="text-slate-500 font-medium text-sm mt-2 text-center max-w-[250px]">
        We are securing your session and preparing your merchant dashboard.
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B1120] font-sans px-4">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}