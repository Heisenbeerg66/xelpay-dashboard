'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, ArrowUp, ArrowDown,
  Loader2, X, ChevronRight, Shield, Zap, Star, Crown, RefreshCw,
  Calendar, TrendingUp, Package, History, Sparkles, BadgeCheck,
  ChevronLeft, Copy, ExternalLink, Info, Building2, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// ── Types ─────────────────────────────────────────────────────
type Plan = {
  id: string; name: string; price: number; yearly_price: number | null;
  serial: number; tag: string | null; features: any; transaction_limit_monthly: number;
  business_limit: number; allowed_method: any; is_team_allowed: boolean;
  allowed_team_members: number; device_limit: number; allowed_telegram_group: boolean;
  is_custom_bot_allowed: boolean;
};
type Subscription = {
  id: string; plan_id: string; billing_cycle: string; amount_paid: number;
  status: string; started_at: string; expires_at: string | null;
  payment_method: string | null; payment_reference: string | null;
};
type AdminGateway = {
  id: string; provider: string; provider_name: string; account_number: string;
  account_type: string; branch_name: string | null;
};
type PaymentLogo = { method_name: string; logo_url: string; method_color: string | null };
type AdminOrder = {
  id: string; order_no: string; amount: number; billing_cycle: string;
  payment_method: string; payment_reference: string; status: string;
  created_at: string; plan_id: string; sender_number: string | null;
};

// ── Helpers ───────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const daysLeft = (exp: string | null) => {
  if (!exp) return null;
  const diff = new Date(exp).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  expired: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const METHOD_ICONS: Record<string, string> = {
  bkash: '💜', nagad: '🟠', rocket: '🟣', upay: '🟡', bank: '🏦',
};

