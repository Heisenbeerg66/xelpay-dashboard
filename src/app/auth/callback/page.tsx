'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { registerMerchantOAuth } from '@/lib/auth';
import { Loader2, UserX, LogIn, UserPlus } from 'lucide-react';

// Fix 12: Theme-safe cache clear — শুধু auth-related keys clear করে, theme রাখে
function clearAuthCache() {
  const KEEP_KEYS = ['theme', 'active_business_id'];
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !KEEP_KEYS.includes(key)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  sessionStorage.clear();
}

// Fix 12: User Not Found Modal — minimal premium
function UserNotFoundModal({ isOpen, onSignup, onLogin, onBackdrop }: {
  isOpen: boolean;
  onSignup: () => void;
  onLogin: () => void;
  onBackdrop: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onBackdrop}
    >
      <div
        className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <UserX size={26} className="text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Not Found</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-7 leading-relaxed">
          No XelPay account is linked to this Google account. Please register or log in with your existing account.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSignup}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <UserPlus size={15} /> Register Now
          </button>
          <button
            onClick={onLogin}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <LogIn size={15} /> Login Instead
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNotFound, setShowNotFound] = useState(false);

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

      // Fix 12: theme ছাড়া বাকি oauth data clear করো
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
          // Fix 12: Sign out, clear auth cache (theme stays), show modal
          await supabase.auth.signOut();
          clearAuthCache();
          setShowNotFound(true);
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

  const handleGoSignup = () => {
    setShowNotFound(false);
    router.replace('/signup');
  };

  const handleGoLogin = () => {
    setShowNotFound(false);
    router.replace('/login');
  };

  const handleBackdrop = () => {
    setShowNotFound(false);
    router.replace('/signup');
  };

  return (
    <>
      {/* Fix 12: User Not Found Modal */}
      <UserNotFoundModal
        isOpen={showNotFound}
        onSignup={handleGoSignup}
        onLogin={handleGoLogin}
        onBackdrop={handleBackdrop}
      />

      {/* Fix 16: Minimal premium callback UI */}
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
    </>
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