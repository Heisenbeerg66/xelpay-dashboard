'use client';
// src/components/settings/telegram/TelegramSection.tsx
// Adapter: delegates to existing business_actions functions — no changes to backend

import React, { useState, useEffect } from 'react';
import {
  Send, Bot, RefreshCw, CheckCircle2, Loader2,
  Unlink, Copy, ExternalLink, AlertTriangle, X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateBusinessTelegramCode,
  unlinkBusinessTelegram,
  importVaultTelegramToBusiness,
  getVaultDataForImport,
  getBusinessSettings,
  getTelegramBotUsername,
} from '@/lib/business_actions';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, Badge, CopyButton, DangerButton, EmptyState, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile } from '../types';

interface TelegramSectionProps {
  merchant: MerchantProfile;
}

export function TelegramSection({ merchant }: TelegramSectionProps) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);

  const [businessId] = useState<string | null>(
    merchant.active_business_id ?? null
  );
  const [businessData, setBusinessData] = useState<any>(null);
  const [botUsername, setBotUsername] = useState('xelpay_alert_bot');

  useEffect(() => {
    if (businessId) fetchData(businessId);
    else setLoading(false);
  }, [businessId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    const [res, botRes] = await Promise.all([
      getBusinessSettings(id),
      getTelegramBotUsername(),
    ]);
    if (res.success) setBusinessData(res.data);
    if (botRes.success && botRes.username) {
      setBotUsername(botRes.username.replace('@', ''));
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!businessId) return;
    setGenerating(true);
    const res = await generateBusinessTelegramCode(businessId);
    if (res.success) {
      toast.success('New link code generated');
      setBusinessData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
    } else {
      toast.error('Failed to generate code');
    }
    setGenerating(false);
  };

  const handleUnlink = async () => {
    if (!businessId) return;
    setUnlinking(true);
    const res = await unlinkBusinessTelegram(businessId);
    if (res.success) {
      toast.success('Telegram unlinked');
      setBusinessData((prev: any) => ({
        ...prev,
        telegram_chat_id: null,
        is_telegram_enabled: false,
      }));
      setShowUnlinkModal(false);
    } else {
      toast.error('Failed to unlink');
    }
    setUnlinking(false);
  };

  const handleImport = async () => {
    if (!businessId) return;
    setImporting(true);
    const res = await importVaultTelegramToBusiness(businessId);
    if (res.success) {
      toast.success(res.message ?? 'Telegram imported from vault');
      fetchData(businessId);
    } else {
      toast.error(res.message ?? 'Import failed');
    }
    setImporting(false);
  };

  const isConnected = businessData?.telegram_chat_id;
  const linkCode = businessData?.telegram_link_code;
  const botLink = linkCode
    ? `https://t.me/${botUsername}?start=${linkCode}`
    : null;

  if (!businessId) {
    return (
      <SettingsSection title="Telegram" description="No active business.">
        <SettingsCard>
          <SettingsCardBody>
            <EmptyState
              icon={Send}
              title="No active business"
              description="Select a business to manage Telegram notifications."
            />
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Telegram"
      description="Connect Telegram to receive instant payment notifications via your bot."
    >
      {/* Status */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Send}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-950/40"
          title="Telegram Bot Connection"
          description={`Connect your business to @${botUsername} for real-time alerts.`}
          action={
            isConnected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="warning">Not connected</Badge>
            )
          }
        />
        <SettingsCardBody>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-[var(--muted)] rounded-xl" />
              <div className="h-10 bg-[var(--muted)] rounded-xl" />
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Telegram is connected
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                    Chat ID: <code className="font-mono">{businessData.telegram_chat_id}</code>
                  </p>
                </div>
              </div>
              <DangerButton onClick={() => setShowUnlinkModal(true)}>
                <Unlink size={13} />
                Disconnect Telegram
              </DangerButton>
            </div>
          ) : (
            <div className="space-y-4">
              {linkCode ? (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--foreground)] font-medium">
                    Step 1 — Click the link below to connect via Telegram:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] min-w-0">
                      <code className="text-xs font-mono text-[var(--foreground)] break-all">
                        {botLink}
                      </code>
                    </div>
                    <CopyButton value={botLink!} />
                  </div>
                  <a
                    href={botLink!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      'bg-sky-500 hover:bg-sky-600 text-white'
                    )}
                  >
                    <Send size={14} />
                    Open in Telegram
                    <ExternalLink size={12} />
                  </a>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    After clicking Start in the bot, come back and refresh this page.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Generate a link code to connect your Telegram account.
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
                    'disabled:opacity-50'
                  )}
                >
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {linkCode ? 'Regenerate link' : 'Generate link code'}
                </button>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    'border border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-foreground)]',
                    'hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                    'disabled:opacity-50'
                  )}
                >
                  {importing ? <Loader2 size={13} className="animate-spin" /> : <Bot size={13} />}
                  Import from vault
                </button>
              </div>
            </div>
          )}
        </SettingsCardBody>
      </SettingsCard>

      {/* Unlink Confirm Modal */}
      {showUnlinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <Unlink size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Disconnect Telegram?</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  You will stop receiving payment notifications via Telegram until reconnected.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowUnlinkModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {unlinking && <Loader2 size={12} className="animate-spin" />}
                {unlinking ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
