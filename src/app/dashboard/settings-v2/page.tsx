'use client';
// src/app/dashboard/settings-v2/page.tsx

import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  User, Building2, Palette, SunMoon, Bell, ShieldCheck,
  Code2, Users, MonitorSmartphone, Activity, Send,
  CreditCard, Sliders, AlertTriangle, ChevronRight,
  ArrowLeft, Settings, Search, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SkeletonCard, cn } from '@/components/settings/shared/SettingsCard';
import type { SettingsSection, MerchantProfile, NotificationPrefs, AppearancePrefs } from '@/components/settings/types';

// ── Lazy section imports ──────────────────────────────────────────────────────
const ProfileSection       = lazy(() => import('@/components/settings/profile/ProfileSection').then(m => ({ default: m.ProfileSection })));
const BusinessSection      = lazy(() => import('@/components/settings/business/BusinessSection').then(m => ({ default: m.BusinessSection })));
const BrandingSection      = lazy(() => import('@/components/settings/branding/BrandingSection').then(m => ({ default: m.BrandingSection })));
const AppearanceSection    = lazy(() => import('@/components/settings/appearance/AppearanceSection').then(m => ({ default: m.AppearanceSection })));
const NotificationsSection = lazy(() => import('@/components/settings/notifications/NotificationsSection').then(m => ({ default: m.NotificationsSection })));
const SecuritySection      = lazy(() => import('@/components/settings/security/SecuritySection').then(m => ({ default: m.SecuritySection })));
const ApiSection           = lazy(() => import('@/components/settings/api/ApiSection').then(m => ({ default: m.ApiSection })));
const TeamSection          = lazy(() => import('@/components/settings/security/TeamSection').then(m => ({ default: m.TeamSection })));
const SessionsSection      = lazy(() => import('@/components/settings/sessions/SessionsSection').then(m => ({ default: m.SessionsSection })));
const ActivitySection      = lazy(() => import('@/components/settings/sessions/ActivitySection').then(m => ({ default: m.ActivitySection })));
const TelegramSection      = lazy(() => import('@/components/settings/telegram/TelegramSection').then(m => ({ default: m.TelegramSection })));
const PaymentSection       = lazy(() => import('@/components/settings/payment/PaymentPreferencesSection').then(m => ({ default: m.PaymentPreferencesSection })));
const AdvancedSection      = lazy(() => import('@/components/settings/advanced/AdvancedSection').then(m => ({ default: m.AdvancedSection })));
const DangerSection        = lazy(() => import('@/components/settings/advanced/DangerSection').then(m => ({ default: m.DangerSection })));

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  User, Building2, Palette, SunMoon, Bell, ShieldCheck,
  Code2, Users, MonitorSmartphone, Activity, Send,
  CreditCard, Sliders, AlertTriangle,
};

