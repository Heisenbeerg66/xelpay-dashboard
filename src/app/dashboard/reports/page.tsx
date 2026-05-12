'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, DollarSign, CheckCircle, Clock, XCircle, Download,
  Calendar, Filter, RefreshCw, Loader2, Building2, ArrowUpRight,
  ArrowDownRight, BarChart2, PieChart as PieIcon, Activity, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────
type Order = {
  id: string; order_no: string; amount: number; currency: string;
  status: string; method: string | null; created_at: string; source: string | null;
};

// ── Constants ─────────────────────────────────────────────────
const COLORS = { success: '#10b981', pending: '#f59e0b', failed: '#ef4444', cancelled: '#94a3b8' };
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const DATE_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'all', label: 'All Time' },
];

// ── Helpers ───────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

function getDateRange(filter: string): Date | null {
  const now = new Date();
  if (filter === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === '7d') return new Date(now.getTime() - 7 * 86400000);
  if (filter === '30d') return new Date(now.getTime() - 30 * 86400000);
  if (filter === '90d') return new Date(now.getTime() - 90 * 86400000);
  return null;
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, colorClass, borderClass }: any) {
  const isPositive = trend >= 0;
  return (
    <div className={`bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm border-b-4 ${borderClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 ${colorClass}`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
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

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState('30d');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from('businesses').select('id').eq('merchant_id', user.id).eq('status', 'active').limit(1).maybeSingle();
      const bizId = biz?.id;
      setBusinessId(bizId || null);
      if (!bizId) { setLoading(false); return; }

      const { data: orders } = await supabase
        .from('orders')
        .select('id,order_no,amount,currency,status,method,created_at,source')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });

      setAllOrders(orders || []);
    } catch (e: any) {
      toast.error('Failed to load: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = useMemo(() => {
    const since = getDateRange(dateFilter);
    if (!since) return allOrders;
    return allOrders.filter(o => new Date(o.created_at) >= since);
  }, [allOrders, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    const success = filtered.filter(o => o.status === 'success' || o.status === 'verified');
    const pending = filtered.filter(o => o.status === 'pending');
    const failed = filtered.filter(o => o.status === 'failed' || o.status === 'cancelled');
    const totalVolume = success.reduce((s, o) => s + (o.amount || 0), 0);
    const successRate = filtered.length > 0 ? (success.length / filtered.length) * 100 : 0;
    const avgOrderValue = success.length > 0 ? totalVolume / success.length : 0;
    return { totalVolume, successCount: success.length, pendingCount: pending.length, failCount: failed.length, successRate, avgOrderValue, total: filtered.length };
  }, [filtered]);

  // Revenue over time
  const chartData = useMemo(() => {
    const groupBy: Record<string, number> = {};
    filtered.filter(o => o.status === 'success' || o.status === 'verified').forEach(o => {
      const key = fmtDate(o.created_at);
      groupBy[key] = (groupBy[key] || 0) + (o.amount || 0);
    });
    return Object.entries(groupBy).slice(-30).map(([date, revenue]) => ({ date, revenue }));
  }, [filtered]);

  // Method breakdown
  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => { const m = o.method || 'unknown'; map[m] = (map[m] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Status breakdown for pie
  const pieData = [
    { name: 'Success', value: stats.successCount, color: COLORS.success },
    { name: 'Pending', value: stats.pendingCount, color: COLORS.pending },
    { name: 'Failed', value: stats.failCount, color: COLORS.failed },
  ].filter(d => d.value > 0);

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Order No', 'Amount', 'Currency', 'Status', 'Method', 'Date'],
      ...filtered.map(o => [o.order_no, o.amount, o.currency || 'BDT', o.status, o.method || '', o.created_at]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${dateFilter}.csv`; a.click();
    toast.success('Report exported!');
  };

  const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white">{fmtBDT(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Revenue insights and transaction analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Date filter + chart toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-white dark:bg-[#111827] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-0.5">
          {DATE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id)}
              className={`px-4 py-2 text-[13px] font-black rounded-lg transition-all ${dateFilter === f.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
          <button onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500'}`}>
            <Activity size={15} />
          </button>
          <button onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500'}`}>
            <BarChart2 size={15} />
          </button>
        </div>
      </div>

      {loading ? <Skeleton /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={fmtBDT(stats.totalVolume)}
              colorClass="text-blue-600 dark:text-blue-400" borderClass="border-b-blue-600 dark:border-b-blue-500" />
            <StatCard icon={CheckCircle} label="Successful" value={String(stats.successCount)}
              sub={`${stats.successRate.toFixed(1)}% success rate`}
              colorClass="text-emerald-600 dark:text-emerald-400" borderClass="border-b-emerald-600 dark:border-b-emerald-500" />
            <StatCard icon={Clock} label="Pending" value={String(stats.pendingCount)}
              colorClass="text-amber-500 dark:text-amber-400" borderClass="border-b-amber-500 dark:border-b-amber-400" />
            <StatCard icon={XCircle} label="Failed / Cancelled" value={String(stats.failCount)}
              colorClass="text-red-500 dark:text-red-400" borderClass="border-b-red-500 dark:border-b-red-400" />
          </div>

          {/* Additional stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Transactions</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Order Value</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtBDT(stats.avgOrderValue)}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.successRate.toFixed(1)}%</p>
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.successRate}%` }} />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Revenue Chart */}
            <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Revenue Growth</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Successful transactions over time</p>
                </div>
                <Zap size={14} className="text-blue-600" />
              </div>
              {chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium">No revenue data for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  {chartType === 'area' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRev)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Pie */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5">Order Status</h2>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium">No data</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [v, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Method Breakdown */}
          {methodData.length > 0 && (
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5">Payment Method Breakdown</h2>
              <div className="space-y-3">
                {methodData.slice(0, 8).map((m, i) => {
                  const pct = stats.total > 0 ? (m.count / stats.total) * 100 : 0;
                  return (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 w-20 truncate capitalize">{m.name}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white w-10 text-right">{m.count}</span>
                      <span className="text-[10px] text-slate-400 w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent high-value transactions */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Top Transactions</h2>
            </div>
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">No transactions in this period</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.filter(o => o.status === 'success' || o.status === 'verified').sort((a, b) => b.amount - a.amount).slice(0, 10).map(o => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{o.order_no}</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(o.created_at)} · {o.method || 'N/A'}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fmtBDT(o.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}