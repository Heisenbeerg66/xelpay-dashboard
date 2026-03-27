'use client';

import { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Link2, Globe, CheckCircle, Loader2, Save, ExternalLink, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BrandSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    business_name: '',
    logo_url: '',
    webhook_url: '',
    success_url: '',
    cancel_url: ''
  });

  // 🔄 ডাটাবেস থেকে সিলেক্ট করা বিজনেসের ডেটা ফেচ করা
  const fetchBusinessData = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        business_name: data.business_name || '',
        logo_url: data.logo_url || '',
        webhook_url: data.webhook_url || '',
        success_url: data.success_url || '',
        cancel_url: data.cancel_url || ''
      });
    } else if (error) {
      toast.error("Failed to load business settings.");
    }
    setLoading(false);
  };

  // 🚀 Initial Load & Event Listener (ড্রপডাউন চেঞ্জ হলে অটো আপডেট হবে)
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

    loadActiveBusiness(); // প্রথমবার লোড

    // সাইডবার থেকে বিজনেস চেঞ্জ করলে এই ইভেন্ট কল হবে
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    
    setSaving(true);
    const { error } = await supabase.from('businesses').update({
      business_name: formData.business_name,
      logo_url: formData.logo_url,
      webhook_url: formData.webhook_url,
      success_url: formData.success_url,
      cancel_url: formData.cancel_url
    }).eq('id', businessId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Brand settings updated successfully!");
      // সাইডবারের নাম বা লোগো রিয়েল-টাইমে আপডেট করার জন্য ইভেন্ট ফায়ার করা
      window.dispatchEvent(new Event('businessChanged'));
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar switcher or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings size={28} className="text-blue-600" /> Brand Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Customize how your checkout page looks and where XelPay sends the payment notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 🎨 Branding Section */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Display Info</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Business / App Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input required type="text" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Logo URL (PNG/JPG)</label>
              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input type="url" placeholder="https://yoursite.com/logo.png" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* 🔗 API & Routing Section */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">API & Webhooks</h3>
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider flex justify-between">
                Webhook URL
                <span className="text-blue-500">Receives POST request on payment success</span>
              </label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input type="url" placeholder="https://yoursite.com/api/xelpay-webhook" value={formData.webhook_url} onChange={(e) => setFormData({...formData, webhook_url: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Success Return URL</label>
                <div className="relative group">
                  <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500/50 group-focus-within:text-green-500 transition-colors" size={18} />
                  <input type="url" placeholder="https://yoursite.com/payment-success" value={formData.success_url} onChange={(e) => setFormData({...formData, success_url: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-green-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider">Cancel/Fail Return URL</label>
                <div className="relative group">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input type="url" placeholder="https://yoursite.com/payment-failed" value={formData.cancel_url} onChange={(e) => setFormData({...formData, cancel_url: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-red-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
           <button disabled={saving} type="submit" className="w-full md:w-auto bg-blue-600 disabled:bg-slate-400 text-white px-10 py-4 rounded-xl font-bold text-sm hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 uppercase tracking-widest">
             {saving ? <><Loader2 className="animate-spin" size={18}/> Saving Changes...</> : <><Save size={18} /> Save Settings</>}
           </button>
        </div>
      </form>
      
    </div>
  );
}