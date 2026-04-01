'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

// এই পেজ তখনই আসে যখন user auth এ আছে কিন্তু merchants table এ নেই
// এটা sign out করে login এ পাঠিয়ে দেবে
export default function NoMerchantPage() {
  const router = useRouter();

  useEffect(() => {
    const cleanup = async () => {
      // সব cache ও session clear করো
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();
      // Cookies clear করার জন্য reload দরকার
      router.replace('/signup');
    };
    cleanup();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1120] font-sans">
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Account Setup Incomplete</h2>
        <p className="text-slate-500 font-medium text-sm">Redirecting you to signup...</p>
      </div>
    </div>
  );
}