'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Receipt, Search, Filter, Loader2, Building2,
  Calendar, X, Check, CreditCard, Smartphone, Globe, Landmark,
  RefreshCw, TrendingUp, Clock, Download
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

type FilterState = {
  status: string[];
  method_category: string[];
  date_from: string;
  date_to: string;
  trx_id: string;
};

const PAYMENT_CATEGORIES = [
  { label: 'Mobile', value: 'mobile', icon: Smartphone },
  { label: 'Bank', value: 'bank', icon: Landmark },
  { label: 'International', value: 'international', icon: Globe },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Success', value: 'success' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancel' },
];

const PAGE_SIZE = 25;

const formatDateShort = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const statusConfig = (s: string) => {
  switch (s?.toLowerCase()) {
    case 'paid': case 'success': case 'completed':
      return { cls: 'text-emerald-500 dark:text-emerald-400 font-semibold', label: 'Success' };
    case 'pending':
      return { cls: 'text-yellow-500 dark:text-yellow-400 font-semibold', label: 'Pending' };
    case 'rejected': case 'failed':
      return { cls: 'text-red-500 dark:text-red-400 font-semibold', label: 'Rejected' };
    case 'cancel': case 'cancelled':
      return { cls: 'text-red-400 dark:text-red-400 font-semibold', label: 'Cancelled' };
    default:
      return { cls: 'text-slate-400 font-medium', label: s || 'Unknown' };
  }
};

