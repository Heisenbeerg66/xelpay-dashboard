'use client';

import { useState, useEffect } from 'react';
import { Receipt, Search, Filter, ArrowDownRight, ArrowUpRight, Loader2, Building2, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔄 Orders টেবিল থেকে ডেটা ফেচ করা
  const fetchTransactions = async (bizId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });
      
    if (data) {
      setTransactions(data);
      setFilteredData(data);
    }
    setLoading(false);
  };

  // 🚀 Initial Load & Workspace Switcher Listener
  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchTransactions(activeId);
      } else {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  // 🔍 Smart Search Logic
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredData(transactions);
    } else {
      const lowercased = searchTerm.toLowerCase();
      const filtered = transactions.filter(trx => 
        (trx.order_no && trx.order_no.toLowerCase().includes(lowercased)) ||
        (trx.customer_name && trx.customer_name.toLowerCase().includes(lowercased)) ||
        (trx.trx_id && trx.trx_id.toLowerCase().includes(lowercased))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, transactions]);

  // Date Formatter Helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Status Color Helper
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-900/50';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-900/50';
      case 'failed':
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-900/50';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
    }
  };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar to view its transactions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Receipt size={28} className="text-blue-600" /> Transactions
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Monitor and manage all successful and pending payments for this workspace.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all shadow-sm" 
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-colors shadow-sm shrink-0">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* 🧾 Transactions Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex justify-center items-center py-32"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">No Transactions Found</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
              {searchTerm ? "We couldn't find any orders matching your search query." : "You haven't received any payments for this workspace yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#0B1120]/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/50">
                  <th className="p-4 md:px-6 md:py-5">Order Details</th>
                  <th className="p-4 md:px-6 md:py-5">Customer</th>
                  <th className="p-4 md:px-6 md:py-5">Product / Source</th>
                  <th className="p-4 md:px-6 md:py-5">Amount</th>
                  <th className="p-4 md:px-6 md:py-5">Method & TrxID</th>
                  <th className="p-4 md:px-6 md:py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer">
                    
                    {/* Order ID & Date */}
                    <td className="p-4 md:px-6 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${trx.status === 'paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {trx.status === 'paid' ? <ArrowDownRight size={18} /> : <Receipt size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            {trx.order_no || 'ORD-UNKNOWN'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} /> {formatDate(trx.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4 md:px-6 md:py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{trx.customer_name || 'Anonymous'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{trx.customer_email || trx.source_customer_number || 'N/A'}</p>
                    </td>

                    {/* Product / Source */}
                    <td className="p-4 md:px-6 md:py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex max-w-[150px] truncate">
                        {trx.product_name || 'API Payment'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4 md:px-6 md:py-4">
                      <p className="font-black text-slate-900 dark:text-white text-base">
                        {trx.currency || 'BDT'} {parseFloat(trx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </td>

                    {/* Method & TrxID */}
                    <td className="p-4 md:px-6 md:py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">
                        {trx.method || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-blue-500 mt-0.5">
                        {trx.trx_id ? `#${trx.trx_id}` : 'Awaiting TrxID'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4 md:px-6 md:py-4 text-right">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(trx.status)}`}>
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

    </div>
  );
}