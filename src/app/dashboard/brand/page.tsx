'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Image as ImageIcon, Globe, CheckCircle, Loader2, Save, Building2, 
  Mail, Phone, UploadCloud, Plus, Trash2, Facebook, MessageSquare, Palette, 
  Info, Youtube, MessageCircle, DollarSign, Languages, ShieldCheck, Key, 
  RefreshCw, Activity, Copy, ShieldAlert 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { testWebhookUrl, verifyDomain } from '@/lib/verify-business';

type Tab = 'General' | 'Logo' | 'Theme' | 'FAQ' | 'API & Verification' | 'Meta Pixel' | 'Order Box';

export default function BrandSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('General');
  
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [planData, setPlanData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    website_url: '',
    currency: 'BDT',
    language: 'en',
    gtm_id: '',
    
    street_address: '',
    city: '',
    country: '',
    zip_code: '',
    
    support_email: '',
    support_phone: '',
    support_website: '',
    
    social_links: { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
    meta_pixel: { enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' },
    order_boxes: [] as { id: string, label: string, message: string, url: string }[],
    faq: [] as { q: string, a: string }[],
    
    logo_url: '',
    webhook_url: '',
    success_url: '',
    cancel_url: '',

    public_key: '',
    secret_key: '',
    webhook_secret: '',
    domain_verify_code: '',
    is_domain_verified: false
  });

  const fetchBusinessData = async (id: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch Plan Details
      const { data: merchant } = await supabase.from('merchants').select('plan_id').eq('id', user.id).single();
      if (merchant?.plan_id) {
         const { data: plan } = await supabase.from('plans').select('allowed_method').eq('id', merchant.plan_id).single();
         setPlanData(plan);
      }
      setFetchingPlan(false);

      // Fetch Business Data
      const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
      
      if (data) {
        // Generate Verify Code if missing
        let verifyCode = data.domain_verify_code;
        if (!verifyCode) {
          verifyCode = `xp-verify-${Math.random().toString(36).substring(2, 15)}`;
          await supabase.from('businesses').update({ domain_verify_code: verifyCode }).eq('id', id);
        }

        setFormData({
          business_name: data.business_name || '',
          business_type: data.business_type || 'Website',
          website_url: data.website_url || '',
          currency: data.currency || 'BDT',
          language: data.language || 'en',
          gtm_id: data.gtm_id || '',
          street_address: data.street_address || '',
          city: data.city || '',
          country: data.country || '',
          zip_code: data.zip_code || '',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
          support_website: data.support_website || '',
          social_links: data.social_links || { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
          meta_pixel: data.meta_pixel || { enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' },
          order_boxes: data.order_boxes || [],
          faq: data.faq || [],
          logo_url: data.logo_url || '',
          webhook_url: data.webhook_url || '',
          success_url: data.success_url || '',
          cancel_url: data.cancel_url || '',
          public_key: data.public_key || '',
          secret_key: data.secret_key || '',
          webhook_secret: data.webhook_secret || '',
          domain_verify_code: verifyCode,
          is_domain_verified: data.is_domain_verified || false
        });
        setImagePreview(data.logo_url || null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadActiveBusiness = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchBusinessData(activeId);
      } else {
        setLoading(false);
      }
    };
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const isInternationalAllowed = planData?.allowed_method?.includes('international') || planData?.allowed_method?.includes('global');

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'USD' && !isInternationalAllowed) {
       return toast.error("আপনার প্ল্যানে USD সাপোর্ট নেই। দয়া করে আপগ্রেড করুন।");
    }
    setFormData(prev => ({ ...prev, currency: e.target.value }));
  };

  // ================= IMAGE UPLOAD LOGIC (Supabase) =================
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

  // ================= ACTION HANDLERS =================
  const handleVerifyDomain = async () => {
    if (!businessId || !formData.website_url) return toast.error("Website URL is missing.");
    setVerifyingDomain(true);
    
    const result = await verifyDomain(businessId, formData.website_url, formData.domain_verify_code);
    if (result.success) { 
        toast.success(result.message); 
        setFormData(p => ({ ...p, is_domain_verified: true })); 
    } else {
        toast.error(result.message);
    }
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

  const generateSecureKey = (prefix: string, length = 32) => {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return `${prefix}_${Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('')}`;
  };

  const handleRegenerateKeys = async () => {
    if(!confirm("Are you sure? Your old keys will stop working immediately!")) return;
    
    const newPub = generateSecureKey('xp_pub', 16);
    const newSec = generateSecureKey('xp_sec', 32);
    const newWhSec = generateSecureKey('whsec', 24);

    const { error } = await supabase.from('businesses').update({
      public_key: newPub, secret_key: newSec, webhook_secret: newWhSec
    }).eq('id', businessId);

    if (error) {
      toast.error("Failed to rotate keys.");
    } else {
      setFormData(p => ({ ...p, public_key: newPub, secret_key: newSec, webhook_secret: newWhSec }));
      toast.success("API Keys rotated successfully.");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  // ================= DYNAMIC ARRAY HANDLERS =================
  const addOrderBox = () => {
      setFormData(p => ({ ...p, order_boxes: [...p.order_boxes, { id: Date.now().toString(), label: '', message: '', url: '' }] }));
  };
  const updateOrderBox = (index: number, field: string, value: string) => { 
      const newBoxes = [...formData.order_boxes]; 
      newBoxes[index] = { ...newBoxes[index], [field]: value }; 
      setFormData(p => ({ ...p, order_boxes: newBoxes })); 
  };
  const removeOrderBox = (index: number) => {
      setFormData(p => ({ ...p, order_boxes: p.order_boxes.filter((_, i) => i !== index) }));
  };
  
  const addFaq = () => {
      setFormData(p => ({ ...p, faq: [...p.faq, { q: '', a: '' }] }));
  };
  const updateFaq = (index: number, field: 'q'|'a', value: string) => { 
      const newFaq = [...formData.faq]; 
      newFaq[index][field] = value; 
      setFormData(p => ({ ...p, faq: newFaq })); 
  };
  const removeFaq = (index: number) => {
      setFormData(p => ({ ...p, faq: p.faq.filter((_, i) => i !== index) }));
  };

  // ================= MAIN SAVE HANDLER =================
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
        business_name: formData.business_name, 
        currency: formData.currency, 
        language: formData.language,
        gtm_id: formData.gtm_id, 
        street_address: formData.street_address, 
        city: formData.city,
        country: formData.country, 
        zip_code: formData.zip_code, 
        support_email: formData.support_email,
        support_phone: formData.support_phone, 
        support_website: formData.support_website,
        social_links: formData.social_links, 
        meta_pixel: formData.meta_pixel, 
        order_boxes: formData.order_boxes,
        faq: formData.faq, 
        logo_url: finalLogoUrl, 
        webhook_url: formData.webhook_url,
        success_url: formData.success_url, 
        cancel_url: formData.cancel_url,
      }).eq('id', businessId);

      if (error) throw error;
      
      toast.success("Workspace settings saved!");
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

  if (loading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="animate-spin text-[#2E7D32]" size={32} />
          </div>
      );
  }

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 mt-1 text-sm">Please select a business from the sidebar switcher.</p>
      </div>
    );
  }

  const tabs: { name: Tab, icon: any }[] = [
    { name: 'General', icon: Settings },
    { name: 'Logo', icon: ImageIcon },
    { name: 'Theme', icon: Palette },
    { name: 'API & Verification', icon: Key },
    { name: 'FAQ', icon: MessageSquare },
    { name: 'Meta Pixel', icon: Facebook },
    { name: 'Order Box', icon: Info },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage configurations for {formData.business_name || 'your business'}.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Modern Sidebar Tabs */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab.name} 
              type="button" 
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.name 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.name ? 'text-white dark:text-slate-900' : 'text-slate-400'} /> 
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Content Box */}
        <div className="flex-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-10 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8 h-full flex flex-col">
            
            <div className="flex-1">
              
              {/* ================= GENERAL TAB ================= */}
              {activeTab === 'General' && (
                <div className="space-y-10 animate-in fade-in">
                  
                  {/* Section: Basic */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Business Name</label>
                        <input required type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Currency</label>
                        <select value={formData.currency} onChange={handleCurrencyChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white appearance-none">
                          <option value="BDT">BDT (৳)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Checkout Language</label>
                        <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white appearance-none">
                          <option value="en">English (EN)</option>
                          <option value="bn">Bangla (BN)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Google Tag Manager</label>
                        <input type="text" placeholder="GTM-XXXXX" value={formData.gtm_id} onChange={e => setFormData({...formData, gtm_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white font-mono" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                        Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Support Email</label>
                        <input required type="email" value={formData.support_email} onChange={e => setFormData({...formData, support_email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Support Phone</label>
                        <input required type="tel" value={formData.support_phone} onChange={e => setFormData({...formData, support_phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-[11px] font-bold text-slate-500 uppercase">Address / Location</label>
                         <input type="text" placeholder="Street, City, Country" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Social */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                        Social Presence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="relative">
                          <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="url" placeholder="Facebook Page URL" value={formData.social_links.fb_page} onChange={e => setFormData({...formData, social_links: {...formData.social_links, fb_page: e.target.value}})} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-white" />
                      </div>
                      <div className="relative">
                          <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="url" placeholder="WhatsApp (wa.me/number)" value={formData.social_links.whatsapp} onChange={e => setFormData({...formData, social_links: {...formData.social_links, whatsapp: e.target.value}})} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-white" />
                      </div>
                      <div className="relative md:col-span-2">
                          <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="url" placeholder="YouTube Channel URL" value={formData.social_links.youtube} onChange={e => setFormData({...formData, social_links: {...formData.social_links, youtube: e.target.value}})} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= LOGO TAB ================= */}
              {activeTab === 'Logo' && (
                <div className="space-y-6 animate-in fade-in max-w-md mx-auto mt-8">
                  <div className="flex flex-col items-center justify-center p-10 border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50 dark:bg-[#111827] text-center">
                    
                    {imagePreview ? (
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 shadow-sm flex items-center justify-center overflow-hidden">
                           <img src={imagePreview} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <button type="button" onClick={() => { setImagePreview(null); setSelectedImageFile(null); setFormData({...formData, logo_url: ''}); }} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
                            <ImageIcon size={28} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Upload Logo</p>
                          <p className="text-xs text-slate-500 mt-1">PNG or JPG, max 2MB.</p>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-[#124329] text-white text-xs font-bold rounded-full hover:bg-slate-900 transition-colors">
                            Choose File
                        </button>
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
                         <p className="text-xs text-slate-500 mt-1">Verify <b>{formData.website_url}</b> to secure your integrations.</p>
                       </div>
                    </div>
                    
                    {!formData.is_domain_verified ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all flex justify-between items-center">
                           <span>{`<meta name="xelpay-verification" content="${formData.domain_verify_code}" />`}</span>
                           <button type="button" onClick={() => copyToClipboard(`<meta name="xelpay-verification" content="${formData.domain_verify_code}" />`, 'Meta Tag')} className="text-slate-400 hover:text-[#2E7D32]">
                               <Copy size={14}/>
                           </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[11px] text-slate-500 max-w-[250px]">Paste this tag in the <code>&lt;head&gt;</code> section of your website.</p>
                          <button type="button" onClick={handleVerifyDomain} disabled={verifyingDomain} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90">
                            {verifyingDomain ? <Loader2 size={14} className="animate-spin" /> : 'Verify Domain'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-[#2E7D32]/10 border border-[#2E7D32]/20 rounded-xl text-[#2E7D32] text-xs font-bold flex items-center gap-2">
                        <CheckCircle size={14}/> Verified successfully.
                      </div>
                    )}
                  </div>

                  {/* API Keys */}
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live API Keys</h3>
                        <button type="button" onClick={handleRegenerateKeys} className="text-[11px] font-bold text-red-500 flex items-center gap-1 hover:underline">
                            <RefreshCw size={12}/> Rotate Keys
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl group">
                         <div className="flex justify-between items-center mb-2">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Public Key</p>
                           <button type="button" onClick={() => copyToClipboard(formData.public_key, 'Public Key')} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#2E7D32]">
                               <Copy size={14}/>
                           </button>
                         </div>
                         <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{formData.public_key}</p>
                       </div>

                       <div className="p-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl group">
                         <div className="flex justify-between items-center mb-2">
                           <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Secret Key</p>
                           <button type="button" onClick={() => copyToClipboard(formData.secret_key, 'Secret Key')} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#2E7D32]">
                               <Copy size={14}/>
                           </button>
                         </div>
                         <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">••••••••••••••••••••••••••••••••</p>
                       </div>
                    </div>
                  </div>

                  {/* Webhook URLs */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4">Endpoints</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase flex justify-between">
                        Webhook URL 
                        <button type="button" onClick={handleTestWebhook} disabled={testingWebhook} className="text-blue-500 hover:underline flex items-center gap-1">
                            {testingWebhook ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12}/>} Test Webhook
                        </button>
                      </label>
                      <input type="url" placeholder="https://..." value={formData.webhook_url} onChange={e => setFormData({...formData, webhook_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-mono text-sm dark:text-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Success Redirect</label>
                        <input type="url" value={formData.success_url} onChange={e => setFormData({...formData, success_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Cancel Redirect</label>
                        <input type="url" value={formData.cancel_url} onChange={e => setFormData({...formData, cancel_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= META PIXEL TAB ================= */}
              {activeTab === 'Meta Pixel' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-4">
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enable Meta Pixel Tracking</h3>
                     <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.meta_pixel.enabled} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, enabled: e.target.checked } })} className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2E7D32]"></div>
                    </label>
                  </div>
                  
                  {formData.meta_pixel.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Pixel ID</label>
                        <input type="text" placeholder="1234567890" value={formData.meta_pixel.pixel_id} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, pixel_id: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Test Event Code</label>
                        <input type="text" placeholder="TESTXXXXX" value={formData.meta_pixel.test_event_code} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, test_event_code: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white font-mono" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Access Token (CAPI)</label>
                        <textarea placeholder="Paste long token here..." value={formData.meta_pixel.access_token} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, access_token: e.target.value } })} rows={2} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white font-mono resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Trigger Event On</label>
                        <select value={formData.meta_pixel.trigger_on} onChange={e => setFormData({ ...formData, meta_pixel: { ...formData.meta_pixel, trigger_on: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2E7D32] text-sm dark:text-white appearance-none">
                          <option value="payment_success">When Payment is Successful (Recommended)</option>
                          <option value="checkout_init">When Checkout Page Loads</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= ORDER BOX TAB ================= */}
              {activeTab === 'Order Box' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Checkout Notices</h3>
                      <p className="text-xs text-slate-500 mt-1">পেমেন্ট পেজে কাস্টমারকে এক্সট্রা মেসেজ বা ভিন্ন গেটওয়ের লিংক দিতে বক্স অ্যাড করুন।</p>
                    </div>
                    <button type="button" onClick={addOrderBox} className="flex items-center gap-1 text-xs font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1.5 rounded-lg hover:bg-[#2E7D32]/20 transition-colors">
                        <Plus size={14} /> Add Box
                    </button>
                  </div>

                  {formData.order_boxes.map((box, index) => (
                    <div key={box.id} className="p-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl relative">
                      <button type="button" onClick={() => removeOrderBox(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                      </button>
                      <div className="space-y-3 pr-6">
                        <input type="text" placeholder="Box Title (e.g. Special Offer)" value={box.label} onChange={e => updateOrderBox(index, 'label', e.target.value)} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-1 text-sm font-bold dark:text-white focus:border-[#2E7D32]" />
                        <textarea placeholder="Description..." value={box.message} onChange={e => updateOrderBox(index, 'message', e.target.value)} rows={2} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-1 text-xs dark:text-slate-300 resize-none focus:border-[#2E7D32]"></textarea>
                        <input type="url" placeholder="Optional External Link" value={box.url} onChange={e => updateOrderBox(index, 'url', e.target.value)} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-1 text-xs dark:text-slate-400 focus:border-[#2E7D32] font-mono" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= FAQ TAB ================= */}
              {activeTab === 'FAQ' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer FAQs</h3>
                    <button type="button" onClick={addFaq} className="flex items-center gap-1 text-xs font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1.5 rounded-lg hover:bg-[#2E7D32]/20 transition-colors">
                        <Plus size={14} /> Add FAQ
                    </button>
                  </div>

                  {formData.faq.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl relative">
                      <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                      </button>
                      <div className="space-y-3 pr-6">
                        <input type="text" placeholder="Question?" value={item.q} onChange={e => updateFaq(index, 'q', e.target.value)} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-1 text-sm font-bold dark:text-white focus:border-[#2E7D32]" />
                        <textarea placeholder="Answer..." value={item.a} onChange={e => updateFaq(index, 'a', e.target.value)} rows={2} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-1 text-xs dark:text-slate-300 resize-none focus:border-[#2E7D32]"></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= THEME TAB ================= */}
              {activeTab === 'Theme' && (
                <div className="space-y-6 animate-in fade-in flex items-center justify-center h-40">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-[#124329] to-[#2E7D32] shadow-lg"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Premium Layout Enabled</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Your checkout is automatically optimized for conversions.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Save Button Container */}
            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800/60 mt-8">
               <button 
                 disabled={saving} 
                 type="submit" 
                 className="w-full md:w-auto bg-[#124329] hover:bg-slate-900 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
               >
                 {saving ? <><Loader2 className="animate-spin" size={16}/> Saving...</> : <><Save size={16} /> Save Changes</>}
               </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}