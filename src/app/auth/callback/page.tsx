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

      // Code → Session
      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !exchangeData?.session) {
        console.error('Exchange error:', exchangeError);
        router.replace('/login');
        return;
      }

      const user = exchangeData.session.user;

      // localStorage থেকে OAuth flow data পড়ো
      const oauthSource = localStorage.getItem('oauth_source') || 'signup';
      const oauthPlanId = localStorage.getItem('oauth_plan_id') || null;
      const oauthPlanPrice = parseFloat(localStorage.getItem('oauth_plan_price') || '0');
      const oauthReferCode = localStorage.getItem('oauth_refer_code') || null;

      // ব্যবহার শেষে clear করো
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
        planId: oauthPlanId,           // user যে plan select করেছিল
        planPrice: oauthPlanPrice,     // সেই plan এর price
        referCode: oauthReferCode || null,
      });

      if (result.error) {
        await supabase.auth.signOut();
        router.replace('/signup?error=email_exists');
        return;
      }

      // alreadyExists মানে আগেই account আছে — dashboard এ যাও
      router.replace('/dashboard');
    };

    handle();
  }, [router, searchParams]);

  return (
    <div className="bg-slate-50 dark:bg-[#111827] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-500">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
        Setting Up Workspace...
      </h2>
      <p className="text-slate-500 font-medium text-sm mt-2 text-center max-w-[250px]">
        Securing your session and preparing your merchant dashboard.
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