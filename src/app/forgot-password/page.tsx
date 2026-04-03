'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle, Lock, Eye, EyeOff, Menu, X, Home, HelpCircle, Sun, Moon, AlertCircle, Clock, MailWarning, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from 'next-themes';
import { syncEmailVerified } from '@/lib/auth';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

// ─── MODALS ───
const SuspendedModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  // Fix: telegramLink value সরাসরি open
  const handleContact = () => {
    if (telegramLink && telegramLink !== '#') {
      window.open(telegramLink, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5"><AlertCircle size={28} className="text-red-500" /></div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Suspended</h3>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">Your account has been suspended or banned. You cannot reset your password at this time.</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={handleContact} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Send size={15} /> Contact Support</button>
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

const PendingModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  // Fix: telegramLink value সরাসরি open
  const handleContact = () => {
    if (telegramLink && telegramLink !== '#') {
      window.open(telegramLink, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-5"><Clock size={28} className="text-amber-500" /></div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Pending</h3>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">Your account is currently under review. Please wait for approval before resetting your password.</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={handleContact} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Send size={15} /> Contact Support</button>
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState(mode === 'demo' ? 'demo@xelpay.com' : '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const [modalState, setModalState] = useState<'none' | 'suspended' | 'pending'>('none');
  const [viewState, setViewState] = useState<'form' | 'unverified'>('form');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [telegramLink, setTelegramLink] = useState('#');

  const [showResendForm, setShowResendForm] = useState(false);
  const [resendVerifyCount, setResendVerifyCount] = useState(0);
  const [cooldownVerify, setCooldownVerify] = useState(0);
  // Fix: I Have Verified loading
  const [checkingVerified, setCheckingVerified] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;

  // ─── MASTER RESTORE + URL SYNC + BACK-BUTTON TRACKER ───
  useEffect(() => {
    setMounted(true);

    const urlStep = searchParams.get('step'); // 'verify-otp' | 'create-password' | null
    const savedStep = sessionStorage.getItem('xelpay_fp_step');
    const savedEmail = sessionStorage.getItem('xelpay_fp_email');
    const savedResendCount = sessionStorage.getItem('xelpay_fp_resend');
    const savedCooldownEnd = sessionStorage.getItem('xelpay_fp_cooldown_end');
    const recoveryMode = sessionStorage.getItem('xelpay_recovery_mode');
    const savedTimestamp = sessionStorage.getItem('xelpay_fp_timestamp');

    const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

    // ── 30-Min Expiry Check ──
    if (savedTimestamp) {
      const elapsed = Date.now() - Number(savedTimestamp);
      if (elapsed > SESSION_EXPIRY_MS) {
        // Expired: sign out, wipe session, redirect to step 1
        (async () => {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) await supabase.auth.signOut();
          clearAllSessionStorage();
          setStep(1);
          setEmail('');
          setOtp('');
          setIsRestoring(false);
          router.replace('/forgot-password');
          toast.error('Session expired. Please start again.');
        })();
        return;
      }
    }

    // ── Back-Button Guard: was on step 3 but URL is now step 2 or null ──
    if (savedStep === '3' && (urlStep === 'verify-otp' || urlStep === null)) {
      (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) await supabase.auth.signOut();
        clearAllSessionStorage();
        setStep(1);
        setEmail('');
        setOtp('');
        setIsRestoring(false);
        router.replace('/forgot-password');
      })();
      return;
    }

    // ── Reload on Step 3: validate recovery mode + live session ──
    if (urlStep === 'create-password' && savedStep === '3') {
      (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const hasValidSession = !!sessionData?.session;
        const hasRecoveryMode = recoveryMode === 'true';

        if (hasValidSession && hasRecoveryMode) {
          // Valid: restore to step 3
          if (savedEmail) setEmail(savedEmail);
          if (savedResendCount) setResendCount(Number(savedResendCount));
          if (savedCooldownEnd) {
            const endTime = Number(savedCooldownEnd);
            if (endTime > Date.now()) setCooldown(Math.floor((endTime - Date.now()) / 1000));
          }
          setStep(3);
        } else {
          // Invalid session or recovery mode missing: kick to step 1
          if (sessionData?.session) await supabase.auth.signOut();
          clearAllSessionStorage();
          setStep(1);
          setEmail('');
          setOtp('');
          router.replace('/forgot-password');
          toast.error('Your session is invalid. Please restart the process.');
        }
        setIsRestoring(false);
      })();
      return;
    }

    // ── Standard Restore (step 1 or step 2) ──
    if (savedStep && savedEmail) {
      setStep(Number(savedStep) as any);
      setEmail(savedEmail);
    }
    if (savedResendCount) setResendCount(Number(savedResendCount));
    if (savedCooldownEnd) {
      const endTime = Number(savedCooldownEnd);
      if (endTime > Date.now()) setCooldown(Math.floor((endTime - Date.now()) / 1000));
    }

    setIsRestoring(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isRestoring]);

  // ─── SYNC STEP → URL + SESSION STORAGE ───
  useEffect(() => {
    if (!isRestoring && step < 4) {
      sessionStorage.setItem('xelpay_fp_step', step.toString());
      sessionStorage.setItem('xelpay_fp_email', email);
      sessionStorage.setItem('xelpay_fp_resend', resendCount.toString());

      // Sync URL to match step
      if (step === 1) router.replace('/forgot-password');
      else if (step === 2) router.replace('/forgot-password?step=verify-otp');
      else if (step === 3) router.replace('/forgot-password?step=create-password');
    }
    if (step === 4) clearSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, email, resendCount, isRestoring]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => { if (event.persisted) setLoading(false); };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (cooldown > 0) { const timer = setInterval(() => setCooldown(c => c - 1), 1000); return () => clearInterval(timer); }
  }, [cooldown]);

  useEffect(() => {
    if (cooldownVerify > 0) { const timer = setInterval(() => setCooldownVerify(c => c - 1), 1000); return () => clearInterval(timer); }
  }, [cooldownVerify]);

  // ─── HELPERS ───

  /** Remove all 6 sessionStorage keys without touching Supabase session */
  const clearAllSessionStorage = () => {
    sessionStorage.removeItem('xelpay_fp_step');
    sessionStorage.removeItem('xelpay_fp_email');
    sessionStorage.removeItem('xelpay_fp_resend');
    sessionStorage.removeItem('xelpay_fp_cooldown_end');
    sessionStorage.removeItem('xelpay_recovery_mode');
    sessionStorage.removeItem('xelpay_fp_timestamp');
  };

  /**
   * Full clearSession:
   * - Removes all 6 sessionStorage items
   * - Signs out of Supabase if a session exists (user is aborting the flow)
   * - Resets component state
   */
  const clearSession = async () => {
    clearAllSessionStorage();
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) await supabase.auth.signOut();
    setStep(1);
    setEmail('');
    setOtp('');
  };

  const fetchTelegramLink = async () => {
    const { data: settings } = await supabase.from('site_settings').select('value').eq('key_name', 'support_telegram').maybeSingle();
    if (settings?.value) setTelegramLink(settings.value);
  };

  const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    if (!isResend && !captchaToken) { toast.error("Please complete the reCAPTCHA verification."); return; }

    setLoading(true);

    const { data: merchant } = await supabase.from('merchants').select('status, is_email_verified, is_demo').eq('email', email.trim()).maybeSingle();

    if (!merchant) {
      toast.error("No account found with this email address.");
      setLoading(false); if (!isResend) recaptchaRef.current?.reset(); setCaptchaToken(null); return;
    }

    if (merchant.is_demo || mode === 'demo') {
      setTimeout(() => { setStep(4); toast.success("Demo Recovery successful!"); setLoading(false); }, 1500); return;
    }

    if (!merchant.is_email_verified) {
      setUnverifiedEmail(email); setViewState('unverified');
      setLoading(false); if (!isResend) recaptchaRef.current?.reset(); setCaptchaToken(null); return;
    }

    const mStatus = merchant.status?.toLowerCase();
    if (['suspended', 'ban', 'banned'].includes(mStatus)) { await fetchTelegramLink(); setModalState('suspended'); setLoading(false); return; }
    if (mStatus === 'pending') { await fetchTelegramLink(); setModalState('pending'); setLoading(false); return; }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast.error(error.message);
      if (!isResend) recaptchaRef.current?.reset(); setCaptchaToken(null);
    } else {
      toast.success(isResend ? "OTP resent successfully!" : "6-digit OTP sent to your email!");
      setStep(2); setCaptchaToken(null);
      setCooldown(60); sessionStorage.setItem('xelpay_fp_cooldown_end', (Date.now() + 60000).toString());
      if (isResend) setResendCount(c => c + 1);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!captchaToken) { toast.error("Please complete the reCAPTCHA."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: unverifiedEmail, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

    if (error) { toast.error(error.message); }
    else {
      toast.success("Verification link resent! Check your inbox.");
      setCooldownVerify(60); setResendVerifyCount(c => c + 1); setShowResendForm(false);
    }
    recaptchaRef.current?.reset(); setCaptchaToken(null); setLoading(false);
  };

  // Fix: I Have Verified — session refresh করে check করো
  const handleCheckVerified = async () => {
    setCheckingVerified(true);
    try {
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();

      if (refreshErr || !refreshData?.user) {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('is_email_verified')
          .eq('email', unverifiedEmail)
          .maybeSingle();

        if (merchant?.is_email_verified) {
          toast.success("Email verified! You can now proceed.");
          setViewState('form');
          setShowResendForm(false);
        } else {
          toast.error("Email not verified yet. Please check your inbox.");
        }
      } else {
        const user = refreshData.user;
        if (user.email_confirmed_at) {
          try { await syncEmailVerified(user.id); } catch (_) {}
          toast.success("Email verified! You can now proceed.");
          setViewState('form');
          setShowResendForm(false);
        } else {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('is_email_verified')
            .eq('email', unverifiedEmail)
            .maybeSingle();

          if (merchant?.is_email_verified) {
            toast.success("Email verified! You can now proceed.");
            setViewState('form');
            setShowResendForm(false);
          } else {
            toast.error("Email not verified yet. Please check your inbox and click the link.");
          }
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setCheckingVerified(false);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setOtp(val);
    if (val.length === 6) verifyOtpLogic(val);
  };

  const verifyOtpLogic = async (tokenToVerify: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: tokenToVerify, type: 'recovery' });
    if (error) {
      toast.error("Invalid or expired OTP. Please try again.");
      setOtp('');
    } else if (data.session) {
      // ── Set recovery mode + timestamp on successful OTP verification ──
      sessionStorage.setItem('xelpay_recovery_mode', 'true');
      sessionStorage.setItem('xelpay_fp_timestamp', Date.now().toString());
      toast.success("OTP Verified! Please set your new password.");
      setStep(3);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error("Please complete the reCAPTCHA verification to continue."); return; }
    if (!passwordRegex.test(newPassword)) { toast.error("Password must contain at least 8 characters, 1 uppercase letter, and 1 number."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } else {
      // ── Sign out after successful update, then clear session before step 4 ──
      await supabase.auth.signOut();
      clearAllSessionStorage();
      toast.success("Password updated successfully!");
      setStep(4);
    }
    setLoading(false);
  };

  /**
   * handleDirectLogin — Step 3 "Login Now" shortcut.
   * The user already has a valid Supabase session from OTP verification,
   * so we only remove the recovery_mode flag and redirect to the dashboard.
   */
  const handleDirectLogin = () => {
    sessionStorage.removeItem('xelpay_recovery_mode');
    toast.success("Welcome back! Redirecting to your dashboard...");
    router.push('/dashboard');
  };

  const generateStrongPassword = () => {
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const lowers = 'abcdefghijklmnopqrstuvwxyz'; const numbers = '0123456789'; const symbols = '!@#$%^&*';
    const all = uppers + lowers + numbers + symbols;
    let pw = uppers[Math.floor(Math.random() * uppers.length)] + numbers[Math.floor(Math.random() * numbers.length)] + symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 0; i < 9; i++) pw += all[Math.floor(Math.random() * all.length)];
    pw = pw.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(pw); setConfirmPassword(pw); setShowPassword(true);
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white placeholder:text-slate-400";
  const labelClass = "text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider block mb-1.5";

  const ThemeToggle = () => (
    mounted ? (
      <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all">
        {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    ) : <div className="w-9 h-9" />
  );

  if (isRestoring) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="h-16 relative max-w-7xl mx-auto w-full px-4 md:px-8">

          <div className="hidden md:flex h-full items-center justify-between w-full">
            <Link href="/" onClick={clearSession} className="flex items-center gap-1">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" onClick={clearSession} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Login</Link>
              <Link href="/signup" onClick={clearSession} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Register</Link>
              <Link href="/info/contact" onClick={clearSession} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Support</Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex md:hidden h-full items-center justify-between w-full">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center"><ThemeToggle /></div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 flex flex-col gap-1 max-w-7xl mx-auto w-full">
              <Link href="/login" onClick={() => { setMenuOpen(false); clearSession(); }} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Login</Link>
              <Link href="/signup" onClick={() => { setMenuOpen(false); clearSession(); }} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Register</Link>
              <Link href="/info/contact" onClick={() => { setMenuOpen(false); clearSession(); }} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">Support</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex items-start md:items-center justify-center p-4 pt-10 md:py-10">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden">

          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>

          {/* ── UNVERIFIED VIEW ── */}
          {viewState === 'unverified' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              {/* Fix: No branding in this view */}
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5"><MailWarning size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify Your Email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                We've sent a verification link to <b className="text-slate-700 dark:text-slate-300">{unverifiedEmail}</b>. Please check your inbox to activate your account.
              </p>

              {/* Fix: I Have Verified button */}
              <button
                onClick={handleCheckVerified}
                disabled={checkingVerified}
                className="w-full mb-3 bg-green-600 disabled:bg-green-500 text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm"
              >
                {checkingVerified ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><CheckCircle2 size={15} /> I Have Verified My Email</>
                )}
              </button>

              {!showResendForm ? (
                <div className="space-y-3">
                  <button onClick={() => setShowResendForm(true)} className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700">
                    I didn't receive the email
                  </button>
                  <p className="text-xs text-slate-500">Entered the wrong email? <Link href="/signup" onClick={clearSession} className="text-blue-600 hover:underline font-semibold">Create a new account</Link></p>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-center">{mounted && <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={token => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />}</div>
                  <button disabled={loading || cooldownVerify > 0 || resendVerifyCount >= 3} onClick={handleResendVerification} type="button" className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-lg transition-all">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : resendVerifyCount >= 3 ? "Maximum limit reached" : cooldownVerify > 0 ? `Resend again in ${cooldownVerify}s` : "Resend Verification Link"}
                  </button>
                  <button onClick={() => { setShowResendForm(false); recaptchaRef.current?.reset(); setCaptchaToken(null); }} className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest">Cancel</button>
                </div>
              )}
              <button onClick={() => { setViewState('form'); setShowResendForm(false); }} className="mt-8 flex items-center justify-center gap-1.5 mx-auto text-xs text-slate-400 hover:text-blue-600 uppercase tracking-widest font-bold transition-colors"><ArrowLeft size={14} /> Back to Forgot Password</button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Lock size={28} /></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Forgot Password</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">Enter your registered email and we'll send you a secure 6-digit OTP to reset your password.</p>

                  <form onSubmit={(e) => handleSendOtp(e, false)} className="space-y-5">
                    <div>
                      <label className={labelClass}>Registered Email <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input required type="email" value={email} placeholder="admin@xelpay.com" className={inputClass} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex justify-center">{mounted && <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />}</div>

                    <button disabled={loading} className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Send OTP <Send size={15} /></>}
                    </button>

                    <div className="pt-3 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Remember your password?{' '}
                        <Link href="/login" onClick={clearSession} className="text-blue-600 font-semibold hover:underline">Login Here</Link>
                      </p>
                    </div>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <button onClick={() => { setStep(1); setOtp(''); }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-5 transition-colors uppercase tracking-widest"><ArrowLeft size={14} /> Edit Email</button>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Enter OTP</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">We sent a 6-digit secure OTP to <br /><b className="text-slate-800 dark:text-slate-200">{email}</b></p>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>6-Digit OTP <span className="text-red-500">*</span></label>
                      <input required type="text" maxLength={6} value={otp} placeholder="• • • • • •" disabled={loading} className={`${inputClass} !pl-4 text-center tracking-[1em] text-2xl font-bold disabled:opacity-50`} onChange={handleOtpChange} />
                    </div>

                    <button disabled={true} className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Auto Verifying...'}
                    </button>

                    <div className="text-center pt-2">
                      <button type="button" disabled={cooldown > 0 || resendCount >= 3 || loading} onClick={() => handleSendOtp(undefined, true)} className="text-xs font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline transition-all">
                        {resendCount >= 3 ? "Maximum resend limit reached." : cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't receive the code? Resend OTP"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">New Password</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">Set a strong and secure password for your merchant account.</p>

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className={`${labelClass} !mb-0`}>New Password <span className="text-red-500">*</span></label>
                        <button type="button" onClick={generateStrongPassword} className="text-[10px] text-blue-600 hover:underline uppercase tracking-wider font-bold">Generate</button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} className={`${inputClass} pr-11`} onChange={e => setNewPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Must be at least 8 characters, containing 1 uppercase and 1 number.</p>
                    </div>

                    <div>
                      <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} className={`${inputClass} ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus:border-red-500' : ''}`} onChange={e => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex justify-center pt-2">{mounted && <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />}</div>

                    <button disabled={loading} className="w-full bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center mt-2">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Update Password'}
                    </button>

                    {/* ── Direct Login: replaces the old <Link> with onClick handler ── */}
                    <div className="pt-2 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don't want to change?{' '}
                        <button
                          type="button"
                          onClick={handleDirectLogin}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Login Now
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}

              {step === 4 && (
                <div className="text-center animate-in zoom-in-95 duration-500 py-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} strokeWidth={1.5} /></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Password Updated!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">Your password has been successfully reset. You can now securely login to your workspace.</p>
                  <Link href="/login" onClick={clearSession} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center shadow-lg">Login Now</Link>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <SuspendedModal isOpen={modalState === 'suspended'} telegramLink={telegramLink} onClose={() => setModalState('none')} />
      <PendingModal isOpen={modalState === 'pending'} telegramLink={telegramLink} onClose={() => setModalState('none')} />
    </div>
  );
}

export default function ForgotPassword() {
  return <Suspense fallback={null}><ForgotPasswordContent /></Suspense>;
}
