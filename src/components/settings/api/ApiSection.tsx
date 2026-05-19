'use client';
// src/components/settings/api/ApiSection.tsx
// Adapter over existing business API key logic — does NOT replace any backend

import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2, Webhook, Key, RefreshCw, Copy, ExternalLink,
  CheckCircle, AlertCircle, Loader2, Globe,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, FormField, SettingsInput, SecretField, SaveButton,
  Badge, CopyButton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile, SaveState } from '../types';

interface ApiSectionProps {
  merchant: MerchantProfile;
  onUpdate: (updates: Partial<MerchantProfile>) => void;
}

interface BusinessData {
  id: string;
  business_name: string;
  public_key: string;
  secret_key: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  success_url: string | null;
  cancel_url: string | null;
  status: string;
}

export function ApiSection({ merchant, onUpdate }: ApiSectionProps) {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookSaveState, setWebhookSaveState] = useState<SaveState>({ status: 'idle' });
  const [rollingKey, setRollingKey] = useState<'public' | 'secret' | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');

  useEffect(() => {
    if (merchant.active_business_id) {
      loadBusiness(merchant.active_business_id);
    } else {
      setLoading(false);
    }
  }, [merchant.active_business_id]);

  const loadBusiness = async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('id,business_name,public_key,secret_key,webhook_url,webhook_secret,success_url,cancel_url,status')
      .eq('id', id)
      .single();

    if (data) {
      setBusiness(data);
      setWebhookUrl(data.webhook_url ?? '');
      setSuccessUrl(data.success_url ?? '');
      setCancelUrl(data.cancel_url ?? '');
    }
    setLoading(false);
  };

  const handleWebhookSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setWebhookSaveState({ status: 'saving' });
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          webhook_url: webhookUrl.trim() || null,
          success_url: successUrl.trim() || null,
          cancel_url: cancelUrl.trim() || null,
        })
        .eq('id', business.id);

      if (error) throw error;
      setBusiness(b => b ? { ...b, webhook_url: webhookUrl, success_url: successUrl, cancel_url: cancelUrl } : b);
      setWebhookSaveState({ status: 'saved' });
      setTimeout(() => setWebhookSaveState({ status: 'idle' }), 2500);
      toast.success('Webhook settings saved');
    } catch (err: any) {
      setWebhookSaveState({ status: 'error' });
      setTimeout(() => setWebhookSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to save');
    }
  };

  const handleRollKey = useCallback(async (type: 'public' | 'secret') => {
    if (!business) return;
    if (!confirm(`Are you sure you want to regenerate your ${type} key? This will invalidate the current one.`)) return;

    setRollingKey(type);
    try {
      const newKey = type === 'public'
        ? `pk_live_${crypto.randomUUID().replace(/-/g, '')}`
        : `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;

      const field = type === 'public' ? 'public_key' : 'secret_key';
      const { error } = await supabase
        .from('businesses')
        .update({ [field]: newKey })
        .eq('id', business.id);

      if (error) throw error;
      setBusiness(b => b ? { ...b, [field]: newKey } : b);
      toast.success(`${type === 'public' ? 'Public' : 'Secret'} key regenerated`);
    } catch (err: any) {
      toast.error(err.message ?? 'Key rotation failed');
    } finally {
      setRollingKey(null);
    }
  }, [business]);

  const handleTestWebhook = async () => {
    if (!webhookUrl || !business) return;
    setTestingWebhook(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'webhook.test',
          business_id: business.id,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast.success(`Webhook responded with ${res.status}`);
      } else {
        toast.error(`Webhook returned ${res.status}`);
      }
    } catch {
      toast.error('Could not reach webhook URL (CORS or unreachable)');
    } finally {
      setTestingWebhook(false);
    }
  };

  if (loading) {
    return (
      <SettingsSection title="API & Webhooks" description="Loading...">
        <div className="space-y-4">
          {[1, 2].map(i => (
            <SettingsCard key={i}>
              <SettingsCardBody>
                <div className="h-32 animate-pulse bg-[var(--muted)] rounded-xl" />
              </SettingsCardBody>
            </SettingsCard>
          ))}
        </div>
      </SettingsSection>
    );
  }

  if (!business) {
    return (
      <SettingsSection title="API & Webhooks" description="No active business found.">
        <SettingsCard>
          <SettingsCardBody>
            <div className="flex flex-col items-center py-12 text-center">
              <Code2 size={32} className="text-[var(--muted-foreground)] mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[var(--foreground)]">No active business</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Create or select a business to manage API keys.
              </p>
            </div>
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="API & Webhooks"
      description={`Manage API credentials and webhook configuration for ${business.business_name}.`}
    >
      {/* API Keys */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Key}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          title="API Keys"
          description="Use these keys to authenticate API requests. Never share your secret key."
          action={<Badge variant="success">Active</Badge>}
        />
        <SettingsCardBody className="space-y-5">
          {/* Public Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                Public Key
              </label>
              <Badge variant="info">Safe to publish</Badge>
            </div>
            <SecretField
              value={business.public_key}
              label="Public Key"
              onRegenerate={() => handleRollKey('public')}
              regenerating={rollingKey === 'public'}
            />
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Use in client-side code. Safe to expose in your frontend or mobile app.
            </p>
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                Secret Key
              </label>
              <Badge variant="danger">Keep secret</Badge>
            </div>
            <SecretField
              value={business.secret_key}
              label="Secret Key"
              onRegenerate={() => handleRollKey('secret')}
              regenerating={rollingKey === 'secret'}
            />
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Never expose in client-side code. Store in environment variables only.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
            <AlertCircle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Regenerating a key immediately invalidates the current one. Update all integrations before rotating.
            </p>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* Webhook & URLs */}
      <form onSubmit={handleWebhookSave}>
        <SettingsCard>
          <SettingsCardHeader
            icon={Webhook}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-950/40"
            title="Webhook & Redirect URLs"
            description="Configure where XelPay sends payment events and redirects customers."
          />
          <SettingsCardBody className="space-y-4">
            <FormField
              label="Webhook URL"
              hint="POST requests with payment events will be sent to this endpoint."
            >
              <div className="flex items-center gap-2">
                <SettingsInput
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://yourdomain.com/api/webhooks/xelpay"
                  type="url"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={!webhookUrl || testingWebhook}
                  className={cn(
                    'shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                    'bg-[var(--muted)]/50 border-[var(--border)] text-[var(--muted-foreground)]',
                    'hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  {testingWebhook ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
            </FormField>

            {business.webhook_secret && (
              <FormField label="Webhook Secret" hint="Use this to verify incoming webhook signatures.">
                <SecretField value={business.webhook_secret} label="Webhook Secret" />
              </FormField>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Success URL" hint="Redirect after successful payment.">
                <SettingsInput
                  value={successUrl}
                  onChange={e => setSuccessUrl(e.target.value)}
                  placeholder="https://yourdomain.com/thank-you"
                  type="url"
                />
              </FormField>
              <FormField label="Cancel URL" hint="Redirect when payment is cancelled.">
                <SettingsInput
                  value={cancelUrl}
                  onChange={e => setCancelUrl(e.target.value)}
                  placeholder="https://yourdomain.com/checkout"
                  type="url"
                />
              </FormField>
            </div>
          </SettingsCardBody>
          <SettingsCardFooter>
            <a
              href="/dashboard/api"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ExternalLink size={12} />
              View API Documentation
            </a>
            <SaveButton saveState={webhookSaveState} label="Save webhook settings" />
          </SettingsCardFooter>
        </SettingsCard>
      </form>
    </SettingsSection>
  );
}
