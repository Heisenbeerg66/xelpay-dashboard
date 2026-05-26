'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { BillingCard } from '@/components/billing/BillingCard';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { MOCK_INVOICES, InvoiceStatus } from '@/components/billing/types';

const FILTERS: (InvoiceStatus | 'all')[] = ['all', 'paid', 'pending', 'failed', 'refunded'];

export default function InvoicesPage() {
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState<InvoiceStatus | 'all'>('all');

  const filtered = MOCK_INVOICES.filter((inv) => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.period.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || inv.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Billing
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-black text-white">Invoices</h1>
              <p className="text-slate-500 text-sm mt-0.5">{MOCK_INVOICES.length} invoices total</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors">
              <Download size={14} /> Export All
            </button>
          </div>
        </motion.div>

        <BillingCard delay={0.1}>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoices..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={13} className="text-slate-600" />
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatus(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${status === f ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-600 font-semibold">No invoices found</div>
            ) : (
              <InvoiceTable invoices={filtered} />
            )}
          </div>
        </BillingCard>

      </div>
    </div>
  );
}
