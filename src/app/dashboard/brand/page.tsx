'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Image as ImageIcon, Globe, CheckCircle, Loader2, Save, Building2, 
  Mail, Phone, UploadCloud, Plus, Trash2, Facebook, MessageSquare, 
  Info, Youtube, MessageCircle, DollarSign, Languages, ShieldCheck, Key, 
  RefreshCw, Activity, Copy, ShieldAlert, ChevronLeft, Send, Eye, Edit3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { testWebhookUrl, verifyDomain } from '@/lib/verify-business';

type Tab = 'Grid' | 'General' | 'Logo' | 'GTM' | 'FAQ' | 'API & Verification' | 'Meta Pixel' | 'Order Box';

export default function BrandSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessStatus, setBusinessStatus] = useState<string>('pending');
  const [supportTelegram, setSupportTelegram] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('Grid');
  
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [planData, setPlanData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '', business_type: '', website_url: '', currency: 'BDT', language: 'en', gtm_id: '',
    street_address: '', city: '', country: '', zip_code: '',
    support_email: '', support_phone: '', support_website: '',
    social_links: { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
    meta_pixel: { enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' },
    order_boxes: [] as { id: string, label: string, message: string, url: string }[],
    faq: [] as { q: string, a: string }[],
    logo_url: '', webhook_url: '', success_url: '', cancel_url: '',
    public_key: '', secret_key: '', webhook_secret: '', domain_verify_code: '', is_domain_verified: false
  });

  const fetchInitialData = async (id: string) => {
    setLoading(true);
    
    // Fetch Global Settings for Support Telegram
    const { data: settingsData } = await supabase.from('site_settings').select('value').eq('key_name', 'support_telegram').single();
    if (settingsData?.value) setSupportTelegram(settingsData.value);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: merchant } = await supabase.from('merchants').select('plan_id').eq('id', user.id).single();
      if (merchant?.plan_id) {
         const { data: plan } = await supabase.from('plans').select('allowed_method').eq('id', merchant.plan_id).single();
         setPlanData(plan);
      }
      setFetchingPlan(false);

      const { data } = await supabase.from('businesses').select('*').eq('id', id).single();
      if (data) {
        setBusinessStatus(data.status);

        let verifyCode = data.domain_verify_code;
        if (!verifyCode) {
          verifyCode = `xp-verify-${Math.random().toString(36).substring(2, 15)}`;
          await supabase.from('businesses').update({ domain_verify_code: verifyCode }).eq('id', id);
        }

        setFormData({
          business_name: data.business_name || '', business_type: data.business_type || 'Website', website_url: data.website_url || '',
          currency: data.currency || 'BDT', language: data.language || 'en', gtm_id: data.gtm_id || '',
          street_address: data.street_address || '', city: data.city || '', country: data.country || '', zip_code: data.zip_code || '',
          support_email: data.support_email || '', support_phone: data.support_phone || '', support_website: data.support_website || '',
          social_links: { ...{ fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' }, ...(data.social_links || {}) },
          meta_pixel: { ...{ enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' }, ...(data.meta_pixel || {}) },
          order_boxes: data.order_boxes || [], faq: data.faq || [], logo_url: data.logo_url || '',
          webhook_url: data.webhook_url || '', success_url: data.success_url || '', cancel_url: data.cancel_url || '',
          public_key: data.public_key || '', secret_key: data.secret_key || '', webhook_secret: data.webhook_secret || '',
          domain_verify_code: verifyCode, is_domain_verified: data.is_domain_verified || false
        });
        setImagePreview(data.logo_url || null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadActiveBusiness = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) { setBusinessId(activeId); fetchInitialData(activeId); } 
      else setLoading(false);
    };
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const allowedMethodsStr = JSON.stringify(planData?.allowed_method || {}).toLowerCase();
    const isInternationalAllowed = allowedMethodsStr.includes('international') || allowedMethodsStr.includes('global');

    if (val === 'USD' && !isInternationalAllowed) {
       toast.error("Your current plan does not support International payments or USD. Please upgrade your plan.");
       setFormData(prev => ({ ...prev, currency: 'BDT' }));
       return;
    }
    setFormData(prev => ({ ...prev, currency: val }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image size must be less than 2MB");
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToSupabaseStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${businessId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('business_logos').upload(fileName, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('business_logos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleVerifyDomain = async () => {
    if (!businessId || !formData.website_url) return toast.error("Website URL is missing.");
    setVerifyingDomain(true);
    const result = await verifyDomain(businessId, formData.website_url, formData.domain_verify_code);
    if (result.success) { toast.success(result.message); setFormData(p => ({ ...p, is_domain_verified: true })); } 
    else toast.error(result.message);
    setVerifyingDomain(false);
  };

  const handleTestWebhook = async () => {
    if (!formData.webhook_url) return toast.error("Please enter a webhook URL.");
    setTestingWebhook(true);
    const result = await testWebhookUrl(formData.webhook_url, formData.webhook_secret);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setTestingWebhook(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    if (!formData.business_name || !formData.support_email || !formData.support_phone) {
       return toast.error("Name, Email, and Phone are mandatory!");
    }
    
    setSaving(true);
    let finalLogoUrl = formData.logo_url;

    try {
      if (selectedImageFile) {
        toast.loading("Uploading logo securely...", { id: 'upload' });
        finalLogoUrl = await uploadToSupabaseStorage(selectedImageFile);
        toast.dismiss('upload');
      }

      const { error } = await supabase.from('businesses').update({
        business_name: formData.business_name, currency: formData.currency, language: formData.language,
        gtm_id: formData.gtm_id, street_address: formData.street_address, city: formData.city,
        country: formData.country, zip_code: formData.zip_code, support_email: formData.support_email,
        support_phone: formData.support_phone, support_website: formData.support_website,
        social_links: formData.social_links, meta_pixel: formData.meta_pixel, order_boxes: formData.order_boxes,
        faq: formData.faq, logo_url: finalLogoUrl, webhook_url: formData.webhook_url,
        success_url: formData.success_url, cancel_url: formData.cancel_url,
      }).eq('id', businessId);

      if (error) throw error;
      
      // Context Specific Toast
      let toastMsg = "Settings saved successfully!";
      if (activeTab === 'General') toastMsg = "General settings updated!";
      else if (activeTab === 'Logo') toastMsg = "Brand logo updated successfully!";
      else if (activeTab === 'API & Verification') toastMsg = "API configurations saved!";
      else if (activeTab === 'GTM' || activeTab === 'Meta Pixel') toastMsg = "Tracking settings updated!";
      else if (activeTab !== 'Grid') toastMsg = `${activeTab} updated successfully!`;

      toast.success(toastMsg);
      setFormData(prev => ({ ...prev, logo_url: finalLogoUrl }));
      setSelectedImageFile(null);
      window.dispatchEvent(new Event('businessChanged'));
    } catch (err: any) {
      toast.dismiss('upload');
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Helper arrays for dynamic fields
  const addOrderBox = () => setFormData(p => ({ ...p, order_boxes: [...p.order_boxes, { id: Date.now().toString(), label: '', message: '', url: '' }] }));
  const updateOrderBox = (index: number, field: string, value: string) => { const newB = [...formData.order_boxes]; newB[index] = { ...newB[index], [field]: value }; setFormData(p => ({ ...p, order_boxes: newB })); };
  const removeOrderBox = (index: number) => setFormData(p => ({ ...p, order_boxes: p.order_boxes.filter((_, i) => i !== index) }));
  
  const addFaq = () => setFormData(p => ({ ...p, faq: [...p.faq, { q: '', a: '' }] }));
  const updateFaq = (index: number, field: 'q'|'a', value: string) => { const newF = [...formData.faq]; newF[index][field] = value; setFormData(p => ({ ...p, faq: newF })); };
  const removeFaq = (index: number) => setFormData(p => ({ ...p, faq: p.faq.filter((_, i) => i !== index) }));

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#2E7D32]" size={32} /></div>;

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 mt-1 text-sm">Please select a business from the sidebar switcher.</p>
      </div>
    );
  }

  // 🚀 Workspace Inactive Check Modal
  if (businessStatus !== 'active') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center relative animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-[#0B1120]/50 backdrop-blur-md z-10 rounded-3xl" />
        <div className="relative z-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in-95">
           <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-5">
             <ShieldAlert size={36} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">Workspace {businessStatus}</h2>
           <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
             আপনার বিজনেসটি বর্তমানে ভেরিফাই হয়নি অথবা পেন্ডিং/সাসপেন্ড অবস্থায় আছে। দয়া করে অ্যাডমিনের অ্যাপ্রুভালের জন্য অপেক্ষা করুন অথবা সরাসরি সাপোর্টে যোগাযোগ করুন।
           </p>
           {supportTelegram && (
             <a href={supportTelegram} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-[#26A5E4] hover:bg-[#1f87bc] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#26A5E4]/30">
               <Send size={18} /> Contact Support
             </a>
           )}
        </div>
      </div>
    );
  }

  // Cards Configuration for Grid View
  const settingCards = [
    { id: 'General', icon: Settings, title: 'General Info', desc: 'Name, currency, contact & social links' },
    { id: 'Logo', icon: ImageIcon, title: 'Brand Logo', desc: 'Upload and manage your business logo' },
    { id: 'API & Verification', icon: Key, title: 'API & Webhooks', desc: 'Domain, API keys & endpoint routing' },
    { id: 'GTM', icon: Activity, title: 'Google Tag Manager', desc: 'Setup GTM container for tracking' },
    { id: 'Meta Pixel', icon: Facebook, title: 'Meta Pixel', desc: 'Manage Facebook events and CAPI' },
    { id: 'Order Box', icon: Info, title: 'Order Boxes', desc: 'Custom notices on checkout page' },
    { id: 'FAQ', icon: MessageSquare, title: 'FAQs', desc: 'Manage customer questions & answers' },
  ];

  const Label = ({ title, required = false }: { title: string, required?: boolean }) => (
    <label className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 block">
      {title} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Workspace Settings</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage configurations for <span className="font-bold text-[#2E7D32]">{formData.business_name}</span>.</p>
      </div>

      {activeTab === 'Grid' ? (
        /* 🚀 GRID VIEW (CARDS) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in zoom-in-95 duration-300">
          {settingCards.map((card) => (
            <button 
              key={card.id} 
              onClick={() => setActiveTab(card.id as Tab)}
              className="group text-left bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 hover:border-[#2E7D32]/50 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#2E7D32]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 text-[#2E7D32] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <card.icon size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">{card.title}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        /* 🚀 FORM VIEW */
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-[2rem] p-6 md:p-10 shadow-sm animate-in slide-in-from-right-8 duration-300">
          
          <button 
            onClick={() => setActiveTab('Grid')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#2E7D32] dark:hover:text-[#2E7D32] mb-8 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Settings Grid
          </button>

          <form onSubmit={handleSave} className="space-y-8 h-full flex flex-col">
            <div className="flex-1">
              
              {/* ================= GENERAL TAB ================= */}
              {activeTab === 'General' && (
                <div className="space-y-10 animate-in fade-in">
                  {/* Basic */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label title="Business Name" required />
                        <input required type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white transition-colors" />
                      </div>
                      <div>
                        <Label title="Currency" required />
                        <select value={formData.currency} onChange={handleCurrencyChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white appearance-none">
                          <option value="BDT">BDT (৳)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <div>
                        <Label title="Checkout Language" />
                        <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white appearance-none">
                          <option value="en">English (EN)</option>
                          <option value="bn">Bangla (BN)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label title="Support Email" required />
                        <input required type="email" value={formData.support_email} onChange={e => setFormData({...formData, support_email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <Label title="Support Phone" required />
                        <input required type="tel" value={formData.support_phone} onChange={e => setFormData({...formData, support_phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label title="Facebook Page URL" />
                        <input type="url" placeholder="https://facebook.com/..." value={formData.social_links.fb_page} onChange={e => setFormData({...formData, social_links: {...formData.social_links, fb_page: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <Label title="WhatsApp Link" />
                        <input type="url" placeholder="https://wa.me/..." value={formData.social_links.whatsapp} onChange={e => setFormData({...formData, social_links: {...formData.social_links, whatsapp: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <Label title="Telegram Link" />
                        <input type="url" placeholder="https://t.me/..." value={formData.social_links.telegram} onChange={e => setFormData({...formData, social_links: {...formData.social_links, telegram: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <Label title="YouTube Channel URL" />
                        <input type="url" placeholder="https://youtube.com/..." value={formData.social_links.youtube} onChange={e => setFormData({...formData, social_links: {...formData.social_links, youtube: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= GTM TAB ================= */}
              {activeTab === 'GTM' && (
                <div className="space-y-6 animate-in fade-in max-w-2xl">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 mb-6">
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2"><Info size={18}/> GTM Integration Instructions</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                      Google Tag Manager (GTM) এর মাধ্যমে আপনি পেমেন্ট পেজের ভিজিটর এবং কনভার্সন ট্র্যাক করতে পারবেন। আপনার GTM একাউন্টে গিয়ে Container ID টি কপি করে নিচে বসিয়ে দিন (যেমন: GTM-XXXXXXX)।
                    </p>
                  </div>
                  <div>
                    <Label title="Google Tag Manager ID" />
                    <input type="text" placeholder="GTM-XXXXXXX" value={formData.gtm_id} onChange={e => setFormData({...formData, gtm_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white font-mono" />
                  </div>
                </div>
              )}

              {/* ================= LOGO TAB ================= */}
              {activeTab === 'Logo' && (
                <div className="space-y-6 animate-in fade-in max-w-lg mx-auto">
                  <div className="flex flex-col items-center justify-center p-10 border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50 dark:bg-[#111827] text-center shadow-inner">
                    {imagePreview ? (
                      <div className="space-y-6 w-full">
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 shadow-md flex items-center justify-center overflow-hidden">
                           <img src={imagePreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                        
                        <div className="flex items-center justify-center gap-3">
                           <button type="button" onClick={() => window.open(imagePreview, '_blank')} className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:scale-105 transition-transform" title="Full Preview">
                             <Eye size={18} />
                           </button>
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                             <Edit3 size={16} /> Edit
                           </button>
                           <button type="button" onClick={() => { setImagePreview(null); setSelectedImageFile(null); setFormData({...formData, logo_url: ''}); }} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:scale-105 transition-transform" title="Delete">
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 w-full py-6">
                        <div className="w-20 h-20 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto"><UploadCloud size={36} /></div>
                        <div>
                          <p className="text-base font-black text-slate-900 dark:text-white">Upload Logo</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">PNG, JPG or WEBP (Max 2MB).</p>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-[#124329] text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg">Choose File</button>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                  </div>
                </div>
              )}

              {/* ================= API & VERIFICATION TAB ================= */}
              {activeTab === 'API & Verification' && (
                <div className="space-y-10 animate-in fade-in">
                  
                  {/* Domain Verify */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-start justify-between mb-4">
                       <div>
                         <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           Domain Ownership {formData.is_domain_verified && <ShieldCheck size={18} className="text-[#2E7D32]" />}
                         </h4>
                         <p className="text-xs font-medium text-slate-500 mt-1">Verify <b>{formData.website_url}</b> to secure your integrations.</p>
                       </div>
                    </div>
                    
                    {!formData.is_domain_verified ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all flex justify-between items-center shadow-sm">
                           <span>{`<meta name="xelpay-verification" content="${formData.domain_verify_code}" />`}</span>
                           <button type="button" onClick={() => copyToClipboard(`<meta name="xelpay-verification" content="${formData.domain_verify_code}" />`, 'Meta Tag')} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#2E7D32] rounded-lg transition-colors"><Copy size={16}/></button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                          <p className="text-[11px] font-medium text-slate-500 max-w-[300px]">Paste this tag inside the <code>&lt;head&gt;</code> section of your website header.</p>
                          <button type="button" onClick={handleVerifyDomain} disabled={verifyingDomain} className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-lg">
                            {verifyingDomain ? <Loader2 size={14} className="animate-spin" /> : 'Verify Domain Now'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-4 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-xl text-[#2E7D32] text-sm font-bold flex items-center gap-2">
                        <CheckCircle size={18}/> Domain verified successfully.
                      </div>
                    )}
                  </div>

                  {/* API Keys */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4">Live API Keys</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="p-5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl group">
                         <div className="flex justify-between items-center mb-3">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Public Key</p>
                           <button type="button" onClick={() => copyToClipboard(formData.public_key, 'Public Key')} className="p-1.5 text-slate-400 bg-white dark:bg-[#0B1120] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#2E7D32] shadow-sm"><Copy size={14}/></button>
                         </div>
                         <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 truncate">{formData.public_key}</p>
                       </div>
                       <div className="p-5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl group">
                         <div className="flex justify-between items-center mb-3">
                           <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Secret Key</p>
                           <button type="button" onClick={() => copyToClipboard(formData.secret_key, 'Secret Key')} className="p-1.5 text-slate-400 bg-white dark:bg-[#0B1120] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#2E7D32] shadow-sm"><Copy size={14}/></button>
                         </div>
                         <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 truncate">••••••••••••••••••••••••••••••••</p>
                       </div>
                    </div>
                  </div>

                  {/* Webhook URLs */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2">Endpoints & Routing</h3>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <Label title="Webhook URL" />
                        <button type="button" onClick={handleTestWebhook} disabled={testingWebhook} className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Activity size={12}/> Test Webhook</button>
                      </div>
                      <input type="url" placeholder="https://..." value={formData.webhook_url} onChange={e => setFormData({...formData, webhook_url: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-mono text-sm text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label title="Success Return URL" />
                        <input type="url" placeholder="https://yoursite.com/success" value={formData.success_url} onChange={e => setFormData({...formData, success_url: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                        <p className="text-[10px] font-medium text-slate-500 mt-1.5">Where customers are redirected after a successful payment.</p>
                      </div>
                      <div>
                        <Label title="Cancel Return URL" />
                        <input type="url" placeholder="https://yoursite.com/failed" value={formData.cancel_url} onChange={e => setFormData({...formData, cancel_url: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white" />
                        <p className="text-[10px] font-medium text-slate-500 mt-1.5">Where customers are redirected if they cancel the payment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= META PIXEL TAB ================= */}
              {activeTab === 'Meta Pixel' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
                     <div>
                       <h3 className="text-sm font-black text-slate-900 dark:text-white">Meta Pixel Tracking</h3>
                       <p className="text-xs text-slate-500 mt-0.5">Enable Facebook Pixel & Conversion API events.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.meta_pixel.enabled} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, enabled: e.target.checked } })} className="sr-only peer" />
                      <div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
                    </label>
                  </div>
                  
                  {formData.meta_pixel.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-slate-200 dark:border-slate-800 rounded-3xl animate-in zoom-in-95">
                      <div>
                        <Label title="Pixel ID" required />
                        <input type="text" placeholder="1234567890" value={formData.meta_pixel.pixel_id} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, pixel_id: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white font-mono" />
                      </div>
                      <div>
                        <Label title="Test Event Code" />
                        <input type="text" placeholder="TESTXXXXX" value={formData.meta_pixel.test_event_code} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, test_event_code: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white font-mono" />
                      </div>
                      <div className="md:col-span-2">
                        <Label title="Access Token (CAPI)" />
                        <textarea placeholder="Paste long token here..." value={formData.meta_pixel.access_token} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, access_token: e.target.value } })} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white font-mono resize-none"></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <Label title="Trigger Event On" required />
                        <select value={formData.meta_pixel.trigger_on} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, trigger_on: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm text-slate-900 dark:text-white appearance-none">
                          <option value="payment_success">When Payment is Successful (Purchase)</option>
                          <option value="checkout_init">When Checkout Page Loads (Initiate Checkout)</option>
                          <option value="payment_canceled">When Payment is Canceled (Cancel)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= ORDER BOX TAB ================= */}
              {activeTab === 'Order Box' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Custom Order Notices</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1">Show special messages or external links on the checkout page.</p>
                    </div>
                    <button type="button" onClick={addOrderBox} className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#124329] px-4 py-2.5 rounded-xl hover:bg-slate-900 transition-colors shadow-md">
                      <Plus size={16} /> Add New Box
                    </button>
                  </div>
                  
                  {formData.order_boxes.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-[#111827] rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Info className="mx-auto text-slate-300 mb-3" size={32} />
                      <p className="text-sm font-medium text-slate-500">No order boxes added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {formData.order_boxes.map((box, index) => (
                        <div key={box.id} className="p-6 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-sm relative group hover:border-[#2E7D32] transition-colors">
                          <button type="button" onClick={() => removeOrderBox(index)} className="absolute top-5 right-5 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 size={16} /></button>
                          <div className="space-y-4 pr-10">
                            <div>
                              <Label title="Box Title (Gateway/Label)" />
                              <input type="text" placeholder="e.g. bKash Personal / Special Offer" value={box.label} onChange={e => updateOrderBox(index, 'label', e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#2E7D32]" />
                            </div>
                            <div>
                              <Label title="Notice Message" />
                              <textarea placeholder="Write instructions here..." value={box.message} onChange={e => updateOrderBox(index, 'message', e.target.value)} rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 outline-none resize-none focus:border-[#2E7D32]"></textarea>
                            </div>
                            <div>
                              <Label title="External Redirect URL (Optional)" />
                              <input type="url" placeholder="https://..." value={box.url} onChange={e => updateOrderBox(index, 'url', e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono outline-none focus:border-[#2E7D32]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= FAQ TAB ================= */}
              {activeTab === 'FAQ' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Customer FAQs</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1">Add common questions to help your customers during checkout.</p>
                    </div>
                    <button type="button" onClick={addFaq} className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#124329] px-4 py-2.5 rounded-xl hover:bg-slate-900 transition-colors shadow-md">
                      <Plus size={16} /> Add FAQ
                    </button>
                  </div>

                  {formData.faq.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-[#111827] rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <MessageSquare className="mx-auto text-slate-300 mb-3" size={32} />
                      <p className="text-sm font-medium text-slate-500">No FAQs added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {formData.faq.map((item, index) => (
                        <div key={index} className="p-6 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-sm relative group hover:border-[#2E7D32] transition-colors">
                          <button type="button" onClick={() => removeFaq(index)} className="absolute top-5 right-5 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"><Trash2 size={16} /></button>
                          <div className="space-y-4 pr-10">
                            <div>
                              <Label title="Question" />
                              <input type="text" placeholder="e.g. How long does delivery take?" value={item.q} onChange={e => updateFaq(index, 'q', e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#2E7D32]" />
                            </div>
                            <div>
                              <Label title="Answer" />
                              <textarea placeholder="Write the answer..." value={item.a} onChange={e => updateFaq(index, 'a', e.target.value)} rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 outline-none resize-none focus:border-[#2E7D32]"></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-800/60 mt-10">
               <button 
                 disabled={saving} 
                 type="submit" 
                 className="w-full md:w-auto bg-gradient-to-r from-[#124329] to-[#2E7D32] hover:from-[#0d331f] hover:to-[#215a24] disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#124329]/20 tracking-wider uppercase"
               >
                 {saving ? <><Loader2 className="animate-spin" size={18}/> Saving...</> : <><Save size={18} /> Save {activeTab} Settings</>}
               </button>
            </div>
            
          </form>
        </div>
      )}
    </div>
  );
}