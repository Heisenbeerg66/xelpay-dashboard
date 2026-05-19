'use client';
// src/components/settings/security/SecuritySection.tsx

import React, { useState } from 'react';
import { ShieldCheck, Key, Fingerprint, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, SettingsRow, FormField, SettingsInput, SettingsToggle,
  SaveButton, Badge, DangerButton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile, SaveState } from '../types';

interface SecuritySectionProps {
  merchant: MerchantProfile;
  onUpdate: (updates: Partial<MerchantProfile>) => void;
}

export function SecuritySection({ merchant, onUpdate }: SecuritySectionProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaveState, setPwSaveState] = useState<SaveState>({ status: 'idle' });
  const [notifSaveState, setNotifSaveState] = useState<SaveState>({ status: 'idle' });
  const [loginNotif, setLoginNotif] = useState(merchant.login_notification_email ?? true);

  // Password strength helper
  const getStrength = (pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '60%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrength(newPw);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwSaveState({ status: 'saving' });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setPwSaveState({ status: 'saved' });
      setTimeout(() => setPwSaveState({ status: 'idle' }), 2500);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      toast.success('Password updated successfully');
    } catch (err: any) {
      setPwSaveState({ status: 'error' });
      setTimeout(() => setPwSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to update password');
    }
  };

  const handleLoginNotifSave = async () => {
    setNotifSaveState({ status: 'saving' });
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ login_notification_email: loginNotif })
        .eq('id', merchant.id);
      if (error) throw error;
      onUpdate({ login_notification_email: loginNotif });
      setNotifSaveState({ status: 'saved' });
      setTimeout(() => setNotifSaveState({ status: 'idle' }), 2500);
      toast.success('Security preferences saved');
    } catch (err: any) {
      setNotifSaveState({ status: 'error' });
      setTimeout(() => setNotifSaveState({ status: 'idle' }), 2500);
      toast.error(err.message ?? 'Failed to save');
    }
  };

  return (
    <SettingsSection title="Security" description="Manage your account security settings and authentication methods.">
      {/* Password */}
      <form onSubmit={handlePasswordChange}>
        <SettingsCard>
          <SettingsCardHeader
            icon={Key}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            title="Change Password"
            description="Use a strong password with at least 8 characters."
          />
          <SettingsCardBody className="space-y-4">
            <FormField label="New Password" required>
              <div className="relative">
                <SettingsInput
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setNewPw(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPw && strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-300', strength.color)}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Password strength: <span className="font-semibold text-[var(--foreground)]">{strength.label}</span>
                  </p>
                </div>
              )}
            </FormField>
            <FormField label="Confirm New Password" required>
              <SettingsInput
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={confirmPw.length > 0 && newPw !== confirmPw}
              />
              {confirmPw.length > 0 && newPw !== confirmPw && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </FormField>
          </SettingsCardBody>
          <SettingsCardFooter>
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-[var(--muted-foreground)]" />
              <p className="text-xs text-[var(--muted-foreground)]">
                After changing your password, you&apos;ll stay logged in on this device.
              </p>
            </div>
            <SaveButton saveState={pwSaveState} label="Update password" />
          </SettingsCardFooter>
        </SettingsCard>
      </form>

      {/* Two-Factor Auth (informational) */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Fingerprint}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
          action={
            <Badge variant={merchant.two_factor_enabled ? 'success' : 'warning'}>
              {merchant.two_factor_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          }
        />
        <SettingsCardBody>
          <div className="flex items-start gap-4 p-4 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
            <Fingerprint size={20} className="text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                TOTP Authenticator App
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                Use Google Authenticator, Authy, or any TOTP-compatible app to generate time-based one-time passwords.
                2FA enrollment is managed through your Supabase auth settings.
              </p>
            </div>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* Login Notifications */}
      <SettingsCard>
        <SettingsCardHeader
          icon={ShieldCheck}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          title="Login Notifications"
          description="Security preferences for your login activity."
        />
        <SettingsCardBody className="divide-y divide-[var(--border)]">
          <SettingsRow
            label="Email me on new sign-in"
            description="Receive an email when your account is accessed from a new device or location."
          >
            <SettingsToggle
              checked={loginNotif}
              onChange={setLoginNotif}
            />
          </SettingsRow>
        </SettingsCardBody>
        <SettingsCardFooter>
          <p className="text-xs text-[var(--muted-foreground)]">
            We strongly recommend keeping login notifications enabled.
          </p>
          <SaveButton saveState={notifSaveState} onClick={handleLoginNotifSave} label="Save" />
        </SettingsCardFooter>
      </SettingsCard>
    </SettingsSection>
  );
}
