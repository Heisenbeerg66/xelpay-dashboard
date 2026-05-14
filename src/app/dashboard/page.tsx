'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DollarSign, TrendingUp, TrendingDown, Minus, ArrowRight, FileText, Loader2,
  CheckCircle, Clock, XCircle, AlertCircle, Eye, Receipt,
  LinkIcon, Building2, RefreshCw, User, Phone, Search,
  PanelRightClose, Webhook, X, ChevronLeft, ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
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

interface ChartSlot {
  label: string;
  revenue: number;
  orders: number;
  match: (d: Date) => boolean;
}

type TeamRole = 'admin' | 'developer' | 'support' | 'viewer' | null;

// ─── Config ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const getPieColor = (name: string) => {
  if (name === 'Paid') return '#10b981';
  if (name === 'Pending') return '#f59e0b';
  if (name === 'Failed') return '#ef4444';
  return '#6366f1';
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

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:     { label: 'Admin',     color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  developer: { label: 'Developer', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800' },
  support:   { label: 'Support',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  viewer:    { label: 'Viewer',    color: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-200 dark:border-slate-700' },
};

// ─── Component Helpers ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, textClass, borderClass, trend, trendSuffix = '%' }: { icon: any; label: string; value: string; textClass: string; borderClass: string; trend?: number; trendSuffix?: string }) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  const trendColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400';
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  return (
    <div className={`bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 border-b-[3px] ${borderClass} shadow-sm hover:shadow-md transition-all group flex flex-col h-full justify-between`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className={`${textClass} group-hover:scale-110 transition-transform origin-left`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-tight">{label}</p>
        </div>
        <p className={`text-2xl sm:text-[26px] font-black ${textClass} tracking-tight truncate`} title={value}>{value}</p>
      </div>
      <div className="mt-3 h-[22px] flex items-center">
        {trend !== undefined && (
          <div className={`inline-flex items-center gap-1 text-[10px] font-bold ${trendColor} bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg`}>
            <TrendIcon size={12} strokeWidth={3} />
            <span>{Math.abs(trend).toFixed(1)}{trendSuffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 h-[340px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
        <div className="lg:col-span-2 h-[340px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
    </div>
  );
}

function TransactionDrawer({ order, onClose, onResend }: { order: Order, onClose: () => void, onResend: (id: string) => void }) {
  const badge = statusConfig(order.status);
  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt size={18} className="text-blue-600"/> Order Details
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors shrink-0">
            <X size={16}/>
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}>{badge.label}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Amount</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">৳ {parseFloat(String(order.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
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
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <button onClick={() => onResend(order.id)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-[13px] transition-all shadow-md"><Webhook size={16} /> Resend Webhook</button>
        </div>
      </div>
    </div>
  );
}

function CustomerModal({ trx, onClose }: { trx: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <User size={16} className="text-blue-600" /> Customer Info
          </h3>
        </div>
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

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeLinksCount, setActiveLinksCount] = useState(0);
  const [userName, setUserName] = useState('Merchant');
  // ✅ Team member role tracking
  const [teamRole, setTeamRole] = useState<TeamRole>(null);
  const [isTeamMember, setIsTeamMember] = useState(false);

  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [customerModal, setCustomerModal] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Merchant');
    };
    loadUser();
  }, []);

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
    const load = async () => {
      // ✅ FIX: Current user নিয়ে নিই
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const storedId = localStorage.getItem('active_business_id');

      // ✅ FIX: Business ownership verify করো।
      // localStorage-এ stale বা অন্যের business id থাকতে পারে।
      if (storedId) {
        // এই business কি current user-এর নিজের?
        const { data: ownBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', storedId)
          .eq('merchant_id', user.id)
          .maybeSingle();

        if (ownBiz) {
          // ✅ নিজের business — load করো
          setIsTeamMember(false);
          setTeamRole(null);
          setBusinessId(storedId);
          fetchDashboardData(storedId);
          return;
        }

        // ✅ নিজের business না — team member হিসেবে access আছে কিনা চেক করো
        const { data: membership } = await supabase
          .from('business_team_members')
          .select('business_id, role')
          .eq('business_id', storedId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (membership) {
          // ✅ Team member হিসেবে এই business-এ access আছে
          setIsTeamMember(true);
          setTeamRole(membership.role as TeamRole);
          setBusinessId(storedId);
          fetchDashboardData(storedId);
          return;
        }

        // ❌ না owner না team member — stale id clear করো
        localStorage.removeItem('active_business_id');
      }

      // localStorage-এ কিছু নেই — merchant-এর active_business_id দেখো
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('active_business_id')
        .eq('id', user.id)
        .maybeSingle();

      if (merchantData?.active_business_id) {
        // active_business_id verify করো
        const { data: ownBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', merchantData.active_business_id)
          .eq('merchant_id', user.id)
          .maybeSingle();

        if (ownBiz) {
          localStorage.setItem('active_business_id', ownBiz.id);
          setIsTeamMember(false);
          setTeamRole(null);
          setBusinessId(ownBiz.id);
          fetchDashboardData(ownBiz.id);
          return;
        }

        // Team member হিসেবে এই business-এ আছে কিনা
        const { data: membership } = await supabase
          .from('business_team_members')
          .select('business_id, role')
          .eq('business_id', merchantData.active_business_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (membership) {
          localStorage.setItem('active_business_id', membership.business_id);
          setIsTeamMember(true);
          setTeamRole(membership.role as TeamRole);
          setBusinessId(membership.business_id);
          fetchDashboardData(membership.business_id);
          return;
        }
      }

      // সর্বশেষ চেষ্টা: team_members থেকে যেকোনো একটি business নিয়ে নিই
      const { data: anyMembership } = await supabase
        .from('business_team_members')
        .select('business_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (anyMembership) {
        localStorage.setItem('active_business_id', anyMembership.business_id);
        setIsTeamMember(true);
        setTeamRole(anyMembership.role as TeamRole);
        setBusinessId(anyMembership.business_id);
        fetchDashboardData(anyMembership.business_id);
        return;
      }

      // কোনো business নেই
      setBusinessId(null);
      setLoading(false);
    };

    load();
    window.addEventListener('businessChanged', load);
    return () => window.removeEventListener('businessChanged', load);
  }, []);

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
    const now = new Date();
    let currentStart = new Date(0);
    let prevStart = new Date(0);
    let prevEnd = new Date(0);

    if (dateFilter === 'today') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentStart);
    } else if (dateFilter === '7d') {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEnd = currentStart;
    } else if (dateFilter === '30d') {
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      prevEnd = currentStart;
    }

    const prevOrders = allOrders.filter(o => {
      if (dateFilter === 'all') return false;
      const d = new Date(o.created_at);
      return d >= prevStart && d < prevEnd;
    });

    const calcValues = (ordersList: Order[]) => {
      const paid = ordersList.filter(o => ['paid', 'success', 'completed'].includes(o.status?.toLowerCase()));
      const pending = ordersList.filter(o => o.status?.toLowerCase() === 'pending');
      const rev = paid.reduce((sum, o) => sum + parseFloat(String(o.amount || 0)), 0);
      const rate = ordersList.length > 0 ? (paid.length / ordersList.length) * 100 : 0;
      return { rev, total: ordersList.length, paid: paid.length, pending: pending.length, rate };
    };

    const curr = calcValues(displayOrders);
    const prev = calcValues(prevOrders);
    const getTrend = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;

    return {
      totalRevenue: curr.rev,
      revTrend: dateFilter === 'all' ? undefined : getTrend(curr.rev, prev.rev),
      activeLinks: activeLinksCount,
      successRate: curr.rate,
      rateTrend: dateFilter === 'all' ? undefined : (curr.rate - prev.rate),
      totalOrders: curr.total,
      ordersTrend: dateFilter === 'all' ? undefined : getTrend(curr.total, prev.total),
      pendingOrders: curr.pending,
      pendingTrend: dateFilter === 'all' ? undefined : getTrend(curr.pending, prev.pending),
    };
  }, [displayOrders, allOrders, dateFilter, activeLinksCount]);

  const chartData = useMemo(() => {
    let chartArray: ChartSlot[] = [];
    const now = new Date();

    if (dateFilter === 'today') {
      for (let i = 0; i <= 23; i++) {
        chartArray.push({ label: `${i}:00`, revenue: 0, orders: 0, match: (d: Date) => d.getHours() === i && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() });
      }
    } else if (dateFilter === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        chartArray.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: 0, orders: 0, match: (dt: Date) => dt.toDateString() === d.toDateString() });
      }
    } else if (dateFilter === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        chartArray.push({ label: d.getDate().toString(), revenue: 0, orders: 0, match: (dt: Date) => dt.toDateString() === d.toDateString() });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        chartArray.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, orders: 0, match: (dt: Date) => dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear() });
      }
    }

    displayOrders.forEach(o => {
      const isPaid = ['paid', 'success', 'completed'].includes(o.status?.toLowerCase());
      const d = new Date(o.created_at);
      const slot = chartArray.find(x => x.match(d));
      if (slot && isPaid) {
        slot.orders++;
        slot.revenue += parseFloat(String(o.amount || 0));
      }
    });

    const statusMap: Record<string, { name: string, count: number, amount: number }> = {};
    displayOrders.forEach(o => {
      const key = statusConfig(o.status).label;
      if (!statusMap[key]) statusMap[key] = { name: key, count: 0, amount: 0 };
      statusMap[key].count += 1;
      statusMap[key].amount += parseFloat(String(o.amount || 0));
    });

    const pieArray = Object.values(statusMap).map(d => ({
      ...d,
      value: d.count,
      percent: displayOrders.length > 0 ? (d.count / displayOrders.length) * 100 : 0
    }));

    return { barData: chartArray, pieData: pieArray };
  }, [displayOrders, dateFilter]);

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
    const promise = fetch('/api/resend-webhook', { method: 'POST', body: JSON.stringify({ order_id: id }) }).then(res => { if (!res.ok) throw new Error(); });
    toast.promise(promise, { loading: 'Resending Webhook...', success: 'Webhook sent successfully!', error: 'Failed to send webhook.' });
  };

  const getFilterLabel = () => {
    if (dateFilter === 'today') return 'Today';
    if (dateFilter === '7d') return 'Last 7 Days';
    if (dateFilter === '30d') return 'Last 30 Days';
    return 'All Time';
  };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-bold text-sm">Select a business from the sidebar to view its performance.</p>
      </div>
    );
  }
  
  return (
    <>
      {drawerOrder && <TransactionDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} onResend={resendWebhook} />}
      {customerModal && <CustomerModal trx={customerModal} onClose={() => setCustomerModal(null)} />}

      <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ── Header with Welcome & Role Badge ── */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
              {/* ✅ Team member role badge */}
              {isTeamMember && teamRole && ROLE_LABELS[teamRole] && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${ROLE_LABELS[teamRole].color} ${ROLE_LABELS[teamRole].bg} ${ROLE_LABELS[teamRole].border}`}>
                  <ShieldCheck size={11} strokeWidth={2.5} />
                  {ROLE_LABELS[teamRole].label}
                </span>
              )}
            </div>
            <p className="text-slate-500 font-bold text-sm mt-1">
              Welcome back, <span className="text-slate-700 dark:text-slate-300">{userName}</span>!{' '}
              {isTeamMember ? 'You are viewing this workspace as a team member.' : "Here's your business summary."}
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-[#111827] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto overflow-x-auto scrollbar-hide">
            {[{ id: 'today', label: 'Today' }, { id: '7d', label: '7 Days' }, { id: '30d', label: '30 Days' }, { id: 'all', label: 'All Time' }].map(f => (
              <button key={f.id} onClick={() => setDateFilter(f.id as any)}
                className={`flex-1 xl:flex-none whitespace-nowrap px-5 py-2.5 text-[13px] font-bold rounded-lg transition-all ${dateFilter === f.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? <DashboardSkeleton /> : (
          <>
            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={DollarSign} label="Revenue" textClass="text-blue-600 dark:text-blue-500" borderClass="border-b-blue-600 dark:border-b-blue-500"
                value={`৳ ${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} trend={stats.revTrend} />
              <StatCard icon={LinkIcon} label="Active Pay with Link" textClass="text-purple-600 dark:text-purple-500" borderClass="border-b-purple-600 dark:border-b-purple-500"
                value={String(stats.activeLinks)} />
              <StatCard icon={TrendingUp} label="Success Rate" textClass="text-emerald-600 dark:text-emerald-500" borderClass="border-b-emerald-600 dark:border-b-emerald-500"
                value={`${stats.successRate.toFixed(1)}%`} trend={stats.rateTrend} trendSuffix="%" />
              <StatCard icon={Receipt} label="Total Orders" textClass="text-indigo-600 dark:text-indigo-500" borderClass="border-b-indigo-600 dark:border-b-indigo-500"
                value={String(stats.totalOrders)} trend={stats.ordersTrend} />
              <StatCard icon={Clock} label="Pending" textClass="text-amber-500 dark:text-amber-400" borderClass="border-b-amber-500 dark:border-b-amber-400"
                value={String(stats.pendingOrders)} trend={stats.pendingTrend} />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Revenue Growth — {getFilterLabel()}</h2>
                {chartData.barData.every(d => d.revenue === 0) ? (
                  <div className="flex-1 flex items-center justify-center text-sm font-bold text-slate-400 min-h-[250px]">No revenue data found for this period.</div>
                ) : (
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                        <Tooltip cursor={{ stroke: 'rgba(148,163,184,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ color: '#94a3b8', marginBottom: 4 }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">Order Status</h2>
                {displayOrders.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm font-bold text-slate-400 min-h-[250px]">No orders yet.</div>
                ) : (
                  <div className="flex-1 flex flex-col mt-2">
                    <div className="h-[180px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5} stroke="none" style={{ outline: 'none' }} labelLine={false}>
                            {chartData.pieData.map((entry, i) => <Cell key={i} fill={getPieColor(entry.name)} style={{ outline: 'none' }} />)}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: any, name: any, props: any) => {
                              const data = props?.payload?.payload;
                              return [`${value} Orders (৳${data?.amount?.toLocaleString('en-IN')})`, name];
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-col gap-2.5 overflow-y-auto pr-1">
                      {chartData.pieData.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: getPieColor(entry.name) }}></div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{entry.name}</p>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{entry.count} Orders ({entry.percent.toFixed(1)}%)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">৳ {entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Transactions Table ── */}
            <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> Recent Transactions
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input type="text" placeholder="Search order, trx, name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors w-full sm:w-56"
                    />
                  </div>
                  <Link href="/dashboard/transactions" className="text-[12px] font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
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
                      <tr className="bg-slate-50 dark:bg-[#0B1120]/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
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
                            <td className="px-5 py-4 text-[14px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">{trx.order_no || '—'}</td>
                            <td className="px-5 py-4">
                              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{formatDate(trx.created_at)}</p>
                              <p className="text-[11px] font-medium text-slate-500 mt-1">{formatTime(trx.created_at)}</p>
                            </td>
                            <td className="px-5 py-4">
                              <button onClick={(e) => { e.stopPropagation(); setCustomerModal(trx); }} className="text-[13px] text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors max-w-[140px] truncate">
                                {trx.customer_name || trx.customer_number || '—'}
                              </button>
                            </td>
                            <td className="px-5 py-4 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 max-w-[140px] truncate">{trx.product_name || '—'}</td>
                            <td className="px-5 py-4 text-[13px] font-bold text-slate-900 dark:text-white">৳ {parseFloat(String(trx.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className={`px-5 py-4 text-[12px] font-bold uppercase tracking-wider ${methodColor}`}>{trx.method || '—'}</td>
                            <td className="px-5 py-4">
                              {trx.trx_id ? <span className="text-[14px] font-mono font-bold text-purple-600 dark:text-purple-400">{trx.trx_id}</span> : <span className="text-[13px] text-slate-400 italic font-medium">Awaiting</span>}
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
                  <p className="text-[12px] font-medium text-slate-500">
                    Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredOrders.length}</span>
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
    </>
  );
}