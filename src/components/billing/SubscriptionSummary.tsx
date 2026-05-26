'use client';

import { Plan, BillingCycle } from './types';

export function SubscriptionSummary({ plan, cycle, coupon }: { plan: Plan; cycle: BillingCycle; coupon?: string }) {
  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const discount = coupon === 'XELPAY20' ? price * 0.2 : 0;
  const total = price - discount;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{plan.name} Plan ({cycle})</span>
        <span className="font-semibold text-white">${price}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-emerald-400">Coupon: {coupon}</span>
          <span className="font-semibold text-emerald-400">-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="h-px bg-slate-800" />
      <div className="flex justify-between">
        <span className="font-bold text-white">Total</span>
        <span className="font-black text-xl text-white">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
