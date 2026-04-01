'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Send, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';
import { syncEmailVerified } from '@/lib/auth';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const SuspendedModal = ({ isOpen, telegramLink, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
         <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={36} /></div>
         <h3 className="text-xl font-black mb-2 uppercase">Account Suspended</h3>
         <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-2">Your merchant account has been suspended due to a policy violation or review.</p>
         <div className="flex flex-col gap-3">
           <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Send size={18} /> Contact Support</a>
           <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Close</button>
         </div>
      </div>
    </div>
  );
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

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

  useEffect(() => {
    if (mode === 'demo') {
      setEmail('demo@xelpay.com');
      setPassword('demo123456');
      toast.success("Demo credentials loaded securely!", { icon: '✨' });
    }
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) toast.error("Please verify your email address first.");
      else if (error.message.toLowerCase().includes("invalid login credentials")) toast.error("Wrong email or password! Please try again.");
      else toast.error(error.message);
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      return;
    }

    if (authData.user) {
      try {
        const { data: merchant, error: merchantError } = await supabase.from('merchants').select('status, is_demo').eq('id', authData.user.id).single();

        if (merchantError) {
          console.error("Merchant check error:", merchantError);
        }

        if (mode === 'demo' && merchant?.is_demo !== true) {
          await supabase.auth.signOut();
          toast.error("This account is not a demo account. Please use the demo credentials provided.");
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
          try {
            await syncEmailVerified(authData.user.id);
          } catch (syncError) {
            console.error("Sync Email Error:", syncError);
          }
        }

        toast.success("Authentication successful! Redirecting...", { icon: '🔐' });
        
        // ফাস্ট রাউটিংয়ের জন্য router.push ব্যবহার করা হয়েছে
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (err) {
        console.error("Post-login process error:", err);
        toast.success("Authentication successful! Redirecting...", { icon: '🔐' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (mode === 'demo') {
      toast.error("Google login disabled in demo mode. Please use demo@xelpay.com / demo123456");
      return;
    }
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex items-center justify-center p-4 md:p-8 transition-colors duration-500 font-sans">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md md:max-w-2xl bg-white dark:bg-[#0B1120] md:bg-white md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl border-0 md:border md:border-slate-100 dark:border-slate-800 relative z-10 flex flex-col min-h-[80vh] md:min-h-0">

        {mode === 'demo' && (
          <div className="absolute top-0 md:-top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-6 py-1.5 rounded-b-xl md:rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap z-20 animate-pulse">
            Test Demo Mode Active
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-stretch flex-1">

          {/* Left branding panel — desktop only */}
          <div className="hidden md:flex flex-col justify-between bg-blue-600 rounded-l-[2.5rem] p-10 min-w-[220px] text-white">
            <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="flex flex-col items-center">
              <Link href="/" className="inline-flex items-center gap-1 mb-6">
                <span className="text-4xl font-black text-white tracking-tighter">X</span>
                <span className="text-3xl font-bold text-white tracking-tight -ml-0.5 opacity-90">elPay</span>
              </Link>
              <p className="text-sm font-bold opacity-80 text-center leading-relaxed">
                Secure merchant<br />payment automation
              </p>
              <div className="mt-8 flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                  99.9% Uptime
                </div>
                <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                  Bank-grade security
                </div>
                <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                  <div className="w-2 h-2 rounded-full bg-white/60"></div>
                  24/7 support
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/40 font-bold text-center">© {new Date().getFullYear()} XelPay</div>
          </div>

          {/* Right / main form area */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">

            <div className="md:hidden flex items-center justify-between mb-6 mt-2">
              <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-xs font-bold transition-colors">
                <ArrowLeft size={15} /> Home
              </Link>
              <Link href="/" className="inline-flex items-center gap-1 group">
                <span className="text-3xl font-black text-blue-600 tracking-tighter">X</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
              </Link>
              <div className="w-12" /> {/* spacer */}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 text-center md:text-left">Welcome Back</h2>

            <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-1">
                   Enter Your Mail <span className="text-red-500">*</span>
                 </label>
                 <div className="relative group">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required type="email" name="email" autoComplete="username" placeholder="admin@xelpay.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white" />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-1">
                   Enter Your Password <span className="text-red-500">*</span>
                 </label>
                 <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white" />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                 </div>
               </div>

               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 cursor-pointer select-none">
                   <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Remember me</span>
                 </label>
                 <Link href={`/forgot-password${mode==='demo'?'?mode=demo':''}`} className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</Link>
               </div>

               <div className="flex justify-center">
                 <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} theme="light" />
               </div>

               <button disabled={loading} type="submit" className="w-full bg-blue-600 disabled:bg-blue-700 text-white py-4 rounded-xl font-bold text-base hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30">
                 {loading ? (
                   <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authenticating...</>
                 ) : (
                   <>Sign In Securely <LogIn size={18} /></>
                 )}
               </button>

               {mode === 'demo' && (
                 <Link href="/login" className="w-full block text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                   Login Your Account
                 </Link>
               )}
            </form>

            {mode !== 'demo' && (
              <>
                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div></div>
                  <span className="relative px-4 bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] text-[10px] font-black text-slate-400 uppercase tracking-widest">Or</span>
                </div>

                <button onClick={handleGoogleLogin} disabled={googleLoading} className="w-full bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-300 dark:border-slate-700 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                      Sign in with Google
                    </>
                  )}
                </button>

                <p className="mt-5 text-center text-slate-500 text-sm font-medium">
                  New to XelPay? <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline ml-1">Create Account</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <SuspendedModal isOpen={showSuspendedModal} telegramLink={telegramLink} onClose={() => setShowSuspendedModal(false)} />
    </div>
  );
}

export default function Login() {
  return <Suspense fallback={<div>Loading...</div>}><LoginContent /></Suspense>;
}