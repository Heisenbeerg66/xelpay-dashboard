'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Copy, Wallet, TrendingUp, ArrowUpRight, Loader2,
  Share2, Link2, Clock, AlertCircle, X, ShieldCheck, Gift,
  ArrowDownLeft, Check, QrCode, Eye, EyeOff, Smartphone,
  ChevronDown, Search, ShieldOff,
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
  'AB Bank', 'Agrani Bank', 'Bank Asia', 'BASIC Bank', 'BRAC Bank',
  'City Bank', 'Dhaka Bank', 'Dutch-Bangla Bank', 'Eastern Bank',
  'IFIC Bank', 'Islami Bank Bangladesh', 'Jamuna Bank', 'Janata Bank',
  'Meghna Bank', 'Mercantile Bank', 'Midland Bank', 'Modhumoti Bank',
  'Mutual Trust Bank', 'NCC Bank', 'NRB Bank', 'One Bank', 'Padma Bank',
  'Premier Bank', 'Prime Bank', 'Pubali Bank', 'Rupali Bank', 'Shimanto Bank',
  'Sonali Bank', 'South Bangla Bank', 'Southeast Bank', 'Standard Bank',
  'UCB', 'Union Bank', 'United Commercial Bank', 'Uttara Bank',
];

const ACCOUNT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'agent', label: 'Agent' },
  { value: 'merchant', label: 'Merchant' },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  approved: { label: 'Approved', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  paid: { label: 'Paid', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  processing: { label: 'Processing', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
};

// ─── Helper Components (Ultra-Minimal Premium) ────────────────────────────

function BankPicker({ value, onChange, inputCls }: { value: string; onChange: (v: string) => void; inputCls: string }) {
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
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>{value || 'Select your bank'}</span>
        <ChevronDown size={13} className="text-slate-400 dark:text-slate-500 shrink-0 transition-transform" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <Search size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search bank..." className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 py-1" />
            {query && <button type="button" onClick={() => setQuery('')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><X size={11} /></button>}
          </div>
          <div className="max-h-44 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No banks found</p>
            ) : filtered.map(bank => (
              <button key={bank} type="button" onClick={() => { onChange(bank); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between
                  ${value === bank ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                {bank}
                {value === bank && <Check size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShareModal({ referralLink, onClose }: { referralLink: string; onClose: () => void }) {
  const shareText = 'Join XelPay — fastest payment gateway for Bangladeshi businesses. Use my referral link:';
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md w-full max-w-[95vw] sm:max-w-md rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/5 dark:shadow-black/40 mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Share referral link</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose a platform</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:rotate-90 transition-all">
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 mb-4">
          <Link2 size={12} className="text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1">{referralLink}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SHARE_PLATFORMS.map(p => (
            <button key={p.id} onClick={() => window.open(p.url(referralLink, shareText), '_blank', 'noopener,noreferrer')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: p.color + '20' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={p.svgPath} />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight text-center">{p.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Link copied!'); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <Copy size={13} /> Copy link
        </button>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md w-full max-w-[95vw] sm:max-w-md rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/5 dark:shadow-black/40 mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-600 dark:text-blue-400" /> Setup 2FA Authenticator
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:rotate-90 transition-all"><X size={14} /></button>
        </div>

        {step === 'info' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-800">
              <Smartphone size={26} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">2-factor auth required</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Withdrawals need a one-time code from an authenticator app.</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Install <b className="text-slate-800 dark:text-slate-300">Google Authenticator</b> or <b className="text-slate-800 dark:text-slate-300">Authy</b> first.</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Lost your authenticator device? Contact support to reset your 2FA.</p>
            </div>
            <button onClick={startEnroll} disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><QrCode size={14} /> Get QR code</>}
            </button>
          </div>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">Scan this QR code with your authenticator app.</p>
            <div className="bg-white p-3 rounded-xl inline-block">
              <img src={qrUri} alt="TOTP QR" className="w-44 h-44 mx-auto" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Manual secret</p>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <code className={`text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 break-all ${!showSec ? 'blur-sm select-none' : ''}`}>{secret}</code>
                <button onClick={() => setShowSec(s => !s)} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">{showSec ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); }} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"><Copy size={13} /></button>
              </div>
            </div>
            <button onClick={() => setStep('verify')} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">I've scanned it →</button>
          </div>
        )}

        {step === 'verify' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-800">
              <ShieldCheck size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Enter the 6-digit code from your authenticator app.</p>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-[0.4em] py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all" />
            <button onClick={verifyEnroll} disabled={loading || code.length < 6}
              className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><Check size={14} /> Verify & activate</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeeBreakdown({ amtNum, feeAmt, netAmt, feePercent }: {
  amtNum: number; feeAmt: number; netAmt: number; feePercent: number;
}) {
  if (amtNum <= 0 || feePercent <= 0) return null;
  return (
    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Requested</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">৳ {amtNum.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Fee ({feePercent}%)</span>
        <span className="text-red-600 dark:text-red-400 font-medium">− ৳ {feeAmt.toLocaleString()}</span>
      </div>
      <div className="h-px bg-slate-200 dark:bg-slate-700" />
      <div className="flex justify-between text-xs">
        <span className="text-slate-700 dark:text-slate-300 font-semibold">You'll receive</span>
        <span className="text-green-600 dark:text-green-400 font-bold">৳ {netAmt.toLocaleString()}</span>
      </div>
    </div>
  );
}

function WithdrawModal({
  wallet, settings, merchantId, hasTOTP, onEnrollTOTP, onClose, onSuccess, paymentLogos,
}: {
  wallet: AffiliateWallet; settings: SiteSettings; merchantId: string;
  hasTOTP: boolean; onEnrollTOTP: () => void; onClose: () => void; onSuccess: () => void;
  paymentLogos: PaymentLogo[];
}) {
  const [method, setMethod] = useState('');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState('personal');
  const [bankName, setBankName] = useState('');
  const [bankDetails, setBankDetails] = useState({ name: '', branch: '', routing: '' });
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'form' | 'totp'>('form');
  const [loading, setLoading] = useState(false);

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
    if (settings.withdraw_open_days.length > 0 && !settings.withdraw_open_days.includes(new Date().getDay())) return false;
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
      merchant_id: merchantId,
      amount: amtNum,
      fee_amount: feeAmt,
      net_amount: netAmt,
      method,
      account_details: buildAccountDetails(),
      account_type: isMfs ? accountType : null,
      bank_name: isBank ? bankName : null,
      status: 'pending',
      otp_verified: true,
      is_active: true,
    });
    if (error) {
      toast.error('Failed: ' + error.message);
      console.error('Withdrawal insert error:', error);
      setLoading(false);
      return;
    }
    toast.success('Withdrawal request submitted!');
    setLoading(false);
    onSuccess(); // this will call fetchAll and refresh the UI
  };

  const canProceed = settings.withdraw_enabled && todayOk;
  const inputCls = "w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500 dark:placeholder-slate-400";
  const labelCls = "text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md w-full sm:w-[460px] sm:max-w-[95vw] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet size={14} className="text-blue-600 dark:text-blue-400" />
              {step === 'form' ? 'Request withdrawal' : 'Verify identity'}
            </h3>
            {step === 'form' && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Available: <span className="text-green-600 dark:text-green-400 font-semibold">৳ {wallet.withdrawable_balance.toLocaleString()}</span>
                {settings.withdrawal_fees > 0 && <span className="ml-1.5 text-slate-400 dark:text-slate-500">· {settings.withdrawal_fees}% fee</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:rotate-90 transition-all shrink-0">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {!settings.withdraw_enabled && (
            <div className="flex gap-2.5 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <AlertCircle size={13} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Withdrawals are currently paused.</p>
            </div>
          )}
          {settings.withdraw_enabled && !todayOk && (
            <div className="flex gap-2.5 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Clock size={13} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Withdrawals are not open today.</p>
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
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/30'}`}>
                          {logoUrl ? <img src={logoUrl} alt={m} className="w-7 h-7 object-contain rounded-lg shrink-0" />
                            : <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">{m[0].toUpperCase()}</div>}
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold capitalize truncate ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{m}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Min ৳{settings.withdraw_min_mfs}</p>
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
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${method === 'bank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/30'}`}>
                    <img src={BANK_LOGO} alt="bank" className="w-7 h-7 object-contain shrink-0" />
                    <div>
                      <p className={`text-xs font-semibold ${method === 'bank' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Bank transfer</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Min ৳{settings.withdraw_min_bank}</p>
                    </div>
                  </button>
                </div>
              )}

              {method && (
                <>
                  <div>
                    <label className={labelCls}>Amount (BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">৳</span>
                      <input type="number" min={minAmt} max={wallet.withdrawable_balance} step="1" value={amount}
                        onChange={e => setAmount(e.target.value)} placeholder={`Min ৳${minAmt}`}
                        className="w-full pl-8 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500 dark:placeholder-slate-400" />
                    </div>
                    <FeeBreakdown amtNum={amtNum} feeAmt={feeAmt} netAmt={netAmt} feePercent={settings.withdrawal_fees} />
                    {amount && !amtValid && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">Must be ৳{minAmt}–৳{wallet.withdrawable_balance.toFixed(0)}</p>}
                  </div>

                  {isMfs && (
                    <>
                      <div>
                        <label className={labelCls}>Account type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ACCOUNT_TYPES.map(at => (
                            <button type="button" key={at.value} onClick={() => setAccountType(at.value)}
                              className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${accountType === at.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
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

                  <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock size={12} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">Processing: <span className="text-slate-800 dark:text-slate-200 font-medium">{settings.withdraw_process_time}</span></p>
                  </div>

                  {settings.withdraw_require_2fa && (
                    <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">Authenticator code required on next step.</p>
                    </div>
                  )}
                </>
              )}
            </form>
          )}

          {canProceed && step === 'totp' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-800">
                <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Verify identity</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">Confirm withdrawal of <span className="text-slate-900 dark:text-white font-semibold">৳ {amtNum.toLocaleString()}</span>.</p>
                {settings.withdrawal_fees > 0 && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">After fee → <span className="text-green-600 dark:text-green-400 font-semibold">৳ {netAmt.toLocaleString()}</span></p>}
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Lost your authenticator device? Contact support to reset your 2FA.</p>
              </div>
              <input type="text" inputMode="numeric" maxLength={6} value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.35em] py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-900 dark:text-white transition-all" />
            </div>
          )}
        </div>

        {canProceed && (
          <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
            {step === 'form' && method && (
              <button onClick={handleFormSubmit as any} disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowUpRight size={14} /> {settings.withdraw_require_2fa ? 'Next: verify →' : 'Submit request'}</>}
              </button>
            )}
            {step === 'totp' && (
              <>
                <button onClick={() => doSubmit(totpCode)} disabled={loading || totpCode.length < 6}
                  className="w-full py-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Confirm withdrawal</>}
                </button>
                <button onClick={() => setStep('form')} className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1">← Back</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="text-slate-300 dark:text-slate-600">{icon}</div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AffiliateProgram() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [wallet, setWallet] = useState<AffiliateWallet | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [paymentLogos, setPaymentLogos] = useState<PaymentLogo[]>([]);
  const [hasTOTP, setHasTOTP] = useState(false);
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'referrals' | 'history'>('referrals');
  const [showShare, setShowShare] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEnrollTotp, setShowEnrollTotp] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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

  // Pending withdrawals (pending + processing)
  const pendingTotal = withdrawals
    .filter(w => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

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
        .in('key_name', ['refer_commission', 'withdraw_min_mfs', 'withdraw_min_bank', 'withdraw_enabled',
          'withdraw_methods_enabled', 'withdraw_process_time', 'withdraw_open_days', 'withdraw_open_dates',
          'withdraw_require_2fa', 'withdrawal_fees']),
      supabase.from('payment_logos').select('method_name,logo_url'),
      supabase.auth.mfa.listFactors(),
    ]);

    if (m) setMerchant(m as MerchantInfo);
    if (w) setWallet(w as AffiliateWallet);
    if (logos) setPaymentLogos(logos as PaymentLogo[]);

    if (c) {
      setCommissions(c.map((r: any) => ({
        id: r.id,
        referred_merchant_id: r.referred_merchant_id,
        commission_amount: r.commission_amount,
        status: r.status,
        created_at: r.created_at,
        merchant_name: r.merchants?.name ?? 'Unknown',
        plan_name: r.plans?.name ?? '—',
      })));
    }

    if (wd) setWithdrawals(wd as Withdrawal[]);

    if (ss) {
      const s: Record<string, string> = {};
      ss.forEach((r: any) => { s[r.key_name] = r.value; });
      setSettings({
        refer_commission: parseFloat(s.refer_commission ?? '10'),
        withdraw_min_mfs: parseFloat(s.withdraw_min_mfs ?? '200'),
        withdraw_min_bank: parseFloat(s.withdraw_min_bank ?? '1000'),
        withdraw_enabled: (s.withdraw_enabled ?? 'true') === 'true',
        withdraw_methods_enabled: (s.withdraw_methods_enabled ?? 'bkash,nagad,rocket,bank').split(',').map(x => x.trim()).filter(Boolean),
        withdraw_process_time: s.withdraw_process_time ?? '2–3 business days',
        withdraw_open_days: s.withdraw_open_days ? s.withdraw_open_days.split(',').map(Number).filter(Boolean) : [],
        withdraw_open_dates: s.withdraw_open_dates ? s.withdraw_open_dates.split(',').map(Number).filter(Boolean) : [],
        withdraw_require_2fa: (s.withdraw_require_2fa ?? 'true') === 'true',
        withdrawal_fees: parseFloat(s.withdrawal_fees ?? '0'),
      });
    }

    // Handle 2FA factor
    const totpFactors = mfa?.data?.totp ?? [];
    const verifiedFactor = totpFactors.find((f: any) => f.status === 'verified');
    setHasTOTP(!!verifiedFactor);
    setActiveFactorId(verifiedFactor ? verifiedFactor.id : null);
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
      try {
        await navigator.share({ title: 'XelPay Referral', text: 'Join XelPay — fastest payment gateway for Bangladeshi businesses.', url: referralLink });
        return;
      } catch { /* fall through */ }
    }
    setShowShare(true);
  };

  const handleDisable2FA = async () => {
    if (!activeFactorId) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: activeFactorId });
    if (error) {
      toast.error('Failed to disable 2FA: ' + error.message);
      return;
    }
    toast.success('2FA disabled successfully');
    await fetchAll(); // refresh state
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <Loader2 size={18} className="animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading affiliate dashboard…</p>
      </div>
    );
  }

  const walletData: AffiliateWallet = wallet ?? { total_earned: 0, withdrawable_balance: 0, total_withdrawn: 0, last_withdrawn_at: null };

  return (
    <>
      <div className="w-full space-y-6 md:space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header with 2FA manage button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Affiliate Program</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Earn <span className="text-blue-600 dark:text-blue-400 font-semibold">{settings?.refer_commission ?? 10}% lifetime commission</span> per referral
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasTOTP ? (
              <button
                onClick={handleDisable2FA}
                className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <ShieldOff size={16} /> Disable 2FA
              </button>
            ) : (
              <button
                onClick={() => setShowEnrollTotp(true)}
                className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <ShieldCheck size={16} /> Enable 2FA
              </button>
            )}
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={!settings?.withdraw_enabled || walletData.withdrawable_balance <= 0}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shrink-0"
            >
              <Wallet size={18} /> Withdraw
            </button>
          </div>
        </div>

        {/* Stats Grid (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Total earned', value: `৳ ${walletData.total_earned.toLocaleString()}`, icon: <TrendingUp size={20} />, accent: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Available', value: `৳ ${walletData.withdrawable_balance.toLocaleString()}`, icon: <Wallet size={20} />, accent: 'text-blue-600 dark:text-blue-400' },
            { label: 'Pending withdrawals', value: `৳ ${pendingTotal.toLocaleString()}`, icon: <Clock size={20} />, accent: 'text-amber-600 dark:text-amber-400' },
            { label: 'Total withdrawn', value: `৳ ${walletData.total_withdrawn.toLocaleString()}`, icon: <ArrowDownLeft size={20} />, accent: 'text-slate-700 dark:text-slate-300' },
          ].map(card => (
            <div key={card.label} className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                {card.icon}
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</h3>
              <div className={`text-2xl sm:text-3xl font-black tracking-tighter ${card.accent}`}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Referral card */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Your referral link</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copyLink} className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  {linkCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {linkCopied ? 'Copied' : 'Copy Link'}
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
              <Link2 size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate select-all">{referralLink}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Referral Code</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider">{merchant?.refer_id ?? '—'}</span>
              </div>
              <button onClick={copyCode} className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                {codeCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {codeCopied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 sm:p-6">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">How it works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Share your link', desc: 'Post your unique link on social media, YouTube, or your blog.', icon: <Share2 size={16} /> },
              { step: '02', title: 'They sign up', desc: 'Anyone who registers via your link is permanently tagged as your referral.', icon: <Users size={16} /> },
              { step: '03', title: 'Earn monthly', desc: `You get ${settings?.refer_commission ?? 10}% of their plan fee every billing cycle, for life.`, icon: <TrendingUp size={16} /> },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">{s.icon}</div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Step {s.step}</p>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs & Tables */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 px-5 pt-2">
            <div className="flex gap-4">
              {(['referrals', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'referrals' ? `Referrals (${commissions.length})` : `Withdrawals (${withdrawals.length})`}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'referrals' && (
            commissions.length === 0 ? (
              <EmptyState icon={<Users size={28} />} title="No referrals yet" sub="Share your link to get started" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[560px]">
                  <thead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Merchant</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Commission</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {commissions.map(c => {
                      const st = STATUS_CFG[c.status] ?? STATUS_CFG.pending;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{c.merchant_name}</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md uppercase">{c.plan_name}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-5 py-3 font-bold text-emerald-600 dark:text-emerald-400">+ ৳ {c.commission_amount.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
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
            withdrawals.length === 0 ? (
              <EmptyState icon={<Wallet size={28} />} title="No withdrawals yet" sub="Your withdrawal history will appear here" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[680px]">
                  <thead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Fee</th>
                      <th className="px-5 py-3">Net</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Account</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {withdrawals.map(w => {
                      const st = STATUS_CFG[w.status] ?? STATUS_CFG.pending;
                      const logo = paymentLogos.find(p => p.method_name === w.method);
                      let acc = w.account_details;
                      try { const p = JSON.parse(w.account_details); acc = p.number ?? acc; } catch {}
                      return (
                        <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">৳ {w.amount.toLocaleString()}</td>
                          <td className="px-5 py-3 text-red-600 dark:text-red-400">−৳ {(w.fee_amount || 0).toLocaleString()}</td>
                          <td className="px-5 py-3 font-bold text-emerald-600 dark:text-emerald-400">৳ {(w.net_amount || w.amount).toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {logo ? <img src={logo.logo_url} alt={w.method} className="w-4 h-4 object-contain rounded" /> : w.method === 'bank' && <img src={BANK_LOGO} alt="bank" className="w-4 h-4 opacity-70" />}
                              <span className="text-xs capitalize text-slate-700 dark:text-slate-300">{w.method}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs font-mono text-slate-500 dark:text-slate-400">{acc}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.color}`}>{st.label}</span>
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

        {/* 2FA warning only if needed and not enrolled */}
        {settings?.withdraw_require_2fa && !hasTOTP && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Authenticator required for withdrawals</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                You haven't set up 2FA yet.{' '}
                <button onClick={() => setShowEnrollTotp(true)} className="underline font-medium hover:no-underline">Set it up now →</button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showShare && <ShareModal referralLink={referralLink} onClose={() => setShowShare(false)} />}
      {showWithdraw && settings && merchant && (
        <WithdrawModal
          wallet={walletData}
          settings={settings}
          merchantId={merchant.id}
          hasTOTP={hasTOTP}
          paymentLogos={paymentLogos}
          onEnrollTOTP={() => { setShowWithdraw(false); setShowEnrollTotp(true); }}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { setShowWithdraw(false); fetchAll(); }}
        />
      )}
      {showEnrollTotp && (
        <TotpEnrollModal
          onDone={() => { setShowEnrollTotp(false); fetchAll(); toast.success('2FA enabled!'); }}
          onClose={() => setShowEnrollTotp(false)}
        />
      )}
    </>
  );
}

// Share platforms definitions (moved outside for clarity)
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