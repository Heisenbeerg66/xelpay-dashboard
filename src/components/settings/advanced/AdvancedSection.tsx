'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Code2, MapPin, Share2, CheckCircle2, Copy,
  Facebook, Youtube, MessageCircle, Send, AlertTriangle,
  ExternalLink, RefreshCw, Tag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsRow, SettingsSection, FormField, SettingsInput, SettingsSelect, SettingsToggle,
  SaveButton, SkeletonCard, CopyButton, EmptyState, cn,
} from '@/components/settings/shared/SettingsCard';
import type { SaveState } from '@/components/settings/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  fb_page: string;
  messenger: string;
  whatsapp: string;
  telegram: string;
  youtube: string;
}

interface MetaPixel {
  enabled: boolean;
  pixel_id: string;
  access_token: string;
  test_event_code: string;
  trigger_on: string;
}

interface AdvancedData {
  businessId: string | null;
  // Location
  street_address: string;
  city: string;
  country: string;
  zip_code: string;
  // Analytics
  gtm_id: string;
  language: string;
  // Social
  social_links: SocialLinks;
  // Meta Pixel
  meta_pixel: MetaPixel;
  // Domain
  domain_verify_code: string;
  is_domain_verified: boolean;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
];

const PIXEL_TRIGGERS = [
  { value: 'payment_success', label: 'Payment Success' },
  { value: 'checkout_open', label: 'Checkout Opened' },
  { value: 'payment_initiated', label: 'Payment Initiated' },
];

// ─── Social Link Row ──────────────────────────────────────────────────────────

interface SocialRowProps {
  icon: React.ComponentType<any>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  color?: string;
}

