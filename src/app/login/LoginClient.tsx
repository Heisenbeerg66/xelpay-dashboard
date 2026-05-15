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
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
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
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── NO ACCOUNT MODAL ────────────────────────────────────────────────────────
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
          <Link href="/signup" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <UserPlus size={15} /> Create An Account
          </Link>
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
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

  const [viewState, setViewState] = useState<'form' | 'otp_input'>('form');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) { setLoading(false); setGoogleLoading(false); }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

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

  useEffect(() => {
    if (viewState === 'otp_input' && otp.length === 6 && !loading && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      handleVerifyOtp();
    }
    if (otp.length < 6) isVerifyingRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, viewState]);

  const fetchTelegramLink = async () => {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key_name', 'support_telegram')
      .maybeSingle();
    if (settings?.value) setTelegramLink(settings.value);
  };

  const errorParam = searchParams.get('error');
  useEffect(() => {
    if (!errorParam) return;
    if (errorParam === 'no_account') setShowNoAccountModal(true);
    else if (errorParam === 'suspended' || errorParam === 'ban') fetchTelegramLink().then(() => setShowSuspendedModal(true));
    else if (errorParam === 'pending') fetchTelegramLink().then(() => setShowPendingModal(true));
    else if (errorParam === 'exchange_failed') toast.error('Login failed. Please try again.');
    else if (errorParam === 'db_error') toast.error('Something went wrong. Please try again.');
    else if (errorParam === 'invalid_tx') toast.error('Security check failed. Please try again.');
  }, [errorParam]);

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

  // ✅ FIX: Login-এর পর active_business_id resolve করে localStorage-এ set করো
  // আগের code-এ merchant select-এ is_team_member ছিল না তাই team member
  // identify হচ্ছিল না এবং business পাচ্ছিল না
  const setActiveBusinessForUser = async (userId: string, merchantData: {
    active_business_id?: string | null;
    is_team_member?: boolean | null;
  }) => {
    try {
      // ── Case 1: active_business_id আগে থেকে DB-তে আছে ─────────────────
      if (merchantData.active_business_id) {
        localStorage.setItem('active_business_id', merchantData.active_business_id);
        return;
      }

      // ── Case 2: Team member — business_team_members থেকে নিয়ে নাও ────
      if (merchantData.is_team_member) {
        const { data: membership } = await supabase
          .from('business_team_members')
          .select('business_id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (membership?.business_id) {
          localStorage.setItem('active_business_id', membership.business_id);
          // ✅ DB-তেও persist করো যেন পরের login-এ আর query না লাগে
          await supabase
            .from('merchants')
            .update({ active_business_id: membership.business_id })
            .eq('id', userId);
        }
        return;
      }

      // ── Case 3: Regular merchant — নিজের first business ─────────────────
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('merchant_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (business?.id) {
        localStorage.setItem('active_business_id', business.id);
        await supabase
          .from('merchants')
          .update({ active_business_id: business.id })
          .eq('id', userId);
      }
    } catch (err) {
      console.error('[login] setActiveBusinessForUser error:', err);
      // Non-critical — dashboard নিজে handle করবে
    }
  };

  // ── Merchant check & redirect ─────────────────────────────────────────────
  const checkMerchantAndRedirect = async (userId: string, emailConfirmedAt: string | null) => {
    try {
      // ✅ FIX: status + is_demo + is_team_member + active_business_id — সব একসাথে select
      // আগে শুধু status ও is_demo ছিল, তাই setActiveBusinessForUser কাজ করছিল না
      const { data: merchant } = await supabase
        .from('merchants')
        .select('status, is_demo, is_team_member, active_business_id')
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

      // ✅ redirect করার আগে active_business_id localStorage-এ set করো
      // এতে Sidebar ঠিকমতো business load করতে পারবে — loading-এ আটকাবে না
      await setActiveBusinessForUser(userId, {
        active_business_id: merchant?.active_business_id,
        is_team_member: merchant?.is_team_member,
      });

      // Full page reload — middleware session cookie ঠিকমতো set হওয়ার জন্য
      window.location.href = nextUrl;
    } catch {
      window.location.href = nextUrl;
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
      isVerifyingRef.current = false;
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

      {/* DEMO BANNER */}
      {mode === 'demo' && <DemoBanner />}

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
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center h-16 px-4 justify-between max-w-7xl mx-auto w-full">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 flex flex-col gap-1 max-w-7xl mx-auto w-full">
              <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Home</Link>
              <Link href="/info/contact" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Support</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

            {viewState === 'otp_input' ? (
              /* OTP INPUT VIEW */
              <div className="p-8 md:p-10">
                <button
                  onClick={() => { setViewState('form'); setOtp(''); isVerifyingRef.current = false; }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 mb-6 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to login
                </button>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={28} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Check your inbox</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We sent a 6-digit OTP to <b className="text-slate-700 dark:text-slate-300">{otpEmail}</b>
                  </p>
                </div>

                <div className="flex gap-2.5 justify-center mb-6" onPaste={handleOtpPaste}>
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
                      className="w-11 text-center text-lg font-bold bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white py-3"
                    />
                  ))}
                </div>

                <button
                  disabled={loading || otp.length < 6}
                  onClick={handleVerifyOtp}
                  className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 mb-3 transition-all"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShieldCheck size={16} /> Verify & Sign In</>
                  }
                </button>

                <button
                  disabled={otpCooldown > 0 || loading}
                  onClick={handleResendOtp}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} />
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            ) : (
              /* LOGIN FORM VIEW */
              <div className="p-8 md:p-10">
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
                  <p className="text-slate-400 mt-1 text-sm">Sign in to your XelPay dashboard</p>
                </div>

                {/* OTP / Password toggle */}
                {otpSettingLoaded && otpLoginEnabled && (
                  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'password' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <Lock size={13} /> With Password
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
                    <div className="relative my-5 text-center">
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
                    <p className="mt-5 text-center text-slate-400 text-sm">
                      New to XelPay?{' '}
                      <Link href="/signup" onClick={clearForgotSession} className="text-blue-600 font-medium hover:underline">
                        Create Account
                      </Link>
                    </p>
                  </>
                )}
              </div>
            )}
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