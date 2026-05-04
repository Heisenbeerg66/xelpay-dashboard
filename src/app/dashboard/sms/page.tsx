'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, Search, Loader2, Smartphone,
  CheckCircle2, Clock, RefreshCw, Building2, Globe, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type SmsTransaction = {
  id: string;
  merchant_id: string;
  business_id?: string;
  sender: string;
  method: string;
  message: string;
  trx_id: string;
  amount: number;
  received_at: string;
  is_used: boolean;
  created_at: string;
};

// ─── Method Text Color Map (No Background) ────────────────────────────────────
const getMethodTextColor = (method: string) => {
  const m = (method || '').toLowerCase().replace(/\s/g, '');
  if (m.includes('bkash')) return 'text-pink-600 dark:text-pink-400';
  if (m.includes('nagad')) return 'text-orange-600 dark:text-orange-400';
  if (m.includes('rocket')) return 'text-purple-600 dark:text-purple-400';
  if (m.includes('upay')) return 'text-blue-600 dark:text-blue-400';
  return 'text-slate-600 dark:text-slate-400';
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// ─── Main Component Body ──────────────────────────────────────────────────────
function SmsDataContent() {
  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState<SmsTransaction[]>([]);
  const [filtered, setFiltered] = useState<SmsTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'business'>('all');
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null); // For Modal

  // Sync Business ID from LocalStorage
  useEffect(() => {
    const loadId = () => setCurrentBusinessId(localStorage.getItem('active_business_id'));
    loadId();
    window.addEventListener('businessChanged', loadId);
    return () => window.removeEventListener('businessChanged', loadId);
  }, []);

  const fetchSMS = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let query = supabase
        .from('sms_transactions')
        .select('id, merchant_id, business_id, sender, method, message, trx_id, amount, received_at, is_used, created_at')
        .eq('merchant_id', user.id)
        .order('received_at', { ascending: false });

      if (activeTab === 'business' && currentBusinessId) {
        query = query.eq('business_id', currentBusinessId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setSmsList(data as SmsTransaction[]);
        setFiltered(data as SmsTransaction[]);
      } else if (error) {
        console.error("Error fetching SMS:", error.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchSMS(); 
  }, [activeTab, currentBusinessId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(smsList);
    } else {
      const q = searchTerm.toLowerCase();
      setFiltered(smsList.filter(s =>
        (s.trx_id && s.trx_id.toLowerCase().includes(q)) ||
        (s.sender && s.sender.toLowerCase().includes(q)) ||
        (s.method && s.method.toLowerCase().includes(q)) ||
        (s.amount && String(s.amount).includes(q))
      ));
    }
  }, [searchTerm, smsList]);

  const totalCount = smsList.length;
  const usedCount = smsList.filter(s => s.is_used).length;
  const pendingCount = smsList.filter(s => !s.is_used).length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* ── Message Modal ── */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" /> Full Message
              </h3>
              <button onClick={() => setSelectedMessage(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar (Redesigned like App Sync Card) ── */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-start md:items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shrink-0 shadow-sm mt-0.5 md:mt-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">
              SMS DATA
            </h1>
            <p className="text-xs md:text-sm font-medium text-blue-700/80 dark:text-blue-300/80 mt-1">
              Real-time feed of all SMS received by your Android automated reader app.
            </p>
          </div>
        </div>

        {/* ── Tabs (Matched with light blue theme) ── */}
        <div className="flex bg-white/60 dark:bg-[#111827]/60 p-1.5 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 w-full xl:w-auto">
          <button onClick={() => setActiveTab('all')}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}>
            <Globe size={16} /> All Merchants
          </button>
          <button onClick={() => setActiveTab('business')}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'business' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}>
            <Building2 size={16} /> Selected Business
          </button>
        </div>
      </div>
            {/* ── Stats Cards (3 Columns on Mobile, Size Increased) ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total SMS</p>
            <p className="text-base sm:text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-emerald-100 dark:border-emerald-900/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Used</p>
            <p className="text-base sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{usedCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-amber-100 dark:border-amber-900/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Unused</p>
            <p className="text-base sm:text-3xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
        </div>
      )}

      {/* ── App Connection Alert ── */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0 mt-0.5"><Smartphone size={18} /></div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-1">Android App Sync Status</h4>
          <p className="text-[11px] sm:text-xs font-medium text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
            Ensure your Android SMS Forwarder app is running in the background. All incoming payment SMS will automatically appear here within 2 seconds.
          </p>
        </div>
      </div>

      {/* ── Controls (Search + Refresh) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search SMS..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all shadow-sm"
          />
        </div>
        <button onClick={fetchSMS}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase mb-2">No SMS Data Found</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
              {searchTerm
                ? 'No SMS matches your search query.'
                : "Your app hasn't forwarded any SMS yet. Make sure the app is running and your API key is correctly set up."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                  {['Sender', 'Method', 'Message Detail', 'Trx ID', 'Amount', 'Date & Time', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((sms) => {
                  const methodColor = getMethodTextColor(sms.method);
                  const isPaid = sms.is_used;

                  return (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Sender */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                          {sms.sender || '—'}
                        </p>
                      </td>

                      {/* Method */}
                      <td className={`px-5 py-4 text-xs font-black uppercase tracking-wider ${methodColor}`}>
                        {sms.method || '—'}
                      </td>

                      {/* Message Clickable Box (Boxed, Bold, Interactive) */}
                      <td className="px-5 py-4 max-w-[200px] sm:max-w-[250px]">
                        <div
                          onClick={() => setSelectedMessage(sms.message)}
                          title="Click to view full message"
                          className="inline-block w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 font-mono truncate cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm">
                          {sms.message || '—'}
                        </div>
                      </td>

                      {/* Trx ID */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                          {sms.trx_id || '—'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          ৳ {parseFloat(String(sms.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Date & Time (Increased Size & Bold) */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatDate(sms.received_at)}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{formatTime(sms.received_at)}</p>
                      </td>

                      {/* Status (Used / Unused) */}
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={14} /> Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Clock size={14} className="animate-pulse" /> Unused
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-[11px] font-medium text-slate-500">
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span>{' '}
              {filtered.length !== smsList.length ? `of ${smsList.length} ` : ''}SMS records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js SearchParams requires Suspense boundary
export default function SmsData() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
      <SmsDataContent />
    </Suspense>
  );
}

