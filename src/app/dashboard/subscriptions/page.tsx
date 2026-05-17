'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, Loader2, ArrowLeft, 
  Shield, Copy, Info, History, Lock, Crown, Download, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';
import { downloadInvoice } from '@/lib/pdfGenerator';

// ── Types (Strictly matched with your SQL Schema) ──
type Plan = { id: string; name: string; price: number; yearly_price: number | null; serial: number; tag: string | null; transaction_limit_monthly: number; business_limit: number; allowed_method: any; is_team_allowed: boolean; allowed_team_members: number; device_limit: number; allowed_telegram_group: boolean; is_custom_bot_allowed: boolean; };
type Subscription = { id: string; plan_id: string; billing_cycle: string; amount_paid: number; status: string; expires_at: string | null; };
type AdminGateway = { id: string; provider: string; provider_name: string; account_number: string; account_type: string; };
type AdminOrder = { id: string; order_no: string; amount: number; billing_cycle: string; payment_method: string; payment_reference: string; status: string; created_at: string; };
type Merchant = { id: string; plan_id: string; business_count: number; transaction_count: number; team_member_count: number; device_count: number; };

const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const METHOD_ICONS: Record<string, string> = { bkash: '💜', nagad: '🟠', rocket: '🟣', upay: '🟡', bank: '🏦' };

