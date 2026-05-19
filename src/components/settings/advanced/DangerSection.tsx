'use client';
// src/components/settings/advanced/DangerSection.tsx

import React, { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody,
  SettingsSection, DangerButton, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile } from '../types';

interface DangerSectionProps {
  merchant: MerchantProfile;
}

export function DangerSection({ merchant }: DangerSectionProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const CONFIRM_PHRASE = 'delete my account';

  const handleSignOutAll = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Signed out of all devices');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to sign out');
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setDeleting(true);
    try {
      // Update merchant status to 'deleted' — actual deletion handled by admin
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'deleted' })
        .eq('id', merchant.id);

      if (error) throw error;
      await supabase.auth.signOut();
      toast.success('Account deletion requested. Our team will process it within 48 hours.');
      router.push('/login');
    } catch (err: any) {
      setDeleting(false);
      toast.error(err.message ?? 'Failed to request deletion');
    }
  };

  return (
    <SettingsSection
      title="Danger Zone"
      description="Irreversible and destructive actions. Proceed with extreme caution."
    >
      {/* Sign out all devices */}
      <SettingsCard>
        <SettingsCardHeader
          icon={LogOut}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          title="Sign Out All Devices"
          description="Immediately terminate all active sessions across all devices."
        />
        <SettingsCardBody>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-md">
              This will sign you out of all active sessions. You will need to log in again on each device.
              This action cannot be undone.
            </p>
            <DangerButton
              onClick={handleSignOutAll}
              disabled={loggingOut}
              className="shrink-0"
            >
              {loggingOut && <Loader2 size={13} className="animate-spin" />}
              {loggingOut ? 'Signing out…' : 'Sign out all devices'}
            </DangerButton>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* Delete Account */}
      <SettingsCard >
        <SettingsCardHeader
          icon={Trash2}
          iconColor="text-red-600 dark:text-red-400"
          iconBg="bg-red-50 dark:bg-red-950/40"
          title="Delete Account"
          description="Permanently delete your XelPay account and all associated data."
        />
        <SettingsCardBody>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                This action is irreversible.
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400/80 space-y-1 list-disc list-inside">
                <li>All your transaction history will be deleted</li>
                <li>All businesses and payment gateways will be removed</li>
                <li>Your API keys will be revoked immediately</li>
                <li>All team members will lose access</li>
                <li>This cannot be undone under any circumstances</li>
              </ul>
            </div>

            {!showDeleteConfirm ? (
              <DangerButton onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} />
                I want to delete my account
              </DangerButton>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Type <code className="px-1.5 py-0.5 bg-[var(--muted)] rounded font-mono text-red-600 dark:text-red-400 text-xs">
                    {CONFIRM_PHRASE}
                  </code> to confirm.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  className={cn(
                    'w-full max-w-sm px-3.5 py-2.5 rounded-xl text-sm',
                    'bg-[var(--card)] border-2 border-red-200 dark:border-red-900/50',
                    'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
                    'focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
                    'transition-all'
                  )}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== CONFIRM_PHRASE || deleting}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                      'bg-red-600 hover:bg-red-700 text-white',
                      'disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    {deleting && <Loader2 size={13} className="animate-spin" />}
                    {deleting ? 'Processing…' : 'Delete my account permanently'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </SettingsCardBody>
      </SettingsCard>
    </SettingsSection>
  );
}
