'use client';

import { useState, Suspense } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [email, setEmail] = useState(mode === 'demo' ? 'demo@xelpay.com' : '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ✅ Demo Account Bypass Logic
    const { data: checkDemo } = await supabase.from('merchants').select('is_demo').eq('email', email.trim()).maybeSingle();
    
    if (checkDemo?.is_demo || mode === 'demo') {
      // ফেইক নেটওয়ার্ক ডিলে (যাতে আসল মনে হয়)
      setTimeout(() => {
        setSent(true);
        toast.success("Recovery link sent successfully!");
        setLoading(false);
      }, 1500);
      return;
    }

    // Normal User Reset Logic
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Recovery link sent successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex items-center justify-center p-4 md:p-6 transition-colors duration-500 font-sans">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] md:bg-white md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl p-6 md:p-10 border-0 md:border border-slate-100 dark:border-slate-800 flex flex-col justify-center min-h-[80vh] md:min-h-0 relative z-10">
        
        {/* Brand Logo */}
        <div className="text-center mb-10"><Link href="/" className="inline-flex items-center gap-1 group"><span className="text-4xl font-black text-blue-600">X</span><span className="text-3xl font-bold text-slate-900 dark:text-white -ml-0.5">elPay</span></Link></div>

        {!sent ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight text-center md:text-left">Reset Password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm text-center md:text-left">Enter your registered email and we'll send you a secure recovery link.</p>
            
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-1.5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="email" value={email} placeholder="admin@xelpay.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white" onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              
              <button disabled={loading} className="w-full bg-blue-600 disabled:bg-blue-700 text-white py-4 rounded-xl font-bold text-base hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Scanning...</>
                ) : (
                  <>Send Reset Link <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500 py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Check Your Email</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">We've successfully sent a password recovery link to <br/><b className="text-slate-800 dark:text-slate-200">{email}</b></p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 font-bold hover:text-blue-600"><ArrowLeft size={16} /> Back to secure Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return <Suspense fallback={<div>Loading...</div>}><ForgotPasswordContent /></Suspense>;
}