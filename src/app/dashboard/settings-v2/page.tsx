'use client';
// src/app/dashboard/settings-v2/page.tsx
// Enterprise Settings V2 — Safe UI migration with preserved backend logic

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SettingsSidebar } from '@/components/settings/layout/SettingsSidebar';
import { SettingsHeader } from '@/components/settings/layout/SettingsHeader';
import { SkeletonCard, cn } from '@/components/settings/shared/SettingsCard';
import type { SettingsSection, MerchantProfile, NotificationPrefs, AppearancePrefs } from '@/components/settings/types';

// ── Lazy-load section components for code splitting ──────────────────────────
const ProfileSection = lazy(() =>
  import('@/components/settings/profile/ProfileSection').then(m => ({ default: m.ProfileSection }))
);
const BusinessSection = lazy(() =>
  import('@/components/settings/business/BusinessSection').then(m => ({ default: m.BusinessSection }))
);
const AppearanceSection = lazy(() =>
  import('@/components/settings/appearance/AppearanceSection').then(m => ({ default: m.AppearanceSection }))
);
const NotificationsSection = lazy(() =>
  import('@/components/settings/notifications/NotificationsSection').then(m => ({ default: m.NotificationsSection }))
);
const SecuritySection = lazy(() =>
  import('@/components/settings/security/SecuritySection').then(m => ({ default: m.SecuritySection }))
);
const TeamSection = lazy(() =>
  import('@/components/settings/security/TeamSection').then(m => ({ default: m.TeamSection }))
);
const ApiSection = lazy(() =>
  import('@/components/settings/api/ApiSection').then(m => ({ default: m.ApiSection }))
);
const SessionsSection = lazy(() =>
  import('@/components/settings/sessions/SessionsSection').then(m => ({ default: m.SessionsSection }))
);
const ActivitySection = lazy(() =>
  import('@/components/settings/sessions/ActivitySection').then(m => ({ default: m.ActivitySection }))
);
const TelegramSection = lazy(() =>
  import('@/components/settings/telegram/TelegramSection').then(m => ({ default: m.TelegramSection }))
);
const DangerSection = lazy(() =>
  import('@/components/settings/advanced/DangerSection').then(m => ({ default: m.DangerSection }))
);
const BrandingSection = lazy(() =>
  import('@/components/settings/branding/BrandingSection').then(m => ({ default: m.BrandingSection }))
);
const PaymentPreferencesSection = lazy(() =>
  import('@/components/settings/payment/PaymentPreferencesSection').then(m => ({ default: m.PaymentPreferencesSection }))
);
const AdvancedSection = lazy(() =>
  import('@/components/settings/advanced/AdvancedSection').then(m => ({ default: m.AdvancedSection }))
);

// ── Section fallback ──────────────────────────────────────────────────────────
function SectionLoader() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsV2Page() {
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null);
  const [appearancePrefs, setAppearancePrefs] = useState<AppearancePrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadMerchantData();
    // Restore last section from localStorage
    const saved = localStorage.getItem('settings_v2_section');
    if (saved) setActiveSection(saved as SettingsSection);
  }, []);

  // Persist active section
  useEffect(() => {
    localStorage.setItem('settings_v2_section', activeSection);
  }, [activeSection]);

  const loadMerchantData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [merchantRes, notifRes, appearanceRes] = await Promise.all([
      supabase.from('merchants').select('*').eq('id', user.id).single(),
      supabase.from('merchant_notification_prefs').select('*').eq('merchant_id', user.id).maybeSingle(),
      supabase.from('merchant_appearance_prefs').select('*').eq('merchant_id', user.id).maybeSingle(),
    ]);

    if (merchantRes.data) setMerchant(merchantRes.data);
    if (notifRes.data) setNotifPrefs(notifRes.data);
    if (appearanceRes.data) setAppearancePrefs(appearanceRes.data);
    setLoading(false);
  };

  const handleMerchantUpdate = (updates: Partial<MerchantProfile>) => {
    setMerchant(prev => prev ? { ...prev, ...updates } : prev);
  };

  if (loading) {
    return (
      <div className="flex h-full">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-[var(--muted)] animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-14 border-b border-[var(--border)] animate-pulse bg-[var(--muted)]/20" />
          <div className="p-6 md:p-8 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Unable to load merchant data. Please refresh.</p>
      </div>
    );
  }

  const renderSection = () => {
    const props = { merchant, onUpdate: handleMerchantUpdate };

    switch (activeSection) {
      case 'profile':
        return <ProfileSection {...props} />;
      case 'business':
        return <BusinessSection {...props} />;
      case 'branding':
        return <BrandingSection />;
      case 'appearance':
        return <AppearanceSection merchant={merchant} initialPrefs={appearancePrefs} />;
      case 'notifications':
        return <NotificationsSection merchant={merchant} initialPrefs={notifPrefs} />;
      case 'security':
        return <SecuritySection {...props} />;
      case 'api':
        return <ApiSection {...props} />;
      case 'team':
        return <TeamSection merchant={merchant} />;
      case 'sessions':
        return <SessionsSection merchant={merchant} />;
      case 'activity':
        return <ActivitySection merchant={merchant} />;
      case 'telegram':
        return <TelegramSection merchant={merchant} />;
      case 'payment':
        return <PaymentPreferencesSection />;
      case 'advanced':
        return <AdvancedSection />;
      case 'danger':
        return <DangerSection merchant={merchant} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] bg-[var(--background)] overflow-hidden">
      {/* Sidebar */}
      <SettingsSidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        merchantName={merchant.brand_name ?? merchant.name}
        merchantEmail={merchant.email}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <SettingsHeader
          activeSection={activeSection}
          onMenuOpen={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <Suspense fallback={<SectionLoader />}>
              {renderSection()}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
