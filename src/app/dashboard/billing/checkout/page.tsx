'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Tag, Shield, Lock } from 'lucide-react';
import Link from 'next/link';
import { CheckoutStepper } from '@/components/billing/CheckoutStepper';
import { SubscriptionSummary } from '@/components/billing/SubscriptionSummary';
import { BillingCard } from '@/components/billing/BillingCard';
import { PLANS, BillingCycle, PlanId } from '@/components/billing/types';

const STEPS = [{ id: 1, label: 'Plan' }, { id: 2, label: 'Payment' }, { id: 3, label: 'Review' }, { id: 4, label: 'Done' }];

function CheckoutContent() {
  const params = useSearchParams();
  const planId = (params.get('plan') || 'pro') as PlanId;
  const cycle = (params.get('cycle') || 'monthly') as BillingCycle;
  const plan = PLANS.find((p) => p.id === planId) || PLANS[1];

  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'XELPAY20') {
      setApplied(coupon.toUpperCase()); setIsError(false); setCouponMsg('20% discount applied!');
    } else {
      setIsError(true); setCouponMsg('Invalid coupon code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-7">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing/plans" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft size={15} /> Back to Plans
          </Link>
          <h1 className="text-xl font-black text-white">Checkout</h1>
          <p className="text-slate-500 text-sm mt-0.5">Complete your subscription setup</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CheckoutStepper steps={STEPS} current={1} />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">

            <BillingCard delay={0.15}>
              <div className="p-5">
                <h2 className="font-black text-white text-sm mb-4">Selected Plan</h2>
                <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">{plan.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-black text-white">{plan.name} Plan</p>
                    <p className="text-xs text-slate-500">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-white">${cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</p>
                    <p className="text-xs text-slate-500">/{cycle === 'monthly' ? 'month' : 'year'}</p>
                  </div>
                </div>
                <ul className="grid grid-cols-2 gap-2 mt-4">
                  {plan.features.slice(0, 6).map((f) => (
                    <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </BillingCard>

            <BillingCard delay={0.2}>
              <div className="p-5">
                <h2 className="font-black text-white text-sm mb-4 flex items-center gap-2"><Tag size={14} /> Coupon Code</h2>
                <div className="flex gap-3">
                  <input
                    value={coupon} onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code (try XELPAY20)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                  />
                  <button onClick={applyCoupon} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors">Apply</button>
                </div>
                {couponMsg && <p className={`text-xs mt-2 font-semibold ${isError ? 'text-red-400' : 'text-emerald-400'}`}>{isError ? '' : '✓ '}{couponMsg}</p>}
              </div>
            </BillingCard>
          </div>

          <div className="lg:col-span-2">
            <BillingCard delay={0.2}>
              <div className="p-5">
                <h2 className="font-black text-white text-sm mb-4">Order Summary</h2>
                <SubscriptionSummary plan={plan} cycle={cycle} coupon={applied} />
                <div className="mt-5 space-y-3">
                  <Link href={`/dashboard/billing/payment?plan=${planId}&cycle=${cycle}&coupon=${applied}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
                    <Lock size={13} /> Continue to Payment
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                    <Shield size={11} /> Secured by 256-bit SSL encryption
                  </div>
                </div>
              </div>
            </BillingCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
