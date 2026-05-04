'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, Search, Loader2, Package, Activity,
  CheckCircle2, Clock, RefreshCw, Building2, Globe, X,
  Filter, Download, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

const PAGE_SIZE = 20;

// ─── Main Component Body ──────────────────────────────────────────────────────
function SmsDataContent() {
  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState<SmsTransaction[]>([]);
  const [filtered, setFiltered] = useState<SmsTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'business'>('all');
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  
  // New States for Extra Features
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  // Sync Business ID from LocalStorage
  useEffect(() => {
    const loadId = () => setCurrentBusinessId(localStorage.getItem('active_business_id'));
    loadId();
    window.addEventListener('businessChanged', loadId);
    return () => window.removeEventListener('businessChanged', loadId);
  }, []);

  // Close Filter Panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
      } else if (error) {
        console.error("Error fetching SMS:", error.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchSMS(); 
  }, [activeTab, currentBusinessId]);

  // Apply Search and Date Filters
  useEffect(() => {
    let result = smsList;
    if (dateFrom) result = result.filter(s => new Date(s.received_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter(s => new Date(s.received_at) <= new Date(dateTo + 'T23:59:59'));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s =>
        (s.trx_id && s.trx_id.toLowerCase().includes(q)) ||
        (s.sender && s.sender.toLowerCase().includes(q)) ||
        (s.method && s.method.toLowerCase().includes(q)) ||
        (s.amount && String(s.amount).includes(q))
      );
    }
    setFiltered(result);
    setCurrentPage(1); // Reset page on filter change
  }, [searchTerm, smsList, dateFrom, dateTo]);

  const exportToCSV = () => {
    const headers = ['Sender', 'Method', 'Message', 'TRX ID', 'Amount', 'Date', 'Status'];
    const rows = filtered.map(s => [
      s.sender || '', s.method || '', `"${(s.message || '').replace(/"/g, '""')}"`,
      s.trx_id || '', s.amount, formatDate(s.received_at), s.is_used ? 'Used' : 'Unused'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-data-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const totalCount = smsList.length;
  const usedCount = smsList.filter(s => s.is_used).length;
  const pendingCount = smsList.filter(s => !s.is_used).length;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* ── Message Modal ── */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white dark:bg-[#0B1120] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" /> Full Message
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => copyToClipboard(selectedMessage)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Copy Message">
                  <Copy size={16} />
                </button>
                <button onClick={() => setSelectedMessage(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <X size={16} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS DATA Top Card (Styled like App Sync Card + Live Indicator) ── */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-base md:text-lg font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">
                SMS DATA
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                <Activity size={10} className="animate-pulse" />
                <span className="text-[9px] font-black tracking-widest uppercase">Live Syncing</span>
              </div>
            </div>
            <p className="text-[11px] md:text-[13px] font-bold text-indigo-700/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
              Real-time feed of all SMS received by your Android automated reader app.
            </p>
          </div>
        </div>
      </div>
            {/* ── Stats Cards (3 Columns on Mobile - Sized Up) ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Total SMS</p>
            <p className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-emerald-100 dark:border-emerald-900/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Used</p>
            <p className="text-lg sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{usedCount}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-amber-100 dark:border-amber-900/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Unused</p>
            <p className="text-lg sm:text-3xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
        </div>
      )}

      {/* ── App Connection Alert & Download Button ── */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5">
            <Package size={20} />
          </div>
          <div>
            <h4 className="text-base font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-1">Android App Sync</h4>
            <p className="text-[11px] md:text-[13px] font-bold text-blue-700/80 dark:text-blue-300/80 leading-relaxed max-w-2xl">
              Ensure your Android APK is running in the background. SMS will automatically appear here within 2 seconds.
            </p>
          </div>
        </div>
        <Link href="/dashboard/devices"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0">
          <Download size={16} /> Connect / Download App
        </Link>
      </div>

      {/* ── Controls (Tabs + Search + Filters + Refresh) ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl w-full xl:w-auto">
          <button onClick={() => setActiveTab('all')}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
            }`}>
            <Globe size={14} /> All Merchants
          </button>
          <button onClick={() => setActiveTab('business')}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'business' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
            }`}>
            <Building2 size={14} /> Selected Business
          </button>
        </div>

        {/* Search, Filter & Export */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-1 md:px-0">
          <div className="relative flex-grow md:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
            <input
              type="text"
              placeholder="Search SMS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          <div className="relative flex-1 md:flex-none" ref={filterRef}>
            <button onClick={() => setShowFilter(!showFilter)}
              className={`flex w-full items-center justify-center gap-2 h-[42px] px-4 rounded-xl text-sm font-bold border transition-all ${
                showFilter || dateFrom || dateTo
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm'
              }`}>
              <Filter size={14} /> Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 z-40 w-64 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date Range</p>
                <div className="space-y-2 mb-3">
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500" />
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500" />
                </div>
                <button onClick={() => { setDateFrom(''); setDateTo(''); setShowFilter(false); }} className="w-full py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <button onClick={exportToCSV} title="Export CSV"
            className="flex items-center justify-center gap-2 h-[42px] px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shadow-sm shrink-0">
            <Download size={15} /> <span className="hidden sm:inline">Export</span>
          </button>
          
          <button onClick={fetchSMS} title="Refresh"
            className="flex items-center justify-center gap-2 h-[42px] px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shadow-sm shrink-0">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">No SMS Data Found</h3>
            <p className="text-slate-500 text-sm font-bold max-w-sm mx-auto">
              {searchTerm || dateFrom || dateTo
                ? 'No SMS matches your search or filter criteria.'
                : "Your app hasn't forwarded any SMS yet. Connect your app to see live data."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                  {['Sender', 'Method', 'Message Detail', 'Trx ID', 'Amount', 'Date & Time', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedData.map((sms) => {
                  const methodColor = getMethodTextColor(sms.method);
                  const isPaid = sms.is_used;

                  return (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      {/* Sender */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-wider">
                          {sms.sender || '—'}
                        </p>
                      </td>

                      {/* Method (Solid Text, No BG) */}
                      <td className={`px-5 py-4 text-xs font-black uppercase tracking-wider ${methodColor}`}>
                        {sms.method || '—'}
                      </td>

                      {/* Message Clickable Box (Bigger, Bold, Boxed) */}
                      <td className="px-5 py-4 max-w-[200px] sm:max-w-[250px]">
                        <div
                          onClick={() => setSelectedMessage(sms.message)}
                          title="Click to view full message"
                          className="inline-block w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 font-mono truncate cursor-pointer hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm">
                          {sms.message || '—'}
                        </div>
                      </td>

                      {/* Trx ID with Quick Copy */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-black text-purple-600 dark:text-purple-400">
                            {sms.trx_id || '—'}
                          </span>
                          {sms.trx_id && (
                            <button onClick={() => copyToClipboard(sms.trx_id!)} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy TRX ID">
                              <Copy size={13} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          ৳ {parseFloat(String(sms.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Received At (Larger & Bold) */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{formatDate(sms.received_at)}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{formatTime(sms.received_at)}</p>
                      </td>

                      {/* Status (Used/Unused) */}
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={15} /> Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                            <Clock size={15} className="animate-pulse" /> Unused
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

        {/* Footer with Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-slate-500">
              Showing <span className="font-black text-slate-800 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of <span className="font-black text-slate-800 dark:text-slate-200">{filtered.length}</span> SMS
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
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
                                   
