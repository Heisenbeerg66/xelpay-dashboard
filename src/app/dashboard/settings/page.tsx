'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, ShieldCheck, Mail, Loader2, X, Plus,
  Building2, Trash2, RefreshCw, Clock, CheckCircle2,
  AlertCircle, Crown, Code2, Headset, Eye, ChevronDown,
  Settings2, Shield, Bell, Globe, ChevronRight, Key,
  Fingerprint, Zap, Pencil, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

type Role = 'admin' | 'developer' | 'support' | 'viewer';
type TeamMember = { id: string; business_id: string; user_id: string; role: Role; created_at: string; };
type Invitation = { id: string; business_id: string; email: string; role: Role; status: 'pending' | 'accepted' | 'revoked'; created_at: string; resend_count?: number; last_resent_at?: string | null; expires_at?: string | null; };
type SettingsTab = 'team' | 'workspace' | 'security' | 'notifications';

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; color: string; bg: string; border: string; dot: string; }> = {
  admin:     { label: 'Admin',     icon: Crown,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20',   border: 'border-violet-200 dark:border-violet-800', dot: 'bg-violet-500' },
  developer: { label: 'Developer', icon: Code2,   color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-200 dark:border-blue-800',    dot: 'bg-blue-500' },
  support:   { label: 'Support',   icon: Headset, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  viewer:    { label: 'Viewer',    icon: Eye,     color: 'text-slate-500 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800',       border: 'border-slate-200 dark:border-slate-700',  dot: 'bg-slate-400' },
};

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'team', label: 'Team', icon: Users },
  { id: 'workspace', label: 'Workspace', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Alerts', icon: Bell },
];

const MAX_RESENDS = 2;
const RESEND_COOLDOWN_HOURS = 12;

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon size={10} strokeWidth={2.5} />{cfg.label}
    </span>
  );
}

function getAvatarColor(str: string) {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500'];
  return colors[str.charCodeAt(0) % colors.length];
}

function canResendInvite(invite: Invitation): { allowed: boolean; reason?: string } {
  const count = invite.resend_count ?? 0;
  if (count >= MAX_RESENDS) return { allowed: false, reason: 'Limit reached' };
  if (invite.last_resent_at) {
    const hoursLeft = RESEND_COOLDOWN_HOURS - (Date.now() - new Date(invite.last_resent_at).getTime()) / (1000 * 60 * 60);
    if (hoursLeft > 0) return { allowed: false, reason: `Wait ${Math.ceil(hoursLeft)}h` };
  }
  return { allowed: true };
}

function MemberRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="w-40 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
      <div className="w-16 h-6 bg-slate-100 dark:bg-slate-800 rounded-md" />
    </div>
  );
}

