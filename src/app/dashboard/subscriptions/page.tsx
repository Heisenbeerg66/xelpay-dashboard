'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, BadgeCheck, Star, Zap, Users, Smartphone, Send,
  Check, Loader2, Clock, CalendarDays, Receipt, ShieldCheck, Crown, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const METHOD_LABELS: Record<string, string> = {
  mobile: 'Mobile Banking (bKash, Nagad, etc.)',
  bank: 'Bank Transfers',
  international: 'International (Stripe, PayPal)',
  crypto: 'Cryptocurrency (USDT)',
};

function PlanBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  const styles: Record<string, string> = {
    popular: 'bg-blue-600 text-white',
    recommended: 'bg-emerald-600 text-white',
    enterprise: 'bg-purple-600 text-white',
    starter: 'bg-slate-600 text-white',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${styles[tag?.toLowerCase()] || 'bg-slate-600 text-white'}`}>
      {tag}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return (
    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
    </span>
  );
  if (s === 'expired') return (
    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 uppercase tracking-wide">
      <Clock size={10} /> Expired
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 uppercase tracking-wide">
      <Clock size={10} /> {status || 'Unknown'}
    </span>
  );
}

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [yearlyDiscount, setYearlyDiscount] = useState(20);
  const [yearlyDiscountActive, setYearlyDiscountActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [merchantRes, plansRes, settingsRes, subRes] = await Promise.all([
          supabase.from('merchants').select('*').eq('id', user.id).single(),
          supabase.from('plans').select('*').order('serial', { ascending: true }),
          supabase.from('site_settings').select('key_name, value, is_active').eq('key_name', 'subscription_discount_yearly').maybeSingle(),
          supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);

        const merchantData = merchantRes.data;
        const plans = plansRes.data || [];

        setMerchant(merchantData);
        setAllPlans(plans);

        if (merchantData?.plan_id) {
          const plan = plans.find((p: any) => p.id === merchantData.plan_id);
          setCurrentPlan(plan || null);
        }

        if (settingsRes.data) {
          setYearlyDiscountActive(settingsRes.data.is_active !== false);
          setYearlyDiscount(parseFloat(settingsRes.data.value) || 20);
        }

        setSubscription(subRes.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getPrice = (plan: any) => {
    if (billing === 'yearly') {
      if (plan.yearly_price != null) return plan.yearly_price;
      if (yearlyDiscountActive) {
        const monthly12 = (plan.price || 0) * 12;
        return monthly12 - (monthly12 * (yearlyDiscount / 100));
      }
      return (plan.price || 0) * 12;
    }
    return plan.price || 0;
  };

  const getPlanFeatures = (plan: any): string[] => {
    const tx = (plan.transaction_limit_monthly ?? 100) === 0
      ? 'Unlimited transactions/month'
      : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions/month`;
    const base: (string | null)[] = [
      tx,
      `${plan.business_limit ?? 1} business workspace${(plan.business_limit ?? 1) > 1 ? 's' : ''}`,
      ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => METHOD_LABELS[m] ?? m),
      plan.is_team_allowed ? `Team — up to ${plan.allowed_team_members ?? 1} members` : 'Single user',
      `${plan.device_limit ?? 1} device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
      plan.allowed_telegram_group ? 'Telegram group alerts' : null,
      plan.is_custom_bot_allowed ? 'Custom Telegram bot' : null,
    ];
    const extra: string[] = Array.isArray(plan.features) ? plan.features : [];
    return [...base.filter(Boolean) as string[], ...extra];
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const getDaysRemaining = (expires: string) => {
    const diff = new Date(expires).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  const isFree = !currentPlan || (currentPlan?.price ?? 0) === 0;
  const planColor = isFree ? 'from-slate-600 to-slate-800' : 'from-blue-600 to-indigo-700';

  return (
    <div className="w-full space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CreditCard size={28} className="text-blue-600" /> Subscriptions & Plans
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your plan, billing, and payment history.</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-800/40 rounded-2xl overflow-hidden shadow-lg">
        <div className={`bg-gradient-to-br ${planColor} px-6 py-6 md:px-8 text-white`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                <BadgeCheck size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 dark:text-slate-300 mb-0.5">Current Plan</p>
                <h2 className="text-2xl font-black tracking-tight">
                  {currentPlan?.name || 'Free Plan'}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">
                {isFree ? 'Free' : `৳${(currentPlan?.price || 0).toLocaleString()}`}
              </p>
              {!isFree && <p className="text-blue-200 text-xs font-medium">/month</p>}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
            <StatusBadge status={merchant?.subscription_status} />
          </div>

          {/* Purchase Date */}
          {subscription?.started_at && (
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Purchase Date</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{formatDate(subscription.started_at)}</p>
            </div>
          )}

          {/* Expires */}
          {subscription?.expires_at && (
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expires</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{formatDate(subscription.expires_at)}</p>
              <p className="text-[10px] text-amber-500 font-bold mt-0.5">{getDaysRemaining(subscription.expires_at)} days left</p>
            </div>
          )}

          {/* Amount Paid */}
          {subscription?.amount_paid != null && (
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount Paid</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">৳{subscription.amount_paid?.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{subscription.billing_cycle || 'monthly'}</p>
            </div>
          )}
        </div>

        {/* Payment Reference */}
        {subscription?.payment_reference && (
          <div className="px-5 md:px-6 pb-5">
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Reference</p>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{subscription.payment_reference}</p>
              </div>
              {subscription.payment_method && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 capitalize">{subscription.payment_method}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isFree && !subscription && (
          <div className="px-5 md:px-6 pb-5">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">You're on the free plan. Upgrade to unlock more features.</p>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Available Plans</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Choose the right plan for your business.</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-widest transition-all ${billing === 'monthly' ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-widest transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Yearly
              {yearlyDiscountActive && (
                <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black">-{yearlyDiscount}%</span>
              )}
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allPlans.map((plan) => {
            const isCurrentPlan = plan.id === merchant?.plan_id;
            const price = getPrice(plan);
            const features = getPlanFeatures(plan);
            const isFeatured = plan.tag?.toLowerCase() === 'popular' || plan.tag?.toLowerCase() === 'recommended';

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-[#111827] rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isCurrentPlan
                    ? 'border-blue-500 shadow-xl shadow-blue-500/10'
                    : isFeatured
                      ? 'border-slate-200 dark:border-slate-700 shadow-lg hover:border-blue-400 hover:shadow-xl'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {isCurrentPlan && (
                  <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5">
                    ✓ Your Current Plan
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                        <PlanBadge tag={plan.tag} />
                      </div>
                    </div>
                    {isFeatured && <Crown size={18} className="text-amber-500 shrink-0" />}
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {price === 0 ? (
                      <div>
                        <span className="text-4xl font-black text-slate-900 dark:text-white">Free</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">৳{price.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm font-medium mb-1">
                            /{billing === 'yearly' ? 'yr' : 'mo'}
                          </span>
                        </div>
                        {billing === 'yearly' && yearlyDiscountActive && plan.price > 0 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            Save ৳{((plan.price * 12) - price).toFixed(0)} vs monthly
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 mb-6">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} className="text-blue-600 dark:text-blue-400" strokeWidth={3} />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <div className="w-full py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800/40 text-center text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      Current Plan
                    </div>
                  ) : (
                    <button className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isFeatured ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {price === 0 ? 'Get Started Free' : 'Upgrade Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allPlans.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CreditCard size={32} className="mx-auto mb-3" />
            <p className="font-medium">No plans available.</p>
          </div>
        )}
      </div>

      {/* Contact Note */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl px-5 py-4">
        <ShieldCheck size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-0.5">Need a Custom Plan?</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Contact our support team for enterprise pricing, custom limits, or white-label solutions.</p>
        </div>
      </div>
    </div>
  );
}