'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreditCard, BadgeCheck, Loader2, Check, X, Zap, Star,
  RefreshCw, AlertCircle, Clock, CheckCircle2, ChevronDown, Copy,
  Shield, Lock, Building2, Smartphone, Receipt
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Method labels ─────────────────────────────────────────────────────────────
const METHOD_LABELS: Record<string, string> = {
  mobile: 'Mobile Banking',
  bank: 'Bank Transfer',
  international: 'International',
  crypto: 'Cryptocurrency',
  card: 'Cards',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Active' },
    pending:   { cls: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Pending' },
    expired:   { cls: 'bg-red-50 text-red-600 border-red-100', label: 'Expired' },
    cancelled: { cls: 'bg-slate-50 text-slate-500 border-slate-200', label: 'Cancelled' },
  };
  const s = map[status?.toLowerCase()] ?? map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${s.cls}`}>
      {status?.toLowerCase() === 'pending' ? <Clock size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {s.label}
    </span>
  );
}

function getPlanFeatures(plan: any): string[] {
  const tx = (plan.transaction_limit_monthly ?? 100) === 0
    ? 'Unlimited transactions'
    : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} monthly transactions`;
  
  const base: (string | null)[] = [
    tx,
    `${plan.business_limit ?? 1} Workspace${(plan.business_limit ?? 1) > 1 ? 's' : ''}`,
    ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => METHOD_LABELS[m] ?? m),
    plan.is_team_allowed ? `Team access (${plan.allowed_team_members ?? 1} members)` : 'Single user access',
    `${plan.device_limit ?? 1} Device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
    plan.allowed_telegram_group ? 'Telegram alerts' : null,
    plan.is_custom_bot_allowed ? 'Custom bot' : null,
  ];
  const extra: string[] = Array.isArray(plan.features) ? plan.features : [];
  return [...base.filter(Boolean) as string[], ...extra];
}

// ── Minimal Android Style Select Component ────────────────────────────────────
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
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div 
        className="w-full px-4 py-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white cursor-pointer flex justify-between items-center transition-all hover:border-slate-300 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-3">
          {selected?.icon && <selected.icon size={16} className="text-slate-400" />}
          {selected?.label || 'Select Provider'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110] bg-slate-900/20 backdrop-blur-sm sm:hidden animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:top-[calc(100%+8px)] sm:left-0 sm:right-0 z-[120] bg-white dark:bg-[#111827] sm:rounded-2xl rounded-t-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 duration-300">
            
            {/* Mobile Drag Handle */}
            <div className="w-full pt-3 pb-1 sm:hidden flex justify-center bg-white dark:bg-[#111827]">
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="max-h-[50vh] sm:max-h-[40vh] overflow-y-auto p-2">
              {options.length === 0 && <div className="p-4 text-center text-sm text-slate-500">No providers available</div>}
              {options.map((opt: any) => (
                <div 
                  key={opt.id}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    value === opt.id ? 'bg-slate-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                  onClick={() => { onChange(opt.id); setIsOpen(false); }}
                >
                  <div className="flex items-center gap-3">
                    <opt.icon size={16} className={value === opt.id ? 'text-blue-600' : 'text-slate-400'} />
                    <span className={`text-sm ${value === opt.id ? 'font-medium' : ''}`}>{opt.label}</span>
                  </div>
                  {value === opt.id && <CheckCircle2 size={16} className="text-blue-600" />}
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
      toast.success('Payment submitted securely.');
      if (newSub) onSuccess(newSub, plan);
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
        
        {/* Minimal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Upgrade to {plan.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">৳{price.toLocaleString()} / {billing === 'yearly' ? 'year' : 'month'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-5">
            <AndroidSelect label="Payment Method" options={PAYMENT_METHODS} value={method} onChange={setMethod} />
            
            {selected && (
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Send exact amount to</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-mono font-semibold text-slate-900 dark:text-white tracking-tight">{selected.number}</p>
                  <button onClick={() => { navigator.clipboard.writeText(selected.raw.account_number); toast.success('Copied!'); }} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-all text-slate-600 shadow-sm"><Copy size={14} /></button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <Shield size={12} className="text-slate-400" />
                  {selected.label} {selected.raw.account_type ? `(${selected.raw.account_type})` : ''}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Number (Sender)</label>
                <input type="text" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Transaction ID</label>
                <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="TRX12345XYZ" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all uppercase shadow-sm" />
              </div>
            </div>
            
            <button onClick={handleSubmit} disabled={submitting || PAYMENT_METHODS.length === 0} className="w-full mt-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 text-white dark:text-slate-900 py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Lock size={16} /> Confirm Payment</>}
            </button>
          </div>
        )}
        
        {step === 'pending' && (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700"><Clock size={28} className="text-slate-600 dark:text-slate-300" /></div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Verification Pending</h4>
            <p className="text-sm text-slate-500 leading-relaxed">We are reviewing your transaction. The plan will be active shortly.</p>
            <div className="mt-6 w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-left">
              <p className="text-xs text-slate-500 mb-1">Transaction Ref</p>
              <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{trxId}</p>
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-medium text-sm transition-all shadow-sm">Back to Plans</button>
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
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  
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

      const [plansRes, merchantRes, subRes, settingsRes, gatewaysRes, ordersRes] = await Promise.all([
        supabase.from('plans').select('*').order('serial', { ascending: true }),
        supabase.from('merchants').select('*').eq('id', user.id).single(),
        supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('site_settings').select('key_name, value, is_active').eq('key_name', 'subscription_discount_yearly').maybeSingle(),
        supabase.from('admin_gateways').select('*').eq('status', 'active'),
        supabase.from('admin_orders').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false })
      ]);

      const fetchedPlans = plansRes.data || [];
      const merchantData = merchantRes.data;
      
      setAllPlans(fetchedPlans);
      setMerchant(merchantData);
      setSubscription(subRes.data || null);
      setOrderHistory(ordersRes.data || []);
      
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
      toast.error('Failed to load data.'); 
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
  const getPlanName = (id: string) => allPlans.find(p => p.id === id)?.name || 'Unknown Plan';

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="w-full space-y-10 pb-16 animate-in fade-in duration-500 max-w-5xl mx-auto px-3 sm:px-0">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Billing & Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your workspace limits and subscription.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition-all shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Current Plan ── */}
      {currentPlan ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                <CreditCard size={24} className="text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Current Plan</span>
                  <StatusBadge status={subscription?.status || 'active'} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{currentPlan.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {currentPlan.price === 0 ? 'Free lifetime access' : `৳${currentPlan.price.toLocaleString()} per month`}
                </p>
              </div>
            </div>
            
            <div className="text-left md:text-right shrink-0 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl md:bg-transparent md:p-0">
              <p className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {currentPlan.price === 0 ? 'Free' : `৳${currentPlan.price.toLocaleString()}`}
              </p>
              {currentPlan.price > 0 && <p className="text-xs text-slate-500 mt-1">Next bill: {subscription?.expires_at ? formatDate(subscription.expires_at) : '—'}</p>}
            </div>
          </div>

          {/* Pending Warning */}
          {subscription?.status === 'pending' && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl flex items-start gap-3">
              <Clock className="text-slate-400 mt-0.5 shrink-0" size={16} />
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Verification in progress</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your payment for <b>{currentPlan.name}</b> is being reviewed. The plan will activate shortly. You can also upgrade to a different plan below.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle size={24} className="text-slate-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">No Subscription</h3>
            <p className="text-xs text-slate-500 mt-1">Select a plan below to activate your workspace.</p>
          </div>
        </div>
      )}

      {/* ── Available Plans ── */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Available Plans</h2>
            <p className="text-sm text-slate-500 mt-1">Choose the limits that fit your needs.</p>
          </div>
          <div className="flex items-center p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
            <button onClick={() => setBilling('monthly')} className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${billing === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Yearly {yearlyDiscountActive && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">-{yearlyDiscount}%</span>}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allPlans.map((plan) => {
            const rawTag = plan.tag || '';
            const [tagText] = rawTag.includes(':') ? rawTag.split(':') : [rawTag];
            const isPopular = tagText.toLowerCase().includes('popular') || tagText.toLowerCase().includes('best');
            const isCurrent = isCurrentPlan(plan);
            const displayPrice = getDisplayPrice(plan);
            const features = getPlanFeatures(plan);
            
            return (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl transition-all duration-300 bg-white dark:bg-[#111827] border ${isCurrent ? 'border-slate-400 dark:border-slate-500 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:shadow-sm'}`}>
                
                {(isPopular || tagText) && !isCurrent && (
                  <div className="absolute top-0 right-4 -translate-y-1/2">
                    <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm">{tagText}</span>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-2 mb-6">
                    {plan.price === 0 ? (
                      <div><span className="text-3xl font-semibold text-slate-900 dark:text-white">Free</span></div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold text-slate-900 dark:text-white">৳{displayPrice.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 font-medium">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6 w-full" />
                  
                  <ul className="space-y-3.5 flex-1 mb-8">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <Check size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    {isCurrent ? (
                      <div className="w-full flex items-center justify-center py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-700">
                        Current Plan
                      </div>
                    ) : plan.price === 0 ? (
                      <div className="w-full flex items-center justify-center py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed border border-slate-100 dark:border-slate-800">
                        Included
                      </div>
                    ) : (
                      <button 
                        onClick={() => setCheckoutPlan(plan)} 
                        className="w-full flex items-center justify-center py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium transition-colors"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment History ── */}
      {orderHistory.length > 0 && (
        <div className="pt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-slate-400" /> Payment History
          </h2>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Order Ref</th>
                    <th className="px-5 py-3.5 font-medium">Plan</th>
                    <th className="px-5 py-3.5 font-medium">Amount</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orderHistory.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{order.order_no}</td>
                      <td className="px-5 py-4 text-slate-900 dark:text-slate-200 font-medium">{getPlanName(order.plan_id)}</td>
                      <td className="px-5 py-4 text-slate-900 dark:text-slate-200">৳{order.amount.toLocaleString()}</td>
                      <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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