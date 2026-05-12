'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings, Image as ImageIcon, Globe, CheckCircle, Loader2, Save, Building2,
  Mail, Phone, UploadCloud, Plus, Trash2, Facebook, MessageSquare,
  Info, Youtube, DollarSign, Languages, Key, RefreshCw, Activity,
  Copy, ShieldCheck, ChevronLeft, Send, Eye, EyeOff, AlertCircle,
  Smartphone, Wifi, WifiOff, Unlink, Link as LinkIcon, Bot, QrCode,
  Shield, Zap, Server, Webhook, RotateCcw, X, CheckSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import {
  generateBusinessTelegramCode,
  unlinkBusinessTelegram,
  importVaultTelegramToBusiness,
  getBusinessConnectedDevice,
  generateBusinessDeviceKey,
  deleteBusinessDevice,
} from '@/lib/business_actions';

// ── Types ─────────────────────────────────────────────────────
type Tab = 'Grid' | 'General' | 'Logo' | 'API' | 'GTM' | 'Pixel' | 'OrderBox' | 'FAQ' | 'Devices' | 'Telegram';

const inputClass = 'w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400';
const Label = ({ title, required = false }: { title: string; required?: boolean }) => (
  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
    {title}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ── Tab Card Grid ─────────────────────────────────────────────
function SettingCard({ id, icon: Icon, title, desc, onClick }: any) {
  return (
    <button onClick={() => onClick(id)}
      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group w-full">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
        <Icon size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <h4 className="text-sm font-black text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function BrandSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Grid');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [rollingKey, setRollingKey] = useState<'public' | 'secret' | null>(null);

  // Telegram state
  const [telegramData, setTelegramData] = useState<any>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [botUsername, setBotUsername] = useState('');
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [importingVault, setImportingVault] = useState(false);

  // Device state
  const [deviceData, setDeviceData] = useState<any>(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceKey, setDeviceKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '', business_type: '', website_url: '', currency: 'BDT', language: 'en', gtm_id: '',
    street_address: '', city: '', country: '', zip_code: '',
    support_email: '', support_phone: '', support_website: '',
    social_links: { fb_page: '', messenger: '', whatsapp: '', telegram: '', youtube: '' },
    meta_pixel: { enabled: false, pixel_id: '', access_token: '', test_event_code: '', trigger_on: 'payment_success' },
    order_boxes: [] as { id: string; label: string; message: string; url: string }[],
    faq: [] as { q: string; a: string }[],
    logo_url: '', webhook_url: '', success_url: '', cancel_url: '',
    public_key: '', secret_key: '', webhook_secret: '', exchange_rate: '',
    domain_verify_code: '', is_domain_verified: false,
  });

  // Load data
  const loadBusiness = useCallback(async (bizId: string) => {
    const { data } = await supabase.from('businesses').select('*').eq('id', bizId).single();
    if (!data) return;

    let verifyCode = data.domain_verify_code;
    if (!verifyCode) {
      verifyCode = `xp-verify-${Math.random().toString(36).substring(2, 15)}`;
      await supabase.from('businesses').update({ domain_verify_code: verifyCode }).eq('id', bizId);
    }

    setFormData({
      business_name: data.business_name || '',
      business_type: data.business_type || '',
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
      order_boxes: Array.isArray(data.order_boxes) ? data.order_boxes : [],
      faq: Array.isArray(data.faq) ? data.faq : [],
      logo_url: data.logo_url || '',
      webhook_url: data.webhook_url || '',
      success_url: data.success_url || '',
      cancel_url: data.cancel_url || '',
      public_key: data.public_key || '',
      secret_key: data.secret_key || '',
      webhook_secret: data.webhook_secret || '',
      exchange_rate: data.exchange_rate ? String(data.exchange_rate) : '',
      domain_verify_code: verifyCode,
      is_domain_verified: data.is_domain_verified || false,
    });
    if (data.logo_url) setImagePreview(data.logo_url);

    // Load bot username
    const { data: settings } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram_bot_username').maybeSingle();
    if (settings?.value) setBotUsername(settings.value);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const bizId = localStorage.getItem('activeBusiness') || sessionStorage.getItem('activeBusiness');
      if (bizId) {
        setBusinessId(bizId);
        await loadBusiness(bizId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: biz } = await supabase.from('businesses').select('id').eq('merchant_id', user.id).eq('status', 'active').limit(1).maybeSingle();
          if (biz?.id) {
            setBusinessId(biz.id);
            await loadBusiness(biz.id);
          }
        }
      }
      setLoading(false);
    };
    init();

    const handleBizChange = () => {
      const bizId = localStorage.getItem('activeBusiness') || sessionStorage.getItem('activeBusiness');
      if (bizId && bizId !== businessId) { setBusinessId(bizId); loadBusiness(bizId); }
    };
    window.addEventListener('businessChanged', handleBizChange);
    return () => window.removeEventListener('businessChanged', handleBizChange);
  }, [loadBusiness, businessId]);

  // Load Telegram info
  const loadTelegram = useCallback(async () => {
    if (!businessId) return;
    setTelegramLoading(true);
    const { data: bizTg, error: tgErr } = await supabase
      .from('businesses')
      .select('telegram_chat_id, telegram_display_name, telegram_username, is_telegram_enabled')
      .eq('id', businessId)
      .single();
    if (!tgErr && bizTg?.telegram_chat_id) {
      setTelegramData({
        chat_id: bizTg.telegram_chat_id,
        display_name: bizTg.telegram_display_name || null,
        username: bizTg.telegram_username || null,
        is_enabled: bizTg.is_telegram_enabled,
      });
    } else {
      setTelegramData(null);
    }
    setTelegramLoading(false);
  }, [businessId]);

  // Load Device info
  const loadDevice = useCallback(async () => {
    if (!businessId) return;
    setDeviceLoading(true);
    const res = await getBusinessConnectedDevice(businessId);
    if (res.success && res.data) setDeviceData(res.data);
    setDeviceLoading(false);
  }, [businessId]);

  useEffect(() => {
    if (activeTab === 'Telegram') loadTelegram();
    if (activeTab === 'Devices') loadDevice();
  }, [activeTab, loadTelegram, loadDevice]);

  // Save handler
  const handleSave = async () => {
    if (!businessId) return;
    setSaving(true);
    let finalLogoUrl = formData.logo_url;

    try {
      if (selectedImageFile) {
        toast.loading('Uploading logo...', { id: 'upload' });
        // Upload to Supabase Storage
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${businessId}-${Date.now()}.${fileExt}`;
        const { data: upData, error: upError } = await supabase.storage
          .from('business-logos')
          .upload(fileName, selectedImageFile, { upsert: true, contentType: selectedImageFile.type });
        toast.dismiss('upload');
        if (upError) throw upError;
        const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(fileName);
        finalLogoUrl = urlData.publicUrl;
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
        exchange_rate: formData.exchange_rate ? parseFloat(formData.exchange_rate) : null,
      }).eq('id', businessId);

      if (error) throw error;
      toast.success('Settings saved!');
      setFormData(p => ({ ...p, logo_url: finalLogoUrl }));
      setSelectedImageFile(null);
      window.dispatchEvent(new Event('businessChanged'));
    } catch (e: any) {
      toast.dismiss('upload');
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('Max 500KB allowed'); return; }
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleTestWebhook = async () => {
    if (!formData.webhook_url) { toast.error('Enter a webhook URL first'); return; }
    setTestingWebhook(true);
    try {
      const res = await fetch(formData.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'webhook.test', business_id: businessId, timestamp: Date.now() }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) toast.success(`Webhook OK! (${res.status})`);
      else toast.error(`Webhook returned ${res.status}`);
    } catch (e: any) {
      toast.error(e.name === 'TimeoutError' ? 'Webhook timed out' : 'Webhook unreachable');
    } finally {
      setTestingWebhook(false);
    }
  };

  const copyToClipboard = (text: string, label = '') => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label || 'Copied'}!`));
  };

  // Telegram actions
  const handleUnlinkTelegram = async () => {
    if (!businessId) return;
    setUnlinking(true);
    const res = await unlinkBusinessTelegram(businessId);
    if (res.success) { toast.success('Telegram unlinked'); setTelegramData(null); loadTelegram(); }
    else toast.error(res.message);
    setUnlinking(false);
    setShowUnlinkModal(false);
  };

  const handleImportVaultTelegram = async () => {
    if (!businessId) return;
    setImportingVault(true);
    const res = await importVaultTelegramToBusiness(businessId);
    if (res.success) { toast.success('Telegram imported!'); loadTelegram(); }
    else toast.error(res.message);
    setImportingVault(false);
  };

  const handleGenerateTelegramCode = async () => {
    if (!businessId) return;
    const res = await generateBusinessTelegramCode(businessId);
    if (res.success) { toast.success('New link code generated!'); loadTelegram(); await loadBusiness(businessId); }
    else toast.error(res.message);
  };

  // Device actions
  const handleGenerateDeviceKey = async () => {
    if (!businessId) return;
    setGeneratingKey(true);
    const res = await generateBusinessDeviceKey(businessId);
    if (res.success) { setDeviceKey(res.key!); toast.success('Device key generated!'); }
    else toast.error(res.message);
    setGeneratingKey(false);
  };

  const handleDeleteDevice = async () => {
    if (!businessId) return;
    setDeletingDevice(true);
    const res = await deleteBusinessDevice(businessId);
    if (res.success) { setDeviceData(null); toast.success('Device disconnected!'); }
    else toast.error(res.message);
    setDeletingDevice(false);
  };

  // Order boxes
  const addOrderBox = () => setFormData(p => ({ ...p, order_boxes: [...p.order_boxes, { id: Date.now().toString(), label: '', message: '', url: '' }] }));
  const updateOrderBox = (i: number, f: string, v: string) => { const nb = [...formData.order_boxes]; nb[i] = { ...nb[i], [f]: v }; setFormData(p => ({ ...p, order_boxes: nb })); };
  const removeOrderBox = (i: number) => setFormData(p => ({ ...p, order_boxes: p.order_boxes.filter((_, idx) => idx !== i) }));

  // FAQ
  const addFaq = () => setFormData(p => ({ ...p, faq: [...p.faq, { q: '', a: '' }] }));
  const updateFaq = (i: number, f: 'q' | 'a', v: string) => { const nf = [...formData.faq]; nf[i] = { ...nf[i], [f]: v }; setFormData(p => ({ ...p, faq: nf })); };
  const removeFaq = (i: number) => setFormData(p => ({ ...p, faq: p.faq.filter((_, idx) => idx !== i) }));

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!businessId) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Building2 size={28} className="text-slate-400" /></div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white">No Business Selected</h2>
      <p className="text-slate-500 mt-2 text-sm">Select a business from the sidebar to manage settings.</p>
    </div>
  );

  const settingCards = [
    { id: 'General', icon: Settings, title: 'General Info', desc: 'Name, currency, exchange rate, contact & social links' },
    { id: 'Logo', icon: ImageIcon, title: 'Brand Logo', desc: 'Upload business logo (PNG/JPEG, max 500KB, round recommended)' },
    { id: 'API', icon: Key, title: 'API & Webhooks', desc: 'API keys, webhook URL, success/cancel URL routing' },
    { id: 'GTM', icon: Activity, title: 'Google Tag Manager', desc: 'GTM container for tracking and analytics' },
    { id: 'Pixel', icon: Facebook, title: 'Meta Pixel', desc: 'Facebook events & Conversions API' },
    { id: 'OrderBox', icon: Info, title: 'Order Boxes', desc: 'Custom notices on checkout page' },
    { id: 'FAQ', icon: MessageSquare, title: 'FAQs', desc: 'Customer questions & answers on checkout' },
    { id: 'Devices', icon: Smartphone, title: 'Device Manager', desc: 'Manage connected SMS reader devices' },
    { id: 'Telegram', icon: Send, title: 'Telegram Alerts', desc: 'Configure payment notification alerts' },
  ];

  const isTelegramConnected = !!telegramData?.chat_id;

  return (
    <>
      <Toaster position="top-center" richColors />

      {/* Unlink Modal */}
      {showUnlinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Unlink Telegram?</h3>
            <p className="text-sm text-slate-500 mb-5">You will stop receiving payment alerts on Telegram.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnlinkModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-black">Cancel</button>
              <button onClick={handleUnlinkTelegram} disabled={unlinking}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2">
                {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />} Unlink
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activeTab !== 'Grid' && (
              <button onClick={() => setActiveTab('Grid')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <Settings size={20} />
                </div>
                Brand Settings
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {activeTab === 'Grid' ? 'Manage all aspects of your business' : settingCards.find(c => c.id === activeTab)?.desc}
              </p>
            </div>
          </div>
          {activeTab !== 'Grid' && activeTab !== 'Devices' && activeTab !== 'Telegram' && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          )}
        </div>

        {/* Grid View */}
        {activeTab === 'Grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingCards.map(card => (
              <SettingCard key={card.id} {...card} onClick={(id: Tab) => setActiveTab(id)} />
            ))}
          </div>
        )}

        {/* ──────────── GENERAL TAB ──────────── */}
        {activeTab === 'General' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-7">
            {/* Business Info */}
            <div>
              <SectionHeader title="Business Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><Label title="Business Name" required /><input type="text" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} className={inputClass} /></div>
                <div><Label title="Business Type" /><input type="text" readOnly value={formData.business_type} className={`${inputClass} opacity-60`} /></div>
                <div>
                  <Label title="Currency" />
                  <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className={inputClass}>
                    {['BDT', 'USD', 'EUR', 'GBP', 'INR', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label title="Exchange Rate (vs BDT)" />
                  <input type="number" step="0.01" value={formData.exchange_rate} onChange={e => setFormData({ ...formData, exchange_rate: e.target.value })}
                    placeholder="e.g. 110 (1 USD = 110 BDT)" className={inputClass} />
                  <p className="text-[10px] text-slate-400 mt-1">Auto-converts foreign currency amounts to BDT.</p>
                </div>
                <div>
                  <Label title="Language" />
                  <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className={inputClass}>
                    <option value="en">English</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <SectionHeader title="Contact Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><Label title="Support Email" /><input type="email" value={formData.support_email} onChange={e => setFormData({ ...formData, support_email: e.target.value })} className={inputClass} /></div>
                <div><Label title="Support Phone" /><input type="tel" value={formData.support_phone} onChange={e => setFormData({ ...formData, support_phone: e.target.value })} className={inputClass} /></div>
                <div><Label title="Support Website" /><input type="url" value={formData.support_website} onChange={e => setFormData({ ...formData, support_website: e.target.value })} className={inputClass} /></div>
              </div>
            </div>

            {/* Address */}
            <div>
              <SectionHeader title="Business Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2"><Label title="Street Address" /><input type="text" value={formData.street_address} onChange={e => setFormData({ ...formData, street_address: e.target.value })} className={inputClass} /></div>
                <div><Label title="City" /><input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={inputClass} /></div>
                <div><Label title="Country" /><input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className={inputClass} /></div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <SectionHeader title="Social Links" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><Label title="Facebook Page URL" /><input type="url" placeholder="https://facebook.com/..." value={formData.social_links.fb_page} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, fb_page: e.target.value } })} className={inputClass} /></div>
                <div><Label title="WhatsApp Link" /><input type="url" placeholder="https://wa.me/..." value={formData.social_links.whatsapp} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, whatsapp: e.target.value } })} className={inputClass} /></div>
                <div><Label title="Telegram Link" /><input type="url" placeholder="https://t.me/..." value={formData.social_links.telegram} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, telegram: e.target.value } })} className={inputClass} /></div>
                <div><Label title="YouTube Channel URL" /><input type="url" placeholder="https://youtube.com/..." value={formData.social_links.youtube} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, youtube: e.target.value } })} className={inputClass} /></div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────── LOGO TAB ──────────── */}
        {activeTab === 'Logo' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <SectionHeader title="Brand Logo" desc="Displayed on checkout pages and payment links" />
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-slate-400" />
                )}
              </div>
              <div className="text-center">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all">
                  <UploadCloud size={16} /> Upload Logo
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageChange} />
                <div className="mt-3 space-y-1 text-xs text-slate-400 text-center">
                  <p>✓ <strong>Round logo recommended</strong> (displays as circle on checkout)</p>
                  <p>✓ Supported formats: <strong>PNG, JPEG</strong></p>
                  <p>✓ Maximum size: <strong>500KB</strong> (Supabase free tier optimized)</p>
                  <p>✓ Recommended resolution: <strong>200×200px or larger</strong></p>
                </div>
              </div>
              {selectedImageFile && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle size={14} /> {selectedImageFile.name} ready to upload
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────── API & WEBHOOK TAB ──────────── */}
        {activeTab === 'API' && (
          <div className="space-y-5">
            {/* API Keys */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <SectionHeader title="Live API Keys" desc="Keep your secret key private. Never expose it client-side." />
              <div className="space-y-4">
                <div>
                  <Label title="Public Key" />
                  <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <input readOnly value={formData.public_key} className="flex-1 px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none truncate" />
                    <button onClick={() => copyToClipboard(formData.public_key, 'Public Key')} className="px-4 text-slate-400 hover:text-blue-600 border-l border-slate-200 dark:border-slate-800 transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <Label title="Secret Key" />
                  <div className="flex bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden">
                    <input readOnly type={showSecretKey ? 'text' : 'password'} value={formData.secret_key} className="flex-1 px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none" />
                    <button onClick={() => setShowSecretKey(s => !s)} className="px-3 text-slate-400 hover:text-blue-600 transition-colors border-l border-red-200 dark:border-red-900/30">
                      {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => copyToClipboard(formData.secret_key, 'Secret Key')} className="px-4 text-slate-400 hover:text-red-600 border-l border-red-200 dark:border-red-900/30 transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold">⚠️ Never share or expose your secret key publicly.</p>
                </div>
              </div>
            </div>

            {/* Webhook Settings */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <SectionHeader title="Webhook & URL Settings" desc="Configure where XelPay sends payment events and redirects" />
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label title="Webhook URL" />
                    <button type="button" onClick={handleTestWebhook} disabled={testingWebhook}
                      className="text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                      {testingWebhook ? <Loader2 size={11} className="animate-spin" /> : <Activity size={11} />}
                      Test Webhook
                    </button>
                  </div>
                  <input type="url" placeholder="https://yourdomain.com/api/webhook" value={formData.webhook_url}
                    onChange={e => setFormData({ ...formData, webhook_url: e.target.value })} className={`${inputClass} font-mono`} />
                  <p className="text-[10px] text-slate-400 mt-1.5">Receives a POST request with payment data on every event.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label title="Success Return URL" />
                    <input type="url" placeholder="https://yoursite.com/success" value={formData.success_url}
                      onChange={e => setFormData({ ...formData, success_url: e.target.value })} className={inputClass} />
                    <p className="text-[10px] text-slate-400 mt-1.5">Customer redirect after successful payment.</p>
                  </div>
                  <div>
                    <Label title="Cancel Return URL" />
                    <input type="url" placeholder="https://yoursite.com/cancel" value={formData.cancel_url}
                      onChange={e => setFormData({ ...formData, cancel_url: e.target.value })} className={inputClass} />
                    <p className="text-[10px] text-slate-400 mt-1.5">Customer redirect if payment is cancelled.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────── GTM TAB ──────────── */}
        {activeTab === 'GTM' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <SectionHeader title="Google Tag Manager" desc="Track events and conversions with GTM" />
            <div>
              <Label title="GTM Container ID" />
              <input type="text" placeholder="GTM-XXXXXXX" value={formData.gtm_id} onChange={e => setFormData({ ...formData, gtm_id: e.target.value })} className={inputClass} />
              <p className="text-[10px] text-slate-400 mt-1.5">Fires on checkout page load. Find this in your GTM dashboard.</p>
            </div>
          </div>
        )}

        {/* ──────────── META PIXEL TAB ──────────── */}
        {activeTab === 'Pixel' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <SectionHeader title="Meta (Facebook) Pixel" desc="Track conversions via Pixel and Conversions API (CAPI)" />
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Enable Meta Pixel</p>
                <p className="text-xs text-slate-500 mt-0.5">Track payment events with Facebook</p>
              </div>
              <button onClick={() => setFormData(p => ({ ...p, meta_pixel: { ...p.meta_pixel, enabled: !p.meta_pixel.enabled } }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.meta_pixel.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.meta_pixel.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            {formData.meta_pixel.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><Label title="Pixel ID" /><input type="text" placeholder="123456789" value={formData.meta_pixel.pixel_id} onChange={e => setFormData(p => ({ ...p, meta_pixel: { ...p.meta_pixel, pixel_id: e.target.value } }))} className={inputClass} /></div>
                <div><Label title="Access Token (CAPI)" /><input type="text" placeholder="EAA..." value={formData.meta_pixel.access_token} onChange={e => setFormData(p => ({ ...p, meta_pixel: { ...p.meta_pixel, access_token: e.target.value } }))} className={inputClass} /></div>
                <div><Label title="Test Event Code" /><input type="text" placeholder="TEST12345" value={formData.meta_pixel.test_event_code} onChange={e => setFormData(p => ({ ...p, meta_pixel: { ...p.meta_pixel, test_event_code: e.target.value } }))} className={inputClass} /></div>
                <div>
                  <Label title="Trigger On" />
                  <select value={formData.meta_pixel.trigger_on} onChange={e => setFormData(p => ({ ...p, meta_pixel: { ...p.meta_pixel, trigger_on: e.target.value } }))} className={inputClass}>
                    <option value="payment_success">Payment Success</option>
                    <option value="page_view">Page View</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────── ORDER BOX TAB ──────────── */}
        {activeTab === 'OrderBox' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Order Boxes" desc="Custom notices shown to customers on the checkout page" />
              <button onClick={addOrderBox} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">
                <Plus size={14} /> Add Box
              </button>
            </div>
            {formData.order_boxes.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Info size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No order boxes yet</p>
              </div>
            ) : formData.order_boxes.map((box, i) => (
              <div key={box.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 bg-slate-50 dark:bg-[#0B1120]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Box {i + 1}</span>
                  <button onClick={() => removeOrderBox(i)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label title="Label" /><input type="text" value={box.label} onChange={e => updateOrderBox(i, 'label', e.target.value)} placeholder="e.g. Important Notice" className={inputClass} /></div>
                  <div><Label title="Link URL (optional)" /><input type="url" value={box.url} onChange={e => updateOrderBox(i, 'url', e.target.value)} placeholder="https://..." className={inputClass} /></div>
                  <div className="md:col-span-2"><Label title="Message" /><textarea value={box.message} onChange={e => updateOrderBox(i, 'message', e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ──────────── FAQ TAB ──────────── */}
        {activeTab === 'FAQ' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Checkout FAQs" desc="Questions displayed on the checkout page" />
              <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">
                <Plus size={14} /> Add FAQ
              </button>
            </div>
            {formData.faq.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No FAQs yet</p>
              </div>
            ) : formData.faq.map((f, i) => (
              <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 bg-slate-50 dark:bg-[#0B1120]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">FAQ {i + 1}</span>
                  <button onClick={() => removeFaq(i)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                </div>
                <div><Label title="Question" /><input type="text" value={f.q} onChange={e => updateFaq(i, 'q', e.target.value)} placeholder="e.g. How long does payment take?" className={inputClass} /></div>
                <div><Label title="Answer" /><textarea value={f.a} onChange={e => updateFaq(i, 'a', e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
              </div>
            ))}
          </div>
        )}

        {/* ──────────── TELEGRAM TAB ──────────── */}
        {activeTab === 'Telegram' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <SectionHeader title="Telegram Alerts" desc="Receive payment notifications in real-time via Telegram" />

              {telegramLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-sky-500" /></div>
              ) : isTelegramConnected ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/30">
                      <Send size={24} className="text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-black text-white">{telegramData?.display_name || 'Connected'}</h3>
                      {telegramData?.username && <p className="text-sky-100 text-sm">@{telegramData.username}</p>}
                      <p className="text-sky-200 text-xs mt-1">✅ Telegram alerts are active</p>
                    </div>
                  </div>
                  <button onClick={() => setShowUnlinkModal(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                    <Unlink size={14} /> Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">How to Connect</h4>
                    <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 list-decimal list-inside font-medium">
                      <li>Copy the bot link below or click Open Bot</li>
                      <li>For Personal Chat: hit <strong>Start</strong></li>
                      <li>For Groups: Add the bot, then send <code className="bg-white dark:bg-slate-900 px-1 rounded">/start {formData.domain_verify_code}</code></li>
                    </ol>
                  </div>

                  {botUsername && (
                    <div className="flex gap-3">
                      <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                        <Send size={15} /> Open Bot
                      </a>
                      <button onClick={handleImportVaultTelegram} disabled={importingVault}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                        {importingVault ? <Loader2 size={14} className="animate-spin" /> : <Server size={14} />} Import from Vault
                      </button>
                    </div>
                  )}
                  <button onClick={() => { loadTelegram(); }} className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={12} /> Check Connection Status
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────── DEVICES TAB ──────────── */}
        {activeTab === 'Devices' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <SectionHeader title="Device Manager" desc="Connect your Android device to receive SMS payment confirmations" />

              {deviceLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-600" /></div>
              ) : deviceData ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/30">
                      <Smartphone size={24} className="text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-black text-white">{deviceData.device_name || 'Connected Device'}</h3>
                      {deviceData.device_model && <p className="text-emerald-100 text-sm">{deviceData.device_model}</p>}
                      <p className="text-emerald-200 text-xs mt-1">✅ SMS reader active</p>
                    </div>
                  </div>
                  <button onClick={handleDeleteDevice} disabled={deletingDevice}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                    {deletingDevice ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />} Disconnect Device
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Setup Instructions</h4>
                    <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 list-decimal list-inside font-medium">
                      <li>Install the XelPay Android app on your device</li>
                      <li>Generate a connection key below</li>
                      <li>Enter the key in the app to pair your device</li>
                      <li>Grant SMS permission when prompted</li>
                    </ol>
                  </div>

                  <button onClick={handleGenerateDeviceKey} disabled={generatingKey}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                    {generatingKey ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><QrCode size={15} /> Generate Connection Key</>}
                  </button>

                  {deviceKey && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Connection Key</p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-sm font-black text-blue-900 dark:text-blue-300 font-mono break-all">{deviceKey}</code>
                        <button onClick={() => copyToClipboard(deviceKey, 'Key')} className="shrink-0 p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                          <Copy size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] text-blue-500 mt-2">⚠️ This key expires after first use. Keep it secure.</p>
                    </div>
                  )}

                  <button onClick={loadDevice} className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={12} /> Check Connection Status
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}