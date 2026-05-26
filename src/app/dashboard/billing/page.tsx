'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreditCard, Zap, Calendar, TrendingUp, ArrowUpRight, Shield, Download, ChevronRight, Receipt, Activity } from 'lucide-react';
import { BillingCard } from '@/components/billing/BillingCard';
import { BillingStats } from '@/components/billing/BillingStats';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { UsageProgress } from '@/components/billing/UsageProgress';
import { MOCK_USAGE, MOCK_INVOICES, MOCK_HISTORY } from '@/components/billing/types';

const STATS = [
  { label: 'Current Plan',  value: 'Pro',   sub: 'Active subscription',    icon: Zap,         color: '#3b82f6' },
  { label: 'Next Billing',  value: 'Jun 1', sub: '$29.00 due',             icon: Calendar,    color: '#8b5cf6' },
  { label: 'This Month',    value: '3,241', sub: 'transactions used',       icon: TrendingUp,  color: '#10b981' },
  { label: 'Total Paid',    value: '$116',  sub: 'all time',               icon: Receipt,     color: '#f59e0b' },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-black text-white">Billing & Subscriptions</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your plan, invoices, and payment methods</p>
            </div>
            <Link href="/dashboard/billing/plans" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
              <Zap size={15} /> Upgrade Plan
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <BillingStats stats={STATS} />

        {/* Current Plan + Payment Method */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Current Plan */}
          <BillingCard delay={0.1}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white text-sm">Current Plan</h2>
                <PlanBadge plan="pro" size="md" />
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-xs font-bold">XelPay Pro</span>
                  <Shield size={15} className="text-blue-500" />
                </div>
                <div className="text-3xl font-black text-white mb-1">$29<span className="text-base font-medium text-slate-400">/mo</span></div>
                <p className="text-slate-500 text-xs">Renews June 1, 2026 · Visa •••• 4242</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/billing/plans" className="flex-1 text-center py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors">
                  Change Plan
                </Link>
                <button className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-700 transition-colors">
                  Cancel Plan
                </button>
              </div>
            </div>
          </BillingCard>

          {/* Payment Method */}
          <BillingCard delay={0.15}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white text-sm">Payment Method</h2>
                <Link href="/dashboard/billing/methods" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">Manage <ChevronRight size={11} /></Link>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl mb-4">
                <div className="w-10 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-md flex items-center justify-center">
                  <CreditCard size={14} className="text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Visa •••• 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/27</p>
                </div>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Default</span>
              </div>
              <Link href="/dashboard/billing/methods" className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-colors">
                + Add Payment Method
              </Link>
            </div>
          </BillingCard>
        </div>

        {/* Usage */}
        <BillingCard delay={0.2}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-white text-sm">Usage This Month</h2>
                <p className="text-xs text-slate-500 mt-0.5">Resets June 1, 2026</p>
              </div>
              <Link href="/dashboard/billing/usage" className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300">
                Analytics <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {MOCK_USAGE.map((stat, i) => (
                <UsageProgress key={stat.name} stat={stat} delay={0.05 * i} />
              ))}
            </div>
          </div>
        </BillingCard>

        {/* Recent Invoices */}
        <BillingCard delay={0.25}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white text-sm">Recent Invoices</h2>
              <Link href="/dashboard/billing/invoices" className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300">
                View all <ChevronRight size={11} />
              </Link>
            </div>
            <div className="space-y-1">
              {MOCK_INVOICES.slice(0, 3).map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Receipt size={13} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{inv.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      inv.status === 'refunded' ? 'bg-slate-700 text-slate-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>{inv.status}</span>
                    <span className="font-black text-white text-sm">${inv.amount}</span>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded-lg transition-all">
                      <Download size={13} className="text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </BillingCard>

        {/* Activity */}
        <BillingCard delay={0.3}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white text-sm">Billing Activity</h2>
              <Link href="/dashboard/billing/history" className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300">
                Full history <ChevronRight size={11} />
              </Link>
            </div>
            <div className="space-y-0">
              {MOCK_HISTORY.slice(0, 4).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3 py-3 border-b border-slate-800/60 last:border-0"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'paid' ? 'bg-emerald-500' : item.status === 'refunded' ? 'bg-slate-600' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.method} · {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <p className={`font-bold text-sm shrink-0 ${item.status === 'refunded' ? 'text-slate-600 line-through' : 'text-white'}`}>${item.amount}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </BillingCard>

      </div>
    </div>
  );
}
