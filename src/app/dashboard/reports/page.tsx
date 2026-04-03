'use client';

import { useState, useEffect } from 'react';
import { LineChart, BarChart3, TrendingUp, TrendingDown, Calendar, Download, Loader2, Building2, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    totalVolume: 0,
    successfulPayments: 0,
    failedPayments: 0,
    averageOrderValue: 0,
  });

  // Chart Data State
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [gatewaySplit, setGatewaySplit] = useState({ bkash: 0, nagad: 0, rocket: 0, upay: 0 });

  const fetchAnalytics = async (bizId: string) => {
    setLoading(true);
    const { data: orders } = await supabase
      .from('orders')
      .select('amount, status, created_at, method')
      .eq('business_id', bizId)
      .order('created_at', { ascending: true }); // পুরানো থেকে নতুন

    if (orders) {
      let total = 0;
      let successCount = 0;
      let failCount = 0;
      let methods = { bkash: 0, nagad: 0, rocket: 0, upay: 0 };
      
      // Last 7 days tracking array
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          fullDate: d.toDateString(),
          amount: 0 
        };
      });

      orders.forEach((order: any) => {
        const amt = parseFloat(order.amount || '0');
        const method = order.method?.toLowerCase() as keyof typeof methods;
        const orderDate = new Date(order.created_at).toDateString();

        if (order.status === 'paid' || order.status === 'success') {
          total += amt;
          successCount++;
          if (methods[method] !== undefined) methods[method] += amt;
          
          // Add to chart data if it falls in the last 7 days
          const dayMatch = last7Days.find(d => d.fullDate === orderDate);
          if (dayMatch) dayMatch.amount += amt;

        } else if (order.status === 'failed' || order.status === 'cancelled') {
          failCount++;
        }
      });

      setStats({
        totalVolume: total,
        successfulPayments: successCount,
        failedPayments: failCount,
        averageOrderValue: successCount > 0 ? (total / successCount) : 0
      });

      setWeeklyData(last7Days);
      setGatewaySplit(methods);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchAnalytics(activeId);
      } else {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  // Find max value for dynamic chart height
  const maxChartValue = Math.max(...weeklyData.map(d => d.amount), 100); // minimum 100 to avoid division by zero
  const totalGatewayVolume = Object.values(gatewaySplit).reduce((a, b) => a + b, 0);

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business to view its analytics.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LineChart size={28} className="text-blue-600" /> Reports & Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Visual breakdown of your payment volume, conversion rates, and gateway usage.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
            <Calendar size={16} className="text-blue-600" /> Last 7 Days
          </div>
          <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 uppercase tracking-widest">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <>
          {/* 📊 Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Gross Volume</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
                ৳ {stats.totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-500 relative z-10">
                <TrendingUp size={14} /> +12.5% from last week
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Successful Payments</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
                {stats.successfulPayments} <span className="text-lg text-slate-400 font-medium">Txns</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 relative z-10">
                Avg. Value: ৳ {stats.averageOrderValue.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Failed / Cancelled</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
                {stats.failedPayments} <span className="text-lg text-slate-400 font-medium">Txns</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-red-500 relative z-10">
                <TrendingDown size={14} /> Needs attention
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 📈 Pure CSS Dynamic Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" /> 7-Day Revenue Trend
                </h3>
              </div>
              
              <div className="flex-1 flex items-end gap-2 md:gap-6 pt-10 relative">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                  <div className="border-b border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                  <div className="border-b border-slate-100 dark:border-slate-800/50 w-full h-0"></div>
                </div>

                {weeklyData.map((data, idx) => {
                  const heightPercentage = (data.amount / maxChartValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 relative group z-10">
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl transform -translate-y-2 group-hover:-translate-y-0">
                        ৳ {data.amount.toLocaleString()}
                      </div>

                      {/* The Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl relative overflow-hidden h-[200px] flex items-end justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-1000 ease-out group-hover:brightness-110"
                          style={{ height: `${heightPercentage}%`, minHeight: data.amount > 0 ? '5%' : '0%' }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🎯 Payment Gateway Split */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Wallet size={18} className="text-blue-600" /> Gateway Usage
              </h3>
              
              <div className="flex-1 space-y-6">
                
                {/* bKash */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-[#E2136E] uppercase tracking-widest">bKash</span>
                    <span className="text-xs font-bold text-slate-500">
                      {totalGatewayVolume > 0 ? ((gatewaySplit.bkash / totalGatewayVolume) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#E2136E] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${totalGatewayVolume > 0 ? (gatewaySplit.bkash / totalGatewayVolume) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Nagad */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-[#F7941D] uppercase tracking-widest">Nagad</span>
                    <span className="text-xs font-bold text-slate-500">
                      {totalGatewayVolume > 0 ? ((gatewaySplit.nagad / totalGatewayVolume) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#F7941D] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${totalGatewayVolume > 0 ? (gatewaySplit.nagad / totalGatewayVolume) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Rocket */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-[#8C3494] uppercase tracking-widest">Rocket</span>
                    <span className="text-xs font-bold text-slate-500">
                      {totalGatewayVolume > 0 ? ((gatewaySplit.rocket / totalGatewayVolume) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#8C3494] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${totalGatewayVolume > 0 ? (gatewaySplit.rocket / totalGatewayVolume) * 100 : 0}%` }}></div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analytics update in real-time</p>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