const getColorTheme = (colorName: string) => {
  const themes: Record<string, any> = {
    blue: { border: 'border-blue-600', bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-700' },
    emerald: { border: 'border-emerald-600', bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-700' },
    purple: { border: 'border-purple-600', bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-700' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-500', hover: 'hover:bg-amber-600' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-500', hover: 'hover:bg-orange-600' },
  };
  return themes[colorName?.toLowerCase()] || themes.blue;
};

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
        <span className="text-slate-600 dark:text-slate-400 font-bold">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {displayUsed} / {displayLimit} {!isUnlimited && <span className="text-slate-400 dark:text-slate-500 text-xs ml-1 font-medium">({Math.round(percentage)}%)</span>}
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

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderHistory, setOrderHistory] = useState<AdminOrder[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [adminGateways, setAdminGateways] = useState<AdminGateway[]>([]);
  const [paymentLogos, setPaymentLogos] = useState<any[]>([]);

  // View States
  const [currentView, setCurrentView] = useState<"billing" | "checkout" | "pending_view" | "success_view">("billing");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutPrice, setCheckoutPrice] = useState<number>(0);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Checkout States
  const [selectedGateway, setSelectedGateway] = useState<AdminGateway | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load Data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setAuthUser(user);

      // Strictly fetching ONLY actual columns based on your SQL
      const [plansRes, merchantRes, subRes, gatewaysRes, ordersRes, logosRes] = await Promise.all([
        supabase.from('plans').select('*').order('serial', { ascending: true }),
        supabase.from('merchants').select('*').eq('id', user.id).single(),
        supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('admin_gateways').select('*').eq('status', 'active'),
        supabase.from('admin_orders').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payment_logos').select('*'),
      ]);

      if (merchantRes.data) setMerchant(merchantRes.data);
      if (plansRes.data) setAllPlans(plansRes.data);
      if (subRes.data) setSubscription(subRes.data);
      if (gatewaysRes.data) setAdminGateways(gatewaysRes.data);
      if (ordersRes.data) setOrderHistory(ordersRes.data);
      if (logosRes.data) setPaymentLogos(logosRes.data);
      
      const activePlanId = subRes.data?.plan_id || merchantRes.data?.plan_id;
      if (activePlanId && plansRes.data) setCurrentPlan(plansRes.data.find((p: Plan) => p.id === activePlanId) || null);
    } catch (e: any) { 
      toast.error('Failed to load data. Please refresh.'); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Mobile Hardware Back Button Handling (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (currentView !== 'billing') {
        setCurrentView('billing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const switchView = (view: any) => {
    if (view !== 'billing') {
      window.history.pushState({ page: view }, '');
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCurrentView(view);
  };

  const handleSelectPlan = (plan: Plan) => {
    const price = billing === 'yearly' ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * 0.8)) : (plan.price ?? 0);
    setCheckoutPlan(plan);
    setCheckoutPrice(price);
    setSelectedGateway(null); setTrxId(''); setSenderNumber('');
    switchView("checkout");
  };

  // ── SECURE API VERIFICATION (Connects to your admin_sms_data logic) ──
  const handlePaymentSubmit = async () => {
    if (!merchant || !checkoutPlan) { toast.error("Data missing. Please refresh."); return; }
    if (!selectedGateway) { toast.error("Please select a payment provider."); return; }
    if (!trxId.trim()) { toast.error("Transaction ID is required!"); return; }
    if (selectedGateway.account_type !== 'corporate' && !senderNumber.trim()) { toast.error("Sender Number is required!"); return; }
    
    setSubmitting(true);

    try {
      // Calling your API v1 route
      const response = await fetch('/api/v1/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: merchant, 
          plan: checkoutPlan, 
          gateway: selectedGateway, 
          trxId, 
          senderNumber, 
          amount: checkoutPrice, 
          billingCycle: billing, 
          discountAmount: 0,
          userEmail: authUser?.email // Passing Auth Email for Invoice
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Verification failed! Please check your details.");
        setSubmitting(false);
        return;
      }

      setSuccessOrder(data.order);
      
      if (data.status === 'paid' || data.status === 'active') {
        toast.success("Payment Verified! Plan Activated.");
        switchView("success_view");
      } else {
        toast.success("Order Placed. Pending manual verification.");
        switchView("pending_view");
      }
      
      load(); // Reload to update UI
    } catch (e: any) {
      toast.error('Network error during submission. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStatuses = ['active', 'paid', 'verified'];
  const isActive = activeStatuses.includes(subscription?.status?.toLowerCase() || '');

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={36} className="animate-spin text-blue-600" /></div>;

  // ── SUCCESS VIEW (Beautiful Receipt) ──
  if (currentView === "success_view" && successOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500 p-4">
        <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">Payment Successful</h3>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">Your plan has been activated instantly.</p>
          
          <div className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-5 mb-8 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Order No</span><span className="font-bold text-slate-900 dark:text-white">{successOrder.order_no}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Plan</span><span className="font-bold text-slate-900 dark:text-white">{checkoutPlan?.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Amount Paid</span><span className="font-black text-blue-600 dark:text-blue-400">{fmtBDT(successOrder.amount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Transaction ID</span><span className="font-mono text-slate-900 dark:text-white">{successOrder.payment_reference}</span></div>
          </div>

          <div className="space-y-3">
            <button onClick={() => downloadInvoice(successOrder, { ...merchant, email: authUser?.email })} className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2">
              <Download size={18} /> Download Invoice
            </button>
            <button onClick={() => switchView("billing")} className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT VIEW (50/50 Grid & Dark Mode Inputs Fixed) ──
  if (currentView === "checkout" && checkoutPlan) {
    const localProviders = ['bkash', 'nagad', 'rocket', 'upay'];
    const bdLocalGateways = adminGateways.filter(g => localProviders.includes(g.provider.toLowerCase()));
    const globalGateways = adminGateways.filter(g => !localProviders.includes(g.provider.toLowerCase()));

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 md:p-0 max-w-6xl mx-auto">
        <button onClick={() => switchView("billing")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Billing
        </button>

        {/* 50/50 Layout for Desktop */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Side: Methods */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Checkout</h2>
              
              <div className="space-y-4 mt-6">
                <div className="space-y-3">
                  {bdLocalGateways.map((gw) => {
                    const isSelected = selectedGateway?.id === gw.id;
                    const logoUrl = paymentLogos.find(l => l.method_name.toLowerCase() === gw.provider.toLowerCase())?.logo_url;
                    return (
                      <div key={gw.id} onClick={() => setSelectedGateway(gw)} className={`flex items-center gap-3 md:gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shrink-0">
                          {logoUrl ? <img src={logoUrl} alt="" className="w-8 h-8 object-contain" /> : <span className="text-xl">💳</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base text-slate-900 dark:text-white truncate">{gw.provider_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{gw.account_type} Account</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {globalGateways.length > 0 && (
                   <div className="space-y-3 mt-6">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-2">Bank / Global Payment</h4>
                      {globalGateways.map((gw) => {
                        const isSelected = selectedGateway?.id === gw.id;
                        return (
                          <div key={gw.id} onClick={() => setSelectedGateway(gw)} className={`flex items-center gap-3 md:gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shrink-0"><span className="text-xl">🏦</span></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-base text-slate-900 dark:text-white truncate">{gw.provider_name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{gw.account_type}</p>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                )}
              </div>

              {/* Verified Input Fields (Dark Mode Handled Perfectly) */}
              {selectedGateway && (
                <div className="mt-8 space-y-4 p-5 md:p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Send Payment To</p>
                      <p className="text-sm md:text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">{selectedGateway.provider_name}</p>
                      <p className="text-lg md:text-2xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-wide mt-1 truncate">{selectedGateway.account_number}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Copied!'); }} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Copy</button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {selectedGateway.account_type !== 'corporate' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">Sender Number *</label>
                        <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="e.g. 01XXXXXXXXX" className="w-full px-4 py-3 bg-white dark:bg-[#111827] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">Transaction ID *</label>
                      <input value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 8N7AB23KC1" className="w-full px-4 py-3 bg-white dark:bg-[#111827] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 font-mono uppercase" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Plan</span><span className="font-bold text-slate-900 dark:text-white">{checkoutPlan.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Subtotal</span><span className="font-bold text-slate-900 dark:text-white">{fmtBDT(checkoutPrice)}</span></div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />
              <div className="flex items-center justify-between mb-8">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total Pay</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmtBDT(checkoutPrice)}</span>
              </div>
              <button onClick={handlePaymentSubmit} disabled={submitting || !selectedGateway || !trxId.trim()} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {submitting ? <Loader2 className="animate-spin size-4" /> : <Shield className="size-4" />} Verify & Purchase
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
      <div className="min-h-[70vh] flex items-center justify-center animate-in zoom-in-95 duration-500 p-4">
        <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={40} className="text-amber-500" /></div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Verification Pending</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">Your transaction is under review and will be activated shortly.</p>
          <button onClick={() => switchView("billing")} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // ── MAIN BILLING DASHBOARD ──
  return (
    <div className="w-full space-y-8 animate-in fade-in pb-10">
      <Toaster position="top-center" richColors />
        
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3"><CreditCard className="text-blue-600" /> Billing & Subscription</h1>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1"><Crown className="size-5 text-blue-600" /> Current Plan: {currentPlan?.name || 'Free Tier'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Renews on <span className="font-bold text-slate-700 dark:text-slate-300">{fmtDate(subscription?.expires_at || null)}</span></p>
          </div>
          <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            {isActive ? "Active" : "Free / Expired"}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid This Cycle</p>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{fmtBDT(subscription?.amount_paid || 0)}</span>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Live Usage Overview</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {currentPlan && merchant ? (
                <>
                  <CustomUsageBar label="Transactions" used={merchant.transaction_count} limit={currentPlan.transaction_limit_monthly} />
                  <CustomUsageBar label="Businesses" used={merchant.business_count} limit={currentPlan.business_limit} />
                  <CustomUsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan.allowed_team_members} />
                  <CustomUsageBar label="Devices" used={merchant.device_count} limit={currentPlan.device_limit} />
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Data not available for your current plan.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map(plan => {
          const isCurrentPlan = currentPlan?.id === plan.id && isActive;
          const theme = getColorTheme(plan.tag ? plan.tag.split(':')[1] : 'blue');
          const targetedPrice = billing === 'yearly' ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * 0.8)) : (plan.price ?? 0);

          return (
            <div key={plan.id} className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all border-2 bg-white dark:bg-[#111827] ${isCurrentPlan ? 'border-blue-600 shadow-xl' : theme.border}`}>
              {plan.tag && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.bg} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md`}>
                  {plan.tag.split(':')[0]}
                </div>
              )}
              <div className="text-center pt-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-black ${isCurrentPlan ? 'text-blue-600' : theme.text}`}>{fmtBDT(targetedPrice)}</span>
                  <span className="text-sm font-medium text-slate-400">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                </div>
              </div>
              <button className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg ${isCurrentPlan ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : theme.bg}`} onClick={() => !isCurrentPlan && handleSelectPlan(plan)}>
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><History className="size-5 text-blue-600" /> Payment History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-[#0B1120] text-[10px] font-bold text-slate-500 uppercase">
              <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orderHistory.map((order) => {
                 const orderIsActive = ['paid', 'active', 'verified'].includes(order.status.toLowerCase());
                 return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-[#0B1120]/50 text-slate-900 dark:text-white">
                    <td className="px-6 py-4 font-mono text-sm font-bold">{order.order_no}</td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600 dark:text-blue-400">{fmtBDT(order.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${orderIsActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => downloadInvoice(order, { ...merchant, email: authUser?.email })} className="inline-flex gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
