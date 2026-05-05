'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Link as LinkIcon, Plus, Copy, ExternalLink, Trash2, Loader2, Globe,
  Tag, Edit3, Building2, X, Image as ImageIcon, Edit,
  Clock, Upload, Check, Zap, CheckCircle, AlertCircle
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
  expires_at?: string | null;
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
  expires_date_from: string;
  expires_date_to: string;
  expires_hours: string;
};

type EditForm = {
  title: string;
  amount: string;
  discount: string;
  discount_type: string;
  description: string;
  expires_at: string; 
};

type BusinessStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcFinal = (amount: number, discount: number, type: string) => {
  if (!amount) return 0;
  if (type === 'percentage') return Math.max(0, amount - (amount * (discount / 100)));
  return Math.max(0, amount - discount);
};

const symbol = (currency: string) => currency === 'USD' ? '$' : '৳';

const titleToSlug = (title: string) =>
  title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/(^-|-$)/g, '');

const getLiveUrl = (slug: string, linkId: string) =>
  typeof window !== 'undefined' ? `${window.location.origin}/${slug}/${linkId}` : `/${slug}/${linkId}`;

const getDisplayUrl = (slug: string, linkId: string) =>
  typeof window !== 'undefined' ? `${window.location.host}/${slug}/${linkId}` : `${slug}/${linkId}`;

