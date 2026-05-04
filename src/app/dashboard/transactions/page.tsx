'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Receipt, Search, Filter, Loader2, Building2,
  X, Smartphone, Globe, Landmark,
  RefreshCw, Download, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type Order = {
  id: string;
  order_no: string;
  merchant_id: string;
  business_id: string | null;
  customer_name: string | null;
  customer_number: string | null;
  customer_email: string | null;
  amount: number;
  currency: string;
  method: string | null;
  trx_id: string | null;
  status: string;
  source: string | null;
  product_name: string | null;
  created_at: string;
};

type SmsTransaction = {
  id: string;
  sender: string;
  method: string;
  message: string;
  trx_id: string;
  amount: number;
  received_at: string;
  is_used: boolean;
};

type FilterState = {
  status: string[];
  method_category: string[];
  date_from: string;
  date_to: string;
  trx_id: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const PAYMENT_CATEGORIES = [
  { label: 'Mobile', value: 'mobile', icon: Smartphone },
  { label: 'Bank', value: 'bank', icon: Landmark },
  { label: 'International', value: 'international', icon: Globe },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Success', value: 'success' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const statusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (['paid', 'success', 'completed'].includes(s)) return { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400 font-bold' };
  if (s === 'pending') return { label: 'Pending', cls: 'text-amber-500 dark:text-amber-400 font-bold' };
  if (['failed', 'rejected', 'cancelled'].includes(s)) return { label: 'Failed', cls: 'text-red-500 dark:text-red-400 font-bold' };
  return { label: status || '—', cls: 'text-slate-400 font-bold' };
};

const getMethodTextColor = (method: string | null) => {
  const m = (method || '').toLowerCase();
  if (m.includes('bkash')) return 'text-pink-600 dark:text-pink-400';
  if (m.includes('nagad')) return 'text-orange-600 dark:text-orange-400';
  if (m.includes('rocket')) return 'text-purple-600 dark:text-purple-400';
  if (m.includes('upay')) return 'text-blue-600 dark:text-blue-400';
  return 'text-slate-600 dark:text-slate-400';
};

const getMethodCategory = (method: string | null): string | null => {
  if (!method) return null;
  const m = method.toLowerCase();
  if (['bkash', 'nagad', 'rocket', 'upay', 'tap'].some(x => m.includes(x))) return 'mobile';
  if (['bank', 'dbbl', 'brac', 'dutch', 'islami', 'ucb'].some(x => m.includes(x))) return 'bank';
  if (['stripe', 'paypal', 'visa', 'master', 'binance'].some(x => m.includes(x))) return 'international';
  return null;
};