// ── Nav items ─────────────────────────────────────────────────────────────────
interface NavItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  danger?: boolean;
  tags?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Name, avatar, phone & timezone',
    icon: 'User',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/30',
    tags: ['account', 'personal', 'avatar'],
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Business name, currency & exchange rate',
    icon: 'Building2',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/30',
    tags: ['company', 'currency', 'contact'],
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo, favicon & brand colors',
    icon: 'Palette',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'hover:border-pink-500/30',
    tags: ['logo', 'color', 'design'],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme, dark mode & display density',
    icon: 'SunMoon',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/30',
    tags: ['theme', 'dark', 'light'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email & Telegram alert preferences',
    icon: 'Bell',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'hover:border-emerald-500/30',
    tags: ['email', 'alerts', 'push'],
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password, 2FA & login notifications',
    icon: 'ShieldCheck',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'hover:border-green-500/30',
    tags: ['password', '2fa', 'login'],
  },
  {
    id: 'api',
    label: 'API & Webhooks',
    description: 'API keys, endpoints & webhook secrets',
    icon: 'Code2',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'hover:border-cyan-500/30',
    tags: ['api', 'keys', 'webhook', 'developer'],
  },
  {
    id: 'team',
    label: 'Team & Roles',
    description: 'Members, invitations & permissions',
    icon: 'Users',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'hover:border-indigo-500/30',
    tags: ['members', 'invite', 'permissions'],
  },
  {
    id: 'sessions',
    label: 'Devices & Sessions',
    description: 'Active logins & trusted devices',
    icon: 'MonitorSmartphone',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'hover:border-slate-500/30',
    tags: ['devices', 'login', 'sessions'],
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    description: 'Full audit trail & account history',
    icon: 'Activity',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'hover:border-orange-500/30',
    tags: ['logs', 'audit', 'history'],
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Bot setup & payment notifications',
    icon: 'Send',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'hover:border-sky-500/30',
    tags: ['bot', 'telegram', 'alerts'],
  },
  {
    id: 'payment',
    label: 'Payment Preferences',
    description: 'Currency, gateways & redirect URLs',
    icon: 'CreditCard',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'hover:border-teal-500/30',
    tags: ['payment', 'gateway', 'currency'],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Social links, GTM, Meta Pixel & domain',
    icon: 'Sliders',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'hover:border-purple-500/30',
    tags: ['gtm', 'pixel', 'social', 'domain'],
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    description: 'Sign out all devices or delete account',
    icon: 'AlertTriangle',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'hover:border-red-500/30',
    danger: true,
    tags: ['delete', 'account', 'danger'],
  },
];

// ── Section Loader ────────────────────────────────────────────────────────────
function SectionLoader() {
  return (
    <div className="space-y-4">
      <SkeletonCard rows={3} />
      <SkeletonCard rows={3} />
    </div>
  );
}

// ── Settings Tile ─────────────────────────────────────────────────────────────
function SettingsTile({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = ICON_MAP[item.icon] ?? Settings;
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left p-5 rounded-2xl border transition-all duration-200',
        'bg-[var(--card)]',
        item.danger
          ? 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5'
          : `border-[var(--border)] ${item.border} hover:bg-[var(--muted)]/40`,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30',
        'active:scale-[0.98]',
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon bubble */}
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          'transition-transform duration-200 group-hover:scale-105',
          item.bg,
        )}>
          <Icon size={21} className={item.color} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-semibold truncate',
            item.danger ? 'text-red-400' : 'text-[var(--foreground)]',
          )}>
            {item.label}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={15}
          className={cn(
            'flex-shrink-0 transition-all duration-200',
            'group-hover:translate-x-0.5',
            item.danger ? 'text-red-400/50 group-hover:text-red-400' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]',
          )}
        />
      </div>
    </button>
  );
}

