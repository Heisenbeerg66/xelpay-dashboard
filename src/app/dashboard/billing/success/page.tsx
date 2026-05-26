'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Download, Receipt } from 'lucide-react';
import Link from 'next/link';
import { CheckoutStepper } from '@/components/billing/CheckoutStepper';

const STEPS = [{ id: 1, label: 'Plan' }, { id: 2, label: 'Payment' }, { id: 3, label: 'Review' }, { id: 4, label: 'Done' }];

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-7">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CheckoutStepper steps={STEPS} current={4} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#111827] rounded-2xl border border-slate-800 p-7 text-center space-y-5"
        >
          {/* Checkmark */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-900/50"
              >
                <Check size={28} className="text-white" strokeWidth={3} />
              </motion.div>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.7 }}
                  className="absolute inset-0 rounded-full border border-emerald-500/40"
                />
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Payment Successful</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1.5">Subscription Activated!</h1>
            <p className="text-slate-500 text-sm">Welcome to XelPay Pro. All features are now unlocked.</p>
          </motion.div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-left space-y-2.5 text-sm">
            {[['Plan','XelPay Pro'],['Amount','$29.00'],['Next Billing','June 1, 2026'],['Invoice','INV-2026-005'],['Status','✓ Active']].map(([k,v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500">{k}</span>
                <span className={`font-bold ${k === 'Status' ? 'text-emerald-400' : 'text-white'}`}>{v}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3">
            <Link href="/dashboard/billing" className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
              Go to Billing <ArrowRight size={13} />
            </Link>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors">
              <Download size={13} /> Invoice
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link href="/dashboard/billing/invoices" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-400 transition-colors">
              <Receipt size={11} /> View all invoices
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
