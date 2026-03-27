'use client';

import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';

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
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [telegramLink, setTelegramLink] = useState('#');

  useEffect(() => {
    if (mode === 'demo') {
      setEmail('demo@xelpay.com');
      setPassword('demo123456');
      toast.success("Demo credentials loaded securely!", { icon: '✨' });
    }
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) toast.error("Please verify your email address first.");
      else if (error.message.toLowerCase().includes("invalid login credentials")) toast.error("Wrong email or password! Please try again.");
      else toast.error(error.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: merchant } = await supabase.from('merchants').select('status').eq('id', authData.user.id).single();

      if (merchant?.status === 'suspended') {
        await supabase.auth.signOut();
        const { data: settings } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram').maybeSingle();
        if (settings) setTelegramLink(settings.value);
        setShowSuspendedModal(true);
        setLoading(false);
        return;
      }

      toast.success("Authentication successful! Redirecting...", { icon: '🔐' });
      
      // ✅ FIX: Using window.location to force server-side cookie refresh and proper redirect
      window.location.href = '/dashboard';
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
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex items-center justify-center p-4 md:p-6 transition-colors duration-500 font-sans">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] md:bg-white md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl p-6 md:p-10 border-0 md:border md:border-slate-100 dark:border-slate-800 flex flex-col justify-center min-h-[80vh] md:min-h-0 relative z-10">
        
        {mode === 'demo' && (
          <div className="absolute top-0 md:-top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-6 py-1.5 rounded-b-xl md:rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap z-20 animate-pulse">
            Test Demo Mode Active
          </div>
        )}

        <div className="text-center mb-10 mt-6 md:mt-2">
          <Link href="/" className="inline-flex items-center gap-1 group mb-6">
            <span className="text-4xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Welcome Back</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
           <div className="space-y-1.5">
             <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input required type="email" name="email" autoComplete="username" placeholder="admin@xelpay.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white" />
             </div>
           </div>

           <div className="space-y-1.5">
             <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input required type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white" />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
             </div>
           </div>

           <div className="flex justify-end pr-1"><Link href={`/forgot-password${mode==='demo'?'?mode=demo':''}`} className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</Link></div>

           <button disabled={loading} type="submit" className="w-full bg-blue-600 disabled:bg-blue-700 text-white py-4 rounded-xl font-bold text-base hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30">
             {loading ? (
               <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authenticating...</>
             ) : (
               <>Sign In Securely <LogIn size={18} /></>
             )}
           </button>
        </form>

        {mode !== 'demo' && (
          <>
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div></div>
              <span className="relative px-4 bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] text-[10px] font-black text-slate-400 uppercase tracking-widest">Or</span>
            </div>

            <button onClick={handleGoogleLogin} disabled={googleLoading} className="w-full bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-300 dark:border-slate-700 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {/* ✅ FIX: Added the specific colorful Google Logo you requested */}
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                  Sign in with Google
                </>
              )}
            </button>

            <p className="mt-8 text-center text-slate-500 text-sm font-medium">
              New to XelPay? <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline ml-1">Create Account</Link>
            </p>
          </>
        )}
      </div>
      <SuspendedModal isOpen={showSuspendedModal} telegramLink={telegramLink} onClose={() => setShowSuspendedModal(false)} />
    </div>
  );
}

export default function Login() {
  return <Suspense fallback={<div>Loading...</div>}><LoginContent /></Suspense>;
}