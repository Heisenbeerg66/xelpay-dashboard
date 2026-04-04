'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/app/info/[slug]/BackButton';
import TermsContent from './TermsContent';
import { FileText, Globe } from 'lucide-react';

type Lang = 'en' | 'bn';

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <>
      <main className="py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Back link */}
          <BackButton />

          {/* Header Card */}
          <div className="bg-white dark:bg-[#111827] p-7 md:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {lang === 'en' ? 'Terms of Service' : 'সেবার শর্তাবলী'}
                  </h1>
                  <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-2"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Globe size={14} className="text-slate-400" />
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-black">
                  <button onClick={() => setLang('en')}
                    className={`px-3 py-1.5 transition-colors uppercase tracking-widest ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    EN
                  </button>
                  <button onClick={() => setLang('bn')}
                    className={`px-3 py-1.5 transition-colors ${lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    বাং
                  </button>
                </div>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {lang === 'en'
                ? 'Last Updated: April 01, 2026 · Effective Immediately · 25 Sections · Governed by Bangladesh Law.'
                : 'সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬ · তাৎক্ষণিকভাবে কার্যকর · ২৫টি অনুচ্ছেদ'}
            </p>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {lang === 'en' ? 'Also read our Privacy Policy for data handling information.' : 'ডেটা পরিচালনার তথ্যের জন্য আমাদের গোপনীয়তা নীতিও পড়ুন।'}
              </p>
              <Link href="/info/privacy" className="shrink-0 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 border border-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                {lang === 'en' ? 'Privacy →' : 'গোপনীয়তা →'}
              </Link>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
            {/* কন্টেন্ট ইমপোর্ট করা হলো */}
            <TermsContent lang={lang} />
          </div>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-slate-500 py-8 px-6 border-t border-slate-800 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-lg font-semibold text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          <div className="flex gap-5">
            <Link href="/info/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/info/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/info/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <span className="opacity-40 uppercase tracking-widest text-[10px]">© {new Date().getFullYear()} XelPay · Xenverse IT · All Rights Reserved</span>
        </div>
      </footer>
    </>
  );
}