'use client';
// src/components/settings/appearance/AppearanceSection.tsx

import React, { useState, useEffect } from 'react';
import { SunMoon, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, SettingsRow, SettingsToggle, SaveButton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile, AppearancePrefs, SaveState } from '../types';

const ACCENT_COLORS = [
  { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { id: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { id: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

const DENSITY_OPTIONS = [
  { id: 'comfortable', label: 'Comfortable', desc: 'More space between elements' },
  { id: 'compact', label: 'Compact', desc: 'Less space, more data visible' },
  { id: 'cozy', label: 'Cozy', desc: 'Balanced spacing' },
];

interface AppearanceSectionProps {
  merchant: MerchantProfile;
  initialPrefs?: AppearancePrefs | null;
}

export function AppearanceSection({ merchant, initialPrefs }: AppearanceSectionProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<AppearancePrefs>({
    theme: (initialPrefs?.theme ?? 'system') as AppearancePrefs['theme'],
    accent_color: initialPrefs?.accent_color ?? 'blue',
    sidebar_style: initialPrefs?.sidebar_style ?? 'expanded',
    density: initialPrefs?.density ?? 'comfortable',
    font_size: initialPrefs?.font_size ?? 'md',
  });
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });

  useEffect(() => { setMounted(true); }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setPrefs(p => ({ ...p, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleSave = async () => {
    setSaveState({ status: 'saving' });
    try {
      const { error } = await supabase
        .from('merchant_appearance_prefs')
        .upsert({
          merchant_id: merchant.id,
          ...prefs,
        }, { onConflict: 'merchant_id' });

      if (error) throw error;
      setSaveState({ status: 'saved' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.success('Appearance preferences saved');
    } catch (err: any) {
      setSaveState({ status: 'error' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Save failed');
    }
  };

  const themes: { id: 'light' | 'dark' | 'system'; label: string; Icon: React.ElementType }[] = [
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
    { id: 'system', label: 'System', Icon: Monitor },
  ];

  return (
    <SettingsSection title="Appearance" description="Customize how XelPay looks and feels for you.">
      {/* Theme */}
      <SettingsCard>
        <SettingsCardHeader
          icon={SunMoon}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          title="Theme"
          description="Choose your preferred color scheme."
        />
        <SettingsCardBody>
          {mounted && (
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ id, label, Icon }) => {
                const active = prefs.theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleThemeChange(id)}
                    className={cn(
                      'relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200',
                      active
                        ? 'border-[var(--foreground)] bg-[var(--foreground)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/50 bg-transparent'
                    )}
                  >
                    {/* Preview */}
                    <div className={cn(
                      'w-full h-16 rounded-xl overflow-hidden border border-[var(--border)]',
                      id === 'light' && 'bg-white',
                      id === 'dark' && 'bg-gray-900',
                      id === 'system' && 'bg-gradient-to-br from-white to-gray-900'
                    )}>
                      <div className={cn(
                        'w-full h-6 border-b',
                        id === 'light' && 'bg-gray-100 border-gray-200',
                        id === 'dark' && 'bg-gray-800 border-gray-700',
                        id === 'system' && 'bg-gradient-to-r from-gray-100 to-gray-800 border-transparent'
                      )} />
                      <div className="p-2 space-y-1.5">
                        <div className={cn('h-1.5 w-3/4 rounded-full', id === 'dark' ? 'bg-gray-700' : 'bg-gray-200')} />
                        <div className={cn('h-1.5 w-1/2 rounded-full', id === 'dark' ? 'bg-gray-700' : 'bg-gray-200')} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'} />
                      <span className={cn(
                        'text-xs font-semibold',
                        active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                      )}>
                        {label}
                      </span>
                    </div>
                    {active && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[var(--foreground)] flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="var(--background)">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </SettingsCardBody>
      </SettingsCard>

      {/* Accent Color */}
      <SettingsCard>
        <SettingsCardHeader
          icon={SunMoon}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          title="Accent Color"
          description="Choose your preferred accent color."
        />
        <SettingsCardBody>
          <div className="flex items-center gap-3 flex-wrap">
            {ACCENT_COLORS.map(color => {
              const active = prefs.accent_color === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setPrefs(p => ({ ...p, accent_color: color.id }))}
                  title={color.label}
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
                    color.class,
                    active ? 'scale-110 ring-2 ring-offset-2 ring-[var(--foreground)]/30 ring-offset-[var(--background)]' : 'hover:scale-105 opacity-75 hover:opacity-100'
                  )}
                >
                  {active && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-3">
            Currently: <span className="font-semibold capitalize text-[var(--foreground)]">{prefs.accent_color}</span>
          </p>
        </SettingsCardBody>
      </SettingsCard>

      {/* Density */}
      <SettingsCard>
        <SettingsCardHeader
          icon={SunMoon}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          title="Interface Density"
          description="Control how compact the dashboard feels."
        />
        <SettingsCardBody>
          <div className="space-y-2">
            {DENSITY_OPTIONS.map(opt => {
              const active = prefs.density === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPrefs(p => ({ ...p, density: opt.id as AppearancePrefs['density'] }))}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
                    active
                      ? 'border-[var(--foreground)] bg-[var(--foreground)]/5'
                      : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/50'
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-medium', active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 transition-colors',
                    active ? 'border-[var(--foreground)] bg-[var(--foreground)]' : 'border-[var(--border)]'
                  )}>
                    {active && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--background)]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </SettingsCardBody>
        <SettingsCardFooter>
          <p className="text-xs text-[var(--muted-foreground)]">
            Preferences are saved per account.
          </p>
          <SaveButton saveState={saveState} onClick={handleSave} label="Save preferences" />
        </SettingsCardFooter>
      </SettingsCard>
    </SettingsSection>
  );
}
