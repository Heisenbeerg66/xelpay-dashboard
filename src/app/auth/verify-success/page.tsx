'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, LogIn, Home, Sparkles, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Fix 19 & 22: verify-success has header (landing feel), Login Now goes directly to /login
export default function VerifySuccess() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans flex flex-col">

      {/* Header — landing page feel */}
      <header className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-6 justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
          <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
            >
              {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}
          <Link href="/"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Home size={15} /> Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl md:rounded-3xl p-8 md:p-10 text-center shadow-sm md:shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">

          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-600/5 rounded-full blur-3xl"></div>

          <div className="mb-7 flex justify-center">
            <CheckCircle size={72} strokeWidth={1.5} className="text-emerald-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Email Verified! 🎊
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 leading-relaxed">
            Your email has been successfully verified. Your XelPay workspace is now fully active and ready to go.
          </p>

          <div className="flex flex-col gap-3">
            {/* Fix 22: directly to /login, no data clearing */}
            <Link href="/login"
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <LogIn size={16} /> Login Now
            </Link>
            <Link href="/"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
              <Home size={16} /> Back to Home
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest">
            <Sparkles size={11} className="text-amber-400" /> Powered by XelPay
          </div>
        </div>
      </div>
    </div>
  );
}