function SocialRow({ icon: Icon, label, placeholder, value, onChange, color }: SocialRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color ? `${color}20` : undefined }}
      >
        <Icon size={15} style={{ color: color || 'var(--muted-foreground)' }} />
      </div>
      <div className="flex-1">
        <SettingsInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="text-sm"
        />
      </div>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors flex-shrink-0"
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvancedSection() {
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [socialSaveState, setSocialSaveState] = useState<SaveState>('idle');
  const [pixelSaveState, setPixelSaveState] = useState<SaveState>('idle');
  const [verifying, setVerifying] = useState(false);
  const [data, setData] = useState<AdvancedData>({
    businessId: null,
    street_address: '',
    city: '',
    country: '',
    zip_code: '',
    gtm_id: '',
    language: 'en',
    social_links: { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
    meta_pixel: {
      enabled: false,
      pixel_id: '',
      access_token: '',
      test_event_code: '',
      trigger_on: 'payment_success',
    },
    domain_verify_code: '',
    is_domain_verified: false,
  });

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const bizId =
      (typeof window !== 'undefined' && localStorage.getItem('activeBusiness')) ||
      (typeof window !== 'undefined' && sessionStorage.getItem('activeBusiness')) ||
      null;

    if (!bizId) {
      setLoading(false);
      return;
    }

    const { data: biz } = await supabase
      .from('businesses')
      .select('id, street_address, city, country, zip_code, gtm_id, language, social_links, meta_pixel, domain_verify_code, is_domain_verified')
      .eq('id', bizId)
      .single();

    if (biz) {
      // Auto-generate verify code if missing
      let verifyCode = biz.domain_verify_code;
      if (!verifyCode) {
        verifyCode = `xp-verify-${Math.random().toString(36).substring(2, 15)}`;
        await supabase
          .from('businesses')
          .update({ domain_verify_code: verifyCode })
          .eq('id', bizId);
      }

      setData({
        businessId: biz.id,
        street_address: biz.street_address || '',
        city: biz.city || '',
        country: biz.country || '',
        zip_code: biz.zip_code || '',
        gtm_id: biz.gtm_id || '',
        language: biz.language || 'en',
        social_links: biz.social_links || { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
        meta_pixel: biz.meta_pixel || {
          enabled: false,
          pixel_id: '',
          access_token: '',
          test_event_code: '',
          trigger_on: 'payment_success',
        },
        domain_verify_code: verifyCode,
        is_domain_verified: biz.is_domain_verified || false,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleBizChange = () => loadData();
    window.addEventListener('businessChanged', handleBizChange);
    return () => window.removeEventListener('businessChanged', handleBizChange);
  }, [loadData]);

  // ─── Saves ─────────────────────────────────────────────────────────────────

  const makeSaver = (
    fields: Partial<AdvancedData>,
    setState: (s: SaveState) => void,
  ) => async () => {
    if (!data.businessId) return;
    setState('saving');
    try {
      const update: Record<string, any> = {};
      for (const key of Object.keys(fields) as (keyof AdvancedData)[]) {
        update[key] = (data as any)[key];
      }
      const { error } = await supabase
        .from('businesses')
        .update(update)
        .eq('id', data.businessId);
      if (error) throw error;
      setState('saved');
      setTimeout(() => setState('idle'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const handleSaveLocation = makeSaver(
    { street_address: '', city: '', country: '', zip_code: '' },
    setSaveState,
  );

  const handleSaveGeneral = async () => {
    if (!data.businessId) return;
    setSaveState('saving');
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ gtm_id: data.gtm_id, language: data.language })
        .eq('id', data.businessId);
      if (error) throw error;
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const handleSaveSocial = makeSaver(
    { social_links: { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' } },
    setSocialSaveState,
  );

  const handleSavePixel = makeSaver(
    { meta_pixel: { enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' } },
    setPixelSaveState,
  );

  const updateSocial = (key: keyof SocialLinks, value: string) => {
    setData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
  };

  const updatePixel = (key: keyof MetaPixel, value: any) => {
    setData(prev => ({
      ...prev,
      meta_pixel: { ...prev.meta_pixel, [key]: value },
    }));
  };

  const handleVerifyDomain = async () => {
    if (!data.businessId) return;
    setVerifying(true);
    // Simulate verification check
    await new Promise(r => setTimeout(r, 1500));
    toast.error('Domain verification not detected. Add the meta tag and try again.');
    setVerifying(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard rows={3} />
        <SkeletonCard rows={4} />
        <SkeletonCard rows={3} />
      </div>
    );
  }

  if (!data.businessId) {
    return (
      <SettingsSection>
        <SettingsCard>
          <SettingsCardBody>
            <EmptyState
              icon={<AlertTriangle size={24} className="text-amber-500" />}
              title="No active business"
              description="Advanced settings are available once you've created or selected a business."
              action={
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </a>
              }
            />
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection>
      {/* General Advanced Settings */}
      <SettingsCard>
        <SettingsCardHeader
          title="General"
          description="Configure language and analytics tracking for your business."
        />
        <SettingsCardBody>
          <FormField label="Display Language" hint="Language shown to customers on checkout pages">
            <SettingsSelect
              value={data.language}
              onChange={(v) => setData(prev => ({ ...prev, language: v }))}
              options={LANGUAGES}
            />
          </FormField>

          <FormField label="Google Tag Manager ID" hint="e.g. GTM-XXXXXXX — leave blank to disable">
            <div className="relative">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <SettingsInput
                value={data.gtm_id}
                onChange={(v) => setData(prev => ({ ...prev, gtm_id: v }))}
                placeholder="GTM-XXXXXXX"
                className="pl-8 font-mono text-sm"
              />
            </div>
          </FormField>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={saveState} onClick={handleSaveGeneral} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Business Address */}
      <SettingsCard>
        <SettingsCardHeader
          title="Business Address"
          description="Physical or registered address for your business. Shown on invoices and receipts."
        />
        <SettingsCardBody>
          <FormField label="Street Address">
            <SettingsInput
              value={data.street_address}
              onChange={(v) => setData(prev => ({ ...prev, street_address: v }))}
              placeholder="123 Main Street, Suite 100"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="City">
              <SettingsInput
                value={data.city}
                onChange={(v) => setData(prev => ({ ...prev, city: v }))}
                placeholder="Dhaka"
              />
            </FormField>
            <FormField label="ZIP / Postal Code">
              <SettingsInput
                value={data.zip_code}
                onChange={(v) => setData(prev => ({ ...prev, zip_code: v }))}
                placeholder="1200"
              />
            </FormField>
            <FormField label="Country">
              <SettingsInput
                value={data.country}
                onChange={(v) => setData(prev => ({ ...prev, country: v }))}
                placeholder="Bangladesh"
              />
            </FormField>
          </div>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={saveState} onClick={handleSaveLocation} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Social Links */}
      <SettingsCard>
        <SettingsCardHeader
          title="Social Links"
          description="Add your social media and contact links. Displayed on checkout pages to build customer trust."
        />
        <SettingsCardBody>
          <div className="space-y-3">
            <SocialRow
              icon={Facebook}
              label="Facebook Page"
              placeholder="https://facebook.com/yourpage"
              value={data.social_links.fb_page}
              onChange={(v) => updateSocial('fb_page', v)}
              color="#1877F2"
            />
            <SocialRow
              icon={MessageCircle}
              label="Messenger"
              placeholder="https://m.me/yourpage"
              value={data.social_links.messenger}
              onChange={(v) => updateSocial('messenger', v)}
              color="#0099FF"
            />
            <SocialRow
              icon={MessageCircle}
              label="WhatsApp"
              placeholder="https://wa.me/8801XXXXXXXXX"
              value={data.social_links.whatsapp}
              onChange={(v) => updateSocial('whatsapp', v)}
              color="#25D366"
            />
            <SocialRow
              icon={Send}
              label="Telegram"
              placeholder="https://t.me/yourusername"
              value={data.social_links.telegram}
              onChange={(v) => updateSocial('telegram', v)}
              color="#2AABEE"
            />
            <SocialRow
              icon={Youtube}
              label="YouTube"
              placeholder="https://youtube.com/@yourchannel"
              value={data.social_links.youtube}
              onChange={(v) => updateSocial('youtube', v)}
              color="#FF0000"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={socialSaveState} onClick={handleSaveSocial} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Meta Pixel */}
      <SettingsCard>
        <SettingsCardHeader
          title="Meta Pixel"
          description="Track conversions and retarget customers with Facebook/Meta advertising. Your pixel data stays private."
        />
        <SettingsCardBody>
          <SettingsRow
            label="Enable Meta Pixel"
            description="Fire pixel events on your payment pages"
          >
            <SettingsToggle
              checked={data.meta_pixel.enabled}
              onChange={(v) => updatePixel('enabled', v)}
            />
          </SettingsRow>

          {data.meta_pixel.enabled && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
              <FormField label="Pixel ID" hint="Found in Meta Events Manager">
                <SettingsInput
                  value={data.meta_pixel.pixel_id}
                  onChange={(v) => updatePixel('pixel_id', v)}
                  placeholder="123456789012345"
                  className="font-mono"
                />
              </FormField>

              <FormField label="Access Token" hint="Conversions API access token (optional)">
                <SettingsInput
                  value={data.meta_pixel.access_token}
                  onChange={(v) => updatePixel('access_token', v)}
                  placeholder="EAAxxxxxxxxx..."
                  className="font-mono text-xs"
                  type="password"
                />
              </FormField>

              <FormField label="Test Event Code" hint="For testing events in Events Manager (optional)">
                <SettingsInput
                  value={data.meta_pixel.test_event_code}
                  onChange={(v) => updatePixel('test_event_code', v)}
                  placeholder="TEST12345"
                  className="font-mono"
                />
              </FormField>

              <FormField label="Trigger Event On">
                <SettingsSelect
                  value={data.meta_pixel.trigger_on}
                  onChange={(v) => updatePixel('trigger_on', v)}
                  options={PIXEL_TRIGGERS}
                />
              </FormField>
            </div>
          )}
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={pixelSaveState} onClick={handleSavePixel} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Domain Verification */}
      <SettingsCard>
        <SettingsCardHeader
          title="Domain Verification"
          description="Verify your website domain to unlock branded payment pages and custom subdomain features."
        />
        <SettingsCardBody>
          {data.is_domain_verified ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Domain Verified</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Your domain has been successfully verified.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Add the meta tag below to your website's <code className="font-mono text-xs">&lt;head&gt;</code> section, then click Verify.
                </p>
              </div>

              <FormField label="Verification Meta Tag" hint="Copy this and add it to your website's HTML head">
                <div className="relative">
                  <code className="block w-full text-xs font-mono bg-[var(--muted)] text-[var(--foreground)] p-3 rounded-xl border border-[var(--border)] pr-12 break-all leading-relaxed">
                    {`<meta name="xp-verify" content="${data.domain_verify_code}" />`}
                  </code>
                  <div className="absolute top-2 right-2">
                    <CopyButton
                      text={`<meta name="xp-verify" content="${data.domain_verify_code}" />`}
                    />
                  </div>
                </div>
              </FormField>
            </div>
          )}
        </SettingsCardBody>
        {!data.is_domain_verified && (
          <SettingsCardFooter>
            <button
              onClick={handleVerifyDomain}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {verifying ? (
                <><RefreshCw size={14} className="animate-spin" /> Verifying…</>
              ) : (
                <><Globe size={14} /> Verify Domain</>
              )}
            </button>
          </SettingsCardFooter>
        )}
      </SettingsCard>
    </SettingsSection>
  );
}
