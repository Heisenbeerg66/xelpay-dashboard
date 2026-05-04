'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Link as LinkIcon, Activity, Wallet, FileText, ArrowRight,
  Loader2, Building2, Eye, X, Smartphone, CreditCard, TrendingUp, Clock,
  Check, User, Mail, Phone, Search, ShoppingBag, Clock3
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── SMS Modal ────────────────────────────────────────────────────────────────
function SmsModal({ trxId, onClose }: { trxId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: sms, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('trx_id', trxId)
        .single();
      if (error || !sms) setError('No SMS record found for this transaction.');
      else setData(sms);
      setLoading(false);
    };
    fetch();
  }, [trxId]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <Eye size={14} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">SMS Verification</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{trxId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={22} />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText size={16} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{error}</p>
              <p className="text-xs text-slate-400 mt-1">The sender may have used a manual entry.</p>
            </div>
          ) : data ? (
            <div className="space-y-2.5">
              {[
                { icon: Smartphone, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500', label: 'Sender', value: data.sender },
                { icon: CreditCard, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500', label: 'Method', value: data.method },
                { icon: TrendingUp, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500', label: 'Amount', value: `৳${Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 dark:text-emerald-400 font-bold' },
                { icon: Clock, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500', label: 'Received', value: new Date(data.received_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              ].map(({ icon: Icon, iconBg, iconColor, label, value, valueClass }) => (
                <div key={label} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon size={12} className={iconColor} />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                  </div>
                  <p className={`text-sm font-semibold font-mono text-slate-900 dark:text-white ${valueClass || ''}`}>{value}</p>
                </div>
              ))}
              <div className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest ${data.is_used ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                {data.is_used ? <><Check size={10} /> Verified & Used</> : <><Clock size={10} /> Not Yet Used</>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }: { customer: { name: string; email?: string; phone?: string }; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] w-full max-w-xs rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <User size={14} className="text-slate-600 dark:text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Customer Details</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            { icon: User, label: 'Name', value: customer.name || 'Anonymous' },
            { icon: Mail, label: 'Email', value: customer.email || '—' },
            { icon: Phone, label: 'Phone', value: customer.phone || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Icon size={12} className="text-slate-500" />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === 'paid' || s === 'success' || s === 'completed')
    return <span className="text-emerald-500 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wide">Paid</span>;
  if (s === 'pending')
    return <span className="text-amber-500 dark:text-amber-400 font-semibold text-xs uppercase tracking-wide">Pending</span>;
  return <span className="text-red-500 dark:text-red-400 font-semibold text-xs uppercase tracking-wide">Failed</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalRevenue: 0, activeLinks: 0, successRate: 0, totalOrders: 0, pendingOrders: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [smsTrxId, setSmsTrxId] = useState<string | null>(null);
  const [customerModal, setCustomerModal] = useState<{ name: string; email?: string; phone?: string } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  const fetchDashboardData = async (bizId: string) => {
    try {
      setLoading(true);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, status, created_at, order_no, customer_name, customer_number, customer_email, method, trx_id, product_name')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { count: linksCount } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'active');

      if (orders) {
        const paidOrders = orders.filter((o: any) => ['paid', 'success', 'completed'].includes(o.status?.toLowerCase()));
        const pendingOrders = orders.filter((o: any) => o.status?.toLowerCase() === 'pending');
        const totalRev = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || '0'), 0);
        const rate = orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0;

        setStats({
          totalRevenue: totalRev,
          activeLinks: linksCount || 0,
          successRate: rate,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
        });

        setRecentTransactions(orders.slice(0, 5));

        // Line chart: last 7 days revenue
        const now = new Date();
        const last7: { date: string; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const dayRev = paidOrders
            .filter((o: any) => new Date(o.created_at).toDateString() === d.toDateString())
            .reduce((s: number, o: any) => s + parseFloat(o.amount || '0'), 0);
          last7.push({ date: label, revenue: dayRev });
        }
        setChartData(last7);

        // Pie chart: status distribution
        const statusCount: Record<string, number> = {};
        orders.forEach((o: any) => {
          const s = ['paid', 'success', 'completed'].includes(o.status?.toLowerCase()) ? 'Paid' :
            o.status?.toLowerCase() === 'pending' ? 'Pending' : 'Failed';
          statusCount[s] = (statusCount[s] || 0) + 1;
        });
        setPieData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
      }
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) { setBusinessId(activeId); fetchDashboardData(activeId); }
      else setLoading(false);
    };
    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  const filtered = recentTransactions.filter(t => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (t.trx_id?.toLowerCase().includes(s) || t.order_no?.toLowerCase().includes(s));
  });

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar to view its performance.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `৳ ${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      label: 'Active Links',
      value: stats.activeLinks,
      icon: LinkIcon,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: Activity,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: Wallet,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock3,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Modals */}
      {smsTrxId && <SmsModal trxId={smsTrxId} onClose={() => setSmsTrxId(null)} />}
      {customerModal && <CustomerModal customer={customerModal} onClose={() => setCustomerModal(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Track your payments, links, and business performance.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-slate-400" size={36} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                    <Icon size={16} className={card.iconColor} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">Revenue — Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg, #fff)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                    formatter={(v: any) => [`৳${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#64748b" strokeWidth={2} dot={{ r: 3, fill: '#64748b', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">Order Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--color-bg, #fff)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Recent Transactions
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search TRX ID or Order..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors w-48"
                  />
                </div>
                <Link href="/dashboard/transactions" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">No transactions to display.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0B1120] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">TRX ID</th>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Method</th>
                      <th className="px-5 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filtered.slice(0, 5).map((trx, index) => (
                      <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {new Date(trx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400">{new Date(trx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-5 py-4">
                          {trx.trx_id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">#{trx.trx_id}</span>
                              <button
                                onClick={() => setSmsTrxId(trx.trx_id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Awaiting</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{trx.order_no || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag size={11} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">{trx.product_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{trx.customer_name || 'Anonymous'}</span>
                            <button
                              onClick={() => setCustomerModal({ name: trx.customer_name, email: trx.customer_email, phone: trx.customer_number })}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-slate-900 dark:text-white">৳{parseFloat(trx.amount).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-wider">{trx.method || 'Auto'}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <StatusDot status={trx.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}