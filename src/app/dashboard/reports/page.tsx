'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, BarChart3, TrendingUp, TrendingDown, Calendar, Download, Loader2, Building2, Wallet, PieChart, RefreshCw, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtBDT(n: number) {
  return '৳ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const GATEWAY_COLORS: Record<string, string> = {
  bkash: '#E91E8C',
  nagad: '#F26522',
  rocket: '#8B2FC9',
  upay: '#00A9E0',
  bank: '#2563EB',
  stripe: '#635BFF',
  paypal: '#003087',
  usdt: '#26A17B',
  other: '#64748B',
};

function getGatewayColor(method: string) {
  const key = method?.toLowerCase() || 'other';
  for (const [k, v] of Object.entries(GATEWAY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return GATEWAY_COLORS.other;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} style={{ background: color }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: color + '18' }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg`} style={{ background: color + '12', color }}>
          {sub}
        </span>
      </div>
      <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
  );
}

// ── Premium Pie Chart (pure SVG) ──────────────────────────────────────────────
function PremiumPieChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-600 text-sm font-medium">No gateway data</div>
  );

  const entries = Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const radius = 70;
  const cx = 90, cy = 90;
  let cumulative = 0;

  const slices = entries.map(([method, value]) => {
    const pct = value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: getGatewayColor(method),
      method,
      value,
      pct: (pct * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0 drop-shadow-lg">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer">
            <title>{s.method}: {s.pct}% — {fmtBDT(s.value)}</title>
          </path>
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={38} className="fill-white dark:fill-[#111827]" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-slate-900" style={{ fontSize: 9, fontWeight: 900, fill: 'currentColor' }}>Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 7, fill: '#6B7280', fontWeight: 600 }}>{fmtBDT(total)}</text>
      </svg>

      <div className="flex flex-col gap-2 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize flex-1">{s.method}</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">{s.pct}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{fmtBDT(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { date: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-1.5 md:gap-3 h-44 pt-6 relative">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="border-b border-slate-100 dark:border-slate-800/60 w-full h-0" />
        ))}
      </div>
      {data.map((d, i) => {
        const h = max > 0 ? Math.max((d.amount / max) * 100, d.amount > 0 ? 4 : 0) : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {fmtBDT(d.amount)}
            </div>
            <div
              className="w-full rounded-t-lg transition-all duration-500 relative"
              style={{ height: `${h}%`, minHeight: d.amount > 0 ? 4 : 0, background: 'linear-gradient(180deg, #2563EB 0%, #3B82F6 100%)' }}
            />
            <span className="text-[9px] font-bold text-slate-400 truncate w-full text-center">{d.date}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Dropdown Component ────────────────────────────────────────────────────────
function Dropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.id === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:border-blue-400 transition-all whitespace-nowrap"
      >
        {current?.label} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 min-w-[160px] py-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map(o => (
            <button
              key={o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${value === o.id ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [businessScope, setBusinessScope] = useState<'this' | 'all'>('this');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | 'month' | '30d' | 'all'>('7d');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allBusinessIds, setAllBusinessIds] = useState<string[]>([]);

  const [stats, setStats] = useState({ totalVolume: 0, successCount: 0, failCount: 0, avgOrder: 0, pendingCount: 0 });
  const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);
  const [gatewaySplit, setGatewaySplit] = useState<Record<string, number>>({});

  useEffect(() => {
    const activeId = localStorage.getItem('active_business_id');
    if (activeId) setBusinessId(activeId);

    // Load all business IDs for "All Businesses" scope
    const loadAllBizIds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('businesses').select('id').eq('merchant_id', user.id);
        if (data) setAllBusinessIds(data.map((b: any) => b.id));
      }
    };
    loadAllBizIds();

    window.addEventListener('businessChanged', () => {
      const id = localStorage.getItem('active_business_id');
      if (id) setBusinessId(id);
    });
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Determine which business IDs to query
      const ids = businessScope === 'all' ? allBusinessIds : (businessId ? [businessId] : []);
      if (ids.length === 0) { setLoading(false); return; }

      // Date filter
      let startDate: Date | null = null;
      const now = new Date();
      if (timeRange === 'today') { startDate = new Date(now); startDate.setHours(0, 0, 0, 0); }
      else if (timeRange === '7d') { startDate = new Date(now); startDate.setDate(now.getDate() - 6); startDate.setHours(0, 0, 0, 0); }
      else if (timeRange === 'month') { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }
      else if (timeRange === '30d') { startDate = new Date(now); startDate.setDate(now.getDate() - 29); startDate.setHours(0, 0, 0, 0); }

      let query = supabase.from('orders').select('amount, status, created_at, method').in('business_id', ids).order('created_at', { ascending: true });
      if (startDate) query = query.gte('created_at', startDate.toISOString());

      const { data: orders } = await query;

      if (!orders) { setLoading(false); return; }

      let total = 0, successCount = 0, failCount = 0, pendingCount = 0;
      const methods: Record<string, number> = {};

      // Build chart buckets
      const numDays = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === 'month' ? now.getDate() : timeRange === '30d' ? 30 : 60;
      const chartBuckets = Array.from({ length: Math.min(numDays, 60) }).map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (Math.min(numDays, 60) - 1 - i));
        return {
          date: numDays <= 7
            ? d.toLocaleDateString('en-US', { weekday: 'short' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: d.toDateString(),
          amount: 0,
        };
      });

      orders.forEach((order: any) => {
        const amt = parseFloat(order.amount || '0');
        const method = (order.method || 'other').toLowerCase();
        const orderDate = new Date(order.created_at).toDateString();

        if (order.status === 'paid' || order.status === 'success') {
          total += amt;
          successCount++;
          methods[method] = (methods[method] || 0) + amt;
          const bucket = chartBuckets.find(d => d.fullDate === orderDate);
          if (bucket) bucket.amount += amt;
        } else if (order.status === 'failed' || order.status === 'cancelled') {
          failCount++;
        } else if (order.status === 'pending') {
          pendingCount++;
        }
      });

      setStats({ totalVolume: total, successCount, failCount, avgOrder: successCount > 0 ? total / successCount : 0, pendingCount });
      setChartData(chartBuckets.map(b => ({ date: b.date, amount: b.amount })));
      setGatewaySplit(methods);
    } finally {
      setLoading(false);
    }
  }, [businessScope, timeRange, businessId, allBusinessIds]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalVolume.toFixed(2)],
      ['Successful Payments', stats.successCount],
      ['Failed Payments', stats.failCount],
      ['Pending Payments', stats.pendingCount],
      ['Average Order Value', stats.avgOrder.toFixed(2)],
      [],
      ['Date', 'Revenue'],
      ...chartData.map(d => [d.date, d.amount.toFixed(2)]),
      [],
      ['Gateway', 'Volume'],
      ...Object.entries(gatewaySplit).map(([k, v]) => [k, v.toFixed(2)]),
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

  const successRate = stats.successCount + stats.failCount > 0
    ? ((stats.successCount / (stats.successCount + stats.failCount)) * 100).toFixed(1)
    : '0.0';

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

      {/* ── Header ── */}
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

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            value={businessScope}
            onChange={(v) => setBusinessScope(v as any)}
            options={scopeOptions}
          />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm overflow-x-auto">
            {rangeOptions.map(o => (
              <button
                key={o.id}
                onClick={() => setTimeRange(o.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${timeRange === o.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={fmtBDT(stats.totalVolume)} sub="Volume" icon={TrendingUp} color="#2563EB" />
            <StatCard label="Successful" value={stats.successCount} sub={`${successRate}%`} icon={BarChart3} color="#10B981" />
            <StatCard label="Failed" value={stats.failCount} sub="Txns" icon={TrendingDown} color="#EF4444" />
            <StatCard label="Avg. Order" value={fmtBDT(stats.avgOrder)} sub="Per txn" icon={Wallet} color="#8B5CF6" />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Revenue Bar Chart */}
            <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Revenue Trend</h3>
              <p className="text-[11px] text-slate-400 font-medium mb-4">
                {rangeOptions.find(r => r.id === timeRange)?.label} — {scopeOptions.find(s => s.id === businessScope)?.label}
              </p>
              {chartData.every(d => d.amount === 0) ? (
                <div className="h-44 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm font-medium">No revenue data for this period</div>
              ) : (
                <BarChart data={chartData} />
              )}
            </div>

            {/* Gateway Pie Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <PieChart size={14} className="text-blue-600" /> Gateway Usage
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mb-4">Revenue by payment method</p>
              <PremiumPieChart data={gatewaySplit} />
            </div>
          </div>

          {/* ── Summary Table ── */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Summary</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { label: 'Total Volume', value: fmtBDT(stats.totalVolume) },
                { label: 'Successful Transactions', value: stats.successCount },
                { label: 'Failed / Cancelled', value: stats.failCount },
                { label: 'Pending', value: stats.pendingCount },
                { label: 'Success Rate', value: `${successRate}%` },
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