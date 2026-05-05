'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Receipt, Search, Filter, Loader2, Building2,
  X, Smartphone, Globe, Landmark, Columns, Webhook,
  RefreshCw, Download, Eye, ChevronLeft, ChevronRight, Activity, PanelRightClose, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

const TOGGLEABLE_COLUMNS = [
  { id: 'date', label: 'Date' },
  { id: 'customer', label: 'Customer' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'product', label: 'Product' },
  { id: 'source', label: 'Source' },
  { id: 'amount', label: 'Amount' },
  { id: 'method', label: 'Method' },
  { id: 'trx_id', label: 'TRX ID' },
  { id: 'status', label: 'Status' }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const statusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (['paid', 'success', 'completed'].includes(s)) return { label: 'Paid', cls: 'text-emerald-600 dark:text-emerald-400 font-bold', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' };
  if (s === 'pending') return { label: 'Pending', cls: 'text-amber-500 dark:text-amber-400 font-bold', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' };
  if (['failed', 'rejected', 'cancelled'].includes(s)) return { label: 'Failed', cls: 'text-red-500 dark:text-red-400 font-bold', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
  return { label: status || '—', cls: 'text-slate-400 font-bold', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' };
};

const getMethodTextColor = (method: string | null) => {
  const m = (method || '').toLowerCase();
  if (m.includes('bkash')) return 'text-pink-600 dark:text-pink-400';
  if (m.includes('nagad')) return 'text-orange-600 dark:text-orange-400';
  if (m.includes('rocket')) return 'text-purple-600 dark:text-purple-400';
  if (m.includes('upay')) return 'text-blue-600 dark:text-blue-400';
  return 'text-slate-600 dark:text-slate-300';
};

const getMethodCategory = (method: string | null): string | null => {
  if (!method) return null;
  const m = method.toLowerCase();
  if (['bkash', 'nagad', 'rocket', 'upay', 'tap'].some(x => m.includes(x))) return 'mobile';
  if (['bank', 'dbbl', 'brac', 'dutch', 'islami', 'ucb'].some(x => m.includes(x))) return 'bank';
  if (['stripe', 'paypal', 'visa', 'master', 'binance'].some(x => m.includes(x))) return 'international';
  return null;
};

// ─── Skeleton Component ───────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3 p-5 animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full mb-6" />
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800/30 rounded-lg w-full" />
      ))}
    </div>
  );
}

