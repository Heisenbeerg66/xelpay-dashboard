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
      // গুগল থেকে পাওয়া সিক্রেট কোড
      const code = searchParams.get('code');
      
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

        try {
          // ২. সার্ভার সাইড অ্যাকশনের মাধ্যমে ডাটাবেসে সেভ করা (পুরোনো ইউজার হলে স্কিপ করবে)
          await registerMerchantOAuth({
            userId: user.id,
            email: user.email!,
            fullName: fullName,
            planId: planId,
            planPrice: 0, 
            referCode: referCode,
          });

          // ৩. কুকি ব্রাউজারে পুরোপুরি সেট হওয়ার জন্য একটু অপেক্ষা করে ড্যাশবোর্ডে পাঠানো
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