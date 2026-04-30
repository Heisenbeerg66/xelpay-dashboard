'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Receipt, Search, Filter, ArrowDownRight, Loader2, Building2,
  Calendar, X, ChevronDown, Check, CreditCard, Smartphone, Globe, Landmark,
  RefreshCw, Users, TrendingUp, Clock
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
  { label: 'Pending', value: 'pending', color: 'text-amber-500' },
  { label: 'Success', value: 'success', color: 'text-emerald-500' },
  { label: 'Rejected', value: 'rejected', color: 'text-red-500' },
  { label: 'Cancelled', value: 'cancel', color: 'text-slate-400' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const statusBadge = (s: string) => {
  switch (s?.toLowerCase()) {
    case 'paid': case 'success': case 'completed':
      return { cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800', label: 'Success' };
    case 'pending':
      return { cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800', label: 'Pending' };
    case 'rejected': case 'failed':
      return { cls: 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800', label: s };
    case 'cancel': case 'cancelled':
      return { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700', label: 'Cancelled' };
    default:
      return { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700', label: s || 'Unknown' };
  }
};

// ─── Method Category Detector (from method string) ────────────────────────────
const getMethodCategory = (method: string | null) => {
  if (!method) return null;
  const m = method.toLowerCase();
  if (['bkash', 'nagad', 'rocket', 'upay', 'tap', 'ok wallet', 'mcash', 'shurjopay'].some(x => m.includes(x))) return 'mobile';
  if (['bank', 'nrb', 'dbbl', 'brac', 'dutch', 'islami', 'premier'].some(x => m.includes(x))) return 'bank';
  if (['stripe', 'paypal', 'wise', 'usdt', 'crypto', 'international'].some(x => m.includes(x))) return 'international';
  return null;
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({
  filters, setFilters, onClose, onApply
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const toggle = (key: 'status' | 'method_category', val: string) => {
    const arr = filters[key];
    setFilters({
      ...filters,
      [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    });
  };

  const clearAll = () => setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={clearAll} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear All</button>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Status */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => {
              const active = filters.status.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle('status', opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {active && <Check size={10} />} {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Category */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Payment Method</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = filters.method_category.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggle('method_category', cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-600/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                >
                  <Icon size={11} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TRX ID */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">TRX ID</p>
          <input
            type="text"
            placeholder="Enter transaction ID..."
            value={filters.trx_id}
            onChange={e => setFilters({ ...filters, trx_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs font-mono font-bold text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Date Range */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Date Range</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-1 ml-0.5">FROM</p>
              <input
                type="date"
                value={filters.date_from}
                onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-1 ml-0.5">TO</p>
              <input
                type="date"
                value={filters.date_to}
                onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-slate-900 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply */}
      <div className="px-5 pb-5">
        <button
          onClick={() => { onApply(); onClose(); }}
          className="w-full py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
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
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Close filter panel on outside click ──────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Fetch transactions ────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (bizId: string | null, mId: string | null, mode: 'business' | 'all') => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (mode === 'business' && bizId) {
      query = query.eq('business_id', bizId);
    } else if (mode === 'all' && mId) {
      query = query.eq('merchant_id', mId);
    }

    const { data } = await query;
    if (data) {
      setTransactions(data);
      setFilteredData(data);
    }
    setLoading(false);
  }, []);

  // ── Load merchant info ────────────────────────────────────────────────────
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

  // ── Apply search + filters ────────────────────────────────────────────────
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
        return appliedFilters.status.some(f => {
          if (f === 'success') return ['success', 'paid', 'completed'].includes(st);
          return st === f;
        });
      });
    }

    if (appliedFilters.method_category.length > 0) {
      data = data.filter(t => {
        const cat = getMethodCategory(t.method);
        return cat && appliedFilters.method_category.includes(cat);
      });
    }

    if (appliedFilters.trx_id) {
      data = data.filter(t => t.trx_id?.toLowerCase().includes(appliedFilters.trx_id.toLowerCase()));
    }

    if (appliedFilters.date_from) {
      const from = new Date(appliedFilters.date_from);
      data = data.filter(t => new Date(t.created_at) >= from);
    }

    if (appliedFilters.date_to) {
      const to = new Date(appliedFilters.date_to);
      to.setHours(23, 59, 59, 999);
      data = data.filter(t => new Date(t.created_at) <= to);
    }

    setFilteredData(data);
  }, [searchTerm, transactions, appliedFilters]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: filteredData.length,
    success: filteredData.filter(t => ['success', 'paid', 'completed'].includes(t.status?.toLowerCase())).length,
    pending: filteredData.filter(t => t.status?.toLowerCase() === 'pending').length,
    volume: filteredData
      .filter(t => ['success', 'paid', 'completed'].includes(t.status?.toLowerCase()))
      .reduce((sum, t) => sum + Number(t.amount), 0),
  };

  const activeFilterCount = appliedFilters.status.length + appliedFilters.method_category.length +
    (appliedFilters.date_from ? 1 : 0) + (appliedFilters.date_to ? 1 : 0) +
    (appliedFilters.trx_id ? 1 : 0);

  // ── No business selected ──────────────────────────────────────────────────
  if (!businessId && viewMode !== 'all') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Select a business from the sidebar to view transactions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Receipt size={24} className="text-blue-600" /> Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor and manage all payments across your workspaces.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('business')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'business'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            This Business
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'all'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            All Transactions
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: stats.total, icon: Receipt, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40' },
            { label: 'Successful', value: stats.success, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
            { label: 'Volume (BDT)', value: `৳${stats.volume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800/50`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search & Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by TRX ID, Order No, Name, Email, Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${
              activeFilterCount > 0
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-white/30 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {showFilter && (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowFilter(false)}
              onApply={() => setAppliedFilters(filters)}
            />
          )}
        </div>

        <button
          onClick={() => fetchTransactions(businessId, merchantId, viewMode)}
          className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedFilters.status.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {s}
              <button onClick={() => {
                const f = { ...appliedFilters, status: appliedFilters.status.filter(x => x !== s) };
                setAppliedFilters(f); setFilters(f);
              }}><X size={10} /></button>
            </span>
          ))}
          {appliedFilters.method_category.map(c => (
            <span key={c} className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
              {c}
              <button onClick={() => {
                const f = { ...appliedFilters, method_category: appliedFilters.method_category.filter(x => x !== c) };
                setAppliedFilters(f); setFilters(f);
              }}><X size={10} /></button>
            </span>
          ))}
          {(appliedFilters.date_from || appliedFilters.date_to) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
              <Calendar size={10} /> {appliedFilters.date_from || '...'} – {appliedFilters.date_to || '...'}
              <button onClick={() => {
                const f = { ...appliedFilters, date_from: '', date_to: '' };
                setAppliedFilters(f); setFilters(f);
              }}><X size={10} /></button>
            </span>
          )}
          <button
            onClick={() => { setAppliedFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' }); setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' }); }}
            className="px-3 py-1 text-red-500 text-[10px] font-black uppercase tracking-wider hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt size={22} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">No Transactions Found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {searchTerm || activeFilterCount > 0
                ? 'No results match your search or filter criteria.'
                : 'No payments have been received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800/50">
                  {['Order Info', 'Customer', 'Product', 'Source', 'Amount', 'Method', 'TRX ID', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {filteredData.map(trx => {
                  const badge = statusBadge(trx.status);
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group">

                      {/* Order Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            ['success','paid','completed'].includes(trx.status?.toLowerCase())
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {['success','paid','completed'].includes(trx.status?.toLowerCase())
                              ? <ArrowDownRight size={16} />
                              : <Receipt size={16} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                              {trx.order_no || 'ORD-???'}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar size={9} /> {formatDate(trx.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{trx.customer_name || '—'}</p>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {trx.customer_email && (
                            <p className="text-[10px] text-slate-400 font-medium">{trx.customer_email}</p>
                          )}
                          {trx.customer_number && (
                            <p className="text-[10px] text-slate-400 font-mono font-medium">{trx.customer_number}</p>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold max-w-[130px] truncate block">
                          {trx.product_name || '—'}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-5 py-4">
                        <span className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {trx.source || 'api'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900 dark:text-white text-base">
                          {trx.currency === 'USD' ? '$' : '৳'}{Number(trx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">{trx.currency || 'BDT'}</p>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                          {trx.method || '—'}
                        </p>
                        {getMethodCategory(trx.method) && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {getMethodCategory(trx.method)}
                          </span>
                        )}
                      </td>

                      {/* TRX ID */}
                      <td className="px-5 py-4">
                        {trx.trx_id ? (
                          <span className="font-mono text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-lg">
                            #{trx.trx_id}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Awaiting...</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              Showing <span className="text-slate-700 dark:text-slate-200">{filteredData.length}</span> of <span className="text-slate-700 dark:text-slate-200">{transactions.length}</span> transactions
            </p>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-400" />
              <p className="text-xs font-bold text-slate-400">
                {viewMode === 'all' ? 'All Businesses' : 'Current Business'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}