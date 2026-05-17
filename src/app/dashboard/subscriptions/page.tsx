'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, Clock, Loader2, ArrowLeft, 
  Shield, Copy, Info, History, Lock, Crown, Download, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';
import { downloadInvoice } from '@/lib/pdfGenerator'; // PDF Helper Import

// ── Types ──
type Plan = { id: string; name: string; price: number; yearly_price: number | null; serial: number; tag: string | null; features: any; transaction_limit_monthly: number; business_limit: number; allowed_method: any; is_team_allowed: boolean; allowed_team_members: number; device_limit: number; allowed_telegram_group: boolean; is_custom_bot_allowed: boolean; };
type Subscription = { id: string; plan_id: string; billing_cycle: string; amount_paid: number; status: string; started_at: string; expires_at: string | null; payment_method: string | null; payment_reference: string | null; };
type AdminGateway = { id: string; provider: string; provider_name: string; account_number: string; account_type: string; branch_name: string | null; };
type AdminOrder = { id: string; order_no: string; amount: number; billing_cycle: string; payment_method: string; payment_reference: string; status: string; created_at: string; plan_id: string; sender_number: string | null; };
type Merchant = { id: string; plan_id: string; business_count: number; transaction_count: number; team_member_count: number; device_count: number; business_name?: string; email?: string; };

// ── Helpers ──
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const daysLeft = (exp: string | null) => { if (!exp) return null; return Math.max(0, Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000)); };

const METHOD_ICONS: Record<string, string> = { bkash: '💜', nagad: '🟠', rocket: '🟣', upay: '🟡', bank: '🏦' };

// ── Theme Generator (Added Orange) ──
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

