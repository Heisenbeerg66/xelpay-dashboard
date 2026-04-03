'use client';

import { useEffect, Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserX, LogIn, UserPlus, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

// User Not Found Modal 
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
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">User Not Found</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-7 leading-relaxed">
          We couldn't find a XelPay account linked to this Google account. Please create an account or log in with your existing account.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSignup}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <UserPlus size={15} /> Create An Account
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
  const isProcessed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      // Prevent running twice in React Strict Mode
      if (isProcessed.current) return;
      isProcessed.current = true;

      // 🔴 FIX 1: Give Supabase Client 500ms to auto-process Magic Link/PKCE code securely
      await new Promise(resolve => setTimeout(resolve, 500));

      // 🔴 FIX 2: Gracefully fetch the session (No manual code exchange conflict)
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // 🔴 FIX 3: Fallback manual exchange if Supabase auto-processing failed
      if (!session) {
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          session = data?.session || null;
        }
      }

      // Security Check: For Google OAuth only (Magic Link has no tx)
      const tx = searchParams.get('tx');
      const savedTx = sessionStorage.getItem('auth_tx');
      if (tx && tx !== savedTx) {
        sessionStorage.removeItem('auth_tx');
        router.replace('/login');
        return;
      }
      sessionStorage.removeItem('auth_tx');
      localStorage.removeItem('oauth_plan_id');
      localStorage.removeItem('oauth_plan_price');
      localStorage.removeItem('oauth_refer_code');
      localStorage.removeItem('oauth_source');

      // If absolutely no session could be established
      if (!session) {
        router.replace('/login');
        return;
      }

      // ── CHECK MERCHANT DATA ──
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id, status')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!merchant) {
        await supabase.auth.signOut();
        setShowNotFound(true);
        return;
      }

      if (merchant.status === 'suspended') {
        await supabase.auth.signOut();
        router.replace('/login?error=suspended');
        return;
      }

      // ── SUCCESS: Redirect to Dashboard ──
      router.replace('/dashboard');
    };

    handleAuth();
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
    router.replace('/login');
  };

  return (
    <>
      <UserNotFoundModal
        isOpen={showNotFound}
        onSignup={handleGoSignup}
        onLogin={handleGoLogin}
        onBackdrop={handleBackdrop}
      />

      <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
              <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent absolute top-0 left-0 animate-spin"></div>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">Checking credentials</h2>
            <p className="text-slate-400 text-sm text-center max-w-[220px] leading-relaxed">
              Verifying your secure login request...
            </p>
          </div>
      </div>
    </>
  );
}

export default function AuthCallback() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const ThemeToggle = () => (
      mounted ? (
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      ) : <div className="w-9 h-9" />
    );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 md:hidden">
        <div className="h-16 flex items-center px-4 justify-between relative max-w-7xl mx-auto w-full">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-default"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <Suspense fallback={null}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}