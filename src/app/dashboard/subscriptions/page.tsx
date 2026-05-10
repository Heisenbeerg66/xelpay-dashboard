'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreditCard, BadgeCheck, Loader2, Check, X, Zap, Star,
  RefreshCw, AlertCircle, Clock, CheckCircle2, ChevronDown, Copy,
  Shield, Lock, Building2, Smartphone, ArrowRight
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
    active:    { cls: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20', label: 'Active' },
    pending:   { cls: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20', label: 'Pending Verification' },
    expired:   { cls: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20', label: 'Expired' },
    cancelled: { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700', label: 'Cancelled' },
  };
  const s = map[status?.toLowerCase()] ?? map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${s.cls}`}>
      <Clock size={12} /> {s.label}
    </span>
  );
}

function getPlanFeatures(plan: any): string[] {
  const tx = (plan.transaction_limit_monthly ?? 100) === 0
    ? 'Unlimited transactions / month'
    : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`;
  
  const base: (string | null)[] = [
    tx,
    `${plan.business_limit ?? 1} Business Workspace${(plan.business_limit ?? 1) > 1 ? 's' : ''}`,
    ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => METHOD_LABELS[m] ?? m),
    plan.is_team_allowed ? `Team access (up to ${plan.allowed_team_members ?? 1} members)` : 'Single user access only',
    `${plan.device_limit ?? 1} Device Connection${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
    plan.allowed_telegram_group ? 'Telegram Group Alerts' : null,
    plan.is_custom_bot_allowed ? 'Custom Telegram Bot' : null,
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
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>
      <div 
        className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white cursor-pointer flex justify-between items-center transition-all hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-3">
          {selected?.icon && <selected.icon size={18} className="text-blue-500" />}
          {selected?.label || 'Select Provider'}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm sm:hidden animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:top-[calc(100%+12px)] sm:left-0 sm:right-0 z-[120] bg-white dark:bg-[#111827] sm:rounded-3xl rounded-t-[32px] shadow-2xl sm:shadow-xl sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-top-4 duration-300">
            <div className="p-6 sm:hidden border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-[#0B1120]/80 backdrop-blur-md">
               <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Select Provider</h3>
               <button onClick={() => setIsOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"><X size={18} /></button>
            </div>
            <div className="max-h-[60vh] sm:max-h-[40vh] overflow-y-auto p-4 space-y-2">
              {options.length === 0 && <div className="p-6 text-center text-sm text-slate-500 font-bold">No providers available</div>}
              {options.map((opt: any) => (
                <div 
                  key={opt.id}
                  className={`px-5 py-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                    value === opt.id ? 'bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => { onChange(opt.id); setIsOpen(false); }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${value === opt.id ? 'bg-blue-100/50 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <opt.icon size={18} className={value === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'} />
                    </div>
                    <span className={`block text-[15px] ${value === opt.id ? 'font-black' : 'font-bold'}`}>{opt.label}</span>
                  </div>
                  {value === opt.id && <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />}
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
      toast.success('Payment submitted securely!');
      if (newSub) onSuccess(newSub, plan);
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 px-8 py-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full blur-3xl" />
          <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"><X size={18} /></button>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner"><CreditCard size={24} className="text-blue-50" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Upgrade Plan</p>
              <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
            </div>
          </div>
          <div className="mt-6 flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black tracking-tighter">৳{price.toLocaleString()}</span>
            <span className="text-blue-200 text-sm font-bold uppercase tracking-widest">/ {billing === 'yearly' ? 'year' : 'month'}</span>
          </div>
        </div>

        {step === 'form' && (
          <div className="p-8 space-y-7">
            <AndroidSelect label="Select Payment Provider" options={PAYMENT_METHODS} value={method} onChange={setMethod} />
            
            {selected && (
              <div className="bg-blue-50/50 dark:bg-[#0B1120] border border-blue-100 dark:border-slate-800 rounded-2xl px-6 py-5 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Send exactly ৳{price.toLocaleString()} To</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{selected.number}</p>
                  <button onClick={() => { navigator.clipboard.writeText(selected.raw.account_number); toast.success('Copied to clipboard!'); }} className="p-2.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm group-hover:shadow text-slate-500 hover:text-blue-600"><Copy size={16} /></button>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-2 capitalize flex items-center gap-1.5">
                  <Shield size={12} className="text-blue-500" />
                  {selected.label} {selected.raw.account_type ? `(${selected.raw.account_type})` : ''} • {billing === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Your Number (Sender)</label>
                <input type="text" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="e.g. 01700000000" className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-[15px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Transaction ID (TrxID)</label>
                <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. ABC123XYZ456" className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-[15px] font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#111827] focus:ring-4 focus:ring-blue-500/10 transition-all uppercase shadow-sm" />
              </div>
            </div>
            
            <button onClick={handleSubmit} disabled={submitting || PAYMENT_METHODS.length === 0} className="w-full bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 text-white dark:text-slate-900 dark:hover:text-white py-4 rounded-2xl font-black text-[15px] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-slate-900/10 hover:shadow-blue-500/25 hover:-translate-y-0.5">
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <><Lock size={18} /> Confirm Payment</>}
            </button>
          </div>
        )}
        
        {step === 'pending' && (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border-[8px] border-amber-100 dark:border-amber-500/20 shadow-inner"><Clock size={40} className="text-amber-500" /></div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Verification Pending</h4>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[280px]">Your payment is currently under review. <strong className="text-slate-800 dark:text-slate-200">{plan.name}</strong> plan will be activated shortly.</p>
            <div className="mt-8 w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl px-5 py-4 text-left shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</p>
              <p className="text-base font-mono font-black text-slate-900 dark:text-white mt-1">{trxId}</p>
            </div>
            <button onClick={onClose} className="mt-8 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[15px] transition-all">Return to Subscriptions</button>
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

      let activePlanId = merchantData?.plan_id || subRes.data?.plan_id;
      let active = null;

      if (activePlanId) {
        active = fetchedPlans.find((p: any) => p.id === activePlanId);
      }

      if (!active) {
        active = fetchedPlans.find((p: any) => p.price === 0);
      }

      setCurrentPlan(active || null);

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

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="w-full space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard size={32} className="text-blue-600" /> Subscriptions
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your workspace plan, limits, and billing details.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-95">
          <RefreshCw size={14} /> Sync Data
        </button>
      </div>

      {/* ── Current Plan Card ── */}
      {currentPlan ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/60 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />
          
          <div className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              
              {/* Plan Info */}
              <div className="flex items-start gap-5 sm:gap-6 flex-1">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20 shrink-0 shadow-inner">
                  <BadgeCheck size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Workspace Plan</p>
                    <StatusBadge status={subscription?.status || 'active'} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentPlan.name}</h2>
                  <p className="text-base text-slate-500 dark:text-slate-400 font-bold">
                    {currentPlan.price === 0 
                      ? 'Free Tier (Lifetime Access)' 
                      : `৳${currentPlan.price.toLocaleString()} / month`}
                  </p>
                </div>
              </div>

              {/* Price Display */}
              <div className="text-left lg:text-right shrink-0 bg-slate-50/50 dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 lg:bg-transparent lg:border-transparent lg:p-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 lg:hidden mb-2">Billing Amount</p>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {currentPlan.price === 0 ? 'Free' : `৳${currentPlan.price.toLocaleString()}`}
                </p>
                {currentPlan.price > 0 && <p className="text-[15px] text-slate-500 dark:text-slate-400 font-bold mt-1">per month</p>}
              </div>
            </div>

            {/* 🔥 PENDING STATUS WARNING BOX 🔥 */}
            {subscription?.status === 'pending' && (
              <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl shrink-0">
                  <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-amber-900 dark:text-amber-400 tracking-tight">Payment is under verification</h4>
                  <p className="text-sm font-medium text-amber-700/90 dark:text-amber-500/80 mt-1.5 leading-relaxed">
                    Your recent payment for the <strong className="font-black">{currentPlan.name}</strong> plan is currently being reviewed by our administrative team. Once verified, your plan will be active. If you wish to change your mind, you can select and upgrade to a new plan below.
                  </p>
                </div>
              </div>
            )}

            {/* Subscription Details Grid */}
            {subscription ? (
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-slate-50 dark:bg-[#0B1120] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Billing Cycle</p>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white mt-1.5 capitalize">{subscription.billing_cycle}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Activated On</p>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white mt-1.5">{formatDate(subscription.started_at)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Next Billing</p>
                  <p className={`text-[15px] font-bold mt-1.5 ${subscription.status === 'expired' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {subscription.expires_at ? formatDate(subscription.expires_at) : 'Lifetime'}
                  </p>
                </div>
                {subscription.payment_reference && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Last TrxID</p>
                    <p className="text-[15px] font-mono font-bold text-slate-900 dark:text-white mt-1.5 truncate bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block">{subscription.payment_reference}</p>
                  </div>
                )}
              </div>
            ) : (
              currentPlan.price === 0 && (
                <div className="mt-10 p-6 bg-slate-50 dark:bg-[#0B1120] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl shrink-0"><Shield size={20} className="text-blue-600 dark:text-blue-400" /></div>
                  <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">You are currently on the lifetime Free Tier. No automated billing or renewal is required.</p>
                </div>
              )
            )}

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getPlanFeatures(currentPlan).slice(0, 6).map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0 mt-0.5">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-[32px] p-8 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm">
          <div className="p-5 bg-amber-100 dark:bg-amber-500/20 rounded-2xl shrink-0"><AlertCircle size={32} className="text-amber-600 dark:text-amber-400" /></div>
          <div>
            <h3 className="text-xl font-black text-amber-900 dark:text-amber-400 tracking-tight">No Active Subscription</h3>
            <p className="text-[15px] text-amber-800/80 dark:text-amber-500/80 font-bold mt-2 max-w-2xl leading-relaxed">You currently do not have an active plan assigned. Please select a plan below to unlock premium workspace features and increase your limits.</p>
          </div>
        </div>
      )}

      <div className="space-y-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Upgrade Workspace</h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium mt-2">Scale your operations with higher limits and advanced API tools.</p>
          </div>
          <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 self-start md:self-auto shadow-sm">
            <button onClick={() => setBilling('monthly')} className={`px-6 py-3 text-xs font-black rounded-xl uppercase tracking-widest transition-all ${billing === 'monthly' ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`px-6 py-3 text-xs font-black rounded-xl uppercase tracking-widest transition-all flex items-center gap-2.5 ${billing === 'yearly' ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              Yearly
              {yearlyDiscountActive && <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black rounded-lg shadow-sm">SAVE {yearlyDiscount}%</span>}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPlans.map((plan) => {
            const rawTag = plan.tag || '';
            const [tagText, tagColor] = rawTag.includes(':') ? rawTag.split(':') : [rawTag, 'blue'];
            const isPopular = tagText.toLowerCase().includes('popular') || tagText.toLowerCase().includes('best');
            const isCurrent = isCurrentPlan(plan);
            const displayPrice = getDisplayPrice(plan);
            const features = getPlanFeatures(plan);
            
            return (
              <div key={plan.id} className={`relative flex flex-col rounded-[32px] overflow-hidden transition-all duration-500 ${isPopular ? 'bg-white dark:bg-[#111827] border-2 border-blue-500 shadow-2xl shadow-blue-500/10 lg:-translate-y-2' : isCurrent ? 'bg-slate-50/50 dark:bg-[#0B1120] border-2 border-emerald-400 dark:border-emerald-600' : 'bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none'}`}>
                
                {(isPopular || tagText) && !isCurrent && (
                  <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                    <div className={`text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-b-2xl shadow-md ${isPopular ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-700 dark:bg-slate-600'}`}>
                      {tagText || 'Plan'}
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                    <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-b-2xl shadow-md">Current Active Plan</div>
                  </div>
                )}
                
                <div className={`p-8 lg:p-10 flex-1 flex flex-col ${tagText || isCurrent ? 'pt-12' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                    {isPopular && <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><Star size={20} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" /></div>}
                  </div>
                  
                  <div className="mt-4 mb-8">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Free</span>
                        <p className="text-[13px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Lifetime Access</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">৳{displayPrice.toLocaleString()}</span>
                          <span className="text-[15px] text-slate-500 font-bold">/ {billing === 'yearly' ? 'yr' : 'mo'}</span>
                        </div>
                        {billing === 'yearly' && yearlyDiscountActive && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-black mt-2 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 inline-block px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                            Save ৳{(plan.price * 12 - displayPrice).toFixed(0)} annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-8 w-full" />
                  
                  <ul className="space-y-4 flex-1 mb-10">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3.5">
                        <div className={`p-1 rounded-lg mt-0.5 shrink-0 ${isPopular ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          <Check size={14} className={isPopular ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'} />
                        </div>
                        <span className="text-[14px] text-slate-700 dark:text-slate-300 font-bold leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    {isCurrent ? (
                      <div className="w-full flex items-center justify-center gap-2.5 py-4 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-[13px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest cursor-default">
                        <BadgeCheck size={18} /> Active Plan
                      </div>
                    ) : plan.price === 0 ? (
                      <div className="w-full flex items-center justify-center py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-not-allowed">
                        Included Tier
                      </div>
                    ) : (
                      <button 
                        onClick={() => setCheckoutPlan(plan)} 
                        className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:-translate-y-1' : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 hover:-translate-y-1 shadow-xl shadow-slate-900/10'}`}
                      >
                        <Zap size={16} /> Upgrade to {plan.name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {checkoutPlan && merchant && (
        <CheckoutModal 
          plan={checkoutPlan} 
          billing={billing} 
          price={getDisplayPrice(checkoutPlan)} 
          merchant={merchant} 
          adminGateways={adminGateways} 
          onClose={() => setCheckoutPlan(null)} 
          onSuccess={(newSub: any, newPlan: any) => { setSubscription(newSub); setCheckoutPlan(null); load(); }} 
        />
      )}
    </div>
  );
}