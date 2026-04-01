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
      const source = searchParams.get('source'); // 'login' হলে login flow

      if (!code) {
        // কোড না থাকলে session check করো
        const { data: { session } } = await supabase.auth.getSession();
        if (session) router.replace('/dashboard');
        else router.replace('/login');
        return;
      }

      // ১. কোড থেকে session তৈরি করো
      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !exchangeData?.session) {
        console.error('Exchange Error:', exchangeError);
        router.replace('/login');
        return;
      }

      const user = exchangeData.session.user;

      // ── LOGIN FLOW ──
      if (source === 'login') {
        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .select('status, subscription_status, is_demo')
          .eq('id', user.id)
          .maybeSingle();

        if (!merchant) {
          await supabase.auth.signOut();
          router.replace('/login?error=no_account');
          return;
        }

        if (merchant.status === 'suspended') {
          await supabase.auth.signOut();
          router.replace('/login?error=suspended');
          return;
        }

        router.replace('/dashboard');
        return;
      }

      // ── SIGNUP FLOW ──
      const planId = searchParams.get('plan_id') || '1';
      const referCode = searchParams.get('ref') || null;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'XelPay Merchant';

      try {
        const result = await registerMerchantOAuth({
          userId: user.id,
          email: user.email!,
          fullName,
          planId,
          planPrice: 0,
          referCode,
        });

        if (result.error) {
          // Email already exists — sign out করে signup এ error পাঠাও
          await supabase.auth.signOut();
          router.replace('/signup?error=email_exists');
          return;
        }

        // নতুন account বা existing — dashboard এ পাঠাও
        router.replace('/dashboard');

      } catch (err) {
        console.error('registerMerchantOAuth error:', err);
        // Error হলেও dashboard try করো (merchant হয়তো আগেই আছে)
        router.replace('/dashboard');
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