const getMethodCategory = (method: string | null) => {
  if (!method) return null;
  const m = method.toLowerCase();
  if (['bkash', 'nagad', 'rocket', 'upay', 'tap', 'ok wallet', 'mcash', 'shurjopay'].some(x => m.includes(x))) return 'mobile';
  if (['bank', 'nrb', 'dbbl', 'brac', 'dutch', 'islami', 'premier'].some(x => m.includes(x))) return 'bank';
  if (['stripe', 'paypal', 'wise', 'usdt', 'crypto', 'international'].some(x => m.includes(x))) return 'international';
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

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose, onApply }: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const toggle = (key: 'status' | 'method_category', val: string) => {
    const arr = filters[key];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };
  const clearAll = () => setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={clearAll} className="text-[10px] font-medium text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear</button>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {/* Status */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => {
              const active = filters.status.includes(opt.value);
              return (
                <button key={opt.value} onClick={() => toggle('status', opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'}`}>
                  {active && <Check size={10} />}{opt.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Payment Method */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Payment Method</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = filters.method_category.includes(cat.value);
              return (
                <button key={cat.value} onClick={() => toggle('method_category', cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'}`}>
                  <Icon size={11} />{cat.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* TRX ID */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">TRX ID</p>
          <input type="text" placeholder="Enter transaction ID..." value={filters.trx_id}
            onChange={e => setFilters({ ...filters, trx_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs font-mono text-slate-900 dark:text-white transition-colors placeholder:text-slate-400" />
        </div>
        {/* Date Range */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Date Range</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">FROM</p>
              <input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">TO</p>
              <input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button onClick={() => { onApply(); onClose(); }}
          className="w-full py-3 bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [filteredData, setFilteredData] = useState<Order[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'business' | 'all'>('business');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchTransactions = useCallback(async (bizId: string | null, mId: string | null, mode: 'business' | 'all') => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (mode === 'business' && bizId) query = query.eq('business_id', bizId);
    else if (mode === 'all' && mId) query = query.eq('merchant_id', mId);
    const { data } = await query;
    if (data) { setTransactions(data); setFilteredData(data); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMerchantId(user.id);
      const activeId = localStorage.getItem('active_business_id');
      setBusinessId(activeId);
      fetchTransactions(activeId, user.id, viewMode);
    };
    loadData();
    const handleBusinessChange = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const activeId = localStorage.getItem('active_business_id');
      setBusinessId(activeId);
      fetchTransactions(activeId, user?.id || null, viewMode);
    };
    window.addEventListener('businessChanged', handleBusinessChange);
    return () => window.removeEventListener('businessChanged', handleBusinessChange);
  }, [viewMode, fetchTransactions]);

  useEffect(() => {
    let data = [...transactions];
    const s = searchTerm.toLowerCase().trim();
    if (s) {
      data = data.filter(t =>
        t.trx_id?.toLowerCase().includes(s) ||
        t.order_no?.toLowerCase().includes(s) ||
        t.customer_email?.toLowerCase().includes(s) ||
        t.customer_name?.toLowerCase().includes(s) ||
        t.customer_number?.toLowerCase().includes(s)
      );
    }
    if (appliedFilters.status.length > 0) {
      data = data.filter(t => {
        const st = t.status?.toLowerCase();
        return appliedFilters.status.some(f => f === 'success' ? ['success', 'paid', 'completed'].includes(st) : st === f);
      });
    }
    if (appliedFilters.method_category.length > 0) {
      data = data.filter(t => { const cat = getMethodCategory(t.method); return cat && appliedFilters.method_category.includes(cat); });
    }
    if (appliedFilters.trx_id) data = data.filter(t => t.trx_id?.toLowerCase().includes(appliedFilters.trx_id.toLowerCase()));
    if (appliedFilters.date_from) { const from = new Date(appliedFilters.date_from); data = data.filter(t => new Date(t.created_at) >= from); }
    if (appliedFilters.date_to) { const to = new Date(appliedFilters.date_to); to.setHours(23, 59, 59, 999); data = data.filter(t => new Date(t.created_at) <= to); }
    setFilteredData(data);
    setCurrentPage(1);
  }, [searchTerm, transactions, appliedFilters]);

  const stats = {
    total: filteredData.length,
    success: filteredData.filter(t => ['success', 'paid', 'completed'].includes(t.status?.toLowerCase())).length,
    pending: filteredData.filter(t => t.status?.toLowerCase() === 'pending').length,
    volume: filteredData.filter(t => ['success', 'paid', 'completed'].includes(t.status?.toLowerCase())).reduce((sum, t) => sum + Number(t.amount), 0),
  };

  const activeFilterCount = appliedFilters.status.length + appliedFilters.method_category.length +
    (appliedFilters.date_from ? 1 : 0) + (appliedFilters.date_to ? 1 : 0) + (appliedFilters.trx_id ? 1 : 0);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!businessId && viewMode !== 'all') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Select a business from the sidebar to view transactions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Receipt size={22} className="text-blue-600" /> Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor and manage all payments across your workspaces.</p>
        </div>
        {/* FIX 3: Both buttons same size */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(filteredData)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-all"
          >
            <Download size={15} /> Export
          </button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            {(['business', 'all'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === m
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                {m === 'business' ? 'This Business' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FIX 2: Stats Cards — clean, minimal, premium. Shorter width, taller height */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: stats.total, icon: Receipt, iconColor: 'text-slate-500 dark:text-slate-400', valueColor: 'text-slate-900 dark:text-white' },
            { label: 'Successful', value: stats.success, icon: TrendingUp, iconColor: 'text-emerald-500', valueColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Pending', value: stats.pending, icon: Clock, iconColor: 'text-amber-500', valueColor: 'text-amber-600 dark:text-amber-400' },
            { label: 'Volume (BDT)', value: `৳${stats.volume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: CreditCard, iconColor: 'text-blue-500', valueColor: 'text-blue-600 dark:text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.label}</p>
                <div className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center`}>
                  <s.icon size={15} className={s.iconColor} />
                </div>
              </div>
              <p className={`text-2xl font-bold tracking-tight ${s.valueColor}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
          <input type="text" placeholder="Search by TRX ID, Order No, Name, Email, Phone..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-all placeholder:text-slate-400" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-slate-400" /></button>}
        </div>
        <div className="relative" ref={filterRef}>
          <button onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${activeFilterCount > 0
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}>
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && <span className="bg-white/30 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          {showFilter && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilter(false)} onApply={() => setAppliedFilters(filters)} />}
        </div>
        <button onClick={() => fetchTransactions(businessId, merchantId, viewMode)}
          className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors" title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedFilters.status.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-medium uppercase tracking-wider">
              {s}<button onClick={() => { const f = { ...appliedFilters, status: appliedFilters.status.filter(x => x !== s) }; setAppliedFilters(f); setFilters(f); }}><X size={10} /></button>
            </span>
          ))}
          {appliedFilters.method_category.map(c => (
            <span key={c} className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-medium uppercase tracking-wider">
              {c}<button onClick={() => { const f = { ...appliedFilters, method_category: appliedFilters.method_category.filter(x => x !== c) }; setAppliedFilters(f); setFilters(f); }}><X size={10} /></button>
            </span>
          ))}
          {(appliedFilters.date_from || appliedFilters.date_to) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-medium">
              <Calendar size={10} />{appliedFilters.date_from || '...'} – {appliedFilters.date_to || '...'}
              <button onClick={() => { const f = { ...appliedFilters, date_from: '', date_to: '' }; setAppliedFilters(f); setFilters(f); }}><X size={10} /></button>
            </span>
          )}
          <button onClick={() => { setAppliedFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' }); setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' }); }}
            className="px-3 py-1 text-red-500 text-[10px] font-medium hover:text-red-700">Clear All</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-32"><Loader2 className="animate-spin text-blue-600" size={26} /></div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No Transactions Found</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              {searchTerm || activeFilterCount > 0 ? 'No results match your search or filter criteria.' : 'No payments have been received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                {/* FIX 1: Table header bg — indigo-700/indigo-800 — visible in both light & dark */}
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Order No', 'Date', 'Customer Name', 'Email', 'Phone', 'Product', 'Source', 'Amount', 'Method', 'TRX ID', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-white uppercase tracking-widest bg-indigo-700 dark:bg-indigo-900">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((trx, idx) => {
                  const badge = statusConfig(trx.status);
                  const cellText = "text-sm font-semibold text-slate-900 dark:text-white";
                  return (
                    <tr key={trx.id}
                      className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${idx === paginatedData.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-5 py-4"><span className={cellText}>{trx.order_no || '—'}</span></td>
                      <td className="px-5 py-4">
                        <p className={cellText}>{formatDateShort(trx.created_at)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(trx.created_at)}</p>
                      </td>
                      <td className="px-5 py-4"><span className={cellText}>{trx.customer_name || '—'}</span></td>
                      <td className="px-5 py-4"><span className={cellText}>{trx.customer_email || '—'}</span></td>
                      <td className="px-5 py-4"><span className={`${cellText} font-mono`}>{trx.customer_number || '—'}</span></td>
                      <td className="px-5 py-4"><span className={cellText}>{trx.product_name || '—'}</span></td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-white uppercase tracking-wider bg-slate-500 dark:bg-slate-600 px-2.5 py-1 rounded-lg">{trx.source || 'api'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className={cellText}>{trx.currency === 'USD' ? '$' : '৳'}{Number(trx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-slate-400">{trx.currency || 'BDT'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className={cellText}>{trx.method || '—'}</p>
                        {getMethodCategory(trx.method) && (
                          <p className="text-[10px] text-slate-400 capitalize">{getMethodCategory(trx.method)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {trx.trx_id
                          ? <span className={`${cellText} font-mono`}>#{trx.trx_id}</span>
                          : <span className="text-sm text-slate-400 italic">Awaiting</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm ${badge.cls}`}>{badge.label}</span>
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
            <p className="text-xs text-slate-400">
              Showing <span className="text-slate-700 dark:text-slate-200 font-medium">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)}</span> of <span className="text-slate-700 dark:text-slate-200 font-medium">{filteredData.length}</span> transactions
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Next →
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400">{viewMode === 'all' ? 'All Businesses' : 'Current Business'}</p>
          </div>
        )}
      </div>
    </div>
  );
}