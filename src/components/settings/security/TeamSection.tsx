'use client';
// src/components/settings/security/TeamSection.tsx
// IMPORTANT: Reuses /api/v1/team/* endpoints — no backend changes

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Crown, Code2, Headset, Eye, Loader2,
  Trash2, Mail, Clock, CheckCircle2, AlertCircle, RefreshCw,
  Pencil, Check, ChevronDown, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, Badge, EmptyState, cn,
} from '../shared/SettingsCard';
import type { Role, TeamMember, Invitation, MerchantProfile } from '../types';

const ROLE_CONFIG: Record<Role, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  desc: string;
}> = {
  admin:     { label: 'Admin',     icon: Crown,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30',   border: 'border-violet-200 dark:border-violet-800', desc: 'Full access to all settings, members, and billing.' },
  developer: { label: 'Developer', icon: Code2,   color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-200 dark:border-blue-800',    desc: 'API keys, webhooks, and integrations.' },
  support:   { label: 'Support',   icon: Headset, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', desc: 'View transactions and respond to customer queries.' },
  viewer:    { label: 'Viewer',    icon: Eye,     color: 'text-slate-500 dark:text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/50',      border: 'border-slate-200 dark:border-slate-700',  desc: 'Read-only access to dashboard data.' },
};

const MAX_RESENDS = 2;
const RESEND_COOLDOWN_HOURS = 12;

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide border', cfg.color, cfg.bg, cfg.border)}>
      <Icon size={10} strokeWidth={2.5} />{cfg.label}
    </span>
  );
}

function getInitials(email: string) {
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
function avatarColor(str: string) {
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
}

interface TeamSectionProps {
  merchant: MerchantProfile;
}

export function TeamSection({ merchant }: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(merchant.active_business_id ?? null);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [sendingInvite, setSendingInvite] = useState(false);

  const load = useCallback(async (bId: string) => {
    setLoading(true);
    const [membersRes, invitesRes] = await Promise.all([
      supabase
        .from('business_team_members')
        .select('id,business_id,user_id,role,created_at')
        .eq('business_id', bId),
      supabase
        .from('business_invitations')
        .select('id,business_id,email,role,status,created_at,resend_count,last_resent_at,expires_at')
        .eq('business_id', bId)
        .neq('status', 'accepted'),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (invitesRes.data) setInvitations(invitesRes.data as Invitation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (businessId) load(businessId);
    else setLoading(false);
  }, [businessId, load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const res = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, email: inviteEmail.trim(), role: inviteRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed to send invitation');
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInvitePanel(false);
      load(businessId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!businessId) return;
    if (!confirm('Remove this team member?')) return;
    try {
      const res = await fetch('/api/v1/team/remove-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, businessId }),
      });
      if (!res.ok) throw new Error('Failed to remove member');
      toast.success('Member removed');
      setMembers(m => m.filter(mem => mem.id !== memberId));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!businessId) return;
    try {
      const { error } = await supabase
        .from('business_invitations')
        .update({ status: 'revoked' })
        .eq('id', inviteId);
      if (error) throw error;
      toast.success('Invitation revoked');
      setInvitations(inv => inv.filter(i => i.id !== inviteId));
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to revoke');
    }
  };

  const canResend = (invite: Invitation) => {
    if ((invite.resend_count ?? 0) >= MAX_RESENDS) return false;
    if (invite.last_resent_at) {
      const hrs = (Date.now() - new Date(invite.last_resent_at).getTime()) / (1000 * 60 * 60);
      if (hrs < RESEND_COOLDOWN_HOURS) return false;
    }
    return true;
  };

  if (!businessId) {
    return (
      <SettingsSection title="Team & Roles" description="No active business selected.">
        <SettingsCard>
          <SettingsCardBody>
            <EmptyState
              icon={Users}
              title="No business selected"
              description="Select a business from the sidebar to manage team members."
            />
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Team & Roles" description="Manage who has access to this business and their permissions.">
      {/* Members */}
      <SettingsCard>
        <SettingsCardHeader
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          title={`Team Members ${loading ? '' : `(${members.length})`}`}
          description="People with access to this business dashboard."
          action={
            <button
              onClick={() => setShowInvitePanel(v => !v)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all',
                'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
              )}
            >
              <UserPlus size={13} />
              Invite member
            </button>
          }
        />

        {/* Invite Panel */}
        {showInvitePanel && (
          <div className="mx-6 mb-1 mt-4 p-5 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">Invite a team member</h4>
              <button onClick={() => setShowInvitePanel(false)} className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className={cn(
                    'flex-1 px-3.5 py-2.5 rounded-xl text-sm',
                    'bg-[var(--card)] border border-[var(--border)]',
                    'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]'
                  )}
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Role)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-sm cursor-pointer',
                    'bg-[var(--card)] border border-[var(--border)]',
                    'text-[var(--foreground)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20'
                  )}
                >
                  {(Object.keys(ROLE_CONFIG) as Role[]).map(r => (
                    <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                  ))}
                </select>
              </div>
              <div className={cn('p-3 rounded-xl border text-xs', ROLE_CONFIG[inviteRole].bg, ROLE_CONFIG[inviteRole].border)}>
                <span className={cn('font-semibold', ROLE_CONFIG[inviteRole].color)}>
                  {ROLE_CONFIG[inviteRole].label}:
                </span>{' '}
                <span className="text-[var(--muted-foreground)]">{ROLE_CONFIG[inviteRole].desc}</span>
              </div>
              <button
                type="submit"
                disabled={sendingInvite || !inviteEmail.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {sendingInvite ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                {sendingInvite ? 'Sending…' : 'Send invitation'}
              </button>
            </form>
          </div>
        )}

        <SettingsCardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-[var(--muted)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 bg-[var(--muted)] rounded" />
                    <div className="h-2.5 w-24 bg-[var(--muted)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members yet"
              description="Invite colleagues to collaborate on this business."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between px-6 py-4 group">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white', avatarColor(member.user_id))}>
                      {getInitials(member.user_id)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {member.email ?? member.user_id.slice(0, 8) + '…'}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={member.role} />
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      title="Remove member"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingsCardBody>
      </SettingsCard>

      {/* Pending Invitations */}
      {(loading || invitations.length > 0) && (
        <SettingsCard>
          <SettingsCardHeader
            icon={Mail}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            title={`Pending Invitations ${loading ? '' : `(${invitations.length})`}`}
            description="Invitations waiting to be accepted."
          />
          <SettingsCardBody className="p-0">
            {loading ? (
              <div className="p-6 animate-pulse space-y-3">
                <div className="h-10 bg-[var(--muted)] rounded-xl" />
              </div>
            ) : invitations.length === 0 ? (
              <EmptyState icon={Mail} title="No pending invitations" />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {invitations.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                        <Mail size={14} className="text-[var(--muted-foreground)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{invite.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={10} className="text-[var(--muted-foreground)]" />
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Sent {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={invite.role} />
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        title="Revoke invitation"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SettingsCardBody>
        </SettingsCard>
      )}
    </SettingsSection>
  );
}
