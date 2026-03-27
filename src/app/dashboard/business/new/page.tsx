'use client';

import { useState } from 'react';
import { Building2, Globe, Mail, Phone, ArrowRight, Loader2, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function NewBusiness() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Show Keys
  
  // Form Data
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    supportEmail: '',
    supportPhone: ''
  });

  // Generated Keys
  const [keys, setKeys] = useState({ publicKey: '', secretKey: '' });

  // Secure Key Generator Helper
  const generateKey = (prefix: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}_${key}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }

    // 2. Generate Highly Secure Keys
    const pubKey = generateKey('xp_pub');
    const secKey = generateKey('xp_sec');
    const whSecret = generateKey('whsec');

    // 3. Insert into database
    const { error } = await supabase.from('businesses').insert({
      merchant_id: user.id,
      business_name: formData.businessName,
      website_url: formData.websiteUrl,
      support_email: formData.supportEmail,
      support_phone: formData.supportPhone,
      public_key: pubKey,
      secret_key: secKey,
      webhook_secret: whSecret,
      status: 'active'
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setKeys({ publicKey: pubKey, secretKey: secKey });
      toast.success("Workspace created successfully!");
      setStep(2); // Move to Keys Screen
      
      // Trigger sidebar to update business list
      window.dispatchEvent(new Event('businessChanged'));
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Workspace</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Add a new business to generate separate API keys and track analytics independently.</p>
      </div>

      {step === 1 ? (
        <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Business / App Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input required type="text" placeholder="e.g. Easy Earn App" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Website URL (Optional)</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input type="url" placeholder="https://easyearn.com" value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Support Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input required type="email" placeholder="support@domain.com" value={formData.supportEmail} onChange={(e) => setFormData({...formData, supportEmail: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Support Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input required type="tel" placeholder="+880 1..." value={formData.supportPhone} onChange={(e) => setFormData({...formData, supportPhone: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                </div>
              </div>
            </div>

            <div className="pt-4">
               <button disabled={loading} type="submit" className="w-full bg-blue-600 disabled:bg-slate-400 text-white py-4 rounded-xl font-bold text-base hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30">
                 {loading ? <><Loader2 className="animate-spin" size={20}/> Creating Workspace...</> : <>Create Workspace <ArrowRight size={20} /></>}
               </button>
            </div>
          </form>
        </div>
      ) : (
        /* 🚀 Step 2: The "Show Once" Keys Screen */
        <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm animate-in zoom-in-95 duration-500 text-center">
          
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Workspace Ready!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm max-w-lg mx-auto">
            Your business has been added successfully. Use the API keys below to connect your plugins or custom integrations.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-4 mb-8 text-left flex gap-3 items-start">
             <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="text-sm font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest mb-1">Important Warning</h4>
               <p className="text-xs font-bold text-yellow-700 dark:text-yellow-600/80">Please copy your <b>Secret Key</b> right now. For security reasons, you will not be able to see it again after leaving this page. If you lose it, you will need to generate a new one.</p>
             </div>
          </div>

          <div className="space-y-4 text-left">
            {/* Public Key */}
            <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
               <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Public Key (Safe to share)</p>
                 <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 truncate">{keys.publicKey}</p>
               </div>
               <button onClick={() => copyToClipboard(keys.publicKey, 'Public Key')} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 hover:shadow-sm border border-slate-200 dark:border-slate-700 transition-all shrink-0">
                 <Copy size={18} />
               </button>
            </div>

            {/* Secret Key */}
            <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
               <div className="overflow-hidden pl-2">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">Secret Key (Keep it hidden)</p>
                 <p className="text-sm font-mono font-bold text-slate-900 dark:text-white truncate">{keys.secretKey}</p>
               </div>
               <button onClick={() => copyToClipboard(keys.secretKey, 'Secret Key')} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 hover:shadow-sm border border-slate-200 dark:border-slate-700 transition-all shrink-0">
                 <Copy size={18} />
               </button>
            </div>
          </div>

          <button onClick={() => window.location.href='/dashboard'} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-8 hover:-translate-y-1 transition-all shadow-lg">
            I Have Saved My Keys → Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}