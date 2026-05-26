'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, CreditCard, Smartphone, Building2, Bitcoin, X } from 'lucide-react';
import Link from 'next/link';
import { BillingCard } from '@/components/billing/BillingCard';
import { PaymentMethodCard } from '@/components/billing/PaymentMethodCard';
import { MOCK_PAYMENT_METHODS, PaymentMethod } from '@/components/billing/types';

const ADD_OPTIONS = [
  { id: 'card',   label: 'Card',   icon: CreditCard,  color: '#3b82f6' },
  { id: 'bkash',  label: 'bKash',  icon: Smartphone,  color: '#e2136e' },
  { id: 'nagad',  label: 'Nagad',  icon: Smartphone,  color: '#f05a23' },
  { id: 'rocket', label: 'Rocket', icon: Smartphone,  color: '#8b5cf6' },
  { id: 'bank',   label: 'Bank',   icon: Building2,   color: '#3b82f6' },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin,     color: '#f7931a' },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30';

export default function MethodsPage() {
  const [methods, setMethods]   = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [showAdd, setShowAdd]   = useState(false);
  const [addType, setAddType]   = useState('card');
  const [cardNum, setCardNum]   = useState('');
  const [phone, setPhone]       = useState('');

  const handleDelete     = (id: string) => setMethods((p) => p.filter((m) => m.id !== id));
  const handleSetDefault = (id: string) => setMethods((p) => p.map((m) => ({ ...m, isDefault: m.id === id })));

  const handleAdd = () => {
    const opt = ADD_OPTIONS.find((o) => o.id === addType);
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: addType as any,
      label: addType === 'card' ? `Visa •••• ${cardNum.replace(/\s/g,'').slice(-4) || '0000'}` : opt?.label || addType,
      detail: addType === 'card' ? 'Expires 12/29' : phone || '+880 1XXX-XXXXXX',
      isDefault: false,
      addedAt: new Date().toISOString().split('T')[0],
    };
    setMethods((p) => [...p, newMethod]);
    setShowAdd(false); setCardNum(''); setPhone('');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Billing
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-black text-white">Payment Methods</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your saved payment methods</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
              <Plus size={15} /> Add Method
            </button>
          </div>
        </motion.div>

        <BillingCard delay={0.1}>
          <div className="p-5 space-y-3">
            <h2 className="font-black text-white text-sm">Saved Methods</h2>
            {methods.length === 0 ? (
              <div className="text-center py-8 text-slate-600 font-semibold">No payment methods saved</div>
            ) : (
              methods.map((m, i) => (
                <PaymentMethodCard key={m.id} method={m} onDelete={handleDelete} onSetDefault={handleSetDefault} delay={i * 0.04} />
              ))
            )}
            <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-500/40 hover:text-blue-400 transition-colors mt-1">
              <Plus size={14} /> Add New Payment Method
            </button>
          </div>
        </BillingCard>

        {/* Modal */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl p-5 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white">Add Payment Method</h2>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {ADD_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => setAddType(opt.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${addType === opt.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                      <opt.icon size={16} style={{ color: opt.color }} />
                      <span className={`text-[10px] font-bold ${addType === opt.id ? 'text-blue-400' : 'text-slate-500'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 mb-4">
                  {addType === 'card' ? (
                    <>
                      <input value={cardNum} onChange={(e) => setCardNum(e.target.value)} placeholder="Card number" className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="MM/YY" className={inputCls} />
                        <input placeholder="CVV" className={inputCls} />
                      </div>
                    </>
                  ) : (
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (+880...)" className={inputCls} />
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Add Method</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
