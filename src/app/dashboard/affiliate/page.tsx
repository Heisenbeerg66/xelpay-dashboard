'use client';

/**
 * XelPay — Affiliate Program Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Tables used:
 *   merchants              → id, name, refer_id, total_refer, affiliate_wallet,
 *                            refer_link_clicks, plan_id
 *   affiliate_wallets      → merchant_id, total_earned, withdrawable_balance,
 *                            total_withdrawn, last_withdrawn_at
 *   affiliate_commissions  → referrer_id, referred_merchant_id,
 *                            commission_amount, status, created_at
 *   affiliate_withdrawals  → merchant_id, amount, method, account_details,
 *                            status, created_at, processed_at
 *   site_settings          → key_name, value
 *     Keys: refer_commission, withdraw_min_mfs, withdraw_min_bank,
 *           withdraw_enabled, withdraw_methods_enabled, withdraw_process_time,
 *           withdraw_open_days, withdraw_open_dates, withdraw_require_2fa
 *   plans                  → id, name, price
 *
 * TOTP / 2FA:
 *   Uses Supabase built-in TOTP (auth.mfa_factors).
 *   User must enroll before first withdrawal (guided inline).
 *   Verify via supabase.auth.mfa.challengeAndVerify() before DB insert.
 *
 * Referral link: /signup?ref=<refer_id>  (matches SignUpClient useSearchParams)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Copy, Wallet, TrendingUp,
  ArrowUpRight, Loader2, Share2, Link2,
  Clock, AlertCircle, X, ShieldCheck,
  Gift, ArrowDownLeft, Check, QrCode,
  Eye, EyeOff, Smartphone,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteSettings {
  refer_commission: number;
  withdraw_min_mfs: number;
  withdraw_min_bank: number;
  withdraw_enabled: boolean;
  withdraw_methods_enabled: string[];
  withdraw_process_time: string;
  withdraw_open_days: number[];
  withdraw_open_dates: number[];
  withdraw_require_2fa: boolean;
}

interface AffiliateWallet {
  total_earned: number;
  withdrawable_balance: number;
  total_withdrawn: number;
  last_withdrawn_at: string | null;
}

interface Commission {
  id: string;
  referred_merchant_id: string;
  commission_amount: number;
  status: string;
  created_at: string;
  merchant_name?: string;
  plan_name?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  account_details: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface MerchantInfo {
  id: string;
  name: string;
  refer_id: string;
  total_refer: number;
  affiliate_wallet: number;
  refer_link_clicks: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_CONFIG: Record<string, {
  label: string; icon: string; category: 'mfs' | 'bank'; placeholder: string;
}> = {
  bkash:  { label: 'bKash',  icon: '📱', category: 'mfs',  placeholder: '01XXXXXXXXX' },
  nagad:  { label: 'Nagad',  icon: '🟠', category: 'mfs',  placeholder: '01XXXXXXXXX' },
  rocket: { label: 'Rocket', icon: '🟣', category: 'mfs',  placeholder: '01XXXXXXXXX' },
  bank:   { label: 'Bank',   icon: '🏦', category: 'bank', placeholder: 'Account Number' },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
  approved:   { label: 'Approved',   color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  paid:       { label: 'Paid',       color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  processing: { label: 'Processing', color: 'text-sky-600',    bg: 'bg-sky-50 dark:bg-sky-900/20' },
};

const SHARE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook',    icon: '🟦', url: (l: string, t: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}` },
  { id: 'whatsapp', label: 'WhatsApp',    icon: '🟩', url: (l: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + l)}` },
  { id: 'twitter',  label: 'X (Twitter)', icon: '⬛', url: (l: string, t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(l)}` },
  { id: 'telegram', label: 'Telegram',    icon: '🔵', url: (l: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(l)}&text=${encodeURIComponent(t)}` },
  { id: 'linkedin', label: 'LinkedIn',    icon: '🔷', url: (l: string, t: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(l)}` },
  { id: 'reddit',   label: 'Reddit',      icon: '🟥', url: (l: string, t: string) => `https://reddit.com/submit?url=${encodeURIComponent(l)}&title=${encodeURIComponent(t)}` },
];

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ referralLink, onClose }: { referralLink: string; onClose: () => void }) {
  const shareText = 'Join XelPay — the fastest payment gateway for Bangladeshi businesses. Use my referral link:';
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full sm:max-w-xs sm:rounded-2xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Share Your Link</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {SHARE_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => window.open(p.url(referralLink, shareText), '_blank')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <span className="text-xl">{p.icon}</span>
              <span className="text-[9px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors leading-tight text-center">{p.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Link copied!'); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <Copy size={13} /> Copy Link
        </button>
      </div>
    </div>
  );
}

// ─── TOTP Enroll Modal ────────────────────────────────────────────────────────

function TotpEnrollModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [step,      setStep]      = useState<'info' | 'qr' | 'verify'>('info');
  const [qrUri,     setQrUri]     = useState('');
  const [secret,    setSecret]    = useState('');
  const [factorId,  setFactorId]  = useState('');
  const [code,      setCode]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showSec,   setShowSec]   = useState(false);

  const startEnroll = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'XelPay Authenticator' });
    if (error || !data) { toast.error('Failed to start: ' + (error?.message ?? '')); setLoading(false); return; }
    setQrUri(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setStep('qr');
    setLoading(false);
  };

  const verifyEnroll = async () => {
    if (code.length < 6) return;
    setLoading(true);
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId });
    if (ce) { toast.error(ce.message); setLoading(false); return; }
    const { error: ve } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    if (ve) { toast.error('Wrong code — try again.'); setLoading(false); return; }
    toast.success('Authenticator activated!');
    setLoading(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" /> Setup 2FA Authenticator
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>

        {step === 'info' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={28} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">2-Factor Auth Required</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
              Withdrawals are protected by a one-time code from an authenticator app.
            </p>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Install <b className="text-slate-600 dark:text-slate-300">Google Authenticator</b> or <b className="text-slate-600 dark:text-slate-300">Authy</b> on your phone first.
            </p>
            <button onClick={startEnroll} disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><QrCode size={14} /> Get QR Code</>}
            </button>
          </div>
        )}

        {step === 'qr' && (
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Scan this QR code with your authenticator app.</p>
            <div className="bg-white p-3 rounded-xl inline-block mb-4 border border-slate-200">
              <img src={qrUri} alt="TOTP QR" className="w-44 h-44 mx-auto" />
            </div>
            <div className="mb-5">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Manual secret</p>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                <code className={`text-xs font-mono text-slate-700 dark:text-slate-300 flex-1 break-all ${!showSec ? 'blur-sm select-none' : ''}`}>{secret}</code>
                <button onClick={() => setShowSec(s => !s)} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                  {showSec ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <button onClick={() => setStep('verify')}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">
              I've scanned it →
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">Enter the 6-digit code from your authenticator app.</p>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white mb-4 transition-all"
            />
            <button onClick={verifyEnroll} disabled={loading || code.length < 6}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Verify & Activate</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────────

function WithdrawModal({
  wallet, settings, merchantId, hasTOTP, onEnrollTOTP, onClose, onSuccess,
}: {
  wallet: AffiliateWallet; settings: SiteSettings; merchantId: string;
  hasTOTP: boolean; onEnrollTOTP: () => void; onClose: () => void; onSuccess: () => void;
}) {
  const [method,    setMethod]    = useState('');
  const [account,   setAccount]   = useState('');
  const [amount,    setAmount]    = useState('');
  const [bankExtra, setBankExtra] = useState({ name: '', branch: '', routing: '' });
  const [totpCode,  setTotpCode]  = useState('');
  const [step,      setStep]      = useState<'form' | 'totp'>('form');
  const [loading,   setLoading]   = useState(false);

  const cfg       = METHOD_CONFIG[method];
  const minAmt    = cfg?.category === 'bank' ? settings.withdraw_min_bank : settings.withdraw_min_mfs;
  const amtNum    = parseFloat(amount) || 0;
  const amtValid  = amtNum >= minAmt && amtNum <= wallet.withdrawable_balance;

  const todayOk = (() => {
    if (settings.withdraw_open_days.length  > 0 && !settings.withdraw_open_days.includes(new Date().getDay()))   return false;
    if (settings.withdraw_open_dates.length > 0 && !settings.withdraw_open_dates.includes(new Date().getDate())) return false;
    return true;
  })();

  const buildAccountDetails = () =>
    cfg?.category === 'bank'
      ? JSON.stringify({ number: account, name: bankExtra.name, branch: bankExtra.branch, routing: bankExtra.routing })
      : account;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method)  { toast.error('Select a withdrawal method.'); return; }
    if (!account) { toast.error('Enter your account details.'); return; }
    if (!amtValid){ toast.error(`Amount must be ৳${minAmt}–৳${wallet.withdrawable_balance.toFixed(0)}.`); return; }
    if (settings.withdraw_require_2fa && !hasTOTP) { onClose(); onEnrollTOTP(); return; }
    if (settings.withdraw_require_2fa) { setStep('totp'); } else { doSubmit(''); }
  };

  const doSubmit = async (code: string) => {
    setLoading(true);
    if (settings.withdraw_require_2fa && code) {
      const { data: facs } = await supabase.auth.mfa.listFactors();
      const tf = facs?.totp?.[0];
      if (!tf) { toast.error('No authenticator found.'); setLoading(false); return; }
      const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId: tf.id });
      if (ce) { toast.error(ce.message); setLoading(false); return; }
      const { error: ve } = await supabase.auth.mfa.verify({ factorId: tf.id, challengeId: ch.id, code });
      if (ve) { toast.error('Invalid authenticator code.'); setLoading(false); return; }
    }
    const { error } = await supabase.from('affiliate_withdrawals').insert({
      merchant_id: merchantId, amount: amtNum, method, account_details: buildAccountDetails(),
      status: 'pending', otp_verified: true,
    });
    if (error) { toast.error('Failed: ' + error.message); setLoading(false); return; }
    await supabase.from('affiliate_wallets').update({
      withdrawable_balance: Math.max(0, wallet.withdrawable_balance - amtNum),
      last_withdrawn_at: new Date().toISOString(),
    }).eq('merchant_id', merchantId);
    toast.success('Withdrawal request submitted!');
    setLoading(false);
    onSuccess();
  };

  const canProceed = settings.withdraw_enabled && todayOk;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md sm:rounded-2xl rounded-t-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet size={16} className="text-blue-600" />
              {step === 'form' ? 'Request Withdrawal' : 'Verify Identity'}
            </h3>
            {step === 'form' && <p className="text-[10px] text-slate-400 mt-0.5">Available: <span className="font-bold text-emerald-600">৳ {wallet.withdrawable_balance.toLocaleString()}</span></p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {!settings.withdraw_enabled && (
            <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 mb-4">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Withdrawals are currently paused. Please check back later.</p>
            </div>
          )}
          {settings.withdraw_enabled && !todayOk && (
            <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 mb-4">
              <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Withdrawals are not open today. Please return on the scheduled date.</p>
            </div>
          )}

          {canProceed && step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Method grid */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {settings.withdraw_methods_enabled.filter(m => METHOD_CONFIG[m]).map(m => {
                    const mc = METHOD_CONFIG[m];
                    const selected = method === m;
                    return (
                      <button type="button" key={m} onClick={() => setMethod(m)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                          selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}>
                        <span className="text-lg">{mc.icon}</span>
                        <div>
                          <p className={`text-xs font-bold ${selected ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{mc.label}</p>
                          <p className="text-[9px] text-slate-400">Min ৳{mc.category === 'bank' ? settings.withdraw_min_bank : settings.withdraw_min_mfs}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {method && (
                <>
                  {/* Amount */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Amount (BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
                      <input type="number" min={minAmt} max={wallet.withdrawable_balance} step="1" value={amount}
                        onChange={e => setAmount(e.target.value)} placeholder={`Min ৳${minAmt}`}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                    </div>
                    {amount && !amtValid && <p className="text-[10px] text-red-500 mt-1">Must be ৳{minAmt}–৳{wallet.withdrawable_balance.toFixed(0)}</p>}
                  </div>

                  {/* Account */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                      {cfg?.category === 'bank' ? 'Account Number' : `${cfg?.label} Number`}
                    </label>
                    <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder={cfg?.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                  </div>

                  {/* Bank extras */}
                  {cfg?.category === 'bank' && (
                    <>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Account Holder Name</label>
                        <input type="text" value={bankExtra.name} onChange={e => setBankExtra({ ...bankExtra, name: e.target.value })} placeholder="Full name"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Branch</label>
                          <input type="text" value={bankExtra.branch} onChange={e => setBankExtra({ ...bankExtra, branch: e.target.value })} placeholder="e.g. Motijheel"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Routing No.</label>
                          <input type="text" value={bankExtra.routing} onChange={e => setBankExtra({ ...bankExtra, routing: e.target.value })} placeholder="9-digit"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notice */}
                  <div className="flex gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <Clock size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Processing time: <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.withdraw_process_time}</span></p>
                  </div>
                  {settings.withdraw_require_2fa && (
                    <div className="flex gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40">
                      <ShieldCheck size={13} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-700 dark:text-blue-400">Authenticator code required on next step.</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <><ArrowUpRight size={13} /> {settings.withdraw_require_2fa ? 'Next: Verify →' : 'Submit Request'}</>}
                  </button>
                </>
              )}
            </form>
          )}

          {canProceed && step === 'totp' && (
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} className="text-blue-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Verify Identity</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Enter the 6-digit code from your authenticator app to confirm withdrawal of <span className="font-bold text-slate-700 dark:text-slate-300">৳ {parseFloat(amount).toLocaleString()}</span>.
              </p>
              <input type="text" inputMode="numeric" maxLength={6} value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white mb-4 transition-all"
              />
              <button onClick={() => doSubmit(totpCode)} disabled={loading || totpCode.length < 6}
                className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Confirm Withdrawal</>}
              </button>
              <button onClick={() => setStep('form')} className="mt-3 text-xs text-slate-400 hover:text-blue-600 transition-colors">← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: string; accent?: boolean; icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
      accent ? 'bg-blue-600 border-blue-500' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-2.5">
        <p className={`text-[9px] font-black uppercase tracking-widest ${accent ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${accent ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
          <span className={`scale-90 ${accent ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
        </div>
      </div>
      <p className={`text-xl sm:text-2xl font-black leading-none ${accent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      {sub && <p className={`text-[9px] mt-1.5 ${accent ? 'text-blue-200' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AffiliateProgram() {
  const [loading,        setLoading]        = useState(true);
  const [merchant,       setMerchant]       = useState<MerchantInfo | null>(null);
  const [wallet,         setWallet]         = useState<AffiliateWallet | null>(null);
  const [commissions,    setCommissions]    = useState<Commission[]>([]);
  const [withdrawals,    setWithdrawals]    = useState<Withdrawal[]>([]);
  const [settings,       setSettings]       = useState<SiteSettings | null>(null);
  const [hasTOTP,        setHasTOTP]        = useState(false);
  const [activeTab,      setActiveTab]      = useState<'referrals' | 'history'>('referrals');
  const [showShare,      setShowShare]      = useState(false);
  const [showWithdraw,   setShowWithdraw]   = useState(false);
  const [showEnrollTotp, setShowEnrollTotp] = useState(false);
  const [codeCopied,     setCodeCopied]     = useState(false);
  const [linkCopied,     setLinkCopied]     = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = merchant ? `${origin}/signup?ref=${merchant.refer_id}` : '';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Merchant
    const { data: m } = await supabase.from('merchants')
      .select('id, name, refer_id, total_refer, affiliate_wallet, refer_link_clicks')
      .eq('id', user.id).single();
    if (m) setMerchant(m as MerchantInfo);

    // Wallet
    const { data: w } = await supabase.from('affiliate_wallets')
      .select('total_earned, withdrawable_balance, total_withdrawn, last_withdrawn_at')
      .eq('merchant_id', user.id).single();
    if (w) setWallet(w as AffiliateWallet);

    // Commissions
    const { data: c } = await supabase.from('affiliate_commissions')
      .select(`id, referred_merchant_id, commission_amount, status, created_at,
               merchants!affiliate_commissions_referred_merchant_id_fkey(name),
               plans(name)`)
      .eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (c) setCommissions(c.map((r: any) => ({
      id: r.id,
      referred_merchant_id: r.referred_merchant_id,
      commission_amount: r.commission_amount,
      status: r.status,
      created_at: r.created_at,
      merchant_name: r.merchants?.name ?? 'Unknown',
      plan_name: r.plans?.name ?? '—',
    })));

    // Withdrawals
    const { data: wd } = await supabase.from('affiliate_withdrawals')
      .select('id, amount, method, account_details, status, created_at, processed_at')
      .eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (wd) setWithdrawals(wd as Withdrawal[]);

    // Settings
    const { data: ss } = await supabase.from('site_settings').select('key_name, value')
      .in('key_name', ['refer_commission','withdraw_min_mfs','withdraw_min_bank','withdraw_enabled',
        'withdraw_methods_enabled','withdraw_process_time','withdraw_open_days','withdraw_open_dates','withdraw_require_2fa']);
    if (ss) {
      const s: Record<string, string> = {};
      ss.forEach((r: any) => { s[r.key_name] = r.value; });
      setSettings({
        refer_commission:         parseFloat(s.refer_commission ?? '10'),
        withdraw_min_mfs:         parseFloat(s.withdraw_min_mfs ?? '200'),
        withdraw_min_bank:        parseFloat(s.withdraw_min_bank ?? '1000'),
        withdraw_enabled:         (s.withdraw_enabled ?? 'true') === 'true',
        withdraw_methods_enabled: (s.withdraw_methods_enabled ?? 'bkash,nagad,rocket,bank').split(',').map(x => x.trim()).filter(Boolean),
        withdraw_process_time:    s.withdraw_process_time ?? '2–3 business days',
        withdraw_open_days:       s.withdraw_open_days  ? s.withdraw_open_days.split(',').map(Number).filter(Boolean) : [],
        withdraw_open_dates:      s.withdraw_open_dates ? s.withdraw_open_dates.split(',').map(Number).filter(Boolean) : [],
        withdraw_require_2fa:     (s.withdraw_require_2fa ?? 'true') === 'true',
      });
    }

    // TOTP status
    const { data: mfa } = await supabase.auth.mfa.listFactors();
    setHasTOTP(!!mfa?.totp?.some((f: any) => f.status === 'verified'));

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const copyCode = () => {
    if (!merchant) return;
    navigator.clipboard.writeText(merchant.refer_id);
    setCodeCopied(true); toast.success('Code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true); toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-blue-600" />
        </div>
        <p className="text-xs text-slate-400">Loading affiliate dashboard…</p>
      </div>
    );
  }

  const walletData: AffiliateWallet = wallet ?? { total_earned: 0, withdrawable_balance: 0, total_withdrawn: 0, last_withdrawn_at: null };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5 pb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <Users size={17} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Affiliate Program</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Earn <span className="font-bold text-purple-600">{settings?.refer_commission ?? 10}% lifetime commission</span> per referral
              </p>
            </div>
          </div>
          <button onClick={() => setShowWithdraw(true)}
            disabled={!settings?.withdraw_enabled || walletData.withdrawable_balance <= 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto">
            <Wallet size={13} /> Withdraw Funds
          </button>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Earned"    value={`৳ ${walletData.total_earned.toLocaleString()}`}      icon={<TrendingUp size={13} />} />
          <StatCard label="Available"       value={`৳ ${walletData.withdrawable_balance.toLocaleString()}`}
            sub="Ready to withdraw" accent icon={<Wallet size={13} />} />
          <StatCard label="Total Withdrawn" value={`৳ ${walletData.total_withdrawn.toLocaleString()}`}
            sub={walletData.last_withdrawn_at ? `Last: ${new Date(walletData.last_withdrawn_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}` : 'None yet'}
            icon={<ArrowDownLeft size={13} />} />
          <StatCard label="Referrals"       value={String(merchant?.total_refer ?? 0)}
            sub={`${merchant?.refer_link_clicks ?? 0} link clicks`} icon={<Users size={13} />} />
        </div>

        {/* ── Referral Link Card ───────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-5 sm:p-7 shadow-xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white opacity-5 blur-2xl" />
            <div className="absolute -bottom-4 left-8 w-24 h-24 rounded-full bg-purple-300 opacity-10 blur-xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Gift size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-tight">Your Referral Link</h2>
                <p className="text-[11px] text-blue-100">Share anywhere — blog, YouTube, WhatsApp, socials</p>
              </div>
            </div>

            {/* Link row */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex items-center flex-1 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 min-w-0">
                <Link2 size={12} className="text-blue-200 mr-2 shrink-0" />
                <span className="text-[11px] font-mono text-white truncate flex-1">{referralLink}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
                  {linkCopied ? <Check size={12} /> : <Copy size={12} />}
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setShowShare(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>

            {/* Refer code */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2">
                <span className="text-[9px] text-blue-200 uppercase tracking-widest font-bold">Your Code</span>
                <span className="text-sm font-black font-mono text-white tracking-widest">{merchant?.refer_id ?? '—'}</span>
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
                {codeCopied ? <Check size={11} /> : <Copy size={11} />}
                {codeCopied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Share your link', desc: 'Post your unique referral link on social media, YouTube, or your blog.', icon: <Share2 size={15} /> },
              { n: '02', title: 'They sign up',    desc: 'Anyone who registers via your link is permanently tagged as your referral.', icon: <Users size={15} /> },
              { n: '03', title: 'Earn monthly',    desc: `You get ${settings?.refer_commission ?? 10}% of their monthly plan fee, every billing cycle, for life.`, icon: <TrendingUp size={15} /> },
            ].map(s => (
              <div key={s.n} className="flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Step {s.n}</p>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-3 gap-0.5">
            {(['referrals', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-t-lg border-b-2 -mb-px transition-all ${
                  activeTab === t
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}>
                {t === 'referrals' ? `Referrals (${commissions.length})` : `Withdrawals (${withdrawals.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'referrals' && (
            commissions.length === 0
              ? <EmptyState icon={<Users size={28} />} title="No referrals yet" sub="Share your link to get started" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-[#0B1120]/60">
                        {['Merchant', 'Plan', 'Date Joined', 'Commission', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {commissions.map(c => {
                        const st = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-white">{c.merchant_name}</td>
                            <td className="px-5 py-3.5"><span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{c.plan_name}</span></td>
                            <td className="px-5 py-3.5 text-[11px] text-slate-400 font-medium">{new Date(c.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</td>
                            <td className="px-5 py-3.5 text-xs font-black text-emerald-600">+ ৳ {parseFloat(String(c.commission_amount)).toLocaleString()}</td>
                            <td className="px-5 py-3.5"><span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          )}

          {activeTab === 'history' && (
            withdrawals.length === 0
              ? <EmptyState icon={<Wallet size={28} />} title="No withdrawals yet" sub="Your withdrawal history will appear here" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-[#0B1120]/60">
                        {['Amount', 'Method', 'Account', 'Requested', 'Processed', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {withdrawals.map(w => {
                        const st  = STATUS_CFG[w.status] ?? STATUS_CFG.pending;
                        const mc  = METHOD_CONFIG[w.method];
                        let acc = w.account_details;
                        try { const p = JSON.parse(w.account_details); acc = p.number ?? acc; } catch {}
                        return (
                          <tr key={w.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-5 py-3.5 text-xs font-black text-slate-900 dark:text-white">৳ {parseFloat(String(w.amount)).toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="flex items-center gap-1.5">{mc?.icon ?? '💳'} {mc?.label ?? w.method}</span></td>
                            <td className="px-5 py-3.5 text-[11px] font-mono text-slate-400">{acc}</td>
                            <td className="px-5 py-3.5 text-[11px] text-slate-400">{new Date(w.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</td>
                            <td className="px-5 py-3.5 text-[11px] text-slate-400">{w.processed_at ? new Date(w.processed_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                            <td className="px-5 py-3.5"><span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>

        {/* ── 2FA Notice ──────────────────────────────────────────────── */}
        {settings?.withdraw_require_2fa && !hasTOTP && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">Authenticator Required for Withdrawals</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-relaxed">
                You haven't set up 2FA yet.{' '}
                <button onClick={() => setShowEnrollTotp(true)} className="underline font-semibold hover:no-underline">
                  Set it up now →
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showShare && <ShareModal referralLink={referralLink} onClose={() => setShowShare(false)} />}

      {showWithdraw && settings && merchant && (
        <WithdrawModal
          wallet={walletData} settings={settings} merchantId={merchant.id} hasTOTP={hasTOTP}
          onEnrollTOTP={() => { setShowWithdraw(false); setShowEnrollTotp(true); }}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { setShowWithdraw(false); fetchAll(); }}
        />
      )}

      {showEnrollTotp && (
        <TotpEnrollModal
          onDone={() => { setShowEnrollTotp(false); setHasTOTP(true); toast.success('2FA enabled! Withdrawals are now unlocked.'); }}
          onClose={() => setShowEnrollTotp(false)}
        />
      )}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
      <div className="opacity-25">{icon}</div>
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-[11px] opacity-70">{sub}</p>
    </div>
  );
}