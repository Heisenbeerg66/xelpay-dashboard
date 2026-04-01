'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { registerMerchantOAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

// ১. মূল লজিক এবং ডিজাইনকে একটি আলাদা কম্পোনেন্টে রাখা হয়েছে
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error("Auth Error:", error);
        router.push('/login');
        return;
      }

      const planId = searchParams.get('plan_id') || '1'; 
      const referCode = searchParams.get('ref');
      
      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'XelPay Merchant';

      try {
        await registerMerchantOAuth({
          userId: user.id,
          email: user.email!,
          fullName: fullName,
          planId: planId,
          planPrice: 0, 
          referCode: referCode,
        });

        router.push('/dashboard');
        
      } catch (err) {
        console.error("Database Save Error:", err);
        router.push('/dashboard'); 
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="bg-slate-50 dark:bg-[#111827] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-500">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authenticating...</h2>
      <p className="text-slate-500 font-medium text-sm mt-2 text-center max-w-[250px]">
        Please wait a moment while we set up your XelPay workspace securely.
      </p>
    </div>
  );
}

// ২. মেইন পেজে সেই কম্পোনেন্টটিকে Suspense দিয়ে মুড়িয়ে দেওয়া হয়েছে (যেটা Next.js চাচ্ছে)
export default function AuthCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B1120] font-sans">
      <Suspense fallback={
        <div className="bg-slate-50 dark:bg-[#111827] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Loading...</h2>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
