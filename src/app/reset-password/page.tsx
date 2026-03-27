'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Supabase automatically handles the session when clicking the email link
  // So we just need to update the user's password.
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match! Please try again.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
    }
    
    setLoading(false);
  };

  return (
    // ✅ Outer container: Solid background on mobile, subtle background on desktop
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex items-center justify-center p-4 md:p-6 transition-colors duration-500 font-sans">
      <Toaster position="top-center" richColors />
      
      {/* ✅ Inner container: fully blended on mobile, Pro Card on desktop */}
      <div className="w-full max-w-md bg-white dark:bg-[#0B1120] md:bg-white md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl p-6 md:p-10 border-0 md:border md:border-slate-100 dark:border-slate-800 flex flex-col justify-center min-h-[80vh] md:min-h-0 relative z-10">
        
        {/* Brand Logo */}
        <div className="text-center mb-10 mt-4 md:mt-0">
          <Link href="/" className="inline-flex items-center gap-1 group mb-2">
            <span className="text-4xl font-black text-blue-600 tracking-tighter group-hover:scale-105 transition-transform">X</span>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
        </div>

        {!success ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight text-center md:text-left">Set New Password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm text-center md:text-left">
              Please enter your new security password below to regain access to your dashboard.
            </p>
            
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              
              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white placeholder:text-slate-400 transition-all font-medium text-sm" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    required 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white placeholder:text-slate-400 transition-all font-medium text-sm" 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button 
                disabled={loading} 
                className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold text-base hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'} 
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500 py-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Password Updated!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
              Your password has been changed successfully. You can now use your new password to log in.
            </p>
            <button 
              onClick={() => router.push('/login')} 
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all flex justify-center items-center gap-2"
            >
              Proceed to Login <ArrowRight size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}