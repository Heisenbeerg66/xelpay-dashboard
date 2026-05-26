'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';

const STEPS = [
  { label: 'Connecting to payment gateway', duration: 1200 },
  { label: 'Verifying payment details',     duration: 1400 },
  { label: 'Processing transaction',        duration: 1600 },
  { label: 'Activating subscription',       duration: 1000 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress]       = useState(0);

  useEffect(() => {
    const total = STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 80;
      setProgress(Math.min((elapsed / total) * 100, 99));

      let acc = 0;
      let idx = 0;
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration;
        if (elapsed < acc) { idx = i; break; }
        idx = i;
      }
      setCurrentStep(idx);

      if (elapsed >= total) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => router.push('/dashboard/billing/success'), 500);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-8">

        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-blue-600"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/60"
            >
              <Lock size={16} className="text-white" />
            </motion.div>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black text-white mb-1">Processing Payment</h1>
          <p className="text-slate-500 text-sm">Please don't close this window</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600">{Math.round(progress)}%</span>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            return (
              <motion.div
                key={step.label}
                animate={{ opacity: done || active ? 1 : 0.3 }}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${active ? 'bg-blue-500/10 border border-blue-500/20' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 border-emerald-500' : active ? 'border-blue-500' : 'border-slate-700'}`}>
                  {done   && <div className="w-2 h-2 bg-white rounded-full" />}
                  {active && <motion.div animate={{ scale: [1,1.4,1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <span className={`text-sm font-semibold ${done ? 'text-emerald-400' : active ? 'text-blue-400' : 'text-slate-600'}`}>{step.label}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700">
          <Shield size={11} /> Secured by 256-bit SSL
        </div>
      </div>
    </div>
  );
}