const formatExpiry = (expires_at: string | null | undefined) => {
  if (!expires_at) return '—';
  const d = new Date(expires_at);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  if (d < now) return 'Expired';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const isExpired = (expires_at: string | null | undefined) => {
  if (!expires_at) return false;
  return new Date(expires_at) < new Date();
};

const isDefaultLink = (link_id: string) =>
  link_id === 'payment' || link_id.startsWith('default-');

const extractStoragePath = (url: string | null): string | null => {
  if (!url) return null;
  try {
    const match = url.match(/product-images\/(.+)$/);
    return match ? match[1] : null;
  } catch { return null; }
};

async function uploadProductImage(file: File, merchantId: string): Promise<string | null> {
  if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return null; }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) { toast.error('Only JPG, PNG, WEBP allowed'); return null; }
  const fileName = `${merchantId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) { toast.error('Upload failed: ' + error.message); return null; }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

async function deleteStorageImage(url: string | null): Promise<void> {
  const path = extractStoragePath(url);
  if (!path) return;
  await supabase.storage.from('product-images').remove([path]);
}

// ─── Reusable Components ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, textClass, borderClass, subtext }: { icon: any; label: string; value: string | number; textClass: string; borderClass: string; subtext?: string }) {
  return (
    <div className={`bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 border-b-[3px] ${borderClass} shadow-sm hover:shadow-md transition-all group flex flex-col h-full justify-between`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className={`${textClass} group-hover:scale-110 transition-transform origin-left`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-tight">{label}</p>
        </div>
        <div>
          <p className={`text-2xl sm:text-[26px] font-black ${textClass} tracking-tight truncate`}>{value}</p>
          {subtext && <p className="text-[11px] font-bold text-slate-400 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onChange} disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SuccessOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
        <Check size={28} className="text-emerald-600" />
      </div>
      <p className="text-base font-black text-slate-900 dark:text-white tracking-wide">{message}</p>
    </div>
  );
}

function BusinessPendingNotice({ supportTelegram }: { supportTelegram: string | null }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Business Pending Approval</h2>
      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm max-w-sm">
        Your business is currently under review. Payment links will be available once approved.
      </p>
      {supportTelegram && (
        <a href={supportTelegram} target="_blank" rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition-colors shadow-sm">
          Contact Support
        </a>
      )}
    </div>
  );
}

// ─── Edit Link Modal (Mobile Full-Screen) ─────────────────────────────────────
function EditLinkModal({ link, slug, onClose, onUpdated }: {
  link: PaymentLink; slug: string; onClose: () => void; onUpdated: () => void;
}) {
  const isDefault = isDefaultLink(link.link_id);
  const existingExpiry = link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : '';

  const [form, setForm] = useState<EditForm>({
    title: link.title,
    amount: link.amount ? String(link.amount) : '',
    discount: link.discount ? String(link.discount) : '',
    discount_type: link.discount_type || 'flat',
    description: link.description || '',
    expires_at: existingExpiry,
  });
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(link.product_logo || '');
  const [logoUrl, setLogoUrl] = useState<string>(link.product_logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof EditForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const sym = symbol(link.currency);
  const previewUrl = getDisplayUrl(slug, titleToSlug(form.title) || link.link_id);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated'); setUploading(false); return; }
    if (logoUrl) await deleteStorageImage(logoUrl);
    const url = await uploadProductImage(file, user.id);
    if (url) { setLogoUrl(url); toast.success('Image uploaded!'); } else { setLogoPreview(logoUrl); }
    setUploading(false);
  };

  const handleRemoveImage = async () => {
    if (logoUrl) await deleteStorageImage(logoUrl);
    setLogoPreview(''); setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newLinkId = titleToSlug(form.title) || link.link_id;
    const payload: any = {
      title: form.title, link_id: newLinkId, description: form.description,
      discount: form.discount ? parseFloat(form.discount) : 0, discount_type: form.discount_type,
      product_logo: logoUrl || null, expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    if (link.amount !== null) payload.amount = form.amount ? parseFloat(form.amount) : null;

    const { error } = await supabase.from('payment_links').update(payload).eq('id', link.id);
    if (error) { toast.error('Update failed: ' + error.message); setSaving(false); }
    else { setIsSuccess(true); setTimeout(() => { toast.success('Link updated!'); onUpdated(); }, 1400); }
  };

  const finalPrice = form.amount && parseFloat(form.amount)
    ? calcFinal(parseFloat(form.amount), parseFloat(form.discount || '0'), form.discount_type) : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl relative flex flex-col sm:max-h-[92vh]">
        {isSuccess && <SuccessOverlay message="Link Updated!" />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] z-10 sm:rounded-t-2xl">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">Edit Link</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5 font-mono">{link.link_id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {isDefault ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LinkIcon size={24} className="text-slate-400" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white uppercase">Cannot Edit Default</p>
              <p className="text-sm font-bold text-slate-500 mt-2 max-w-[200px]">Default payment links are managed automatically.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button type="button" onClick={onClose} className="w-full py-3.5 rounded-xl font-black text-sm text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-6 custom-scrollbar">
              <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                  <input required type="text" value={form.title} onChange={e => set('title', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm" />
                </div>

                {/* Link Preview */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Link Preview</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <Globe size={14} className="text-blue-500 shrink-0" />
                    <span className="text-[13px] font-mono font-bold text-blue-600 dark:text-blue-400 truncate">{previewUrl}</span>
                  </div>
                </div>

                {/* Product Image */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ImageIcon size={12} /> Product Image <span className="text-[9px] font-bold text-slate-400 normal-case tracking-normal ml-1">(Max 2MB)</span>
                  </label>
                  {logoPreview ? (
                    <div className="relative w-full h-36 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm group">
                      <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 size={24} className="animate-spin text-blue-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md text-slate-600 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                        <button type="button" onClick={handleRemoveImage} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                      </div>
                      {logoUrl && !uploading && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 shadow-sm"><Check size={12} /> Uploaded</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Upload size={16} className="text-slate-400 group-hover:text-blue-600" /></div>
                      <p className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600">Click to upload product image</p>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
                </div>

                {/* Amount */}
                {link.amount !== null && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price ({link.currency})</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{sym}</span>
                      <input required type="number" step="any" min="1" value={form.amount} onChange={e => set('amount', e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-black text-slate-900 dark:text-white transition-all shadow-sm" />
                    </div>
                  </div>
                )}

                {/* Discount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Tag size={12} /> Discount</label>
                  <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all bg-slate-50 dark:bg-[#0B1120] shadow-sm">
                    <select value={form.discount_type} onChange={e => set('discount_type', e.target.value)}
                      className="bg-slate-100 dark:bg-[#111827] px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer">
                      <option value="flat">Flat ({sym})</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                    <input type="number" step="any" min="0" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)}
                      className="w-full px-4 py-3 bg-transparent outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400" />
                  </div>
                </div>

                {/* Price Preview */}
                {finalPrice !== null && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl px-5 py-4">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Customer pays</p>
                      {parseFloat(form.discount || '0') > 0 && (
                        <p className="text-xs font-bold text-slate-400 line-through mt-0.5">{sym}{parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      )}
                    </div>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{sym}{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief product description..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm resize-none placeholder:text-slate-400" />
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> Link Expiration Date <span className="text-[9px] font-bold text-slate-400 normal-case tracking-normal ml-1">(Optional)</span>
                  </label>
                  <input type="datetime-local" value={form.expires_at} onChange={e => set('expires_at', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                  {form.expires_at && (
                    <button type="button" onClick={() => set('expires_at', '')} className="text-[11px] text-red-500 hover:text-red-700 font-bold mt-1 inline-block">
                      Clear Expiry
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 bg-white dark:bg-[#111827] sm:rounded-b-2xl">
              <button type="button" onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-black text-sm text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button type="submit" form="edit-form" disabled={saving || isSuccess || uploading}
                className="flex-1 py-3.5 rounded-xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex justify-center items-center gap-2 shadow-sm">
                {saving || isSuccess ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Link Type Chooser (Mobile Full-Screen) ───────────────────────────────────
function LinkTypeChooser({ onSelect, onClose }: { onSelect: (type: 'default' | 'custom') => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-7 shadow-2xl relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
          <X size={16} className="text-slate-500" />
        </button>
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 mt-2">Create Link</h3>
        <p className="text-[13px] font-bold text-slate-500 mb-8">Choose the type of payment link.</p>
        <div className="space-y-4">
          {[
            { type: 'default' as const, icon: Zap, label: 'Default Link', desc: 'Quick link with no fixed amount. Customers enter their own amount.' },
            { type: 'custom' as const, icon: LinkIcon, label: 'Custom Link', desc: 'Full control — set product title, image, price, discounts, expiry, and custom URL.' },
          ].map(opt => (
            <button key={opt.type} onClick={() => onSelect(opt.type)}
              className="w-full flex items-start gap-5 p-5 bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600 rounded-2xl transition-all group text-left">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm group-hover:bg-blue-600 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                <opt.icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-0.5">
                <p className="font-black text-slate-900 dark:text-white text-[15px]">{opt.label}</p>
                <p className="text-[12px] font-bold text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Create Link Modal (Mobile Full-Screen) ───────────────────────────────────
function CreateLinkModal({ type, businessId, businessSlug, businessName, existingLinks, onClose, onCreated }: {
  type: 'default' | 'custom'; businessId: string; businessSlug: string; businessName: string; existingLinks: PaymentLink[]; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<LinkForm>({
    title: type === 'default' ? businessName : '', link_id: type === 'default' ? 'payment' : '', amount: '', currency: 'BDT',
    discount: '', discount_type: 'flat', description: type === 'default' ? businessName : '', product_logo: '',
    expires_type: 'none', expires_date_from: '', expires_date_to: '', expires_hours: '',
  });
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof LinkForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    const link_id = titleToSlug(v);
    setForm(f => ({ ...f, title: v, link_id }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const url = await uploadProductImage(file, user.id);
    if (url) { set('product_logo', url); toast.success('Image uploaded!'); } else { setLogoPreview(''); }
    setUploading(false);
  };

  const removeImage = async () => {
    if (form.product_logo) await deleteStorageImage(form.product_logo);
    setLogoPreview(''); set('product_logo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'custom' && !form.product_logo) { toast.error('Please upload a product image'); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated'); setSaving(false); return; }

    const finalLinkId = type === 'default' ? 'payment' : (form.link_id || titleToSlug(form.title));
    const isDupe = existingLinks.some(l => l.link_id === finalLinkId);
    if (isDupe) { toast.error('Link ID already taken. Try another.'); setSaving(false); return; }

    let expires_at: string | null = null;
    if (form.expires_type === 'hours' && form.expires_hours) {
      expires_at = new Date(Date.now() + parseInt(form.expires_hours) * 3600000).toISOString();
    } else if (form.expires_type === 'days' && form.expires_date_to) {
      expires_at = new Date(form.expires_date_to + 'T23:59:59').toISOString();
    }

    const payload: any = {
      merchant_id: user.id, business_id: businessId, title: type === 'default' ? `Payment for ${businessName}` : form.title,
      link_id: finalLinkId, currency: form.currency, status: 'active', description: type === 'default' ? null : (form.description || null),
      discount: form.discount ? parseFloat(form.discount) : 0, discount_type: form.discount_type, product_logo: type === 'default' ? null : (form.product_logo || null),
    };
    if (type === 'default') { payload.amount = null; } else { payload.amount = form.amount ? parseFloat(form.amount) : null; }
    if (expires_at) payload.expires_at = expires_at;

    const { error } = await supabase.from('payment_links').insert(payload);
    if (error) { toast.error(error.message.includes('unique') ? 'Link ID already taken. Try another.' : `Error: ${error.message}`); setSaving(false); } 
    else { setIsSuccess(true); setTimeout(() => { toast.success('Payment link created!'); onCreated(); }, 1500); }
  };

  const sym = symbol(form.currency);
  const isCustom = type === 'custom';
  const finalPrice = form.amount && parseFloat(form.amount) > 0 ? calcFinal(parseFloat(form.amount), parseFloat(form.discount || '0'), form.discount_type) : null;
  const defaultLinkPreview = getDisplayUrl(businessSlug, 'payment');
  const customLinkPreview = getDisplayUrl(businessSlug, form.link_id || 'your-product');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl shadow-2xl relative flex flex-col sm:max-h-[92vh]">
        {isSuccess && <SuccessOverlay message="Link Created!" />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] z-10 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <LinkIcon size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{type === 'default' ? 'Default Link' : 'Custom Link'}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{type === 'default' ? 'Quick open-amount payment link' : 'Fully customized payment link'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6 custom-scrollbar">
          <form id="link-form" onSubmit={handleSubmit} className="space-y-5">
            {!isCustom && (
              <div className="flex items-center gap-2 px-5 py-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl shadow-sm">
                <Globe size={16} className="text-blue-500 shrink-0" />
                <span className="text-[13px] font-mono font-black text-blue-600 dark:text-blue-400 truncate">{defaultLinkPreview}</span>
              </div>
            )}
            {isCustom && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product / Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Premium Smartwatch" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-400" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Edit3 size={12} /> Customize URL <span className="text-red-500">*</span></label>
                  <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all shadow-sm">
                    <span className="pl-4 py-3 text-xs font-mono font-bold text-slate-400 items-center hidden sm:flex shrink-0">{getDisplayUrl(businessSlug, '')}</span>
                    <input required type="text" value={form.link_id} onChange={e => set('link_id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full px-3 py-3 bg-transparent outline-none text-sm font-mono font-black text-blue-600 dark:text-blue-400" placeholder="my-product" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Preview: <span className="text-blue-500 font-mono bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">{customLinkPreview}</span></p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ImageIcon size={12} /> Product Image <span className="text-[9px] font-bold text-slate-400 normal-case tracking-normal ml-1">(Max 2MB) <span className="text-red-500">*</span></span>
                  </label>
                  {logoPreview ? (
                    <div className="relative w-full h-36 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm group">
                      <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 size={24} className="animate-spin text-blue-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md text-slate-600 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                        <button type="button" onClick={removeImage} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                      </div>
                      {form.product_logo && !uploading && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 shadow-sm"><Check size={12} /> Uploaded</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Upload size={16} className="text-slate-400 group-hover:text-blue-600" /></div>
                      <p className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600">Click to upload product image</p>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
                </div>

                <div className="p-5 bg-slate-50 dark:bg-[#0B1120]/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Currency</label>
                      <div className="flex bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {['BDT', 'USD'].map(c => (
                          <button key={c} type="button" onClick={() => set('currency', c)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${form.currency === c ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">{sym}</span>
                        <input required type="number" step="any" min="1" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)}
                          className="w-full pl-9 pr-3 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-black text-slate-900 dark:text-white transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Tag size={12} /> Discount</label>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all bg-white dark:bg-[#111827] shadow-sm">
                      <select value={form.discount_type} onChange={e => set('discount_type', e.target.value)}
                        className="bg-slate-50 dark:bg-[#0B1120] px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer">
                        <option value="flat">Flat ({sym})</option>
                        <option value="percentage">Percent (%)</option>
                      </select>
                      <input type="number" step="any" min="0" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </div>
                  </div>

                  {form.amount && parseFloat(form.amount) > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Original</p>
                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-200">{sym}{parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount</p>
                        <p className="text-[13px] font-black text-orange-500">
                          {parseFloat(form.discount || '0') > 0 ? form.discount_type === 'percentage' ? `-${form.discount}%` : `-${sym}${parseFloat(form.discount).toLocaleString('en-IN')}` : '—'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Final</p>
                        <p className="text-[13px] font-black text-blue-600 dark:text-blue-400">
                          {sym}{(finalPrice ?? parseFloat(form.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description <span className="text-red-500">*</span></label>
                  <textarea required rows={3} placeholder="Brief product description..." value={form.description} onChange={e => set('description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm resize-none placeholder:text-slate-400" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> Link Expiry</label>
                  <div className="flex gap-2 flex-wrap">
                    {[{ val: 'none', label: 'No Expiry' }, { val: 'hours', label: 'Hours' }, { val: 'days', label: 'Date Range' }].map(t => (
                      <button key={t.val} type="button" onClick={() => set('expires_type', t.val as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shadow-sm ${form.expires_type === t.val ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {form.expires_type === 'hours' && (
                    <input type="number" min="1" placeholder="e.g. 24 hours" value={form.expires_hours} onChange={e => set('expires_hours', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white shadow-sm" />
                  )}
                  {form.expires_type === 'days' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['expires_date_from', 'expires_date_to'].map((k, i) => (
                        <div key={k} className="space-y-1.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{i === 0 ? 'From' : 'To'}</p>
                          <input type="date" value={(form as any)[k]} onChange={e => set(k as keyof LinkForm, e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white shadow-sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 bg-white dark:bg-[#111827] sm:rounded-b-2xl">
          <button type="button" onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-black text-sm text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" form="link-form" disabled={saving || isSuccess || uploading}
            className="flex-1 py-3.5 rounded-xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-sm transition-all flex justify-center items-center gap-2">
            {saving || isSuccess ? <Loader2 size={16} className="animate-spin" /> : uploading ? 'Uploading...' : 'Create Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Row ─────────────────────────────────────────────────────────────────
function LinkRow({ link, slug, onDelete, onToggle, onEdit }: {
  link: PaymentLink; slug: string; onDelete: (id: string) => void; onToggle: (id: string, status: string) => void; onEdit: (link: PaymentLink) => void;
}) {
  const [toggling, setToggling] = useState(false);
  const sym_ = symbol(link.currency);
  const finalPrice = link.amount ? calcFinal(link.amount, link.discount, link.discount_type) : null;
  const displayUrl = getDisplayUrl(slug, link.link_id);
  const liveUrl = getLiveUrl(slug, link.link_id);
  const isActive = link.status === 'active';
  const isDefault = isDefaultLink(link.link_id);
  const expired = isExpired(link.expires_at);
  const isInactive = link.status === 'inactive';

  const canModify = !isInactive && !isDefault;

  const handleCopy = () => { navigator.clipboard.writeText(liveUrl); toast.success('Link copied!'); };

  const handleToggle = async () => {
    setToggling(true);
    const newStatus = isActive ? 'inactive' : 'active';
    const { error } = await supabase.from('payment_links').update({ status: newStatus }).eq('id', link.id);
    if (!error) { toast.success(`Link ${newStatus === 'active' ? 'activated' : 'deactivated'}`); onToggle(link.id, newStatus); }
    else toast.error('Failed to update status');
    setToggling(false);
  };

  const rowBg = isInactive ? 'bg-slate-50 dark:bg-slate-900/40 opacity-70' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/20';
  const textBase = isInactive ? 'text-[13px] font-bold text-slate-400 dark:text-slate-500' : 'text-[13px] font-black text-slate-800 dark:text-white';

  return (
    <tr className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors group ${rowBg}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {link.product_logo
            ? <img src={link.product_logo} alt={link.title} className={`w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 ${isInactive ? 'grayscale opacity-60' : ''}`} />
            : <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <LinkIcon size={16} className={isInactive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'} />
              </div>}
          <div>
            <p className={`${textBase} ${!isInactive ? 'text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors' : ''}`}>
              {link.title || <span className="text-slate-400 italic text-[11px]">Default</span>}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {isDefault && <span className="text-[9px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-md">Default</span>}
              {isInactive && <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-md">Inactive</span>}
              {link.description && !isDefault && <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 max-w-[160px] truncate">{link.description}</p>}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            className={`text-[13px] font-mono font-bold max-w-[200px] truncate ${isInactive ? 'text-slate-400 cursor-default pointer-events-none' : 'text-blue-500 hover:text-blue-700 hover:underline'}`}>
            {displayUrl}
          </a>
          <button onClick={handleCopy} title="Copy" className={`p-1.5 rounded-lg transition-colors shrink-0 ${isInactive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 shadow-sm'}`}><Copy size={13} /></button>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" title="Open" className={`p-1.5 rounded-lg transition-colors inline-flex shrink-0 ${isInactive ? 'text-slate-300 dark:text-slate-600 pointer-events-none' : 'text-slate-400 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 shadow-sm'}`}><ExternalLink size={13} /></a>
        </div>
      </td>

      <td className="px-5 py-4">
        {link.amount ? <p className={`text-[13px] font-black ${isInactive ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{sym_}{link.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> : <span className="text-[12px] font-bold text-slate-400">Open</span>}
      </td>

      <td className="px-5 py-4">
        {link.discount > 0 ? <span className={`text-[12px] font-black ${isInactive ? 'text-slate-400' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg'}`}>{link.discount_type === 'percentage' ? `-${link.discount}%` : `-${sym_}${link.discount}`}</span> : <span className="text-[12px] font-bold text-slate-400">—</span>}
      </td>

      <td className="px-5 py-4">
        {link.amount ? <p className={`text-[13px] font-black ${isInactive ? 'text-slate-400' : 'text-teal-600 dark:text-teal-400'}`}>{sym_}{(finalPrice ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> : <span className="text-[12px] font-bold text-slate-400">—</span>}
      </td>

      <td className="px-5 py-4">
        <span className={`text-[11px] font-black uppercase tracking-widest ${isInactive ? 'text-slate-400' : expired ? 'text-red-500' : link.expires_at ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {formatExpiry(link.expires_at)}
        </span>
      </td>

      <td className="px-5 py-4">
        {toggling ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <ToggleSwitch checked={isActive} onChange={handleToggle} />}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => canModify && onEdit(link)} disabled={!canModify} title={isDefault ? 'Default links cannot be edited' : isInactive ? 'Activate the link to edit it' : 'Edit'}
            className={`p-2 rounded-xl transition-all ${!canModify ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm'}`}><Edit3 size={16} /></button>
          <button onClick={() => canModify && onDelete(link.id)} disabled={!canModify} title={isDefault ? 'Default links cannot be deleted' : isInactive ? 'Activate the link to delete it' : 'Delete'}
            className={`p-2 rounded-xl transition-all ${!canModify ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm'}`}><Trash2 size={16} /></button>
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
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus | null>(null);
  const [supportTelegram, setSupportTelegram] = useState<string | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [createType, setCreateType] = useState<'default' | 'custom' | null>(null);
  const [editLink, setEditLink] = useState<PaymentLink | null>(null);

  const fetchData = async (bizId: string) => {
    setLoading(true);
    const { data: biz } = await supabase.from('businesses').select('slug, business_name, status').eq('id', bizId).single();
    if (biz) {
      if (biz.slug) setBusinessSlug(biz.slug);
      if (biz.business_name) setBusinessName(biz.business_name);
      if (biz.status) setBusinessStatus(biz.status as BusinessStatus);
    }
    const { data: settings } = await supabase.from('site_settings').select('value').eq('key_name', 'support_telegram').eq('is_active', true).single();
    if (settings?.value) setSupportTelegram(settings.value);

    if (biz?.status === 'active') {
      const { data } = await supabase.from('payment_links').select('*').eq('business_id', bizId).order('created_at', { ascending: false });
      if (data) setLinks(data);
    }
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
    const link = links.find(l => l.id === id);
    if (link && isDefaultLink(link.link_id)) { toast.error('Default links cannot be deleted'); return; }
    if (!confirm('Delete this payment link?')) return;
    if (link?.product_logo) await deleteStorageImage(link.product_logo);
    const { error } = await supabase.from('payment_links').delete().eq('id', id);
    if (!error) { setLinks(l => l.filter(x => x.id !== id)); toast.success('Link deleted'); }
  };

  const handleToggle = (id: string, status: string) => {
    setLinks(l => l.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleCreated = () => { setCreateType(null); setShowChooser(false); if (businessId) fetchData(businessId); };
  const handleUpdated = () => { setEditLink(null); if (businessId) fetchData(businessId); };

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold">Select a business from the sidebar to manage payment links.</p>
      </div>
    );
  }

  if (businessStatus && businessStatus !== 'active') {
    return <BusinessPendingNotice supportTelegram={supportTelegram} />;
  }

  const activeLinks = links.filter(l => l.status === 'active').length;
  const inactiveLinks = links.length - activeLinks;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Payment Links
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Create and manage payment links for your products and services.</p>
        </div>
        <button onClick={() => setShowChooser(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-md hover:-translate-y-0.5 shrink-0">
          <Plus size={18} /> Create New Link
        </button>
      </div>

      {/* ── Stats Cards (Now Mobile Responsive) ── */}
      {!loading && links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            icon={LinkIcon} 
            label="Total Links" 
            value={links.length} 
            textClass="text-blue-600 dark:text-blue-500" 
            borderClass="border-b-blue-600 dark:border-b-blue-500" 
            subtext="Payment links created" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Active" 
            value={activeLinks} 
            textClass="text-emerald-600 dark:text-emerald-500" 
            borderClass="border-b-emerald-600 dark:border-b-emerald-500" 
            subtext="Currently accepting payments" 
          />
          <StatCard 
            icon={X} 
            label="Inactive" 
            value={inactiveLinks} 
            textClass="text-slate-400 dark:text-slate-500" 
            borderClass="border-b-slate-400 dark:border-b-slate-500" 
            subtext="Disabled or paused links" 
          />
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-28"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : links.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><LinkIcon size={24} /></div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Links Yet</h3>
            <p className="text-slate-500 font-bold text-sm mb-6 max-w-sm mx-auto">Create your first payment link to start accepting payments easily.</p>
            <button onClick={() => setShowChooser(true)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-sm hover:-translate-y-0.5 transition-all shadow-md">
              Create Payment Link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead>
                <tr>
                  {['Product', 'Payment Link', 'Price', 'Discount', 'After Discount', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <LinkRow key={link.id} link={link} slug={businessSlug} onDelete={handleDelete} onToggle={handleToggle} onEdit={setEditLink} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-[12px] font-bold text-slate-500">
              {links.length} {links.length === 1 ? 'link' : 'links'} · <span className="text-emerald-600 dark:text-emerald-400 font-black">{activeLinks} active</span>
              {inactiveLinks > 0 && <> · <span className="text-slate-400 font-black">{inactiveLinks} inactive</span></>}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showChooser && !createType && (
        <LinkTypeChooser onSelect={type => setCreateType(type)} onClose={() => setShowChooser(false)} />
      )}
      {createType && businessId && (
        <CreateLinkModal
          type={createType}
          businessId={businessId}
          businessSlug={businessSlug}
          businessName={businessName}
          existingLinks={links}
          onClose={() => { setCreateType(null); setShowChooser(false); }}
          onCreated={handleCreated}
        />
      )}
      {editLink && (
        <EditLinkModal link={editLink} slug={businessSlug} onClose={() => setEditLink(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}