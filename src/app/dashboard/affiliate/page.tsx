'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Copy, Wallet, TrendingUp, ArrowUpRight, Loader2,
  Share2, Link2, Clock, AlertCircle, X, ShieldCheck, Gift,
  ArrowDownLeft, Check, QrCode, Eye, EyeOff, Smartphone,
  ChevronDown, Search,
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
  'AB Bank','Agrani Bank','Bank Asia','BASIC Bank','BRAC Bank',
  'City Bank','Dhaka Bank','Dutch-Bangla Bank','Eastern Bank',
  'IFIC Bank','Islami Bank Bangladesh','Jamuna Bank','Janata Bank',
  'Meghna Bank','Mercantile Bank','Midland Bank','Modhumoti Bank',
  'Mutual Trust Bank','NCC Bank','NRB Bank','One Bank','Padma Bank',
  'Premier Bank','Prime Bank','Pubali Bank','Rupali Bank','Shimanto Bank',
  'Sonali Bank','South Bangla Bank','Southeast Bank','Standard Bank',
  'UCB','Union Bank','United Commercial Bank','Uttara Bank',
];

const ACCOUNT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'agent',    label: 'Agent' },
  { value: 'merchant', label: 'Merchant' },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  approved:   { label: 'Approved',   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  paid:       { label: 'Paid',       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',     bg: 'bg-red-500/10' },
  processing: { label: 'Processing', color: 'text-sky-400',     bg: 'bg-sky-500/10' },
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
    id: 'twitter', label: 'X',
    svgPath: 'M4 4l16 16M4 20L20 4',
    color: '#e2e8f0',
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
    svgPath: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
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

// ─── Searchable Bank Picker ───────────────────────────────────────────────

function BankPicker({ value, onChange, inputCls }: {
  value: string; onChange: (v: string) => void; inputCls: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = BANGLADESHI_BANKS.filter(b => b.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => { setOpen(true); setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`${inputCls} flex items-center justify-between text-left`}>
        <span className={value ? 'text-white' : 'text-slate-500'}>{value || 'Select your bank'}</span>
        <ChevronDown size={13} className={`text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#1a2235] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/6">
            <Search size={12} className="text-slate-500 shrink-0" />
            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search bank..." className="flex-1 text-xs bg-transparent outline-none text-white placeholder-slate-500 py-1" />
            {query && <button type="button" onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300"><X size={11} /></button>}
          </div>
          <div className="max-h-44 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No banks found</p>
            ) : filtered.map(bank => (
              <button key={bank} type="button" onClick={() => { onChange(bank); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between
                  ${value === bank ? 'bg-blue-500/15 text-blue-400' : 'text-slate-300 hover:bg-white/5'}`}>
                {bank}
                {value === bank && <Check size={12} className="text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────

function ShareModal({ referralLink, onClose }: { referralLink: string; onClose: () => void }) {
  const shareText = 'Join XelPay — fastest payment gateway for Bangladeshi businesses. Use my referral link:';
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#0f1623] w-full max-w-[95vw] sm:max-w-md rounded-3xl sm:rounded-2xl p-5 sm:p-7 border border-white/8 shadow-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Share referral link</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose a platform</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-slate-400 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 mb-4">
          <Link2 size={12} className="text-slate-500 shrink-0" />
          <span className="text-xs font-mono text-slate-400 truncate flex-1">{referralLink}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SHARE_PLATFORMS.map(p => (
            <button key={p.id} onClick={() => window.open(p.url(referralLink, shareText), '_blank', 'noopener,noreferrer')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/6 hover:border-white/15 hover:bg-white/5 transition-all group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: p.color + '20' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={p.svgPath} />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-slate-500 leading-tight text-center">{p.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Link copied!'); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/8 border border-white/8 text-xs font-medium text-slate-300 hover:bg-white/12 transition-all">
          <Copy size={13} /> Copy link
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#0f1623] w-full max-w-[95vw] sm:max-w-md rounded-3xl sm:rounded-2xl p-5 sm:p-7 border border-white/8 shadow-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-400" /> Setup 2FA Authenticator
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-slate-400 hover:rotate-90 transition-all"><X size={14} /></button>
        </div>

        {step === 'info' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
              <Smartphone size={26} className="text-blue-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">2-factor auth required</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Withdrawals need a one-time code from an authenticator app.</p>
              <p className="text-xs text-slate-500">Install <b className="text-slate-400">Google Authenticator</b> or <b className="text-slate-400">Authy</b> first.</p>
            </div>
            <button onClick={startEnroll} disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><QrCode size={14} /> Get QR code</>}
            </button>
          </div>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-400">Scan this QR code with your authenticator app.</p>
            <div className="bg-white p-3 rounded-xl inline-block">
              <img src={qrUri} alt="TOTP QR" className="w-44 h-44 mx-auto" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Manual secret</p>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                <code className={`text-xs font-mono text-slate-300 flex-1 break-all ${!showSec ? 'blur-sm select-none' : ''}`}>{secret}</code>
                <button onClick={() => setShowSec(s => !s)} className="text-slate-500 hover:text-blue-400 transition-colors shrink-0">{showSec ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); }} className="text-slate-500 hover:text-blue-400 transition-colors shrink-0"><Copy size={13} /></button>
              </div>
            </div>
            <button onClick={() => setStep('verify')} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all">I've scanned it →</button>
          </div>
        )}

        {step === 'verify' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <p className="text-xs text-slate-400">Enter the 6-digit code from your authenticator app.</p>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-[0.4em] py-4 rounded-xl bg-white/5 border-2 border-white/10 focus:border-blue-500 outline-none text-white transition-all" />
            <button onClick={verifyEnroll} disabled={loading || code.length < 6}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><Check size={14} /> Verify & activate</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Fee Breakdown ────────────────────────────────────────────────────────

function FeeBreakdown({ amtNum, feeAmt, netAmt, feePercent }: {
  amtNum: number; feeAmt: number; netAmt: number; feePercent: number;
}) {
  if (amtNum <= 0 || feePercent <= 0) return null;
  return (
    <div className="mt-2 p-3 bg-white/4 rounded-xl border border-white/8 space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Requested</span>
        <span className="text-slate-300 font-medium">৳ {amtNum.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Fee ({feePercent}%)</span>
        <span className="text-red-400 font-medium">− ৳ {feeAmt.toLocaleString()}</span>
      </div>
      <div className="h-px bg-white/8" />
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-semibold">You'll receive</span>
        <span className="text-emerald-400 font-bold">৳ {netAmt.toLocaleString()}</span>
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
  const [method, setMethod]           = useState('');
  const [account, setAccount]         = useState('');
  const [amount, setAmount]           = useState('');
  const [accountType, setAccountType] = useState('personal');
  const [bankName, setBankName]       = useState('');
  const [bankDetails, setBankDetails] = useState({ name: '', branch: '', routing: '' });
  const [totpCode, setTotpCode]       = useState('');
  const [step, setStep]               = useState<'form' | 'totp'>('form');
  const [loading, setLoading]         = useState(false);

  const enabledMethods = settings.withdraw_methods_enabled;
  const mfsMethods     = enabledMethods.filter(m => m !== 'bank');
  const hasBankEnabled = enabledMethods.includes('bank');
  const isMfs          = method !== 'bank' && method !== '';
  const isBank         = method === 'bank';
  const minAmt         = isBank ? settings.withdraw_min_bank : settings.withdraw_min_mfs;
  const amtNum         = parseFloat(amount) || 0;
  const feeAmt         = parseFloat((amtNum * settings.withdrawal_fees / 100).toFixed(2));
  const netAmt         = parseFloat((amtNum - feeAmt).toFixed(2));
  const amtValid       = amtNum >= minAmt && amtNum <= wallet.withdrawable_balance;

  const todayOk = (() => {
    if (settings.withdraw_open_days.length  > 0 && !settings.withdraw_open_days.includes(new Date().getDay()))   return false;
    if (settings.withdraw_open_dates.length > 0 && !settings.withdraw_open_dates.includes(new Date().getDate())) return false;
    return true;
  })();

  const getLogoUrl          = (m: string) => paymentLogos.find(p => p.method_name === m)?.logo_url ?? '';
  const buildAccountDetails = () => isBank
    ? JSON.stringify({ number: account, name: bankDetails.name, branch: bankDetails.branch, routing: bankDetails.routing, bank_name: bankName })
    : account;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method)             { toast.error('Select a withdrawal method.'); return; }
    if (!account)            { toast.error('Enter your account details.'); return; }
    if (isBank && !bankName) { toast.error('Select your bank.'); return; }
    if (!amtValid)           { toast.error(`Amount must be ৳${minAmt}–৳${wallet.withdrawable_balance.toFixed(0)}.`); return; }
    if (settings.withdraw_require_2fa && !hasTOTP) { onClose(); onEnrollTOTP(); return; }
    if (settings.withdraw_require_2fa) setStep('totp');
    else doSubmit('');
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
  const inputCls   = "w-full px-3.5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-slate-500";
  const labelCls   = "text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1623] w-full sm:w-[460px] sm:max-w-[95vw] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wallet size={14} className="text-blue-400" />
              {step === 'form' ? 'Request withdrawal' : 'Verify identity'}
            </h3>
            {step === 'form' && (
              <p className="text-xs text-slate-500 mt-0.5">
                Available: <span className="text-emerald-400 font-semibold">৳ {wallet.withdrawable_balance.toLocaleString()}</span>
                {settings.withdrawal_fees > 0 && <span className="ml-1.5 text-slate-600">· {settings.withdrawal_fees}% fee</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-slate-400 hover:rotate-90 transition-all shrink-0">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {!settings.withdraw_enabled && (
            <div className="flex gap-2.5 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">Withdrawals are currently paused.</p>
            </div>
          )}
          {settings.withdraw_enabled && !todayOk && (
            <div className="flex gap-2.5 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Clock size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">Withdrawals are not open today.</p>
            </div>
          )}

          {canProceed && step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {mfsMethods.length > 0 && (
                <div>
                  <label className={labelCls}>Mobile banking (MFS)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mfsMethods.map(m => {
                      const logoUrl = getLogoUrl(m);
                      const selected = method === m;
                      return (
                        <button type="button" key={m} onClick={() => setMethod(m)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-blue-500 bg-blue-500/10' : 'border-white/8 hover:border-white/15 bg-white/3'}`}>
                          {logoUrl ? <img src={logoUrl} alt={m} className="w-7 h-7 object-contain rounded-lg shrink-0" />
                            : <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-semibold text-slate-400 shrink-0">{m[0].toUpperCase()}</div>}
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold capitalize truncate ${selected ? 'text-blue-400' : 'text-slate-300'}`}>{m}</p>
                            <p className="text-[10px] text-slate-500">Min ৳{settings.withdraw_min_mfs}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasBankEnabled && (
                <div>
                  <label className={labelCls}>Bank transfer</label>
                  <button type="button" onClick={() => setMethod('bank')}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${method === 'bank' ? 'border-blue-500 bg-blue-500/10' : 'border-white/8 hover:border-white/15 bg-white/3'}`}>
                    <img src={BANK_LOGO} alt="bank" className="w-7 h-7 object-contain shrink-0" />
                    <div>
                      <p className={`text-xs font-semibold ${method === 'bank' ? 'text-blue-400' : 'text-slate-300'}`}>Bank transfer</p>
                      <p className="text-[10px] text-slate-500">Min ৳{settings.withdraw_min_bank}</p>
                    </div>
                  </button>
                </div>
              )}

              {method && (
                <>
                  <div>
                    <label className={labelCls}>Amount (BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">৳</span>
                      <input type="number" min={minAmt} max={wallet.withdrawable_balance} step="1" value={amount}
                        onChange={e => setAmount(e.target.value)} placeholder={`Min ৳${minAmt}`}
                        className="w-full pl-8 pr-3.5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-slate-500" />
                    </div>
                    <FeeBreakdown amtNum={amtNum} feeAmt={feeAmt} netAmt={netAmt} feePercent={settings.withdrawal_fees} />
                    {amount && !amtValid && <p className="text-xs text-red-400 mt-1.5">Must be ৳{minAmt}–৳{wallet.withdrawable_balance.toFixed(0)}</p>}
                  </div>

                  {isMfs && (
                    <>
                      <div>
                        <label className={labelCls}>Account type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ACCOUNT_TYPES.map(at => (
                            <button type="button" key={at.value} onClick={() => setAccountType(at.value)}
                              className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${accountType === at.value ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/8 text-slate-400 hover:border-white/15'}`}>
                              {at.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>{method} number</label>
                        <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="01XXXXXXXXX" className={inputCls} />
                      </div>
                    </>
                  )}

                  {isBank && (
                    <>
                      <div>
                        <label className={labelCls}>Bank name</label>
                        <BankPicker value={bankName} onChange={setBankName} inputCls={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Account number</label>
                        <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="Account number" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Account holder name</label>
                        <input type="text" value={bankDetails.name} onChange={e => setBankDetails({ ...bankDetails, name: e.target.value })} placeholder="Full name" className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Branch</label>
                          <input type="text" value={bankDetails.branch} onChange={e => setBankDetails({ ...bankDetails, branch: e.target.value })} placeholder="e.g. Motijheel" className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Routing no.</label>
                          <input type="text" value={bankDetails.routing} onChange={e => setBankDetails({ ...bankDetails, routing: e.target.value })} placeholder="9-digit" className={inputCls} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 p-3 bg-white/4 rounded-xl border border-white/6">
                    <Clock size={12} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">Processing: <span className="text-slate-300 font-medium">{settings.withdraw_process_time}</span></p>
                  </div>

                  {settings.withdraw_require_2fa && (
                    <div className="flex gap-2 p-3 bg-blue-500/8 rounded-xl border border-blue-500/15">
                      <ShieldCheck size={12} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-400">Authenticator code required on next step.</p>
                    </div>
                  )}
                </>
              )}
            </form>
          )}

          {canProceed && step === 'totp' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                <ShieldCheck size={22} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Verify identity</h4>
                <p className="text-xs text-slate-400">Confirm withdrawal of <span className="text-white font-semibold">৳ {amtNum.toLocaleString()}</span>.</p>
                {settings.withdrawal_fees > 0 && <p className="text-xs text-slate-500 mt-0.5">After fee → <span className="text-emerald-400 font-semibold">৳ {netAmt.toLocaleString()}</span></p>}
              </div>
              <input type="text" inputMode="numeric" maxLength={6} value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.35em] py-4 rounded-xl bg-white/5 border-2 border-white/10 focus:border-blue-500 outline-none text-white transition-all" />
            </div>
          )}
        </div>

        {canProceed && (
          <div className="px-5 pb-5 pt-3 border-t border-white/6 shrink-0 space-y-2">
            {step === 'form' && method && (
              <button onClick={handleFormSubmit as any} disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowUpRight size={14} /> {settings.withdraw_require_2fa ? 'Next: verify →' : 'Submit request'}</>}
              </button>
            )}
            {step === 'totp' && (
              <>
                <button onClick={() => doSubmit(totpCode)} disabled={loading || totpCode.length < 6}
                  className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Confirm withdrawal</>}
                </button>
                <button onClick={() => setStep('form')} className="w-full text-xs text-slate-500 hover:text-blue-400 transition-colors py-1">← Back</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div className="opacity-10 text-slate-400">{icon}</div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-xs text-slate-600">{sub}</p>
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
  const handleShare = async () => {
    if (isMobileDevice && typeof navigator.share === 'function') {
      try { await navigator.share({ title: 'XelPay Referral', text: 'Join XelPay — fastest payment gateway for Bangladeshi businesses.', url: referralLink }); return; }
      catch { /* fall through */ }
    }
    setShowShare(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <Loader2 size={18} className="animate-spin text-blue-400" />
        </div>
        <p className="text-xs text-slate-500">Loading affiliate dashboard…</p>
      </div>
    );
  }

  const walletData: AffiliateWallet = wallet ?? { total_earned: 0, withdrawable_balance: 0, total_withdrawn: 0, last_withdrawn_at: null };

  return (
    <>
      <div className="w-full space-y-3 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Users size={16} className="text-violet-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white leading-none">Affiliate program</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Earn <span className="text-violet-400 font-medium">{settings?.refer_commission ?? 10}% lifetime commission</span> per referral
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={!settings?.withdraw_enabled || walletData.withdrawable_balance <= 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/8 border border-white/10 text-white text-xs font-semibold hover:bg-white/12 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Wallet size={13} className="text-slate-400" /> Withdraw
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: 'Total earned',    value: `৳ ${walletData.total_earned.toLocaleString()}`,         sub: undefined,       icon: <TrendingUp size={14} />, accent: 'text-emerald-400' },
            { label: 'Available',       value: `৳ ${walletData.withdrawable_balance.toLocaleString()}`, sub: 'Ready to withdraw', icon: <Wallet size={14} />,     accent: 'text-blue-400' },
            { label: 'Total withdrawn', value: `৳ ${walletData.total_withdrawn.toLocaleString()}`,      sub: walletData.last_withdrawn_at ? `Last ${new Date(walletData.last_withdrawn_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : 'None yet', icon: <ArrowDownLeft size={14} />, accent: 'text-slate-300' },
            { label: 'Referrals',       value: String(merchant?.total_refer ?? 0),                      sub: `${merchant?.refer_link_clicks ?? 0} link clicks`, icon: <Users size={14} />, accent: 'text-violet-400' },
          ].map(card => (
            <div key={card.label} className="rounded-xl px-3 py-3 bg-white/4 border border-white/6 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center shrink-0 text-slate-400">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-600 mb-0.5">{card.label}</p>
                <p className={`text-sm font-bold leading-none truncate ${card.accent}`}>{card.value}</p>
                {card.sub && <p className="text-[10px] text-slate-600 mt-0.5 truncate">{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Referral card ── */}
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#1a2235] via-[#1e2a45] to-[#1a1f35]">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="p-4 space-y-3">
            {/* label + actions inline */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Gift size={13} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300">Your referral link</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/8 text-[11px] font-medium text-slate-300 hover:bg-white/12 hover:text-white transition-all">
                  {linkCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  {linkCopied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-[11px] font-medium text-blue-300 hover:bg-blue-500/25 transition-all">
                  <Share2 size={11} /> Share
                </button>
              </div>
            </div>

            {/* link */}
            <div className="flex items-center gap-2 bg-black/25 border border-white/6 rounded-xl px-3 py-2.5">
              <Link2 size={11} className="text-slate-600 shrink-0" />
              <span className="text-xs font-mono text-slate-400 truncate flex-1 select-all">{referralLink}</span>
            </div>

            {/* code */}
            <div className="flex items-center justify-between bg-black/25 border border-white/6 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest shrink-0">Code</span>
                <span className="text-sm font-mono font-bold text-white tracking-[0.15em] truncate">{merchant?.refer_id ?? '—'}</span>
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/6 border border-white/8 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-2">
                {codeCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {codeCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="rounded-2xl bg-white/3 border border-white/6 p-4">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { n: '01', title: 'Share your link', desc: 'Post your unique link on social media, YouTube, or your blog.', icon: <Share2 size={13} /> },
              { n: '02', title: 'They sign up',    desc: 'Anyone who registers via your link is permanently tagged as your referral.', icon: <Users size={13} /> },
              { n: '03', title: 'Earn monthly',    desc: `You get ${settings?.refer_commission ?? 10}% of their plan fee every billing cycle, for life.`, icon: <TrendingUp size={13} /> },
            ].map(s => (
              <div key={s.n} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <p className="text-[9px] font-bold text-blue-500/70 uppercase tracking-widest mb-0.5">Step {s.n}</p>
                  <h4 className="text-xs font-semibold text-slate-200 mb-0.5">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tables ── */}
        <div className="rounded-2xl bg-white/3 border border-white/6 overflow-hidden">
          <div className="flex border-b border-white/6 px-4 pt-2 gap-1">
            {(['referrals', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-widest border-b-2 -mb-px transition-all ${
                  activeTab === t ? 'text-blue-400 border-blue-500' : 'text-slate-600 border-transparent hover:text-slate-400'
                }`}>
                {t === 'referrals' ? `Referrals (${commissions.length})` : `Withdrawals (${withdrawals.length})`}
              </button>
            ))}
          </div>

          {settings && settings.withdrawal_fees > 0 && activeTab === 'history' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/6 border-b border-blue-500/10">
              <AlertCircle size={11} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-500/80">
                Withdrawal fee: <span className="font-semibold text-blue-400">{settings.withdrawal_fees}%</span> deducted from each request
              </p>
            </div>
          )}

          {activeTab === 'referrals' && (
            commissions.length === 0
              ? <EmptyState icon={<Users size={28} />} title="No referrals yet" sub="Share your link to get started" />
              : (
                <div className="w-full overflow-x-auto block pb-1">
                  <table className="w-full text-left whitespace-nowrap min-w-[540px]">
                    <thead>
                      <tr className="border-b border-white/4">
                        {['Merchant', 'Plan', 'Date', 'Commission', 'Status'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map(c => {
                        const st = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
                        return (
                          <tr key={c.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3 text-xs font-semibold text-slate-200">{c.merchant_name}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-medium bg-white/8 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">{c.plan_name}</span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-slate-500">
                              {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-emerald-400">+ ৳ {parseFloat(String(c.commission_amount)).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
                            </td>
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
                <div className="w-full overflow-x-auto block pb-1">
                  <table className="w-full text-left whitespace-nowrap min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/4">
                        {['Amount', 'Fee', 'Net', 'Method', 'Account', 'Date', 'Status'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map(w => {
                        const st = STATUS_CFG[w.status] ?? STATUS_CFG.pending;
                        const logo = paymentLogos.find(p => p.method_name === w.method);
                        let acc = w.account_details;
                        try { const p = JSON.parse(w.account_details); acc = p.number ?? acc; } catch {}
                        return (
                          <tr key={w.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3 text-xs font-semibold text-slate-200">৳ {parseFloat(String(w.amount)).toLocaleString()}</td>
                            <td className="px-4 py-3 text-[11px] text-red-400">−৳ {parseFloat(String(w.fee_amount || 0)).toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-emerald-400">৳ {parseFloat(String(w.net_amount || w.amount)).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5">
                                {logo ? <img src={logo.logo_url} alt={w.method} className="w-4 h-4 object-contain rounded" />
                                  : w.method === 'bank' ? <img src={BANK_LOGO} alt="bank" className="w-4 h-4 object-contain opacity-70" /> : null}
                                <span className="text-[11px] capitalize text-slate-400">{w.method}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{acc}</td>
                            <td className="px-4 py-3 text-[11px] text-slate-500">{new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
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

        {/* ── 2FA warning ── */}
        {settings?.withdraw_require_2fa && !hasTOTP && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/8 rounded-xl border border-amber-500/15">
            <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-300 mb-0.5">Authenticator required for withdrawals</p>
              <p className="text-[11px] text-amber-500/80">
                You haven't set up 2FA yet.{' '}
                <button onClick={() => setShowEnrollTotp(true)} className="underline text-amber-400 font-medium hover:no-underline">Set it up now →</button>
              </p>
            </div>
          </div>
        )}
      </div>

      {showShare && <ShareModal referralLink={referralLink} onClose={() => setShowShare(false)} />}

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