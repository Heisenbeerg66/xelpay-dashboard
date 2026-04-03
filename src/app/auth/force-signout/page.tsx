'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

// এই পেজ সব session/cache clear করে তারপর redirect করে
// Middleware থেকে পাঠানো হয় যখন auth আছে কিন্তু merchant নেই
function ForceSignoutContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/signup';

  useEffect(() => {
    const doSignOut = async () => {
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        // ignore
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(redirectTo);
    };
    doSignOut();
  }, [redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1120]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium text-sm">Clearing session...</p>
      </div>
    </div>
  );
}

export default function ForceSignout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <ForceSignoutContent />
    </Suspense>
  );
}