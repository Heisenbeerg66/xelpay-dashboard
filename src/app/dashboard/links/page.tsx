'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Link as LinkIcon, Plus, Copy, ExternalLink, Trash2, Loader2, Globe,
  Tag, Edit3, Building2, CheckCircle, X, Image as ImageIcon, Zap,
  Palette, Clock, ToggleLeft, ToggleRight, Eye, Upload, AlertCircle,
  ChevronDown, Percent, DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentLink = {
  id: string;
  merchant_id: string;
  business_id: string;
  title: string;
  link_id: string;
  amount: number | null;
  currency: string;
  discount: number;
  discount_type: string;
  description: string | null;
  status: string;
  product_logo: string | null;
  redirect_url: string | null;
  created_at: string;
};

type LinkForm = {
  title: string;
  link_id: string;
  amount: string;
  currency: string;
  discount: string;
  discount_type: string;
  description: string;
  product_logo: string;
  expires_type: 'none' | 'hours' | 'days';
  expires_value: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcFinal = (amount: number, discount: number, type: string) => {
  if (!amount) return 0;
  if (type === 'percentage') return Math.max(0, amount - (amount * (discount / 100)));
  return Math.max(0, amount - discount);
};

const symbol = (currency: string) => currency === 'USD' ? '$' : '৳';

const getLiveUrl = (slug: string, linkId: string) =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}/${linkId}`
    : `/${slug}/${linkId}`;

const getDisplayUrl = (slug: string, linkId: string) =>
  typeof window !== 'undefined'
    ? `${window.location.host}/${slug}/${linkId}`
    : `${slug}/${linkId}`;

// ─── Image Upload ─────────────────────────────────────────────────────────────
async function uploadProductImage(file: File, merchantId: string): Promise<string | null> {
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    toast.error('Image must be under 2MB');
    return null;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];
  if (!ext || !allowed.includes(ext)) {
    toast.error('Only JPG, PNG, WEBP allowed');
    return null;
  }

  const fileName = `${merchantId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) {
    toast.error('Upload failed: ' + error.message);
    return null;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── Link Type Chooser ────────────────────────────────────────────────────────
function LinkTypeChooser({ onSelect, onClose }: { onSelect: (type: 'default' | 'custom') => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X size={16} className="text-slate-400" />
        </button>

        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Create Payment Link</h3>
        <p className="text-sm text-slate-500 mb-7">Choose the type of link you want to create.</p>

        <div className="space-y-3">
          {/* Default Link */}
          <button
            onClick={() => onSelect('default')}
            className="w-full flex items-start gap-4 p-5 bg-slate-50 dark:bg-[#0B1120] hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-2xl transition-all group text-left"
          >
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <Zap size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">Default Link</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Quick link with no fixed amount. Customers enter their own amount. Uses your business name as description.</p>
            </div>
          </button>

          {/* Custom Link */}
          <button
            onClick={() => onSelect('custom')}
            className="w-full flex items-start gap-4 p-5 bg-slate-50 dark:bg-[#0B1120] hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-2xl transition-all group text-left"
          >
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <Palette size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">Custom Link</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Full control — set product title, image, price, discounts, expiry, and custom URL.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Link Modal ────────────────────────────────────────────────────────
function CreateLinkModal({
  type, businessId, businessSlug, businessName, onClose, onCreated
}: {
  type: 'default' | 'custom';
  businessId: string;
  businessSlug: string;
  businessName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<LinkForm>({
    title: type === 'default' ? businessName : '',
    link_id: type === 'default' ? `default-${Math.random().toString(36).substring(7)}` : '',
    amount: '',
    currency: 'BDT',
    discount: '',
    discount_type: 'flat',
    description: type === 'default' ? businessName : '',
    product_logo: '',
    expires_type: 'none',
    expires_value: '',
  });

  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof LinkForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    const link_id = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setForm(f => ({ ...f, title: v, link_id }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const url = await uploadProductImage(file, user.id);
    if (url) {
      setForm(f => ({ ...f, product_logo: url }));
      toast.success('Image uploaded!');
    } else {
      setLogoPreview('');
    }
    setUploading(false);
  };

  const removeImage = async () => {
    setLogoPreview('');
    setForm(f => ({ ...f, product_logo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    let expires_at: string | null = null;
    if (form.expires_type !== 'none' && form.expires_value) {
      const hours = form.expires_type === 'days'
        ? parseInt(form.expires_value) * 24
        : parseInt(form.expires_value);
      expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    }

    const payload: any = {
      merchant_id: user?.id,
      business_id: businessId,
      title: form.title,
      link_id: form.link_id || Math.random().toString(36).substring(7),
      currency: form.currency,
      status: 'active',
      description: form.description || '',
      discount: form.discount ? parseFloat(form.discount) : 0,
      discount_type: form.discount_type,
      product_logo: form.product_logo || null,
    };

    if (type === 'default') {
      payload.amount = null;
      payload.description = businessName;
    } else {
      payload.amount = form.amount ? parseFloat(form.amount) : null;
    }

    if (expires_at) payload.expires_at = expires_at;

    const { error } = await supabase.from('payment_links').insert(payload);

    if (error) {
      toast.error(error.message.includes('unique') ? 'Link ID already taken. Try another.' : `Error: ${error.message}`);
      setSaving(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        toast.success('Payment link created!');
        onCreated();
      }, 1400);
    }
  };

  const sym = symbol(form.currency);
  const isCustom = type === 'custom';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">

        {/* Success overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#111827]/95 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-5">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Link Created!</h3>
            <p className="text-sm text-slate-500 mt-1">Redirecting...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">
              {type === 'default' ? '⚡ Default Link' : '🎨 Custom Link'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === 'default' ? 'Creates a quick open-amount payment link' : 'Create a fully customized payment link'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          <form id="link-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Product / Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder={type === 'default' ? businessName : 'e.g. Premium Smartwatch'}
                value={form.title}
                onChange={e => isCustom ? handleTitleChange(e.target.value) : set('title', e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Custom URL */}
            {isCustom && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Edit3 size={10} /> Customize URL <span className="text-red-500">*</span>
                </label>
                <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                  <span className="pl-4 py-3.5 text-xs font-mono text-slate-400 items-center flex shrink-0 hidden sm:flex">
                    {getDisplayUrl(businessSlug, '')}
                  </span>
                  <input
                    required
                    type="text"
                    value={form.link_id}
                    onChange={e => set('link_id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-3 py-3.5 bg-transparent outline-none text-sm font-mono font-bold text-blue-600 dark:text-blue-400"
                    placeholder="my-product"
                  />
                </div>
              </div>
            )}

            {/* Product Image (Custom only) */}
            {isCustom && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon size={10} /> Product Image <span className="text-red-500">*</span>
                  <span className="text-[9px] font-bold text-slate-300 normal-case tracking-normal">(Max 2MB · JPG, PNG, WEBP)</span>
                </label>

                {logoPreview ? (
                  <div className="relative w-full h-36 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                        <Loader2 size={22} className="animate-spin text-blue-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 hover:text-blue-600 transition-colors">
                        <Upload size={13} />
                      </button>
                      <button type="button" onClick={removeImage} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {form.product_logo && (
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">Uploaded ✓</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-xl flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Click to upload product image</p>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            )}

            {/* Amount & Currency */}
            {isCustom && (
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-[#0B1120]/60 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Currency
                  </label>
                  <div className="flex bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {['BDT', 'USD'].map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => set('currency', c)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                          form.currency === c ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">{sym}</span>
                    <input
                      required
                      type="number"
                      step="any"
                      min="1"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => set('amount', e.target.value)}
                      className="w-full pl-8 pr-3 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-black text-slate-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={10} /> Discount
                  </label>
                  <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors bg-white dark:bg-[#111827]">
                    <select
                      value={form.discount_type}
                      onChange={e => set('discount_type', e.target.value)}
                      className="bg-slate-50 dark:bg-[#0B1120] px-3 py-3 text-xs font-black text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <option value="flat">Flat ({sym})</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={form.discount}
                      onChange={e => set('discount', e.target.value)}
                      className="w-full px-4 py-3 bg-transparent outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Price Preview */}
                {form.amount && (
                  <div className="col-span-2 flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer pays</span>
                      {parseFloat(form.discount || '0') > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          {sym}{parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-black text-blue-600">
                      {sym}{calcFinal(
                        parseFloat(form.amount),
                        parseFloat(form.discount || '0'),
                        form.discount_type
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Description {isCustom && <span className="text-red-500">*</span>}
              </label>
              <textarea
                required={isCustom}
                rows={2}
                placeholder="Brief product description..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Link Expiry (Custom only) */}
            {isCustom && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={10} /> Link Expiry
                </label>
                <div className="flex gap-2">
                  {['none', 'hours', 'days'].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => set('expires_type', t as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                        form.expires_type === t
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {t === 'none' ? 'No Expiry' : t}
                    </button>
                  ))}
                  {form.expires_type !== 'none' && (
                    <input
                      type="number"
                      min="1"
                      placeholder={form.expires_type === 'hours' ? 'e.g. 24' : 'e.g. 7'}
                      value={form.expires_value}
                      onChange={e => set('expires_value', e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-colors"
                    />
                  )}
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="link-form"
            disabled={saving || isSuccess || uploading}
            className="flex-1 py-3.5 rounded-xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
          >
            {saving || isSuccess ? <Loader2 size={16} className="animate-spin" /> : 'Create Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Row ─────────────────────────────────────────────────────────────────
function LinkRow({
  link, index, slug, onDelete, onToggle, onRefresh
}: {
  link: PaymentLink;
  index: number;
  slug: string;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: string) => void;
  onRefresh: () => void;
}) {
  const [toggling, setToggling] = useState(false);
  const sym_ = symbol(link.currency);
  const finalPrice = link.amount ? calcFinal(link.amount, link.discount, link.discount_type) : null;
  const displayUrl = getDisplayUrl(slug, link.link_id);
  const liveUrl = getLiveUrl(slug, link.link_id);
  const isActive = link.status === 'active';

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    toast.success('Link copied!');
  };

  const handleToggle = async () => {
    setToggling(true);
    const newStatus = isActive ? 'inactive' : 'active';
    const { error } = await supabase.from('payment_links').update({ status: newStatus }).eq('id', link.id);
    if (!error) {
      toast.success(`Link ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      onToggle(link.id, newStatus);
    } else {
      toast.error('Failed to update status');
    }
    setToggling(false);
  };

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group">
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-slate-300 dark:text-slate-600">{String(index + 1).padStart(2, '0')}</span>
      </td>

      {/* Product */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {link.product_logo ? (
            <img src={link.product_logo} alt={link.title} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
              <LinkIcon size={16} className="text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{link.title}</p>
            {link.description && (
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">{link.description}</p>
            )}
          </div>
        </div>
      </td>

      {/* URL */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1.5 rounded-lg w-fit max-w-[200px]">
          <Globe size={11} className="shrink-0" />
          <span className="truncate">{displayUrl}</span>
        </div>
      </td>

      {/* Price */}
      <td className="px-5 py-4">
        {link.amount ? (
          <div>
            {link.discount > 0 && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-slate-400 line-through">{sym_}{link.amount}</span>
                <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  -{link.discount}{link.discount_type === 'percentage' ? '%' : sym_}
                </span>
              </div>
            )}
            {link.discount === 0 && (
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">No discount</p>
            )}
            <p className="font-black text-slate-900 dark:text-white text-base">
              {sym_}{(finalPrice ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ) : (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">
            Open Amount
          </span>
        )}
      </td>

      {/* Status Toggle */}
      <td className="px-5 py-4">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {toggling ? <Loader2 size={12} className="animate-spin" /> : isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={handleCopy} title="Copy Link" className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-500 hover:text-blue-600 rounded-xl transition-colors">
            <Copy size={14} />
          </button>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" title="Open Link" className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-500 hover:text-blue-600 rounded-xl transition-colors inline-flex">
            <ExternalLink size={14} />
          </a>
          <button onClick={() => onDelete(link.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentLinks() {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessSlug, setBusinessSlug] = useState('business');
  const [businessName, setBusinessName] = useState('My Business');
  const [showChooser, setShowChooser] = useState(false);
  const [createType, setCreateType] = useState<'default' | 'custom' | null>(null);

  const fetchData = async (bizId: string) => {
    setLoading(true);
    const { data: biz } = await supabase.from('businesses').select('slug, name').eq('id', bizId).single();
    if (biz?.slug) setBusinessSlug(biz.slug);
    if (biz?.name) setBusinessName(biz.name);

    const { data } = await supabase
      .from('payment_links')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    if (data) setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    const load = () => {
      const id = localStorage.getItem('active_business_id');
      if (id) { setBusinessId(id); fetchData(id); }
      else setLoading(false);
    };
    load();
    window.addEventListener('businessChanged', load);
    return () => window.removeEventListener('businessChanged', load);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment link?')) return;
    const { error } = await supabase.from('payment_links').delete().eq('id', id);
    if (!error) {
      setLinks(l => l.filter(x => x.id !== id));
      toast.success('Link deleted');
    }
  };

  const handleToggle = (id: string, status: string) => {
    setLinks(l => l.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleCreated = () => {
    setCreateType(null);
    setShowChooser(false);
    if (businessId) fetchData(businessId);
  };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Select a business from the sidebar to manage payment links.</p>
      </div>
    );
  }

  const activeLinks = links.filter(l => l.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <LinkIcon size={24} className="text-blue-600" /> Payment Links
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage payment links for your products and services.
          </p>
        </div>
        <button
          onClick={() => setShowChooser(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5"
        >
          <Plus size={17} /> Create New Link
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {!loading && links.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Links', value: links.length, color: 'text-slate-700 dark:text-slate-200' },
            { label: 'Active', value: activeLinks, color: 'text-emerald-600' },
            { label: 'Inactive', value: links.length - activeLinks, color: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-28">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : links.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LinkIcon size={22} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">No Links Yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first payment link to start accepting payments.</p>
            <button
              onClick={() => setShowChooser(true)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg"
            >
              Create Payment Link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800/50">
                  {['#', 'Product', 'URL', 'Price & Discount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {links.map((link, i) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    index={i}
                    slug={businessSlug}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onRefresh={() => businessId && fetchData(businessId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-xs font-bold text-slate-400">
              {links.length} {links.length === 1 ? 'link' : 'links'} total · {activeLinks} active
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showChooser && !createType && (
        <LinkTypeChooser
          onSelect={type => setCreateType(type)}
          onClose={() => setShowChooser(false)}
        />
      )}

      {createType && businessId && (
        <CreateLinkModal
          type={createType}
          businessId={businessId}
          businessSlug={businessSlug}
          businessName={businessName}
          onClose={() => { setCreateType(null); setShowChooser(false); }}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}