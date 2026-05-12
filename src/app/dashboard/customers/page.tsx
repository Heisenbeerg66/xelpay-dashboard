'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Users, RefreshCw, Download, Building2, Search, Loader2,
  Phone, Mail, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown,
  TrendingUp, DollarSign, Receipt
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Customer = {
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  successOrders: number;
  lastOrderAt: string;
  methods: string[];
  businessIds: Set<string>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtBDT = (n: number) => `৳${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isPaid = (s: string) => ['paid', 'success', 'completed'].includes((s || '').toLowerCase());
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const PAGE_SIZE = 20;

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const cur = options.find(o => o.id === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white shadow-sm hover:border-blue-400 transition-all">
        {cur?.label} <ChevronDown size={14} />
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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = (name || 'UK').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center shrink-0`}>
      <span className="text-white text-xs font-black">{initials}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [allBusinessIds, setAllBusinessIds] = useState<string[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [businessScope, setBusinessScope] = useState<'this' | 'all'>('this');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'totalSpend' | 'totalOrders' | 'lastOrderAt'>('totalSpend');
  const [currentPage, setCurrentPage] = useState(1);

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

  const fetchOrders = async () => {
    if (!businessId && businessScope === 'this') { setLoading(false); return; }
    setLoading(true);
    try {
      let query = supabase.from('orders')
        .select('id, customer_name, customer_number, customer_email, amount, status, method, created_at, business_id')
        .not('customer_name', 'is', null);

      if (businessScope === 'this' && businessId) {
        query = query.eq('business_id', businessId);
      } else if (businessScope === 'all') {
        query = query.in('business_id', allBusinessIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setRawOrders(data || []);
    } catch {
      toast.error('Failed to load customer data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [businessScope, businessId, allBusinessIds]);

  // ─── Aggregate customers from orders ─────────────────────────────────────
  const customers = useMemo<Customer[]>(() => {
    const map: Record<string, Customer> = {};
    rawOrders.forEach(o => {
      const phone = (o.customer_number || '').trim();
      const name = (o.customer_name || 'Unknown').trim();
      const email = (o.customer_email || '').trim();
      const key = phone || email || name;
      if (!key) return;
      if (!map[key]) {
        map[key] = { name, phone, email, totalOrders: 0, totalSpend: 0, successOrders: 0, lastOrderAt: o.created_at, methods: [], businessIds: new Set() };
      }
      const c = map[key];
      if (!c.name && name) c.name = name;
      if (!c.email && email) c.email = email;
      c.totalOrders++;
      if (isPaid(o.status)) { c.totalSpend += Number(o.amount || 0); c.successOrders++; }
      if (new Date(o.created_at) > new Date(c.lastOrderAt)) c.lastOrderAt = o.created_at;
      if (o.method && !c.methods.includes(o.method)) c.methods.push(o.method);
      if (o.business_id) c.businessIds.add(o.business_id);
    });
    return Object.values(map);
  }, [rawOrders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers
      .filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'totalSpend') return b.totalSpend - a.totalSpend;
        if (sortBy === 'totalOrders') return b.totalOrders - a.totalOrders;
        return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
      });
  }, [customers, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ['Name', 'Phone', 'Email', 'Total Orders', 'Total Spend', 'Successful Orders', 'Last Order'],
      ...filtered.map(c => [c.name, c.phone, c.email, c.totalOrders, c.totalSpend.toFixed(2), c.successOrders, fmtDate(c.lastOrderAt)])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xelpay-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scopeOptions = [
    { id: 'this', label: 'This Business' },
    { id: 'all', label: 'All Businesses' },
  ];

  // ─── Summary stats ────────────────────────────────────────────────────────
  const totalRevenue = useMemo(() => customers.reduce((s, c) => s + c.totalSpend, 0), [customers]);
  const totalOrdersAll = useMemo(() => customers.reduce((s, c) => s + c.totalOrders, 0), [customers]);

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
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users size={28} className="text-blue-600" /> Customers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">All customers derived from payment orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrders} className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all shadow-sm">
            <RefreshCw size={15} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-black text-xs shadow-md hover:-translate-y-0.5 transition-all uppercase tracking-widest">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown value={businessScope} onChange={(v) => { setBusinessScope(v as any); setCurrentPage(1); }} options={scopeOptions} />
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, phone, email…"
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all shadow-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:border-blue-400 transition-all"
        >
          <option value="totalSpend">Sort: Top Spenders</option>
          <option value="totalOrders">Sort: Most Orders</option>
          <option value="lastOrderAt">Sort: Recent</option>
        </select>
      </div>

      {/* ── Summary Strip ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Total Customers', value: String(customers.length), color: 'text-blue-600', border: 'border-b-blue-600' },
            { icon: Receipt, label: 'Total Orders', value: String(totalOrdersAll), color: 'text-indigo-600', border: 'border-b-indigo-600' },
            { icon: DollarSign, label: 'Total Revenue', value: fmtBDT(totalRevenue), color: 'text-emerald-600', border: 'border-b-emerald-600' },
          ].map(({ icon: Icon, label, value, color, border }) => (
            <div key={label} className={`bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 border-b-2 ${border} rounded-2xl p-4 shadow-sm`}>
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${color} mb-3 w-fit`}><Icon size={16} strokeWidth={2.5} /></div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} strokeWidth={2.5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Users size={28} className="text-slate-400" /></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No Customers Found</h3>
            <p className="text-slate-500 mt-1 text-sm font-medium">{search ? 'Try a different search term.' : 'Customers appear here once orders are placed.'}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]">
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Orders</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Total Spend</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Success Rate</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginated.map((c, i) => {
                    const rate = c.totalOrders > 0 ? ((c.successOrders / c.totalOrders) * 100).toFixed(0) : '0';
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <span className="text-sm font-black text-slate-900 dark:text-white">{c.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            {c.phone && <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"><Phone size={11} className="text-slate-400" />{c.phone}</div>}
                            {c.email && <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-500"><Mail size={11} className="text-slate-400" />{c.email}</div>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{c.totalOrders}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fmtBDT(c.totalSpend)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg ${Number(rate) >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : Number(rate) >= 40 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs font-medium text-slate-500">{fmtDate(c.lastOrderAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((c, i) => {
                const rate = c.totalOrders > 0 ? ((c.successOrders / c.totalOrders) * 100).toFixed(0) : '0';
                return (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{c.name || 'Unknown'}</p>
                        {c.phone && <p className="text-xs text-slate-500 font-medium">{c.phone}</p>}
                        {c.email && <p className="text-xs text-slate-400 font-medium">{c.email}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{c.totalOrders}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Orders</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-2">
                        <p className="text-sm font-black text-emerald-600">{fmtBDT(c.totalSpend)}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Spend</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{rate}%</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Success</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={15} /></button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}