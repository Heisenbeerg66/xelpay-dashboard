'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Check, Shield, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CheckoutStepper } from '@/components/billing/CheckoutStepper';
import { BillingCard } from '@/components/billing/BillingCard';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { PLANS, BillingCycle, PlanId } from '@/components/billing/types';

const STEPS = [{ id: 1, label: 'Plan' }, { id: 2, label: 'Payment' }, { id: 3, label: 'Review' }, { id: 4, label: 'Done' }];

const METHOD_LABELS: Record<string, string> = {
  card: 'Visa •••• 4242', bkash: 'bKash (+880 1XXX)', nagad: 'Nagad (+880 1XXX)',
  rocket: 'Rocket (+880 1XXX)', bank: 'Bank Transfer', crypto: 'Crypto (USDT)',
};

function ReviewContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const planId  = (params.get('plan') || 'pro') as PlanId;
  const cycle   = (params.get('cycle') || 'monthly') as BillingCycle;
  const method  = params.get('method') || 'card';
  const coupon  = params.get('coupon') || '';
  const plan    = PLANS.find((p) => p.id === planId) || PLANS[1];

  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);

  const price    = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const discount = coupon === 'XELPAY20' ? price * 0.2 : 0;
  const total    = price - discount;

  const handleConfirm = () => {
    if (!agreed) return;
    setLoading(true);
    setTimeout(() => router.push('/dashboard/billing/processing'), 600);
  };

  const rowCls = 'flex justify-between text-sm';

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-7">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/billing/payment?plan=${planId}&cycle=${cycle}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft size={15} /> Back
          </Link>
          <h1 className="text-xl font-black text-white">Review Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Confirm your details before payment</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CheckoutStepper steps={STEPS} current={3} />
        </motion.div>

        <BillingCard delay={0.15}>
          <div className="p-5 space-y-5">

            {/* Plan */}
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Subscription Plan</p>
              <div className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{plan.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{plan.name} Plan</p>
                      <PlanBadge plan={planId} />
                    </div>
                    <p className="text-xs text-slate-500">{cycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}</p>
                  </div>
                </div>
                <span className="font-black text-white">${price}/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Payment */}
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Payment Method</p>
              <div className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
                  <CreditCard size={15} className="text-slate-300" />
                </div>
                <span className="font-semibold text-white text-sm">{METHOD_LABELS[method] || method}</span>
                <Link href={`/dashboard/billing/payment?plan=${planId}&cycle=${cycle}&coupon=${coupon}`} className="ml-auto text-xs font-bold text-blue-400 hover:text-blue-300">Change</Link>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Summary */}
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Billing Summary</p>
              <div className="space-y-2.5">
                <div className={rowCls}><span className="text-slate-400">{plan.name} Plan ({cycle})</span><span className="font-semibold text-white">${price.toFixed(2)}</span></div>
                {discount > 0 && <div className={rowCls}><span className="text-emerald-400">Coupon discount</span><span className="font-semibold text-emerald-400">-${discount.toFixed(2)}</span></div>}
                <div className={rowCls}><span className="text-slate-400">Tax</span><span className="font-semibold text-white">$0.00</span></div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between">
                  <span className="font-black text-white">Total Due Today</span>
                  <span className="font-black text-xl text-blue-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 shrink-0 ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}
              >
                {agreed && <Check size={11} className="text-white" />}
              </div>
              <span className="text-sm text-slate-400">
                I agree to the{' '}
                <Link href="/info/terms" className="text-blue-400 hover:underline font-semibold">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/info/privacy" className="text-blue-400 hover:underline font-semibold">Privacy Policy</Link>.
                Subscription renews automatically until cancelled.
              </span>
            </label>

            {!agreed && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={13} /> Please agree to the terms to continue.
              </div>
            )}

            <motion.button
              onClick={handleConfirm} disabled={!agreed || loading} whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${agreed ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Lock size={13} /> Confirm Payment — ${total.toFixed(2)}</>
              }
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
              <Shield size={11} /> 256-bit SSL encrypted · Secured payment
            </div>
          </div>
        </BillingCard>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense><ReviewContent /></Suspense>;
}
