'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Link as LinkIcon, Activity, ArrowUpRight, Plus, Wallet, FileText, ArrowRight, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Stats States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeLinks: 0,
    successRate: 0,
    totalOrders: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchDashboardData = async (bizId: string) => {
    setLoading(true);

    // 1. Fetch Orders for calculating Revenue & Success Rate
    const { data: orders } = await supabase
      .from('orders')
      .select('amount, status, created_at, order_no, customer_name, method')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    // 2. Fetch Active Links Count
    const { count: linksCount } = await supabase
      .from('payment_links')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', bizId)
      .eq('status', 'active');

    if (orders) {
      const paidOrders = orders.filter((o: any) => o.status === 'paid' || o.status === 'success');

      const totalRev = paidOrders.reduce((sum: number, order: any) => sum + parseFloat(order.amount || '0'), 0);
      const rate = orders.length > 0 ?
        (paidOrders.length / orders.length) * 100 : 0;

      setStats({
        totalRevenue: totalRev,
        activeLinks: linksCount || 0,
        successRate: rate,
        totalOrders: orders.length
      });

      // Get top 5 recent orders
      setRecentTransactions(orders.slice(0, 5));
    }
    
    setLoading(false);
  };

  // 🚀 Initial Load & Workspace Switcher Listener
  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchDashboardData(activeId);
      } else {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600';
      default:
        return 'bg-red-50 dark:bg-red-900/20 text-red-600';
    }
  };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar to view its performance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🚀 1. Welcome Section & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Track your payments, links, and business growth dynamically.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/links" className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <LinkIcon size={16} /> New Link
          </Link>
          <Link href="/dashboard/gateways" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/30">
             <Plus size={18} /> Add Gateway
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <>
          {/* 📊 2. Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign size={20} /></div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                ৳ {stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><LinkIcon size={20} /></div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Links</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.activeLinks}</div>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity size={20} /></div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Success Rate</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {stats.successRate.toFixed(1)}<span className="text-lg text-slate-400">%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-widest">{stats.totalOrders} Orders</span>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Affiliate Earned</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">৳ 0<span className="text-lg text-slate-400">.00</span></div>
            </div>
          </div>

          {/* 🧾 3. Recent Transactions Table */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <FileText size={20} className="text-blue-600"/> Recent Transactions
              </h2>
              <Link href="/dashboard/transactions" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight size={14}/>
              </Link>
            </div>
            
            {recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm font-medium">No recent transactions to display.</div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-[#0B1120]/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4 md:px-6 md:py-4">Order ID</th>
                      <th className="p-4 md:px-6 md:py-4">Customer</th>
                      <th className="p-4 md:px-6 md:py-4">Amount</th>
                      <th className="p-4 md:px-6 md:py-4">Method</th>
                      <th className="p-4 md:px-6 md:py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/50">
                    {recentTransactions.map((trx, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer">
                        <td className="p-4 md:px-6 md:py-4 font-bold text-blue-600 dark:text-blue-500">{trx.order_no || 'ORD-UNKNOWN'}</td>
                        <td className="p-4 md:px-6 md:py-4">{trx.customer_name || 'Anonymous'}</td>
                        <td className="p-4 md:px-6 md:py-4 font-black text-slate-900 dark:text-white">৳ {parseFloat(trx.amount).toLocaleString('en-IN')}</td>
                        <td className="p-4 md:px-6 md:py-4">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{trx.method || 'Auto'}</span>
                        </td>
                        <td className="p-4 md:px-6 md:py-4 text-right">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getStatusBadge(trx.status)}`}>
                            {trx.status || 'Pending'}
                          </span>
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