// ── Hub ───────────────────────────────────────────────────────────────────────
function SettingsHub({
  merchant,
  onSelect,
}: {
  merchant: MerchantProfile;
  onSelect: (s: SettingsSection) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = NAV_ITEMS.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags?.some(t => t.includes(q))
    );
  });

  const regular = filtered.filter(i => !i.danger);
  const danger  = filtered.filter(i => i.danger);

  // Group non-danger into rows of 2 for a cleaner layout
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage your account, business and integrations
          </p>
        </div>
        {/* Avatar / account pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center">
            <User size={13} className="text-[var(--muted-foreground)]" />
          </div>
          <span className="text-xs font-semibold text-[var(--foreground)] max-w-[120px] truncate hidden sm:block">
            {merchant.name || merchant.email}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search settings…"
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium',
            'bg-[var(--muted)]/50 border border-[var(--border)]',
            'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
            'transition-all duration-150',
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Search size={28} className="text-[var(--muted-foreground)] mb-3 opacity-50" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No settings found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Try a different keyword</p>
        </div>
      )}

      {/* Main grid — 2 columns */}
      {regular.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {regular.map(item => (
            <SettingsTile key={item.id} item={item} onClick={() => onSelect(item.id)} />
          ))}
        </div>
      )}

      {/* Danger zone */}
      {danger.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-red-500/20" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={11} /> Danger Zone
            </span>
            <div className="h-px flex-1 bg-red-500/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {danger.map(item => (
              <SettingsTile key={item.id} item={item} onClick={() => onSelect(item.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section View (detail) ─────────────────────────────────────────────────────
function SectionView({
  activeSection,
  merchant,
  notifPrefs,
  appearancePrefs,
  onUpdate,
  onBack,
}: {
  activeSection: SettingsSection;
  merchant: MerchantProfile;
  notifPrefs: NotificationPrefs | null;
  appearancePrefs: AppearancePrefs | null;
  onUpdate: (u: Partial<MerchantProfile>) => void;
  onBack: () => void;
}) {
  const item = NAV_ITEMS.find(i => i.id === activeSection);
  const Icon = item ? (ICON_MAP[item.icon] ?? Settings) : Settings;
  const props = { merchant, onUpdate };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':       return <ProfileSection {...props} />;
      case 'business':      return <BusinessSection {...props} />;
      case 'branding':      return <BrandingSection />;
      case 'appearance':    return <AppearanceSection merchant={merchant} initialPrefs={appearancePrefs} />;
      case 'notifications': return <NotificationsSection merchant={merchant} initialPrefs={notifPrefs} />;
      case 'security':      return <SecuritySection {...props} />;
      case 'api':           return <ApiSection {...props} />;
      case 'team':          return <TeamSection merchant={merchant} />;
      case 'sessions':      return <SessionsSection merchant={merchant} />;
      case 'activity':      return <ActivitySection merchant={merchant} />;
      case 'telegram':      return <TelegramSection merchant={merchant} />;
      case 'payment':       return <PaymentSection />;
      case 'advanced':      return <AdvancedSection />;
      case 'danger':        return <DangerSection merchant={merchant} />;
      default:              return null;
    }
  };

  return (
    <div className="min-h-full">
      {/* Sticky breadcrumb bar */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <ChevronRight size={14} className="text-[var(--border)] flex-shrink-0" />

          {item && (
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0', item.bg)}>
                <Icon size={13} className={item.color} />
              </div>
              <span className={cn(
                'text-sm font-semibold truncate',
                item.danger ? 'text-red-400' : 'text-[var(--foreground)]',
              )}>
                {item.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Suspense fallback={<SectionLoader />}>
          {renderSection()}
        </Suspense>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsV2Page() {
  const [merchant, setMerchant]               = useState<MerchantProfile | null>(null);
  const [notifPrefs, setNotifPrefs]           = useState<NotificationPrefs | null>(null);
  const [appearancePrefs, setAppearancePrefs] = useState<AppearancePrefs | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [activeSection, setActiveSection]     = useState<SettingsSection | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [mRes, nRes, aRes] = await Promise.all([
      supabase.from('merchants').select('*').eq('id', user.id).single(),
      supabase.from('merchant_notification_prefs').select('*').eq('merchant_id', user.id).maybeSingle(),
      supabase.from('merchant_appearance_prefs').select('*').eq('merchant_id', user.id).maybeSingle(),
    ]);

    if (mRes.data) setMerchant(mRes.data);
    if (nRes.data) setNotifPrefs(nRes.data);
    if (aRes.data) setAppearancePrefs(aRes.data);
    setLoading(false);
  };

  const handleUpdate = (updates: Partial<MerchantProfile>) =>
    setMerchant(prev => prev ? { ...prev, ...updates } : prev);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-8 w-32 rounded-xl bg-[var(--muted)] animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-[var(--muted)] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted-foreground)] text-sm">Unable to load settings. Please refresh.</p>
      </div>
    );
  }

  // Section detail
  if (activeSection) {
    return (
      <div className="h-[calc(100vh-72px)] overflow-y-auto bg-[var(--background)]">
        <SectionView
          activeSection={activeSection}
          merchant={merchant}
          notifPrefs={notifPrefs}
          appearancePrefs={appearancePrefs}
          onUpdate={handleUpdate}
          onBack={() => setActiveSection(null)}
        />
      </div>
    );
  }

  // Hub — card grid
  return (
    <div className="h-[calc(100vh-72px)] overflow-y-auto bg-[var(--background)]">
      <SettingsHub merchant={merchant} onSelect={setActiveSection} />
    </div>
  );
}