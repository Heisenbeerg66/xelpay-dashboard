'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy, Mail, Send, Facebook, Ticket, Loader2, ChevronRight,
  Plus, Clock, CheckCircle, AlertCircle, MessageSquare, History,
  BookOpen, Code, ArrowRight, ExternalLink, RefreshCw, X, ChevronDown,
  Headphones, Shield, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────
type SupportChannel = { key: string; label: string; value: string; slogan: string; icon: any; href: string; color: string; bg: string };
type Ticket = {
  id: string; ticket_no: string; subject: string; category: string;
  priority: string; message: string; status: string; created_at: string;
  updated_at: string; resolution_note: string | null;
};
type Reply = { id: string; ticket_id: string; sender_type: string; message: string; created_at: string };

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  closed: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-slate-500',
  normal: 'text-blue-600 dark:text-blue-400',
  high: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ── Ticket Detail Drawer ──────────────────────────────────────
function TicketDrawer({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('support_ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
      setReplies(data || []);
      setLoading(false);
    };
    load();
  }, [ticket.id]);

  const sendReply = async () => {
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('support_ticket_replies').insert({
        ticket_id: ticket.id,
        sender_type: 'merchant',
        sender_id: user?.id,
        message: replyMsg.trim(),
      });
      if (error) throw error;
      setReplyMsg('');
      const { data } = await supabase.from('support_ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
      setReplies(data || []);
      toast.success('Reply sent!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111827] w-full max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{ticket.ticket_no}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{ticket.subject}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Original message */}
          <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Message</span>
              <span className="text-[10px] text-slate-400">{fmtDate(ticket.created_at)}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ticket.message}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-blue-600" /></div>
          ) : replies.map(r => (
            <div key={r.id} className={`flex ${r.sender_type === 'merchant' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                r.sender_type === 'merchant'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
              }`}>
                <p className="text-xs font-black mb-1 opacity-70">{r.sender_type === 'admin' ? '🛡️ Support Team' : '👤 You'}</p>
                <p className="text-sm leading-relaxed">{r.message}</p>
                <p className={`text-[10px] mt-2 opacity-60`}>{fmtDate(r.created_at)}</p>
              </div>
            </div>
          ))}

          {ticket.resolution_note && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">✅ Resolution Note</p>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{ticket.resolution_note}</p>
            </div>
          )}
        </div>

        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex gap-2">
              <textarea value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <button onClick={sendReply} disabled={sending || !replyMsg.trim()}
                className="px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SupportPage() {
  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'history'>('contact');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [form, setForm] = useState({
    subject: '', category: 'payment_issue', priority: 'normal', message: ''
  });

  const CATEGORIES = [
    { value: 'payment_issue', label: '💳 Payment Issue' },
    { value: 'integration', label: '🔌 Integration' },
    { value: 'billing', label: '💰 Billing' },
    { value: 'account', label: '👤 Account' },
    { value: 'api', label: '🔧 API / Webhook' },
    { value: 'other', label: '📋 Other' },
  ];
  const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Load channels from site_settings
  useEffect(() => {
    const load = async () => {
      setLoadingChannels(true);
      const { data } = await supabase
        .from('site_settings')
        .select('key_name, value, is_active')
        .in('key_name', ['support_email', 'support_telegram', 'facebook']);

      const map: Record<string, { value: string; is_active: boolean }> = {};
      (data || []).forEach((r: any) => { map[r.key_name] = { value: r.value, is_active: r.is_active !== false }; });

      const defs: Array<Omit<SupportChannel, 'value' | 'href'> & { settingKey: string }> = [
        {
          settingKey: 'support_email',
          key: 'email',
          label: 'Email Support',
          slogan: 'Detailed responses within 24 hours',
          icon: Mail,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          settingKey: 'support_telegram',
          key: 'telegram',
          label: 'Telegram Support',
          slogan: 'Real-time chat with our support team',
          icon: Send,
          color: 'text-sky-600 dark:text-sky-400',
          bg: 'bg-sky-50 dark:bg-sky-900/20',
        },
        {
          settingKey: 'facebook',
          key: 'facebook',
          label: 'Facebook Page',
          slogan: 'Message us on our official Facebook page',
          icon: Facebook,
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
      ];

      const active: SupportChannel[] = defs
        .filter(d => map[d.settingKey]?.is_active && map[d.settingKey]?.value)
        .map(d => {
          const val = map[d.settingKey].value;
          let href = val;
          if (d.key === 'email') href = `mailto:${val}`;
          else if (d.key === 'telegram' && !val.startsWith('http')) href = `https://t.me/${val}`;
          return { ...d, value: val, href };
        });

      setChannels(active);
      setLoadingChannels(false);
    };
    load();
  }, []);

  // Load tickets
  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingTickets(false); return; }
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoadingTickets(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { toast.error('Subject and message are required.'); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('support_tickets').insert({
        merchant_id: user.id,
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        message: form.message.trim(),
      });
      if (error) throw error;
      toast.success('Ticket submitted! We\'ll respond within 24 hours.');
      setForm({ subject: '', category: 'payment_issue', priority: 'normal', message: '' });
      setActiveTab('history');
      loadTickets();
    } catch (e: any) {
      toast.error('Failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400';

  return (
    <>
      <Toaster position="top-center" richColors />
      {selectedTicket && <TicketDrawer ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}

      <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                <LifeBuoy size={20} />
              </div>
              Help & Support
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Our technical team is available 24/7. Average response time: under 2 hours.
            </p>
          </div>
          <Link href="/dashboard/api"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90">
            <BookOpen size={13} /> API Docs
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm flex-wrap gap-1">
          {[
            { id: 'contact', label: 'Contact Us' },
            { id: 'ticket', label: 'New Ticket' },
            { id: 'history', label: `My Tickets${tickets.length > 0 ? ` (${tickets.length})` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            {loadingChannels ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-blue-600" /></div>
            ) : channels.length === 0 ? (
              <div className="text-center py-16">
                <Headphones size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-500">No support channels configured</p>
              </div>
            ) : channels.map(ch => {
              const IconComp = ch.icon;
              return (
                <a key={ch.key} href={ch.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-5 p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ch.bg}`}>
                    <IconComp size={22} className={ch.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{ch.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ch.slogan}</p>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate mt-0.5">{ch.value}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                </a>
              );
            })}

            {/* API Docs Card */}
            <div className="mt-2">
              <Link href="/dashboard/api"
                className="flex items-center gap-5 p-5 bg-slate-900 dark:bg-slate-800 border border-slate-800 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/10">
                  <Code size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white">API Documentation</p>
                  <p className="text-xs text-slate-400 mt-0.5">Endpoints, authentication, webhooks, and code examples</p>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        )}

        {/* New Ticket Tab */}
        {activeTab === 'ticket' && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Ticket size={16} className="text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Submit a Support Ticket</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Subject *</label>
                  <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Message *</label>
                  <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue in detail. Include any relevant transaction IDs, error messages, or screenshots."
                    rows={6}
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield size={12} className="text-emerald-500" />
                <span>Responses within 24 hours</span>
              </div>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20">
                {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : <><Send size={15} /> Submit Ticket</>}
              </button>
            </div>
          </form>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">My Tickets</h2>
              <button onClick={loadTickets} className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {loadingTickets ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-blue-600" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl">
                <Ticket size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-500">No tickets yet</p>
                <button onClick={() => setActiveTab('ticket')} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black">
                  Create First Ticket
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map(ticket => (
                  <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                    className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      ticket.status === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                      ticket.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-900/20' :
                      'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      {ticket.status === 'resolved' ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> :
                       ticket.status === 'in_progress' ? <Clock size={16} className="text-amber-600 dark:text-amber-400" /> :
                       <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{ticket.ticket_no}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-black uppercase ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">{ticket.subject}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(ticket.created_at)}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}