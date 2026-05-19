'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Wallet, Building2, Smartphone, Bitcoin,
  CheckCircle2, XCircle, ExternalLink, ArrowRight,
  TrendingUp, AlertCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsRow, SettingsSection, FormField, SettingsInput, SettingsSelect,
  SaveButton, SkeletonCard, Badge, EmptyState, cn,
} from '@/components/settings/shared/SettingsCard';
import type { SaveState } from '@/components/settings/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gateway {
  id: string;
  display_name: string;
  provider: string;
  account_type: string;
  category: string;
  is_active: boolean;
  min_amount: number;
  max_amount: number | null;
  has_discount: boolean;
  discount_percent: number;
  fixed_charge: number | null;
  percent_charge: number | null;
}

interface BusinessPaymentSettings {
  currency: string;
  exchange_rate: string;
  success_url: string;
  cancel_url: string;
  webhook_url: string;
  webhook_secret: string;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  mobile: Smartphone,
  bank: Building2,
  crypto: Bitcoin,
  card: CreditCard,
};

const CATEGORY_LABELS: Record<string, string> = {
  mobile: 'Mobile Banking',
  bank: 'Bank Transfer',
  crypto: 'Crypto',
  card: 'Card',
};

const CURRENCIES = [
  { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
];

// ─── Gateway Card ──────────────────────────────────────────────────────────────

function GatewayRow({ gw }: { gw: Gateway }) {
  const Icon = CATEGORY_ICONS[gw.category] || Wallet;
  const categoryLabel = CATEGORY_LABELS[gw.category] || gw.category;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[var(--muted-foreground)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate">{gw.display_name}</p>
          <span className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)] px-1.5 py-0.5 rounded capitalize">
            {gw.provider}
          </span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          {categoryLabel}
          {gw.min_amount > 0 && ` · Min ${gw.min_amount}`}
          {gw.max_amount && ` · Max ${gw.max_amount}`}
          {gw.has_discount && ` · ${gw.discount_percent}% discount`}
          {gw.fixed_charge && ` · ৳${gw.fixed_charge} charge`}
        </p>
      </div>
      <div className="flex-shrink-0">
        {gw.is_active ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <XCircle size={13} />
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function GatewayStats({ gateways }: { gateways: Gateway[] }) {
  const active = gateways.filter(g => g.is_active).length;
  const byCategory = gateways.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Total Gateways', value: gateways.length, icon: Wallet },
        { label: 'Active', value: active, icon: CheckCircle2 },
        { label: 'Mobile', value: byCategory.mobile || 0, icon: Smartphone },
        { label: 'Bank', value: byCategory.bank || 0, icon: Building2 },
      ].map(stat => (
        <div
          key={stat.label}
          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1"
        >
          <stat.icon size={14} className="text-[var(--muted-foreground)]" />
          <p className="text-xl font-black text-[var(--foreground)]">{stat.value}</p>
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentPreferencesSection() {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<BusinessPaymentSettings>({
    currency: 'BDT',
    exchange_rate: '1',
    success_url: '',
    cancel_url: '',
    webhook_url: '',
    webhook_secret: '',
  });

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadGateways = useCallback(async (bizId: string) => {
    // Try business_gateways first, then payment_gateways
    const { data: bgData } = await supabase
      .from('business_gateways')
      .select('id, display_name, provider, account_type, category, is_active, min_amount, max_amount, has_discount, discount_percent, fixed_charge, percent_charge')
      .eq('business_id', bizId)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: true });

    if (bgData && bgData.length > 0) {
      setGateways(bgData as Gateway[]);
      return;
    }

    // Fallback to payment_gateways
    const { data: pgData } = await supabase
      .from('payment_gateways')
      .select('id, display_name, provider, account_type, category, is_active, min_amount, max_amount, has_discount, discount_percent, fixed_charge, percent_charge')
      .eq('business_id', bizId)
      .order('is_active', { ascending: false });

    if (pgData) setGateways(pgData as Gateway[]);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const bizId =
      (typeof window !== 'undefined' && localStorage.getItem('activeBusiness')) ||
      (typeof window !== 'undefined' && sessionStorage.getItem('activeBusiness')) ||
      null;

    if (bizId) {
      setBusinessId(bizId);
      await loadGateways(bizId);

      const { data: biz } = await supabase
        .from('businesses')
        .select('currency, exchange_rate, success_url, cancel_url, webhook_url, webhook_secret')
        .eq('id', bizId)
        .single();

      if (biz) {
        setSettings({
          currency: biz.currency || 'BDT',
          exchange_rate: biz.exchange_rate ? String(biz.exchange_rate) : '1',
          success_url: biz.success_url || '',
          cancel_url: biz.cancel_url || '',
          webhook_url: biz.webhook_url || '',
          webhook_secret: biz.webhook_secret || '',
        });
      }
    } else {
      // Merchant-level: load from merchants table
      const { data: merchant } = await supabase
        .from('merchants')
        .select('currency, exchange_rate, webhook_url')
        .eq('id', user.id)
        .single();

      if (merchant) {
        setSettings(prev => ({
          ...prev,
          currency: merchant.currency || 'BDT',
          exchange_rate: merchant.exchange_rate ? String(merchant.exchange_rate) : '1',
          webhook_url: merchant.webhook_url || '',
        }));
      }
    }

    setLoading(false);
  }, [loadGateways]);

  useEffect(() => {
    loadData();

    const handleBizChange = () => loadData();
    window.addEventListener('businessChanged', handleBizChange);
    return () => window.removeEventListener('businessChanged', handleBizChange);
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (businessId) await loadGateways(businessId);
    setTimeout(() => setRefreshing(false), 600);
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveState('saving');
    try {
      if (businessId) {
        const { error } = await supabase
          .from('businesses')
          .update({
            currency: settings.currency,
            exchange_rate: parseFloat(settings.exchange_rate) || 1,
            success_url: settings.success_url || null,
            cancel_url: settings.cancel_url || null,
            webhook_url: settings.webhook_url || null,
          })
          .eq('id', businessId);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { error } = await supabase
          .from('merchants')
          .update({
            currency: settings.currency,
            exchange_rate: parseFloat(settings.exchange_rate) || 1,
            webhook_url: settings.webhook_url || null,
          })
          .eq('id', user.id);
        if (error) throw error;
      }

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  const activeGateways = gateways.filter(g => g.is_active);
  const byCategory = gateways.reduce<Record<string, Gateway[]>>((acc, g) => {
    const cat = g.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(g);
    return acc;
  }, {});

  return (
    <SettingsSection>
      {/* Payment Settings */}
      <SettingsCard>
        <SettingsCardHeader
          title="Payment Settings"
          description="Configure your default currency, exchange rate, and redirect URLs for payment flow."
        />
        <SettingsCardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Default Currency">
              <SettingsSelect
                value={settings.currency}
                onChange={(v: any) => setSettings(p => ({ ...p, currency: v }))}
                options={CURRENCIES}
              />
            </FormField>
            <FormField label="Exchange Rate" hint="Rate relative to your base currency">
              <SettingsInput
                value={settings.exchange_rate}
                onChange={(v: any) => setSettings(p => ({ ...p, exchange_rate: v }))}
                placeholder="1.0"
                type="number"
              />
            </FormField>
          </div>

          {businessId && (
            <>
              <FormField label="Success Redirect URL" hint="Where to redirect after successful payment">
                <SettingsInput
                  value={settings.success_url}
                  onChange={(v: any) => setSettings(p => ({ ...p, success_url: v }))}
                  placeholder="https://yoursite.com/success"
                />
              </FormField>

              <FormField label="Cancel Redirect URL" hint="Where to redirect if payment is cancelled">
                <SettingsInput
                  value={settings.cancel_url}
                  onChange={(v: any) => setSettings(p => ({ ...p, cancel_url: v }))}
                  placeholder="https://yoursite.com/cancel"
                />
              </FormField>
            </>
          )}

          <FormField label="Webhook URL" hint="Receive real-time payment event notifications">
            <SettingsInput
              value={settings.webhook_url}
              onChange={(v: any) => setSettings(p => ({ ...p, webhook_url: v }))}
              placeholder="https://yoursite.com/api/webhooks/xelpay"
            />
          </FormField>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={saveState} onClick={handleSave} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Gateway Overview */}
      <SettingsCard>
        <SettingsCardHeader
          title="Payment Gateways"
          description="Overview of your configured payment methods. Manage them in the Gateway Manager."
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                title="Refresh"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <a
                href="/dashboard/gateways"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Manage
                <ArrowRight size={12} />
              </a>
            </div>
          }
        />
        <SettingsCardBody>
          {gateways.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} className="text-[var(--muted-foreground)]" />}
              title="No gateways configured"
              description="Add payment gateways in the Gateway Manager to start accepting payments."
              action={
                <a
                  href="/dashboard/gateways"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
                >
                  Go to Gateway Manager
                  <ExternalLink size={13} />
                </a>
              }
            />
          ) : (
            <>
              <GatewayStats gateways={gateways} />

              {/* By category */}
              <div className="space-y-4">
                {Object.entries(byCategory).map(([category, gws]) => {
                  const Icon = CATEGORY_ICONS[category] || Wallet;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={13} className="text-[var(--muted-foreground)]" />
                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          {CATEGORY_LABELS[category] || category}
                        </p>
                        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">
                          {gws.length}
                        </span>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 divide-y divide-[var(--border)]">
                        {gws.map(gw => <GatewayRow key={gw.id} gw={gw} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SettingsCardBody>
      </SettingsCard>

      {/* Quick Links */}
      <SettingsCard>
        <SettingsCardHeader
          title="Quick Access"
          description="Jump directly to related payment management pages."
        />
        <SettingsCardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Gateway Manager',
                desc: 'Add, edit, and configure payment methods',
                href: '/dashboard/gateways',
                icon: Wallet,
              },
              {
                label: 'Payment Links',
                desc: 'Create and manage checkout links',
                href: '/dashboard/links',
                icon: CreditCard,
              },
              {
                label: 'Orders',
                desc: 'View all transactions and payment history',
                href: '/dashboard/orders',
                icon: TrendingUp,
              },
              {
                label: 'Failed Webhooks',
                desc: 'Retry failed webhook deliveries',
                href: '/dashboard/webhooks',
                icon: AlertCircle,
              },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--muted)] group-hover:bg-[var(--card)] flex items-center justify-center flex-shrink-0 transition-colors">
                  <item.icon size={16} className="text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{item.desc}</p>
                </div>
                <ArrowRight size={14} className="text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            ))}
          </div>
        </SettingsCardBody>
      </SettingsCard>
    </SettingsSection>
  );
}
