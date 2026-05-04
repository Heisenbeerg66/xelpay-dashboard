'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, Link as LinkIcon, Activity, Wallet, FileText,
  ArrowRight, Loader2, Building2, Eye, X, ShoppingCart,
  TrendingUp, Package, CreditCard, Hash, User, Search,
  ChevronLeft, ChevronRight, BarChart2, PieChart as PieChartIcon,
  CheckCircle2, Clock, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ─── Recharts (bundled with most Next.js projects; add if missing: npm i recharts) ───
import {
  ResponsiveContainer,
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type Order = {
  id: string;
  order_no: string;
  customer_name: string | null;
  customer_number: string | null;
  customer_email: string | null;
  amount: number;
  currency: string;
  method: string | null;
  trx_id: string | null;
  status: string;
  product_name: string | null;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const statusConfig = (s: string) => {
  switch (s?.toLowerCase()) {
    case 'paid': case 'success': case 'completed':
      return { cls: 'text-emerald-600 dark:text-emerald-400 font-semibold', label: 'Success' };
    case 'pending':
      return { cls: 'text-amber-600 dark:text-amber-400 font-semibold', label: 'Pending' };
    case 'rejected': case 'failed':
      return { cls: 'text-red-500 dark:text-red-400 font-semibold', label: 'Rejected' };
    case 'cancel': case 'cancelled':
      return { cls: 'text-rose-500 dark:text-rose-400 font-semibold', label: 'Cancelled' };
    default:
      return { cls: 'text-slate-400 font-medium', label: s || 'Unknown' };
  }
};

const PAGE_SIZE = 5;

// ─── Trx Detail Modal ─────────────────────────────────────────────────────────
function TrxModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  const badge = statusConfig(trx.status);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Transaction Detail</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{trx.trx_id || 'Awaiting'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Order ID', value: trx.order_no, color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Trx ID', value: trx.trx_id || '—', color: 'text-blue-600 dark:text-blue-400 font-mono' },
            { label: 'Product', value: trx.product_name || '—', color: 'text-teal-600 dark:text-teal-400' },
            { label: 'Amount', value: `৳ ${parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
            { label: 'Method', value: trx.method || '—', color: 'text-slate-700 dark:text-slate-300' },
            { label: 'Date', value: formatDate(trx.created_at), color: 'text-slate-600 dark:text-slate-300' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{r.label}</span>
              <span className={`text-sm ${r.color}`}>{r.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
            <span className={`text-sm ${badge.cls}`}>{badge.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────
function CustomerModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Customer Info</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Name', value: trx.customer_name || '—' },
            { label: 'Email', value: trx.customer_email || '—' },
            { label: 'Phone', value: trx.customer_number || '—' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{r.label}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pie Chart Colors ─────────────────────────────────────────────────────────
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeLinks: 0,
    successRate: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  // Modals
  const [trxModal, setTrxModal] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null);

  // Table
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboardData = async (bizId: string) => {
    try {
      setLoading(true);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_no, customer_name, customer_number, customer_email, amount, currency, method, trx_id, status, product_name, created_at')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { count: linksCount } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'active');

      if (orders) {
        const paidOrders = orders.filter((o: any) =>
          o.status === 'paid' || o.status === 'success' || o.status === 'completed');
        const pendingOrders = orders.filter((o: any) => o.status === 'pending');
        const totalRev = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || '0'), 0);
        const rate = orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0;

        setAllOrders(orders as Order[]);
        setStats({
          totalRevenue: totalRev,
          activeLinks: linksCount || 0,
          successRate: rate,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
        });
      }
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = () => {
      const id = localStorage.getItem('active_business_id');
      if (id) { setBusinessId(id); fetchDashboardData(id); }
      else setLoading(false);
    };
    load();
    window.addEventListener('businessChanged', load);
    return () => window.removeEventListener('businessChanged', load);
  }, []);

  // ─── Derived analytics data ───────────────────────────────────────────────
  const chartData = useMemo(() => {
    // Last 7 days revenue line chart
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toDateString(),
        revenue: 0,
        orders: 0,
      };
    });
    allOrders.forEach((o) => {
      const isPaid = o.status === 'paid' || o.status === 'success' || o.status === 'completed';
      const d = new Date(o.created_at).toDateString();
      const slot = last7.find(x => x.fullDate === d);
      if (slot) {
        slot.orders++;
        if (isPaid) slot.revenue += parseFloat(String(o.amount || 0));
      }
    });

    // Status distribution pie
    const statusMap: Record<string, number> = {};
    allOrders.forEach(o => {
      const key = statusConfig(o.status).label;
      statusMap[key] = (statusMap[key] || 0) + 1;
    });
    const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    return { last7, pieData };
  }, [allOrders]);

  // ─── Filtered + paginated table ───────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return allOrders;
    const q = searchTerm.toLowerCase();
    return allOrders.filter(o =>
      (o.trx_id && o.trx_id.toLowerCase().includes(q)) ||
      (o.order_no && o.order_no.toLowerCase().includes(q))
    );
  }, [allOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium text-sm">Select a business from the sidebar to view its performance.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Modals */}
      {trxModal && <TrxModal trx={trxModal} onClose={() => setTrxModal(null)} />}
      {customerModal && <CustomerModal trx={customerModal} onClose={() => setCustomerModal(null)} />}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Track your payments, links, and business growth dynamically.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* ── Stats Cards (5 cards) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

            {/* Total Revenue */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <DollarSign size={18} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                ৳ {stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Active Links */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <LinkIcon size={18} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Links</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{stats.activeLinks}</p>
            </div>

            {/* Success Rate */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Success Rate</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {stats.successRate.toFixed(1)}<span className="text-sm text-slate-400">%</span>
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShoppingCart size={18} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{stats.totalOrders}</p>
            </div>

            {/* Pending Orders */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending Orders</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{stats.pendingOrders}</p>
            </div>
          </div>

          {/* ── Analytics Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Revenue Line/Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Revenue — Last 7 Days</h3>
              </div>
              {chartData.last7.every(d => d.revenue === 0) ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">No revenue data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--tooltip-bg, #1e293b)', border: 'none', borderRadius: 10, fontSize: 12, color: '#f1f5f9' }}
                      formatter={(v: any) => [`৳ ${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Pie Chart */}
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon size={16} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Order Status</h3>
              </div>
              {chartData.pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">No orders yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={chartData.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" paddingAngle={3}>
                      {chartData.pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, fontSize: 12, color: '#f1f5f9' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Recent Transactions Table ── */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

            {/* Table header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Recent Transactions
              </h2>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input
                    type="text"
                    placeholder="Search Trx ID or Order ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-white outline-none focus:border-blue-500 transition-colors w-52"
                  />
                </div>
                <Link href="/dashboard/transactions"
                  className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
                  View All <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {paginatedOrders.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">
                {searchTerm ? 'No transactions match your search.' : 'No recent transactions to display.'}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[780px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0B1120]/60 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Trx ID</th>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {paginatedOrders.map((trx) => {
                      const badge = statusConfig(trx.status);
                      return (
                        <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">

                          {/* Date */}
                          <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {formatDate(trx.created_at)}
                          </td>

                          {/* Trx ID + eye */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                {trx.trx_id || '—'}
                              </span>
                              {trx.trx_id && (
                                <button onClick={() => setTrxModal(trx)}
                                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                  <Eye size={12} />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Order ID */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                              {trx.order_no || '—'}
                            </span>
                          </td>

                          {/* Customer + eye */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                {trx.customer_name || 'Anonymous'}
                              </span>
                              <button onClick={() => setCustomerModal(trx)}
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                <Eye size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                              {trx.product_name || '—'}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                              ৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wide">
                              {trx.method || 'Auto'}
                            </span>
                          </td>

                          {/* Status — text-only, no bg */}
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
            {filteredOrders.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Showing{' '}
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
                  </span>{' '}
                  of <span className="text-slate-700 dark:text-slate-200 font-medium">{filteredOrders.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = totalPages <= 5 ? i + 1
                      : currentPage <= 3 ? i + 1
                      : currentPage >= totalPages - 2 ? totalPages - 4 + i
                      : currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}