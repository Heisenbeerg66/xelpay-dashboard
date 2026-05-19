'use client';
// src/components/settings/notifications/NotificationsSection.tsx

import React, { useState } from 'react';
import { Bell, Mail, Send, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, SettingsRow, SettingsToggle, SaveButton,
} from '../shared/SettingsCard';
import type { MerchantProfile, NotificationPrefs, SaveState } from '../types';

interface NotificationsSectionProps {
  merchant: MerchantProfile;
  initialPrefs?: NotificationPrefs | null;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_new_payment: true,
  email_payment_failed: true,
  email_daily_summary: false,
  email_weekly_report: true,
  email_security_alerts: true,
  email_team_invites: true,
  email_subscription: true,
  push_new_payment: true,
  push_payment_failed: false,
  push_security_alerts: true,
  telegram_new_payment: true,
  telegram_payment_failed: true,
  telegram_daily_summary: false,
};

export function NotificationsSection({ merchant, initialPrefs }: NotificationsSectionProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs ?? DEFAULT_PREFS);
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaveState({ status: 'saving' });
    try {
      const { error } = await supabase
        .from('merchant_notification_prefs')
        .upsert({
          merchant_id: merchant.id,
          ...prefs,
        }, { onConflict: 'merchant_id' });

      if (error) throw error;
      setSaveState({ status: 'saved' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.success('Notification preferences saved');
    } catch (err: any) {
      setSaveState({ status: 'error' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to save');
    }
  };

  return (
    <SettingsSection
      title="Notifications"
      description="Control which events trigger email, push and Telegram alerts."
    >
      {/* Email Notifications */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Mail}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          title="Email Notifications"
          description={`Sent to ${merchant.email}`}
        />
        <SettingsCardBody className="divide-y divide-[var(--border)]">
          <SettingsRow
            label="New payment received"
            description="Receive an email every time a payment is confirmed."
          >
            <SettingsToggle checked={prefs.email_new_payment} onChange={() => toggle('email_new_payment')} />
          </SettingsRow>
          <SettingsRow
            label="Payment failed"
            description="Be notified when a payment attempt fails or is rejected."
          >
            <SettingsToggle checked={prefs.email_payment_failed} onChange={() => toggle('email_payment_failed')} />
          </SettingsRow>
          <SettingsRow
            label="Daily summary"
            description="Daily digest of your payment activity."
          >
            <SettingsToggle checked={prefs.email_daily_summary} onChange={() => toggle('email_daily_summary')} />
          </SettingsRow>
          <SettingsRow
            label="Weekly report"
            description="Weekly summary of revenue, transactions and trends."
          >
            <SettingsToggle checked={prefs.email_weekly_report} onChange={() => toggle('email_weekly_report')} />
          </SettingsRow>
          <SettingsRow
            label="Security alerts"
            description="Important alerts about login attempts and security events."
          >
            <SettingsToggle checked={prefs.email_security_alerts} onChange={() => toggle('email_security_alerts')} />
          </SettingsRow>
          <SettingsRow
            label="Team invitations"
            description="When someone invites you to a team or when you invite others."
          >
            <SettingsToggle checked={prefs.email_team_invites} onChange={() => toggle('email_team_invites')} />
          </SettingsRow>
          <SettingsRow
            label="Subscription updates"
            description="Billing and plan change notifications."
          >
            <SettingsToggle checked={prefs.email_subscription} onChange={() => toggle('email_subscription')} />
          </SettingsRow>
        </SettingsCardBody>
      </SettingsCard>

      {/* Telegram Notifications */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Send}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-950/40"
          title="Telegram Notifications"
          description={
            merchant.telegram_chat_id
              ? `Connected · Chat ID: ${merchant.telegram_chat_id}`
              : 'Connect Telegram in the Telegram settings to enable.'
          }
        />
        <SettingsCardBody className="divide-y divide-[var(--border)]">
          <SettingsRow
            label="New payment received"
            description="Instant Telegram alert for each confirmed payment."
          >
            <SettingsToggle
              checked={prefs.telegram_new_payment}
              onChange={() => toggle('telegram_new_payment')}
              disabled={!merchant.telegram_chat_id}
            />
          </SettingsRow>
          <SettingsRow
            label="Payment failed"
            description="Alert when a payment attempt fails."
          >
            <SettingsToggle
              checked={prefs.telegram_payment_failed}
              onChange={() => toggle('telegram_payment_failed')}
              disabled={!merchant.telegram_chat_id}
            />
          </SettingsRow>
          <SettingsRow
            label="Daily summary"
            description="Daily activity digest via Telegram."
          >
            <SettingsToggle
              checked={prefs.telegram_daily_summary}
              onChange={() => toggle('telegram_daily_summary')}
              disabled={!merchant.telegram_chat_id}
            />
          </SettingsRow>
        </SettingsCardBody>
        {!merchant.telegram_chat_id && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
              <Send size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Go to <strong>Telegram Settings</strong> to connect your bot first.
              </p>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Save */}
      <div className="flex justify-end">
        <SaveButton
          saveState={saveState}
          onClick={handleSave}
          label="Save preferences"
          className="px-6"
        />
      </div>
    </SettingsSection>
  );
}
