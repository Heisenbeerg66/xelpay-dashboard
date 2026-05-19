'use client';
// src/components/settings/profile/ProfileSection.tsx

import React, { useState, useRef, useCallback } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, FormField, SettingsInput, SettingsSelect, SaveButton,
  Skeleton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile, SaveState } from '../types';

const TIMEZONES = [
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

interface ProfileSectionProps {
  merchant: MerchantProfile;
  onUpdate: (updates: Partial<MerchantProfile>) => void;
}

export function ProfileSection({ merchant, onUpdate }: ProfileSectionProps) {
  const [form, setForm] = useState({
    name: merchant.name ?? '',
    phone: merchant.phone ?? '',
    address: merchant.address ?? '',
    timezone: merchant.timezone ?? 'Asia/Dhaka',
    language: merchant.language ?? 'en',
  });
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState({ status: 'saving' });
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          timezone: form.timezone,
          language: form.language,
        })
        .eq('id', merchant.id);

      if (error) throw error;
      onUpdate({ ...form });
      setSaveState({ status: 'saved' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.success('Profile updated');
    } catch (err: any) {
      setSaveState({ status: 'error' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to save');
    }
  };

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `merchant-logos/${merchant.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('merchant-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('merchant-assets')
        .getPublicUrl(path);

      await supabase
        .from('merchants')
        .update({ logo_url: publicUrl })
        .eq('id', merchant.id);

      onUpdate({ logo_url: publicUrl });
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [merchant.id, onUpdate]);

  const initials = (merchant.name ?? 'M')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SettingsSection title="Profile" description="Your personal account information visible across XelPay.">
      <form onSubmit={handleSave}>
        {/* Avatar */}
        <SettingsCard className="mb-4">
          <SettingsCardBody>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {merchant.logo_url ? (
                  <img
                    src={merchant.logo_url}
                    alt={merchant.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--border)]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-[var(--border)]">
                    <span className="text-xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className={cn(
                    'absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center',
                    'shadow-lg border-2 border-[var(--background)] hover:opacity-90 transition-opacity',
                    uploading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {uploading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Camera size={12} />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{merchant.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{merchant.email}</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                  PNG, JPG or WebP · max 2MB
                </p>
              </div>
            </div>
          </SettingsCardBody>
        </SettingsCard>

        {/* Personal Info */}
        <SettingsCard>
          <SettingsCardHeader
            icon={User}
            title="Personal Information"
            description="Update your display name, phone and address."
          />
          <SettingsCardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required>
                <SettingsInput
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                  required
                />
              </FormField>
              <FormField label="Email Address" hint="Contact support to change your email.">
                <SettingsInput
                  value={merchant.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone Number">
                <SettingsInput
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+880 1xxx-xxxxxx"
                  type="tel"
                />
              </FormField>
              <FormField label="Timezone">
                <SettingsSelect value={form.timezone} onChange={set('timezone')}>
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </SettingsSelect>
              </FormField>
            </div>
            <FormField label="Address">
              <SettingsInput
                value={form.address}
                onChange={set('address')}
                placeholder="Your address"
              />
            </FormField>
          </SettingsCardBody>
          <SettingsCardFooter>
            <p className="text-xs text-[var(--muted-foreground)]">
              Member since {merchant.created_at ? new Date(merchant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
            </p>
            <SaveButton saveState={saveState} />
          </SettingsCardFooter>
        </SettingsCard>
      </form>
    </SettingsSection>
  );
}
