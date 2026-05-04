'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DollarSign, TrendingUp, ArrowRight, FileText, Loader2,
  CheckCircle, Clock, XCircle, AlertCircle, Eye, Receipt,
  LinkIcon, Building2, RefreshCw, User, Phone
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Search } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  customer_number: string;
  customer_email: string;
  amount: number;
  currency: string;
  method: string;
  trx_id: string | null;
  status: string;
  product_name: string;
  source: string;
  created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const statusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'success':
    case 'completed': return { label: 'Paid', icon: CheckCircle, cls: 'text-emerald-600 dark:text-emerald-400 font-semibold' };
    case 'pending': return { label: 'Pending', icon: Clock, cls: 'text-amber-500 dark:text-amber-400 font-semibold' };
    case 'failed':
    case 'cancelled': return { label: 'Failed', icon: XCircle, cls: 'text-red-500 dark:text-red-400 font-semibold' };
    default: return { label: status || 'Unknown', icon: AlertCircle, cls: 'text-slate-400 font-semibold' };
  }
};

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{value}</p>
    </div>
  );
}

// ─── TRX Modal ────────────────────────────────────────────────────────────────
function TrxModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  const badge = statusConfig(trx.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Receipt size={16} className="text-blue-600" /> Transaction Detail
        </h3>
        <div className="space-y-3 text-xs">
          {[
            ['Order No', trx.order_no],
            ['TRX ID', trx.trx_id || '—'],
            ['Customer', trx.customer_name],
            ['Phone', trx.customer_number],
            ['Product', trx.product_name],
            ['Method', trx.method],
            ['Amount', `৳ ${parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
            ['Status', badge.label],
            ['Date', formatDate(trx.created_at)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-400 font-medium">{k}</span>
              <span className={`font-semibold text-right ${k === 'Status' ? badge.cls : 'text-slate-900 dark:text-white'}`}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Close</button>
      </div>
    </div>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────
function CustomerModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
        <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> Customer Info
        </h3>
        <div className="space-y-3 text-xs">
          {[
            ['Name', trx.customer_name || '—'],
            ['Phone', trx.customer_number || '—'],
            ['Email', trx.customer_email || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-400 font-medium">{k}</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right truncate max-w-[160px]">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Close</button>
      </div>
    </div>
  );
}

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

  const [trxModal, setTrxModal] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboardData = async (bizId: string) => {
    try {
      setLoading(true);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_no, customer_name, customer_number, customer_email, amount, currency, method, trx_id, status, product_name, source, created_at')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { count: linksCount } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'active');

      if (orders) {
        const paidOrders = orders.filter((o: any) => ['paid', 'success', 'completed'].includes(o.status));
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

  const chartData = useMemo(() => {
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), fullDate: d.toDateString(), revenue: 0, orders: 0 };
    });
    allOrders.forEach(o => {
      const isPaid = ['paid', 'success', 'completed'].includes(o.status);
      const d = new Date(o.created_at).toDateString();
      const slot = last7.find(x => x.fullDate === d);
      if (slot) { slot.orders++; if (isPaid) slot.revenue += parseFloat(String(o.amount || 0)); }
    });
    const statusMap: Record<string, number> = {};
    allOrders.forEach(o => {
      const key = statusConfig(o.status).label;
      statusMap[key] = (statusMap[key] || 0) + 1;
    });
    return { last7, pieData: Object.entries(statusMap).map(([name, value]) => ({ name, value })) };
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return allOrders;
    const q = searchTerm.toLowerCase();
    return allOrders.filter(o =>
      (o.trx_id && o.trx_id.toLowerCase().includes(q)) ||
      (o.order_no && o.order_no.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q))
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
      {trxModal && <TrxModal trx={trxModal} onClose={() => setTrxModal(null)} />}
      {customerModal && <CustomerModal trx={customerModal} onClose={() => setCustomerModal(null)} />}

      {/* ── Header — overview only, no subtitle ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={DollarSign} label="Total Revenue" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
              value={`৳ ${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
            <StatCard icon={LinkIcon} label="Active Links" color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
              value={String(stats.activeLinks)} />
            <StatCard icon={TrendingUp} label="Success Rate" color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
              value={`${stats.successRate.toFixed(1)}%`} />
            <StatCard icon={Receipt} label="Total Orders" color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
              value={String(stats.totalOrders)} />
            <StatCard icon={Clock} label="Pending" color="bg-rose-50 dark:bg-rose-900/20 text-rose-600"
              value={String(stats.pendingOrders)} />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue Line */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Revenue — Last 7 Days</h2>
              {chartData.last7.every(d => d.revenue === 0) ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">No revenue data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData.last7} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, fontSize: 12, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie */}
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Order Status</h2>
              {allOrders.length === 0 ? (
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input
                    type="text"
                    placeholder="Search order, trx, name..."
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
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0B1120]/60 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {/* Column order matches Transactions page exactly */}
                      <th className="px-5 py-3">Order No</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">TRX ID</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {paginatedOrders.map(trx => {
                      const badge = statusConfig(trx.status);
                      return (
                        <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">

                          {/* Order No */}
                          <td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {trx.order_no || '—'}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {formatDate(trx.created_at)}
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setCustomerModal(trx)}
                              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Phone size={11} className="text-slate-400" />
                              {trx.customer_name || trx.customer_number || '—'}
                            </button>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                            {trx.product_name || '—'}
                          </td>

                          {/* Source */}
                          <td className="px-5 py-3.5 text-xs text-slate-400 capitalize">
                            {trx.source || 'link'}
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white">
                            ৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Method */}
                          <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                            {trx.method || '—'}
                          </td>

                          {/* TRX ID */}
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setTrxModal(trx)}
                              className="flex items-center gap-1 group"
                            >
                              {trx.trx_id
                                ? <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{trx.trx_id}</span>
                                : <span className="text-xs text-slate-400 italic">Awaiting</span>}
                              <Eye size={11} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                          </td>

                          {/* Status */}
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
            {!loading && filteredOrders.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-medium text-slate-700 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of <span className="font-medium text-slate-700 dark:text-slate-200">{filteredOrders.length}</span>
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
                          className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}