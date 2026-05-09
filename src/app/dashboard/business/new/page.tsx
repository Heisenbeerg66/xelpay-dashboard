'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Smartphone, ShoppingBag, LayoutGrid, Mail, Phone, DollarSign, BadgeDollarSign, X, ShieldCheck, RefreshCw, Copy, ExternalLink, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';
import { autoVerifyBusiness, checkDuplicateWebsite, verifyDomain, verifyDomainOwnership, generateVerifyCode } from '@/lib/verify-business';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'domain_verify' | 'duplicate_modal' | 'ownership_verify';

export default function NewBusiness() {
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState<Step>('form');

  // Plan & Limit Data
  const [planData, setPlanData] = useState<any>(null);
  const [businessCount, setBusinessCount] = useState(0);

  // Verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [ownershipMethod, setOwnershipMethod] = useState<'meta' | 'txt'>('meta');
  const [duplicateInfo, setDuplicateInfo] = useState<{ existingBusinessId?: string; existingBusinessName?: string } | null>(null);

  // Temp business id (created after duplicate check passes, before final submit)
  const [pendingBusinessId, setPendingBusinessId] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Website',
    websiteUrl: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'BDT',
    exchangeRate: '',
  });

  // Fetch Merchant Plan Limits & Current Business Count
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: merchant } = await supabase.from('merchants').select('plan_id').eq('id', user.id).single();
          if (merchant?.plan_id) {
            const { data: plan } = await supabase.from('plans').select('business_limit, allowed_method').eq('id', merchant.plan_id).single();
            setPlanData(plan || { business_limit: 1, allowed_method: {} });
          } else {
            setPlanData({ business_limit: 1, allowed_method: {} });
          }
          const { count } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('merchant_id', user.id);
          setBusinessCount(count || 0);
        }
      } catch (error) {
        console.error('Error loading plan data:', error);
        setPlanData({ business_limit: 1, allowed_method: {} });
      } finally {
        setFetchingPlan(false);
      }
    }
    loadInitialData();
  }, []);

  const businessLimit = planData?.business_limit ?? 1;
  const isLimitReached = businessCount >= businessLimit;

  const getLinkConfig = () => {
    switch (formData.businessType) {
      case 'Mobile App': return { label: 'App URL (Play/App Store)', icon: Smartphone, placeholder: 'https://play.google.com/...' };
      case 'F Commerce': return { label: 'Facebook Page Link', icon: ShoppingBag, placeholder: 'https://facebook.com/yourpage' };
      default: return { label: 'Website URL', icon: Globe, placeholder: 'https://yourwebsite.com' };
    }
  };
  const linkConfig = getLinkConfig();

  // ── Step 1: Validate form and check for duplicates ────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      toast.error(`Your plan allows max ${businessLimit} business(es). Please upgrade.`);
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      // Check duplicate for Website and Mobile App (not F Commerce)
      const needsDuplicateCheck = formData.businessType === 'Website' || formData.businessType === 'Mobile App';
      if (needsDuplicateCheck && formData.websiteUrl) {
        const dupeResult = await checkDuplicateWebsite(formData.websiteUrl);
        if (dupeResult.isDuplicate) {
          setDuplicateInfo({ existingBusinessId: dupeResult.existingBusinessId, existingBusinessName: dupeResult.existingBusinessName });
          setStep('duplicate_modal');
          setLoading(false);
          return;
        }
      }

      // For Website type, require domain verification
      if (formData.businessType === 'Website' && formData.websiteUrl) {
        const code = generateVerifyCode();
        setVerifyCode(code);
        setStep('domain_verify');
        setLoading(false);
        return;
      }

      // For F Commerce and Mobile App — submit directly
      await submitBusiness(null);
    } catch (error: any) {
      const errMsg = error.message || 'Failed to create workspace. Please try again.';
      toast.error(errMsg);
      setErrorMessage(`Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify domain ownership then submit ────────────────────────────
  const handleVerifyAndSubmit = async () => {
    if (!formData.websiteUrl || !verifyCode) return;
    setVerifying(true);
    try {
      // We need a temp business id for verifyDomain. Create the business as pending first.
      let bizId = pendingBusinessId;
      if (!bizId) {
        bizId = await createPendingBusiness();
        if (!bizId) throw new Error('Failed to create business record for verification.');
        setPendingBusinessId(bizId);
      }

      const result = await verifyDomain(bizId, formData.websiteUrl, verifyCode);
      if (result.success) {
        // Activate the business
        await activateBusiness(bizId);
        toast.success('Domain verified! Business submitted successfully.');
        window.dispatchEvent(new Event('businessChanged'));
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Ownership verify for duplicate flow ───────────────────────────────────
  const handleOwnershipVerify = async () => {
    if (!formData.websiteUrl || !verifyCode) return;
    setVerifying(true);
    try {
      let bizId = pendingBusinessId;
      if (!bizId) {
        bizId = await createPendingBusiness();
        if (!bizId) throw new Error('Failed to create business record.');
        setPendingBusinessId(bizId);
      }

      const result = await verifyDomainOwnership(bizId, formData.websiteUrl, verifyCode, ownershipMethod);
      if (result.success) {
        await activateBusiness(bizId);
        toast.success('Ownership verified! Business submitted successfully.');
        window.dispatchEvent(new Event('businessChanged'));
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // ── Create a pending business record ─────────────────────────────────────
  const createPendingBusiness = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const publicKey = `xp_pub_${crypto.randomUUID().replace(/-/g, '')}`;
    const secretKey = `xp_sec_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;

    const { data, error } = await supabase.from('businesses').insert({
      merchant_id: user.id,
      business_name: formData.businessName,
      business_type: formData.businessType,
      website_url: formData.websiteUrl || null,
      support_email: formData.supportEmail || null,
      support_phone: formData.supportPhone || null,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null,
      public_key: publicKey,
      secret_key: secretKey,
      domain_verify_code: verifyCode || generateVerifyCode(),
      status: 'pending',
    }).select().single();

    if (error) throw new Error(error.message);
    return data?.id || null;
  };

  // ── Activate business after verification ──────────────────────────────────
  const activateBusiness = async (bizId: string) => {
    // Keep as pending for admin review, but mark domain as verified
    // autoVerify for content check
    if (formData.businessType === 'Website' || formData.businessType === 'F Commerce') {
      autoVerifyBusiness(bizId, formData.websiteUrl);
    }
  };

  // ── Direct submit (for F Commerce / Mobile App) ───────────────────────────
  const submitBusiness = async (_bizId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const publicKey = `xp_pub_${crypto.randomUUID().replace(/-/g, '')}`;
    const secretKey = `xp_sec_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;

    const { data: newBusiness, error } = await supabase.from('businesses').insert({
      merchant_id: user.id,
      business_name: formData.businessName,
      business_type: formData.businessType,
      website_url: formData.websiteUrl || null,
      support_email: formData.supportEmail || null,
      support_phone: formData.supportPhone || null,
      currency: formData.currency,
      exchange_rate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null,
      public_key: publicKey,
      secret_key: secretKey,
      domain_verify_code: generateVerifyCode(),
      status: 'pending',
    }).select().single();

    if (error) throw new Error(error.message);

    toast.success('Business submitted! Verification is in progress.');
    setErrorMessage('');
    window.dispatchEvent(new Event('businessChanged'));

    if (formData.businessType === 'F Commerce') {
      autoVerifyBusiness(newBusiness.id, formData.websiteUrl);
    }

    setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!')).catch(() => toast.error('Failed to copy'));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  if (fetchingPlan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // ── Domain Verification Step ───────────────────────────────────────────────
  if (step === 'domain_verify') {
    const metaTag = `<meta name="xelpay-verification" content="${verifyCode}" />`;
    return (
      <div className="max-w-2xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Toaster position="top-center" richColors />
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Verify Your Website</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Prove ownership of <span className="font-semibold text-blue-600">{formData.websiteUrl}</span> to complete registration.</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Domain Ownership Verification</h2>
            <p className="text-blue-100 text-sm mt-1.5">Required before your business can be activated</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">1</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Add this meta tag to your website's <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">&lt;head&gt;</code> section:</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-700 dark:text-slate-300 break-all flex items-start justify-between gap-3">
                <span>{metaTag}</span>
                <button onClick={() => copyToClipboard(metaTag)} className="shrink-0 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-600 transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">2</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Publish your changes and clear any cache, then click Verify.</p>
              </div>
              <div className="ml-8 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ Make sure the meta tag is publicly accessible and your website is live.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleVerifyAndSubmit}
                disabled={verifying}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-60"
              >
                {verifying ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={16} /> Verify & Submit</>}
              </button>
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                ← Back to Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Duplicate Modal Step ───────────────────────────────────────────────────
  if (step === 'duplicate_modal') {
    return (
      <div className="max-w-2xl mx-auto pb-8 animate-in fade-in zoom-in-95 duration-300">
        <Toaster position="top-center" richColors />
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Domain Already Registered</h2>
            <p className="text-amber-100 text-sm mt-1.5">This website or domain is already associated with an existing account.</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
              <p>The domain <span className="font-semibold text-slate-900 dark:text-white">{formData.websiteUrl}</span> is already registered. If you own this domain, you can verify ownership to proceed.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const code = generateVerifyCode();
                  setVerifyCode(code);
                  setStep('ownership_verify');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <ShieldCheck size={18} /> Verify Ownership of this Domain
              </button>
              <button
                onClick={() => { setStep('form'); setDuplicateInfo(null); }}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-bold text-sm transition-all"
              >
                Cancel — Use a Different Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ownership Verification Step (for duplicate flow) ─────────────────────
  if (step === 'ownership_verify') {
    const metaTag = `<meta name="xelpay-verification" content="${verifyCode}" />`;
    const txtRecord = `xelpay-verification=${verifyCode}`;

    return (
      <div className="max-w-2xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Toaster position="top-center" richColors />
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Prove Domain Ownership</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Choose a verification method for <span className="font-semibold text-blue-600">{formData.websiteUrl}</span></p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Method Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {(['meta', 'txt'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setOwnershipMethod(m)}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${ownershipMethod === m ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {m === 'meta' ? '🏷️ HTML Meta Tag' : '📡 DNS TXT Record'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {ownershipMethod === 'meta' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Add this meta tag inside the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;head&gt;</code> of your homepage:</p>
                <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-700 dark:text-slate-300 break-all flex items-start justify-between gap-3">
                  <span>{metaTag}</span>
                  <button onClick={() => copyToClipboard(metaTag)} className="shrink-0 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-600 transition-colors"><Copy size={14} /></button>
                </div>
                <p className="text-xs text-slate-500">After adding the tag, publish your site and click Verify below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Add a new <strong>TXT record</strong> to your domain's DNS settings:</p>
                <div className="space-y-2">
                  <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-500">Type: </span><span className="text-slate-900 dark:text-white font-bold">TXT</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div><span className="text-slate-500">Name: </span><span className="text-slate-900 dark:text-white font-bold">@ (root domain)</span></div>
                    </div>
                    <div className="flex justify-between items-center mt-1 gap-2">
                      <div className="flex-1"><span className="text-slate-500">Value: </span><span className="text-blue-600 font-bold break-all">{txtRecord}</span></div>
                      <button onClick={() => copyToClipboard(txtRecord)} className="shrink-0 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-600"><Copy size={14} /></button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-2">⏱️ DNS changes may take up to 24-48 hours to propagate globally.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleOwnershipVerify}
                disabled={verifying}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-60"
              >
                {verifying ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : <><CheckCircle2 size={16} /> Verify Ownership</>}
              </button>
              <button
                onClick={() => { setStep('form'); setDuplicateInfo(null); setPendingBusinessId(null); }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                ← Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full mb-4">
          <Building2 size={13} className="text-blue-600" />
          <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">New Workspace</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Create Your<br />Business Workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Fill in your business details to get started with XelPay.
        </p>
      </div>

      {/* Plan limit warning */}
      {isLimitReached && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">Business Limit Reached</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Your plan allows max {businessLimit} business workspace(s). Please upgrade your plan to add more.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">

        {/* ── Card: Basic Info ── */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <input
                  required type="text" placeholder="Easy Earn"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Business Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <select
                  required value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value, websiteUrl: '' })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all appearance-none"
                >
                  <option value="Website">Website</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="F Commerce">F Commerce</option>
                </select>
              </div>
            </div>
          </div>

          {/* Website / App URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              {linkConfig.label} <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <linkConfig.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
              <input
                required type="url" placeholder={linkConfig.placeholder}
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
              />
            </div>
            {formData.businessType === 'Website' && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium ml-1">
                🔒 Website ownership verification required before submission.
              </p>
            )}
          </div>
        </div>

        {/* ── Card: Contact Info ── */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">Contact & Support</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <input
                  type="email" placeholder="support@mybusiness.com"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support Phone</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <input
                  type="tel" placeholder="+880 1700 000000"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Card: Currency & Exchange Rate ── */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">Currency Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <select
                  required value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all appearance-none"
                >
                  <option value="BDT">BDT — Bangladeshi Taka</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </div>
            </div>

            {/* Exchange Rate (BDT per 1 USD) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                USD → BDT Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <BadgeDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={15} />
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g. 110"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 ml-1">How many BDT equals 1 USD (e.g. 110)</p>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading || isLimitReached}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : (
            <><Building2 size={18} /> {formData.businessType === 'Website' ? 'Continue to Verification →' : 'Create Workspace'}</>
          )}
        </button>
      </form>
    </div>
  );
}