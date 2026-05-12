'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, Loader2, ChevronLeft, ChevronRight, Phone, Mail,
  TrendingUp, ShoppingBag, CheckCircle, Clock, XCircle, Download,
  RefreshCw, Filter, User, ArrowUpDown, Smartphone, Globe, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────
type Customer = {
  customer_name: string | null;
  customer_number: string | null;
  customer_email: string | null;
  totalOrders: number;
  successOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalSpend: number;
  lastOrder: string;
  methods: Set<string>;
};

// ── Helpers ───────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const PAGE_SIZE = 15;

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-indigo-600', 'bg-teal-600',
];
function getAvatarColor(name: string | null) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      ))}
    </div>
  );
}

// ── Customer Detail Panel ─────────────────────────────────────
function CustomerPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const successRate = customer.totalOrders > 0 ? (customer.successOrders / customer.totalOrders) * 100 : 0;
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Customer Details</h3>
        <button onClick={onClose} className="text-xs font-black text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">✕ Close</button>
      </div>

      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-xl ${getAvatarColor(customer.customer_name)}`}>
          {getInitials(customer.customer_name)}
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">{customer.customer_name || 'Anonymous'}</h4>
          {customer.customer_number && <p className="text-sm text-slate-500 flex items-center gap-1"><Phone size={12} /> {customer.customer_number}</p>}
          {customer.customer_email && <p className="text-sm text-slate-500 flex items-center gap-1"><Mail size={12} /> {customer.customer_email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Orders', value: customer.totalOrders, icon: ShoppingBag, color: 'text-blue-600' },
          { label: 'Total Spend', value: fmtBDT(customer.totalSpend), icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Success', value: customer.successOrders, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Pending', value: customer.pendingOrders, icon: Clock, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-3 flex items-center gap-3">
            <s.icon size={16} className={s.color} />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
          <span className="text-xs font-black text-slate-900 dark:text-white">{successRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }} />
        </div>
      </div>

      {customer.methods.size > 0 && (
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Methods Used</p>
          <div className="flex flex-wrap gap-2">
            {[...customer.methods].map(m => (
              <span key={m} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold capitalize">{m}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Order</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtDate(customer.lastOrder)}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<'totalSpend' | 'totalOrders' | 'lastOrder'>('totalSpend');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from('businesses').select('id').eq('merchant_id', user.id).eq('status', 'active').limit(1).maybeSingle();
      if (!biz?.id) { setLoading(false); return; }

      const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, customer_number, customer_email, amount, status, method, created_at')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      // Group by phone/email
      const map = new Map<string, Customer>();
      (orders || []).forEach((o: any) => {
        const key = o.customer_number || o.customer_email || o.customer_name || 'unknown';
        const existing = map.get(key);
        const isSuccess = o.status === 'success' || o.status === 'verified';
        const isPending = o.status === 'pending';
        const isFailed = o.status === 'failed' || o.status === 'cancelled';
        const methods = existing?.methods || new Set<string>();
        if (o.method) methods.add(o.method);
        if (existing) {
          map.set(key, {
            ...existing,
            totalOrders: existing.totalOrders + 1,
            successOrders: existing.successOrders + (isSuccess ? 1 : 0),
            pendingOrders: existing.pendingOrders + (isPending ? 1 : 0),
            failedOrders: existing.failedOrders + (isFailed ? 1 : 0),
            totalSpend: existing.totalSpend + (isSuccess ? (o.amount || 0) : 0),
            lastOrder: o.created_at > existing.lastOrder ? o.created_at : existing.lastOrder,
            methods,
          });
        } else {
          map.set(key, {
            customer_name: o.customer_name,
            customer_number: o.customer_number,
            customer_email: o.customer_email,
            totalOrders: 1,
            successOrders: isSuccess ? 1 : 0,
            pendingOrders: isPending ? 1 : 0,
            failedOrders: isFailed ? 1 : 0,
            totalSpend: isSuccess ? (o.amount || 0) : 0,
            lastOrder: o.created_at,
            methods,
          });
        }
      });
      setCustomers(Array.from(map.values()));
    } catch (e: any) {
      toast.error('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return customers.filter(c =>
      !s || (c.customer_name || '').toLowerCase().includes(s) ||
      (c.customer_number || '').includes(s) ||
      (c.customer_email || '').toLowerCase().includes(s)
    );
  }, [customers, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === 'desc' ? -1 : 1;
      if (sortKey === 'totalSpend') return mult * (a.totalSpend - b.totalSpend);
      if (sortKey === 'totalOrders') return mult * (a.totalOrders - b.totalOrders);
      return mult * (new Date(a.lastOrder).getTime() - new Date(b.lastOrder).getTime());
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Phone', 'Email', 'Total Orders', 'Successful', 'Total Spend', 'Success Rate', 'Last Order'],
      ...sorted.map(c => {
        const rate = c.totalOrders > 0 ? ((c.successOrders / c.totalOrders) * 100).toFixed(1) : '0';
        return [c.customer_name || '', c.customer_number || '', c.customer_email || '', c.totalOrders, c.successOrders, c.totalSpend.toFixed(2), `${rate}%`, fmtDate(c.lastOrder)];
      })
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customers.csv'; a.click();
    toast.success('Exported!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            Customers
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {loading ? '...' : `${customers.length.toLocaleString()} unique customers`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV} disabled={customers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-40">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${selectedCustomer ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Main Table */}
        <div className={selectedCustomer ? 'lg:col-span-2' : ''}>
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select value={`${sortKey}:${sortDir}`} onChange={e => { const [k, d] = e.target.value.split(':'); setSortKey(k as any); setSortDir(d as any); }}
              className="px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none">
              <option value="totalSpend:desc">Highest Spend</option>
              <option value="totalOrders:desc">Most Orders</option>
              <option value="lastOrder:desc">Most Recent</option>
              <option value="totalSpend:asc">Lowest Spend</option>
            </select>
          </div>

          {loading ? <Skeleton /> : (
            <>
              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Users size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">No Customers Found</h3>
                  <p className="text-slate-500 mt-1 text-sm font-medium">{search ? 'Try a different search.' : 'Customers appear after orders are placed.'}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]">
                          <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                          <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                          <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('totalOrders')}>
                            Orders <ArrowUpDown size={10} className="inline ml-0.5" />
                          </th>
                          <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('totalSpend')}>
                            Total Spend <ArrowUpDown size={10} className="inline ml-0.5" />
                          </th>
                          <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Success %</th>
                          <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('lastOrder')}>
                            Last Order <ArrowUpDown size={10} className="inline ml-0.5" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginated.map((c, i) => {
                          const rate = c.totalOrders > 0 ? (c.successOrders / c.totalOrders) * 100 : 0;
                          const isSelected = selectedCustomer === c;
                          return (
                            <tr key={i} onClick={() => setSelectedCustomer(isSelected ? null : c)}
                              className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black ${getAvatarColor(c.customer_name)}`}>
                                    {getInitials(c.customer_name)}
                                  </div>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.customer_name || <span className="text-slate-400 italic">Anonymous</span>}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-xs text-slate-600 dark:text-slate-400">{c.customer_number || '—'}</p>
                                <p className="text-xs text-slate-400 truncate max-w-[160px]">{c.customer_email || ''}</p>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-black text-slate-900 dark:text-white">{c.totalOrders}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fmtBDT(c.totalSpend)}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className={`text-sm font-black ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{rate.toFixed(0)}%</span>
                              </td>
                              <td className="px-5 py-4 text-right text-xs text-slate-500">{fmtDate(c.lastOrder)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {paginated.map((c, i) => {
                      const rate = c.totalOrders > 0 ? (c.successOrders / c.totalOrders) * 100 : 0;
                      return (
                        <button key={i} onClick={() => setSelectedCustomer(selectedCustomer === c ? null : c)}
                          className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black ${getAvatarColor(c.customer_name)}`}>
                              {getInitials(c.customer_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.customer_name || 'Anonymous'}</p>
                              <p className="text-xs text-slate-500">{c.customer_number || c.customer_email || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-600">{fmtBDT(c.totalSpend)}</p>
                              <p className="text-[10px] text-slate-400">{c.totalOrders} orders</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <ChevronLeft size={15} />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-[13px] font-bold rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              {page}
                            </button>
                          );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Customer Detail Panel */}
        {selectedCustomer && (
          <div className="lg:col-span-1">
            <CustomerPanel customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
          </div>
        )}
      </div>
    </div>
  );
}