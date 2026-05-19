'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Palette, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsRow, SettingsSection, FormField, SettingsInput,
  SaveButton, Skeleton, SkeletonCard, EmptyState, cn,
} from '@/components/settings/shared/SettingsCard';
import type { SaveState } from '@/components/settings/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandingData {
  businessId: string | null;
  businessName: string;
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  websiteUrl: string;
  slug: string;
}

// ─── Image Upload Dropzone ─────────────────────────────────────────────────────

interface ImageDropzoneProps {
  label: string;
  hint: string;
  preview: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  shape?: 'square' | 'circle';
  maxKb?: number;
}

function ImageDropzone({
  label, hint, preview, onFileSelect, onRemove, uploading, shape = 'square', maxKb = 500,
}: ImageDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > maxKb * 1024) {
      toast.error(`Max ${maxKb}KB allowed`);
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className={cn(
            'relative flex-shrink-0 w-20 h-20 border-2 border-dashed border-[var(--border)] bg-[var(--muted)] flex items-center justify-center overflow-hidden transition-colors',
            shape === 'circle' ? 'rounded-full' : 'rounded-xl',
            dragging && 'border-[var(--ring)] bg-[var(--ring)]/10',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          {uploading ? (
            <RefreshCw size={18} className="animate-spin text-[var(--muted-foreground)]" />
          ) : preview ? (
            <>
              <img src={preview} alt={label} className="w-full h-full object-contain" />
              <button
                onClick={onRemove}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                title="Remove image"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <ImageIcon size={20} className="text-[var(--muted-foreground)]" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{label}</p>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">{hint}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
            >
              <Upload size={12} />
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {preview && (
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <ExternalLink size={11} />
                View
              </a>
            )}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Accent Color Picker ───────────────────────────────────────────────────────

const BRAND_COLORS = [
  { label: 'Indigo',   value: '#6366f1' },
  { label: 'Blue',     value: '#3b82f6' },
  { label: 'Violet',   value: '#8b5cf6' },
  { label: 'Rose',     value: '#f43f5e' },
  { label: 'Emerald',  value: '#10b981' },
  { label: 'Amber',    value: '#f59e0b' },
  { label: 'Cyan',     value: '#06b6d4' },
  { label: 'Slate',    value: '#64748b' },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const customRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {BRAND_COLORS.map((c) => (
        <button
          key={c.value}
          title={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            'w-7 h-7 rounded-full border-2 transition-all',
            value === c.value
              ? 'border-[var(--foreground)] scale-110 shadow-md'
              : 'border-transparent hover:scale-105 hover:border-[var(--border)]',
          )}
          style={{ backgroundColor: c.value }}
        />
      ))}
      {/* Custom color */}
      <button
        title="Custom color"
        onClick={() => customRef.current?.click()}
        className={cn(
          'w-7 h-7 rounded-full border-2 overflow-hidden transition-all',
          !BRAND_COLORS.some(c => c.value === value)
            ? 'border-[var(--foreground)] scale-110'
            : 'border-[var(--border)] hover:scale-105',
        )}
        style={{ backgroundColor: value || '#000000' }}
      >
        <input
          ref={customRef}
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 w-full h-full cursor-pointer"
          title="Pick custom color"
        />
      </button>
      <span className="text-xs font-mono text-[var(--muted-foreground)] ml-1">{value || '—'}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BrandingSection() {
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [data, setData] = useState<BrandingData>({
    businessId: null,
    businessName: '',
    brandName: '',
    logoUrl: '',
    faviconUrl: '',
    websiteUrl: '',
    slug: '',
  });

  // Separate preview states for unsaved image selections
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [brandColor, setBrandColor] = useState('#6366f1');
  const [userId, setUserId] = useState<string | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    // Try business first
    const bizId =
      (typeof window !== 'undefined' && localStorage.getItem('activeBusiness')) ||
      (typeof window !== 'undefined' && sessionStorage.getItem('activeBusiness')) ||
      null;

    if (bizId) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, business_name, logo_url, favicon_url, website_url, slug')
        .eq('id', bizId)
        .single();

      if (biz) {
        setData({
          businessId: biz.id,
          businessName: biz.business_name || '',
          brandName: '',
          logoUrl: biz.logo_url || '',
          faviconUrl: biz.favicon_url || '',
          websiteUrl: biz.website_url || '',
          slug: biz.slug || '',
        });
        setLogoPreview(biz.logo_url || '');
        setFaviconPreview(biz.favicon_url || '');
        setLoading(false);
        return;
      }
    }

    // Fall back to merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('logo_url, favicon_url, brand_name, website')
      .eq('id', user.id)
      .single();

    if (merchant) {
      setData({
        businessId: null,
        businessName: '',
        brandName: merchant.brand_name || '',
        logoUrl: merchant.logo_url || '',
        faviconUrl: merchant.favicon_url || '',
        websiteUrl: merchant.website || '',
        slug: '',
      });
      setLogoPreview(merchant.logo_url || '');
      setFaviconPreview(merchant.favicon_url || '');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleBizChange = () => loadData();
    window.addEventListener('businessChanged', handleBizChange);
    return () => window.removeEventListener('businessChanged', handleBizChange);
  }, [loadData]);

  // ─── Image Upload Helper ───────────────────────────────────────────────────

  const uploadImage = async (file: File, bucket: string, pathPrefix: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${pathPrefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  // ─── File handlers ─────────────────────────────────────────────────────────

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconSelect = (file: File) => {
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveState('saving');
    try {
      let finalLogoUrl = data.logoUrl;
      let finalFaviconUrl = data.faviconUrl;

      // Upload logo if changed
      if (logoFile) {
        setUploadingLogo(true);
        const prefix = data.businessId || userId || 'merchant';
        finalLogoUrl = await uploadImage(logoFile, 'business-logos', `logo-${prefix}`) || data.logoUrl;
        setUploadingLogo(false);
        setLogoFile(null);
      }

      // Upload favicon if changed
      if (faviconFile) {
        setUploadingFavicon(true);
        const prefix = data.businessId || userId || 'merchant';
        finalFaviconUrl = await uploadImage(faviconFile, 'business-logos', `favicon-${prefix}`) || data.faviconUrl;
        setUploadingFavicon(false);
        setFaviconFile(null);
      }

      if (data.businessId) {
        const { error } = await supabase
          .from('businesses')
          .update({
            business_name: data.businessName,
            logo_url: finalLogoUrl,
            favicon_url: finalFaviconUrl,
            website_url: data.websiteUrl,
          })
          .eq('id', data.businessId);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { error } = await supabase
          .from('merchants')
          .update({
            brand_name: data.brandName,
            logo_url: finalLogoUrl,
            favicon_url: finalFaviconUrl,
            website: data.websiteUrl,
          })
          .eq('id', user.id);
        if (error) throw error;
      }

      setData(prev => ({ ...prev, logoUrl: finalLogoUrl, faviconUrl: finalFaviconUrl }));
      setLogoPreview(finalLogoUrl);
      setFaviconPreview(finalFaviconUrl);

      window.dispatchEvent(new Event('businessChanged'));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err: any) {
      setUploadingLogo(false);
      setUploadingFavicon(false);
      toast.error(err.message || 'Save failed');
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard rows={2} />
        <SkeletonCard rows={2} />
      </div>
    );
  }

  const isBusinessMode = !!data.businessId;

  return (
    <SettingsSection>
      {/* Logo & Favicon */}
      <SettingsCard>
        <SettingsCardHeader
          title="Brand Assets"
          description="Upload your logo and favicon. Shown on payment pages, invoices, and checkout."
        />
        <SettingsCardBody>
          <SettingsRow
            label="Business Logo"
            description="Recommended 512×512px. PNG, JPG, WebP. Max 500KB."
          >
            <ImageDropzone
              label="Business Logo"
              hint="Shown on payment pages and dashboard header"
              preview={logoPreview}
              onFileSelect={handleLogoSelect}
              onRemove={() => { setLogoPreview(''); setLogoFile(null); setData(p => ({ ...p, logoUrl: '' })); }}
              uploading={uploadingLogo}
              shape="square"
            />
          </SettingsRow>

          <SettingsRow
            label="Favicon"
            description="Recommended 32×32 or 64×64px. PNG or ICO. Max 100KB."
          >
            <ImageDropzone
              label="Favicon"
              hint="Shown in browser tabs"
              preview={faviconPreview}
              onFileSelect={handleFaviconSelect}
              onRemove={() => { setFaviconPreview(''); setFaviconFile(null); setData(p => ({ ...p, faviconUrl: '' })); }}
              uploading={uploadingFavicon}
              shape="square"
              maxKb={100}
            />
          </SettingsRow>
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={saveState} onClick={handleSave} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Brand Identity */}
      <SettingsCard>
        <SettingsCardHeader
          title="Brand Identity"
          description="Customize your brand name and public presence."
        />
        <SettingsCardBody>
          {isBusinessMode ? (
            <FormField label="Business Display Name">
              <SettingsInput
                value={data.businessName}
                onChange={(v) => setData(p => ({ ...p, businessName: v }))}
                placeholder="XelPay Store"
              />
            </FormField>
          ) : (
            <FormField label="Brand Name" hint="Shown on checkout pages and receipts">
              <SettingsInput
                value={data.brandName}
                onChange={(v) => setData(p => ({ ...p, brandName: v }))}
                placeholder="Your Brand"
              />
            </FormField>
          )}

          <FormField label="Website URL" hint="Your public-facing website">
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <SettingsInput
                value={data.websiteUrl}
                onChange={(v) => setData(p => ({ ...p, websiteUrl: v }))}
                placeholder="https://yourbrand.com"
                className="pl-8"
              />
            </div>
          </FormField>

          {isBusinessMode && data.slug && (
            <SettingsRow label="Business Slug" description="Your unique URL identifier — cannot be changed here.">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2.5 py-1.5 rounded-lg font-mono border border-[var(--border)]">
                  {data.slug}
                </code>
              </div>
            </SettingsRow>
          )}
        </SettingsCardBody>
        <SettingsCardFooter>
          <SaveButton state={saveState} onClick={handleSave} />
        </SettingsCardFooter>
      </SettingsCard>

      {/* Brand Color */}
      <SettingsCard>
        <SettingsCardHeader
          title="Brand Color"
          description="Choose a primary accent color for your checkout experience. Stored locally for dashboard preview."
        />
        <SettingsCardBody>
          <SettingsRow
            label="Accent Color"
            description="Shown on buttons, highlights, and brand accents."
          >
            <ColorPicker value={brandColor} onChange={setBrandColor} />
          </SettingsRow>

          {/* Live preview */}
          <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] space-y-3">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 text-white text-sm font-bold rounded-lg transition-all"
                style={{ backgroundColor: brandColor }}
              >
                Pay Now
              </button>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: `${brandColor}30` }}>
                <div className="h-2 rounded-full w-3/5" style={{ backgroundColor: brandColor }} />
              </div>
              <span className="text-sm font-bold" style={{ color: brandColor }}>
                {data.brandName || data.businessName || 'XelPay'}
              </span>
            </div>
          </div>
        </SettingsCardBody>
        <SettingsCardFooter>
          <p className="text-xs text-[var(--muted-foreground)]">
            Brand color is currently a dashboard preview feature. Checkout theme configuration coming soon.
          </p>
        </SettingsCardFooter>
      </SettingsCard>
    </SettingsSection>
  );
}
