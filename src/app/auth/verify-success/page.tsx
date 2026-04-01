'use client';

import { CheckCircle, LogIn, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function VerifySuccess() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] md:rounded-[2.5rem] p-8 md:p-10 text-center shadow-none md:shadow-2xl border-0 md:border border-slate-100 dark:border-slate-800 relative overflow-hidden">

        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="mb-8 flex justify-center">
          <CheckCircle size={80} strokeWidth={2} className="text-[#10B981]" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
          Congratulations! 🎊
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
          Your email has been successfully verified. Your XelPay workspace is now fully active and ready to go.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <LogIn size={20} /> Login Now
          </Link>
          <Link href="/" className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
            <Home size={20} /> Back to Home
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Sparkles size={12} className="text-amber-500" /> Secure Verification Powered by XelPay
        </div>
      </div>
    </div>
  );
}