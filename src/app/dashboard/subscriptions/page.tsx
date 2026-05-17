'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Check, Clock, Loader2, X, ChevronRight, 
  Shield, Copy, ArrowLeft, History, Smartphone, Building2, Globe, Bitcoin, Tag, Lock, Crown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';

// Shadcn UI Components 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

// ── Usage Bar Component (Repomix Style) ───────────────────────
function CustomUsageBar({ label, used = 0, limit = 0 }: { label: string, used: number, limit: number }) {
  const isUnlimited = limit === 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const displayLimit = isUnlimited ? 'Unlimited' : limit.toLocaleString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used.toLocaleString()} / {displayLimit} {!isUnlimited && `(${Math.round(percentage)}%)`}
        </span>
      </div>
      <Progress value={isUnlimited ? 100 : percentage} className={isUnlimited ? "opacity-40" : ""} />
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
      <Loader2 size={36} className="animate-spin text-primary" />
    </div>
  );

  // ── VIEW: SECURE CHECKOUT ───
  if (currentView === "checkout" && checkoutPlan) {
    const localProviders = ['bkash', 'nagad', 'rocket', 'upay'];
    const bdLocalGateways = adminGateways.filter(g => localProviders.includes(g.provider.toLowerCase()));
    const globalGateways = adminGateways.filter(g => !localProviders.includes(g.provider.toLowerCase()));

    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => setCurrentView("billing")} className="mb-6 -ml-4">
            <ArrowLeft className="size-4 mr-2" /> Back to Billing
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Secure Checkout</CardTitle>
                  <CardDescription>Complete your purchase securely. All transactions are encrypted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Android Style Radio Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="size-4 text-muted-foreground" />
                      <Label className="text-base font-semibold">Select Payment Provider</Label>
                    </div>

                    <RadioGroup 
                      value={selectedGateway?.id || ""} 
                      onValueChange={(id) => setSelectedGateway(adminGateways.find(g => g.id === id) || null)}
                    >
                      {bdLocalGateways.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Local Mobile Wallet
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Popular</Badge>
                          </h4>
                          {bdLocalGateways.map((gw) => {
                            const logoUrl = getLogoUrl(gw.provider);
                            const isSelected = selectedGateway?.id === gw.id;
                            return (
                              <label key={gw.id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                                <RadioGroupItem value={gw.id} id={gw.id} />
                                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-background border overflow-hidden shrink-0">
                                  {logoUrl ? <img src={logoUrl} alt={gw.provider_name} className="w-8 h-8 object-contain" /> : <span className="text-xl">{METHOD_ICONS[gw.provider] || '💳'}</span>}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{gw.provider_name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{gw.account_type} Account</p>
                                </div>
                                {isSelected && <Check className="size-5 text-primary" />}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {globalGateways.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Global/Bank Payment Methods</h4>
                          {globalGateways.map((gw) => {
                            const isSelected = selectedGateway?.id === gw.id;
                            return (
                              <label key={gw.id} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                                <RadioGroupItem value={gw.id} id={gw.id} />
                                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-background border shrink-0">
                                  <span className="text-xl">{METHOD_ICONS[gw.provider] || '🏦'}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{gw.provider_name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{gw.account_type}</p>
                                </div>
                                {isSelected && <Check className="size-5 text-primary" />}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  {/* Payment Details Input Fields */}
                  {selectedGateway && (
                    <div className="space-y-4 p-5 bg-muted/50 rounded-xl border border-dashed">
                      <div className="flex justify-between items-start border-b pb-3 mb-2">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Send Payment To</p>
                          <p className="text-base font-bold mt-0.5">{selectedGateway.provider_name} ({selectedGateway.account_type})</p>
                          <p className="text-lg font-mono font-bold text-primary tracking-wide mt-1">{selectedGateway.account_number}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { navigator.clipboard.writeText(selectedGateway.account_number); toast.success('Account number copied!'); }}>
                          <Copy className="size-3.5 mr-1" /> Copy
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        {selectedGateway.account_type !== 'corporate' && (
                          <div className="space-y-2">
                            <Label htmlFor="senderNum">Sender Wallet Number *</Label>
                            <Input id="senderNum" type="tel" placeholder="e.g. 01XXXXXXXXX" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} className="bg-background" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="transactionId">Transaction ID / Reference *</Label>
                          <Input id="transactionId" placeholder="e.g. 8N7AB23KC1" className="font-mono uppercase font-bold bg-background" value={trxId} onChange={e => setTrxId(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Shield className="size-3.5" /> <span>Secure SSL Encrypted Payment</span></div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5"><Lock className="size-3.5" /> <span>Manual Audit Verified</span></div>
              </div>
            </div>

            {/* Order Invoice Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">{checkoutPlan.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Billing</span>
                        <span className="font-medium capitalize">{billing}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold">{fmtBDT(checkoutPrice)}</span>
                    </div>
                  </div>

                  {/* Standard Theme Button */}
                  <Button className="w-full" size="lg" disabled={submitting || !selectedGateway || !trxId.trim()} onClick={handlePaymentSubmit}>
                    {submitting ? <><Loader2 className="size-4 mr-2 animate-spin" /> Processing...</> : <><Lock className="size-4 mr-2" /> Complete Purchase</>}
                  </Button>

                  <div className="space-y-2 text-xs text-muted-foreground text-center">
                    <p>By completing this purchase, your transaction will be audited by an administrator.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW: PENDING SCREEN ───────────
  if (currentView === "pending_view") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center p-6 rounded-2xl shadow-lg border-primary/20">
          <CardContent className="pt-6 space-y-5">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Clock size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold">Payment Verification Submitted!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Your transaction is currently under manual audit. The premium dashboard features will activate within 24 hours.</p>
            <Button className="w-full" variant="outline" onClick={() => setCurrentView("billing")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── VIEW: MAIN BILLING DASHBOARD ────────
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Toaster position="top-center" richColors />
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, view usage, and update payment methods.</p>
        </div>

        {/* Current Plan Status & Live Metrics Layout */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="size-5 text-primary" />
                  Current Plan: {currentPlan?.name || 'Free Tier'}
                </CardTitle>
                <CardDescription>
                  Your subscription renews on {fmtDate(subscription?.expires_at || null)}
                </CardDescription>
              </div>
              <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-primary text-primary-foreground" : "bg-background"}>
                {isActive ? "Active" : "Free / Expired"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{fmtBDT(subscription?.amount_paid || 0)}</span>
              <span className="text-muted-foreground">/ Paid this cycle</span>
            </div>

            {/* Usage Metrics with exact Progress bar design */}
            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-lg">Usage This Period</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {currentPlan && merchant ? (
                  <>
                    <CustomUsageBar label="Monthly Transactions" used={merchant.transaction_count} limit={currentPlan.transaction_limit_monthly} />
                    <CustomUsageBar label="Businesses Created" used={merchant.business_count} limit={currentPlan.business_limit} />
                    <CustomUsageBar label="Team Members" used={merchant.team_member_count} limit={currentPlan.allowed_team_members} />
                    <CustomUsageBar label="Devices Connected" used={merchant.device_count} limit={currentPlan.device_limit} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">Select a plan to view usage limits.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade / Pricing Strategy Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Upgrade Your Plan</h2>
              <p className="text-muted-foreground text-sm">Choose the plan that best fits your needs</p>
            </div>

            {/* Repomix Monthly/Yearly Toggle UI Fix */}
            <div className="flex items-center gap-3 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  billing === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium flex items-center ${
                  billing === "yearly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/50"
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none">
                  Save {yearlyDiscount}%
                </Badge>
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
                <Card key={plan.id} className={`relative flex flex-col justify-between transition-all duration-300 ${isCurrentPlan ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">{plan.tag.split(':')[0]}</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      {plan.name}
                    </CardTitle>
                    <div className="pt-4 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{fmtBDT(targetedPrice)}</span>
                      <span className="text-muted-foreground font-medium">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                    <Separator />
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>{plan.transaction_limit_monthly === 0 ? 'Unlimited transactions' : `${plan.transaction_limit_monthly.toLocaleString()} Transactions / month`}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>{plan.business_limit} Workspaces Allowed</span></div>
                      {plan.is_team_allowed && <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>Up to {plan.allowed_team_members} Team Members</span></div>}
                      <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>{plan.device_limit} Devices Allowed</span></div>
                      {plan.allowed_telegram_group && <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>Telegram Alerts</span></div>}
                      {plan.is_custom_bot_allowed && <div className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>Custom API Bot Integration</span></div>}
                      {methods.map((m: string) => <div key={m} className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary shrink-0" /> <span>{methodLabels[m] || m} Allowed</span></div>)}
                    </div>

                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                      ) : isFreePlan ? (
                        <Button className="w-full" variant="outline" disabled>Free Tier</Button>
                      ) : (isDowngrade && !canDowngradeDays) ? (
                        <Button className="w-full" variant="outline" disabled>Downgrade Locked</Button>
                      ) : (
                        <Button className="w-full" variant={isCurrentPlan ? "default" : "default"} onClick={() => handleSelectPlan(plan)}>
                          {isDowngrade ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Billing History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" /> Payment History
            </CardTitle>
            <CardDescription>View your past invoices and receipts.</CardDescription>
          </CardHeader>
          <CardContent>
            {orderHistory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <History size={32} className="mx-auto opacity-30" />
                <p className="text-sm font-bold">No history available</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">{order.order_no}</TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(order.created_at)}</TableCell>
                      <TableCell className="capitalize">{order.billing_cycle}</TableCell>
                      <TableCell className="font-medium">{fmtBDT(order.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`uppercase text-[10px] ${order.status === 'paid' || order.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}