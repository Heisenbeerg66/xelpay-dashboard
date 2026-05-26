'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Smartphone, Building2, Bitcoin, Lock, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CheckoutStepper } from '@/components/billing/CheckoutStepper';
import { BillingCard } from '@/components/billing/BillingCard';
import { PLANS, BillingCycle, PlanId } from '@/components/billing/types';

const STEPS = [{ id: 1, label: 'Plan' }, { id: 2, label: 'Payment' }, { id: 3, label: 'Review' }, { id: 4, label: 'Done' }];

const METHODS = [
  { id: 'card',   label: 'Card',         sub: 'Visa, Mastercard',  icon: CreditCard,  color: '#3b82f6' },
  { id: 'bkash',  label: 'bKash',        sub: 'Mobile banking',    icon: Smartphone,  color: '#e2136e' },
  { id: 'nagad',  label: 'Nagad',        sub: 'Digital wallet',    icon: Smartphone,  color: '#f05a23' },
  { id: 'rocket', label: 'Rocket',       sub: 'DBBL mobile',       icon: Smartphone,  color: '#8b5cf6' },
  { id: 'bank',   label: 'Bank',         sub: 'Direct transfer',   icon: Building2,   color: '#3b82f6' },
  { id: 'crypto', label: 'Crypto',       sub: 'BTC, ETH, USDT',   icon: Bitcoin,     color: '#f7931a' },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30';
const labelCls = 'text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5';

function PaymentContent() {
  const params = useSearchParams();
  const planId = (params.get('plan') || 'pro') as PlanId;
  const cycle  = (params.get('cycle') || 'monthly') as BillingCycle;
  const coupon = params.get('coupon') || '';
  const plan   = PLANS.find((p) => p.id === planId) || PLANS[1];

  const [selected, setSelected] = useState('card');
  const [cardNum, setCardNum]   = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [txId, setTxId]         = useState('');

  const price    = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const discount = coupon === 'XELPAY20' ? price * 0.2 : 0;
  const total    = price - discount;

  const formatCard   = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-7">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/billing/checkout?plan=${planId}&cycle=${cycle}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft size={15} /> Back
          </Link>
          <h1 className="text-xl font-black text-white">Payment Method</h1>
          <p className="text-slate-500 text-sm mt-0.5">Choose how you want to pay</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CheckoutStepper steps={STEPS} current={2} />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">

            <BillingCard delay={0.15}>
              <div className="p-5">
                <h2 className="font-black text-white text-sm mb-4">Select Method</h2>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <motion.button key={m.id} onClick={() => setSelected(m.id)} whileTap={{ scale: 0.97 }}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${selected === m.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'}`}>
                      <m.icon size={18} style={{ color: m.color }} />
                      <span className={`text-[10px] font-bold ${selected === m.id ? 'text-blue-400' : 'text-slate-400'}`}>{m.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </BillingCard>

            <BillingCard delay={0.2}>
              <div className="p-5">
                <h2 className="font-black text-white text-sm mb-4">
                  {selected === 'card' ? 'Card Details' : selected === 'bank' ? 'Bank Transfer' : selected === 'crypto' ? 'Crypto Payment' : 'Mobile Banking'}
                </h2>
                <AnimatePresence mode="wait">
                  {selected === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div><label className={labelCls}>Card Number</label><input value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" className={inputCls} /></div>
                      <div><label className={labelCls}>Cardholder Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputCls} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Expiry</label><input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className={inputCls} /></div>
                        <div><label className={labelCls}>CVV</label><input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} type="password" placeholder="•••" className={inputCls} /></div>
                      </div>
                    </motion.div>
                  )}
                  {(selected === 'bkash' || selected === 'nagad' || selected === 'rocket') && (
                    <motion.div key="mobile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-sm font-semibold text-amber-400">Send <strong>${total.toFixed(2)}</strong> to our {selected === 'bkash' ? 'bKash' : selected === 'nagad' ? 'Nagad' : 'Rocket'} number: <strong>01700-000000</strong></p>
                      </div>
                      <div><label className={labelCls}>Your Phone Number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" className={inputCls} /></div>
                      <div><label className={labelCls}>Transaction ID</label><input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="e.g. 8N3A9KXXX" className={inputCls} /></div>
                    </motion.div>
                  )}
                  {selected === 'bank' && (
                    <motion.div key="bank" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2 text-sm">
                        {[['Bank','Dutch-Bangla Bank Ltd.'],['Account','Xenverse IT'],['Acc. No.','1234567890'],['Routing','090261234'],['Amount',`$${total.toFixed(2)}`]].map(([k,v])=>(
                          <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-bold text-white">{v}</span></div>
                        ))}
                      </div>
                      <div><label className={labelCls}>Reference Number</label><input placeholder="Bank reference" className={inputCls} /></div>
                    </motion.div>
                  )}
                  {selected === 'crypto' && (
                    <motion.div key="crypto" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <p className="font-bold text-orange-400 text-sm mb-2">Send USDT (TRC-20):</p>
                        <code className="block text-xs text-orange-300 break-all font-mono bg-orange-900/20 p-2 rounded-lg">TXxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
                        <p className="text-orange-400/70 text-xs mt-2">Amount: <strong>${total.toFixed(2)} ≈ {total.toFixed(2)} USDT</strong></p>
                      </div>
                      <div><label className={labelCls}>Transaction Hash</label><input placeholder="0x..." className={`${inputCls} font-mono`} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </BillingCard>
          </div>

          <div className="lg:col-span-2">
            <BillingCard delay={0.2}>
              <div className="p-5 space-y-4">
                <h2 className="font-black text-white text-sm">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">{plan.name} ({cycle})</span><span className="font-bold text-white">${price}</span></div>
                  {discount > 0 && <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="font-bold text-emerald-400">-${discount.toFixed(2)}</span></div>}
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between"><span className="font-bold text-white">Total</span><span className="font-black text-xl text-white">${total.toFixed(2)}</span></div>
                </div>
                <Link href={`/dashboard/billing/review?plan=${planId}&cycle=${cycle}&method=${selected}&coupon=${coupon}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/40">
                  <Lock size={13} /> Review Order <ChevronRight size={13} />
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <Shield size={11} /> Encrypted & secure
                </div>
              </div>
            </BillingCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return <Suspense><PaymentContent /></Suspense>;
}
