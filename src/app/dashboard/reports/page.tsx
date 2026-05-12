'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  BarChart3, RefreshCw, Download, Building2, TrendingUp, TrendingDown,
  DollarSign, CheckCircle, Clock, XCircle, Loader2, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type Order = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  created_at: string;
  business_id: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isPaid = (s: string) => ['paid', 'success', 'completed'].includes((s || '').toLowerCase());
const isFailed = (s: string) => ['failed', 'rejected', 'cancelled'].includes((s || '').toLowerCase());

const GATEWAY_COLORS: Record<string, string> = {
  bkash: '#e2136e', nagad: '#f05223', rocket: '#8b3cff', upay: '#0066cc',
  stripe: '#635bff', paypal: '#0070ba', binance: '#f0b90b', bank: '#2563eb',
  other: '#64748b',
};
const getGwColor = (key: string) => {
  const k = key.toLowerCase();
  for (const [name, color] of Object.entries(GATEWAY_COLORS)) {
    if (k.includes(name)) return color;
  }
  return '#6366f1';
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.id === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white shadow-sm hover:border-blue-400 transition-all">
        {current?.label} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${value === o.id ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card (matches Dashboard style) ──────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, borderClass, sub }: {
  icon: any; label: string; value: string; colorClass: string; borderClass: string; sub?: string;
}) {
  return (
    <div className={`bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 border-b-2 ${borderClass} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${colorClass}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Pie Chart for gateway usage (matches Dashboard donut style) ───────────────
const RADIAN = Math.PI / 180;
function GatewayPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">No gateway data</div>
  );
  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" stroke="none">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v: any) => [fmtBDT(v), 'Volume']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.15)', background: '#111827', color: '#fff', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{d.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">{fmtBDT(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Area Chart for revenue trend ─────────────────────────────────────────────
function RevenueTrendChart({ data }: { data: { date: string; amount: number }[] }) {
  if (!data.length || data.every(d => d.amount === 0)) return (
    <div className="flex items-center justify-center h-44 text-slate-400 text-sm font-medium">No revenue data for this period</div>
  );
  return (
    <ResponsiveContainer width="100%" height={176}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.4} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v.toLocaleString()}`} />
        <Tooltip formatter={(v: any) => [fmtBDT(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.15)', background: '#111827', color: '#fff', fontSize: 12 }} />
        <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="lg:col-span-2 h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allBusinessIds, setAllBusinessIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [businessScope, setBusinessScope] = useState<'this' | 'all'>('this');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | 'month' | '30d' | 'all'>('7d');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from('businesses').select('id').eq('merchant_id', user.id);
      const ids = (biz || []).map((b: any) => b.id);
      setAllBusinessIds(ids);
      const savedId = localStorage.getItem('active_business_id');
      if (savedId) setBusinessId(savedId);
      else if (ids.length > 0) setBusinessId(ids[0]);
    };
    init();
    const onBizChange = () => {
      const id = localStorage.getItem('active_business_id');
      if (id) setBusinessId(id);
    };
    window.addEventListener('businessChanged', onBizChange);
    return () => window.removeEventListener('businessChanged', onBizChange);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!businessId && businessScope === 'this') { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from('orders').select('id, amount, status, method, created_at, business_id');

      if (businessScope === 'this' && businessId) {
        query = query.eq('business_id', businessId);
      } else if (businessScope === 'all') {
        query = query.in('business_id', allBusinessIds);
      }

      // Date filter
      const now = new Date();
      if (timeRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', start);
      } else if (timeRange === '7d') {
        query = query.gte('created_at', new Date(now.getTime() - 7 * 86400000).toISOString());
      } else if (timeRange === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', start);
      } else if (timeRange === '30d') {
        query = query.gte('created_at', new Date(now.getTime() - 30 * 86400000).toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [businessScope, timeRange, businessId, allBusinessIds]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ─── Computed Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => isPaid(o.status));
    const failedOrders = orders.filter(o => isFailed(o.status));
    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending');
    const totalVolume = paidOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
    const avgOrder = paidOrders.length > 0 ? totalVolume / paidOrders.length : 0;
    const successRate = orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0;
    return { totalVolume, successCount: paidOrders.length, failCount: failedOrders.length, pendingCount: pendingOrders.length, avgOrder, successRate, total: orders.length };
  }, [orders]);

  // ─── Chart Data ───────────────────────────────────────────────────────────
  const { chartData, gatewayData } = useMemo(() => {
    const now = new Date();
    let buckets: { date: string; amount: number }[] = [];

    if (timeRange === 'today') {
      for (let h = 0; h < 24; h++) {
        buckets.push({ date: `${h}:00`, amount: 0 });
      }
      orders.forEach(o => {
        if (!isPaid(o.status)) return;
        const d = new Date(o.created_at);
        const h = d.getHours();
        buckets[h].amount += Number(o.amount || 0);
      });
    } else if (timeRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        buckets.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: 0 });
      }
      orders.forEach(o => {
        if (!isPaid(o.status)) return;
        const d = new Date(o.created_at);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const b = buckets.find(b => b.date === label);
        if (b) b.amount += Number(o.amount || 0);
      });
    } else if (timeRange === 'month' || timeRange === '30d') {
      const days = timeRange === 'month' ? now.getDate() : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        buckets.push({ date: `${d.getDate()}`, amount: 0 });
      }
      orders.forEach(o => {
        if (!isPaid(o.status)) return;
        const d = new Date(o.created_at);
        const label = `${d.getDate()}`;
        const b = buckets.find(b => b.date === label);
        if (b) b.amount += Number(o.amount || 0);
      });
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ date: d.toLocaleDateString('en-US', { month: 'short' }), amount: 0 });
      }
      orders.forEach(o => {
        if (!isPaid(o.status)) return;
        const d = new Date(o.created_at);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const b = buckets.find(b => b.date === label);
        if (b) b.amount += Number(o.amount || 0);
      });
    }

    // Gateway split
    const gwMap: Record<string, number> = {};
    orders.forEach(o => {
      if (!isPaid(o.status)) return;
      const key = (o.method?.split('_')[0] || 'other').toLowerCase();
      gwMap[key] = (gwMap[key] || 0) + Number(o.amount || 0);
    });
    const gatewayData = Object.entries(gwMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: getGwColor(name) }));

    return { chartData: buckets, gatewayData };
  }, [orders, timeRange]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalVolume.toFixed(2)],
      ['Successful Payments', stats.successCount],
      ['Failed Payments', stats.failCount],
      ['Pending Payments', stats.pendingCount],
      ['Success Rate', `${stats.successRate.toFixed(1)}%`],
      ['Average Order Value', stats.avgOrder.toFixed(2)],
      [],
      ['Date', 'Revenue'],
      ...chartData.map(d => [d.date, d.amount.toFixed(2)]),
      [],
      ['Gateway', 'Volume'],
      ...gatewayData.map(d => [d.name, d.value.toFixed(2)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xelpay-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scopeOptions = [
    { id: 'this', label: 'This Business' },
    { id: 'all', label: 'All Businesses' },
  ];
  const rangeOptions = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: 'month', label: 'This Month' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All Time' },
  ];

  const getRangeLabel = () => rangeOptions.find(o => o.id === timeRange)?.label || '';

  if (!businessId && businessScope === 'this') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium text-sm">Please select a business from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header (matches Dashboard style) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <BarChart3 size={28} className="text-blue-600" /> Reports & Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Payment volume, conversion rates, and gateway breakdown.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={fetchAnalytics} className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all shadow-sm">
              <RefreshCw size={15} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-black text-xs shadow-md hover:-translate-y-0.5 transition-all uppercase tracking-widest">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown value={businessScope} onChange={(v) => setBusinessScope(v as any)} options={scopeOptions} />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm overflow-x-auto">
            {rangeOptions.map(o => (
              <button key={o.id} onClick={() => setTimeRange(o.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${timeRange === o.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <Skeleton /> : (
        <>
          {/* ── Stats Cards (matches Dashboard Order Status card style) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={fmtBDT(stats.totalVolume)} colorClass="text-blue-600 dark:text-blue-400" borderClass="border-b-blue-600 dark:border-b-blue-500" />
            <StatCard icon={CheckCircle} label="Successful" value={String(stats.successCount)} colorClass="text-emerald-600 dark:text-emerald-400" borderClass="border-b-emerald-600 dark:border-b-emerald-500"
              sub={`${stats.successRate.toFixed(1)}% success rate`} />
            <StatCard icon={Clock} label="Pending" value={String(stats.pendingCount)} colorClass="text-amber-500 dark:text-amber-400" borderClass="border-b-amber-500 dark:border-b-amber-400" />
            <StatCard icon={XCircle} label="Failed / Cancelled" value={String(stats.failCount)} colorClass="text-red-500 dark:text-red-400" borderClass="border-b-red-500 dark:border-b-red-400" />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Revenue Growth (matches Dashboard style) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Revenue Growth</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{getRangeLabel()}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                  <TrendingUp size={13} className="text-blue-600" />
                  <span className="text-xs font-black text-blue-600">{fmtBDT(stats.totalVolume)}</span>
                </div>
              </div>
              <RevenueTrendChart data={chartData} />
            </div>

            {/* Gateway Usage (matches Dashboard Order Status donut style) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Gateway Usage</h3>
              <p className="text-[11px] text-slate-400 font-medium mb-4">Revenue by payment method</p>
              <GatewayPieChart data={gatewayData} />
            </div>
          </div>

          {/* ── Summary Table ── */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Summary</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { label: 'Total Orders', value: String(stats.total) },
                { label: 'Total Volume', value: fmtBDT(stats.totalVolume) },
                { label: 'Successful Transactions', value: String(stats.successCount) },
                { label: 'Failed / Cancelled', value: String(stats.failCount) },
                { label: 'Pending', value: String(stats.pendingCount) },
                { label: 'Success Rate', value: `${stats.successRate.toFixed(1)}%` },
                { label: 'Average Order Value', value: fmtBDT(stats.avgOrder) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}