// ── Plan Feature Row ──────────────────────────────────────────
function FeatureRow({ label, value }: { label: string; value: string | boolean | null }) {
  if (value === false || value === null) return null;
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
        {value === true ? label : `${label}: ${value}`}
      </span>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue' }: any) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
  };
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────
function CheckoutModal({
  plan, billing, price, adminGateways, paymentLogos, merchant, onClose, onSuccess
}: {
  plan: Plan; billing: 'monthly' | 'yearly'; price: number;
  adminGateways: AdminGateway[]; paymentLogos: PaymentLogo[];
  merchant: any; onClose: () => void; onSuccess: (sub: any, plan: Plan) => void;
}) {
  const [step, setStep] = useState<'methods' | 'checkout' | 'pending'>('methods');
  const [selectedGateway, setSelectedGateway] = useState<AdminGateway | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getLogoUrl = (provider: string) => {
    const found = paymentLogos.find(l =>
      l.method_name.toLowerCase() === provider.toLowerCase() ||
      l.method_name.toLowerCase() === provider.toLowerCase().replace(/\s/g, '')
    );
    return found?.logo_url || null;
  };
  const getLogoColor = (provider: string) => {
    const found = paymentLogos.find(l => l.method_name.toLowerCase() === provider.toLowerCase());
    return found?.method_color || '#6366f1';
  };

  const handleSubmit = async () => {
    if (!selectedGateway) return;
    if (!trxId.trim()) { toast.error('Transaction ID is required.'); return; }
    if (selectedGateway.account_type !== 'corporate' && !senderNumber.trim()) {
      toast.error('Sender number is required.'); return;
    }
    setSubmitting(true);
    try {
      const now = new Date();
      const expiresAt = billing === 'yearly'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
        merchant_id: merchant.id,
        plan_id: plan.id,
        billing_cycle: billing,
        amount_paid: price,
        currency: 'BDT',
        status: 'pending',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        next_billing_at: expiresAt.toISOString(),
        payment_method: selectedGateway.provider,
        payment_reference: trxId.trim(),
      }).select('*').single();

      if (subError) throw subError;

      await supabase.from('admin_orders').insert({
        merchant_id: merchant.id,
        plan_id: plan.id,
        subscription_id: newSub?.id,
        order_no: orderNo,
        amount: price,
        currency: 'BDT',
        billing_cycle: billing,
        payment_method: selectedGateway.provider,
        payment_reference: trxId.trim(),
        gateway_used: selectedGateway.provider,
        status: 'pending',
        sender_number: senderNumber.trim() || null,
        notes: `Gateway: ${selectedGateway.provider_name} | Account: ${selectedGateway.account_number}`,
      });

      setStep('pending');
      if (newSub) onSuccess(newSub, plan);
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button onClick={() => setStep('methods')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {step === 'methods' ? 'Choose Payment Method' : step === 'checkout' ? 'Complete Payment' : 'Payment Submitted'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{plan.name} — {fmtBDT(price)} / {billing === 'yearly' ? 'year' : 'month'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Payment Methods */}
          {step === 'methods' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-4">Select how you want to pay. All payments are manually verified by our team within 24 hours.</p>
              {adminGateways.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CreditCard size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No payment methods available</p>
                </div>
              ) : adminGateways.map(gw => {
                const logoUrl = getLogoUrl(gw.provider);
                const color = getLogoColor(gw.provider);
                return (
                  <button key={gw.id} onClick={() => { setSelectedGateway(gw); setStep('checkout'); }}
                    className="w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                      {logoUrl ? (
                        <img src={logoUrl} alt={gw.provider_name} className="w-10 h-10 object-contain" onError={e => { (e.target as any).style.display = 'none'; }} />
                      ) : (
                        <span className="text-2xl">{METHOD_ICONS[gw.provider] || '💳'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{gw.provider_name}</p>
                      <p className="text-xs text-slate-500 truncate">{gw.account_number}{gw.branch_name ? ` · ${gw.branch_name}` : ''}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Checkout Details */}
          {step === 'checkout' && selectedGateway && (
            <div className="space-y-5">
              {/* Amount Box */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-center">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Amount to Pay</p>
                <p className="text-4xl font-black">{fmtBDT(price)}</p>
                <p className="text-xs opacity-70 mt-1">{plan.name} · {billing === 'yearly' ? '1 Year' : '1 Month'}</p>
              </div>

              {/* Gateway Details */}
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Payment To</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {(() => {
                      const logoUrl = getLogoUrl(selectedGateway.provider);
                      return logoUrl ? (
                        <img src={logoUrl} alt={selectedGateway.provider_name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{METHOD_ICONS[selectedGateway.provider] || '💳'}</span>
                      );
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedGateway.provider_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{selectedGateway.account_number}</p>
                      <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Copied!'); }}
                        className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Copy size={13} />
                      </button>
                    </div>
                    {selectedGateway.account_type && (
                      <p className="text-[10px] text-slate-400 capitalize">{selectedGateway.account_type} account{selectedGateway.branch_name ? ` · ${selectedGateway.branch_name}` : ''}</p>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Send exactly <span className="font-black text-slate-900 dark:text-white">{fmtBDT(price)}</span> to the number above, then enter the Transaction ID below.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {selectedGateway.account_type !== 'corporate' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Your Sender Number *</label>
                    <input
                      type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Transaction ID *</label>
                  <input
                    type="text" value={trxId} onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. 8N7AB23KC1"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">Enter the TrxID / Reference from your payment app.</p>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={submitting || !trxId.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Shield size={16} /> Submit Payment</>}
              </button>

              <div className="flex items-center gap-2 justify-center">
                <Shield size={12} className="text-slate-400" />
                <p className="text-[10px] text-slate-400">Payments verified manually within 24 hours</p>
              </div>
            </div>
          )}

          {/* Step 3: Pending */}
          {step === 'pending' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Submitted!</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Your payment is under review. Your plan will be activated within 24 hours after verification.</p>
              <div className="mt-5 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-left">
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-bold">Transaction Ref</p>
                <p className="text-sm font-mono font-black text-slate-900 dark:text-white">{trxId}</p>
              </div>
              <button onClick={onClose} className="mt-5 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all">
                Back to Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────
function PlanCard({ plan, billing, yearlyDiscount, isCurrentPlan, canDowngrade, onSelect, isFreePlan }: {
  plan: Plan; billing: 'monthly' | 'yearly'; yearlyDiscount: number;
  isCurrentPlan: boolean; canDowngrade: boolean; onSelect: () => void; isFreePlan: boolean;
}) {
  const monthlyPrice = plan.price ?? 0;
  const yearlyPrice = plan.yearly_price ?? Math.round(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
  const price = billing === 'yearly' ? yearlyPrice : monthlyPrice;
  const isFree = price === 0;

  const tagColors: Record<string, string> = {
    popular: 'bg-blue-600 text-white',
    recommended: 'bg-emerald-600 text-white',
    enterprise: 'bg-purple-600 text-white',
    starter: 'bg-slate-600 text-white',
  };

  const methods = Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile'];
  const methodLabels: Record<string, string> = {
    mobile: 'Mobile Banking (bKash, Nagad, Rocket)',
    bank: 'Bank Transfer',
    crypto: 'Cryptocurrency',
    international: 'International (Stripe, PayPal)',
  };

  return (
    <div className={`relative bg-white dark:bg-[#111827] border rounded-3xl p-6 flex flex-col transition-all duration-200
      ${isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}`}>

      {plan.tag && (
        <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tagColors[plan.tag.toLowerCase()] || 'bg-slate-600 text-white'}`}>
          {plan.tag}
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white flex items-center gap-1">
          <BadgeCheck size={10} /> Current Plan
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">{fmtBDT(price)}</span>
          <span className="text-sm text-slate-500">/ {billing === 'yearly' ? 'year' : 'month'}</span>
        </div>
        {billing === 'yearly' && !isFree && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Save {yearlyDiscount}% vs monthly
          </p>
        )}
      </div>

      <div className="flex-1 space-y-2.5 mb-6">
        <FeatureRow label={plan.transaction_limit_monthly === 0 ? 'Unlimited transactions / mo' : `${plan.transaction_limit_monthly.toLocaleString()} transactions / mo`} value={true} />
        <FeatureRow label={`${plan.business_limit} business${plan.business_limit > 1 ? 'es' : ''}`} value={true} />
        {methods.map((m: string) => <FeatureRow key={m} label={methodLabels[m] || m} value={true} />)}
        {plan.is_team_allowed && <FeatureRow label={`Team — up to ${plan.allowed_team_members} members`} value={true} />}
        <FeatureRow label={`${plan.device_limit} device${plan.device_limit > 1 ? 's' : ''}`} value={true} />
        {plan.allowed_telegram_group && <FeatureRow label="Telegram group alerts" value={true} />}
        {plan.is_custom_bot_allowed && <FeatureRow label="Custom Telegram bot" value={true} />}
        {Array.isArray(plan.features) && plan.features.map((f: string, i: number) => <FeatureRow key={i} label={f} value={true} />)}
      </div>

      {isCurrentPlan ? (
        <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-black text-center uppercase tracking-widest flex items-center justify-center gap-2">
          <BadgeCheck size={14} /> Active Plan
        </div>
      ) : isFree ? (
        <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-black text-center uppercase tracking-widest">
          Free Forever
        </div>
      ) : canDowngrade ? (
        <button onClick={onSelect}
          className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all uppercase tracking-widest">
          Downgrade
        </button>
      ) : (
        <button onClick={onSelect}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
          <Zap size={15} /> Upgrade Now
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderHistory, setOrderHistory] = useState<AdminOrder[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [yearlyDiscount, setYearlyDiscount] = useState(20);
  const [adminGateways, setAdminGateways] = useState<AdminGateway[]>([]);
  const [paymentLogos, setPaymentLogos] = useState<PaymentLogo[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansRes, merchantRes, subRes, settingsRes, gatewaysRes, ordersRes, logosRes] = await Promise.all([
        supabase.from('plans').select('*').order('serial', { ascending: true }),
        supabase.from('merchants').select('*').eq('id', user.id).single(),
        supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('site_settings').select('key_name, value').eq('key_name', 'subscription_discount_yearly').maybeSingle(),
        supabase.from('admin_gateways').select('*').eq('status', 'active'),
        supabase.from('admin_orders').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('payment_logos').select('*'),
      ]);

      const plans: Plan[] = plansRes.data || [];
      const m = merchantRes.data;
      const sub: Subscription | null = subRes.data || null;

      setMerchant(m);
      setAllPlans(plans);
      setSubscription(sub);
      setAdminGateways(gatewaysRes.data || []);
      setOrderHistory(ordersRes.data || []);
      setPaymentLogos(logosRes.data || []);

      if (settingsRes.data?.value) {
        const disc = parseInt(settingsRes.data.value);
        if (!isNaN(disc)) setYearlyDiscount(disc);
      }

      if (sub?.plan_id && plans.length > 0) {
        const found = plans.find(p => p.id === sub.plan_id);
        if (found) setCurrentPlan(found);
      } else if (m?.plan_id && plans.length > 0) {
        const found = plans.find(p => p.id === m.plan_id);
        if (found) setCurrentPlan(found);
      }
    } catch (e: any) {
      toast.error('Failed to load: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSuccess = async (newSub: any, plan: Plan) => {
    setSubscription(newSub);
    setCurrentPlan(plan);
    await load();
  };

  const days = daysLeft(subscription?.expires_at || null);
  const isExpired = subscription?.status === 'expired' || (days !== null && days === 0);
  const isActive = subscription?.status === 'active';
  const canDowngradeDays = days !== null && days <= 3;

  const getPlanPrice = (plan: Plan) => {
    const monthlyPrice = plan.price ?? 0;
    if (billing === 'yearly') {
      return plan.yearly_price ?? Math.round(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
    }
    return monthlyPrice;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={36} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Plans</p>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      {checkoutPlan && merchant && (
        <CheckoutModal
          plan={checkoutPlan}
          billing={billing}
          price={getPlanPrice(checkoutPlan)}
          adminGateways={adminGateways}
          paymentLogos={paymentLogos}
          merchant={merchant}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              Subscriptions & Billing
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your plan, billing, and payment history.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Current Subscription Banner */}
        {subscription && (
          <div className={`rounded-3xl p-6 border ${
            isActive && !isExpired
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-500'
              : isExpired
              ? 'bg-gradient-to-r from-red-600 to-rose-700 border-red-500'
              : subscription.status === 'pending'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400'
              : 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  {isActive ? <Crown size={26} className="text-white" /> : isExpired ? <AlertTriangle size={26} className="text-white" /> : <Clock size={26} className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-white">{currentPlan?.name || 'Subscription'}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[subscription.status] || ''}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mt-1">
                    {subscription.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'} · {fmtBDT(subscription.amount_paid)} paid
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Started</p>
                  <p className="text-sm font-black text-white mt-0.5">{fmtDate(subscription.started_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Expires</p>
                  <p className="text-sm font-black text-white mt-0.5">{fmtDate(subscription.expires_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Days Left</p>
                  <p className="text-sm font-black text-white mt-0.5">{days !== null ? `${days}d` : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {currentPlan && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp} label="Monthly Transactions" value={currentPlan.transaction_limit_monthly === 0 ? 'Unlimited' : currentPlan.transaction_limit_monthly.toLocaleString()} color="blue" />
            <StatCard icon={Building2} label="Businesses" value={String(currentPlan.business_limit)} color="purple" />
            <StatCard icon={Smartphone} label="Devices" value={String(currentPlan.device_limit)} color="emerald" />
            <StatCard icon={Calendar} label="Renewal In" value={days !== null ? `${days} days` : '—'} sub={subscription?.expires_at ? fmtDate(subscription.expires_at) : undefined} color="amber" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
          {[{ id: 'plans', label: 'Plans & Upgrade' }, { id: 'history', label: 'Payment History' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <>
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setBilling('monthly')}
                className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${billing === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Monthly
              </button>
              <button onClick={() => setBilling('yearly')}
                className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Yearly <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${billing === 'yearly' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>Save {yearlyDiscount}%</span>
              </button>
            </div>

            {/* Downgrade Notice */}
            {isActive && !canDowngradeDays && subscription && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="font-black">Downgrade restriction:</span> Downgrading is only available within the last 3 days of your billing cycle. Your subscription expires on {fmtDate(subscription.expires_at)}.
                </p>
              </div>
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {allPlans.map(plan => {
                const isCurrent = currentPlan?.id === plan.id && isActive;
                const currentSerial = currentPlan?.serial ?? 0;
                const isDowngrade = plan.serial < currentSerial;
                const isFree = (plan.price ?? 0) === 0;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billing={billing}
                    yearlyDiscount={yearlyDiscount}
                    isCurrentPlan={isCurrent}
                    canDowngrade={isDowngrade && canDowngradeDays}
                    isFreePlan={isFree}
                    onSelect={() => {
                      if (isFree) return;
                      setCheckoutPlan(plan);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <History size={16} className="text-slate-600 dark:text-slate-400" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Payment History</h2>
            </div>
            {orderHistory.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-500">No payment history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderHistory.map(order => {
                  const plan = allPlans.find(p => p.id === order.plan_id);
                  return (
                    <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <span className="text-lg">{METHOD_ICONS[order.payment_method] || '💳'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{order.order_no}</p>
                          <p className="text-xs text-slate-500">{plan?.name || 'Plan'} · {order.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{fmtBDT(order.amount)}</p>
                          <p className="text-[10px] text-slate-400">{fmtDate(order.created_at)}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}