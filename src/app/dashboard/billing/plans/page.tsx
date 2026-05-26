'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PricingCard } from '@/components/billing/PricingCard';
import { BillingCycle, PLANS } from '@/components/billing/types';

export default function PlansPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft size={15} /> Back to Billing
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-2">Choose your plan</h1>
            <p className="text-slate-500">Simple, transparent pricing. No hidden fees.</p>
          </div>
        </motion.div>

        {/* Toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center">
          <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 rounded-xl p-1">
            {(['monthly', 'yearly'] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all ${cycle === c ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {c === 'yearly' && (
                  <span className="absolute -top-2.5 -right-2.5 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-17%</span>
                )}
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} cycle={cycle} current={plan.id === 'pro'} delay={0.1 + i * 0.08} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-[#111827] border border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-sm">
            All plans include a <strong className="text-slate-300">14-day free trial</strong>. Need a custom plan?{' '}
            <Link href="/dashboard/support" className="text-blue-400 hover:underline font-semibold">Contact sales →</Link>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
