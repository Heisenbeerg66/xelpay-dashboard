'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Loader2, CreditCard, Calendar, Clock, Zap, ChevronRight, BadgeCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function countdown(iso: string | null): string {
  if (!iso) return 'N/A';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
  const hrs = Math.floor(diff / 3600000);
  return `${hrs} hour${hrs !== 1 ? 's' : ''} remaining`;
}

const METHOD_LABELS: Record<string, string> = {
  mobile: 'Mobile Banking (bKash, Nagad, Rocket)',
  bank: 'Bank Transfer',
  international: 'International Gateways',
  crypto: 'Cryptocurrency',
};

function getPlanStyle(tag: string | null) {
  switch (tag) {
    case 'popular': return { border: 'border-blue-500', badge: 'bg-blue-600 text-white', check: 'text-blue-600', price: 'text-blue-600' };
    case 'premium': return { border: 'border-purple-500', badge: 'bg-purple-600 text-white', check: 'text-purple-600', price: 'text-purple-600' };
    case 'enterprise': return { border: 'border-amber-500', badge: 'bg-amber-500 text-white', check: 'text-amber-600', price: 'text-amber-600' };
    default: return { border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', check: 'text-slate-500', price: 'text-slate-800 dark:text-white' };
  }
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownBadge({ expiresAt }: { expiresAt: string | null }) {
  const [label, setLabel] = useState(countdown(expiresAt));
  useEffect(() => {
    const t = setInterval(() => setLabel(countdown(expiresAt)), 60000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const isExpired = label === 'Expired';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'}`}>
      <Clock size={11} /> {label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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

        // Load merchant + plan info
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

  const getYearlyPrice = (monthlyPrice: number) => {
    if (!yearlyDiscountActive) return monthlyPrice * 12;
    const discount = monthlyPrice * 12 * (yearlyDiscount / 100);
    return monthlyPrice * 12 - discount;
  };

  const getPlanFeatures = (plan: any): string[] => {
    const tx = (plan.transaction_limit_monthly ?? 100) === 0 ? 'Unlimited transactions/month' : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions/month`;
    const base: (string | null)[] = [
      tx,
      `${plan.business_limit ?? 1} business workspace${(plan.business_limit ?? 1) > 1 ? 's' : ''}`,
      ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => METHOD_LABELS[m] ?? m),
      plan.is_team_allowed ? `Team access — up to ${plan.allowed_team_members ?? 1} members` : 'Single user only',
      `${plan.device_limit ?? 1} device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
      plan.allowed_telegram_group ? 'Telegram group alerts' : null,
      plan.is_custom_bot_allowed ? 'Custom Telegram bot' : null,
    ];
    const extra: string[] = Array.isArray(plan.features) ? plan.features : [];
    return [...base.filter(Boolean) as string[], ...extra];
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CreditCard size={28} className="text-blue-600" /> Subscriptions & Plans
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your plan, billing, and payment history.</p>
      </div>

      {/* ── Current Plan Card ── */}
      {currentPlan && (
        <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-800/40 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                  <BadgeCheck size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Current Plan</p>
                  <h2 className="text-2xl font-black tracking-tight">{currentPlan.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">
                  {currentPlan.price === 0 ? 'Free' : `৳${currentPlan.price.toLocaleString()}`}
                </p>
                {currentPlan.price > 0 && <p className="text-blue-200 text-xs font-medium">/month</p>}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {subscription ? (
              <>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Purchase Date</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-600" /> {fmtDate(subscription.started_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing Cycle</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{subscription.billing_cycle || 'Monthly'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires / Next Billing</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtDate(subscription.expires_at)}</p>
                    <CountdownBadge expiresAt={subscription.expires_at} />
                  </div>
                </div>
              </>
            ) : (
              <div className="sm:col-span-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <Zap size={15} className="text-amber-500" />
                <span>No active subscription record found. You may be on the free plan or a legacy account.</span>
              </div>
            )}
          </div>

          {subscription?.payment_reference && (
            <div className="px-6 pb-5">
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Reference</p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">{subscription.payment_reference}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">৳{subscription.amount_paid?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Available Plans ── */}
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
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-black">
                  -{yearlyDiscount}%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allPlans.map((plan: any) => {
            const style = getPlanStyle(plan.tag);
            const features = getPlanFeatures(plan);
            const isCurrent = currentPlan?.id === plan.id;
            const monthlyPrice = plan.price || 0;
            const yearlyTotal = getYearlyPrice(monthlyPrice);
            const displayPrice = billing === 'yearly' ? yearlyTotal / 12 : monthlyPrice;
            const savings = billing === 'yearly' && yearlyDiscountActive ? monthlyPrice * 12 - yearlyTotal : 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-[#111827] border-2 ${isCurrent ? 'border-blue-500' : style.border} rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 ${isCurrent ? 'ring-2 ring-blue-500/20' : ''}`}
              >
                {/* Badge */}
                {isCurrent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <BadgeCheck size={11} /> Current Plan
                    </span>
                  </div>
                ) : plan.tag && plan.tag !== 'none' ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1 ${style.badge}`}>
                      <Star size={10} /> {plan.tag}
                    </span>
                  </div>
                ) : null}

                <div className="mt-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">{plan.name}</h3>

                  <div className="mb-1">
                    <span className={`text-3xl font-black ${style.price}`}>
                      {monthlyPrice === 0 ? 'Free' : `৳${displayPrice.toFixed(0)}`}
                    </span>
                    {monthlyPrice > 0 && <span className="text-slate-400 text-sm font-medium">/mo</span>}
                  </div>

                  {billing === 'yearly' && monthlyPrice > 0 && (
                    <div className="mb-4 space-y-0.5">
                      <p className="text-[11px] text-slate-400 font-medium">Billed ৳{yearlyTotal.toFixed(0)}/year</p>
                      {savings > 0 && (
                        <p className="text-[11px] text-emerald-600 font-black flex items-center gap-1">
                          <Sparkles size={10} /> Save ৳{savings.toFixed(0)} per year
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6 mt-4">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check size={14} className={`shrink-0 mt-0.5 ${style.check}`} /> {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : monthlyPrice === 0
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-md'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:-translate-y-0.5'
                  }`}
                >
                  {isCurrent ? (
                    <><BadgeCheck size={14} /> Current Plan</>
                  ) : (
                    <><ChevronRight size={14} /> {monthlyPrice === 0 ? 'Get Started' : `Upgrade — ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}