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
    const handle = async () => {
      const code = searchParams.get('code');

      if (!code) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) router.replace('/dashboard');
        else router.replace('/login');
        return;
      }

      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !exchangeData?.session) {
        router.replace('/login');
        return;
      }

      const user = exchangeData.session.user;

      // localStorage থেকে OAuth flow data পড়ো
      const oauthSource = localStorage.getItem('oauth_source') || 'signup';
      const oauthPlanId = localStorage.getItem('oauth_plan_id') || null;
      const oauthPlanPrice = parseFloat(localStorage.getItem('oauth_plan_price') || '0');
      const oauthReferCode = localStorage.getItem('oauth_refer_code') || null;

      // Fix 16: theme ছাড়া বাকি oauth data clear করো
      localStorage.removeItem('oauth_plan_id');
      localStorage.removeItem('oauth_plan_price');
      localStorage.removeItem('oauth_refer_code');
      localStorage.removeItem('oauth_source');

      // ── LOGIN FLOW ──
      if (oauthSource === 'login') {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, status')
          .eq('id', user.id)
          .maybeSingle();

        if (!merchant) {
          // Fix 16: Sign out কিন্তু localStorage clear করি না (theme থাকুক)
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
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        'XelPay Merchant';

      const result = await registerMerchantOAuth({
        userId: user.id,
        email: user.email!,
        fullName,
        planId: oauthPlanId,
        planPrice: oauthPlanPrice,
        referCode: oauthReferCode,
      });

      if (result.error) {
        await supabase.auth.signOut();
        router.replace('/signup?error=email_exists');
        return;
      }

      router.replace('/dashboard');
    };

    handle();
  }, [router, searchParams]);

  return (
    // Fix 16: Minimal premium callback UI
    <div className="bg-white dark:bg-[#111827] p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center">
      <div className="relative mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">Checking credentials</h2>
      <p className="text-slate-400 text-sm text-center max-w-[220px] leading-relaxed">
        Verifying your information securely...
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] font-sans px-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 text-xs uppercase tracking-widest">Loading...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}