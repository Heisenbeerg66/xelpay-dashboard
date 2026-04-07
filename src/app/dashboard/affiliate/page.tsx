'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Copy, Wallet, TrendingUp, ArrowUpRight, Loader2,
  Share2, Link2, Clock, AlertCircle, X, ShieldCheck, Gift,
  ArrowDownLeft, Check, QrCode, Eye, EyeOff, Smartphone,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────

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
  withdrawal_fees: number;
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
  fee_amount: number;
  net_amount: number;
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

interface PaymentLogo {
  method_name: string;
  logo_url: string;
}

const BANK_LOGO = 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png';

const BANGLADESHI_BANKS = [
  'Sonali Bank','Janata Bank','Agrani Bank','Rupali Bank','BASIC Bank',
  'Dutch-Bangla Bank','BRAC Bank','Islami Bank Bangladesh','Prime Bank',
  'Southeast Bank','Dhaka Bank','Mutual Trust Bank','Bank Asia',
  'Mercantile Bank','Standard Bank','One Bank','NCC Bank','Pubali Bank',
  'Uttara Bank','AB Bank','City Bank','Eastern Bank','IFIC Bank',
  'Jamuna Bank','Meghna Bank','Midland Bank','Modhumoti Bank',
  'NRB Bank','Padma Bank','Premier Bank','Shimanto Bank','South Bangla Bank',
  'UCB','Union Bank','United Commercial Bank',
];

