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
  expires_at: string; // NEW — editable expiration date
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

// ─── Toggle Switch ────────────────────────────────────────────────────────────
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
    <div className="absolute inset-0 bg-white/97 dark:bg-[#111827]/97 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
        <Check size={28} className="text-emerald-600" />
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-white">{message}</p>
    </div>
  );
}

// ─── Business Pending Notice ──────────────────────────────────────────────────
function BusinessPendingNotice({ supportTelegram }: { supportTelegram: string | null }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business Pending Approval</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        Your business is currently under review. Payment links will be available once approved.
      </p>
      {supportTelegram && (
        <a href={supportTelegram} target="_blank" rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
          Contact Support
        </a>
      )}
    </div>
  );
}

// ─── Edit Link Modal ──────────────────────────────────────────────────────────
function EditLinkModal({ link, slug, onClose, onUpdated }: {
  link: PaymentLink;
  slug: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const isDefault = isDefaultLink(link.link_id);

  // Pre-fill expires_at for the date input (format: YYYY-MM-DDTHH:MM)
  const existingExpiry = link.expires_at
    ? new Date(link.expires_at).toISOString().slice(0, 16)
    : '';

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
      title: form.title,
      link_id: newLinkId,
      description: form.description,
      discount: form.discount ? parseFloat(form.discount) : 0,
      discount_type: form.discount_type,
      product_logo: logoUrl || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    if (link.amount !== null) payload.amount = form.amount ? parseFloat(form.amount) : null;

    const { error } = await supabase.from('payment_links').update(payload).eq('id', link.id);
    if (error) { toast.error('Update failed: ' + error.message); setSaving(false); }
    else { setIsSuccess(true); setTimeout(() => { toast.success('Link updated!'); onUpdated(); }, 1400); }
  };

  const finalPrice = form.amount && parseFloat(form.amount)
    ? calcFinal(parseFloat(form.amount), parseFloat(form.discount || '0'), form.discount_type)
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {isSuccess && <SuccessOverlay message="Link Updated!" />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Edit Link</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{link.link_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {isDefault ? (
          <>
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <LinkIcon size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Default links cannot be edited</p>
              <p className="text-xs text-slate-400 mt-1">Default payment links are managed automatically.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={onClose}
                className="w-full py-3 rounded-xl font-medium text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Title</label>
                  <input required type="text" value={form.title} onChange={e => set('title', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors" />
                </div>

                {/* Link Preview */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Link Preview</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl">
                    <Globe size={12} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-mono text-blue-500 truncate">{previewUrl}</span>
                  </div>
                </div>

                {/* Product Image */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon size={10} /> Product Image
                    <span className="text-[9px] font-normal text-slate-300 normal-case tracking-normal">(Max 2MB · JPG, PNG, WEBP)</span>
                  </label>
                  {logoPreview ? (
                    <div className="relative w-full h-32 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-blue-600" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-500 hover:text-blue-600 transition-colors"><Edit size={12} /></button>
                        <button type="button" onClick={handleRemoveImage}
                          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                      {logoUrl && !uploading && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            <Check size={9} /> Uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                      <Upload size={15} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <p className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors">Click to upload product image</p>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
                </div>

                {/* Amount */}
                {link.amount !== null && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Price ({link.currency})</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                      <input required type="number" step="any" min="1" value={form.amount} onChange={e => set('amount', e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-900 dark:text-white transition-colors" />
                    </div>
                  </div>
                )}

                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Tag size={10} /> Discount</label>
                  <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors bg-slate-50 dark:bg-[#0B1120]">
                    <select value={form.discount_type} onChange={e => set('discount_type', e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 px-3 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer">
                      <option value="flat">Flat ({sym})</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                    <input type="number" step="any" min="0" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)}
                      className="w-full px-4 py-3 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                  </div>
                </div>

                {/* Price Preview */}
                {finalPrice !== null && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Customer pays</p>
                      {parseFloat(form.discount || '0') > 0 && (
                        <p className="text-xs text-slate-400 line-through">{sym}{parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      )}
                    </div>
                    <span className="text-xl font-semibold text-blue-600">{sym}{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief product description..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors resize-none placeholder:text-slate-400" />
                </div>

                {/* ── NEW: Expiration Date ── */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={10} /> Link Expiration Date
                    <span className="text-[9px] font-normal text-slate-300 normal-case tracking-normal">(leave blank for no expiry)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={e => set('expires_at', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors"
                  />
                  {form.expires_at && (
                    <button type="button" onClick={() => set('expires_at', '')}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium">
                      Clear expiry date
                    </button>
                  )}
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl font-medium text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button type="submit" form="edit-form" disabled={saving || isSuccess || uploading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex justify-center items-center gap-2">
                {saving || isSuccess ? <Loader2 size={15} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Link Type Chooser ────────────────────────────────────────────────────────
function LinkTypeChooser({ onSelect, onClose }: { onSelect: (type: 'default' | 'custom') => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl p-7 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X size={15} className="text-slate-400" />
        </button>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Create Payment Link</h3>
        <p className="text-xs text-slate-500 mb-6">Choose the type of link you want to create.</p>
        <div className="space-y-3">
          {[
            { type: 'default' as const, icon: Zap, label: 'Default Link', desc: 'Quick link with no fixed amount. Customers enter their own amount.' },
            { type: 'custom' as const, icon: LinkIcon, label: 'Custom Link', desc: 'Full control — set product title, image, price, discounts, expiry, and custom URL.' },
          ].map(opt => (
            <button key={opt.type} onClick={() => onSelect(opt.type)}
              className="w-full flex items-start gap-4 p-5 bg-slate-50 dark:bg-[#0B1120] hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl transition-all group text-left">
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                <opt.icon size={16} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{opt.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Create Link Modal ────────────────────────────────────────────────────────
function CreateLinkModal({ type, businessId, businessSlug, businessName, existingLinks, onClose, onCreated }: {
  type: 'default' | 'custom';
  businessId: string;
  businessSlug: string;
  businessName: string;
  existingLinks: PaymentLink[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<LinkForm>({
    title: type === 'default' ? businessName : '',
    link_id: type === 'default' ? 'payment' : '',
    amount: '',
    currency: 'BDT',
    discount: '',
    discount_type: 'flat',
    description: type === 'default' ? businessName : '',
    product_logo: '',
    expires_type: 'none',
    expires_date_from: '',
    expires_date_to: '',
    expires_hours: '',
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
      merchant_id: user.id,
      business_id: businessId,
      title: type === 'default' ? `Payment for ${businessName}` : form.title,
      link_id: finalLinkId,
      currency: form.currency,
      status: 'active',
      description: type === 'default' ? null : (form.description || null),
      discount: form.discount ? parseFloat(form.discount) : 0,
      discount_type: form.discount_type,
      product_logo: type === 'default' ? null : (form.product_logo || null),
    };
    if (type === 'default') { payload.amount = null; }
    else { payload.amount = form.amount ? parseFloat(form.amount) : null; }
    if (expires_at) payload.expires_at = expires_at;

    const { error } = await supabase.from('payment_links').insert(payload);
    if (error) {
      toast.error(error.message.includes('unique') ? 'Link ID already taken. Try another.' : `Error: ${error.message}`);
      setSaving(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => { toast.success('Payment link created!'); onCreated(); }, 1500);
    }
  };

  const sym = symbol(form.currency);
  const isCustom = type === 'custom';
  const finalPrice = form.amount && parseFloat(form.amount) > 0
    ? calcFinal(parseFloat(form.amount), parseFloat(form.discount || '0'), form.discount_type)
    : null;
  const defaultLinkPreview = getDisplayUrl(businessSlug, 'payment');
  const customLinkPreview = getDisplayUrl(businessSlug, form.link_id || 'your-product');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        {isSuccess && <SuccessOverlay message="Link Created!" />}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <LinkIcon size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{type === 'default' ? 'Default Link' : 'Custom Link'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{type === 'default' ? 'Quick open-amount payment link' : 'Fully customized payment link'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="link-form" onSubmit={handleSubmit} className="space-y-4">
            {!isCustom && (
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <Globe size={13} className="text-blue-500 shrink-0" />
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{defaultLinkPreview}</span>
              </div>
            )}
            {isCustom && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Product / Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Premium Smartwatch" value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors placeholder:text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Edit3 size={10} /> Customize URL <span className="text-red-500">*</span></label>
                  <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <span className="pl-4 py-3 text-xs font-mono text-slate-400 items-center hidden sm:flex shrink-0">{getDisplayUrl(businessSlug, '')}</span>
                    <input required type="text" value={form.link_id} onChange={e => set('link_id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full px-3 py-3 bg-transparent outline-none text-sm font-mono font-semibold text-blue-600 dark:text-blue-400" placeholder="my-product" />
                  </div>
                  <p className="text-[10px] text-slate-400">Preview: <span className="text-blue-500 font-mono">{customLinkPreview}</span></p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon size={10} /> Product Image <span className="text-red-500">*</span>
                    <span className="text-[9px] font-normal text-slate-300 normal-case tracking-normal">(Max 2MB · JPG, PNG, WEBP)</span>
                  </label>
                  {logoPreview ? (
                    <div className="relative w-full h-32 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-blue-600" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-500 hover:text-blue-600"><Edit size={12} /></button>
                        <button type="button" onClick={removeImage} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-500 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                      {form.product_logo && !uploading && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-medium flex items-center gap-1"><Check size={9} /> Uploaded</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                      <Upload size={15} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <p className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors">Click to upload product image <span className="text-red-400">(required)</span></p>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0B1120]/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Currency</label>
                      <div className="flex bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        {['BDT', 'USD'].map(c => (
                          <button key={c} type="button" onClick={() => set('currency', c)}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${form.currency === c ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Price <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                        <input required type="number" step="any" min="1" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)}
                          className="w-full pl-8 pr-3 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-900 dark:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Tag size={10} /> Discount</label>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors bg-white dark:bg-[#111827]">
                      <select value={form.discount_type} onChange={e => set('discount_type', e.target.value)}
                        className="bg-slate-50 dark:bg-[#0B1120] px-3 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer">
                        <option value="flat">Flat ({sym})</option>
                        <option value="percentage">Percent (%)</option>
                      </select>
                      <input type="number" step="any" min="0" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)}
                        className="w-full px-4 py-3 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </div>
                  </div>
                  {form.amount && parseFloat(form.amount) > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Original</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{sym}{parseFloat(form.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Discount</p>
                        <p className="text-sm font-semibold text-orange-500">
                          {parseFloat(form.discount || '0') > 0
                            ? form.discount_type === 'percentage' ? `-${form.discount}%` : `-${sym}${parseFloat(form.discount).toLocaleString('en-IN')}`
                            : '—'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                        <p className="text-[9px] font-semibold text-blue-500 uppercase tracking-widest mb-1">Final</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {sym}{(finalPrice ?? parseFloat(form.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Description <span className="text-red-500">*</span></label>
                  <textarea required rows={2} placeholder="Brief product description..." value={form.description} onChange={e => set('description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white transition-colors resize-none placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Link Expiry</label>
                  <div className="flex gap-2 flex-wrap">
                    {[{ val: 'none', label: 'No Expiry' }, { val: 'hours', label: 'Hours' }, { val: 'days', label: 'Date Range' }].map(t => (
                      <button key={t.val} type="button" onClick={() => set('expires_type', t.val as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${form.expires_type === t.val ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {form.expires_type === 'hours' && (
                    <input type="number" min="1" placeholder="e.g. 24 hours" value={form.expires_hours} onChange={e => set('expires_hours', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white" />
                  )}
                  {form.expires_type === 'days' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['expires_date_from', 'expires_date_to'].map((k, i) => (
                        <div key={k}>
                          <p className="text-[9px] font-medium text-slate-400 mb-1 uppercase tracking-widest">{i === 0 ? 'From' : 'To'}</p>
                          <input type="date" value={(form as any)[k]} onChange={e => set(k as keyof LinkForm, e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-900 dark:text-white" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" form="link-form" disabled={saving || isSuccess || uploading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-sm transition-all flex justify-center items-center gap-2">
            {saving || isSuccess ? <Loader2 size={15} className="animate-spin" /> : uploading ? 'Uploading...' : 'Create Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Row ─────────────────────────────────────────────────────────────────
function LinkRow({ link, slug, onDelete, onToggle, onEdit }: {
  link: PaymentLink;
  slug: string;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: string) => void;
  onEdit: (link: PaymentLink) => void;
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

  // ── Key business rule: Inactive links block edit/delete ───────────────────
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

  const rowBg = isInactive
    ? 'bg-slate-50 dark:bg-slate-900/40 opacity-70'
    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/10';

  const textBase = isInactive
    ? 'text-sm font-medium text-slate-400 dark:text-slate-500'
    : 'text-sm font-semibold text-slate-800 dark:text-white';

  return (
    <tr className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors group ${rowBg}`}>

      {/* Product */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {link.product_logo
            ? <img src={link.product_logo} alt={link.title}
                className={`w-9 h-9 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 ${isInactive ? 'grayscale opacity-60' : ''}`} />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800">
                <LinkIcon size={14} className={isInactive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'} />
              </div>}
          <div>
            {/* Premium colored Product title */}
            <p className={`${textBase} ${!isInactive ? 'text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 transition-colors' : ''}`}>
              {link.title || <span className="text-slate-400 italic text-xs">Default</span>}
            </p>
            {isDefault && <span className="text-[9px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-md">Default</span>}
            {link.description && !isDefault && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-[160px] truncate">{link.description}</p>}
            {isInactive && <span className="text-[9px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">Inactive</span>}
          </div>
        </div>
      </td>

      {/* Payment Link */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            className={`text-sm font-mono max-w-[180px] truncate ${isInactive ? 'text-slate-400 cursor-default pointer-events-none' : 'text-blue-500 hover:text-blue-700 hover:underline'}`}>
            {displayUrl}
          </a>
          <button onClick={handleCopy} title="Copy"
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${isInactive ? 'text-slate-300 dark:text-slate-600' : 'text-white bg-slate-400 hover:bg-blue-600 dark:bg-slate-600 dark:hover:bg-blue-600'}`}>
            <Copy size={14} />
          </button>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" title="Open"
            className={`p-1.5 rounded-lg transition-colors inline-flex shrink-0 ${isInactive ? 'text-slate-300 dark:text-slate-600 pointer-events-none' : 'text-white bg-slate-400 hover:bg-blue-600 dark:bg-slate-600 dark:hover:bg-blue-600'}`}>
            <ExternalLink size={14} />
          </a>
        </div>
      </td>

      {/* Price — premium color */}
      <td className="px-5 py-4">
        {link.amount
          ? <p className={`text-sm font-bold ${isInactive ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {sym_}{link.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          : <span className="text-xs text-slate-400">Open</span>}
      </td>

      {/* Discount */}
      <td className="px-5 py-4">
        {link.discount > 0
          ? <span className={`text-xs font-semibold ${isInactive ? 'text-slate-400' : 'text-orange-500'}`}>
              {link.discount_type === 'percentage' ? `-${link.discount}%` : `-${sym_}${link.discount}`}
            </span>
          : <span className="text-xs text-slate-400">—</span>}
      </td>

      {/* After Discount */}
      <td className="px-5 py-4">
        {link.amount
          ? <p className={`text-sm font-semibold ${isInactive ? 'text-slate-400' : 'text-teal-600 dark:text-teal-400'}`}>
              {sym_}{(finalPrice ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          : <span className="text-xs text-slate-400">—</span>}
      </td>

      {/* Expiry */}
      <td className="px-5 py-4">
        <span className={`text-xs font-medium ${isInactive ? 'text-slate-400' : expired ? 'text-red-500' : link.expires_at ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {formatExpiry(link.expires_at)}
        </span>
      </td>

      {/* Status Toggle */}
      <td className="px-5 py-4">
        {toggling
          ? <Loader2 size={14} className="animate-spin text-slate-400" />
          : <ToggleSwitch checked={isActive} onChange={handleToggle} />}
      </td>

      {/* Actions — disabled if Inactive */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => canModify && onEdit(link)}
            disabled={!canModify}
            title={isDefault ? 'Default links cannot be edited' : isInactive ? 'Activate the link to edit it' : 'Edit'}
            className={`p-2 rounded-xl transition-colors ${!canModify
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
              : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => canModify && onDelete(link.id)}
            disabled={!canModify}
            title={isDefault ? 'Default links cannot be deleted' : isInactive ? 'Activate the link to delete it' : 'Delete'}
            className={`p-2 rounded-xl transition-colors ${!canModify
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
            <Trash2 size={16} />
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No Workspace Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Select a business from the sidebar to manage payment links.</p>
      </div>
    );
  }

  if (businessStatus && businessStatus !== 'active') {
    return <BusinessPendingNotice supportTelegram={supportTelegram} />;
  }

  const activeLinks = links.filter(l => l.status === 'active').length;
  const inactiveLinks = links.length - activeLinks;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Bold Top Bar ── */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl px-6 py-4">
        <h1 className="text-xl font-black text-white uppercase tracking-[0.15em] flex items-center gap-3">
          <LinkIcon size={20} className="text-blue-400" />
          ALL PAYMENT LINKS
        </h1>
        <p className="text-slate-400 text-xs font-medium mt-0.5">Create and manage payment links for your products and services.</p>
      </div>

      {/* ── Header actions ── */}
      <div className="flex items-center justify-end">
        <button onClick={() => setShowChooser(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:-translate-y-0.5">
          <Plus size={16} /> Create New Link
        </button>
      </div>

      {/* ── Stats Cards ── */}
      {!loading && links.length > 0 && (
        <div className="hidden md:grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Links</p>
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <LinkIcon size={16} className="text-slate-500 dark:text-slate-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white leading-none">{links.length}</p>
              <p className="text-xs text-slate-400 mt-1.5">Payment links created</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-emerald-100 dark:border-emerald-900/30 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Active</p>
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{activeLinks}</p>
              <p className="text-xs text-slate-400 mt-1.5">Currently accepting payments</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Inactive</p>
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <X size={16} className="text-slate-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-400 leading-none">{inactiveLinks}</p>
              <p className="text-xs text-slate-400 mt-1.5">Disabled or paused links</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-28"><Loader2 className="animate-spin text-blue-600" size={26} /></div>
        ) : links.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><LinkIcon size={20} /></div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No Links Yet</h3>
            <p className="text-slate-400 text-xs mb-5">Create your first payment link to start accepting payments.</p>
            <button onClick={() => setShowChooser(true)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:-translate-y-0.5 transition-all shadow-lg">
              Create Payment Link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr>
                  {['Product', 'Payment Link', 'Price', 'Discount', 'After Discount', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-[#0B1120]/60 border-b border-slate-100 dark:border-slate-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <LinkRow key={link.id} link={link} slug={businessSlug}
                    onDelete={handleDelete} onToggle={handleToggle} onEdit={setEditLink} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && links.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-xs text-slate-400">
              {links.length} {links.length === 1 ? 'link' : 'links'} · <span className="text-emerald-600 dark:text-emerald-400 font-medium">{activeLinks} active</span>
              {inactiveLinks > 0 && <> · <span className="text-slate-400">{inactiveLinks} inactive</span></>}
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