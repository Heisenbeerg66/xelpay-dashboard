'use client';
// src/components/settings/sessions/SessionsSection.tsx

import React, { useState, useEffect } from 'react';
import {
  MonitorSmartphone, Laptop, Smartphone, Globe,
  CheckCircle2, Shield, Loader2, MapPin, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, Badge, DangerButton, EmptyState, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile } from '../types';

interface SessionData {
  id: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

// Simple UA parser
function parseUA(ua: string): { browser: string; os: string; icon: React.ElementType } {
  const b = ua.toLowerCase();
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let icon: React.ElementType = Globe;

  if (b.includes('chrome') && !b.includes('edg')) browser = 'Chrome';
  else if (b.includes('firefox')) browser = 'Firefox';
  else if (b.includes('safari') && !b.includes('chrome')) browser = 'Safari';
  else if (b.includes('edg')) browser = 'Edge';
  else if (b.includes('opera') || b.includes('opr')) browser = 'Opera';

  if (b.includes('windows')) { os = 'Windows'; icon = Laptop; }
  else if (b.includes('mac os')) { os = 'macOS'; icon = Laptop; }
  else if (b.includes('linux')) { os = 'Linux'; icon = Laptop; }
  else if (b.includes('android')) { os = 'Android'; icon = Smartphone; }
  else if (b.includes('iphone') || b.includes('ipad')) { os = 'iOS'; icon = Smartphone; }

  return { browser, os, icon };
}

function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface SessionsSectionProps {
  merchant: MerchantProfile;
}

export function SessionsSection({ merchant }: SessionsSectionProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    // Try merchant_auth_sessions table first
    const { data, error } = await supabase
      .from('merchant_auth_sessions')
      .select('*')
      .eq('merchant_id', merchant.id)
      .is('revoked_at', null)
      .order('last_active', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      setSessions(data);
    } else {
      // Fallback: synthesize current session from auth
      const { data: authData } = await supabase.auth.getSession();
      if (authData.session) {
        const synth: SessionData = {
          id: authData.session.access_token.slice(0, 8),
          device_name: 'Current device',
          browser: navigator.userAgent,
          os: null,
          ip_address: null,
          location: null,
          is_current: true,
          last_active: new Date().toISOString(),
          created_at: new Date(authData.session.created_at ?? Date.now()).toISOString(),
        };
        setSessions([synth]);
      }
    }
    setLoading(false);
  };

  const handleRevokeAll = async () => {
    if (!confirm('Sign out of all other devices? You will remain signed in on this device.')) return;
    setRevokingAll(true);
    try {
      // Supabase global signout signs out all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Mark all non-current sessions as revoked in our table
      await supabase
        .from('merchant_auth_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('merchant_id', merchant.id)
        .eq('is_current', false);

      setSessions(s => s.filter(sess => sess.is_current));
      toast.success('Signed out of all other devices');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to sign out');
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <SettingsSection
      title="Devices & Sessions"
      description="Monitor and manage all active sessions on your account."
    >
      <SettingsCard>
        <SettingsCardHeader
          icon={MonitorSmartphone}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          title="Active Sessions"
          description="Devices currently signed in to your account."
          action={
            sessions.filter(s => !s.is_current).length > 0 ? (
              <DangerButton onClick={handleRevokeAll} disabled={revokingAll}>
                {revokingAll && <Loader2 size={12} className="animate-spin" />}
                Sign out all others
              </DangerButton>
            ) : undefined
          }
        />
        <SettingsCardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-[var(--muted)] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 bg-[var(--muted)] rounded" />
                    <div className="h-2.5 w-32 bg-[var(--muted)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={MonitorSmartphone}
              title="No active sessions"
              description="You don't have any active sessions at the moment."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {sessions.map(session => {
                const uaStr = session.browser ?? 'Unknown';
                const parsed = parseUA(uaStr);
                const Icon = parsed.icon;

                return (
                  <div key={session.id} className={cn(
                    'flex items-center gap-4 px-6 py-5',
                    session.is_current && 'bg-[var(--muted)]/30'
                  )}>
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      session.is_current
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50'
                        : 'bg-[var(--muted)] border border-[var(--border)]'
                    )}>
                      <Icon
                        size={18}
                        className={session.is_current ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--muted-foreground)]'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {session.device_name ?? `${parsed.browser} on ${parsed.os}`}
                        </p>
                        {session.is_current && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            <CheckCircle2 size={9} />
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {session.ip_address && (
                          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Globe size={10} />
                            {session.ip_address}
                          </span>
                        )}
                        {session.location && (
                          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <MapPin size={10} />
                            {session.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Clock size={10} />
                          {timeAgo(session.last_active)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SettingsCardBody>
        <SettingsCardFooter>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Shield size={12} />
            <span>Sessions expire after 30 days of inactivity.</span>
          </div>
        </SettingsCardFooter>
      </SettingsCard>
    </SettingsSection>
  );
}