// ─── Transaction Details Drawer ───────────────────────────────────────────────
function TransactionDrawer({ order, onClose, onResend }: { order: Order, onClose: () => void, onResend: (id: string) => void }) {
  const badge = statusConfig(order.status);
  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        
        {/* Header with Explicit Close Button */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt size={18} className="text-blue-600"/> Order Details
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Status & Amount */}
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Amount</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">৳ {parseFloat(String(order.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Information</h4>
            {[
              ['Order No', order.order_no, 'font-mono text-[14px] font-semibold text-indigo-600 dark:text-indigo-400'],
              ['Date & Time', `${formatDate(order.created_at)} - ${formatTime(order.created_at)}`, 'font-medium'],
              ['Customer', order.customer_name || '—', 'font-semibold'],
              ['Phone', order.customer_number || '—', 'font-medium'],
              ['Email', order.customer_email || '—', 'font-medium'],
              ['Product', order.product_name || '—', 'text-emerald-600 dark:text-emerald-400 font-semibold'],
              ['Payment Method', order.method || '—', `uppercase font-bold ${getMethodTextColor(order.method)}`],
              ['TRX ID', order.trx_id || '—', 'font-mono text-[14px] font-bold text-purple-600 dark:text-purple-400'],
              ['Source', order.source || 'link', 'capitalize font-medium'],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-[12px] font-medium text-slate-500">{label}</span>
                <span className={`text-[13px] text-right max-w-[60%] ${cls || 'text-slate-800 dark:text-slate-200 font-semibold'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Resend Webhook) */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <button onClick={() => onResend(order.id)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-[13px] transition-all shadow-md">
            <Webhook size={16} /> Resend Webhook
          </button>
        </div>
      </div>
    </div>
  );
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#0B1120] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">SMS Verification Record</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
          ) : error ? (
            <p className="text-sm font-bold text-red-500 text-center py-4">{error}</p>
          ) : smsData ? (
            <div className="space-y-3">
              {[
                { label: 'Sender', value: smsData.sender },
                { label: 'Method', value: smsData.method, color: getMethodTextColor(smsData.method) + ' uppercase font-bold' },
                { label: 'Trx ID', value: smsData.trx_id, color: 'text-purple-600 dark:text-purple-400 font-mono font-bold text-[14px]' },
                { label: 'Amount', value: `৳ ${parseFloat(String(smsData.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
                { label: 'Status', value: smsData.is_used ? 'Used / Paid' : 'Unused / Pending', color: smsData.is_used ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold' },
                { label: 'Received At', value: `${formatDate(smsData.received_at)} - ${formatTime(smsData.received_at)}` },
              ].map(r => (
                <div key={r.label} className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{r.label}</span>
                  <span className={`text-[13px] font-semibold text-right max-w-[60%] ${r.color || 'text-slate-800 dark:text-slate-200'}`}>{r.value}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Raw SMS</p>
                <p className="text-[13px] text-slate-800 dark:text-slate-200 font-mono leading-relaxed font-semibold">{smsData.message}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CustomerModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Removed X button header, keeping only the title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> Customer Info
        </h3>
        
        <div className="space-y-3 text-xs">
          {[
            ['Name', trx.customer_name || '—'],
            ['Phone', trx.customer_number || '—'],
            ['Email', trx.customer_email || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-500 font-medium">{k}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">Close</button>
      </div>
    </div>
  );
}

// ─── Responsive Filter Panel ──────────────────────────────────────────────────
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
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90] md:hidden" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:absolute md:top-full md:right-0 md:left-auto md:translate-x-0 md:translate-y-0 mt-0 md:mt-2 z-[100] w-[90vw] max-w-sm md:w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 md:p-4 space-y-5 md:space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center md:hidden mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
          <button onClick={onClose} className="p-1 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"><X size={16}/></button>
        </div>
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
              <input 
                key={key} 
                type={filters[key] ? "date" : "text"} 
                placeholder="mm/dd/yyyy"
                value={filters[key]}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 dark:[color-scheme:dark] outline-none focus:border-blue-500 transition-colors" 
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2 md:pt-1">
          <button onClick={() => { setFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' }); onClose(); }}
            className="flex-1 py-2.5 md:py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Clear All
          </button>
          <button onClick={() => { onApply(); onClose(); }}
            className="flex-1 py-2.5 md:py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'business' | 'all'>('business');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [showFilter, setShowFilter] = useState(false);
  const [showCols, setShowCols] = useState(false);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null); // State for Customer Modal
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced Features States
  const [visibleCols, setVisibleCols] = useState<string[]>(TOGGLEABLE_COLUMNS.map(c => c.id));
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' });

  // REALTIME SETUP
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('orders-realtime-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${user.id}` },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setOrders((prev) => [payload.new as Order, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setOrders((prev) => prev.map(o => o.id === payload.new.id ? (payload.new as Order) : o));
            } else if (payload.eventType === 'DELETE') {
              setOrders((prev) => prev.filter(o => o.id !== payload.old.id));
            }
          }
        )
        .subscribe();
      
return () => { supabase.removeChannel(channel); };
    };

    setupRealtime();
  }, []);

  const fetchOrders = useCallback(async (bizId: string | null, mode: 'business' | 'all') => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (mode === 'business' && bizId) query = query.eq('business_id', bizId);
    else {
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

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setShowCols(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtering Logic
  const filteredData = orders.filter(t => {
    if (appliedFilters.status.length && !appliedFilters.status.some(s =>
      s === 'success' ? ['paid', 'success', 'completed'].includes(t.status?.toLowerCase()) : t.status?.toLowerCase() === s)) return false;
    if (appliedFilters.method_category.length) {
      const cat = getMethodCategory(t.method);
      if (!cat || !appliedFilters.method_category.includes(cat)) return false;
    }
    if (appliedFilters.date_from && new Date(t.created_at) < new Date(appliedFilters.date_from)) return false;
    if (appliedFilters.date_to && new Date(t.created_at) > new Date(appliedFilters.date_to + 'T23:59:59')) return false;
    if (appliedFilters.trx_id && !(t.trx_id || '').toLowerCase().includes(appliedFilters.trx_id.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!((t.order_no || '').toLowerCase().includes(q) || (t.customer_name || '').toLowerCase().includes(q) || (t.trx_id || '').toLowerCase().includes(q) || (t.product_name || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const activeFilterCount = appliedFilters.status.length + appliedFilters.method_category.length + (appliedFilters.date_from ? 1 : 0) + (appliedFilters.date_to ? 1 : 0) + (appliedFilters.trx_id ? 1 : 0);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const filteredVolume = filteredData.reduce((sum, trx) => sum + (trx.amount || 0), 0);

  useEffect(() => { setCurrentPage(1); setSelectedRows([]); }, [searchTerm, appliedFilters]);

  // Bulk Actions & Helpers
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) setSelectedRows([]);
    else setSelectedRows(paginatedData.map(o => o.id));
  };
  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) setSelectedRows(selectedRows.filter(r => r !== id));
    else setSelectedRows([...selectedRows, id]);
  };
  const toggleColumn = (id: string) => {
    if (visibleCols.includes(id)) setVisibleCols(visibleCols.filter(c => c !== id));
    else setVisibleCols([...visibleCols, id]);
  };

  // Mock API requests for resending webhook
  const resendWebhook = async (id: string) => {
    const promise = fetch('/api/resend-webhook', { method: 'POST', body: JSON.stringify({ order_id: id }) }).then(res => { if(!res.ok) throw new Error(); });
    toast.promise(promise, { loading: 'Resending Webhook...', success: 'Webhook sent successfully!', error: 'Failed to send webhook.' });
  };
  const bulkResend = async () => {
    const promise = fetch('/api/bulk-resend-webhook', { method: 'POST', body: JSON.stringify({ order_ids: selectedRows }) }).then(res => { if(!res.ok) throw new Error(); });
    toast.promise(promise, { loading: `Resending ${selectedRows.length} Webhooks...`, success: 'All webhooks sent successfully!', error: 'Error sending webhooks.' });
    setSelectedRows([]);
  };

  const bulkExport = () => {
    const dataToExport = orders.filter(o => selectedRows.includes(o.id));
    handleExportCSV(dataToExport);
    setSelectedRows([]);
  };

  const handleExportCSV = (data: Order[] = filteredData) => {
    const headers = ['Order No', ...TOGGLEABLE_COLUMNS.filter(c => visibleCols.includes(c.id)).map(c => c.label)];
    const rows = data.map(t => {
      let row = [`"${t.order_no || ''}"`];
      if (visibleCols.includes('date')) row.push(`"${formatDate(t.created_at)}"`);
      if (visibleCols.includes('customer')) row.push(`"${t.customer_name || ''}"`);
      if (visibleCols.includes('email')) row.push(`"${t.customer_email || ''}"`);
      if (visibleCols.includes('phone')) row.push(`"${t.customer_number || ''}"`);
      if (visibleCols.includes('product')) row.push(`"${t.product_name || ''}"`);
      if (visibleCols.includes('source')) row.push(`"${t.source || ''}"`);
      if (visibleCols.includes('amount')) row.push(`"${t.amount}"`);
      if (visibleCols.includes('method')) row.push(`"${t.method || ''}"`);
      if (visibleCols.includes('trx_id')) row.push(`"${t.trx_id || ''}"`);
      if (visibleCols.includes('status')) row.push(`"${t.status || ''}"`);
      return row;
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully!');
  };

  if (!businessId && viewMode !== 'all') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold">Select a business from the sidebar to view transactions.</p>
      </div>
    );
  }
  return (
    <>
      {/* 💥 Modals extracted outside of the animated wrapper 💥 */}
      {drawerOrder && <TransactionDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} onResend={resendWebhook} />}
      {customerModal && <CustomerModal trx={customerModal} onClose={() => setCustomerModal(null)} />}

      <div className="max-w-[1600px] mx-auto space-y-5 pb-10">

        {/* ── Page Title + Controls Row ── */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/10 dark:bg-blue-500/20 p-2 rounded-xl">
                <Receipt size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                Transactions
              </h1>
            </div>
            <button onClick={() => fetchOrders(businessId, viewMode)}
              className="md:hidden flex items-center justify-center h-10 w-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
              {(['business', 'all'] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`flex-1 sm:flex-none py-2 px-5 rounded-lg text-[13px] font-bold transition-all ${viewMode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {m === 'business' ? 'Business' : 'All Data'}
                </button>
              ))}
            </div>

            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 focus-within:text-blue-600 transition-colors" size={15} />
              <input type="text" placeholder="Search order, name, trx..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 pl-10 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full sm:w-auto">
              {/* Filter Panel */}
              <div className="relative flex-1 sm:flex-none" ref={filterRef}>
                <button onClick={() => setShowFilter(v => !v)}
                  className={`flex w-full items-center justify-center gap-2 h-[42px] px-4 rounded-xl text-[13px] font-bold border transition-all ${showFilter || activeFilterCount > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  <Filter size={15} /> Filters
                  {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                </button>
                {showFilter && <FilterPanel filters={filters} setFilters={setFilters} onApply={() => setAppliedFilters(filters)} onClose={() => setShowFilter(false)} />}
              </div>

              {/* Column Toggle Mobile Centered Modal */}
              <div className="relative flex-1 sm:flex-none" ref={colsRef}>
                <button onClick={() => setShowCols(v => !v)}
                  className="flex w-full items-center justify-center gap-2 h-[42px] px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                  <Columns size={15} /> Columns
                </button>
                {showCols && (
                  <>
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90] md:hidden" onClick={() => setShowCols(false)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:absolute md:top-full md:right-0 md:left-auto md:translate-x-0 md:translate-y-0 mt-0 md:mt-2 z-[100] w-[80vw] max-w-[280px] md:w-48 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 md:p-2 animate-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center md:hidden mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white">Columns</h3>
                        <button onClick={() => setShowCols(false)} className="p-1 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"><X size={14}/></button>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {TOGGLEABLE_COLUMNS.map(col => (
                          <label key={col.id} className="flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                            <input type="checkbox" checked={visibleCols.includes(col.id)} onChange={() => toggleColumn(col.id)} className="w-4 h-4 md:w-3.5 md:h-3.5 rounded text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm md:text-[13px] font-bold text-slate-700 dark:text-slate-300">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => handleExportCSV()} className="flex flex-1 sm:flex-none items-center justify-center gap-2 h-[42px] px-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                <Download size={15} /> <span className="hidden sm:inline">Export</span>
              </button>
              <button onClick={() => fetchOrders(businessId, viewMode)} title="Refresh" className="hidden md:flex items-center justify-center h-[42px] w-[42px] bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm shrink-0">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mini Analytics & Filter Tags ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 && appliedFilters.status.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
                {s}
                <button onClick={() => setAppliedFilters(f => ({ ...f, status: f.status.filter(x => x !== s) }))} className="hover:text-blue-900 dark:hover:text-blue-100"><X size={12} /></button>
              </span>
            ))}
            {activeFilterCount > 0 && (
              <button onClick={() => setAppliedFilters({ status: [], method_category: [], date_from: '', date_to: '', trx_id: '' })} className="px-3 py-1.5 text-red-500 text-[11px] font-bold uppercase hover:text-red-700 transition-colors">Clear All</button>
            )}
          </div>
          
          {!loading && filteredData.length > 0 && (
            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 ml-auto">
              <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
              <p className="text-[13px] font-bold text-indigo-900 dark:text-indigo-300">
                Found: <span className="text-indigo-600 dark:text-indigo-400">{filteredData.length}</span>
                <span className="opacity-30 mx-3">|</span>
                Volume: <span className="text-indigo-600 dark:text-indigo-400">৳ {filteredVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Table Area ── */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
          {loading ? <TableSkeleton /> : filteredData.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"><Receipt size={24} /></div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Transactions Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[13px] font-bold max-w-sm mx-auto">
                {searchTerm || activeFilterCount > 0 ? 'No results match your criteria.' : 'No payments received yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0B1120]/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-4 w-10">
                      <input type="checkbox" onChange={handleSelectAll} checked={paginatedData.length > 0 && paginatedData.every(o => selectedRows.includes(o.id))} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Order No</th>
                    {TOGGLEABLE_COLUMNS.map(col => visibleCols.includes(col.id) && (
                      <th key={col.id} className="px-5 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{col.label}</th>
                    ))}
                    <th className="px-5 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {paginatedData.map((trx) => {
                    const badge = statusConfig(trx.status);
                    const methodColor = getMethodTextColor(trx.method);
                    const isSelected = selectedRows.includes(trx.id);

                    return (
                      <tr key={trx.id} onClick={() => toggleRow(trx.id)} className={`transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}>
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleRow(trx.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        </td>
                        <td className="px-5 py-4 text-[14px] font-mono font-semibold text-indigo-600 dark:text-indigo-400" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.order_no || '—'}</td>
                        
                        {visibleCols.includes('date') && (
                          <td className="px-5 py-4" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{formatDate(trx.created_at)}</p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{formatTime(trx.created_at)}</p>
                          </td>
                        )}
                        {visibleCols.includes('customer') && <td className="px-5 py-4 text-[13px] text-blue-600 dark:text-blue-400 font-semibold max-w-[150px] truncate" onClick={e => {e.stopPropagation(); setCustomerModal(trx);}}>{trx.customer_name || '—'}</td>}
                        {visibleCols.includes('email') && <td className="px-5 py-4 text-[13px] text-slate-700 dark:text-slate-300 font-medium max-w-[160px] truncate" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.customer_email || '—'}</td>}
                        {visibleCols.includes('phone') && <td className="px-5 py-4 text-[13px] font-medium text-slate-700 dark:text-slate-300" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.customer_number || '—'}</td>}
                        {visibleCols.includes('product') && <td className="px-5 py-4 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 max-w-[140px] truncate" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.product_name || '—'}</td>}
                        {visibleCols.includes('source') && <td className="px-5 py-4 text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.source || 'link'}</td>}
                        {visibleCols.includes('amount') && (
                          <td className="px-5 py-4 text-[13px] font-bold text-slate-900 dark:text-white" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>
                            ৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {visibleCols.includes('method') && <td className={`px-5 py-4 text-[12px] font-bold uppercase tracking-wider ${methodColor}`} onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>{trx.method || '—'}</td>}
                        {visibleCols.includes('trx_id') && (
                          <td className="px-5 py-4" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>
                            {trx.trx_id ? <span className="text-[14px] font-mono font-bold text-purple-600 dark:text-purple-400">{trx.trx_id}</span> : <span className="text-[13px] text-slate-400 italic font-medium">Awaiting</span>}
                          </td>
                        )}
                        {visibleCols.includes('status') && (
                          <td className="px-5 py-4" onClick={e => {e.stopPropagation(); setDrawerOrder(trx);}}>
                            <span className={`inline-flex items-center gap-1.5 text-[12px] uppercase tracking-wider ${badge.cls}`}>{badge.label}</span>
                          </td>
                        )}

                        <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setDrawerOrder(trx)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100">
                            <PanelRightClose size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Bulk Actions Floating Bar ── */}
          {selectedRows.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-slate-700 dark:border-slate-200">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-700 dark:border-slate-300">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{selectedRows.length}</div>
                  <span className="text-[13px] font-bold">Selected</span>
                </div>
                <button onClick={bulkExport} className="text-[13px] font-bold flex items-center gap-1.5 hover:text-blue-400 dark:hover:text-blue-600 transition-colors"><Download size={14}/> Export</button>
                <button onClick={bulkResend} className="text-[13px] font-bold flex items-center gap-1.5 hover:text-indigo-400 dark:hover:text-indigo-600 transition-colors"><Webhook size={14}/> Resend</button>
                <button onClick={() => setSelectedRows([])} className="ml-1 p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors"><X size={15}/></button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredData.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[12px] font-medium text-slate-500">
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredData.length}</span> records
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={15} /></button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 text-[13px] font-bold rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{page}</button>
                    );
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={15} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}