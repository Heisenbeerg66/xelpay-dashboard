'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, Loader2, ArrowLeft, 
  Shield, Copy, Info, History, Lock, Crown, Check
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

const METHOD_ICONS: Record<string, string> = {
  bkash: '💜', nagad: '🟠', rocket: '🟣', upay: '🟡', bank: '🏦',
};

// ── Usage Bar Component (Custom Tailwind) ─────────────────────
function CustomUsageBar({ label, used = 0, limit = 0 }: { label: string, used: number, limit: number }) {
  const isUnlimited = limit === 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const displayLimit = isUnlimited ? 'Unlimited' : limit.toLocaleString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {used.toLocaleString()} / {displayLimit} {!isUnlimited && <span className="text-slate-400 text-xs ml-1 font-medium">({Math.round(percentage)}%)</span>}
        </span>
      </div>
      <div className={`h-2.5 w-full rounded-full overflow-hidden ${isUnlimited ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
         <div 
           className={`h-full rounded-full transition-all duration-500 ${isUnlimited ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'}`} 
           style={{ width: isUnlimited ? '100%' : `${percentage}%` }} 
         />
      </div>
    </div>
  );
}

// ── Main Page Layout ──────────────────────────────────────────
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

  // ── VIEW: SECURE CHECKOUT (Android Selection Style) ───
  if (currentView === "checkout" && checkoutPlan) {
    const localProviders = ['bkash', 'nagad', 'rocket', 'upay'];
    const bdLocalGateways = adminGateways.filter(g => localProviders.includes(g.provider.toLowerCase()));
    const globalGateways = adminGateways.filter(g => !localProviders.includes(g.provider.toLowerCase()));

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 md:p-0">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setCurrentView("billing")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Billing
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Checkout</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Complete your purchase securely. All transactions are manually audited.</p>
                  
                {/* Android Style Radio Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="size-4 text-slate-400" />
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select Provider</label>
                  </div>

                  <div className="space-y-3">
                    {bdLocalGateways.map((gw) => {
                      const logoUrl = getLogoUrl(gw.provider);
                      const isSelected = selectedGateway?.id === gw.id;
                      return (
                        <label key={gw.id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-300 dark:hover:border-blue-800/50"}`}>
                          {/* Android Radio Circle */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                          </div>

                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                            {logoUrl ? <img src={logoUrl} alt={gw.provider_name} className="w-8 h-8 object-contain" /> : <span className="text-xl">{METHOD_ICONS[gw.provider] || '💳'}</span>}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-bold text-base text-slate-900 dark:text-white">{gw.provider_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{gw.account_type} Account</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Details Input Fields */}
                {selectedGateway && (
                  <div className="mt-8 space-y-4 p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Payment To</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedGateway.provider_name} ({selectedGateway.account_type})</p>
                        <p className="text-2xl font-mono font-black text-blue-600 tracking-wide mt-1">{selectedGateway.account_number}</p>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Account number copied!'); }} className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:text-blue-600 transition-colors shadow-sm">
                        <Copy size={14} /> Copy
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 pt-2">
                      {selectedGateway.account_type !== 'corporate' && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Sender Wallet Number *</label>
                          <input type="tel" placeholder="e.g. 01XXXXXXXXX" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white font-medium" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Transaction ID / Reference *</label>
                        <input placeholder="e.g. 8N7AB23KC1" value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-mono uppercase font-bold text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Invoice Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Plan Selected</span>
                    <span className="font-bold text-slate-900 dark:text-white">{checkoutPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Billing Cycle</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{billing}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />

                <div className="flex items-center justify-between mb-8">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="text-2xl font-black text-blue-600">{fmtBDT(checkoutPrice)}</span>
                </div>

                {/* XelPay Standard Primary Button */}
                <button 
                  onClick={handlePaymentSubmit} 
                  disabled={submitting || !selectedGateway || !trxId.trim()}
                  className="w-full bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {submitting ? <><Loader2 className="size-4 animate-spin" /> Verifying...</> : <><Shield className="size-4" /> Complete Purchase</>}
                </button>

                <p className="text-xs text-center text-slate-400 mt-4 font-medium leading-relaxed">
                  By completing this purchase, your transaction will be securely audited.
                </p>
              </div>
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
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Verification Pending</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            Your transaction has been submitted and is under manual audit. Features will activate shortly.
          </p>
          <button onClick={() => setCurrentView("billing")} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── VIEW: MAIN BILLING DASHBOARD ────────
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />
        
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Billing & Subscription</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your active plan, view usage, and track payment history.</p>
      </div>

      {/* Current Plan Status & Live Metrics Layout */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-[#111827] dark:to-blue-900/10 rounded-3xl p-6 md:p-8 border border-blue-100 dark:border-blue-900/30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Crown className="size-5 text-blue-600" /> Current Plan: {currentPlan?.name || 'Free Tier'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Subscription renews on <span className="font-bold text-slate-700 dark:text-slate-300">{fmtDate(subscription?.expires_at || null)}</span>
            </p>
          </div>
          <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}>
            {isActive ? "Active" : "Free / Expired"}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid This Cycle</p>
            <span className="text-4xl font-black text-blue-600">{fmtBDT(subscription?.amount_paid || 0)}</span>
            
            {canDowngradeDays && (
              <div className="mt-6 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium">Downgrade is available as your subscription expires within 3 days.</p>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Live Usage Overview</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {currentPlan && merchant ? (
                <>
                  <CustomUsageBar label="Monthly Transactions" used={merchant.transaction_count} limit={currentPlan.transaction_limit_monthly} />
                  <CustomUsageBar label="Registered Businesses" used={merchant.business_count} limit={currentPlan.business_limit} />
                  <CustomUsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan.allowed_team_members} />
                  <CustomUsageBar label="Connected Devices" used={merchant.device_count} limit={currentPlan.device_limit} />
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a plan to view usage limits.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade / Pricing Strategy Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade Your Plan</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Scale your automation with advanced features.</p>
          </div>

          {/* Perfected Monthly/Yearly Toggle UI */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg transition-all text-sm font-bold ${
                billing === "monthly"
                  ? "bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg transition-all text-sm font-bold flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Yearly
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                Save {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {allPlans.map(plan => {
            const isCurrentPlan = currentPlan?.id === plan.id && isActive;
            const isDowngrade = plan.serial < (currentPlan?.serial ?? 0);
            const isFreePlan = (plan.price ?? 0) === 0;

            const monthlyPrice = plan.price ?? 0;
            const yearlyPrice = plan.yearly_price ?? Math.round(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
            const targetedPrice = billing === 'yearly' ? yearlyPrice : monthlyPrice;

            const methods = Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile'];
            const methodLabels: Record<string, string> = { mobile: 'Mobile Wallets', bank: 'Bank Transfer', crypto: 'Crypto Terminal' };

            return (
              <div key={plan.id} className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 bg-white dark:bg-[#111827] ${isCurrentPlan ? "border-2 border-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]" : "border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-800"}`}>
                
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    {plan.tag.split(':')[0]}
                  </div>
                )}

                <div className="text-center pt-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-blue-600">{fmtBDT(targetedPrice)}</span>
                    <span className="text-sm font-medium text-slate-400">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>{plan.transaction_limit_monthly === 0 ? 'Unlimited transactions' : `${plan.transaction_limit_monthly.toLocaleString()} Transactions / month`}</span></li>
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>{plan.business_limit} Workspaces Allowed</span></li>
                  {plan.is_team_allowed && <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>Up to {plan.allowed_team_members} Team Members</span></li>}
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>{plan.device_limit} Devices Allowed</span></li>
                  {plan.allowed_telegram_group && <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>Telegram Alerts</span></li>}
                  {plan.is_custom_bot_allowed && <li className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>Custom API Bot Integration</span></li>}
                  {methods.map((m: string) => <li key={m} className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>{methodLabels[m] || m} Allowed</span></li>)}
                </ul>

                <div>
                  {isCurrentPlan ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700" disabled>Current Active Plan</button>
                  ) : isFreePlan ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700" disabled>Free Tier</button>
                  ) : (isDowngrade && !canDowngradeDays) ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700" disabled>Downgrade Locked</button>
                  ) : (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" onClick={() => handleSelectPlan(plan)}>
                      {isDowngrade ? 'Downgrade' : 'Upgrade Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="size-5 text-blue-600" /> Payment History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your past invoices and subscription receipts.</p>
        </div>
        
        {orderHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-600">
            <History size={40} className="mx-auto opacity-30 mb-3" />
            <p className="text-sm font-bold">No history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Cycle</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-[#0B1120]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900 dark:text-white">{order.order_no}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{fmtDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{order.billing_cycle}</td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600">{fmtBDT(order.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'paid' || order.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
                        {order.status}
                      </span>
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