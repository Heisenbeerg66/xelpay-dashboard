'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Mail, Lock, User, MapPin, CheckCircle, ArrowRight, X, AlertCircle, LogIn, Users, Loader2, EyeOff, Eye, Check, Moon, Sun, Menu, HelpCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from 'next-themes';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const methodLabels: Record<string, string> = {
  mobile: 'Mobile Banking (bKash / Nagad / Rocket)',
  bank: 'Bank Transfer via IMAP Sync',
  international: 'International (Stripe / PayPal / Crypto)',
};

function getPlanColors(tag: string | null): {
  border: string;
  borderSelected: string;
  button: string;
  buttonSelected: string;
  price: string;
  check: string;
  badge: string;
  badgeText: string;
} {
  if (!tag) return {
    border: 'border-slate-200 dark:border-slate-700',
    borderSelected: 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10',
    button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    buttonSelected: 'bg-blue-600 text-white',
    price: 'text-blue-600',
    check: 'text-blue-500',
    badge: 'from-blue-500 to-indigo-600',
    badgeText: 'text-white',
  };

  const colorKey = (tag.split(':')[1] || 'blue').trim().toLowerCase();
  const map: Record<string, ReturnType<typeof getPlanColors>> = {
    blue: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-blue-600 text-white',
      price: 'text-blue-600',
      check: 'text-blue-500',
      badge: 'from-blue-500 to-indigo-600',
      badgeText: 'text-white',
    },
    green: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-emerald-600 text-white',
      price: 'text-emerald-600',
      check: 'text-emerald-500',
      badge: 'from-emerald-500 to-teal-600',
      badgeText: 'text-white',
    },
    orange: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-orange-500 text-white',
      price: 'text-orange-500',
      check: 'text-orange-500',
      badge: 'from-orange-500 to-amber-500',
      badgeText: 'text-white',
    },
    purple: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-purple-600 text-white',
      price: 'text-purple-600',
      check: 'text-purple-500',
      badge: 'from-purple-500 to-violet-600',
      badgeText: 'text-white',
    },
    red: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-red-500 bg-red-50/50 dark:bg-red-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-red-600 text-white',
      price: 'text-red-600',
      check: 'text-red-500',
      badge: 'from-red-500 to-rose-600',
      badgeText: 'text-white',
    },
    amber: {
      border: 'border-slate-200 dark:border-slate-700',
      borderSelected: 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10',
      button: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonSelected: 'bg-amber-500 text-slate-900',
      price: 'text-amber-500',
      check: 'text-amber-500',
      badge: 'from-amber-400 to-yellow-500',
      badgeText: 'text-slate-900',
    },
  };

  return map[colorKey] || map.blue;
}

