'use client';

import { useState, useEffect } from 'react';
import { Send, UserPlus, Shield, Trash2, Mail, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // ড্যাশবোর্ড লোড হলে ইউজারের Business ID এবং টিম মেম্বার ফেচ করা
  useEffect(() => {
    const fetchTeam = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('merchant_id', user.id)
        .single();

      if (business) {
        setBusinessId(business.id);
        const { data: teamData } = await supabase
          .from('business_team_members')
          .select('*, user:user_id(email, raw_user_meta_data)')
          .eq('business_id', business.id);
        
        if (teamData) setMembers(teamData);
      }
    };
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return toast.error("Business profile not found.");

    setLoading(true);
    try {
      const res = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, business_id: businessId })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Invitation sent successfully!");
        setEmail('');
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your workspace members and their roles.</p>
      </div>

      {/* Invite Member Section */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Team Member</h2>
          </div>
        </div>

        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 uppercase ml-1 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" required placeholder="member@company.com" 
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase ml-1 block mb-1.5">Assign Role</label>
            <select 
              value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white appearance-none"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="support">Support</option>
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="md:col-span-3 pt-2">
            <button disabled={loading} className="w-full md:w-auto px-8 bg-gradient-to-r from-blue-600 to-blue-700 disabled:opacity-70 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all">
              {loading ? "Sending..." : <><Send size={16} /> Send Invitation</>}
            </button>
          </div>
        </form>
      </div>

      {/* Active Members List */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Active Members</h2>
        
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">No team members added yet.</p>
          ) : members.map((member, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {member.user?.raw_user_meta_data?.full_name?.charAt(0) || <User size={18} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.user?.raw_user_meta_data?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold tracking-wider rounded-lg">
                  <Shield size={12} /> {member.role}
                </span>
                <button className="text-red-400 hover:text-red-600 transition-colors p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}