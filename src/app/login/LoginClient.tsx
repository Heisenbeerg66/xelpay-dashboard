'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Send, ArrowLeft, Moon, Sun, Menu, X, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';
import { syncEmailVerified } from '@/lib/auth';
import { useTheme } from 'next-themes';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const SuspendedModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Account Suspended</h3>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">Your account has been suspended due to a policy violation or review.</p>
        <div className="flex flex-col gap-2.5">
          <a href={telegramLink} target="_blank" rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <Send size={15} /> Contact Support
          </a>
          <button onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [telegramLink, setTelegramLink] = useState('#');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => { setMounted(true); }, []);

  const errorParam = searchParams.get('error');
  useEffect(() => {
    if (errorParam === 'no_account') {
      toast.error("No account found with this Google email. Please sign up first.", { duration: 6000 });
    } else if (errorParam === 'suspended') {
      toast.error("Your account has been suspended. Please contact support.", { duration: 6000 });
    }
  }, [errorParam]);

  useEffect(() => {
    if (mode === 'demo') {
      setEmail('demo@xelpay.com');
      setPassword('demo123456');
      toast.success("Demo credentials loaded!", { icon: '✨' });
    }
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error("Please complete the reCAPTCHA."); return; }
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) toast.error("Please verify your email first.");
      else if (error.message.toLowerCase().includes("invalid login credentials")) toast.error("Wrong email or password.");
      else toast.error(error.message);
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      return;
    }

    if (authData.user) {
      try {
        const { data: merchant } = await supabase.from('merchants').select('status, is_demo').eq('id', authData.user.id).single();

        if (mode === 'demo' && merchant?.is_demo !== true) {
          await supabase.auth.signOut();
          toast.error("Not a demo account.");
          setLoading(false);
          recaptchaRef.current?.reset();
          setCaptchaToken(null);
          return;
        }

        if (merchant?.status === 'suspended') {
          await supabase.auth.signOut();
          const { data: settings } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram').maybeSingle();
          if (settings) setTelegramLink(settings.value);
          setShowSuspendedModal(true);
          setLoading(false);
          return;
        }

        if (authData.user.email_confirmed_at) {
          try { await syncEmailVerified(authData.user.id); } catch (_) {}
        }

        router.push('/dashboard');

      } catch (err) {
        router.push('/dashboard');
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (mode === 'demo') {
      toast.error("Google login disabled in demo mode.");
      return;
    }
    setGoogleLoading(true);

    // 🔴 Security: Generating a random transaction ID and saving it to sessionStorage
    const txId = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
    sessionStorage.setItem('auth_tx', txId);
    localStorage.setItem('oauth_source', 'login');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?tx=${txId}` }, // Adding txId to the URL
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans transition-colors duration-300 flex flex-col">
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
                <HelpCircle size={15} /> Support
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md md:max-w-2xl bg-white dark:bg-[#111827] rounded-2xl md:rounded-3xl shadow-sm md:shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          {mode === 'demo' && (
            <div className="bg-yellow-400 text-yellow-900 text-[10px] font-semibold px-4 py-1.5 uppercase tracking-widest text-center animate-pulse">
              Demo Mode Active
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-stretch">

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
                      <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div> {s}
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

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 text-center md:text-left">Welcome Back</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-0.5 mb-1 block">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="email" name="email" autoComplete="username" placeholder="admin@xelpay.com"
                      value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-0.5 mb-1 block">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password"
                      placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                      className={`${inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
                  </label>
                  <Link href={`/forgot-password${mode === 'demo' ? '?mode=demo' : ''}`}
                    className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                </div>

                <div className="flex justify-center">
                  {mounted && (
                    <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY}
                      onChange={token => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)}
                      theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
                  )}
                </div>

                <button disabled={loading} type="submit"
                  className="w-full relative bg-blue-600 disabled:bg-blue-500 text-white py-3.5 rounded-xl font-medium text-sm hover:-translate-y-0.5 transition-all flex items-center justify-center overflow-hidden shadow-lg shadow-blue-600/25 h-[50px]">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="flex gap-1 items-end h-5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <span
                            key={i}
                            className="inline-block w-1 bg-white rounded-full"
                            style={{
                              animation: `wave 0.8s ease-in-out infinite`,
                              animationDelay: `${i * 0.1}s`,
                              height: '8px',
                            }}
                          />
                        ))}
                      </span>
                    </span>
                  ) : (
                    <>Sign In <LogIn size={15} className="ml-1.5" /></>
                  )}
                </button>
                <style>{`@keyframes wave { 0%, 100% { transform: scaleY(0.5); opacity: 0.5; } 50% { transform: scaleY(2); opacity: 1; } }`}</style>

                {mode === 'demo' && (
                  <Link href="/login"
                    className="w-full block text-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Login Your Account
                  </Link>
                )}
              </form>

              {mode !== 'demo' && (
                <>
                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <span className="relative px-4 bg-white dark:bg-[#111827] text-[10px] text-slate-400 uppercase tracking-widest">Or</span>
                  </div>

                  <button onClick={handleGoogleLogin} disabled={googleLoading}
                    className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 py-3.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    {googleLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                        Sign in with Google
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-slate-400 text-sm">
                    New to XelPay?{' '}
                    <Link href="/signup" className="text-blue-600 font-medium hover:underline">Create Account</Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <SuspendedModal isOpen={showSuspendedModal} telegramLink={telegramLink} onClose={() => setShowSuspendedModal(false)} />
    </div>
  );
}

export default function LoginClient() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>}><LoginContent /></Suspense>;
}