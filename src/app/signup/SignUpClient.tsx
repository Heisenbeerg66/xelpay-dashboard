'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Mail, Lock, User, MapPin, CheckCircle, ArrowRight, X, AlertCircle, LogIn, Users, Loader2, EyeOff, Eye, Check, Moon, Sun, Menu, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';
import { registerMerchant } from '@/lib/auth';
import { useTheme } from 'next-themes';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const methodLabels: Record<string, string> = {
  mobile: 'Mobile Banking (bKash / Nagad / Rocket)',
  bank: 'Bank Transfer via IMAP Sync',
  international: 'International (Stripe / PayPal / Crypto)',
};

function PlanTagBadge({ tag }: { tag: string }) {
  const colorMap: Record<string, { gradient: string; text: string }> = {
    blue:   { gradient: 'from-blue-500 to-indigo-600', text: 'text-white' },
    green:  { gradient: 'from-emerald-500 to-teal-600', text: 'text-white' },
    orange: { gradient: 'from-orange-500 to-amber-500', text: 'text-white' },
    purple: { gradient: 'from-purple-500 to-violet-600', text: 'text-white' },
    red:    { gradient: 'from-red-500 to-rose-600', text: 'text-white' },
    amber:  { gradient: 'from-amber-400 to-yellow-500', text: 'text-slate-900' },
  };
  const parts = tag.split(':');
  const label = parts[0].trim();
  const colorKey = (parts[1] || 'blue').trim().toLowerCase();
  const colors = colorMap[colorKey] || colorMap.blue;
  return (
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${colors.gradient} ${colors.text} px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-lg whitespace-nowrap flex items-center gap-1`}>
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center border border-green-100 dark:border-green-900/20 shadow-2xl">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Welcome Aboard! 🎉</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed">
          Your XelPay account has been created. Please verify your email to activate it.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-5 border border-blue-100 dark:border-blue-800/30">
          <span className="text-[10px] font-medium text-blue-500 uppercase tracking-widest block mb-1">Your Merchant ID</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">#{merchantId}</span>
          <p className="text-[10px] text-slate-400 mt-1">Keep this safe for support</p>
        </div>
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3.5 mb-5 text-left">
          <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Check your inbox and click the verification link before logging in.
          </p>
        </div>
        <button onClick={onClose}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          <LogIn size={16} /> Go to Login
        </button>
      </div>
    </div>
  );
};

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdFromUrl = searchParams.get('plan');
  const refCodeFromUrl = searchParams.get('ref') || '';
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
          if (row.key_name === 'privacy_policy' && row.value) {
            setPrivacyPolicyLink(row.value);
          }
          if (row.key_name === 'terms_condition' && row.value) {
            setTermsLink(row.value);
          }
        });
      }
    };
    fetchLinks();
  }, []);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'demo') {
      toast.error("Demo Mode: Please go to Login and use demo@xelpay.com / demo123456");
      return;
    }
    if (!captchaToken) { toast.error("Please complete the reCAPTCHA verification."); return; }
    if (!agreedToTerms) { toast.error("Please agree to the Terms & Conditions to continue."); return; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (!selectedPlan) { toast.error("Please select a plan."); return; }

    setLoading(true);
    const fullPhone = `${countryCode}${formData.phone.replace(/\s/g, '')}`;
    const generatedMerchantId = Math.floor(100000 + Math.random() * 900000).toString();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, merchant_id: generatedMerchantId },
        emailRedirectTo: `${window.location.origin}/auth/verify-success`
      }
    });

    if (authError) {
      setErrorModal({ show: true, message: authError.message });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const result = await registerMerchant({
        userId: authData.user.id,
        email: formData.email,
        fullName: formData.fullName,
        phone: fullPhone,
        address: formData.address,
        referCode: formData.referCode || null,
        planId: selectedPlan.id,
        planPrice: selectedPlan.price,
        merchantDisplayId: generatedMerchantId
      });
      if (result.error) {
        setErrorModal({ show: true, message: result.error });
      } else {
        setTempMerchantId(result.merchantDisplayId!);
        setShowSuccess(true);
      }
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400";
  const labelClass = "text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-0.5 mb-1 block";return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />

      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="h-16 flex items-center px-4 md:px-8 justify-between relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none border ${resolvedTheme === 'dark' ? 'bg-blue-600 border-blue-500' : 'bg-slate-200 border-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none">{resolvedTheme === 'dark' ? '🌙' : ''}</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none">{resolvedTheme !== 'dark' ? '☀️' : ''}</span>
              </button>
            )}
            <Link href="/login"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <LogIn size={15} /> Login
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                <Home size={15} /> Home
              </Link>
              <Link href="/info/contact" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                <HelpCircle size={15} /> Help
              </Link>
              <Link href="/#pricing" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                Pricing
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                <LogIn size={15} /> Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

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
                <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                  {selectedPlan.tag && (
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[9px] font-medium px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                      {selectedPlan.tag.split(':')[0]}
                    </span>
                  )}
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">{selectedPlan.name}</h4>
                  <div className="mt-1 mb-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedPlan.price === 0 ? 'Free' : `৳${selectedPlan.price}`}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">/month</span>
                  </div>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle size={12} className="text-blue-500 shrink-0 mt-0.5" />
                      {(selectedPlan.transaction_limit_monthly ?? 100) === 0 ? 'Unlimited transactions / month' : `${(selectedPlan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`}
                    </li>
                    {(Array.isArray(selectedPlan.features) ? selectedPlan.features : []).slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
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
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass.replace('mb-1', '')}>Password <span className="text-red-400">*</span></label>
                  <button type="button" onClick={() => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
                    const pw = Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                    setFormData({ ...formData, password: pw, confirmPassword: pw });
                    setShowPassword(true);
                  }} className="text-[10px] text-blue-600 hover:underline uppercase tracking-wider">
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
                    placeholder="Referral code"
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
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Creating Account...</>
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
      </div>

      <SuccessModal isOpen={showSuccess} merchantId={tempMerchantId} onClose={() => router.push('/login')} />
      <ErrorModal isOpen={errorModal.show} message={errorModal.message} onClose={() => setErrorModal({ show: false, message: '' })} />

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
                return (
                  <div key={p.id} onClick={() => { setSelectedPlan(p); setShowPlanSwitcher(false); }}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:-translate-y-0.5 mt-4 ${selectedPlan?.id === p.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120]'}`}>
                    {p.tag && <PlanTagBadge tag={p.tag} />}
                    <h4 className="font-semibold text-base text-slate-900 dark:text-white mb-1">{p.name}</h4>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-blue-600">{p.price === 0 ? 'Free' : `৳${p.price}`}</span>
                      <span className="text-[10px] text-slate-400 uppercase">/mo</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {allFeatures.map((f: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Check size={12} className="text-blue-500 shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full py-2.5 rounded-xl text-sm text-center transition-all font-medium ${selectedPlan?.id === p.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {selectedPlan?.id === p.id ? '✓ Selected' : 'Select Plan'}
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