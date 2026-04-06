'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import {
  Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Send, ArrowLeft,
  Moon, Sun, Menu, X, Home, HelpCircle, Sparkles, Clock,
  ShieldCheck, RefreshCw, UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';
import { syncEmailVerified } from '@/lib/auth';
import { useTheme } from 'next-themes';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

// ─── SUSPENDED MODAL ─────────────────────────────────────────────────────────
const SuspendedModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Suspended</h3>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">
          Your account has been suspended due to a policy violation or review.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => telegramLink && telegramLink !== '#' && window.open(telegramLink, '_blank', 'noopener,noreferrer')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Send size={15} /> Contact Support
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PENDING MODAL ────────────────────────────────────────────────────────────
const PendingModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={28} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Pending</h3>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">
          Your account is currently under review. We will notify you once approved.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => telegramLink && telegramLink !== '#' && window.open(telegramLink, '_blank', 'noopener,noreferrer')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Send size={15} /> Contact Support
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── NO ACCOUNT MODAL (Google OAuth — no merchant record) ────────────────────
const NoAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Account Found</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-7 leading-relaxed">
          We couldn't find a XelPay account linked to this Google account.
          Please create an account or try a different login method.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/signup"
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            <UserPlus size={15} /> Create An Account
          </Link>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DEMO BANNER ──────────────────────────────────────────────────────────────
const DemoBanner = () => (
  <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-950 px-4 py-2 text-center flex items-center justify-center gap-2">
    <Sparkles size={13} className="shrink-0" />
    <span className="text-[10px] font-black uppercase tracking-widest">
      Demo Mode Active — Credentials pre-filled for exploration
    </span>
    <Sparkles size={13} className="shrink-0" />
  </div>
);

