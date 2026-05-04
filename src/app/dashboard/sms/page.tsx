'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, Search, Loader2, Smartphone,
  CheckCircle2, Clock, RefreshCw, Building2, Globe
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

// ─── Method badge color map ───────────────────────────────────────────────────
const methodColors: Record<string, { bg: string; text: string; border: string }> = {
  bkash:  { bg: 'bg-pink-50 dark:bg-pink-900/20',   text: 'text-pink-700 dark:text-pink-300',   border: 'border-pink-200 dark:border-pink-800/40' },
  nagad:  { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800/40' },
  rocket: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40' },
  upay:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800/40' },
};

const getMethodColor = (method: string) => {
  const key = method?.toLowerCase().replace(/\s/g, '') || '';
  for (const [k, v] of Object.entries(methodColors)) {
    if (key.includes(k)) return v;
  }
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// ─── Main Component Body ──────────────────────────────────────────────────────
function SmsDataContent() {
  const searchParams = useSearchParams();
  const currentBusinessId = searchParams.get('business_id') || searchParams.get('business') || '409b29ae-dc4c-495c-9d69-bd6b80ea37f1';

  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState<SmsTransaction[]>([]);
  const [filtered, setFiltered] = useState<SmsTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'business'>('all');

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

      {/* ── Bold Top Bar & Tabs ── */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.15em] flex items-center gap-3">
            <MessageSquare size={20} className="text-blue-400" />
            SMS DATA
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-0.5">
            Real-time feed of all SMS received by your Android automated reader app.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-slate-800 dark:bg-slate-900 p-1 rounded-xl shadow-inner border border-slate-700/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe size={16} />
            All Merchants
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'business'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 size={16} />
            Selected Business
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by Trx ID, Sender, Method, Amount..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all shadow-sm"
          />
        </div>
        <button onClick={fetchSMS}
          className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total SMS</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Used / Paid</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{usedCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Pending / Unused</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
        </div>
      )}

      {/* ── App Connection Alert ── */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0 mt-0.5"><Smartphone size={18} /></div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-1">Android App Sync Status</h4>
          <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
            Ensure your Android SMS Forwarder app is running in the background. All incoming payment SMS will automatically appear here within 2 seconds.
          </p>
        </div>
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
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                  {['Sender', 'Method', 'Message', 'Trx ID', 'Amount', 'Received At', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((sms) => {
                  const mc = getMethodColor(sms.method);
                  const isPaid = sms.is_used;

                  return (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Sender */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                          {sms.sender || '—'}
                        </p>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${mc.bg} ${mc.text} ${mc.border}`}>
                          {sms.method || '—'}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-5 py-4 max-w-xs">
                        <div
                          title={sms.message}
                          className="bg-slate-50 dark:bg-[#0B1120] px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[220px]">
                          {sms.message || '—'}
                        </div>
                      </td>

                      {/* Trx ID */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {sms.trx_id || '—'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          ৳ {parseFloat(String(sms.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Received At */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{formatDate(sms.received_at)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(sms.received_at)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Success / Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Clock size={13} className="animate-pulse" /> Pending / Unused
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
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span>{' '}
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