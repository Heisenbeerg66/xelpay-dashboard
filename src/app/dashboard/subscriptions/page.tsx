'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreditCard, BadgeCheck, Loader2, Check, X, Zap, Star,
  Calendar, RefreshCw, AlertCircle, ArrowRight, Sparkles,
  Clock, CheckCircle2, XCircle, ChevronDown, Copy, ExternalLink,
  Shield, Lock, DollarSign, Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Method labels ─────────────────────────────────────────────────────────────
const METHOD_LABELS: Record<string, string> = {
  mobile: 'Mobile Banking (bKash, Nagad, Rocket)',
  bank: 'Bank Transfer',
  international: 'International (Stripe, PayPal)',
  crypto: 'Cryptocurrency',
  card: 'Credit/Debit Cards',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400', label: 'Active' },
    pending:   { cls: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400', label: 'Pending' },
    expired:   { cls: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400', label: 'Expired' },
    cancelled: { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400', label: 'Cancelled' },
  };
  const s = map[status] ?? map.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.cls}`}>
      <Clock size={9} /> {s.label}
    </span>
  );
}

function getPlanFeatures(plan: any): string[] {
  const tx = (plan.transaction_limit_monthly ?? 100) === 0
    ? 'Unlimited transactions/month'
    : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions/month`;
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
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({
  plan,
  billing,
  price,
  merchant,
  onClose,
  onSuccess,
}: {
  plan: any;
  billing: 'monthly' | 'yearly';
  price: number;
  merchant: any;
  onClose: () => void;
  onSuccess: (newSub: any, newPlan: any) => void;
}) {
  const [step, setStep] = useState<'form' | 'pending' | 'done'>('form');
  const [method, setMethod] = useState('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [adminGateway, setAdminGateway] = useState<any>(null);

  useEffect(() => {
    // Load a merchant gateway as payment destination (simulated admin gateway)
    const loadGateway = async () => {
      const { data } = await supabase
        .from('payment_gateways')
        .select('*')
        .limit(1)
        .maybeSingle();
      setAdminGateway(data);
    };
    loadGateway();
  }, []);

  const PAYMENT_METHODS = [
    { id: 'bkash', label: 'bKash', number: adminGateway?.account_number || '01700000000' },
    { id: 'nagad', label: 'Nagad', number: adminGateway?.account_number || '01700000000' },
    { id: 'rocket', label: 'Rocket', number: adminGateway?.account_number || '01700000000' },
    { id: 'bank', label: 'Bank Transfer', number: 'Contact support' },
  ];

  const selected = PAYMENT_METHODS.find(m => m.id === method) ?? PAYMENT_METHODS[0];

  const handleSubmit = async () => {
    if (!trxId.trim()) { toast.error('Transaction ID is required.'); return; }
    if (!senderNumber.trim()) { toast.error('Sender number is required.'); return; }
    setSubmitting(true);

    try {
      const now = new Date();
      const expiresAt = billing === 'yearly'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      // Insert admin order
      await supabase.from('admin_orders').insert({
        merchant_id: merchant.id,
        plan_id: plan.id,
        order_no: orderNo,
        amount: price,
        currency: 'BDT',
        billing_cycle: billing,
        payment_method: method,
        payment_reference: trxId.trim(),
        gateway_used: method,
        status: 'pending',
        notes: `Sender: ${senderNumber.trim()}`,
      });

      // Insert subscription record (pending verification)
      const { data: newSub } = await supabase
        .from('merchant_subscriptions')
        .insert({
          merchant_id: merchant.id,
          plan_id: plan.id,
          billing_cycle: billing,
          amount_paid: price,
          currency: 'BDT',
          status: 'pending',
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          next_billing_at: expiresAt.toISOString(),
          payment_method: method,
          payment_reference: trxId.trim(),
        })
        .select()
        .single();

      setStep('pending');

      toast.success('Payment submitted! Awaiting verification.');

      if (newSub) {
        onSuccess(newSub, plan);
      }
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Upgrade Plan</p>
              <h3 className="text-lg font-black">{plan.name}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-black">৳{price.toLocaleString()}</span>
            <span className="text-blue-200 text-sm font-medium">/ {billing === 'yearly' ? 'year' : 'month'}</span>
          </div>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-5">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
              <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">Payment Instructions</p>
              <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li>1. Select your preferred payment method below</li>
                <li>2. Send <span className="font-black text-slate-800 dark:text-white">৳{price.toLocaleString()}</span> to the number shown</li>
                <li>3. Enter the Transaction ID and your number</li>
                <li>4. Submit — our team will verify within 24 hours</li>
              </ol>
            </div>

            {/* Method Selection */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-black transition-all text-left ${method === m.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Send To */}
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Send {billing === 'yearly' ? '৳' + price.toLocaleString() : '৳' + price.toLocaleString()} to</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono">{selected.number}</p>
                <button onClick={() => { navigator.clipboard.writeText(selected.number); toast.success('Copied!'); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Copy size={13} className="text-slate-400" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">{selected.label} • {billing === 'monthly' ? 'Monthly' : 'Yearly'} Plan</p>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Transaction ID (TrxID)</label>
              <input
                type="text"
                value={trxId}
                onChange={e => setTrxId(e.target.value)}
                placeholder="e.g. ABC123XYZ456"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Your Mobile Number (Sender)</label>
              <input
                type="text"
                value={senderNumber}
                onChange={e => setSenderNumber(e.target.value)}
                placeholder="e.g. 01700000000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                : <><Lock size={15} /> Submit Payment</>}
            </button>

            <p className="text-center text-[10px] text-slate-400 font-medium">
              <Shield size={10} className="inline mr-1" />
              Your subscription activates after payment verification (within 24 hours)
            </p>
          </div>
        )}

        {step === 'pending' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-amber-500" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Payment Submitted!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Your payment is under review. We'll activate your <span className="font-black text-slate-700 dark:text-slate-300">{plan.name}</span> plan within 24 hours.
            </p>
            <div className="mt-5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
              <p className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5">{trxId}</p>
            </div>
            <button onClick={onClose} className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-sm transition-all">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
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
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);

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

  useEffect(() => { load(); }, []);

  const getYearlyPrice = (monthlyPrice: number) => {
    if (!yearlyDiscountActive) return monthlyPrice * 12;
    const discount = monthlyPrice * 12 * (yearlyDiscount / 100);
    return monthlyPrice * 12 - discount;
  };

  const getDisplayPrice = (plan: any) =>
    billing === 'monthly' ? plan.price : getYearlyPrice(plan.price);

  const isCurrentPlan = (plan: any) => currentPlan?.id === plan.id;

  const handleCheckoutSuccess = (newSub: any, newPlan: any) => {
    setSubscription(newSub);
    setCheckoutPlan(null);
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard size={28} className="text-blue-600" /> Subscriptions & Plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your plan, billing, and upgrade options.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all self-start">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Current Plan Card ── */}
      {currentPlan ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Top gradient bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 w-full" />

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

              {/* Plan info */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/40 shrink-0">
                  <BadgeCheck size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</p>
                    {subscription && <StatusBadge status={subscription.status} />}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{currentPlan.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {currentPlan.price === 0
                      ? 'Free plan — no billing required'
                      : `৳${currentPlan.price.toLocaleString()} / month`
                    }
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  {currentPlan.price === 0 ? 'Free' : `৳${currentPlan.price.toLocaleString()}`}
                </p>
                {currentPlan.price > 0 && <p className="text-sm text-slate-400 font-medium">per month</p>}
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {getPlanFeatures(currentPlan).map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            {/* Subscription Details */}
            {subscription && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing Cycle</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 capitalize">{subscription.billing_cycle}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Started</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(subscription.started_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {subscription.expires_at ? formatDate(subscription.expires_at) : 'Never'}
                  </p>
                </div>
                {subscription.payment_reference && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Payment</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 truncate">{subscription.payment_reference}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-amber-700 dark:text-amber-400">No Active Plan</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-0.5">You don't have an active subscription. Choose a plan below to get started.</p>
          </div>
        </div>
      )}

      {/* ── Plans Section ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Available Plans</h2>
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
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md">
                  -{yearlyDiscount}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((plan, idx) => {
            const isPopular = idx === 1;
            const isCurrent = isCurrentPlan(plan);
            const displayPrice = getDisplayPrice(plan);
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 ${
                  isPopular
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]'
                    : isCurrent
                    ? 'border-emerald-400 dark:border-emerald-600'
                    : 'border-slate-200 dark:border-slate-800'
                } bg-white dark:bg-[#111827]`}
              >
                {/* Popular / Current badge */}
                {isPopular && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-b-xl">
                      Most Popular
                    </div>
                  </div>
                )}
                {isCurrent && !isPopular && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-b-xl">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className={`p-6 ${(isPopular || isCurrent) ? 'pt-8' : ''}`}>
                  {/* Plan name */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    {isPopular && <Star size={14} className="text-blue-500 fill-blue-500" />}
                  </div>

                  {/* Price */}
                  <div className="mt-3 mb-5">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-4xl font-black text-slate-900 dark:text-white">Free</span>
                        <p className="text-xs text-slate-400 font-medium mt-1">No credit card required</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-slate-900 dark:text-white">৳{displayPrice.toLocaleString()}</span>
                          <span className="text-sm text-slate-400 font-medium">/ {billing === 'yearly' ? 'yr' : 'mo'}</span>
                        </div>
                        {billing === 'yearly' && yearlyDiscountActive && (
                          <p className="text-xs text-emerald-500 font-bold mt-1">
                            Save ৳{(plan.price * 12 - displayPrice).toFixed(0)} per year
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-5" />

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <Check size={14} className={`shrink-0 mt-0.5 ${isPopular ? 'text-blue-500' : 'text-emerald-500'}`} />
                        <span className="text-slate-600 dark:text-slate-400 font-medium leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-5 pt-0">
                  {isCurrent ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      <BadgeCheck size={14} /> Current Plan
                    </div>
                  ) : plan.price === 0 ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Free Tier
                    </div>
                  ) : (
                    <button
                      onClick={() => setCheckoutPlan(plan)}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                      }`}
                    >
                      <Zap size={13} /> Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      {checkoutPlan && merchant && (
        <CheckoutModal
          plan={checkoutPlan}
          billing={billing}
          price={getDisplayPrice(checkoutPlan)}
          merchant={merchant}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}