'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreditCard, BadgeCheck, Loader2, Check, X, Zap, Star,
  RefreshCw, AlertCircle, Clock, CheckCircle2, ChevronDown, Copy,
  Shield, Lock, Building2, Smartphone
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
    active:    { cls: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40', label: 'Active' },
    pending:   { cls: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40', label: 'Pending' },
    expired:   { cls: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40', label: 'Expired' },
    cancelled: { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700', label: 'Cancelled' },
  };
  const s = map[status?.toLowerCase()] ?? map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.cls}`}>
      <Clock size={10} /> {s.label}
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

// ── Android Style Select Component ────────────────────────────────────────────
function AndroidSelect({ options, value, onChange, label }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o: any) => o.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      <div 
        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer flex justify-between items-center transition-all hover:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5">
          {selected?.icon && <selected.icon size={16} className="text-blue-500" />}
          {selected?.label || 'Select Provider'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm sm:hidden animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:top-[calc(100%+8px)] sm:left-0 sm:right-0 z-[120] bg-white dark:bg-[#111827] sm:rounded-2xl rounded-t-3xl shadow-2xl sm:shadow-xl sm:border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 duration-300">
            <div className="p-5 sm:hidden border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-black text-slate-900 dark:text-white text-lg">Select Provider</h3>
               <button onClick={() => setIsOpen(false)} className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="max-h-[60vh] sm:max-h-[40vh] overflow-y-auto p-3 space-y-1">
              {options.length === 0 && <div className="p-4 text-center text-sm text-slate-500 font-bold">No providers available</div>}
              {options.map((opt: any) => (
                <div 
                  key={opt.id}
                  className={`px-4 py-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                    value === opt.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400' : 'border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => { onChange(opt.id); setIsOpen(false); }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${value === opt.id ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <opt.icon size={16} className={value === opt.id ? 'text-blue-600' : 'text-slate-500'} />
                    </div>
                    <span className={`block text-sm ${value === opt.id ? 'font-black' : 'font-bold'}`}>{opt.label}</span>
                  </div>
                  {value === opt.id && <CheckCircle2 size={18} className="text-blue-600" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ plan, billing, price, merchant, adminGateways, onClose, onSuccess }: any) {
  const [step, setStep] = useState<'form' | 'pending'>('form');
  const [method, setMethod] = useState('');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const PAYMENT_METHODS = adminGateways.map((g: any) => ({
    id: g.provider, label: g.provider_name,
    number: g.provider === 'bank' ? `${g.account_number} (${g.branch_name})` : g.account_number,
    icon: g.provider === 'bank' ? Building2 : Smartphone, raw: g
  }));

  useEffect(() => { if (PAYMENT_METHODS.length > 0 && !method) setMethod(PAYMENT_METHODS[0].id); }, [PAYMENT_METHODS, method]);

  const selected = PAYMENT_METHODS.find((m: any) => m.id === method) ?? PAYMENT_METHODS[0];

  const handleSubmit = async () => {
    if (!method) { toast.error('Please select a payment method.'); return; }
    if (!trxId.trim()) { toast.error('Transaction ID is required.'); return; }
    if (!senderNumber.trim()) { toast.error('Sender number is required.'); return; }
    
    setSubmitting(true);
    try {
      const now = new Date();
      const expiresAt = billing === 'yearly' ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
        merchant_id: merchant.id, plan_id: plan.id, billing_cycle: billing, amount_paid: price, currency: 'BDT',
        status: 'pending', started_at: now.toISOString(), expires_at: expiresAt.toISOString(), next_billing_at: expiresAt.toISOString(),
        payment_method: method, payment_reference: trxId.trim(),
      }).select('*').single();
      
      if (subError) throw subError;

      await supabase.from('admin_orders').insert({
        merchant_id: merchant.id, plan_id: plan.id, subscription_id: newSub?.id, order_no: orderNo, amount: price,
        currency: 'BDT', billing_cycle: billing, payment_method: method, payment_reference: trxId.trim(),
        gateway_used: method, status: 'pending', notes: `Sender: ${senderNumber.trim()}`,
      });

      setStep('pending');
      toast.success('Payment submitted! Awaiting verification.');
      if (newSub) onSuccess(newSub, plan);
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20"><CreditCard size={22} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Upgrade Plan</p>
              <h3 className="text-xl font-black">{plan.name}</h3>
            </div>
          </div>
          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="text-4xl font-black tracking-tight">৳{price.toLocaleString()}</span>
            <span className="text-blue-200 text-sm font-bold">/ {billing === 'yearly' ? 'year' : 'month'}</span>
          </div>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-6">
            <AndroidSelect label="Select Payment Provider" options={PAYMENT_METHODS} value={method} onChange={setMethod} />
            {selected && (
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Send ৳{price.toLocaleString()} To</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">{selected.number}</p>
                  <button onClick={() => { navigator.clipboard.writeText(selected.raw.account_number); toast.success('Copied!'); }} className="p-2 bg-slate-200 hover:bg-blue-100 rounded-lg transition-colors"><Copy size={14} /></button>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-1 capitalize">{selected.label} {selected.raw.account_type ? `(${selected.raw.account_type})` : ''} • {billing === 'monthly' ? 'Monthly' : 'Yearly'} Plan</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Your Number (Sender)</label>
                <input type="text" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="e.g. 01700000000" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Transaction ID (TrxID)</label>
                <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. ABC123XYZ456" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase" />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting || PAYMENT_METHODS.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Lock size={16} /> Submit Payment</>}
            </button>
          </div>
        )}
        {step === 'pending' && (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-xl"><Clock size={36} className="text-amber-500" /></div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Payment Submitted</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">Your payment is under review. Your <span className="font-bold text-slate-800">{plan.name}</span> plan will be activated within 24 hours.</p>
            <div className="mt-6 w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 rounded-xl px-4 py-3 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
              <p className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5">{trxId}</p>
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3.5 rounded-xl font-black text-sm transition-all">Return to Dashboard</button>
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
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [yearlyDiscount, setYearlyDiscount] = useState(20);
  const [yearlyDiscountActive, setYearlyDiscountActive] = useState(true);
  const [adminGateways, setAdminGateways] = useState<any[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansRes, merchantRes, subRes, settingsRes, gatewaysRes] = await Promise.all([
        supabase.from('plans').select('*').order('serial', { ascending: true }),
        supabase.from('merchants').select('*').eq('id', user.id).single(),
        supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('site_settings').select('key_name, value, is_active').eq('key_name', 'subscription_discount_yearly').maybeSingle(),
        supabase.from('admin_gateways').select('*').eq('status', 'active')
      ]);

      const fetchedPlans = plansRes.data || [];
      const merchantData = merchantRes.data;
      
      setAllPlans(fetchedPlans);
      setMerchant(merchantData);
      setSubscription(subRes.data || null);
      
      if (settingsRes.data) {
        setYearlyDiscountActive(settingsRes.data.is_active !== false);
        setYearlyDiscount(parseFloat(settingsRes.data.value) || 20);
      }
      
      setAdminGateways(gatewaysRes.data || []);

      // FIX: Check merchant's plan_id first, so Free Tier always shows up!
      const activePlanId = merchantData?.plan_id || subRes.data?.plan_id;
      if (activePlanId) {
        const active = fetchedPlans.find((p: any) => p.id === activePlanId);
        setCurrentPlan(active || null);
      }

    } catch (error) { 
      toast.error('Failed to load subscription data.'); 
      console.error(error);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const getYearlyPrice = (monthlyPrice: number) => !yearlyDiscountActive ? monthlyPrice * 12 : (monthlyPrice * 12) - (monthlyPrice * 12 * (yearlyDiscount / 100));
  const getDisplayPrice = (plan: any) => billing === 'monthly' ? plan.price : getYearlyPrice(plan.price);
  const isCurrentPlan = (plan: any) => currentPlan?.id === plan.id;
  const formatDate = (d: string | null) => !d ? '—' : new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={36} /></div>;

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><CreditCard size={28} className="text-blue-600" /> Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage your active plan, billing cycle, and upgrades.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border border-slate-200"><RefreshCw size={14} /> Sync Status</button>
      </div>

      {currentPlan ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/20 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 shrink-0"><BadgeCheck size={28} className="text-blue-600" /></div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</p>
                    <StatusBadge status={subscription?.status || 'active'} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{currentPlan.name}</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1.5">{currentPlan.price === 0 ? 'Free Tier (No Expiration)' : `৳${currentPlan.price.toLocaleString()} / month`}</p>
                </div>
              </div>
              <div className="text-left md:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:bg-transparent md:border-transparent md:p-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 md:hidden mb-1">Billing Amount</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentPlan.price === 0 ? 'Free' : `৳${currentPlan.price.toLocaleString()}`}</p>
                {currentPlan.price > 0 && <p className="text-sm text-slate-500 font-bold mt-0.5">per month</p>}
              </div>
            </div>

            {subscription ? (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-100 dark:border-slate-800">
                <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing Cycle</p><p className="text-sm font-bold text-slate-900 dark:text-white mt-1 capitalize">{subscription.billing_cycle}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activated On</p><p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{formatDate(subscription.started_at)}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Billing</p><p className={`text-sm font-bold mt-1 ${subscription.status === 'expired' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{subscription.expires_at ? formatDate(subscription.expires_at) : 'Never'}</p></div>
                {subscription.payment_reference && (<div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last TrxID</p><p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1 truncate">{subscription.payment_reference}</p></div>)}
              </div>
            ) : (currentPlan.price === 0 && (
              <div className="mt-8 p-5 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400"><Shield size={16} className="inline mr-2 text-blue-500" />You are currently on the lifetime Free Tier. No billing or renewal is required.</p>
              </div>
            ))}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getPlanFeatures(currentPlan).slice(0, 6).map((f, i) => (
                <div key={i} className="flex items-center gap-2.5"><div className="p-1 bg-emerald-100 rounded-md"><Check size={12} className="text-emerald-600" /></div><span className="text-xs font-bold text-slate-600">{f}</span></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="p-4 bg-amber-100 rounded-full shrink-0"><AlertCircle size={28} className="text-amber-600" /></div>
          <div><h3 className="text-lg font-black text-amber-900">No Active Subscription</h3><p className="text-sm text-amber-700 font-bold mt-1 max-w-xl">You currently do not have an active plan assigned. Please select a plan below to unlock premium features and increase your limits.</p></div>
        </div>
      )}

      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Upgrade Your Plan</h2><p className="text-sm text-slate-500 font-bold mt-1">Scale your business with higher limits and advanced tools.</p></div>
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2.5 text-xs font-black rounded-lg uppercase tracking-widest transition-all ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`px-5 py-2.5 text-xs font-black rounded-lg uppercase tracking-widest transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Yearly{yearlyDiscountActive && <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black rounded-md shadow-sm">SAVE {yearlyDiscount}%</span>}</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlans.map((plan) => {
            const isPopular = plan.tag === 'popular';
            const isCurrent = isCurrentPlan(plan);
            const displayPrice = getDisplayPrice(plan);
            const features = getPlanFeatures(plan);
            return (
              <div key={plan.id} className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 ${isPopular ? 'bg-white border-2 border-blue-500 shadow-2xl shadow-blue-500/10 lg:-translate-y-2' : isCurrent ? 'bg-slate-50 border-2 border-emerald-400' : 'bg-white border border-slate-200 hover:border-slate-300'}`}>
                {isPopular && <div className="absolute top-0 inset-x-0 flex justify-center z-10"><div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl shadow-md">Most Popular</div></div>}
                {isCurrent && !isPopular && <div className="absolute top-0 inset-x-0 flex justify-center z-10"><div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl shadow-md">Current Plan</div></div>}
                <div className={`p-7 flex-1 flex flex-col ${(isPopular || isCurrent) ? 'pt-10' : ''}`}>
                  <div className="flex items-center justify-between mb-2"><h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>{isPopular && <Star size={18} className="text-blue-500 fill-blue-500" />}</div>
                  <div className="mt-2 mb-6">
                    {plan.price === 0 ? (
                      <div><span className="text-4xl font-black text-slate-900 tracking-tight">Free</span><p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Forever</p></div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5"><span className="text-4xl font-black text-slate-900 tracking-tight">৳{displayPrice.toLocaleString()}</span><span className="text-sm text-slate-500 font-bold">/ {billing === 'yearly' ? 'yr' : 'mo'}</span></div>
                        {billing === 'yearly' && yearlyDiscountActive && <p className="text-[11px] text-emerald-600 font-black mt-1.5 uppercase tracking-wider bg-emerald-50 inline-block px-2 py-0.5 rounded-md">You save ৳{(plan.price * 12 - displayPrice).toFixed(0)} a year</p>}
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-slate-100 mb-6 w-full" />
                  <ul className="space-y-3.5 flex-1 mb-8">
                    {features.map((f, fi) => <li key={fi} className="flex items-start gap-3 text-sm"><div className={`p-0.5 rounded-full mt-0.5 ${isPopular ? 'bg-blue-100' : 'bg-slate-100'}`}><Check size={12} className={isPopular ? 'text-blue-600' : 'text-slate-600'} /></div><span className="text-slate-700 font-bold leading-snug">{f}</span></li>)}
                  </ul>
                  <div className="mt-auto">
                    {isCurrent ? <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-xs font-black text-emerald-700 uppercase tracking-widest"><BadgeCheck size={16} /> Active Plan</div> : plan.price === 0 ? <div className="w-full flex items-center justify-center py-3.5 bg-slate-100 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest cursor-not-allowed">Included Tier</div> : <button onClick={() => setCheckoutPlan(plan)} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:-translate-y-0.5' : 'bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-0.5 shadow-xl shadow-slate-900/10'}`}><Zap size={15} /> Upgrade to {plan.name}</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {checkoutPlan && merchant && <CheckoutModal plan={checkoutPlan} billing={billing} price={getDisplayPrice(checkoutPlan)} merchant={merchant} adminGateways={adminGateways} onClose={() => setCheckoutPlan(null)} onSuccess={(newSub: any, newPlan: any) => { setSubscription(newSub); setCheckoutPlan(null); load(); }} />}
    </div>
  );
}