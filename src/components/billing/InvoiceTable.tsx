'use client';

import { motion } from 'framer-motion';
import { Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { Invoice, InvoiceStatus } from './types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  pending:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  failed:   'bg-red-500/15 text-red-400 border border-red-500/20',
  refunded: 'bg-slate-700/60 text-slate-400 border border-slate-700',
};

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {['Invoice', 'Date', 'Period', 'Amount', 'Status', ''].map((h) => (
              <th key={h} className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3 pr-6 whitespace-nowrap last:pr-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <motion.tr
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
            >
              <td className="py-4 pr-6"><span className="font-bold text-sm text-white">{inv.invoiceNumber}</span></td>
              <td className="py-4 pr-6 text-sm text-slate-400 whitespace-nowrap">
                {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="py-4 pr-6 text-sm text-slate-400">{inv.period}</td>
              <td className="py-4 pr-6"><span className="font-bold text-white">${inv.amount}</span></td>
              <td className="py-4 pr-6">
                <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full', STATUS_STYLES[inv.status])}>
                  {inv.status}
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-1 justify-end">
                  <Link href={`/dashboard/billing/invoices/${inv.id}`} className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-blue-400 transition-colors">
                    <Eye size={14} />
                  </Link>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-blue-400 transition-colors">
                    <Download size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
