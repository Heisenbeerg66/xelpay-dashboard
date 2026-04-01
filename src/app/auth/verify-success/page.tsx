'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, LogIn, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion'; // এনিমেশনের জন্য এটি ব্যবহার করা হয়েছে

export default function VerifySuccess() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 text-center shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
      >
        {/* এনিমেশন ব্যাকগ্রাউন্ড */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle size={48} strokeWidth={2.5} />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full"
            ></motion.div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Congratulations! 🎊</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
            Your email has been successfully verified. Your XelPay workspace is now fully active and ready to go.
          </p>

          <div className="flex flex-col gap-4">
            <Link href="/login" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <LogIn size={20} /> Login Now
            </Link>
            
            <Link href="/" className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
              <Home size={20} /> Back to Home
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Sparkles size={12} className="text-amber-500" /> Secure Verification Powered by XelPay
        </div>
      </motion.div>
    </div>
  );
}