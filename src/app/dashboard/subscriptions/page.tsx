'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, Loader2, ArrowLeft, 
  Shield, Copy, Info, History, Lock, Crown
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
  id: string; plan_id: string; business_count: number;
  transaction_count: number; team_member_count: number; device_count: number;
};

// ── Helpers ───────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string | null) => d ?
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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

// Theme Generator for Tags
const getColorTheme = (colorName: string) => {
  const themes: Record<string, any> = {
    blue: { border: 'border-blue-600', bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-700' },
    emerald: { border: 'border-emerald-600', bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-700' },
    purple: { border: 'border-purple-600', bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-700' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-500', hover: 'hover:bg-amber-600' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-500', hover: 'hover:bg-orange-600' },
    slate: { border: 'border-slate-700', bg: 'bg-slate-800', text: 'text-slate-700 dark:text-slate-400', hover: 'hover:bg-slate-900' }
  };
  return themes[colorName?.toLowerCase()] || themes.blue;
};

// ── Usage Bar Component (Restored Database Logic) ─────────────
function CustomUsageBar({ label, used = 0, limit = 0 }: { label: string, used: number, limit: number }) {
  const isUnlimited = limit === 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const displayLimit = isUnlimited ? 'Unlimited' : limit.toLocaleString();
  const displayUsed = used.toLocaleString();

  let barColor = 'bg-blue-600 dark:bg-blue-500';
  if (percentage >= 90) barColor = 'bg-red-500';
  else if (percentage >= 75) barColor = 'bg-amber-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-bold">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {displayUsed} / {displayLimit} {!isUnlimited && <span className="text-slate-400 text-xs ml-1 font-medium">({Math.round(percentage)}%)</span>}
        </span>
      </div>
      <div className={`h-2.5 w-full rounded-full overflow-hidden ${isUnlimited ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
         {!isUnlimited ? (
           <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percentage}%` }} />
         ) : (
           <div className="h-full rounded-full bg-emerald-500 w-full opacity-50" />
         )}
      </div>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────
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

  // Working View State 
  const [currentView, setCurrentView] = useState<"billing" | "checkout" | "pending_view">("billing");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutPrice, setCheckoutPrice] = useState<number>(0);

  // Checkout Form States
  const [selectedGateway, setSelectedGateway] = useState<AdminGateway | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    } catch (e: any) { 
      toast.error('Failed to load: ' + e.message);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getLogoUrl = (provider: string) => {
    const found = paymentLogos.find((l: any) => l.method_name.toLowerCase() === provider.toLowerCase() || l.method_name.toLowerCase() === provider.toLowerCase().replace(/\s/g, ''));
    return found?.logo_url || null;
  };

  const handleSelectPlan = (plan: Plan) => {
    const price = billing === 'yearly' 
      ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * (1 - yearlyDiscount / 100))) 
      : (plan.price ?? 0);
    
    setCheckoutPlan(plan);
    setCheckoutPrice(price);
    setSelectedGateway(null);
    setTrxId('');
    setSenderNumber('');
    setCurrentView("checkout");
  };

  const handlePaymentSubmit = async () => {
    if (!selectedGateway || !checkoutPlan || !merchant) return;
    if (!trxId.trim()) { toast.error('Transaction ID is required.'); return; }
    if (selectedGateway.account_type !== 'corporate' && !senderNumber.trim()) { 
      toast.error('Sender number is required.'); 
      return; 
    }
    
    setSubmitting(true);
    try {
      const now = new Date();
      const expiresAt = billing === 'yearly' ?
        new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
        merchant_id: merchant.id, plan_id: checkoutPlan.id, billing_cycle: billing, amount_paid: checkoutPrice,
        currency: 'BDT', status: 'pending', started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
        next_billing_at: expiresAt.toISOString(), payment_method: selectedGateway.provider, payment_reference: trxId.trim(),
      }).select('*').single();
      
      if (subError) throw subError;

      await supabase.from('admin_orders').insert({
        merchant_id: merchant.id, plan_id: checkoutPlan.id, subscription_id: newSub?.id, order_no: orderNo,
        amount: checkoutPrice, currency: 'BDT', billing_cycle: billing, payment_method: selectedGateway.provider,
        payment_reference: trxId.trim(), gateway_used: selectedGateway.provider, status: 'pending',
        sender_number: senderNumber.trim() || null, notes: `Gateway: ${selectedGateway.provider_name} | Account: ${selectedGateway.account_number}`,
      });

      setCurrentView("pending_view");
      load();
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const days = daysLeft(subscription?.expires_at || null);
  const isActive = subscription?.status === 'active';
  const canDowngradeDays = days !== null && days <= 3;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-blue-600" />
    </div>
  );

  // ── VIEW: SECURE CHECKOUT (Fully dynamic with adminGateways mapping) ───
  if (currentView === "checkout" && checkoutPlan) {
    // Separate local and global gateways
    const localProviders = ['bkash', 'nagad', 'rocket', 'upay'];
    const bdLocalGateways = adminGateways.filter(g => localProviders.includes(g.provider.toLowerCase()));
    const globalGateways = adminGateways.filter(g => !localProviders.includes(g.provider.toLowerCase()));

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 md:p-0 max-w-6xl mx-auto">
        <button onClick={() => setCurrentView("billing")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Billing
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Checkout</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Select a provider from your database to complete the payment.</p>
                
              {/* Payment Method Radio Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="size-4 text-slate-400" />
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select Provider</label>
                </div>

                <div className="space-y-3">
                  {/* Mapping local DB gateways */}
                  {bdLocalGateways.map((gw) => {
                    const logoUrl = getLogoUrl(gw.provider);
                    const isSelected = selectedGateway?.id === gw.id;
                    return (
                      <div 
                        key={gw.id} 
                        onClick={() => setSelectedGateway(gw)}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-300"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                          {logoUrl ? <img src={logoUrl} alt={gw.provider_name} className="w-8 h-8 object-contain" /> : <span className="text-xl">{METHOD_ICONS[gw.provider] || '💳'}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-slate-900 dark:text-white">{gw.provider_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{gw.account_type} Account</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mapping Global DB Gateways */}
                {globalGateways.length > 0 && (
                   <div className="space-y-3 mt-6">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Bank / Global Payment</h4>
                      {globalGateways.map((gw) => {
                        const isSelected = selectedGateway?.id === gw.id;
                        return (
                          <div key={gw.id} onClick={() => setSelectedGateway(gw)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 shrink-0">
                              <span className="text-xl">{METHOD_ICONS[gw.provider] || '🏦'}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-base text-slate-900 dark:text-white">{gw.provider_name}</p>
                              <p className="text-xs text-slate-500 capitalize">{gw.account_type}</p>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                )}
              </div>

              {/* Payment Details Input Fields */}
              {selectedGateway && (
                <div className="mt-8 space-y-4 p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Payment To</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedGateway.provider_name}</p>
                      <p className="text-2xl font-mono font-black text-blue-600 tracking-wide mt-1">{selectedGateway.account_number}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Copied!'); }} className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 rounded-lg text-xs font-bold hover:text-blue-600 shadow-sm flex items-center gap-1.5">
                      <Copy size={14} /> Copy
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 pt-2">
                    {selectedGateway.account_type !== 'corporate' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sender Number *</label>
                        <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Transaction ID *</label>
                      <input value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="8N7AB23KC1" className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-mono uppercase" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><span className="font-bold text-slate-900 dark:text-white">{checkoutPlan.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Cycle</span><span className="font-bold text-slate-900 dark:text-white capitalize">{billing}</span></div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />
              <div className="flex items-center justify-between mb-8">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-blue-600">{fmtBDT(checkoutPrice)}</span>
              </div>
              <button onClick={handlePaymentSubmit} disabled={submitting || !selectedGateway || !trxId.trim()} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="animate-spin size-4" /> : <Shield className="size-4" />} Complete Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: PENDING SCREEN ───────────
  if (currentView === "pending_view") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={40} className="text-amber-500" /></div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Verification Pending</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">Your transaction is under review and will be activated shortly.</p>
          <button onClick={() => setCurrentView("billing")} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // ── MAIN BILLING DASHBOARD ────────
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Toaster position="top-center" richColors />
        
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CreditCard className="size-8 text-blue-600" /> Billing & Subscription
        </h1>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1"><Crown className="size-5 text-blue-600" /> Current Plan: {currentPlan?.name || 'Free Tier'}</h2>
            <p className="text-sm text-slate-500">Renews on <span className="font-bold text-slate-700 dark:text-slate-300">{fmtDate(subscription?.expires_at || null)}</span></p>
          </div>
          <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {isActive ? "Active" : "Free / Expired"}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid This Cycle</p>
            <span className="text-4xl font-black text-blue-600">{fmtBDT(subscription?.amount_paid || 0)}</span>
            
            {canDowngradeDays && (
              <div className="mt-6 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 text-amber-700">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium">Downgrade available (expiry within 3 days).</p>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Live Usage Overview</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {currentPlan && merchant ? (
                <>
                  {/* Real Usage Mapped from your exact logic */}
                  <CustomUsageBar label="Transactions" used={merchant.transaction_count} limit={currentPlan.transaction_limit_monthly} />
                  <CustomUsageBar label="Businesses" used={merchant.business_count} limit={currentPlan.business_limit} />
                  <CustomUsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan.allowed_team_members} />
                  <CustomUsageBar label="Devices" used={merchant.device_count} limit={currentPlan.device_limit} />
                </>
              ) : (
                <p className="text-sm text-slate-500">Select a plan to view usage limits.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid mapped from allPlans */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade Your Plan</h2>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-lg text-sm font-bold ${billing === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${billing === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Yearly <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md uppercase">Save {yearlyDiscount}%</span></button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {allPlans.map(plan => {
            const isCurrentPlan = currentPlan?.id === plan.id && isActive;
            const isDowngrade = plan.serial < (currentPlan?.serial ?? 0);
            const isFreePlan = (plan.price ?? 0) === 0;
            const targetedPrice = billing === 'yearly' ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * (1 - yearlyDiscount / 100))) : (plan.price ?? 0);

            const tagParts = plan.tag ? plan.tag.split(':') : [];
            const tagLabel = tagParts[0] || null;
            const theme = getColorTheme(tagParts[1] || 'blue');
            const methods = Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile'];
            const methodLabels: Record<string, string> = { mobile: 'Mobile Banking', bank: 'Bank Transfer', crypto: 'Crypto', international: 'International' };

            return (
              <div key={plan.id} className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 bg-white dark:bg-[#111827] border-2 ${isCurrentPlan ? `border-blue-600 ring-4 ring-blue-600/10 shadow-xl scale-[1.02]` : tagLabel ? theme.border : "border-slate-200 dark:border-slate-800"}`}>
                
                {tagLabel && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.bg} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md`}>
                    {tagLabel}
                  </div>
                )}

                <div className="text-center pt-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-black ${isCurrentPlan ? 'text-blue-600' : theme.text}`}>{fmtBDT(targetedPrice)}</span>
                    <span className="text-sm font-medium text-slate-400">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>{plan.transaction_limit_monthly === 0 ? 'Unlimited transactions' : `${plan.transaction_limit_monthly.toLocaleString()} Tx / month`}</span></li>
                  <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>{plan.business_limit} Workspaces</span></li>
                  {plan.is_team_allowed && <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>Up to {plan.allowed_team_members} Team Members</span></li>}
                  <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>{plan.device_limit} Devices</span></li>
                  {plan.allowed_telegram_group && <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>Telegram Alerts</span></li>}
                  {plan.is_custom_bot_allowed && <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>Custom API Bot</span></li>}
                  {methods.map((m: string) => <li key={m} className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text} shrink-0 mt-0.5`} /> <span>{methodLabels[m] || m} Allowed</span></li>)}
                </ul>

                <div>
                  {isCurrentPlan ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200" disabled>Current Active Plan</button>
                  ) : isFreePlan ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200" disabled>Free Tier</button>
                  ) : (isDowngrade && !canDowngradeDays) ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200" disabled>Downgrade Locked</button>
                  ) : (
                    <button className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg ${theme.bg} ${theme.hover} transition-all`} onClick={() => handleSelectPlan(plan)}>
                      {isDowngrade ? 'Downgrade' : 'Select Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Table mapped from Database */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><History className="size-5 text-blue-600" /> Payment History</h2>
        </div>
        
        {orderHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-400"><History size={40} className="mx-auto opacity-30 mb-3" /><p className="text-sm font-bold">No history available</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Cycle</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-[#0B1120]/50">
                    <td className="px-6 py-4 font-mono text-sm font-bold">{order.order_no}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{fmtDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{order.billing_cycle}</td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">{fmtBDT(order.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}