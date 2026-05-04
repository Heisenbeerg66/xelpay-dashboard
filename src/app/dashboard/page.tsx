'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DollarSign, TrendingUp, ArrowRight, FileText, Loader2,
  CheckCircle, Clock, XCircle, AlertCircle, Eye, Receipt,
  LinkIcon, Building2, RefreshCw, User, Phone, Search,
  PanelRightClose, Webhook, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
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
  product_name: string | null;
  source: string | null;
  created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// Specific Colors for Status
const getPieColor = (name: string) => {
  if (name === 'Paid') return '#10b981'; // Emerald 500 (Green)
  if (name === 'Pending') return '#f59e0b'; // Amber 500 (Yellow/Orange)
  if (name === 'Failed') return '#ef4444'; // Red 500
  return '#6366f1'; // Indigo 500 (Default)
};

const statusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (['paid', 'success', 'completed'].includes(s)) return { label: 'Paid', icon: CheckCircle, cls: 'text-emerald-600 dark:text-emerald-400 font-bold', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' };
  if (s === 'pending') return { label: 'Pending', icon: Clock, cls: 'text-amber-500 dark:text-amber-400 font-bold', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' };
  if (['failed', 'rejected', 'cancelled'].includes(s)) return { label: 'Failed', icon: XCircle, cls: 'text-red-500 dark:text-red-400 font-bold', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
  return { label: status || 'Unknown', icon: AlertCircle, cls: 'text-slate-400 font-bold', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' };
};

const getMethodTextColor = (method: string | null) => {
  const m = (method || '').toLowerCase();
  if (m.includes('bkash')) return 'text-pink-600 dark:text-pink-400';
  if (m.includes('nagad')) return 'text-orange-600 dark:text-orange-400';
  if (m.includes('rocket')) return 'text-purple-600 dark:text-purple-400';
  if (m.includes('upay')) return 'text-blue-600 dark:text-blue-400';
  return 'text-slate-600 dark:text-slate-400';
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// ─── Component Helpers ────────────────────────────────────────────────────────
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-[260px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
        <div className="h-[260px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
    </div>
  );
}

// ─── Transaction Drawer ───────────────────────────────────────────────────────
function TransactionDrawer({ order, onClose, onResend }: { order: Order, onClose: () => void, onResend: (id: string) => void }) {
  const badge = statusConfig(order.status);
  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"><Receipt size={18} className="text-blue-600"/> Order Details</h2>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition"><X size={16}/></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800">
            <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p><span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${badge.bg}`}>{badge.label}</span></div>
            <div className="text-right"><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Amount</p><h3 className="text-xl font-black text-slate-900 dark:text-white">৳ {parseFloat(String(order.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3></div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Information</h4>
            {[
              ['Order No', order.order_no, 'font-mono text-indigo-600 dark:text-indigo-400'],
              ['Date & Time', `${formatDate(order.created_at)} - ${formatTime(order.created_at)}`],
              ['Customer', order.customer_name || '—'],
              ['Phone', order.customer_number || '—'],
              ['Email', order.customer_email || '—'],
              ['Product', order.product_name || '—', 'text-emerald-600 dark:text-emerald-400'],
              ['Payment Method', order.method || '—', `uppercase ${getMethodTextColor(order.method)}`],
              ['TRX ID', order.trx_id || '—', 'font-mono text-purple-600 dark:text-purple-400'],
              ['Source', order.source || 'link', 'capitalize'],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-[12px] font-bold text-slate-500">{label}</span>
                <span className={`text-[13px] font-black text-right max-w-[60%] ${cls || 'text-slate-900 dark:text-white'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={() => onResend(order.id)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-[13px] transition-all shadow-md"><Webhook size={16} /> Resend Webhook</button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Modal ───────────────────────────────────────────────────────────
function CustomerModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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
              <span className="font-bold text-slate-900 dark:text-white text-right truncate max-w-[160px]">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">Close</button>
      </div>
    </div>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeLinksCount, setActiveLinksCount] = useState(0);
  const [userName, setUserName] = useState('Merchant');
  
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  // Fetch Username
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Merchant');
    };
    loadUser();
  }, []);

  // Realtime Setup
  useEffect(() => {
    if (!businessId) return;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const channel = supabase.channel('dashboard-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `business_id=eq.${businessId}` }, (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setAllOrders(prev => [payload.new as Order, ...prev]);
            toast.success('New Order Received!');
          } else if (payload.eventType === 'UPDATE') {
            setAllOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
          } else if (payload.eventType === 'DELETE') {
            setAllOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    };
    setupRealtime();
  }, [businessId]);

  const fetchDashboardData = async (bizId: string) => {
    try {
      setLoading(true);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;

      const { count: linksCount } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('status', 'active');
      
      setActiveLinksCount(linksCount || 0);
      setAllOrders((orders as Order[]) || []);
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

  // Filtering by Date for Stat Cards & Pie Chart
  const displayOrders = useMemo(() => {
    const now = new Date();
    return allOrders.filter(o => {
      if (dateFilter === 'all') return true;
      const d = new Date(o.created_at);
      if (dateFilter === 'today') return d.toDateString() === now.toDateString();
      if (dateFilter === '7d') return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === '30d') return (now.getTime() - d.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [allOrders, dateFilter]);

  const stats = useMemo(() => {
    const paidOrders = displayOrders.filter((o: any) => ['paid', 'success', 'completed'].includes(o.status?.toLowerCase()));
    const pendingOrders = displayOrders.filter((o: any) => o.status?.toLowerCase() === 'pending');
    const totalRev = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || '0'), 0);
    const rate = displayOrders.length > 0 ? (paidOrders.length / displayOrders.length) * 100 : 0;
    return {
      totalRevenue: totalRev,
      activeLinks: activeLinksCount,
      successRate: rate,
      totalOrders: displayOrders.length,
      pendingOrders: pendingOrders.length,
    };
  }, [displayOrders, activeLinksCount]);

  const chartData = useMemo(() => {
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), fullDate: d.toDateString(), revenue: 0, orders: 0 };
    });
    // Line Chart always shows last 7 days for consistency
    allOrders.forEach(o => {
      const isPaid = ['paid', 'success', 'completed'].includes(o.status?.toLowerCase());
      const d = new Date(o.created_at).toDateString();
      const slot = last7.find(x => x.fullDate === d);
      if (slot && isPaid) { slot.orders++; slot.revenue += parseFloat(String(o.amount || 0)); }
    });

    const statusMap: Record<string, number> = {};
    displayOrders.forEach(o => {
      const key = statusConfig(o.status).label;
      statusMap[key] = (statusMap[key] || 0) + 1;
    });

    return { last7, pieData: Object.entries(statusMap).map(([name, value]) => ({ name, value })) };
  }, [allOrders, displayOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return displayOrders;
    const q = searchTerm.toLowerCase();
    return displayOrders.filter(o =>
      (o.trx_id && o.trx_id.toLowerCase().includes(q)) ||
      (o.order_no && o.order_no.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q))
    );
  }, [displayOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, dateFilter]);

  const resendWebhook = async (id: string) => {
    const promise = fetch('/api/resend-webhook', { method: 'POST', body: JSON.stringify({ order_id: id }) }).then(res => { if(!res.ok) throw new Error(); });
    toast.promise(promise, { loading: 'Resending Webhook...', success: 'Webhook sent successfully!', error: 'Failed to send webhook.' });
  };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-bold text-sm">Select a business from the sidebar to view its performance.</p>
      </div>
    );
  }
    return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {drawerOrder && <TransactionDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} onResend={resendWebhook} />}
      {customerModal && <CustomerModal trx={customerModal} onClose={() => setCustomerModal(null)} />}

      {/* ── Header with Welcome & Quick Filters ── */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Welcome back, <span className="text-slate-700 dark:text-slate-300">{userName}</span>! Here's your business summary.</p>
        </div>
        
        <div className="flex bg-white dark:bg-[#111827] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto overflow-x-auto scrollbar-hide">
          {[ { id: 'today', label: 'Today' }, { id: '7d', label: '7 Days' }, { id: '30d', label: '30 Days' }, { id: 'all', label: 'All Time' } ].map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id as any)}
              className={`flex-1 xl:flex-none whitespace-nowrap px-5 py-2.5 text-[13px] font-black rounded-lg transition-all ${dateFilter === f.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={DollarSign} label="Revenue" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
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

          {/* ── Charts (Area & Pie) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Revenue — Last 7 Days</h2>
              {chartData.last7.every(d => d.revenue === 0) ? (
                <div className="h-48 flex items-center justify-center text-sm font-bold text-slate-400">No revenue data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData.last7} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ color: '#94a3b8', marginBottom: 4 }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} style={{ outline: 'none' }}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Perfect Pie Chart */}
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Order Status</h2>
              {displayOrders.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm font-bold text-slate-400">No orders yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                                        <Pie 
                      data={chartData.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5} stroke="none" style={{ outline: 'none' }} labelLine={false}
                      // এখানে : any এবং ডিফল্ট = 0 ব্যবহার করে টাইপস্ক্রিপ্ট এরর ফিক্স করা হয়েছে
                      label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: any) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        if (percent < 0.05) return null;
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {chartData.pieData.map((entry, i) => <Cell key={i} fill={getPieColor(entry.name)} style={{ outline: 'none' }} />)}
                    </Pie>

                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} cursor={{ fill: 'transparent' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: '600', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Recent Transactions Table ── */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Recent Transactions
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input type="text" placeholder="Search order, trx, name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors w-full sm:w-56"
                  />
                </div>
                <Link href="/dashboard/transactions" className="text-[12px] font-black text-blue-600 flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
                  View All <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {paginatedOrders.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-[13px] font-bold">
                {searchTerm ? 'No transactions match your search.' : 'No recent transactions to display.'}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0B1120]/60 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-5 py-4">Order No</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Method</th>
                      <th className="px-5 py-4">TRX ID</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {paginatedOrders.map(trx => {
                      const badge = statusConfig(trx.status);
                      const methodColor = getMethodTextColor(trx.method);
                      return (
                        <tr key={trx.id} onClick={() => setDrawerOrder(trx)} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
                          <td className="px-5 py-4 text-[13px] font-mono font-black text-indigo-600 dark:text-indigo-400">{trx.order_no || '—'}</td>
                          <td className="px-5 py-4">
                            <p className="text-[13px] font-black text-slate-800 dark:text-slate-200">{formatDate(trx.created_at)}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1">{formatTime(trx.created_at)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={(e) => { e.stopPropagation(); setCustomerModal(trx); }} className="text-[13px] text-blue-600 dark:text-blue-400 font-black hover:underline transition-colors max-w-[140px] truncate">
                              {trx.customer_name || trx.customer_number || '—'}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-black text-emerald-600 dark:text-emerald-400 max-w-[140px] truncate">{trx.product_name || '—'}</td>
                          <td className="px-5 py-4 text-[13px] font-black text-slate-900 dark:text-white">৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className={`px-5 py-4 text-[12px] font-black uppercase tracking-wider ${methodColor}`}>{trx.method || '—'}</td>
                          <td className="px-5 py-4">
                            {trx.trx_id ? <span className="text-[13px] font-mono font-black text-purple-600 dark:text-purple-400">{trx.trx_id}</span> : <span className="text-[13px] text-slate-400 italic font-bold">Awaiting</span>}
                          </td>
                          <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-[12px] uppercase tracking-wider ${badge.cls}`}>{badge.label}</span></td>
                          <td className="px-5 py-4 text-right"><button className="p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all"><PanelRightClose size={16} /></button></td>
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
                <p className="text-[12px] font-bold text-slate-500">
                  Showing <span className="font-black text-slate-800 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of <span className="font-black text-slate-800 dark:text-slate-200">{filteredOrders.length}</span>
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
        </>
      )}
    </div>
  );
}