function exportToCSV(data: Order[]) {
  const headers = ['Order No', 'Date', 'Customer Name', 'Email', 'Phone', 'Product', 'Source', 'Amount', 'Currency', 'Method', 'TRX ID', 'Status'];
  const rows = data.map(t => [
    t.order_no || '', formatDate(t.created_at), t.customer_name || '',
    t.customer_email || '', t.customer_number || '', t.product_name || '',
    t.source || '', t.amount, t.currency || 'BDT', t.method || '',
    t.trx_id || '', t.status || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── SMS Details Modal ────────────────────────────────────────────────────────
function SmsDetailsModal({ trxId, onClose }: { trxId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [smsData, setSmsData] = useState<SmsTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('trx_id', trxId)
        .single();
      if (error || !data) setError('No SMS record found for this transaction.');
      else setSmsData(data as SmsTransaction);
      setLoading(false);
    })();
  }, [trxId]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">SMS Verification Record</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          ) : smsData ? (
            <div className="space-y-3">
              {[
                { label: 'Sender', value: smsData.sender },
                { label: 'Method', value: smsData.method, color: getMethodTextColor(smsData.method) + ' uppercase font-bold' },
                { label: 'Trx ID', value: smsData.trx_id, color: 'text-purple-600 dark:text-purple-400 font-mono font-bold' },
                { label: 'Amount', value: `৳ ${parseFloat(String(smsData.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-emerald-600 font-bold' },
                { label: 'Status', value: smsData.is_used ? 'Used / Paid' : 'Unused / Pending', color: smsData.is_used ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold' },
                { label: 'Received At', value: formatDate(smsData.received_at) },
              ].map(r => (
                <div key={r.label} className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.label}</span>
                  <span className={`text-xs font-medium text-right max-w-[60%] ${r.color || 'text-slate-700 dark:text-slate-200'}`}>{r.value}</span>
                </div>
              ))}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Raw SMS</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed">{smsData.message}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onApply, onClose }: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const toggle = (key: 'status' | 'method_category', val: string) => {
    const arr = filters[key];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };
  return (
    <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => toggle('status', s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.status.includes(s.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => toggle('method_category', c.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.method_category.includes(c.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'}`}>
              <c.icon size={11} /> {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date Range</p>
        <div className="grid grid-cols-2 gap-2">
          {(['date_from', 'date_to'] as const).map(key => (
            <input key={key} type="date" value={filters[key]}
              onChange={e => setFilters({ ...filters, [key]: e.target.value })}
              className="px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors" />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' })}
          className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Clear All
        </button>
        <button onClick={() => { onApply(); onClose(); }}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'business' | 'all'>('business');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [smsTrxId, setSmsTrxId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });

  const fetchOrders = useCallback(async (bizId: string | null, mode: 'business' | 'all') => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('id, order_no, merchant_id, business_id, customer_name, customer_number, customer_email, amount, currency, method, trx_id, status, source, product_name, created_at')
      .order('created_at', { ascending: false });

    if (mode === 'business' && bizId) {
      query = query.eq('business_id', bizId);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) query = query.eq('merchant_id', user.id);
    }

    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = () => {
      const id = localStorage.getItem('active_business_id');
      setBusinessId(id);
      fetchOrders(id, viewMode);
    };
    load();
    window.addEventListener('businessChanged', load);
    return () => window.removeEventListener('businessChanged', load);
  }, [viewMode, fetchOrders]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredData = orders.filter(t => {
    if (appliedFilters.status.length && !appliedFilters.status.some(s =>
      s === 'success' ? ['paid', 'success', 'completed'].includes(t.status?.toLowerCase())
        : t.status?.toLowerCase() === s)) return false;
    if (appliedFilters.method_category.length) {
      const cat = getMethodCategory(t.method);
      if (!cat || !appliedFilters.method_category.includes(cat)) return false;
    }
    if (appliedFilters.date_from && new Date(t.created_at) < new Date(appliedFilters.date_from)) return false;
    if (appliedFilters.date_to && new Date(t.created_at) > new Date(appliedFilters.date_to + 'T23:59:59')) return false;
    if (appliedFilters.trx_id && !(t.trx_id || '').toLowerCase().includes(appliedFilters.trx_id.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!((t.order_no || '').toLowerCase().includes(q) ||
        (t.customer_name || '').toLowerCase().includes(q) ||
        (t.trx_id || '').toLowerCase().includes(q) ||
        (t.product_name || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const activeFilterCount = appliedFilters.status.length + appliedFilters.method_category.length
    + (appliedFilters.date_from ? 1 : 0) + (appliedFilters.date_to ? 1 : 0) + (appliedFilters.trx_id ? 1 : 0);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, appliedFilters]);

  if (!businessId && viewMode !== 'all') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Select a business from the sidebar to view transactions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {smsTrxId && <SmsDetailsModal trxId={smsTrxId} onClose={() => setSmsTrxId(null)} />}

      {/* ── Page Title + Controls Row (Mobile Optimized Flex Wrap) ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        
        {/* Title Area + Mobile Refresh */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <Receipt size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
              All Transactions
            </h1>
          </div>
          <button onClick={() => fetchOrders(businessId, viewMode)}
            className="md:hidden flex items-center justify-center h-9 w-9 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Controls Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          
          {/* Business / All tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 h-10 px-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
            {(['business', 'all'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`flex-1 sm:flex-none h-8 px-4 rounded-lg text-xs font-bold transition-all ${viewMode === m
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                {m === 'business' ? 'Business' : 'All'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search name, order, trx ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Filter */}
            <div className="relative flex-1 sm:flex-none" ref={filterRef}>
              <button onClick={() => setShowFilter(v => !v)}
                className={`flex w-full items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold border transition-all ${showFilter || activeFilterCount > 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:border-blue-400'}`}>
                <Filter size={14} /> Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/30 text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {showFilter && (
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onApply={() => setAppliedFilters(filters)}
                  onClose={() => setShowFilter(false)}
                />
              )}
            </div>

            {/* Export */}
            <button onClick={() => exportToCSV(filteredData)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 h-10 px-4 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-sm">
              <Download size={14} /> <span className="hidden sm:inline">Export</span>
            </button>

            {/* Desktop Refresh */}
            <button onClick={() => fetchOrders(businessId, viewMode)}
              className="hidden md:flex items-center justify-center h-10 w-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {appliedFilters.status.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">
              {s}
              <button onClick={() => setAppliedFilters(f => ({ ...f, status: f.status.filter(x => x !== s) }))}>
                <X size={10} />
              </button>
            </span>
          ))}
          <button onClick={() => setAppliedFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' })}
            className="px-3 py-1 text-red-500 text-[10px] font-bold hover:text-red-700">
            Clear All
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={26} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Transactions Found</h3>
            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
              {searchTerm || activeFilterCount > 0 ? 'No results match your criteria.' : 'No payments received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr>
                  {['Order No', 'Date', 'Customer Name', 'Email', 'Phone', 'Product', 'Source', 'Amount', 'Method', 'TRX ID', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((trx, idx) => {
                  const badge = statusConfig(trx.status);
                  const methodColor = getMethodTextColor(trx.method);
                  return (
                    <tr key={trx.id}
                      className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${idx === paginatedData.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{trx.order_no || '—'}</td>
                      <td className="px-5 py-3.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{formatDate(trx.created_at)}</td>
                      <td className="px-5 py-3.5 text-xs text-blue-600 dark:text-blue-400 font-bold max-w-[140px] truncate">{trx.customer_name || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{trx.customer_email || '—'}</td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400">{trx.customer_number || '—'}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 max-w-[130px] truncate">{trx.product_name || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 capitalize">{trx.source || 'link'}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white">
                        ৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-5 py-3.5 text-xs font-bold uppercase ${methodColor}`}>{trx.method || '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {trx.trx_id
                            ? <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{trx.trx_id}</span>
                            : <span className="text-xs text-slate-400 italic font-medium">Awaiting</span>}
                          {trx.trx_id && (
                            <button onClick={() => setSmsTrxId(trx.trx_id!)}
                              title="View SMS Verification"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <Eye size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs ${badge.cls}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-medium text-slate-500">
              Showing <span className="text-slate-700 dark:text-slate-200 font-bold">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)}</span> of <span className="text-slate-700 dark:text-slate-200 font-bold">{filteredData.length}</span> transactions
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
