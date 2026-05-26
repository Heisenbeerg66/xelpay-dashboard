'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, Zap, Users, GitBranch, Activity } from 'lucide-react';
import Link from 'next/link';
import { BillingCard } from '@/components/billing/BillingCard';
import { UsageProgress } from '@/components/billing/UsageProgress';
import { UsageChart } from '@/components/billing/UsageChart';
import { MOCK_USAGE, USAGE_CHART_DATA } from '@/components/billing/types';

const STAT_META = [
  { icon: TrendingUp, color: '#3b82f6' },
  { icon: Zap,        color: '#8b5cf6' },
  { icon: Users,      color: '#10b981' },
  { icon: GitBranch,  color: '#f59e0b' },
];

export default function UsagePage() {
  const latest = USAGE_CHART_DATA[USAGE_CHART_DATA.length - 1];
  const prev   = USAGE_CHART_DATA[USAGE_CHART_DATA.length - 2];
  const txGrowth  = (((latest.transactions - prev.transactions) / prev.transactions) * 100).toFixed(1);
  const apiGrowth = (((latest.apiCalls - prev.apiCalls) / prev.apiCalls) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Billing
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-black text-white">Usage Analytics</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track your resource consumption</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
              <Download size={14} /> Export Usage
            </button>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_USAGE.map((stat, i) => {
            const meta = STAT_META[i];
            const pct  = stat.limit === 'unlimited' ? 100 : Math.round((stat.used / (stat.limit as number)) * 100);
            return (
              <motion.div key={stat.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-[#111827] rounded-2xl border border-slate-800/80 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}18` }}>
                    <meta.icon size={14} style={{ color: meta.color }} />
                  </div>
                  <span className="text-xs font-black" style={{ color: meta.color }}>{pct}%</span>
                </div>
                <p className="text-xl font-black text-white">{stat.used.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.name}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <BillingCard delay={0.2}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="font-black text-white text-sm">Usage Trend</h2>
                <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-slate-500">Transactions</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-violet-500" /><span className="text-slate-500">API Calls</span></div>
              </div>
            </div>
            <UsageChart />
            <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Activity size={16} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-500">Transactions this month</p>
                  <p className="font-black text-white">{latest.transactions.toLocaleString()} <span className="text-xs font-bold text-emerald-400">+{txGrowth}%</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Zap size={16} className="text-violet-400" />
                <div>
                  <p className="text-xs text-slate-500">API calls this month</p>
                  <p className="font-black text-white">{latest.apiCalls.toLocaleString()} <span className="text-xs font-bold text-emerald-400">+{apiGrowth}%</span></p>
                </div>
              </div>
            </div>
          </div>
        </BillingCard>

        {/* Usage breakdown */}
        <BillingCard delay={0.25}>
          <div className="p-5">
            <h2 className="font-black text-white text-sm mb-5">Usage Breakdown</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {MOCK_USAGE.map((stat, i) => <UsageProgress key={stat.name} stat={stat} delay={0.05 * i} />)}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-500">Resets <strong className="text-white">June 1, 2026</strong></p>
              <Link href="/dashboard/billing/plans" className="text-sm font-bold text-blue-400 hover:text-blue-300">Upgrade for more →</Link>
            </div>
          </div>
        </BillingCard>

        {/* Monthly table */}
        <BillingCard delay={0.3}>
          <div className="p-5">
            <h2 className="font-black text-white text-sm mb-4">Monthly Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Month','Transactions','API Calls','Status'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-600 uppercase tracking-widest pb-3 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...USAGE_CHART_DATA].reverse().map((row, i) => (
                    <motion.tr key={row.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.04 }} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-3.5 pr-6 font-bold text-sm text-white">{row.month} 2026</td>
                      <td className="py-3.5 pr-6 text-sm text-slate-400">{row.transactions.toLocaleString()}</td>
                      <td className="py-3.5 pr-6 text-sm text-slate-400">{row.apiCalls.toLocaleString()}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${i === 0 ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}>
                          {i === 0 ? 'current' : 'complete'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </BillingCard>

      </div>
    </div>
  );
}
