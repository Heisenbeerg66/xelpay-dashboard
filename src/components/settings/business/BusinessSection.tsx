'use client';
// src/components/settings/business/BusinessSection.tsx
// Adapter over existing business data — reuses existing supabase queries

import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, DollarSign, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, FormField, SettingsInput, SettingsSelect, SaveButton,
  Skeleton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile, SaveState } from '../types';

const CURRENCIES = [
  { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
];

interface BusinessSectionProps {
  merchant: MerchantProfile;
  onUpdate: (updates: Partial<MerchantProfile>) => void;
}

interface BusinessForm {
  business_name: string;
  website_url: string;
  support_email: string;
  support_phone: string;
  currency: string;
  exchange_rate: string;
}

export function BusinessSection({ merchant, onUpdate }: BusinessSectionProps) {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const [form, setForm] = useState<BusinessForm>({
    business_name: '',
    website_url: '',
    support_email: '',
    support_phone: '',
    currency: 'BDT',
    exchange_rate: '120',
  });

  useEffect(() => {
    if (merchant.active_business_id) {
      loadBusiness(merchant.active_business_id);
    } else {
      // Load from merchant table as fallback
      setForm({
        business_name: merchant.brand_name ?? merchant.name ?? '',
        website_url: merchant.website ?? '',
        support_email: merchant.support_email ?? merchant.email ?? '',
        support_phone: merchant.phone ?? '',
        currency: merchant.currency ?? 'BDT',
        exchange_rate: String(merchant.exchange_rate ?? 120),
      });
      setLoading(false);
    }
  }, [merchant]);

  const loadBusiness = async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setBusinessData(data);
      setForm({
        business_name: data.business_name ?? '',
        website_url: data.website_url ?? '',
        support_email: data.support_email ?? '',
        support_phone: data.support_phone ?? '',
        currency: data.currency ?? 'BDT',
        exchange_rate: String(data.exchange_rate ?? 120),
      });
    }
    setLoading(false);
  };

  const set = (key: keyof BusinessForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState({ status: 'saving' });
    try {
      if (businessData) {
        // Update business table
        const { error } = await supabase
          .from('businesses')
          .update({
            business_name: form.business_name.trim(),
            website_url: form.website_url.trim() || null,
            support_email: form.support_email.trim() || null,
            support_phone: form.support_phone.trim() || null,
            currency: form.currency,
            exchange_rate: parseFloat(form.exchange_rate) || 120,
          })
          .eq('id', businessData.id);
        if (error) throw error;
      } else {
        // Update merchant table
        const { error } = await supabase
          .from('merchants')
          .update({
            brand_name: form.business_name.trim(),
            website: form.website_url.trim() || null,
            support_email: form.support_email.trim() || null,
            phone: form.support_phone.trim() || null,
            currency: form.currency,
            exchange_rate: parseFloat(form.exchange_rate) || 120,
          })
          .eq('id', merchant.id);
        if (error) throw error;
        onUpdate({
          brand_name: form.business_name,
          currency: form.currency,
          exchange_rate: parseFloat(form.exchange_rate),
        });
      }
      setSaveState({ status: 'saved' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.success('Business settings saved');
    } catch (err: any) {
      setSaveState({ status: 'error' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to save');
    }
  };

  if (loading) {
    return (
      <SettingsSection title="Business" description="Loading...">
        <SettingsCard>
          <SettingsCardBody className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Business"
      description="Configure your business details, contact information and currency settings."
    >
      <form onSubmit={handleSave}>
        <SettingsCard>
          <SettingsCardHeader
            icon={Building2}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            title="Business Information"
            description="This information appears on payment pages and receipts."
          />
          <SettingsCardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Business Name" required>
                <SettingsInput
                  value={form.business_name}
                  onChange={set('business_name')}
                  placeholder="Your Business Name"
                  required
                />
              </FormField>
              <FormField label="Website" hint="Optional — shown on checkout pages.">
                <SettingsInput
                  value={form.website_url}
                  onChange={set('website_url')}
                  placeholder="https://yourdomain.com"
                  type="url"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Support Email">
                <SettingsInput
                  value={form.support_email}
                  onChange={set('support_email')}
                  placeholder="support@yourdomain.com"
                  type="email"
                />
              </FormField>
              <FormField label="Support Phone">
                <SettingsInput
                  value={form.support_phone}
                  onChange={set('support_phone')}
                  placeholder="+880 1xxx-xxxxxx"
                  type="tel"
                />
              </FormField>
            </div>
          </SettingsCardBody>
        </SettingsCard>

        {/* Currency */}
        <SettingsCard className="mt-4">
          <SettingsCardHeader
            icon={DollarSign}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            title="Currency & Exchange"
            description="Set the primary currency for your payment processing."
          />
          <SettingsCardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Primary Currency" required>
                <SettingsSelect value={form.currency} onChange={set('currency')}>
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </SettingsSelect>
              </FormField>
              <FormField
                label="Exchange Rate"
                hint={`1 USD = ${form.exchange_rate} ${form.currency}`}
              >
                <SettingsInput
                  value={form.exchange_rate}
                  onChange={set('exchange_rate')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="120"
                />
              </FormField>
            </div>
          </SettingsCardBody>
          <SettingsCardFooter>
            <p className="text-xs text-[var(--muted-foreground)]">
              Currency affects payment amounts shown on checkout.
            </p>
            <SaveButton saveState={saveState} />
          </SettingsCardFooter>
        </SettingsCard>
      </form>
    </SettingsSection>
  );
}
