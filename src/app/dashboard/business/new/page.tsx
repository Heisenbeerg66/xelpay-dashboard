'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, ArrowRight, Loader2, DollarSign, ShieldAlert, Smartphone, ShoppingBag, LayoutGrid } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { autoVerifyBusiness } from '@/lib/verify-business';

export default function NewBusiness() {
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  
  // Plan & Limit Data
  const [planData, setPlanData] = useState<any>(null);
  const [businessCount, setBusinessCount] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Website', 
    websiteUrl: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'BDT',
    exchangeRate: ''
  });

  // Fetch Merchant Plan Limits & Current Business Count
  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: merchant } = await supabase.from('merchants').select('plan_id').eq('id', user.id).single();
        if (merchant?.plan_id) {
           const { data: plan } = await supabase.from('plans').select('business_limit, allowed_method').eq('id', merchant.plan_id).single();
           setPlanData(plan);
        }
        const { count } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('merchant_id', user.id);
        setBusinessCount(count || 0);
      }
      setFetchingPlan(false);
    }
    loadInitialData();
  }, []);

  // 🚀 FIXED: JSONB ডেটা সঠিকভাবে চেক করার লজিক
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    
    // JSONB ডেটা অবজেক্ট বা অ্যারে যাই হোক না কেন, নিরাপদে চেক করার জন্য স্ট্রিংয়ে রূপান্তর করা হয়েছে
    const allowedMethodsStr = JSON.stringify(planData?.allowed_method || {}).toLowerCase();
    const isInternationalAllowed = allowedMethodsStr.includes('international') || allowedMethodsStr.includes('global');

    if (val === 'USD' && !isInternationalAllowed) {
       toast.error("আপনার বর্তমান প্ল্যানে ইন্টারন্যাশনাল পেমেন্ট বা USD সাপোর্ট নেই। দয়া করে প্ল্যান আপগ্রেড করুন।");
       setFormData(prev => ({ ...prev, currency: 'BDT' })); // জোরপূর্বক BDT তে ফেরত পাঠানো
       return;
    }
    setFormData(prev => ({ ...prev, currency: val }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 11) {
      setFormData(prev => ({ ...prev, supportPhone: val }));
    }
  };

  const generateSecureKey = (prefix: string, byteLength = 32) => {
    const array = new Uint8Array(byteLength);
    window.crypto.getRandomValues(array);
    const randomStr = Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${randomStr}`;
  };

  const generateRandomStr = (length: number, numbersOnly = false) => {
    const chars = numbersOnly ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) result += chars[array[i] % chars.length];
    return result;
  };

  const generateSlug = async (name: string) => {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let isUnique = false;
    let currentSlug = baseSlug;
    let counter = 1;

    while (!isUnique) {
      const { data } = await supabase.from('businesses').select('slug').eq('slug', currentSlug).maybeSingle();
      if (!data) {
        isUnique = true;
      } else {
        currentSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    return currentSlug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (planData && businessCount >= planData.business_limit) {
       return toast.error(`আপনার প্ল্যানের লিমিট শেষ (${planData.business_limit} টি)। আরো Business অ্যাড করতে আপগ্রেড করুন।`);
    }

    if (formData.supportPhone.length < 11 || !formData.supportPhone.startsWith('0')) {
       return toast.error("ফোন নম্বর অবশ্যই 0 দিয়ে শুরু হতে হবে এবং ১১ ডিজিটের হতে হবে।");
    }

    if (formData.currency === 'USD' && !formData.exchangeRate) {
       return toast.error("USD সিলেক্ট করলে Exchange Rate বসানো বাধ্যতামূলক।");
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const pubKey = generateSecureKey('xp_pub', 16);
      const secKey = generateSecureKey('xp_sec', 32);
      const whSecret = generateSecureKey('whsec', 24);
      const telegramLinkCode = generateRandomStr(12, true);
      const deviceConnKey = generateRandomStr(24);
      const slug = await generateSlug(formData.businessName);

      const { data: newBusiness, error } = await supabase.from('businesses').insert({
        merchant_id: user.id,
        business_name: formData.businessName,
        slug: slug,
        business_type: formData.businessType,
        website_url: formData.websiteUrl,
        support_email: formData.supportEmail,
        support_phone: formData.supportPhone,
        public_key: pubKey,
        secret_key: secKey,
        webhook_secret: whSecret,
        telegram_link_code: telegramLinkCode,
        device_connection_key: deviceConnKey,
        currency: formData.currency,
        exchange_rate: formData.currency === 'USD' ? parseFloat(formData.exchangeRate) : null,
        status: 'pending'
      }).select().single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Business submitted! Verification is in progress (takes up to 24-48 hours).");
      window.dispatchEvent(new Event('businessChanged'));
      
      // Background Auto Verify Trigger
      if (formData.businessType === 'Website' || formData.businessType === 'F Commerce') {
         autoVerifyBusiness(newBusiness.id, formData.websiteUrl);
      }
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLinkConfig = () => {
    switch (formData.businessType) {
      case 'Mobile App': return { label: 'App URL (Play Store/App Store)', icon: Smartphone, placeholder: 'https://play.google.com/...' };
      case 'F Commerce': return { label: 'Facebook Page Link', icon: ShoppingBag, placeholder: 'https://facebook.com/yourpage' };
      default: return { label: 'Website URL', icon: Globe, placeholder: 'https://yourwebsite.com' };
    }
  }
  const linkConfig = getLinkConfig();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Workspace</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Provide your business details. All fields are required to proceed.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-[2rem] border border-slate-200 dark:border-slate-800/60 p-6 md:p-10 shadow-sm">
        
        {/* Strict Legal Warning Banner */}
        <div className="mb-8 p-4 md:p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex gap-4 items-start">
           <ShieldAlert className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={24} />
           <div>
             <h4 className="text-sm font-black text-red-800 dark:text-red-400 uppercase tracking-widest mb-1.5">Strict Legal Policy</h4>
             <p className="text-xs font-bold text-red-700 dark:text-red-300/80 leading-relaxed">
               বেটিং (Betting), জুয়া, পর্নোগ্রাফি বা বাংলাদেশের আইনে নিষিদ্ধ এমন কোনো অবৈধ ওয়েবসাইট, অ্যাপ বা বিজনেস এলাও করা হবে না। 
               আমাদের অটোমেটেড সিস্টেম এবং অ্যাডমিন প্যানেল এটি নিবিড়ভাবে যাচাই করবে। ভেরিফিকেশন ফেইল হলে বা পরবর্তীতে এমন কিছু পাওয়া গেলে অ্যাকাউন্ট ও ব্যালেন্স স্থায়ীভাবে বাতিল করা হবে। 
               <a href="/info/terms" target="_blank" rel="noreferrer" className="underline ml-1 hover:text-red-900 dark:hover:text-red-200">Terms & Conditions পড়ুন</a>.
             </p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                Business / App Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <input required type="text" placeholder="e.g. Easy Earn App" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <select required value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value, websiteUrl: ''})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all appearance-none">
                  <option value="Website">Website</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="F Commerce">F-Commerce (Facebook)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
              {linkConfig.label} <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <linkConfig.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
              <input required type="url" placeholder={linkConfig.placeholder} value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                Support Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <input required type="email" placeholder="support@domain.com" value={formData.supportEmail} onChange={(e) => setFormData({...formData, supportEmail: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                Support Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <input required type="tel" placeholder="01XXXXXXXXX" value={formData.supportPhone} onChange={handlePhoneChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                Base Currency <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <select required value={formData.currency} onChange={handleCurrencyChange} disabled={fetchingPlan} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all appearance-none disabled:opacity-50">
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            {formData.currency === 'USD' && (
              <div className="space-y-1.5 animate-in zoom-in-95 duration-300">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider flex items-center gap-1">
                  Exchange Rate (USD to BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-[#2E7D32] transition-colors">৳</span>
                  <input required type="number" step="0.01" placeholder="e.g. 120.50" value={formData.exchangeRate} onChange={(e) => setFormData({...formData, exchangeRate: e.target.value})} className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-6">
             <button disabled={loading || fetchingPlan} type="submit" className="w-full bg-gradient-to-r from-[#124329] to-[#2E7D32] hover:from-[#0d331f] hover:to-[#215a24] disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#124329]/20 uppercase">
               {loading || fetchingPlan ? <><Loader2 className="animate-spin" size={20}/> Processing...</> : <>Submit for Approval <ArrowRight size={20} /></>}
             </button>
             <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">By submitting, you agree to our verification process. Results take 24-48 hours.</p>
          </div>
        </form>
      </div>
    </div>
  );
}