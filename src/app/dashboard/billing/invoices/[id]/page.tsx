'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BillingCard } from '@/components/billing/BillingCard';
import { MOCK_INVOICES } from '@/components/billing/types';
import { notFound } from 'next/navigation';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = MOCK_INVOICES.find((inv) => inv.id === params.id);
  if (!invoice) return notFound();

  const statusCls =
    invoice.status === 'paid'     ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
    invoice.status === 'refunded' ? 'bg-slate-700 text-slate-400 border border-slate-600' :
    invoice.status === 'pending'  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                    'bg-red-500/15 text-red-400 border border-red-500/20';

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing/invoices" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Invoices
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-xl font-black text-white">{invoice.invoiceNumber}</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors">
                <Printer size={14} /> Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </motion.div>

        <BillingCard delay={0.1}>
          <div className="p-7 space-y-7">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <Link href="/dashboard" className="flex items-center gap-1 mb-3">
                  <span className="text-2xl font-black text-blue-500 tracking-tighter">X</span>
                  <span className="text-xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
                </Link>
                <p className="text-xs text-slate-500">Xenverse IT · Dhaka, Bangladesh</p>
                <p className="text-xs text-slate-500">support@xelpay.com</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white mb-2">${invoice.amount.toFixed(2)}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusCls}`}>{invoice.status}</span>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Invoice meta */}
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ['Invoice', invoice.invoiceNumber],
                ['Issue Date', new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
                ['Due Date',   new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{k}</p>
                  <p className="font-bold text-white text-sm">{v}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-800" />

            {/* Billed to */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Building2 size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Billed To</p>
                <p className="font-bold text-white">Your Business Name</p>
                <p className="text-sm text-slate-500">merchant@email.com</p>
                <p className="text-sm text-slate-500">Dhaka, Bangladesh</p>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Line items */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Description','Qty','Unit Price','Total'].map((h) => (
                      <th key={h} className={`text-[10px] font-black text-slate-600 uppercase tracking-widest pb-3 ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className="py-4 text-sm font-semibold text-white">{item.description}</td>
                      <td className="py-4 text-sm text-slate-500 text-right">{item.quantity}</td>
                      <td className="py-4 text-sm text-slate-500 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-4 text-sm font-bold text-white text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col items-end gap-2 text-sm">
                <div className="flex gap-10"><span className="text-slate-500">Subtotal</span><span className="font-bold text-white">${invoice.amount.toFixed(2)}</span></div>
                <div className="flex gap-10"><span className="text-slate-500">Tax</span><span className="font-bold text-white">$0.00</span></div>
                <div className="h-px w-40 bg-slate-800" />
                <div className="flex gap-10"><span className="font-black text-white">Total</span><span className="font-black text-blue-400">${invoice.amount.toFixed(2)}</span></div>
              </div>
            </div>

            {invoice.status === 'paid' && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-400">
                  Paid in full on {new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
            )}

            <p className="text-xs text-center text-slate-700">Thank you for your business · XelPay by Xenverse IT</p>
          </div>
        </BillingCard>

      </div>
    </div>
  );
}
