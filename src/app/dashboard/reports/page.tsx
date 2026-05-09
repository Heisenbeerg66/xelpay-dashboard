'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Wallet, Download,
  Loader2, Building2, PieChart as PieIcon, RefreshCw, ChevronDown,
  DollarSign, ShoppingCart, CheckCircle2, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtBDT(n: number) {
  return '৳ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Group mobile banking variants together
function normalizeGateway(method: string): string {
  const m = (method || 'other').toLowerCase().trim();
  if (m.includes('bkash')) return 'bKash';
  if (m.includes('nagad')) return 'Nagad';
  if (m.includes('rocket')) return 'Rocket';
  if (m.includes('upay')) return 'Upay';
  if (m.includes('cellfin')) return 'Cellfin';
  if (m.includes('bank') || m.includes('dutch') || m.includes('dbbl') || m.includes('brac') || m.includes('ebl')) return 'Bank Transfer';
  if (m.includes('stripe')) return 'Stripe';
  if (m.includes('paypal')) return 'PayPal';
  if (m.includes('usdt') || m.includes('crypto') || m.includes('binance')) return 'Crypto';
  return method || 'Other';
}

const GATEWAY_COLORS: Record<string, string> = {
  'bKash': '#E91E8C',
  'Nagad': '#F26522',
  'Rocket': '#8B2FC9',
  'Upay': '#00A9E0',
  'Cellfin': '#00B4D8',
  'Bank Transfer': '#2563EB',
  'Stripe': '#635BFF',
  'PayPal': '#003087',
  'Crypto': '#26A17B',
  'Other': '#64748B',
};

function getGatewayColor(name: string) {
  return GATEWAY_COLORS[name] || '#64748B';
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, bgColor, iconColor }: {
  label: string; value: string | number; sub?: string; icon: any; bgColor: string; iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: bgColor }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {sub && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg" style={{ backgroundColor: bgColor, color: iconColor }}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
  );
}