// ─── MAIN LOGIN CONTENT ───────────────────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const nextUrl = searchParams.get('next') || '/dashboard';
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  const [telegramLink, setTelegramLink] = useState('#');

  const [otpLoginEnabled, setOtpLoginEnabled] = useState(false);
  const [otpSettingLoaded, setOtpSettingLoaded] = useState(false);

  // OTP login flow state
  const [viewState, setViewState] = useState<'form' | 'otp_input'>('form');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) { setLoading(false); setGoogleLoading(false); }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // OTP login setting load
  useEffect(() => {
    const loadOtpSetting = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value, is_active')
          .eq('key_name', 'otp_login')
          .maybeSingle();
        setOtpLoginEnabled(data?.is_active === true);
      } catch {
        setOtpLoginEnabled(false);
      } finally {
        setOtpSettingLoaded(true);
      }
    };
    loadOtpSetting();
  }, []);

  const fetchTelegramLink = async () => {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key_name', 'support_telegram')
      .maybeSingle();
    if (settings?.value) setTelegramLink(settings.value);
  };

  // ── error param থেকে modal দেখাও ──────────────────────────────────────────
  const errorParam = searchParams.get('error');
  useEffect(() => {
    if (!errorParam) return;
    if (errorParam === 'no_account') {
      setShowNoAccountModal(true);
    } else if (errorParam === 'suspended' || errorParam === 'ban') {
      fetchTelegramLink().then(() => setShowSuspendedModal(true));
    } else if (errorParam === 'pending') {
      fetchTelegramLink().then(() => setShowPendingModal(true));
    } else if (errorParam === 'exchange_failed') {
      toast.error('Login failed. Please try again.');
    } else if (errorParam === 'db_error') {
      toast.error('Something went wrong. Please try again.');
    } else if (errorParam === 'invalid_tx') {
      toast.error('Security check failed. Please try again.');
    }
  }, [errorParam]);

  // Demo mode
  useEffect(() => {
    if (mode === 'demo') {
      sessionStorage.setItem('xelpay_demo_mode', 'true');
      (async () => {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key_name', 'demo_credentials')
            .maybeSingle();

          if (data?.value) {
            const parsed = JSON.parse(data.value);
            if (parsed?.email) setEmail(parsed.email);
            if (parsed?.password) setPassword(parsed.password);
            toast.success('Demo credentials loaded! Explore freely.', { icon: '✨', duration: 4000 });
          } else {
            toast.error('Demo credentials not configured.', { duration: 4000 });
          }
        } catch {
          toast.error('Failed to load demo credentials.', { duration: 4000 });
        }
      })();
    } else {
      sessionStorage.removeItem('xelpay_demo_mode');
    }
  }, [mode]);

  useEffect(() => {
    if (otpCooldown > 0) {
      const t = setInterval(() => setOtpCooldown(c => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [otpCooldown]);

  const clearForgotSession = () => {
    sessionStorage.removeItem('xelpay_fp_step');
    sessionStorage.removeItem('xelpay_fp_email');
    sessionStorage.removeItem('xelpay_fp_resend');
    sessionStorage.removeItem('xelpay_fp_cooldown_end');
  };

  // ── Merchant check & redirect ─────────────────────────────────────────────
  const checkMerchantAndRedirect = async (userId: string, emailConfirmedAt: string | null) => {
    try {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('status, is_demo')
        .eq('id', userId)
        .single();

      if (mode === 'demo' && merchant?.is_demo !== true) {
        await supabase.auth.signOut();
        toast.error('Not a demo account.');
        setLoading(false);
        return;
      }

      const mStatus = merchant?.status?.toLowerCase();

      if (['suspended', 'ban', 'banned'].includes(mStatus)) {
        await supabase.auth.signOut();
        await fetchTelegramLink();
        setShowSuspendedModal(true);
        setLoading(false);
        return;
      }
      if (mStatus === 'pending') {
        await supabase.auth.signOut();
        await fetchTelegramLink();
        setShowPendingModal(true);
        setLoading(false);
        return;
      }

      if (emailConfirmedAt) {
        try { await syncEmailVerified(userId); } catch (_) {}
      }
      router.push(nextUrl);
    } catch {
      router.push(nextUrl);
    }
  };

  // ── Password Login ────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error('Please complete the reCAPTCHA.'); return; }
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        toast.error('Wrong email or password.');
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      return;
    }

    if (authData.user) {
      await checkMerchantAndRedirect(authData.user.id, authData.user.email_confirmed_at);
    }
  };

  // ── OTP Step 1: Send ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error('Please complete the reCAPTCHA.'); return; }
    if (mode === 'demo') { toast.error('OTP login is disabled in demo mode.'); return; }
    setLoading(true);

    const { data: merchant } = await supabase
      .from('merchants')
      .select('status, is_email_verified')
      .eq('email', email)
      .maybeSingle();

    if (!merchant) {
      toast.error('No account found with this email address.');
      setLoading(false); recaptchaRef.current?.reset(); setCaptchaToken(null); return;
    }

    const mStatus = merchant.status?.toLowerCase();
    if (['suspended', 'ban', 'banned'].includes(mStatus)) {
      await fetchTelegramLink(); setShowSuspendedModal(true); setLoading(false); return;
    }
    if (mStatus === 'pending') {
      await fetchTelegramLink(); setShowPendingModal(true); setLoading(false); return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false); recaptchaRef.current?.reset(); setCaptchaToken(null); return;
    }

    setOtpEmail(email);
    setOtp('');
    setOtpCooldown(60);
    setViewState('otp_input');
    toast.success('OTP sent! Check your inbox.');
    recaptchaRef.current?.reset(); setCaptchaToken(null); setLoading(false);
  };

  // ── OTP Step 2: Verify ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      toast.error('Invalid or expired OTP. Please try again.');
      setLoading(false); return;
    }

    if (verifyData.user) {
      await checkMerchantAndRedirect(verifyData.user.id, verifyData.user.email_confirmed_at);
    }
  };

  // ── OTP Resend ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: { shouldCreateUser: false },
    });
    if (error) { toast.error('Resend failed: ' + error.message); }
    else { toast.success('New OTP sent! Check your inbox.'); setOtpCooldown(60); setOtp(''); }
    setLoading(false);
  };

  // ── OTP digit helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = otp.split('');
    newOtp[index] = digit;
    const joined = newOtp.join('');
    setOtp(joined);
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted); otpInputRefs.current[5]?.focus(); }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (mode === 'demo') { toast.error('Google login disabled in demo mode.'); return; }
    setGoogleLoading(true);

    const txId =
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).substring(2, 15)) + Date.now().toString(36);

    sessionStorage.setItem('auth_tx', txId);
    localStorage.setItem('oauth_source', 'login');

    const redirectTo = `${window.location.origin}/auth/callback?tx=${txId}&next=${encodeURIComponent(nextUrl)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  const inputClass = 'w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400';
  const labelClass = 'text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-0.5 mb-1 block';
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans transition-colors duration-300 flex flex-col">
      <Toaster position="top-center" richColors />

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="hidden md:flex items-center h-16 px-8 justify-between max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Home</Link>
            <Link href="/info/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Support</Link>
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex md:hidden items-center h-16 px-4 justify-between max-w-7xl mx-auto w-full">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center justify-end flex-1">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 flex flex-col gap-1 max-w-7xl mx-auto w-full">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                <Home size={15} /> Home
              </Link>
              <Link href="/info/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                <HelpCircle size={15} /> Support
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md md:max-w-2xl bg-white dark:bg-[#111827] rounded-2xl md:rounded-3xl shadow-sm md:shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          {mode === 'demo' && <DemoBanner />}

          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Left Sidebar */}
            <div className="hidden md:flex flex-col justify-between bg-blue-600 rounded-l-3xl p-10 min-w-[200px] text-white">
              <Link href="/" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                <ArrowLeft size={14} /> Home
              </Link>
              <div className="flex flex-col items-center">
                <Link href="/" className="inline-flex items-center gap-1 mb-5">
                  <span className="text-4xl font-black text-white tracking-tighter">X</span>
                  <span className="text-3xl font-semibold text-white tracking-tight -ml-0.5 opacity-90">elPay</span>
                </Link>
                <p className="text-sm opacity-80 text-center leading-relaxed">Secure merchant payment automation</p>
                <div className="mt-7 flex flex-col gap-3 w-full">
                  {['99.9% Uptime', 'Bank-grade security', '24/7 support'].map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs opacity-70">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-300" /> {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-white/40 text-center">© {new Date().getFullYear()} XelPay</div>
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">

              <div className="md:hidden flex justify-center mb-6">
                <Link href="/" className="inline-flex items-center gap-1">
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">X</span>
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
                </Link>
              </div>

              {/* ── OTP INPUT VIEW ── */}
              {viewState === 'otp_input' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 text-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <ShieldCheck size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enter Your OTP</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-7 leading-relaxed">
                    We sent a 6-digit code to{' '}
                    <b className="text-slate-700 dark:text-slate-300">{otpEmail}</b>.
                  </p>

                  <div className="flex gap-2.5 justify-center mb-7" onPaste={handleOtpPaste}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={el => { otpInputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-13 text-center text-lg font-bold bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white py-3"
                      />
                    ))}
                  </div>

                  <button
                    disabled={loading || otp.length < 6}
                    onClick={handleVerifyOtp}
                    className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 mb-3"
                  >
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                      : <><ShieldCheck size={16} /> Sign In</>
                    }
                  </button>

                  <button
                    disabled={otpCooldown > 0 || loading}
                    onClick={handleResendOtp}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50 mb-5"
                  >
                    <RefreshCw size={13} />
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                  </button>

                  <button
                    onClick={() => { setViewState('form'); setOtp(''); }}
                    className="flex items-center justify-center gap-1.5 mx-auto text-xs text-slate-400 hover:text-blue-600 uppercase tracking-widest font-bold transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </div>

              /* ── MAIN FORM ── */
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-5 text-center md:text-left">
                    Welcome Back
                  </h2>

                  {otpSettingLoaded && otpLoginEnabled && (
                    <div className="flex bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('password')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        With Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('otp')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        <Sparkles size={13} /> With OTP
                      </button>
                    </div>
                  )}

                  {(!otpLoginEnabled || loginMethod === 'password') ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input required type="email" name="email" autoComplete="username" placeholder="admin@xelpay.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Password <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input required type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} pr-11`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
                        </label>
                        <Link href={`/forgot-password${mode === 'demo' ? '?mode=demo' : ''}`} onClick={clearForgotSession} className="text-xs text-blue-600 hover:underline">
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="flex justify-center pt-2">
                        {mounted && (
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={RECAPTCHA_SITE_KEY}
                            onChange={token => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                            theme={isDark ? 'dark' : 'light'}
                          />
                        )}
                      </div>
                      <button disabled={loading} type="submit" className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-blue-600/25 h-[50px]">
                        {loading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <>Sign In <LogIn size={15} className="ml-1.5" /></>
                        }
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        Enter your email and we'll send you a 6-digit OTP to log in instantly — no password needed.
                      </p>
                      <div>
                        <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input required type="email" name="email" autoComplete="username" placeholder="admin@xelpay.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <div className="flex justify-center pt-2">
                        {mounted && (
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={RECAPTCHA_SITE_KEY}
                            onChange={token => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                            theme={isDark ? 'dark' : 'light'}
                          />
                        )}
                      </div>
                      <button disabled={loading} type="submit" className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-blue-600/25 h-[50px]">
                        {loading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <>Send OTP <Send size={15} className="ml-1.5" /></>
                        }
                      </button>
                    </form>
                  )}

                  {mode !== 'demo' && (
                    <>
                      <div className="relative my-3 text-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <span className="relative px-4 bg-white dark:bg-[#111827] text-[10px] text-slate-400 uppercase tracking-widest">Or</span>
                      </div>
                      <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 py-3.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        {googleLoading
                          ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                          : <><img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" /> Sign in with Google</>
                        }
                      </button>
                      <p className="mt-4 text-center text-slate-400 text-sm">
                        New to XelPay?{' '}
                        <Link href="/signup" onClick={clearForgotSession} className="text-blue-600 font-medium hover:underline">
                          Create Account
                        </Link>
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <SuspendedModal isOpen={showSuspendedModal} telegramLink={telegramLink} onClose={() => setShowSuspendedModal(false)} />
      <PendingModal isOpen={showPendingModal} telegramLink={telegramLink} onClose={() => setShowPendingModal(false)} />
      <NoAccountModal isOpen={showNoAccountModal} onClose={() => setShowNoAccountModal(false)} />
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}