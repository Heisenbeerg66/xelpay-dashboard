'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { registerMerchantOAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // ১. Supabase থেকে ইউজারের সেশন চেক করা
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error("Auth Error:", error);
        router.push('/login');
        return;
      }

      // ২. URL থেকে প্ল্যান আইডি এবং রেফার কোড নেওয়া (যা সাইনআপের সময় পাস করা হয়েছিল)
      const planId = searchParams.get('plan_id') || '1'; // '1' এর জায়গায় আপনার ডিফল্ট Free Plan এর ID দিতে পারেন
      const referCode = searchParams.get('ref');
      
      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'XelPay Merchant';

      try {
        // ৩. আপনার auth.ts এর সার্ভার অ্যাকশন কল করে merchants টেবিলে ডেটা সেভ করা
        await registerMerchantOAuth({
          userId: user.id,
          email: user.email!,
          fullName: fullName,
          planId: planId,
          planPrice: 0, // Google Auth-এ ডিফল্ট 0 পাঠানো হচ্ছে, সার্ভার একে Active করে নিবে
          referCode: referCode,
        });

        // ৪. সবকিছু ঠিক থাকলে ডিরেক্ট ড্যাশবোর্ডে পাঠানো
        router.push('/dashboard');
        
      } catch (err) {
        console.error("Database Save Error:", err);
        router.push('/dashboard'); // এরর হলেও ড্যাশবোর্ডে পাঠাবে যেন ইউজার আটকে না থাকে
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B1120] font-sans">
      <div className="bg-slate-50 dark:bg-[#111827] p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-500">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authenticating...</h2>
        <p className="text-slate-500 font-medium text-sm mt-2 text-center max-w-[250px]">
          Please wait a moment while we set up your XelPay workspace securely.
        </p>
      </div>
    </div>
  );
}