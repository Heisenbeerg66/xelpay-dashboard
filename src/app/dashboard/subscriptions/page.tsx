'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, Loader2, X, ChevronRight, 
  Shield, Zap, RefreshCw, History, Package, BadgeCheck, ChevronLeft, Copy, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';

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

type Merchant = {
  id: string;
  plan_id: string;
  business_count: number;
  transaction_count: number;
  team_member_count: number;
  device_count: number;
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

// Theme Generator for Tags (e.g. Free:blue)
const getColorTheme = (colorName: string) => {
  const themes: Record<string, any> = {
    blue: { border: 'border-blue-500', bg: 'bg-blue-600', text: 'text-blue-600', hover: 'hover:bg-blue-700', lightBg: 'bg-blue-50' },
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', lightBg: 'bg-emerald-50' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-700', lightBg: 'bg-purple-50' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-600', hover: 'hover:bg-amber-600', lightBg: 'bg-amber-50' },
    slate: { border: 'border-slate-500', bg: 'bg-slate-800', text: 'text-slate-700', hover: 'hover:bg-slate-900', lightBg: 'bg-slate-100' }
  };
  return themes[colorName?.toLowerCase()] || themes.blue;
};

// ── Progress Bar Component ────────────────────────────────────
function UsageBar({ label, used = 0, limit = 0 }: { label: string, used: number, limit: number }) {
  const isUnlimited = limit === 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const displayLimit = isUnlimited ? 'Unlimited' : limit.toLocaleString();
  const displayUsed = used.toLocaleString();

  // Color logic based on usage
  let barColor = 'bg-blue-600';
  if (percentage >= 90) barColor = 'bg-red-500';
  else if (percentage >= 75) barColor = 'bg-amber-500';

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs font-medium text-slate-500">
          {displayUsed} / {displayLimit} {!isUnlimited && `(${Math.round(percentage)}%)`}
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {!isUnlimited ? (
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percentage}%` }} />
        ) : (
          <div className="h-full rounded-full bg-emerald-500 w-full opacity-30" />
        )}
      </div>
    </div>
  );
}

// ── Checkout Modal (Kept Unchanged Functionally) ──────────────
function CheckoutModal({
  plan, billing, price, adminGateways, paymentLogos, merchant, onClose, onSuccess
}: any) {
  const [step, setStep] = useState<'methods' | 'checkout' | 'pending'>('methods');
  const [selectedGateway, setSelectedGateway] = useState<AdminGateway | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getLogoUrl = (provider: string) => {
    const found = paymentLogos.find((l: any) => l.method_name.toLowerCase() === provider.toLowerCase() || l.method_name.toLowerCase() === provider.toLowerCase().replace(/\s/g, ''));
    return found?.logo_url || null;
  };

  const handleSubmit = async () => {
    if (!selectedGateway) return;
    if (!trxId.trim()) { toast.error('Transaction ID is required.'); return; }
    if (selectedGateway.account_type !== 'corporate' && !senderNumber.trim()) { toast.error('Sender number is required.'); return; }
    
    setSubmitting(true);
    try {
      const now = new Date();
      const expiresAt = billing === 'yearly' ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
        merchant_id: merchant.id, plan_id: plan.id, billing_cycle: billing, amount_paid: price,
        currency: 'BDT', status: 'pending', started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
        next_billing_at: expiresAt.toISOString(), payment_method: selectedGateway.provider, payment_reference: trxId.trim(),
      }).select('*').single();

      if (subError) throw subError;

      await supabase.from('admin_orders').insert({
        merchant_id: merchant.id, plan_id: plan.id, subscription_id: newSub?.id, order_no: orderNo,
        amount: price, currency: 'BDT', billing_cycle: billing, payment_method: selectedGateway.provider,
        payment_reference: trxId.trim(), gateway_used: selectedGateway.provider, status: 'pending',
        sender_number: senderNumber.trim() || null, notes: `Gateway: ${selectedGateway.provider_name} | Account: ${selectedGateway.account_number}`,
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
        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'methods' && (
            <div className="space-y-3">
              {adminGateways.map((gw: any) => {
                const logoUrl = getLogoUrl(gw.provider);
                return (
                  <button key={gw.id} onClick={() => { setSelectedGateway(gw); setStep('checkout'); }}
                    className="w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group text-left">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                      {logoUrl ? <img src={logoUrl} alt={gw.provider_name} className="w-10 h-10 object-contain" /> : <span className="text-2xl">{METHOD_ICONS[gw.provider] || '💳'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{gw.provider_name}</p>
                      <p className="text-xs text-slate-500 truncate">{gw.account_number}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {step === 'checkout' && selectedGateway && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-center">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Amount to Pay</p>
                <p className="text-4xl font-black">{fmtBDT(price)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Payment To</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-xl">{METHOD_ICONS[selectedGateway.provider] || '💳'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedGateway.provider_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{selectedGateway.account_number}</p>
                      <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Copied!'); }} className="text-slate-400 hover:text-blue-600">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {selectedGateway.account_type !== 'corporate' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Sender Number *</label>
                    <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Transaction ID *</label>
                  <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 8N7AB23KC1" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting || !trxId.trim()} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Shield size={16} /> Submit Payment</>}
              </button>
            </div>
          )}

          {step === 'pending' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={28} className="text-amber-500" /></div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Submitted!</h3>
              <p className="text-sm text-slate-500 mt-2">Under review. Activated within 24 hours.</p>
              <button onClick={onClose} className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl">Back to Plans</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────
function PlanCard({ plan, billing, yearlyDiscount, isCurrentPlan, canDowngrade, onSelect, isFreePlan }: any) {
  const monthlyPrice = plan.price ?? 0;
  const yearlyPrice = plan.yearly_price ?? Math.round(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
  const price = billing === 'yearly' ? yearlyPrice : monthlyPrice;

  // Parse tag e.g. "Popular:blue" -> label: "Popular", color: "blue"
  const tagParts = plan.tag ? plan.tag.split(':') : [];
  const tagLabel = tagParts[0] || null;
  const tagColor = tagParts[1] || 'blue';
  const theme = getColorTheme(tagColor);

  const methods = Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile'];
  const methodLabels: Record<string, string> = { mobile: 'Mobile Banking', bank: 'Bank Transfer', crypto: 'Crypto', international: 'International' };

  return (
    <div className={`relative bg-white dark:bg-[#111827] border-2 rounded-[24px] p-6 flex flex-col transition-all duration-300
      ${isCurrentPlan 
        ? `border-blue-500 ring-4 ring-blue-500/10 shadow-xl shadow-blue-500/10 scale-[1.02]` 
        : tagLabel ? theme.border : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
      
      {/* Tag Badge on Border */}
      {tagLabel && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${theme.bg} text-white shadow-md`}>
          {tagLabel}
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6 text-center mt-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1 mt-3">
          <span className={`text-4xl font-black ${isCurrentPlan ? 'text-blue-600' : theme.text}`}>{fmtBDT(price)}</span>
          <span className="text-sm font-medium text-slate-500">/ {billing === 'yearly' ? 'yr' : 'mo'}</span>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 space-y-3.5 mb-8">
        <FeatureRow theme={theme} label={plan.transaction_limit_monthly === 0 ? 'Unlimited transactions' : `${plan.transaction_limit_monthly.toLocaleString()} transactions/mo`} />
        <FeatureRow theme={theme} label={`${plan.business_limit} business${plan.business_limit > 1 ? 'es' : ''}`} />
        {plan.is_team_allowed && <FeatureRow theme={theme} label={`Team up to ${plan.allowed_team_members} members`} />}
        <FeatureRow theme={theme} label={`${plan.device_limit} device${plan.device_limit > 1 ? 's' : ''}`} />
        {methods.map((m: string) => <FeatureRow key={m} theme={theme} label={methodLabels[m] || m} />)}
        {plan.allowed_telegram_group && <FeatureRow theme={theme} label="Telegram group alerts" />}
        {plan.is_custom_bot_allowed && <FeatureRow theme={theme} label="Custom Telegram bot" />}
      </div>

      {/* Action Button */}
      {isCurrentPlan ? (
        <button className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-sm font-bold cursor-default">
          Current Plan
        </button>
      ) : isFreePlan ? (
        <button className={`w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold cursor-default`}>
          Free Tier
        </button>
      ) : canDowngrade ? (
        <button onClick={onSelect} className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
          Downgrade
        </button>
      ) : (
        <button onClick={onSelect} className={`w-full py-3.5 ${theme.bg} hover:opacity-90 text-white rounded-xl text-sm font-black transition-all shadow-lg`}>
          Select Plan
        </button>
      )}
    </div>
  );
}

function FeatureRow({ label, theme }: { label: string, theme: any }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle size={18} className={`${theme.text} mt-0.5 shrink-0`} />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">{label}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderHistory, setOrderHistory] = useState<AdminOrder[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [yearlyDiscount, setYearlyDiscount] = useState(20);
  const [adminGateways, setAdminGateways] = useState<AdminGateway[]>([]);
  const [paymentLogos, setPaymentLogos] = useState<PaymentLogo[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

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

      setMerchant(merchantRes.data);
      setAllPlans(plansRes.data || []);
      setSubscription(subRes.data || null);
      setAdminGateways(gatewaysRes.data || []);
      setOrderHistory(ordersRes.data || []);
      setPaymentLogos(logosRes.data || []);
      if (settingsRes.data?.value) setYearlyDiscount(parseInt(settingsRes.data.value) || 20);

      const activePlanId = subRes.data?.plan_id || merchantRes.data?.plan_id;
      if (activePlanId && plansRes.data) {
        setCurrentPlan(plansRes.data.find((p: Plan) => p.id === activePlanId) || null);
      }
    } catch (e: any) { toast.error('Failed to load: ' + e.message); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const days = daysLeft(subscription?.expires_at || null);
  const isActive = subscription?.status === 'active';
  const canDowngradeDays = days !== null && days <= 3;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      {checkoutPlan && merchant && (
        <CheckoutModal plan={checkoutPlan} billing={billing} price={billing === 'yearly' ? (checkoutPlan.yearly_price ?? Math.round((checkoutPlan.price ?? 0) * 12 * (1 - yearlyDiscount / 100))) : (checkoutPlan.price ?? 0)} adminGateways={adminGateways} paymentLogos={paymentLogos} merchant={merchant} onClose={() => setCheckoutPlan(null)} onSuccess={load} />
      )}

      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard size={24} className="text-blue-600" />
            Billing & Subscription
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your usage, current plan, and payment methods.</p>
        </div>

        {/* Current Plan & Usage Dashboard */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Box: Active Plan Status */}
            <div className="border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Current Plan</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentPlan?.name || 'Free Tier'}</h2>
                </div>
                {isActive ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black tracking-widest uppercase">Active</span>
                ) : (
                  <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-black tracking-widest uppercase">Free / Expired</span>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200">Renewal Date:</span> {fmtDate(subscription?.expires_at || null)}
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200">Amount Paid:</span> {fmtBDT(subscription?.amount_paid || 0)}
                </p>
              </div>

              {canDowngradeDays && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-xs font-bold">
                   <Info size={16} /> Downgrade is available since you are within 3 days of expiry.
                </div>
              )}
            </div>

            {/* Right Box: Usage Limits */}
            <div className="p-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-5 border-b pb-2 border-slate-100 dark:border-slate-800">Usage Overview</h3>
              {currentPlan && merchant ? (
                <>
                  <UsageBar label="Monthly Transactions" used={merchant.transaction_count} limit={currentPlan.transaction_limit_monthly} />
                  <UsageBar label="Businesses Used" used={merchant.business_count} limit={currentPlan.business_limit} />
                  <UsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan.allowed_team_members} />
                  <UsageBar label="Devices Connected" used={merchant.device_count} limit={currentPlan.device_limit} />
                </>
              ) : (
                <p className="text-sm text-slate-500 font-medium">Please select a plan to view usage limits.</p>
              )}
            </div>

          </div>
        </div>

        {/* Pricing Table Options */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Change or Upgrade Plan</h2>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Monthly
              </button>
              <button onClick={() => setBilling('yearly')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Yearly <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Save {yearlyDiscount}%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPlans.map(plan => {
              const isCurrent = currentPlan?.id === plan.id && isActive;
              const isDowngrade = plan.serial < (currentPlan?.serial ?? 0);
              const isFree = (plan.price ?? 0) === 0;
              return (
                <PlanCard key={plan.id} plan={plan} billing={billing} yearlyDiscount={yearlyDiscount} isCurrentPlan={isCurrent} canDowngrade={isDowngrade && canDowngradeDays} isFreePlan={isFree} onSelect={() => !isFree && setCheckoutPlan(plan)} />
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <div className="pt-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Billing History</h2>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {orderHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400"><History size={32} className="mx-auto mb-3 opacity-50" /><p className="text-sm font-bold">No history available</p></div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderHistory.map(order => (
                  <div key={order.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{order.order_no}</p>
                      <p className="text-xs text-slate-500 font-medium">{fmtDate(order.created_at)} • {order.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{fmtBDT(order.amount)}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}