function SectionHeader({ icon: Icon, iconBg, iconColor, title, count, countVariant = 'default' }: any) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={13} className={iconColor} strokeWidth={2} />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">{title}</span>
      {count !== undefined && (
        <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${countVariant === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{count}</span>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-800">
        <Icon size={18} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{title}</p>
      {description && <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 max-w-[220px] leading-relaxed">{description}</p>}
    </div>
  );
}

function RoleDropdown({ memberId, currentRole, businessId, onUpdated }: { memberId: string; currentRole: Role; businessId: string; onUpdated: (newRole: Role) => void; }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) { setOpen(false); return; }
    setUpdating(true);
    try {
      const res = await fetch('/api/v1/team/remove-member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, businessId, newRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update role');
      toast.success(`Role updated to ${ROLE_CONFIG[newRole].label}`);
      onUpdated(newRole);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={updating}
        className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
        title="Change role"
      >
        {updating ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} strokeWidth={2} />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
          {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            return (
              <button key={role} onClick={() => handleRoleChange(role)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Icon size={12} className={cfg.color} strokeWidth={2.5} />
                <span className="text-slate-700 dark:text-slate-300">{cfg.label}</span>
                {role === currentRole && <Check size={11} className="ml-auto text-blue-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkspaceTab() {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <SectionHeader icon={Building2} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-500" title="General Information" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Business Name</label>
            <input type="text" disabled className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Slug / Handle</label>
            <input type="text" disabled className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <Zap size={12} className="text-blue-500 shrink-0" />
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Manage workspace settings from Brand Settings in the sidebar.</p>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const items = [
    { icon: Key, label: 'API Keys', description: 'Manage your API credentials' },
    { icon: Fingerprint, label: 'Authentication', description: 'Two-factor & session management' },
    { icon: Shield, label: 'Permissions', description: 'Role access control' },
  ];
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/60">
      {items.map(item => (
        <div key={item.label} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <item.icon size={16} className="text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-slate-300 dark:text-slate-600" />
        </div>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { label: 'Payment received', description: 'When a new payment comes in', enabled: true },
    { label: 'Team changes', description: 'Member joined, left or role changed', enabled: true },
    { label: 'Subscription alerts', description: 'Plan renewal and expiry notices', enabled: false },
    { label: 'Security events', description: 'Login from new device or location', enabled: true },
  ];
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/60">
      {items.map(item => (
        <div key={item.label} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
          </div>
          <div className={`w-10 h-5 rounded-full flex items-center transition-colors cursor-pointer px-0.5 ${item.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('team');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const loadActiveBusiness = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) { setBusinessId(activeId); fetchTeamData(activeId); }
      else setLoading(false);
    };
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const fetchTeamData = async (bizId: string) => {
    setLoading(true);
    try {
      const [{ data: membersData, error: mErr }, { data: invitesData, error: iErr }] = await Promise.all([
        supabase.from('business_team_members').select('*').eq('business_id', bizId),
        supabase.from('team_invitations').select('*').eq('business_id', bizId).eq('status', 'pending').order('created_at', { ascending: false }),
      ]);
      if (mErr) throw mErr;
      if (iErr) throw iErr;
      setMembers(membersData || []);
      setInvitations(invitesData || []);
    } catch { toast.error('Failed to load team data'); }
    finally { setLoading(false); }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const response = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole, business_id: businessId }),
      });
      const ct = response.headers.get('content-type');
      if (!ct?.includes('application/json')) throw new Error('Unexpected server response. Please try again.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send invitation');
      toast.success('Invitation sent!');
      setIsModalOpen(false); setInviteEmail(''); setInviteRole('viewer');
      fetchTeamData(businessId);
    } catch (err: any) { toast.error(err.message || 'Something went wrong.'); }
    finally { setSendingInvite(false); }
  };

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
    } catch (err: any) { toast.error(err.message || 'Something went wrong.'); }
    finally { setResendingId(null); }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      const { error } = await supabase.from('team_invitations').update({ status: 'revoked' }).eq('id', inviteId);
      if (error) throw error;
      toast.success('Invitation revoked.');
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) { toast.error(err.message); }
  };

  // ✅ API call — auth + merchants + subscriptions + affiliate_wallets সব cleanup
  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm('Remove this team member? Their team account will be deleted.')) return;
    setRemovingId(member.id);
    try {
      const res = await fetch('/api/v1/team/remove-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id, businessId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to remove member');
      toast.success('Member removed successfully.');
      setMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (err: any) { toast.error(err.message); }
    finally { setRemovingId(null); }
  };

  const handleRoleUpdated = (memberId: string, newRole: Role) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const closeModal = () => { setIsModalOpen(false); setInviteEmail(''); setInviteRole('viewer'); };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2"><div className="w-32 h-5 bg-slate-100 dark:bg-slate-800 rounded-lg" /><div className="w-48 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg" /></div>
          <div className="w-32 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center animate-pulse">
            <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="w-28 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
          <MemberRowSkeleton /><MemberRowSkeleton /><MemberRowSkeleton />
        </div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 p-6">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <Building2 size={24} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">No Workspace Selected</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">Select a business from the sidebar to manage your team and settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16">
      <Toaster position="top-center" richColors />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Settings2 size={15} className="text-slate-400" strokeWidth={2} />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 pl-[23px]">Manage your workspace, team, and preferences</p>
        </div>
        {activeTab === 'team' && (
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/25 shrink-0">
            <UserPlus size={13} strokeWidth={2.5} />Invite Member
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
        {SETTINGS_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/40'}`}
            >
              <Icon size={13} strokeWidth={2} className={isActive ? 'text-blue-600' : ''} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-[9px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active Members', value: members.length, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Pending Invites', value: invitations.length, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Total Seats', value: members.length + invitations.length, color: 'text-slate-600 dark:text-slate-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3.5">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <SectionHeader icon={ShieldCheck} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-500 dark:text-slate-400" title="Active Members" count={members.length} />
            {members.length === 0 ? (
              <EmptyState icon={Users} title="No team members yet" description="Invite colleagues to collaborate on this workspace." />
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(member.user_id)}`}>
                        {member.user_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight">{member.user_id}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Joined {new Date(member.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={member.role} />
                      <RoleDropdown memberId={member.id} currentRole={member.role} businessId={businessId} onUpdated={(newRole) => handleRoleUpdated(member.id, newRole)} />
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingId === member.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                        title="Remove member"
                      >
                        {removingId === member.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} strokeWidth={2} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <SectionHeader icon={Clock} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500" title="Pending Invitations" count={invitations.length} countVariant={invitations.length > 0 ? 'amber' : 'default'} />
            {invitations.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No pending invitations" />
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {invitations.map(invite => {
                  const resendStatus = canResendInvite(invite);
                  const remaining = MAX_RESENDS - (invite.resend_count ?? 0);
                  const isResending = resendingId === invite.id;
                  return (
                    <div key={invite.id} className="px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            <Mail size={13} className="text-slate-400" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{invite.email}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400">{new Date(invite.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                              {invite.expires_at && <><span className="text-[10px] text-slate-300 dark:text-slate-700">·</span><span className="text-[10px] text-slate-400">Expires {new Date(invite.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span></>}
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${remaining === 0 ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {remaining > 0 ? `${remaining} resend${remaining !== 1 ? 's' : ''} left` : 'No resends left'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                          <RoleBadge role={invite.role} />
                          <button onClick={() => handleResendInvite(invite)} disabled={!resendStatus.allowed || isResending} title={resendStatus.reason || 'Resend invitation'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${resendStatus.allowed && !isResending ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed'}`}>
                            {isResending ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} strokeWidth={2.5} />}
                            {isResending ? 'Sending' : (resendStatus.reason ?? 'Resend')}
                          </button>
                          <button onClick={() => handleRevokeInvite(invite.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all">
                            <X size={10} strokeWidth={2.5} /> Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Role Permissions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
                const cfg = ROLE_CONFIG[role];
                const desc: Record<Role, string> = { admin: 'Full access', developer: 'API & webhooks', support: 'View & respond', viewer: 'Read-only' };
                return (
                  <div key={role} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div>
                      <p className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{desc[role]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workspace' && <WorkspaceTab />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'notifications' && <NotificationsTab />}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full sm:max-w-md bg-white dark:bg-[#111827] sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserPlus size={14} className="text-blue-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Invite Team Member</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send an email invitation</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSendInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                  <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                <div className="relative">
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer">
                    <option value="admin">Admin — Full access</option>
                    <option value="developer">Developer — API & webhooks</option>
                    <option value="support">Support — View & respond</option>
                    <option value="viewer">Viewer — Read-only</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={2} />
                </div>
              </div>
              {(() => {
                const cfg = ROLE_CONFIG[inviteRole];
                const Icon = cfg.icon;
                const roleDesc: Record<Role, string> = { admin: 'Can manage all settings, members, and billing.', developer: 'Can access API keys, webhooks, and integrations.', support: 'Can view transactions and respond to customer queries.', viewer: 'Read-only access to dashboard data.' };
                return (
                  <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                      <Icon size={13} className={cfg.color} strokeWidth={2} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{roleDesc[inviteRole]}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <AlertCircle size={12} className="text-blue-500 mt-0.5 shrink-0" strokeWidth={2} />
                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                  An invite link will be emailed. You can resend up to <strong>2 times</strong> with a 12-hour cooldown.
                </p>
              </div>
              <button type="submit" disabled={sendingInvite || !inviteEmail.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/20">
                {sendingInvite ? <><Loader2 size={13} className="animate-spin" /> Sending invitation…</> : <><Plus size={13} strokeWidth={2.5} /> Send Invitation</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}