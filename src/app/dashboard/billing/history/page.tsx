'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Clock, Download } from 'lucide-react';
import Link from 'next/link';
import { BillingCard } from '@/components/billing/BillingCard';
import { MOCK_HISTORY, InvoiceStatus } from '@/components/billing/types';

const STATUS_META: Record<InvoiceStatus, { icon: any; color: string; bg: string; border: string }> = {
  paid:     { icon: CheckCircle, color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  pending:  { icon: Clock,       color: '#f59e0b', bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  failed:   { icon: XCircle,     color: '#ef4444', bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  refunded: { icon: RotateCcw,   color: '#64748b', bg: 'bg-slate-800',      border: 'border-slate-700' },
};

export default function HistoryPage() {
  const grouped = MOCK_HISTORY.reduce((acc: Record<string, typeof MOCK_HISTORY>, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Billing
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-black text-white">Billing History</h1>
              <p className="text-slate-500 text-sm mt-0.5">Complete payment timeline</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </motion.div>

        <div className="space-y-5">
          {Object.entries(grouped).map(([month, items], gi) => (
            <BillingCard key={month} delay={gi * 0.05}>
              <div className="p-5">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">{month}</h2>
                <div className="space-y-0">
                  {items.map((item, i) => {
                    const meta = STATUS_META[item.status];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.05 + i * 0.05 }}
                        className="flex items-center gap-4 py-3.5 border-b border-slate-800/60 last:border-0"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                          <meta.icon size={14} style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.description}</p>
                          <p className="text-xs text-slate-500">{item.method} · {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-black text-sm ${item.status === 'refunded' ? 'text-slate-600 line-through' : 'text-white'}`}>${item.amount.toFixed(2)}</p>
                          <span className="text-[10px] font-black uppercase" style={{ color: meta.color }}>{item.status}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </BillingCard>
          ))}
        </div>

      </div>
    </div>
  );
}
