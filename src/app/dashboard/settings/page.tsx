'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, ShieldCheck, Mail, Loader2, X, Plus,
  Building2, Trash2, RefreshCw, Clock, CheckCircle2,
  AlertCircle, Crown, Code2, Headset, Eye, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'admin' | 'developer' | 'support' | 'viewer';

type TeamMember = {
  id: string;
  business_id: string;
  user_id: string;
  role: Role;
  created_at: string;
};

type Invitation = {
  id: string;
  business_id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
  resend_count?: number;
  last_resent_at?: string | null;
  expires_at?: string | null;
};

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<Role, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  admin: {
    label: 'Admin',
    icon: Crown,
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
  },
  developer: {
    label: 'Developer',
    icon: Code2,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  support: {
    label: 'Support',
    icon: Headset,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

const MAX_RESENDS = 2;
const RESEND_COOLDOWN_HOURS = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function getAvatarColor(str: string) {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500',
  ];
  return colors[str.charCodeAt(0) % colors.length];
}

function canResendInvite(invite: Invitation): { allowed: boolean; reason?: string } {
  const count = invite.resend_count ?? 0;
  if (count >= MAX_RESENDS) return { allowed: false, reason: 'Limit reached' };
  if (invite.last_resent_at) {
    const hoursLeft = RESEND_COOLDOWN_HOURS -
      (Date.now() - new Date(invite.last_resent_at).getTime()) / (1000 * 60 * 60);
    if (hoursLeft > 0) return { allowed: false, reason: `Wait ${Math.ceil(hoursLeft)}h` };
  }
  return { allowed: true };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamSettingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [sendingInvite, setSendingInvite] = useState(false);

  // ✅ devices/page.tsx এর exact same pattern — race condition নেই
  useEffect(() => {
    const loadActiveBusiness = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchTeamData(activeId); // ✅ state নির্ভর না করে সরাসরি id পাস
      } else {
        setLoading(false);
      }
    };

    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []); // ✅ empty deps — একবারই mount

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTeamData = async (bizId: string) => {
    setLoading(true);
    try {
      const [{ data: membersData, error: mErr }, { data: invitesData, error: iErr }] =
        await Promise.all([
          supabase.from('business_team_members').select('*').eq('business_id', bizId),
          supabase
            .from('team_invitations')
            .select('*')
            .eq('business_id', bizId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false }),
        ]);
      if (mErr) throw mErr;
      if (iErr) throw iErr;
      setMembers(membersData || []);
      setInvitations(invitesData || []);
    } catch {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // ── Send Invite ────────────────────────────────────────────────────────────
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const response = await fetch('/api/v1/team/invite', { // ✅ সঠিক URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          business_id: businessId,
        }),
      });
      const ct = response.headers.get('content-type');
      if (!ct?.includes('application/json')) {
        throw new Error('Unexpected server response. Please try again.');
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send invitation');
      toast.success('Invitation sent!');
      setIsModalOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      fetchTeamData(businessId);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSendingInvite(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResendInvite = async (invite: Invitation) => {
    const { allowed, reason } = canResendInvite(invite);
    if (!allowed) { toast.error(reason || 'Cannot resend.'); return; }
    setResendingId(invite.id);
    try {
      const response = await fetch('/api/v1/team/invite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_id: invite.id, business_id: businessId }),
      });
      const ct = response.headers.get('content-type');
      if (!ct?.includes('application/json')) throw new Error('Unexpected server response.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to resend');
      toast.success(result.message || 'Invitation resent!');
      if (businessId) fetchTeamData(businessId);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setResendingId(null);
    }
  };

  // ── Revoke ─────────────────────────────────────────────────────────────────
  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', inviteId);
      if (error) throw error;
      toast.success('Invitation revoked.');
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Remove Member ──────────────────────────────────────────────────────────
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return;
    try {
      const { error } = await supabase
        .from('business_team_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      toast.success('Member removed.');
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInviteEmail('');
    setInviteRole('viewer');
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} strokeWidth={2.5} />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Team</p>
      </div>
    );
  }

  // ─── No Business ──────────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <Building2 size={28} className="text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">No Workspace Selected</h2>
          <p className="text-slate-500 text-sm mt-1">Select a business from the sidebar to manage your team.</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <Toaster position="top-center" richColors />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {members.length} active member{members.length !== 1 ? 's' : ''} · {invitations.length} pending invite{invitations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-blue-500/25"
        >
          <UserPlus size={14} strokeWidth={2.5} />
          Invite Member
        </button>
      </div>

      {/* ── Active Members ────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ShieldCheck size={14} className="text-slate-500" />
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
            Active Members
          </span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-md">
            {members.length}
          </span>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
              <Users size={20} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-400">No team members yet</p>
            <p className="text-xs text-slate-400 mt-1">Invite colleagues to collaborate on this workspace.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${getAvatarColor(member.user_id)}`}>
                    {member.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {member.user_id}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Joined {new Date(member.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Pending Invitations ───────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Clock size={14} className="text-amber-500" />
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
            Pending Invitations
          </span>
          {invitations.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-md border border-amber-200 dark:border-amber-800">
              {invitations.length}
            </span>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <CheckCircle2 size={24} className="text-slate-200 dark:text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-400">No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {invitations.map(invite => {
              const resendStatus = canResendInvite(invite);
              const resendCount = invite.resend_count ?? 0;
              const remaining = MAX_RESENDS - resendCount;
              const isResending = resendingId === invite.id;

              return (
                <div key={invite.id} className="px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Email + meta */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{invite.email}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">
                            Sent {new Date(invite.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          {invite.expires_at && (
                            <span className="text-[10px] text-slate-400">
                              · Expires {new Date(invite.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            remaining === 0
                              ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {remaining > 0 ? `${remaining} resend${remaining !== 1 ? 's' : ''} left` : 'No resends left'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                      <RoleBadge role={invite.role} />

                      <button
                        onClick={() => handleResendInvite(invite)}
                        disabled={!resendStatus.allowed || isResending}
                        title={resendStatus.reason || 'Resend invitation'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${
                          resendStatus.allowed && !isResending
                            ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {isResending
                          ? <Loader2 size={11} className="animate-spin" />
                          : <RefreshCw size={11} strokeWidth={2.5} />
                        }
                        {isResending ? 'Sending...' : (resendStatus.reason ?? 'Resend')}
                      </button>

                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all"
                      >
                        <X size={11} strokeWidth={2.5} />
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Role Reference ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Role Permissions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            const desc: Record<Role, string> = {
              admin: 'Full access',
              developer: 'API & webhooks',
              support: 'View & respond',
              viewer: 'Read-only',
            };
            return (
              <div key={role} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <Icon size={13} className={cfg.color} strokeWidth={2.5} />
                <div>
                  <p className={`text-[11px] font-black ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-[10px] text-slate-400">{desc[role]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Invite Modal ──────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserPlus size={15} className="text-blue-600" />
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">Invite Team Member</span>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendInvite} className="p-5 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as Role)}
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="admin">Admin — Full access</option>
                    <option value="developer">Developer — API & webhooks</option>
                    <option value="support">Support — View & respond</option>
                    <option value="viewer">Viewer — Read-only</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Role preview */}
              {(() => {
                const cfg = ROLE_CONFIG[inviteRole];
                const Icon = cfg.icon;
                const roleDesc: Record<Role, string> = {
                  admin: 'Can manage all settings, members, and billing.',
                  developer: 'Can access API keys, webhooks, and integrations.',
                  support: 'Can view transactions and respond to customer queries.',
                  viewer: 'Read-only access to dashboard data.',
                };
                return (
                  <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={13} className={cfg.color} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-xs font-black ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{roleDesc[inviteRole]}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900">
                <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                  An invite link will be emailed. You can resend up to <strong>2 times</strong> with a 12h cooldown.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sendingInvite || !inviteEmail.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/20"
              >
                {sendingInvite
                  ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  : <><Plus size={14} strokeWidth={2.5} /> Send Invitation</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}