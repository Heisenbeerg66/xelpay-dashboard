'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Mail, Shield, Plus, Loader2, X, Trash2,
  CheckCircle2, Clock, Building2, UserPlus, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────
type Role = 'admin' | 'developer' | 'support' | 'viewer';

type TeamMember = {
  id: string;
  business_id: string;
  user_id: string;
  role: Role;
  added_at: string;
  user_email?: string;
};

type Invitation = {
  id: string;
  business_id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
};

export default function TeamSettingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [sendingInvite, setSendingInvite] = useState(false);

  const loadActiveBusiness = useCallback(() => {
    const activeId = localStorage.getItem('active_business_id');
    if (activeId !== businessId) {
      setBusinessId(activeId);
    } else if (!activeId) {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, [loadActiveBusiness]);

  useEffect(() => {
    if (businessId) {
      fetchTeamData(businessId);
    }
  }, [businessId]);

  const fetchTeamData = async (bizId: string) => {
    setLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('business_team_members')
        .select('*')
        .eq('business_id', bizId);

      const { data: invitesData, error: invitesError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('business_id', bizId)
        .eq('status', 'pending');

      if (membersError) throw membersError;
      if (invitesError) throw invitesError;

      setMembers(membersData || []);
      setInvitations(invitesData || []);
    } catch (error: any) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // --- FIX: সরাসরি API Route কল করা হচ্ছে যাতে মেইল যায় ---
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      const response = await fetch('/api/business/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          business_id: businessId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to send invitation');
      }

      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      fetchTeamData(businessId);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Revoke invitation?')) return;
    try {
      const { error } = await supabase.from('team_invitations').delete().eq('id', inviteId);
      if (error) throw error;
      toast.success('Invitation revoked.');
      setInvitations(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove member?')) return;
    try {
      const { error } = await supabase.from('business_team_members').delete().eq('id', memberId);
      if (error) throw error;
      toast.success('Member removed.');
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleBadge = (role: Role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      developer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      support: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[role]}`}>{role}</span>;
  };

  if (loading) return <div className="min-h-[60vh] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-500 mb-3" size={36} /><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Team</p></div>;

  if (!businessId) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center"><div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><Building2 size={32} className="text-slate-400" /></div><h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Workspace Selected</h2><p className="text-slate-500 mt-2 font-medium text-sm">Please select a business from the sidebar.</p></div>;

  return (
    <div className="w-full space-y-8 pb-10">
      <Toaster position="top-center" richColors />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center"><Users size={20} /></div>Team Management</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Manage members, roles, and pending invitations.</p>
        </div>
        <button onClick={() => setIsInviteModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest shrink-0"><UserPlus size={16} /> Invite Member</button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30">
            <Shield size={18} className="text-slate-500" /><h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Members ({members.length})</h2>
          </div>
          {members.length === 0 ? <div className="py-12 text-center text-slate-400"><Users size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-bold">No active members.</p></div> : 
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">{members.map(member => (
            <div key={member.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">{(member.user_email || 'U')[0].toUpperCase()}</div>
                <div><p className="text-sm font-bold text-slate-900 dark:text-white">{member.user_email || 'User ID: ' + member.user_id.slice(0, 8)}</p><p className="text-[10px] text-slate-400 uppercase">Joined: {new Date(member.added_at).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center gap-4">{getRoleBadge(member.role)}<button onClick={() => handleRemoveMember(member.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></div>
            </div>
          ))}</div>}
        </div>

        {invitations.length > 0 && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-amber-50/30 dark:bg-amber-900/10">
              <Clock size={18} className="text-amber-500" /><h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Pending Invitations ({invitations.length})</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">{invitations.map(invite => (
              <div key={invite.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center text-slate-400"><Mail size={16} /></div><div><p className="text-sm font-bold text-slate-900 dark:text-white">{invite.email}</p><p className="text-[10px] text-slate-400 uppercase">Sent: {new Date(invite.created_at).toLocaleDateString()}</p></div></div>
                <div className="flex items-center gap-4">{getRoleBadge(invite.role)}<button onClick={() => handleRevokeInvite(invite.id)} className="text-[11px] font-black uppercase text-slate-500 hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors">Revoke</button></div>
              </div>
            ))}</div>
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Mail size={18} /></div><span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Send Invitation</span></div>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-600 transition-colors"><X size={16} strokeWidth={2.5} /></button>
            </div>
            <form onSubmit={handleSendInvite} className="p-6 space-y-5">
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Email Address</label><input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Assign Role</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"><option value="admin">Admin</option><option value="developer">Developer</option><option value="support">Support</option><option value="viewer">Viewer</option></select></div>
              <button type="submit" disabled={sendingInvite || !inviteEmail.trim()} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm uppercase rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all">{sendingInvite ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{sendingInvite ? 'Sending...' : 'Send Invite Link'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}