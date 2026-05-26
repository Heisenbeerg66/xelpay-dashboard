'use client';

import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { Plan, BillingCycle } from './types';
import { cn } from '@/lib/utils';

export function PricingCard({ plan, cycle, current, delay = 0 }: {
  plan: Plan; cycle: BillingCycle; current?: boolean; delay?: number;
}) {
  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const perMonth = cycle === 'yearly' && plan.yearlyPrice > 0 ? Math.round(plan.yearlyPrice / 12) : price;
  const isPro = plan.id === 'pro';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative flex flex-col rounded-2xl border p-7 transition-shadow',
        isPro
          ? 'bg-blue-600/10 border-blue-500/40 shadow-xl shadow-blue-900/20'
          : 'bg-[#111827] border-slate-800/80'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-900/50">
            <Zap size={10} fill="currentColor" /> Most Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-base font-black text-white mb-1">{plan.name}</h3>
        <p className={cn('text-sm', isPro ? 'text-blue-300/70' : 'text-slate-500')}>{plan.description}</p>
      </div>

      <div className="mb-7">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-black text-white">${cycle === 'yearly' ? perMonth : price}</span>
          {price > 0 && <span className={cn('text-sm font-medium mb-1.5', isPro ? 'text-blue-400' : 'text-slate-500')}>/mo</span>}
        </div>
        {price === 0 && <span className="text-sm text-slate-500">Free forever</span>}
        {cycle === 'yearly' && price > 0 && (
          <p className="text-xs text-emerald-400 mt-1">Billed ${plan.yearlyPrice}/yr — save ${plan.monthlyPrice * 12 - plan.yearlyPrice}</p>
        )}
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5', isPro ? 'bg-blue-500/30' : 'bg-slate-700')}>
              <Check size={10} className={isPro ? 'text-blue-400' : 'text-slate-400'} />
            </div>
            <span className={cn('text-sm', isPro ? 'text-blue-100/80' : 'text-slate-400')}>{f}</span>
          </li>
        ))}
      </ul>

      {current ? (
        <div className="w-full py-3 rounded-xl text-center text-sm font-bold bg-slate-800 text-slate-500">
          Current Plan
        </div>
      ) : (
        <Link
          href={`/dashboard/billing/checkout?plan=${plan.id}&cycle=${cycle}`}
          className={cn(
            'w-full py-3 rounded-xl text-center text-sm font-bold transition-all',
            isPro
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          )}
        >
          {plan.id === 'starter' ? 'Downgrade' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade to Pro'}
        </Link>
      )}
    </motion.div>
  );
}
