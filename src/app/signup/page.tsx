'use client';

import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, User, MapPin, CheckCircle, ArrowRight, X, AlertCircle, LogIn, Users, Loader2, EyeOff, Eye } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';

// --- Reusable Modals ---
const ErrorModal = ({ isOpen, message, onClose }: any) => {
  const router = useRouter();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 text-center border border-red-100 dark:border-red-900/30 shadow-2xl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={36} /></div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Attention</h3>
        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-2">{message}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/login')} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"><LogIn size={18} /> Login Now</button>
          <button onClick={onClose} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-100 transition-all">Try Again</button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, merchantId, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in-95">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={36} /></div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Success!</h3>
        <p className="text-slate-500 text-sm font-medium mb-6">Account created. Please check your email to verify your account.</p>
        <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Your Merchant ID</span>
           <span className="text-2xl font-black text-blue-600">#{merchantId}</span>
        </div>
        <button onClick={onClose} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Go to Login</button>
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

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [tempMerchantId, setTempMerchantId] = useState('');
  
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);
  
  const [countryCode, setCountryCode] = useState('+880');
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', address: '', referCode: refCodeFromUrl
  });

  // --- Fetch Plans ---
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

  const generate6DigitID = () => Math.floor(100000 + Math.random() * 900000).toString();

  // --- Google OAuth ---
  const handleGoogleSignUp = async () => {
    if (mode === 'demo') {
      toast.error("You don't need to create a new account in demo mode. Please login with demo@xelpay.com / demo123456", { duration: 5000 });
      return;
    }

    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?plan_id=${selectedPlan?.id}&ref=${formData.referCode}`,
      }
    });
    if (error) {
      setErrorModal({ show: true, message: error.message });
      setGoogleLoading(false);
    }
  };

  // --- Email/Pass Registration Logic ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Demo Mode Restriction
    if (mode === 'demo') {
      toast.error("Demo Mode: No need to register. Please go to Login and use demo@xelpay.com / Password: demo123456", { duration: 5000 });
      return;
    }

    if (!selectedPlan) return alert("Please select a plan.");
    setLoading(true);

    const fullPhone = `${countryCode}${formData.phone.replace(/\s/g, '')}`;

    // 1. Check Duplicates in Merchants Table
    const { data: existingUser } = await supabase
      .from('merchants')
      .select('email, phone')
      .or(`email.eq.${formData.email},phone.eq.${fullPhone}`)
      .maybeSingle();

    if (existingUser) {
      setErrorModal({ 
        show: true, 
        message: existingUser.email === formData.email 
          ? "This email is already registered. Please login." 
          : "This phone number is already registered to another account."
      });
      setLoading(false);
      return;
    }

    const merchantDisplayId = generate6DigitID();

    // 2. Supabase Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName }
      }
    });

    if (authError) {
      setErrorModal({ show: true, message: authError.message });
      setLoading(false);
      return;
    }

    // 3. Insert into Merchants Table (Using upsert with slug explicitly null)
    if (authData.user) {
      const { error: dbError } = await supabase.from('merchants').upsert({
        id: authData.user.id, 
        merchant_id_display: merchantDisplayId,
        slug: null, // explicitly null
        name: formData.fullName, 
        email: formData.email,
        phone: fullPhone,
        address: formData.address,
        currency: 'BDT',
        status: 'pending', 
        plan_id: selectedPlan.id,
        referred_by: formData.referCode || null, 
        is_demo: false
      });

      if (dbError) {
        console.error("DB Insert Error:", dbError);
        setErrorModal({ show: true, message: `System saved your auth but failed to create merchant profile. Contact support.` });
      } else {
        setTempMerchantId(merchantDisplayId);
        setShowSuccess(true);
      }
    }
    setLoading(false);
  };return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] flex items-center justify-center md:p-12 transition-colors duration-500 font-sans">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-8 items-start bg-white dark:bg-[#0B1120] md:bg-transparent md:dark:bg-transparent rounded-none md:rounded-[3rem]">
        
        {/* Left Side: Order Cart */}
        <div className="lg:col-span-4 sticky top-0 md:top-28 z-20 bg-white dark:bg-[#0B1120] md:bg-transparent md:dark:bg-transparent p-6 md:p-0 border-b border-slate-100 dark:border-slate-800 md:border-0 shadow-sm md:shadow-none">
          <div className="md:bg-white md:dark:bg-[#111827] md:rounded-3xl md:p-8 md:shadow-xl md:border md:border-slate-200 md:dark:border-slate-800">
            
            {/* Demo Mode Banner */}
            {mode === 'demo' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-6 py-1.5 rounded-b-xl uppercase tracking-widest shadow-lg whitespace-nowrap z-20 animate-pulse">
                Demo Mode Active
              </div>
            )}

            <div className="flex justify-between items-center mb-6 mt-4 md:mt-0">
              <Link href="/" className="flex items-center gap-1 group">
                <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter group-hover:scale-105 transition-transform">X</span>
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
              </Link>
              <button onClick={() => setShowPlanSwitcher(true)} className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-full uppercase hover:bg-blue-600 hover:text-white transition-all">Change Plan</button>
            </div>
            
            {selectedPlan ? (
              <div className="p-5 md:p-6 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
                <h4 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase">{selectedPlan.name}</h4>
                <div className="mt-2 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-blue-600">৳{selectedPlan.price}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">/month</span>
                </div>
                <ul className="space-y-2 hidden md:block">
                  {selectedPlan.features && (Array.isArray(selectedPlan.features) ? selectedPlan.features : JSON.parse(selectedPlan.features)).slice(0, 4).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="lg:col-span-8 md:bg-white md:dark:bg-[#111827] rounded-none md:rounded-[3rem] md:shadow-2xl p-6 md:p-12 md:border md:border-slate-200 md:dark:border-slate-800">
          <div className="mb-10 text-center lg:text-left mt-2 md:mt-0">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Create Account</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Enter your personal details to get started.</p>
          </div>

          <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Full Name (Personal)</label>
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm text-slate-900 dark:text-white" placeholder="e.g. Rahim Ahmed" onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div>
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Personal Email Address</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required type="email" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm text-slate-900 dark:text-white" placeholder="rahim@gmail.com" onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Mobile Number</label>
              <div className="flex bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-transparent border-r border-slate-200 dark:border-slate-800 px-3 py-3.5 outline-none text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer appearance-none shrink-0">
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <input required type="tel" className="w-full px-4 py-3.5 bg-transparent outline-none font-medium text-sm text-slate-900 dark:text-white" placeholder="1712 345678" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            {/* ✅ Password Field with Generator and AutoComplete */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required type={showPassword ? "text" : "password"} 
                  name="password" autoComplete="new-password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm text-slate-900 dark:text-white" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between items-center px-1 mt-1">
                 <span className={`text-[9px] font-bold ${formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`}>
                   Min 8 chars, 1 uppercase, 1 number
                 </span>
                 <button type="button" 
                    onClick={() => {
                      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                      let gen = "";
                      for(let i=0; i<14; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                      gen = "Xp9!" + gen.slice(4); 
                      setFormData({...formData, password: gen});
                      setShowPassword(true);
                    }} 
                    className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest cursor-pointer">
                   Generate Strong
                 </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">City / Address</label>
              <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm text-slate-900 dark:text-white" placeholder="Dhaka, Bangladesh" onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Referral Code (Optional)</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" value={formData.referCode} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] md:dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-medium text-slate-900 dark:text-white" placeholder="Have a referral code?" onChange={(e) => setFormData({...formData, referCode: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
               <button disabled={loading || !selectedPlan} className="w-full bg-blue-600 disabled:bg-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                 {loading ? (
                   <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Creating Workspace...</>
                 ) : (
                   <>Create Account <ArrowRight size={20} /></>
                 )}
               </button>
            </div>
          </form>

          {/* ✅ Demo Mode Hides Google Auth */}
          {mode !== 'demo' && (
            <>
              <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>

              <button onClick={handleGoogleSignUp} disabled={googleLoading || !selectedPlan} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] text-slate-700 dark:text-white border border-slate-300 dark:border-slate-700 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                {googleLoading ? <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div> : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </>
          )}

          <p className="text-center mt-6 text-sm font-medium text-slate-500">Already registered? <Link href={`/login${mode === 'demo' ? '?mode=demo' : ''}`} className="text-blue-600 font-bold hover:text-blue-700 hover:underline ml-1">Sign In Here</Link></p>
        </div>
      </div>

      <SuccessModal isOpen={showSuccess} merchantId={tempMerchantId} onClose={() => router.push('/login')} />
      <ErrorModal isOpen={errorModal.show} message={errorModal.message} onClose={() => setErrorModal({ show: false, message: '' })} />

      {/* Plan Selection Modal */}
      {showPlanSwitcher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111827] w-full max-w-5xl rounded-[2rem] p-6 md:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden h-[90vh] md:h-auto overflow-y-auto">
            <button onClick={() => setShowPlanSwitcher(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:rotate-90 transition-all"><X size={24}/></button>
            <div className="text-center mb-10 mt-4 md:mt-0"><h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Choose Your Business Plan</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allPlans.map((p: any) => (
                <div key={p.id} onClick={() => {setSelectedPlan(p); setShowPlanSwitcher(false);}} className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer group hover:-translate-y-1 ${selectedPlan?.id === p.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg' : 'border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1120]'}`}>
                   <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{p.name}</h4>
                   <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-black text-blue-600">৳{p.price}</span><span className="text-[10px] font-bold text-slate-400 uppercase">/mo</span></div>
                   <ul className="space-y-3 mb-8">
                    {p.features && (Array.isArray(p.features) ? p.features : JSON.parse(p.features)).map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs font-medium text-slate-600 dark:text-slate-400"><CheckCircle size={14} className="text-blue-600 shrink-0 mt-0.5"/> {f}</li>
                    ))}
                   </ul>
                   <div className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${selectedPlan?.id === p.id ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50'}`}>Select Plan</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400 animate-pulse tracking-widest bg-white dark:bg-[#0B1120]">Loading System...</div>}>
      <SignUpContent />
    </Suspense>
  );
}