const ACCOUNT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'agent',    label: 'Agent' },
  { value: 'merchant', label: 'Merchant' },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  approved:   { label: 'Approved',   color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  paid:       { label: 'Paid',       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
  processing: { label: 'Processing', color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-900/20' },
};

// ─── Share Platforms ────────────────────────────────────────────────────────

const SHARE_PLATFORMS = [
  {
    id: 'facebook', label: 'Facebook',
    svgPath: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
    color: '#1877F2',
    url: (l: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}`,
  },
  {
    id: 'whatsapp', label: 'WhatsApp',
    svgPath: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
    color: '#25D366',
    url: (l: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + l)}`,
  },
  {
    id: 'twitter', label: 'X (Twitter)',
    svgPath: 'M4 4l16 16M4 20L20 4',
    color: '#000000',
    url: (l: string, t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(l)}`,
  },
  {
    id: 'telegram', label: 'Telegram',
    svgPath: 'M21.4 2.6L2.6 10.3c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.9 5.8c.3.7.2 1 1 1 .6 0 .9-.3 1.3-.7l3.1-3 5.1 3.8c.9.5 1.6.3 1.8-.9L22 4c.3-1.4-.5-2-1.6-1.4z',
    color: '#2CA5E0',
    url: (l: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(l)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    svgPath: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    color: '#0A66C2',
    url: (l: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(l)}`,
  },
  {
    id: 'reddit', label: 'Reddit',
    svgPath: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 11.5c0 2.5-2.2 4.5-5 4.5s-5-2-5-4.5c0-.3 0-.5.1-.8-.4-.1-.8-.4-.8-.9 0-.6.5-1 1-1 .3 0 .5.1.7.3.7-.5 1.8-.8 3-.9l.5-2.4 2 .4c.1-.4.5-.7 1-.7.6 0 1 .4 1 1s-.4 1-1 1-.9-.4-1-.9l-1.7-.4-.4 2c1.2.1 2.2.4 3 .9.2-.2.4-.3.7-.3.6 0 1 .5 1 1 0 .5-.3.8-.7.9 0 .3.1.5.1.8z',
    color: '#FF4500',
    url: (l: string, t: string) => `https://reddit.com/submit?url=${encodeURIComponent(l)}&title=${encodeURIComponent(t)}`,
  },
];

// ─── Share Modal (Desktop only — sync component, no async) ──────────────────

function ShareModal({ referralLink, onClose }: { referralLink: string; onClose: () => void }) {
  const shareText = 'Join XelPay — fastest payment gateway for Bangladeshi businesses. Use my referral link:';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Share your referral link</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Choose a platform to share</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Link preview */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 mb-4">
          <Link2 size={11} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate flex-1">{referralLink}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {SHARE_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => window.open(p.url(referralLink, shareText), '_blank', 'noopener,noreferrer')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: p.color + '18' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={p.svgPath} />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-slate-400 leading-tight text-center">{p.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(referralLink);
            toast.success('Link copied!');
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <Copy size={13} /> Copy link to clipboard
        </button>
      </div>
    </div>
  );
}

// ─── TOTP Enroll Modal ────────────────────────────────────────────────────

function TotpEnrollModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [step, setStep] = useState<'info' | 'qr' | 'verify'>('info');
  const [qrUri, setQrUri] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSec, setShowSec] = useState(false);

  const startEnroll = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'XelPay Authenticator' });
    if (error || !data) { toast.error('Failed: ' + (error?.message ?? '')); setLoading(false); return; }
    setQrUri(data.totp.qr_code); setSecret(data.totp.secret); setFactorId(data.id);
    setStep('qr'); setLoading(false);
  };

  const verifyEnroll = async () => {
    if (code.length < 6) return;
    setLoading(true);
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId });
    if (ce) { toast.error(ce.message); setLoading(false); return; }
    const { error: ve } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    if (ve) { toast.error('Wrong code — try again.'); setLoading(false); return; }
    toast.success('Authenticator activated!'); setLoading(false); onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" /> Setup 2FA Authenticator
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>

        {step === 'info' && (
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={26} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">2-factor auth required</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">Withdrawals are protected by a one-time code from an authenticator app.</p>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">Install <b className="text-slate-600 dark:text-slate-300">Google Authenticator</b> or <b className="text-slate-600 dark:text-slate-300">Authy</b> first.</p>
            <button onClick={startEnroll} disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><QrCode size={14} /> Get QR code</>}
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
                <button onClick={() => setShowSec(s => !s)} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">{showSec ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"><Copy size={13} /></button>
              </div>
            </div>
            <button onClick={() => setStep('verify')} className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all">I've scanned it →</button>
          </div>
        )}

        {step === 'verify' && (
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">Enter the 6-digit code from your authenticator app.</p>
            <input
              type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white mb-4 transition-all"
            />
            <button onClick={verifyEnroll} disabled={loading || code.length < 6}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-xs font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Verify & activate</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Fee Breakdown Box ────────────────────────────────────────────────────

function FeeBreakdown({ amtNum, feeAmt, netAmt, feePercent }: {
  amtNum: number; feeAmt: number; netAmt: number; feePercent: number;
}) {
  if (amtNum <= 0 || feePercent <= 0) return null;
  return (
    <div className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-400 font-medium">Requested amount</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">৳ {amtNum.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-400 font-medium">Service fee ({feePercent}%)</span>
        <span className="text-red-500 font-semibold">− ৳ {feeAmt.toLocaleString()}</span>
      </div>
      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">You'll receive</span>
        <span className="text-sm font-bold text-emerald-600">৳ {netAmt.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────

function WithdrawModal({
  wallet, settings, merchantId, hasTOTP, onEnrollTOTP, onClose, onSuccess, paymentLogos,
}: {
  wallet: AffiliateWallet; settings: SiteSettings; merchantId: string;
  hasTOTP: boolean; onEnrollTOTP: () => void; onClose: () => void; onSuccess: () => void;
  paymentLogos: PaymentLogo[];
}) {
  const [method, setMethod]       = useState('');
  const [account, setAccount]     = useState('');
  const [amount, setAmount]       = useState('');
  const [accountType, setAccountType] = useState('personal');
  const [bankName, setBankName]   = useState('');
  const [bankDetails, setBankDetails] = useState({ name: '', branch: '', routing: '' });
  const [totpCode, setTotpCode]   = useState('');
  const [step, setStep]           = useState<'form' | 'totp'>('form');
  const [loading, setLoading]     = useState(false);

  const enabledMethods = settings.withdraw_methods_enabled;
  const mfsMethods = enabledMethods.filter(m => m !== 'bank');
  const hasBankEnabled = enabledMethods.includes('bank');

  const isMfs = method !== 'bank' && method !== '';
  const isBank = method === 'bank';
  const minAmt = isBank ? settings.withdraw_min_bank : settings.withdraw_min_mfs;
  const amtNum = parseFloat(amount) || 0;
  const feeAmt = parseFloat((amtNum * settings.withdrawal_fees / 100).toFixed(2));
  const netAmt = parseFloat((amtNum - feeAmt).toFixed(2));
  const amtValid = amtNum >= minAmt && amtNum <= wallet.withdrawable_balance;

  const todayOk = (() => {
    if (settings.withdraw_open_days.length  > 0 && !settings.withdraw_open_days.includes(new Date().getDay()))   return false;
    if (settings.withdraw_open_dates.length > 0 && !settings.withdraw_open_dates.includes(new Date().getDate())) return false;
    return true;
  })();

  const getLogoUrl = (m: string) => paymentLogos.find(p => p.method_name === m)?.logo_url ?? '';

  const buildAccountDetails = () => isBank
    ? JSON.stringify({ number: account, name: bankDetails.name, branch: bankDetails.branch, routing: bankDetails.routing, bank_name: bankName })
    : account;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) { toast.error('Select a withdrawal method.'); return; }
    if (!account) { toast.error('Enter your account details.'); return; }
    if (isBank && !bankName) { toast.error('Select your bank.'); return; }
    if (!amtValid) { toast.error(`Amount must be ৳${minAmt}–৳${wallet.withdrawable_balance.toFixed(0)}.`); return; }
    if (settings.withdraw_require_2fa && !hasTOTP) { onClose(); onEnrollTOTP(); return; }
    if (settings.withdraw_require_2fa) setStep('totp'); else doSubmit('');
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
      merchant_id:     merchantId,
      amount:          amtNum,
      fee_amount:      feeAmt,
      net_amount:      netAmt,
      method,
      account_details: buildAccountDetails(),
      account_type:    isMfs ? accountType : null,
      bank_name:       isBank ? bankName : null,
      status:          'pending',
      otp_verified:    true,
      is_active:       true,
    });
    if (error) { toast.error('Failed: ' + error.message); setLoading(false); return; }
    await supabase.from('affiliate_wallets').update({
      withdrawable_balance: Math.max(0, wallet.withdrawable_balance - amtNum),
      last_withdrawn_at: new Date().toISOString(),
    }).eq('merchant_id', merchantId);
    toast.success('Withdrawal request submitted!');
    setLoading(false); onSuccess();
  };

  const canProceed = settings.withdraw_enabled && todayOk;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md sm:rounded-2xl rounded-t-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet size={15} className="text-blue-600" />
              {step === 'form' ? 'Request withdrawal' : 'Verify identity'}
            </h3>
            {step === 'form' && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Available: <span className="font-semibold text-emerald-600">৳ {wallet.withdrawable_balance.toLocaleString()}</span>
                {settings.withdrawal_fees > 0 && (
                  <span className="ml-1.5 text-slate-400">· {settings.withdrawal_fees}% fee applies</span>
                )}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[80vh] space-y-4">
          {!settings.withdraw_enabled && (
            <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Withdrawals are currently paused.</p>
            </div>
          )}
          {settings.withdraw_enabled && !todayOk && (
            <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <Clock size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">Withdrawals are not open today.</p>
            </div>
          )}

          {canProceed && step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* MFS Methods */}
              {mfsMethods.length > 0 && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 block">Mobile banking (MFS)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mfsMethods.map(m => {
                      const logoUrl = getLogoUrl(m);
                      const selected = method === m;
                      return (
                        <button type="button" key={m} onClick={() => setMethod(m)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                          {logoUrl
                            ? <img src={logoUrl} alt={m} className="w-8 h-8 object-contain rounded-lg" />
                            : <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500">{m[0].toUpperCase()}</div>
                          }
                          <div>
                            <p className={`text-xs font-semibold capitalize ${selected ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{m}</p>
                            <p className="text-[10px] text-slate-400">Min ৳{settings.withdraw_min_mfs}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bank */}
              {hasBankEnabled && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 block">Bank transfer</label>
                  <button type="button" onClick={() => setMethod('bank')}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${method === 'bank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <img src={BANK_LOGO} alt="bank" className="w-8 h-8 object-contain" />
                    <div>
                      <p className={`text-xs font-semibold ${method === 'bank' ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>Bank transfer</p>
                      <p className="text-[10px] text-slate-400">Min ৳{settings.withdraw_min_bank}</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Method-specific fields */}
              {method && (
                <>
                  {/* Amount */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Amount (BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">৳</span>
                      <input
                        type="number" min={minAmt} max={wallet.withdrawable_balance} step="1" value={amount}
                        onChange={e => setAmount(e.target.value)} placeholder={`Min ৳${minAmt}`}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Fee breakdown — shown always when method selected and amount > 0 */}
                    <FeeBreakdown amtNum={amtNum} feeAmt={feeAmt} netAmt={netAmt} feePercent={settings.withdrawal_fees} />

                    {amount && !amtValid && (
                      <p className="text-[11px] text-red-500 mt-1.5">Must be ৳{minAmt}–৳{wallet.withdrawable_balance.toFixed(0)}</p>
                    )}
                  </div>

                  {/* MFS: account type + number */}
                  {isMfs && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Account type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ACCOUNT_TYPES.map(at => (
                            <button type="button" key={at.value} onClick={() => setAccountType(at.value)}
                              className={`py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${accountType === at.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                              {at.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block capitalize">{method} number</label>
                        <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                      </div>
                    </>
                  )}

                  {/* Bank: bank name + account details */}
                  {isBank && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Bank name</label>
                        <div className="relative">
                          <select value={bankName} onChange={e => setBankName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all appearance-none">
                            <option value="">Select your bank</option>
                            {BANGLADESHI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Account number</label>
                        <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="Account number"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Account holder name</label>
                        <input type="text" value={bankDetails.name} onChange={e => setBankDetails({ ...bankDetails, name: e.target.value })} placeholder="Full name"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Branch</label>
                          <input type="text" value={bankDetails.branch} onChange={e => setBankDetails({ ...bankDetails, branch: e.target.value })} placeholder="e.g. Motijheel"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Routing no.</label>
                          <input type="text" value={bankDetails.routing} onChange={e => setBankDetails({ ...bankDetails, routing: e.target.value })} placeholder="9-digit"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Info notices */}
                  <div className="flex gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <Clock size={12} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Processing time: <span className="font-medium text-slate-700 dark:text-slate-300">{settings.withdraw_process_time}</span></p>
                  </div>

                  {settings.withdraw_require_2fa && (
                    <div className="flex gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40">
                      <ShieldCheck size={12} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 dark:text-blue-400">Authenticator code required on next step.</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <><ArrowUpRight size={13} /> {settings.withdraw_require_2fa ? 'Next: verify →' : 'Submit request'}</>}
                  </button>
                </>
              )}
            </form>
          )}

          {canProceed && step === 'totp' && (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} className="text-blue-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Verify identity</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                Enter the 6-digit code to confirm withdrawal of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">৳ {amtNum.toLocaleString()}</span>.
              </p>
              {settings.withdrawal_fees > 0 && (
                <p className="text-xs text-slate-400 mb-5">
                  After {settings.withdrawal_fees}% fee, you'll receive{' '}
                  <span className="font-semibold text-emerald-600">৳ {netAmt.toLocaleString()}</span>
                </p>
              )}
              <input
                type="text" inputMode="numeric" maxLength={6} value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white mb-4 transition-all"
              />
              <button onClick={() => doSubmit(totpCode)} disabled={loading || totpCode.length < 6}
                className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-400 text-white text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Confirm withdrawal</>}
              </button>
              <button onClick={() => setStep('form')} className="mt-3 text-xs text-slate-400 hover:text-blue-600 transition-colors">← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
// Mobile: all stacked; Desktop: grid. No accent/blue variant anymore — all uniform.

function StatCard({ label, value, sub, icon }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <span className="scale-90 text-slate-500">{icon}</span>
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold leading-none text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] sm:text-[11px] mt-1.5 text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AffiliateProgram() {
  const [loading, setLoading]               = useState(true);
  const [merchant, setMerchant]             = useState<MerchantInfo | null>(null);
  const [wallet, setWallet]                 = useState<AffiliateWallet | null>(null);
  const [commissions, setCommissions]       = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals]       = useState<Withdrawal[]>([]);
  const [settings, setSettings]             = useState<SiteSettings | null>(null);
  const [paymentLogos, setPaymentLogos]     = useState<PaymentLogo[]>([]);
  const [hasTOTP, setHasTOTP]               = useState(false);
  const [activeTab, setActiveTab]           = useState<'referrals' | 'history'>('referrals');
  const [showShare, setShowShare]           = useState(false);
  const [showWithdraw, setShowWithdraw]     = useState(false);
  const [showEnrollTotp, setShowEnrollTotp] = useState(false);
  const [codeCopied, setCodeCopied]         = useState(false);
  const [linkCopied, setLinkCopied]         = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobileDevice(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobileDevice(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = merchant ? `${origin}/signup?ref=${merchant.refer_id}` : '';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: m }, { data: w }, { data: c }, { data: wd }, { data: ss }, { data: logos }, { data: mfa }] = await Promise.all([
      supabase.from('merchants').select('id,name,refer_id,total_refer,affiliate_wallet,refer_link_clicks').eq('id', user.id).single(),
      supabase.from('affiliate_wallets').select('total_earned,withdrawable_balance,total_withdrawn,last_withdrawn_at').eq('merchant_id', user.id).single(),
      supabase.from('affiliate_commissions')
        .select(`id,referred_merchant_id,commission_amount,status,created_at,merchants!affiliate_commissions_referred_merchant_id_fkey(name),plans(name)`)
        .eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('affiliate_withdrawals')
        .select('id,amount,fee_amount,net_amount,method,account_details,status,created_at,processed_at')
        .eq('merchant_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('site_settings').select('key_name,value')
        .in('key_name', ['refer_commission','withdraw_min_mfs','withdraw_min_bank','withdraw_enabled',
          'withdraw_methods_enabled','withdraw_process_time','withdraw_open_days','withdraw_open_dates',
          'withdraw_require_2fa','withdrawal_fees']),
      supabase.from('payment_logos').select('method_name,logo_url'),
      supabase.auth.mfa.listFactors(),
    ]);

    if (m) setMerchant(m as MerchantInfo);
    if (w) setWallet(w as AffiliateWallet);
    if (logos) setPaymentLogos(logos as PaymentLogo[]);

    if (c) setCommissions(c.map((r: any) => ({
      id: r.id, referred_merchant_id: r.referred_merchant_id,
      commission_amount: r.commission_amount, status: r.status, created_at: r.created_at,
      merchant_name: r.merchants?.name ?? 'Unknown', plan_name: r.plans?.name ?? '—',
    })));
    if (wd) setWithdrawals(wd as Withdrawal[]);

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
        withdraw_open_days:       s.withdraw_open_days ? s.withdraw_open_days.split(',').map(Number).filter(Boolean) : [],
        withdraw_open_dates:      s.withdraw_open_dates ? s.withdraw_open_dates.split(',').map(Number).filter(Boolean) : [],
        withdraw_require_2fa:     (s.withdraw_require_2fa ?? 'true') === 'true',
        withdrawal_fees:          parseFloat(s.withdrawal_fees ?? '0'),
      });
    }
    setHasTOTP(!!mfa?.data?.totp?.some((f: any) => f.status === 'verified'));
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

  // Share handler: mobile → native sheet, desktop → custom modal
  const handleShare = async () => {
    if (isMobileDevice && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'XelPay Referral',
          text: 'Join XelPay — fastest payment gateway for Bangladeshi businesses.',
          url: referralLink,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to modal
      }
    }
    setShowShare(true);
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
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 pb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
              <Users size={18} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-none">Affiliate program</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Earn <span className="font-medium text-violet-600">{settings?.refer_commission ?? 10}% lifetime commission</span> per referral
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={!settings?.withdraw_enabled || walletData.withdrawable_balance <= 0}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-medium hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <Wallet size={13} /> Withdraw funds
          </button>
        </div>

        {/* ── Stats Grid ──
              Mobile:  2 columns (2+2 rows)
              Desktop: 4 columns
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total earned"
            value={`৳ ${walletData.total_earned.toLocaleString()}`}
            icon={<TrendingUp size={14} />}
          />
          <StatCard
            label="Available"
            value={`৳ ${walletData.withdrawable_balance.toLocaleString()}`}
            sub="Ready to withdraw"
            icon={<Wallet size={14} />}
          />
          <StatCard
            label="Total withdrawn"
            value={`৳ ${walletData.total_withdrawn.toLocaleString()}`}
            sub={walletData.last_withdrawn_at
              ? `Last: ${new Date(walletData.last_withdrawn_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
              : 'None yet'}
            icon={<ArrowDownLeft size={14} />}
          />
          <StatCard
            label="Referrals"
            value={String(merchant?.total_refer ?? 0)}
            sub={`${merchant?.refer_link_clicks ?? 0} link clicks`}
            icon={<Users size={14} />}
          />
        </div>

        {/* ── Referral Link Card ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 rounded-2xl p-5 sm:p-7 shadow-xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white opacity-[0.04]" />
            <div className="absolute -bottom-6 left-10 w-32 h-32 rounded-full bg-violet-300 opacity-[0.08]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Gift size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">Your referral link</h2>
                <p className="text-xs sm:text-sm text-blue-100">Share on blog, YouTube, WhatsApp, socials</p>
              </div>
            </div>

            {/* Link row */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex items-center flex-1 bg-black/20 border border-white/15 rounded-xl px-3 py-2.5 min-w-0">
                <Link2 size={11} className="text-blue-200 mr-2 shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-white truncate flex-1">{referralLink}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={copyLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>

            {/* Code row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2.5 bg-black/20 border border-white/15 rounded-xl px-4 py-2.5">
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-medium">Your code</span>
                <span className="text-base sm:text-lg font-mono font-semibold text-white tracking-widest">{merchant?.refer_id ?? '—'}</span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-medium hover:bg-white/20 transition-colors"
              >
                {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                {codeCopied ? 'Copied' : 'Copy code'}
              </button>
            </div>
          </div>
        </div>

        {/* ── How it Works ── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-5">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              { n: '01', title: 'Share your link', desc: 'Post your unique referral link on social media, YouTube, or your blog.', icon: <Share2 size={15} /> },
              { n: '02', title: 'They sign up',    desc: 'Anyone who registers via your link is permanently tagged as your referral.', icon: <Users size={15} /> },
              { n: '03', title: 'Earn monthly',    desc: `You get ${settings?.refer_commission ?? 10}% of their plan fee every billing cycle, for life.`, icon: <TrendingUp size={15} /> },
            ].map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-0.5">Step {s.n}</p>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tables ── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-3 gap-0.5">
            {(['referrals', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest rounded-t-lg border-b-2 -mb-px transition-all ${
                  activeTab === t
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}>
                {t === 'referrals' ? `Referrals (${commissions.length})` : `Withdrawals (${withdrawals.length})`}
              </button>
            ))}
          </div>

          {/* Fee info bar — withdrawal history tab */}
          {settings && settings.withdrawal_fees > 0 && activeTab === 'history' && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/60 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20">
              <AlertCircle size={12} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Withdrawal fee: <span className="font-semibold">{settings.withdrawal_fees}%</span> deducted from each request
              </p>
            </div>
          )}

          {/* Referrals table */}
          {activeTab === 'referrals' && (
            commissions.length === 0
              ? <EmptyState icon={<Users size={26} />} title="No referrals yet" sub="Share your link to get started" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-[#0B1120]/60">
                        {['Merchant', 'Plan', 'Date joined', 'Commission', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {commissions.map(c => {
                        const st = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-5 py-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{c.merchant_name}</td>
                            <td className="px-5 py-4">
                              <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{c.plan_name}</span>
                            </td>
                            <td className="px-5 py-4 text-xs sm:text-sm text-slate-400">
                              {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-4 text-xs sm:text-sm font-semibold text-emerald-600">+ ৳ {parseFloat(String(c.commission_amount)).toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          )}

          {/* Withdrawals table */}
          {activeTab === 'history' && (
            withdrawals.length === 0
              ? <EmptyState icon={<Wallet size={26} />} title="No withdrawals yet" sub="Your withdrawal history will appear here" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-[#0B1120]/60">
                        {['Amount', 'Fee', 'Net received', 'Method', 'Account', 'Requested', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {withdrawals.map(w => {
                        const st = STATUS_CFG[w.status] ?? STATUS_CFG.pending;
                        const logo = paymentLogos.find(p => p.method_name === w.method);
                        let acc = w.account_details;
                        try { const p = JSON.parse(w.account_details); acc = p.number ?? acc; } catch {}
                        return (
                          <tr key={w.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-5 py-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">৳ {parseFloat(String(w.amount)).toLocaleString()}</td>
                            <td className="px-5 py-4 text-xs sm:text-sm text-red-500">− ৳ {parseFloat(String(w.fee_amount || 0)).toLocaleString()}</td>
                            <td className="px-5 py-4 text-xs sm:text-sm font-semibold text-emerald-600">৳ {parseFloat(String(w.net_amount || w.amount)).toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <span className="flex items-center gap-2">
                                {logo
                                  ? <img src={logo.logo_url} alt={w.method} className="w-5 h-5 object-contain rounded" />
                                  : w.method === 'bank' ? <img src={BANK_LOGO} alt="bank" className="w-5 h-5 object-contain" /> : null
                                }
                                <span className="text-xs sm:text-sm capitalize text-slate-700 dark:text-slate-300">{w.method}</span>
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs sm:text-sm font-mono text-slate-400">{acc}</td>
                            <td className="px-5 py-4 text-xs sm:text-sm text-slate-400">
                              {new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>

        {/* ── 2FA notice ── */}
        {settings?.withdraw_require_2fa && !hasTOTP && (
          <div className="flex items-start gap-3 p-4 sm:p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Authenticator required for withdrawals</p>
              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-500 leading-relaxed">
                You haven't set up 2FA yet.{' '}
                <button onClick={() => setShowEnrollTotp(true)} className="underline font-medium hover:no-underline">Set it up now →</button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showShare && (
        <ShareModal referralLink={referralLink} onClose={() => setShowShare(false)} />
      )}

      {showWithdraw && settings && merchant && (
        <WithdrawModal
          wallet={walletData} settings={settings} merchantId={merchant.id} hasTOTP={hasTOTP}
          paymentLogos={paymentLogos}
          onEnrollTOTP={() => { setShowWithdraw(false); setShowEnrollTotp(true); }}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { setShowWithdraw(false); fetchAll(); }}
        />
      )}

      {showEnrollTotp && (
        <TotpEnrollModal
          onDone={() => { setShowEnrollTotp(false); setHasTOTP(true); toast.success('2FA enabled!'); }}
          onClose={() => setShowEnrollTotp(false)}
        />
      )}
    </>
  );
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
      <div className="opacity-20">{icon}</div>
      <p className="text-xs sm:text-sm font-medium">{title}</p>
      <p className="text-[11px] sm:text-xs opacity-70">{sub}</p>
    </div>
  );
}