// ── Usage Bar Component ──
function CustomUsageBar({ label, used = 0, limit = 0 }: { label: string, used: number, limit: number }) {
  const isUnlimited = limit === 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {used.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()} {!isUnlimited && <span className="text-slate-400 text-xs ml-1">({Math.round(percentage)}%)</span>}
        </span>
      </div>
      <div className={`h-2.5 w-full rounded-full overflow-hidden ${isUnlimited ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
         <div className={`h-full rounded-full transition-all duration-500 ${isUnlimited ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'}`} style={{ width: isUnlimited ? '100%' : `${percentage}%` }} />
      </div>
    </div>
  );
}

// ── Main Page Component ──
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
  const [paymentLogos, setPaymentLogos] = useState<any[]>([]);

  // View States
  const [currentView, setCurrentView] = useState<"billing" | "checkout" | "pending_view">("billing");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutPrice, setCheckoutPrice] = useState<number>(0);

  // Checkout States
  const [selectedGateway, setSelectedGateway] = useState<AdminGateway | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansRes, merchantRes, subRes, settingsRes, gatewaysRes, ordersRes, logosRes] = await Promise.all([
        supabase.from('plans').select('*').order('serial', { ascending: true }),
        supabase.from('merchants').select('*, business_name, email').eq('id', user.id).single(),
        supabase.from('merchant_subscriptions').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('site_settings').select('key_name, value').eq('key_name', 'subscription_discount_yearly').maybeSingle(),
        supabase.from('admin_gateways').select('*').eq('status', 'active'),
        supabase.from('admin_orders').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false }),
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
      let userPlan = plansRes.data?.find((p: Plan) => p.id === activePlanId);
      if (!userPlan && plansRes.data) userPlan = plansRes.data[0]; // Fallback if no plan
      setCurrentPlan(userPlan || null);

    } catch (e: any) { 
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSelectPlan = (plan: Plan) => {
    const price = billing === 'yearly' ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * (1 - yearlyDiscount / 100))) : (plan.price ?? 0);
    setCheckoutPlan(plan);
    setCheckoutPrice(price);
    setSelectedGateway(null);
    setTrxId(''); setSenderNumber(''); setPromoCode(''); setDiscountAmount(0);
    setCurrentView("checkout");
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'XELPAY') {
      const discount = checkoutPrice * 0.10; // 10% Discount
      setDiscountAmount(discount);
      toast.success("Promo code applied! 10% off.");
    } else {
      setDiscountAmount(0);
      toast.error("Invalid promo code.");
    }
  };

  // ── Database Store & TRX Verification Logic ──
  const handlePaymentSubmit = async () => {
    if (!selectedGateway) { toast.error("Please select a payment provider."); return; }
    if (!trxId.trim()) { toast.error("Transaction ID is required."); return; }
    if (selectedGateway.account_type !== 'corporate' && !senderNumber.trim()) { toast.error("Sender number is required."); return; }
    if (!checkoutPlan || !merchant) return;
    
    setSubmitting(true);
    const finalAmount = checkoutPrice - discountAmount;
    let paymentStatus = 'pending';

    try {
      // ১. ডুপ্লিকেট অর্ডার চেক
      const { data: duplicateOrder } = await supabase.from('admin_orders').select('id').eq('payment_reference', trxId.trim()).single();
      if (duplicateOrder) {
        toast.error("Duplicate Transaction ID! This TRX is already used.");
        setSubmitting(false); return;
      }

      // ২. SMS Data Verification
      const { data: smsData } = await supabase.from('admin_sms_data').select('*').eq('trx_id', trxId.trim()).single();
      
      if (smsData) {
        if (smsData.is_used) {
          toast.error("This Transaction ID is already claimed!");
          setSubmitting(false); return;
        }
        if (Number(smsData.amount) < finalAmount) {
          toast.error(`Transaction amount (${smsData.amount}) is less than required (${finalAmount})!`);
          setSubmitting(false); return;
        }
        if (selectedGateway.account_type !== 'corporate' && smsData.sender_number && !smsData.sender_number.includes(senderNumber.trim())) {
           toast.error("Sender number does not match with our records!");
           setSubmitting(false); return;
        }

        // Verification Success: Mark used & auto active
        await supabase.from('admin_sms_data').update({ is_used: true }).eq('id', smsData.id);
        paymentStatus = 'active';
      }

      const now = new Date();
      const expiresAt = billing === 'yearly' ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

      // Insert Subscription
      const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
        merchant_id: merchant.id, plan_id: checkoutPlan.id, billing_cycle: billing, amount_paid: finalAmount,
        currency: 'BDT', status: paymentStatus, started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
        next_billing_at: expiresAt.toISOString(), payment_method: selectedGateway.provider, payment_reference: trxId.trim(),
      }).select('*').single();
      if (subError) throw subError;

      // Insert Order History
      const { error: orderError } = await supabase.from('admin_orders').insert({
        merchant_id: merchant.id, plan_id: checkoutPlan.id, subscription_id: newSub?.id, order_no: orderNo,
        amount: finalAmount, currency: 'BDT', billing_cycle: billing, payment_method: selectedGateway.provider,
        payment_reference: trxId.trim(), gateway_used: selectedGateway.provider, status: paymentStatus === 'active' ? 'paid' : 'pending',
        sender_number: senderNumber.trim() || null, notes: `Promo: ${promoCode || 'None'}`
      });
      if (orderError) throw orderError;

      // Update Merchant Plan if Active
      if (paymentStatus === 'active') {
        await supabase.from('merchants').update({ plan_id: checkoutPlan.id }).eq('id', merchant.id);
        toast.success("Payment Verified! Plan Activated.");
      } else {
        toast.success("Order Placed. Pending manual verification.");
      }

      setCurrentView("pending_view");
      load();
    } catch (e: any) {
      toast.error('Submission failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={36} className="animate-spin text-blue-600" /></div>;

  const isActive = subscription?.status === 'active';
  const finalPayable = checkoutPrice - discountAmount;

  // ── SECURE CHECKOUT VIEW ──
  if (currentView === "checkout" && checkoutPlan) {
    const bdLocalGateways = adminGateways.filter(g => ['bkash', 'nagad', 'rocket', 'upay'].includes(g.provider.toLowerCase()));
    
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 md:p-0 max-w-6xl mx-auto">
        <button onClick={() => setCurrentView("billing")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Billing
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Checkout</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Select a provider to instantly verify your payment.</p>
                
              <div className="space-y-4">
                <div className="space-y-3">
                  {bdLocalGateways.map((gw) => {
                    const isSelected = selectedGateway?.id === gw.id;
                    const logoUrl = paymentLogos.find(l => l.method_name.toLowerCase() === gw.provider.toLowerCase())?.logo_url;
                    return (
                      <div key={gw.id} onClick={() => setSelectedGateway(gw)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-300"}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] border border-slate-100 overflow-hidden shrink-0">
                          {logoUrl ? <img src={logoUrl} alt={gw.provider_name} className="w-8 h-8 object-contain" /> : <span className="text-xl">{METHOD_ICONS[gw.provider] || '💳'}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-slate-900 dark:text-white">{gw.provider_name}</p>
                          <p className="text-xs text-slate-500 capitalize">{gw.account_type} Account</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedGateway && (
                <div className="mt-8 space-y-4 p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Payment To</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedGateway.provider_name}</p>
                      <p className="text-2xl font-mono font-black text-blue-600 tracking-wide mt-1">{selectedGateway.account_number}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Copied!'); }} className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:text-blue-600">
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
              <div className="space-y-4 mb-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><span className="font-bold text-slate-900 dark:text-white">{checkoutPlan.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Cycle</span><span className="font-bold text-slate-900 dark:text-white capitalize">{billing}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-900 dark:text-white">{fmtBDT(checkoutPrice)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-{fmtBDT(discountAmount)}</span></div>}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Promo Code" className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent outline-none focus:border-blue-500" />
                <button onClick={handleApplyPromo} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold">Apply</button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />
              <div className="flex items-center justify-between mb-8">
                <span className="text-base font-bold text-slate-900 dark:text-white">Payable</span>
                <span className="text-2xl font-black text-blue-600">{fmtBDT(finalPayable)}</span>
              </div>

              <button onClick={handlePaymentSubmit} disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                {submitting ? <Loader2 className="animate-spin size-4" /> : <Shield className="size-4" />} Complete Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD VIEW ──
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Toaster position="top-center" richColors />
      <div><h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><CreditCard className="size-8 text-blue-600" /> Billing & Subscription</h1></div>

      {/* Usages Card (Fixed null checking) */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-[#111827] dark:to-blue-900/10 rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm">
        <div className="flex justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Crown className="size-5 text-blue-600" /> Current Plan: {currentPlan?.name || 'Free'}</h2>
            <p className="text-sm text-slate-500 mt-1">Renews on <span className="font-bold">{fmtDate(subscription?.expires_at || null)}</span></p>
          </div>
          <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {isActive ? "Active" : "Free / Expired"}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-slate-100 pr-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid This Cycle</p>
            <span className="text-4xl font-black text-blue-600">{fmtBDT(subscription?.amount_paid || 0)}</span>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Live Usage Overview</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {merchant ? (
                <>
                  <CustomUsageBar label="Transactions" used={merchant.transaction_count} limit={currentPlan?.transaction_limit_monthly || 0} />
                  <CustomUsageBar label="Businesses" used={merchant.business_count} limit={currentPlan?.business_limit || 0} />
                  <CustomUsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan?.allowed_team_members || 0} />
                  <CustomUsageBar label="Devices" used={merchant.device_count} limit={currentPlan?.device_limit || 0} />
                </>
              ) : <Loader2 className="animate-spin text-blue-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map(plan => {
          const isCurrentPlan = currentPlan?.id === plan.id && isActive;
          const theme = getColorTheme(plan.tag ? plan.tag.split(':')[1] : 'blue');
          const targetedPrice = billing === 'yearly' ? (plan.yearly_price ?? Math.round((plan.price ?? 0) * 12 * (1 - yearlyDiscount / 100))) : (plan.price ?? 0);

          return (
            <div key={plan.id} className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all border-2 bg-white dark:bg-[#111827] ${isCurrentPlan ? 'border-blue-600 shadow-xl' : theme.border}`}>
              {plan.tag && <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.bg} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>{plan.tag.split(':')[0]}</div>}
              
              <div className="text-center pt-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-black ${isCurrentPlan ? 'text-blue-600' : theme.text}`}>{fmtBDT(targetedPrice)}</span>
                  <span className="text-sm font-medium text-slate-400">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text}`} /> <span>{plan.transaction_limit_monthly === 0 ? 'Unlimited transactions' : `${plan.transaction_limit_monthly} Tx / month`}</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle size={18} className={`${theme.text}`} /> <span>{plan.business_limit} Workspaces</span></li>
              </ul>

              <button className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg ${isCurrentPlan ? 'bg-slate-300 cursor-not-allowed' : theme.bg}`} onClick={() => !isCurrentPlan && handleSelectPlan(plan)}>
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="text-xl font-bold flex items-center gap-2"><History className="size-5 text-blue-600" /> Payment History</h2></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
            <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderHistory.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">{order.order_no}</td>
                <td className="px-6 py-4 text-sm font-black text-blue-600">{fmtBDT(order.amount)}</td>
                <td className="px-6 py-4 text-center"><span className="text-[10px] font-bold uppercase">{order.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => downloadInvoice(order, merchant)} className="inline-flex gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50">
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}