// ── Premium Pie Chart ─────────────────────────────────────────────────────────
function PremiumPieChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-600 text-sm font-medium">No gateway data</div>
  );

  const entries = Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const radius = 65;
  const cx = 80, cy = 80;
  let cumulative = 0;

  const slices = entries.map(([name, value]) => {
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
      name,
      value,
      pct,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: getGatewayColor(name),
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Pie — no text inside */}
      <div className="shrink-0">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {/* Donut hole */}
          <circle cx={cx} cy={cy} r={38} fill="transparent" className="stroke-white dark:stroke-[#111827]" strokeWidth={2} />
          {slices.map((s) => (
            <path key={s.name} d={s.path} fill={s.color} stroke="white" strokeWidth={2} className="dark:stroke-[#111827]" />
          ))}
          <circle cx={cx} cy={cy} r={38} className="fill-white dark:fill-[#111827]" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {slices.slice(0, 6).map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{s.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-black text-slate-900 dark:text-white">{fmtBDT(s.value)}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: s.color + '20', color: s.color }}>
                {(s.pct * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
        {slices.length > 6 && (
          <p className="text-xs text-slate-400 text-center">+{slices.length - 6} more</p>
        )}
      </div>
    </div>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-all shadow-sm"
      >
        {selected?.label}
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 min-w-[160px] py-1">
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${value === o.id ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chart bucket builder ──────────────────────────────────────────────────────
function buildChartBuckets(timeRange: string, transactions: any[]): { label: string; amount: number }[] {
  const now = new Date();

  if (timeRange === 'today') {
    const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, amount: 0, h: i }));
    transactions.forEach(t => {
      const h = new Date(t.created_at).getHours();
      hours[h].amount += t.amount || 0;
    });
    return hours.map(({ label, amount }) => ({ label, amount }));
  }

  if (timeRange === '7d') {
    const days: { label: string; amount: number; dateStr: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: 0, dateStr: d.toISOString().slice(0, 10) });
    }
    transactions.forEach(t => {
      const ds = new Date(t.created_at).toISOString().slice(0, 10);
      const day = days.find(d => d.dateStr === ds);
      if (day) day.amount += t.amount || 0;
    });
    return days.map(({ label, amount }) => ({ label, amount }));
  }

  if (timeRange === 'month' || timeRange === '30d') {
    // Show date numbers 1,2,3...
    const daysCount = timeRange === 'month'
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      : 30;

    const days: { label: string; amount: number; day: number; month: number; year: number }[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ label: String(d.getDate()), amount: 0, day: d.getDate(), month: d.getMonth(), year: d.getFullYear() });
    }
    transactions.forEach(t => {
      const d = new Date(t.created_at);
      const bucket = days.find(b => b.day === d.getDate() && b.month === d.getMonth() && b.year === d.getFullYear());
      if (bucket) bucket.amount += t.amount || 0;
    });
    return days.map(({ label, amount }) => ({ label, amount }));
  }

  // All time — month-based
  const monthMap: Map<string, number> = new Map();
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthMap.set(key, (monthMap.get(key) || 0) + (t.amount || 0));
  });
  return Array.from(monthMap.entries()).map(([label, amount]) => ({ label, amount }));
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [businessScope, setBusinessScope] = useState<'this' | 'all'>('this');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | 'month' | '30d' | 'all'>('7d');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allBusinessIds, setAllBusinessIds] = useState<string[]>([]);

  const [stats, setStats] = useState({ totalVolume: 0, successCount: 0, failCount: 0, avgOrder: 0, pendingCount: 0 });
  const [chartData, setChartData] = useState<{ label: string; amount: number }[]>([]);
  const [gatewaySplit, setGatewaySplit] = useState<Record<string, number>>({});

  useEffect(() => {
    const activeId = localStorage.getItem('active_business_id');
    if (activeId) setBusinessId(activeId);

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
      const ids = businessScope === 'all' ? allBusinessIds : (businessId ? [businessId] : []);
      if (ids.length === 0) { setLoading(false); return; }

      const now = new Date();
      let fromDate: Date | null = null;

      if (timeRange === 'today') { fromDate = new Date(now); fromDate.setHours(0, 0, 0, 0); }
      else if (timeRange === '7d') { fromDate = new Date(now); fromDate.setDate(now.getDate() - 7); }
      else if (timeRange === 'month') { fromDate = new Date(now.getFullYear(), now.getMonth(), 1); }
      else if (timeRange === '30d') { fromDate = new Date(now); fromDate.setDate(now.getDate() - 30); }

      let query = supabase
        .from('payment_links')
        .select('id, amount, method, status, created_at')
        .in('business_id', ids);

      if (fromDate) query = query.gte('created_at', fromDate.toISOString());

      const { data: txns } = await query;
      const rows = txns || [];

      let totalVolume = 0, successCount = 0, failCount = 0, pendingCount = 0;
      const methods: Record<string, number> = {};

      rows.forEach((t: { status: any; amount: any; method: any }) => {
        const s = (t.status || '').toLowerCase();
        const isSuccess = ['paid', 'success', 'completed'].includes(s);
        const isFail = ['failed', 'rejected', 'cancelled'].includes(s);
        const isPending = s === 'pending';

        if (isSuccess) {
          totalVolume += t.amount || 0;
          successCount++;
          const normalized = normalizeGateway(t.method || '');
          methods[normalized] = (methods[normalized] || 0) + (t.amount || 0);
        }
        if (isFail) failCount++;
        if (isPending) pendingCount++;
      });

      const avgOrder = successCount > 0 ? totalVolume / successCount : 0;
      setStats({ totalVolume, successCount, failCount, avgOrder, pendingCount });
      setChartData(buildChartBuckets(timeRange, rows.filter((t: { status: any; }): boolean => {
        const s = (t.status || '').toLowerCase();
        return ['paid', 'success', 'completed'].includes(s);
      })));
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
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium text-sm">Please select a business from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Payment volume, conversion rates, and gateway breakdown.</p>
          </div>
          <div className="flex items-center gap-2">
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

      {loading ? (
        <div className="min-h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          {/* Stat Cards — solid icon backgrounds */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={fmtBDT(stats.totalVolume)} sub="Volume"
              icon={DollarSign} bgColor="#2563EB" iconColor="#fff" />
            <StatCard label="Successful" value={stats.successCount} sub={`${successRate}%`}
              icon={CheckCircle2} bgColor="#10B981" iconColor="#fff" />
            <StatCard label="Failed" value={stats.failCount} sub="Txns"
              icon={TrendingDown} bgColor="#EF4444" iconColor="#fff" />
            <StatCard label="Avg. Order" value={fmtBDT(stats.avgOrder)} sub="Per txn"
              icon={Wallet} bgColor="#8B5CF6" iconColor="#fff" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Area Chart — smooth trend */}
            <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Revenue Trend</h3>
              <p className="text-[11px] text-slate-400 font-medium mb-4">
                {rangeOptions.find(r => r.id === timeRange)?.label} — {scopeOptions.find(s => s.id === businessScope)?.label}
              </p>
              {chartData.every(d => d.amount === 0) ? (
                <div className="h-52 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm font-medium">No revenue data for this period</div>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.12)" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                      />
                      <Tooltip
                        cursor={{ stroke: 'rgba(148,163,184,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', padding: '8px 14px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}
                        itemStyle={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 13 }}
                        formatter={(val: any) => [`৳${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Gateway Pie Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <PieIcon size={14} className="text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Gateway Usage</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mb-4">Revenue by payment method</p>
              <PremiumPieChart data={gatewaySplit} />
            </div>
          </div>

          {/* Summary Table */}
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