function PlanTagBadge({ tag }: { tag: string }) {
  const colors = getPlanColors(tag);
  const parts = tag.split(':');
  const label = parts[0].trim();
  return (
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${colors.badge} ${colors.badgeText} px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-lg whitespace-nowrap flex items-center gap-1`}>
      <span>{label.match(/^\p{Emoji}/u)?.[0] || '✦'}</span>
      <span>{label.replace(/^\p{Emoji}\s*/u, '')}</span>
    </div>
  );
}

const ErrorModal = ({ isOpen, message, onClose }: any) => {
  const router = useRouter();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center border border-red-100 dark:border-red-900/20 shadow-2xl">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={() => router.push('/login')}
            className="w-full bg-slate-900 dark:bg-slate-700 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <LogIn size={16} /> Login Instead
          </button>
          <button onClick={onClose}
            className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, merchantId, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
          </div>
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            Registration Successful
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 leading-relaxed">
            Your merchant account has been created and verified successfully.
          </p>
          {/* Merchant ID */}
          <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Merchant ID</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-widest">#{merchantId}</p>
            <p className="text-[10px] text-slate-400 mt-1.5">Save this ID — you'll need it for support</p>
          </div>
          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={15} /> Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── OTP INPUT VIEW ──────────────────────────────────────────────────────────
const OtpView = ({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  onBack,
  loading,
  resendCooldown,
}: {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  resendCooldown: number;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = otp.split('');
    newOtp[index] = digit;
    const joined = newOtp.join('');
    setOtp(joined);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <ShieldCheck size={32} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify Your Email</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-7 leading-relaxed">
        We sent a 6-digit code to <b className="text-slate-700 dark:text-slate-300">{email}</b>. Enter it below to complete signup.
      </p>

      {/* OTP Digit Inputs */}
      <div className="flex gap-2.5 justify-center mb-7" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-11 h-13 text-center text-lg font-bold bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white py-3"
          />
        ))}
      </div>

      <button
        disabled={loading || otp.length < 6}
        onClick={onVerify}
        className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 mb-3"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</>
        ) : (
          <><ShieldCheck size={16} /> Verify & Create Account</>
        )}
      </button>

      <button
        disabled={resendCooldown > 0 || loading}
        onClick={onResend}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50 mb-4"
      >
        <RefreshCw size={13} />
        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
      </button>

      <button onClick={onBack} className="flex items-center justify-center gap-1.5 mx-auto text-xs text-slate-400 hover:text-blue-600 uppercase tracking-widest font-bold transition-colors">
        ← Back to Form
      </button>
    </div>
  );
};

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdFromUrl = searchParams.get('plan');
  const refCodeFromUrl = searchParams.get('ref') || '';
  const nextUrl = searchParams.get('next') || '/dashboard';
  const mode = searchParams.get('mode');
  const errorFromUrl = searchParams.get('error');

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [tempMerchantId, setTempMerchantId] = useState('');

  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);

  const [countryCode, setCountryCode] = useState('+880');

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', confirmPassword: '', address: '', referCode: refCodeFromUrl
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState('/info/privacy');
  const [termsLink, setTermsLink] = useState('/info/terms');

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  // ─── OTP Flow State ───────────────────────────────────────────────────────
  const [viewState, setViewState] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  // Store pending signup data so we can call registerMerchant after OTP succeeds
  const pendingSignup = useRef<{
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    referCode: string | null;
    planId: string | null;
    planPrice: number;
    merchantDisplayId: string;
    password: string;
  } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (errorFromUrl === 'email_exists') {
      setErrorModal({ show: true, message: 'An account with this Google email already exists. Please login instead.' });
    }
  }, [errorFromUrl]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase.from('plans').select('*').order('serial', { ascending: true });
      if (data && data.length > 0) {
        setAllPlans(data);
        const current = data.find((p: any) => p.id === planIdFromUrl);
        setSelectedPlan(current || data[0]);
      }
    };
    fetchPlans();
  }, [planIdFromUrl]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key_name, value')
        .in('key_name', ['privacy_policy', 'terms_condition']);
      if (data) {
        data.forEach((row: any) => {
          if (row.key_name === 'privacy_policy' && row.value) setPrivacyPolicyLink(row.value);
          if (row.key_name === 'terms_condition' && row.value) setTermsLink(row.value);
        });
      }
    };
    fetchLinks();
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [resendCooldown]);

  // Auto-fill referral code from URL param
  useEffect(() => {
    if (refCodeFromUrl) {
      setFormData(prev => ({ ...prev, referCode: refCodeFromUrl }));
    }
  }, [refCodeFromUrl]);

  const buildPlanFeatures = (plan: any): string[] => {
    if (!plan) return [];
    const transactionLabel = (plan.transaction_limit_monthly ?? 100) === 0
      ? 'Unlimited transactions / month'
      : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`;
    const columnFeatures: (string | null)[] = [
      transactionLabel,
      `${plan.business_limit ?? 1} business${(plan.business_limit ?? 1) > 1 ? 'es' : ''}`,
      ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => methodLabels[m] ?? m),
      plan.is_team_allowed ? `Team access — up to ${plan.allowed_team_members ?? 1} members` : 'Single user only',
      `${plan.device_limit ?? 1} device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
      plan.allowed_telegram_group ? 'Telegram group alerts' : null,
      plan.is_custom_bot_allowed ? 'Custom Telegram bot' : null,
    ];
    const extraFeatures: string[] = Array.isArray(plan.features) ? plan.features : [];
    return [...columnFeatures.filter(Boolean) as string[], ...extraFeatures];
  };

  const validatePassword = (pw: string): boolean => {
    return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/.test(pw);
  };

  // ─── STEP 1: Submit form → signUp → show OTP view ────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'demo') {
      toast.error("Demo Mode: Please go to Login and use demo@xelpay.com / demo123456");
      return;
    }
    if (!captchaToken) { toast.error("Please complete the reCAPTCHA verification."); return; }
    if (!agreedToTerms) { toast.error("Please agree to the Terms & Conditions to continue."); return; }
    if (!validatePassword(formData.password)) {
      toast.error("Password must be at least 8 characters with 1 uppercase letter and 1 number.");
      return;
    }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (!selectedPlan) { toast.error("Please select a plan."); return; }

    setLoading(true);
    const fullPhone = `${countryCode}${formData.phone.replace(/\s/g, '')}`;
    const generatedMerchantId = Math.floor(100000 + Math.random() * 900000).toString();

    // ── Attempt signUp ──
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, merchant_id: generatedMerchantId },
        // No emailRedirectTo — Supabase sends 6-digit OTP when auth is set to OTP mode
      }
    });

    // ── Ghost User Handling ──────────────────────────────────────────────────
    if (authError) {
      const errMsg = authError.message.toLowerCase();
      const isAlreadyRegistered =
        errMsg.includes('user already registered') ||
        errMsg.includes('already registered') ||
        errMsg.includes('email address is already registered');

      if (isAlreadyRegistered) {
        // Check if a merchants record exists (completed signup before)
        const { data: existingMerchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();

        if (existingMerchant) {
          setErrorModal({ show: true, message: 'Email already registered. Please login instead.' });
          setLoading(false);
          recaptchaRef.current?.reset();
          setCaptchaToken(null);
          return;
        } else {
          // Ghost user — abandoned signup. Resend OTP silently.
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });
          if (resendError) {
            toast.error("Could not resend OTP: " + resendError.message);
            setLoading(false);
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
            return;
          }

          pendingSignup.current = {
            userId: '', // will be populated after OTP verification
            email: formData.email,
            fullName: formData.fullName,
            phone: fullPhone,
            address: formData.address,
            referCode: formData.referCode || null,
            planId: selectedPlan.id,
            planPrice: selectedPlan.price,
            merchantDisplayId: generatedMerchantId,
            password: formData.password,
          };
          toast.success("OTP sent! Check your inbox.");
          setOtp('');
          setViewState('otp');
          setResendCooldown(60);
          setLoading(false);
          return;
        }
      }

      setErrorModal({ show: true, message: authError.message });
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      return;
    }

    // ── Normal signUp success — store pending data and show OTP ──
    if (authData.user) {
      pendingSignup.current = {
        userId: authData.user.id,
        email: formData.email,
        fullName: formData.fullName,
        phone: fullPhone,
        address: formData.address,
        referCode: formData.referCode || null,
        planId: selectedPlan.id,
        planPrice: selectedPlan.price,
        merchantDisplayId: generatedMerchantId,
        password: formData.password,
      };
      toast.success("OTP sent! Check your inbox.");
      setOtp('');
      setViewState('otp');
      setResendCooldown(60);
    }

    setLoading(false);
  };

  // ─── RESEND OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!pendingSignup.current) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingSignup.current.email,
    });
    if (error) {
      toast.error("Resend failed: " + error.message);
    } else {
      toast.success("New OTP sent! Check your inbox.");
      setResendCooldown(60);
    }
    setLoading(false);
  };

  // ─── AUTO-VERIFY: trigger as soon as user enters all 6 digits ───────────
  const isVerifyingRef = useRef(false);
  useEffect(() => {
    if (viewState === 'otp' && otp.length === 6 && !loading && pendingSignup.current && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      handleVerifyOtp();
    }
    if (otp.length < 6) isVerifyingRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, viewState]);

  // ─── STEP 2: Verify OTP + Register Merchant — single server round-trip ────
  const handleVerifyOtp = async () => {
    if (!pendingSignup.current || otp.length < 6) return;
    setLoading(true);

    const pending = pendingSignup.current;

    const res = await fetch('/auth/verify-and-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:             pending.email,
        token:             otp,
        userId:            pending.userId,
        fullName:          pending.fullName,
        phone:             pending.phone,
        address:           pending.address,
        referCode:         pending.referCode,
        planId:            pending.planId,
        planPrice:         pending.planPrice,
        merchantDisplayId: pending.merchantDisplayId,
      }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      const msg = result.error || 'Verification failed. Please try again.';
      if (res.status === 401) {
        toast.error(msg);
      } else {
        setErrorModal({ show: true, message: msg });
      }
      isVerifyingRef.current = false;
      setLoading(false);
      return;
    }

    setTempMerchantId(result.merchantDisplayId!);
    setShowSuccess(true);
    setLoading(false);
  };

  // ─── Success modal close → hard redirect ─────────────────────────────────
  const handleSuccessClose = () => {
    window.location.href = nextUrl;
  };

  const selectedColors = getPlanColors(selectedPlan?.tag || null);

  const inputClass = "w-full px-4 py-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400";
  const labelClass = "text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-0.5 mb-1 block";

  const generatePassword = () => {
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const all = uppers + lowers + numbers + symbols;
    let pw =
      uppers[Math.floor(Math.random() * uppers.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 0; i < 11; i++) pw += all[Math.floor(Math.random() * all.length)];
    pw = pw.split('').sort(() => 0.5 - Math.random()).join('');
    setFormData({ ...formData, password: pw, confirmPassword: pw });
    setShowPassword(true);
  };

  const ThemeToggle = () => (
    mounted ? (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    ) : <div className="w-9 h-9" />
  );

  // OTP view active — hide sidebar plan card and show OTP card centered
  const isOtpView = viewState === 'otp';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        {/* Desktop header */}
        <div className="hidden md:flex items-center h-16 px-8 justify-between max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Home</Link>
            <Link href="/info/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Help</Link>
            <Link href="/#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">Pricing</Link>
            <ThemeToggle />
            <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium flex items-center gap-1.5">
              <LogIn size={15} /> Login
            </Link>
          </div>
        </div>

        {/* Mobile header — no icons on nav links, clean alignment */}
        <div className="flex md:hidden items-center h-16 px-4 justify-between max-w-7xl mx-auto w-full">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Center logo on mobile */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>

          <ThemeToggle />
        </div>

        {/* Mobile dropdown menu — no icons, clean text */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 flex flex-col gap-1 max-w-7xl mx-auto w-full">
              <Link href="/" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                Home
              </Link>
              <Link href="/info/contact" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                Help
              </Link>
              <Link href="/#pricing" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                Pricing
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 md:px-8">

        {/* OTP view — centered card, sidebar hidden */}
        {isOtpView ? (
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl p-8 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
              <OtpView
                email={formData.email}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={() => { setViewState('form'); setOtp(''); }}
                loading={loading}
                resendCooldown={resendCooldown}
              />
            </div>
          </div>
        ) : (
          /* Normal form view — two-column layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

            {/* ── Sidebar Plan Card ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 md:p-7 shadow-sm border border-slate-200 dark:border-slate-800">

                {mode === 'demo' && (
                  <div className="bg-yellow-400 text-yellow-900 text-[10px] font-semibold px-4 py-1.5 rounded-lg uppercase tracking-widest mb-4 text-center animate-pulse">
                    Demo Mode Active
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Your Plan</h3>
                  <button onClick={() => setShowPlanSwitcher(true)}
                    className="text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-full uppercase hover:bg-blue-600 hover:text-white transition-all">
                    Change Plan
                  </button>
                </div>

                {selectedPlan ? (
                  <div className={`p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border-2 ${selectedColors.border} relative`}>
                    {selectedPlan.tag && (
                      <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${selectedColors.badge} ${selectedColors.badgeText} text-[9px] font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-3`}>
                        <span>{selectedPlan.tag.split(':')[0].match(/^\p{Emoji}/u)?.[0] || '✦'}</span>
                        <span>{selectedPlan.tag.split(':')[0].replace(/^\p{Emoji}\s*/u, '')}</span>
                      </span>
                    )}
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">{selectedPlan.name}</h4>
                    <div className="mt-1 mb-3 flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${selectedColors.price}`}>
                        {selectedPlan.price === 0 ? 'Free' : `৳${selectedPlan.price}`}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">/month</span>
                    </div>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle size={12} className={`${selectedColors.check} shrink-0 mt-0.5`} />
                        {(selectedPlan.transaction_limit_monthly ?? 100) === 0
                          ? 'Unlimited transactions / month'
                          : `${(selectedPlan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`}
                      </li>
                      {(Array.isArray(selectedPlan.features) ? selectedPlan.features : []).slice(0, 3).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <CheckCircle size={12} className={`${selectedColors.check} shrink-0 mt-0.5`} /> {f}
                        </li>
                      ))}
                      {selectedPlan.price === 0 && (
                        <li className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle size={12} className="shrink-0 mt-0.5" /> No payment required
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                )}
              </div>
            </div>

            {/* ── Signup Form ── */}
            <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-2xl p-5 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="mb-7">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="text-slate-400 mt-1.5 text-sm">Enter your details to get started with XelPay.</p>
              </div>

              <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

                <div className="md:col-span-2">
                  <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required className={`${inputClass} pl-10`} placeholder="e.g. Rahim Ahmed"
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                      className="px-3 py-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 shrink-0">
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                    </select>
                    <input required type="tel" className={inputClass} placeholder="1XXXXXXXXX"
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="email" name="email" autoComplete="username" className={`${inputClass} pl-10`} placeholder="admin@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={labelClass.replace('mb-1', '')}>Password <span className="text-red-400">*</span></label>
                    <button type="button" onClick={generatePassword} className="text-[10px] text-blue-600 hover:underline uppercase tracking-wider">
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password"
                      placeholder="••••••••" value={formData.password}
                      className={`${inputClass} pl-10 pr-11`}
                      onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-0.5">Min. 8 characters, 1 uppercase &amp; 1 number. Symbols optional.</p>
                </div>

                <div>
                  <label className={labelClass}>Confirm Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type={showConfirmPassword ? 'text' : 'password'} name="confirm-password" autoComplete="new-password"
                      placeholder="••••••••" value={formData.confirmPassword}
                      className={`${inputClass} pl-10 pr-11 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1 ml-0.5">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>City / Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required className={`${inputClass} pl-10`} placeholder="Dhaka, Bangladesh"
                      onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Referral Code <span className="text-slate-400 normal-case tracking-normal">(optional)</span></label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={formData.referCode}
                      className={`${inputClass} pl-10 uppercase tracking-widest font-medium`}
                      placeholder="XEL-XXXXXX"
                      onChange={e => setFormData({ ...formData, referCode: e.target.value })} />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-center">
                  {mounted && (
                    <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={token => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-blue-600 shrink-0" required />
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      I agree to the{' '}
                      <a href={termsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Terms & Conditions</a>
                      {' '}and{' '}
                      <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</a>
                      {' '}of XelPay. <span className="text-red-400">*</span>
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 pt-1">
                  <button disabled={loading || !selectedPlan}
                    className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending OTP...</>
                    ) : (
                      <>Create Account <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center mt-5 text-sm text-slate-400">
                Already registered?{' '}
                <Link href={`/login${mode === 'demo' ? '?mode=demo' : ''}`} className="text-blue-600 font-medium hover:underline">Sign In</Link>
                {' '}&bull;{' '}
                <Link href="/forgot-password" className="text-blue-600 font-medium hover:underline">Reset Password</Link>
              </p>
            </div>
          </div>
        )}
      </div>

      <SuccessModal isOpen={showSuccess} merchantId={tempMerchantId} onClose={handleSuccessClose} />
      <ErrorModal isOpen={errorModal.show} message={errorModal.message} onClose={() => setErrorModal({ show: false, message: '' })} />

      {/* ── Plan Switcher Modal ── */}
      {showPlanSwitcher && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111827] w-full md:max-w-5xl md:rounded-2xl rounded-t-2xl p-5 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden max-h-[92vh] overflow-y-auto">
            <button onClick={() => setShowPlanSwitcher(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:rotate-90 transition-all z-10">
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 text-center">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allPlans.map((p: any) => {
                const allFeatures = buildPlanFeatures(p);
                const isSelected = selectedPlan?.id === p.id;
                const colors = getPlanColors(p.tag || null);
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPlan(p); setShowPlanSwitcher(false); }}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:-translate-y-0.5 mt-4 ${
                      isSelected ? colors.borderSelected : `${colors.border} bg-white dark:bg-[#0B1120]`
                    }`}
                  >
                    {p.tag && <PlanTagBadge tag={p.tag} />}
                    <h4 className="font-semibold text-base text-slate-900 dark:text-white mb-1">{p.name}</h4>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className={`text-2xl font-bold ${colors.price}`}>
                        {p.price === 0 ? 'Free' : `৳${p.price}`}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">/mo</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {allFeatures.map((f: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Check size={12} className={`${colors.check} shrink-0 mt-0.5`} /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2.5 rounded-xl text-sm text-center transition-all font-medium ${isSelected ? colors.buttonSelected : colors.button}`}>
                      {isSelected ? '✓ Selected' : 'Select Plan'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignUpClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}