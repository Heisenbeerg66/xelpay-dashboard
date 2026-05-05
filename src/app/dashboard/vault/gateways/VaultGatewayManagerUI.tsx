/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Plus, X, Search, Smartphone, Building2, Globe,
    ShieldCheck, Trash2, Loader2, Edit, ArrowLeft,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { saveVaultGateway, updateVaultGateway, deleteVaultGateway, getVaultGateways } from '@/lib/vault_actions';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOBILE_PROVIDERS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Cellfin', 'mCash', 'OK Wallet', 'Pathao Pay'];

const BANK_MAPPING: Record<string, string> = {
    ab:          'AB Bank',
    agrani:      'Agrani Bank',
    asia:        'Bank Asia',
    city:        'City Bank',
    dhaka:       'Dhaka Bank',
    dbbl:        'Dutch-Bangla Bank',
    ebl:         'Eastern Bank (EBL)',
    ific:        'IFIC Bank',
    ibbl:      'Islami Bank Limited',
    jamuna:      'Jamuna Bank',
    mercantile:  'Mercantile Bank',
    midland:     'Midland Bank',
    mtb:         'Mutual Trust Bank (MTB)',
    national:    'National Bank',
    ncc:         'NCC Bank',
    prime:       'Prime Bank',
    sonali:      'Sonali Bank',
    scb:         'Standard Chartered',
    ucb:         'UCB Bank',
    tb:          'Trust Bank Limited',
};

const INTL_MAPPING: Record<string, string> = {
    binance:       'Binance Pay',
    usdt:          'USDT',
    paypal:        'PayPal',
    payeer:        'Payeer',
    perfect_money: 'Perfect Money',
    webmoney:      'WebMoney',
};

const EXCLUDED_BANKS = ['brac', 'pubali'];
const IMAP_BANKS     = ['ebl', 'scb', 'mtb', 'ific', 'midland', 'dhaka', 'prime', 'asia', 'ucb', 'jamuna', 'city'];
const SMS_BANKS      = ['ibbl', 'dbbl', 'ab', 'mercantile', 'national', 'ncc', 'sonali', 'agrani', 'tb'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function VaultGatewayManagerUI({ merchantId }: { merchantId: string }) {
    const router = useRouter();

    const [loading,      setLoading]      = useState(true);
    const [gateways,     setGateways]     = useState<any[]>([]);
    const [logos,        setLogos]        = useState<any[]>([]);
    const [isModalOpen,  setIsModalOpen]  = useState(false);
    const [activeTab,    setActiveTab]    = useState<'mobile' | 'bank' | 'international'>('mobile');
    const [isSaving,     setIsSaving]     = useState(false);
    const [editingId,    setEditingId]    = useState<string | null>(null);
    const [provider,     setProvider]     = useState('');
    const [accType,      setAccType]      = useState('personal');
    const [isCustomName, setIsCustomName] = useState(false);

    const [formData, setFormData] = useState<any>({
        account_number:  '',
        account_name:    '',
        branch:          '',
        routing_number:  '',
        min_amount:      '',
        max_amount:      '',
        crypto_network:  'trc20',
        imap_email:      '',
        imap_password:   '',
        imap_bank_email: '',
        api_key:         '',
        secret_key:      '',
        display_name:    '',
    });

    const [searchQuery,    setSearchQuery]    = useState('');
    const [showDropdown,   setShowDropdown]   = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getDisplayName = (slug: string) =>
        BANK_MAPPING[slug] || INTL_MAPPING[slug] || slug;

    const formatMaskedAccount = (str: string) => {
        if (!str) return '';
        if (str.includes('@')) {
            const [name, domain] = str.split('@');
            if (name.length <= 3) return `•••@${domain}`;
            return `${name.slice(0, 3)}••••@${domain}`;
        }
        if (str.length > 6) return `${str.slice(0, 3)}••••${str.slice(-3)}`;
        return str;
    };

    const getLogo = (provSlug: string): string => {
        const match = logos.find(
            (l) => l.method_name?.toLowerCase() === provSlug?.toLowerCase()
        );
        return match?.logo_url || 'https://via.placeholder.com/150?text=Logo';
    };

    const generateDisplayName = (prov: string, type: string, net: string, custom: boolean, currentTab: string) => {
        if (!custom && prov && !editingId) {
            let name = getDisplayName(prov);
            if (currentTab === 'mobile' && type) name = `${name} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            else if (currentTab === 'international' && prov === 'usdt') name = `USDT (${net.toUpperCase()})`;
            setFormData((prev: any) => ({ ...prev, display_name: name }));
        }
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase()
                        ? <span key={i} className="text-blue-600 dark:text-blue-400 font-black">{part}</span>
                        : part
                )}
            </span>
        );
    };

    const inputClass = [
        'w-full mt-1.5 p-3.5',
        'bg-slate-50 dark:bg-[#0B1120]',
        'border border-slate-200 dark:border-slate-800 rounded-xl',
        'outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10',
        'text-slate-900 dark:text-white font-semibold',
        'placeholder:text-slate-400 placeholder:font-normal',
        'shadow-sm text-base transition-all',
    ].join(' ');

    const labelClass = 'text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide';
    const reqStar    = <span className="text-red-500 text-sm ml-0.5">*</span>;

    // ── Data Fetching ──────────────────────────────────────────────────────────

    const fetchVaultData = async () => {
        setLoading(true);
        const [gRes, lRes] = await Promise.all([
            getVaultGateways(merchantId),
            supabase.from('payment_logos').select('*'),
        ]);
        if (gRes.success) setGateways(gRes.data || []);
        setLogos(lRes.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchVaultData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merchantId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                if (!provider && searchQuery) setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [provider, searchQuery]);

    // ── Form Handlers ──────────────────────────────────────────────────────────

    const resetForm = () => {
        setEditingId(null);
        setProvider('');
        setAccType('personal');
        setIsCustomName(false);
        setSearchQuery('');
        setFormData({
            account_number: '', account_name: '', branch: '', routing_number: '',
            min_amount: '', max_amount: '', crypto_network: 'trc20',
            imap_email: '', imap_password: '', imap_bank_email: '',
            api_key: '', secret_key: '', display_name: '',
        });
    };

    const handleTabSwitch = (tabId: any) => {
        if (editingId) return;
        resetForm();
        setActiveTab(tabId);
        setFormData((prev: any) => ({
            ...prev,
            min_amount: tabId === 'international' ? '1' : (tabId === 'bank' ? '1000' : '10'),
            max_amount: tabId === 'bank' ? '300000' : (tabId === 'international' ? '' : '50000'),
        }));
    };

    const handleProviderChange = (newProviderSlug: string) => {
        setProvider(newProviderSlug);
        setSearchQuery('');
        const newAccType = newProviderSlug === 'Pathao Pay' ? 'personal' : (newProviderSlug === 'Cellfin' ? '' : 'personal');
        setAccType(newAccType);
        setIsCustomName(false);
        setFormData((prev: any) => ({
            ...prev,
            account_number: '', account_name: '', branch: '', routing_number: '',
            imap_email: '', imap_password: '', imap_bank_email: '', api_key: '', secret_key: '',
        }));
        generateDisplayName(newProviderSlug, newAccType, formData.crypto_network, false, activeTab);
    };

    const handleInputChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = (gw: any) => {
        setEditingId(gw.id);
        const correctTab = (gw.category?.toLowerCase() || 'mobile') as any;
        setActiveTab(correctTab);

        let exactProvider = gw.provider.toLowerCase();
        if (correctTab === 'mobile') {
            exactProvider = MOBILE_PROVIDERS.find((p) => p.toLowerCase() === exactProvider) || gw.provider;
        }
        setProvider(exactProvider);

        const correctAccType = correctTab === 'international'
            ? (exactProvider === 'usdt' ? '' : (gw.account_type || 'personal'))
            : (gw.account_type || 'personal');
        setAccType(correctAccType);

        const dispName = getDisplayName(exactProvider);
        const suggestions = correctTab === 'mobile'
            ? [`${dispName} Personal`, 'Send Money', `${dispName} Agent`, 'Cash Out', `${dispName} Merchant`, 'Make Payment', dispName]
            : correctTab === 'bank'
                ? [dispName, `${dispName} Payment`]
                : exactProvider === 'usdt'
                    ? [`USDT (${gw.account_type?.toUpperCase()})`, 'USDT']
                    : [dispName];

        setIsCustomName(!suggestions.includes(gw.display_name));
        setFormData({
            account_number: gw.account_number || '', account_name: gw.account_name || '',
            branch: gw.branch || '', routing_number: gw.routing_number || '',
            min_amount: gw.min_amount || '', max_amount: gw.max_amount || '',
            crypto_network: correctTab === 'international' && exactProvider === 'usdt' ? gw.account_type : 'trc20',
            imap_email: gw.imap_email || '', imap_password: '',
            imap_bank_email: gw.imap_bank_email || '', api_key: '', secret_key: '',
            display_name: gw.display_name || '',
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!provider) return toast.error('Please select a provider!');
        if (!formData.display_name) return toast.error('Display Name is required!');

        const minAmt = parseFloat(formData.min_amount) || 0;
        const maxAmt = formData.max_amount ? parseFloat(formData.max_amount) : null;
        if (minAmt < 0 || (maxAmt !== null && maxAmt < 0)) return toast.error('Amounts cannot be negative!');
        if (maxAmt !== null && minAmt > maxAmt) return toast.error('Min amount cannot be greater than Max amount!');

        setIsSaving(true);
        const payload = { merchant_id: merchantId, category: activeTab, provider, account_type: accType, ...formData };
        const res = editingId
            ? await updateVaultGateway(editingId, payload)
            : await saveVaultGateway(payload);

        if (res.success) {
            toast.success(`Vault Gateway ${editingId ? 'Updated' : 'Added'}!`);
            setGateways(editingId ? gateways.map((g) => (g.id === editingId ? res.data : g)) : [res.data, ...gateways]);
            setIsModalOpen(false);
            resetForm();
        } else {
            toast.error(res.message);
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vault gateway?')) return;
        setGateways(gateways.filter((g) => g.id !== id));
        await deleteVaultGateway(id);
        toast.success('Gateway Deleted!');
    };

    // ── Sub-Renderers ──────────────────────────────────────────────────────────

    const renderDisplayNamePicker = (suggestions: string[]) => (
        <div className="space-y-3">
            <div>
                <label className={labelClass}>Display Name {reqStar}</label>
                <select required value={isCustomName ? 'custom' : formData.display_name}
                    onChange={(e) => {
                        if (e.target.value === 'custom') { setIsCustomName(true); setFormData({ ...formData, display_name: '' }); }
                        else { setIsCustomName(false); setFormData({ ...formData, display_name: e.target.value }); }
                    }} className={inputClass}>
                    <option value="" disabled>-- Select Display Name --</option>
                    {suggestions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    <option value="custom">✨ Custom Name (Write your own)</option>
                </select>
            </div>
            {isCustomName && (
                <div className="animate-in fade-in zoom-in-95">
                    <input required type="text" name="display_name" onChange={handleInputChange} value={formData.display_name} placeholder="e.g. Pay via Personal Bkash" className={inputClass} />
                </div>
            )}
        </div>
    );

    const renderMobileInputs = () => {
        const dispName  = getDisplayName(provider);
        const needsName = accType === 'agent' || accType === 'merchant' || provider === 'Pathao Pay' || provider === 'Cellfin';
        const suggestions = provider
            ? accType === 'personal' ? [`${dispName} Personal`, 'Send Money']
                : accType === 'agent' ? [`${dispName} Agent`, 'Cash Out']
                : accType === 'merchant' ? [`${dispName} Merchant`, 'Make Payment']
                : [dispName]
            : [];

        const filteredProviders = MOBILE_PROVIDERS.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (!showDropdown) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((prev) => Math.min(prev + 1, filteredProviders.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((prev) => Math.max(prev - 1, 0)); }
            else if (e.key === 'Enter' && filteredProviders[highlightIndex]) { e.preventDefault(); handleProviderChange(filteredProviders[highlightIndex]); setShowDropdown(false); }
        };

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative" ref={dropdownRef}>
                    <label className={labelClass}>Select Provider {reqStar}</label>
                    <div className="relative">
                        <input type="text" required value={provider && !showDropdown ? provider : searchQuery}
                            onFocus={() => { setShowDropdown(true); setHighlightIndex(0); }}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); setHighlightIndex(0); setProvider(''); }}
                            onKeyDown={handleKeyDown} placeholder="Search Provider..." className={`${inputClass} pr-10`} />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400" size={18} />
                    </div>
                    {showDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl max-h-56 overflow-y-auto py-2">
                            {filteredProviders.length === 0 ? (
                                <div className="p-3 text-sm text-slate-500 text-center">No providers found</div>
                            ) : (
                                filteredProviders.map((name, index) => (
                                    <div key={name} onClick={() => { handleProviderChange(name); setShowDropdown(false); }} onMouseEnter={() => setHighlightIndex(index)}
                                        className={`p-3.5 cursor-pointer text-sm font-semibold border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors ${index === highlightIndex ? 'bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                        {highlightMatch(name, searchQuery)}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {provider && provider !== 'Cellfin' && provider !== 'Pathao Pay' && (
                    <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {['personal', 'agent', 'merchant'].map((type) => (
                            <button key={type} type="button" onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'mobile'); }}
                                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${accType === type ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                )}
                <div>
                    <label className={labelClass}>Account / Wallet Number {reqStar}</label>
                    <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" maxLength={11} placeholder="e.g. 01712345678" className={inputClass} />
                </div>
                {needsName && (
                    <div>
                        <label className={labelClass}>{provider === 'Cellfin' ? 'Account Name' : accType === 'agent' ? 'Agent Name' : 'Merchant Name'} {reqStar}</label>
                        <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder="Enter Name" className={inputClass} />
                    </div>
                )}
                {provider && renderDisplayNamePicker(suggestions)}
            </div>
        );
    };

    const renderBankInputs = () => {
        const dispName        = getDisplayName(provider);
        const suggestions     = provider ? [dispName, `${dispName} Payment`] : [];
        const isIMAPSupported = IMAP_BANKS.includes(provider);
        const isSMSSupported  = SMS_BANKS.includes(provider);
        const filteredBanks   = Object.entries(BANK_MAPPING).filter(
            ([slug, name]) => !EXCLUDED_BANKS.includes(slug) && name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (!showDropdown) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((prev) => Math.min(prev + 1, filteredBanks.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((prev) => Math.max(prev - 1, 0)); }
            else if (e.key === 'Enter' && filteredBanks[highlightIndex]) { e.preventDefault(); handleProviderChange(filteredBanks[highlightIndex][0]); setShowDropdown(false); }
        };

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative" ref={dropdownRef}>
                    <label className={labelClass}>Select Bank {reqStar}</label>
                    <div className="relative">
                        <input type="text" required value={provider && !showDropdown ? BANK_MAPPING[provider] : searchQuery}
                            onFocus={() => { setShowDropdown(true); setHighlightIndex(0); }}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); setHighlightIndex(0); setProvider(''); }}
                            onKeyDown={handleKeyDown} placeholder="Search Bank..." className={`${inputClass} pr-10`} />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400" size={18} />
                    </div>
                    {showDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl max-h-56 overflow-y-auto py-2">
                            {filteredBanks.length === 0 ? (
                                <div className="p-3 text-sm text-slate-500 text-center">No banks found</div>
                            ) : (
                                filteredBanks.map(([slug, name], index) => (
                                    <div key={slug} onClick={() => { handleProviderChange(slug); setShowDropdown(false); }} onMouseEnter={() => setHighlightIndex(index)}
                                        className={`p-3.5 cursor-pointer text-sm font-semibold border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors ${index === highlightIndex ? 'bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                        {highlightMatch(name, searchQuery)}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {['personal', 'business'].map((type) => (
                        <button key={type} type="button" onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'bank'); }}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${accType === type ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                            {type}
                        </button>
                    ))}
                </div>

                <div>
                    <label className={labelClass}>Account Name {reqStar}</label>
                    <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder={accType === 'personal' ? 'e.g. Md. Rahim' : 'e.g. Xenverse IT'} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Account Number {reqStar}</label>
                    <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder="e.g. 102XXXXXXXXX" className={`${inputClass} font-mono`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Branch Name {reqStar}</label>
                        <input required name="branch" onChange={handleInputChange} value={formData.branch} type="text" placeholder="Gulshan Branch" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Routing No {reqStar}</label>
                        <input required name="routing_number" onChange={handleInputChange} value={formData.routing_number} type="text" maxLength={9} placeholder="123456789" className={`${inputClass} font-mono`} />
                    </div>
                </div>

                {provider && renderDisplayNamePicker(suggestions)}

                {isSMSSupported && (
                    <div className="p-5 bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl mt-6 relative overflow-hidden">
                        <div className="flex gap-3 text-emerald-800 dark:text-emerald-300 relative z-10">
                            <Smartphone size={24} className="shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
                            <p className="text-[13px] font-medium leading-relaxed"><b>SMS অটোমেশন রিকোয়ার্ড:</b> {BANK_MAPPING[provider]} এর পেমেন্ট ভেরিফাই করার জন্য <b>Master Device</b> থেকে SMS Automation চালু থাকতে হবে।</p>
                        </div>
                    </div>
                )}

                {isIMAPSupported && (
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-2xl mt-6 space-y-4">
                        <div className="flex gap-3 text-blue-900 dark:text-blue-200">
                            <ShieldCheck size={24} className="shrink-0 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-medium leading-relaxed"><b>IMAP Automation:</b> Enter App Password and alert email.<br /><span className="opacity-70 text-[10px]">(Leave blank when editing if unchanged)</span></p>
                        </div>
                        <div>
                            <label className={labelClass}>Your Email {reqStar}</label>
                            <input required={!editingId} name="imap_email" onChange={handleInputChange} value={formData.imap_email} type="email" placeholder="you@gmail.com" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>App Password {editingId ? '' : reqStar}</label>
                            <input required={!editingId} name="imap_password" onChange={handleInputChange} value={formData.imap_password} type="password" placeholder={editingId ? '•••••••• (Unchanged)' : '••••••••'} className={`${inputClass} font-mono tracking-widest`} />
                        </div>
                        <div>
                            <label className={labelClass}>Bank's Alert Email {reqStar}</label>
                            <input required={!editingId} name="imap_bank_email" onChange={handleInputChange} value={formData.imap_bank_email} type="email" placeholder="alerts@bank.com" className={inputClass} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderIntlInputs = () => {
        const dispName    = getDisplayName(provider);
        const suggestions = provider
            ? provider === 'usdt' ? [`USDT (${formData.crypto_network.toUpperCase()})`, 'USDT'] : [dispName]
            : [];

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Select Gateway {reqStar}</label>
                    <select value={provider} onChange={(e) => handleProviderChange(e.target.value)} required className={inputClass}>
                        <option value="">-- Choose Crypto/Intl --</option>
                        {Object.entries(INTL_MAPPING).map(([slug, name]) => (<option key={slug} value={slug}>{name}</option>))}
                    </select>
                </div>

                {provider && provider !== 'usdt' && (
                    <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {['personal', 'business'].map((type) => (
                            <button key={type} type="button" onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'international'); }}
                                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${accType === type ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                {provider === 'usdt' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Select Network {reqStar}</label>
                            <div className="flex gap-2 mt-2">
                                {['trc20', 'bep20', 'erc20'].map((net) => (
                                    <button key={net} type="button" onClick={() => { setFormData({ ...formData, crypto_network: net }); generateDisplayName('usdt', '', net, isCustomName, 'international'); }}
                                        className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${formData.crypto_network === net ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-md shadow-blue-900/20' : 'bg-white dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 hover:bg-slate-50 border-slate-200 dark:border-slate-800'}`}>
                                        {net}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Wallet Address {reqStar}</label>
                            <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder={`Enter ${formData.crypto_network.toUpperCase()} Address`} className={`${inputClass} font-mono text-sm`} />
                        </div>
                    </div>
                )}

                {provider === 'binance' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Binance Pay ID / Email {reqStar}</label>
                            <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder="Pay ID or Email" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name {reqStar}</label>
                            <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder="Name on Binance" className={inputClass} />
                        </div>
                        <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50/30 dark:from-yellow-900/20 dark:to-orange-900/10 border border-yellow-200/60 dark:border-yellow-700/50 rounded-2xl space-y-4">
                            <p className="text-xs font-medium text-yellow-900 dark:text-yellow-500 flex gap-2"><ShieldCheck size={18} className="shrink-0 text-yellow-600" /><span><b>API Settings:</b> Binance API.<br /><span className="opacity-70 text-[10px]">(Leave blank if unchanged)</span></span></p>
                            <div>
                                <label className={labelClass}>API Key {editingId ? '' : reqStar}</label>
                                <input required={!editingId} name="api_key" onChange={handleInputChange} value={formData.api_key} type="text" placeholder="API Key" className={`${inputClass} font-mono text-xs`} />
                            </div>
                            <div>
                                <label className={labelClass}>Secret Key {editingId ? '' : reqStar}</label>
                                <input required={!editingId} name="secret_key" onChange={handleInputChange} value={formData.secret_key} type="password" placeholder="••••••••" className={`${inputClass} font-mono tracking-widest`} />
                            </div>
                        </div>
                    </div>
                )}

                {provider && provider !== 'usdt' && provider !== 'binance' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Account ID / Email {reqStar}</label>
                            <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder="e.g. U1234567" className={`${inputClass} font-mono`} />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name {reqStar}</label>
                            <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder="Name" className={inputClass} />
                        </div>
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-2xl space-y-4">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 flex gap-2"><ShieldCheck size={18} className="shrink-0 text-blue-600 dark:text-blue-400" /><span><b>IMAP Settings:</b><br /><span className="opacity-70 text-[10px]">(Leave blank if unchanged)</span></span></p>
                            <div>
                                <label className={labelClass}>Your Email {reqStar}</label>
                                <input required={!editingId} name="imap_email" onChange={handleInputChange} value={formData.imap_email} type="email" placeholder="you@gmail.com" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>App Password {editingId ? '' : reqStar}</label>
                                <input required={!editingId} name="imap_password" onChange={handleInputChange} value={formData.imap_password} type="password" placeholder="••••••••" className={`${inputClass} font-mono tracking-widest`} />
                            </div>
                            <div>
                                <label className={labelClass}>Company Sender Email {reqStar}</label>
                                <input required={!editingId} name="imap_bank_email" onChange={handleInputChange} value={formData.imap_bank_email} type="email" placeholder="noreply@provider.com" className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}

                {provider && renderDisplayNamePicker(suggestions)}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            {/* ── Header ── */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/vault')} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Gateways</h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Manage your vault receiving methods.</p>
                    </div>
                </div>
                <button onClick={() => { handleTabSwitch('mobile'); setIsModalOpen(true); }}
                    className="shrink-0 bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 active:scale-95 text-xs md:text-sm">
                    <Plus size={18} strokeWidth={3} />
                    <span className="hidden sm:inline">Add New Gateway</span>
                    <span className="sm:hidden">Add New</span>
                </button>
            </div>

            {/* ── Gateway Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.map((gw: any) => {
                    const maskedNumber = formatMaskedAccount(gw.account_number);
                    const currency     = gw.category === 'international' ? 'USD' : 'BDT';
                    const displayLimit = gw.max_amount
                        ? `${gw.min_amount} - ${gw.max_amount} ${currency}`
                        : `Min: ${gw.min_amount} ${currency} (Unlimited)`;

                    return (
                        <div key={gw.id} className="relative bg-white dark:bg-[#111827] rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden z-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/5 pointer-events-none z-[-1]" />
                            <div className="absolute -right-6 -bottom-6 opacity-5 dark:opacity-10 text-slate-400 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none z-[-1]"><ShieldCheck size={140} /></div>

                            <div className="relative mb-5 w-full min-h-[48px] pr-[10px]">
                                <div className="flex items-center gap-3 w-full overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-sm z-10">
                                        <img src={getLogo(gw.provider)} alt="logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0 z-10">
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight flex flex-wrap items-center gap-1.5">
                                            <span className="truncate capitalize">{getDisplayName(gw.provider)}</span>
                                            {gw.account_type && (<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase font-black shrink-0 border border-slate-200 dark:border-slate-700">{gw.account_type}</span>)}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3 bg-slate-50/80 dark:bg-[#0B1120]/80 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800 z-10">
                                <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wide">{maskedNumber}</p>
                                {gw.account_name && (<p className="text-xs font-black text-slate-700 dark:text-white mt-1 uppercase tracking-widest">{gw.account_name.toUpperCase()}</p>)}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Limits</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{displayLimit}</span>
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                    <button onClick={() => handleEdit(gw)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer bg-white/50 dark:bg-transparent"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(gw.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer bg-white/50 dark:bg-transparent"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {gateways.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-60 bg-white dark:bg-[#111827] rounded-[30px] border border-slate-100 dark:border-slate-800 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5"><ShieldCheck size={36} className="text-slate-400" /></div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">No Gateways Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">You haven't added any vault gateways yet. Click the button above to get started.</p>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">{editingId ? 'Edit Gateway' : 'Add Vault Gateway'}</h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>

                        {/* Tab Switcher */}
                        {!editingId && (
                            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="flex bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                    {[
                                        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                                        { id: 'bank', icon: Building2, label: 'Bank' },
                                        { id: 'international', icon: Globe, label: 'Intl.' },
                                    ].map((tab) => (
                                        <button key={tab.id} onClick={() => handleTabSwitch(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                                            <tab.icon size={14} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                            <form id="vaultGatewayForm" onSubmit={handleSave} className="space-y-5">
                                {activeTab === 'mobile'        && renderMobileInputs()}
                                {activeTab === 'bank'          && renderBankInputs()}
                                {activeTab === 'international' && renderIntlInputs()}

                                {provider && (
                                    <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <label className={labelClass}>Min ({activeTab === 'international' ? 'USD' : 'BDT'}) {reqStar}</label>
                                            <input required name="min_amount" onChange={handleInputChange} value={formData.min_amount} type="number" placeholder={activeTab === 'international' ? '1' : activeTab === 'bank' ? '1000' : '10'} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Max ({activeTab === 'international' ? 'USD' : 'BDT'}) {activeTab === 'international' ? '' : reqStar}</label>
                                            <input required={activeTab !== 'international'} name="max_amount" onChange={handleInputChange} value={formData.max_amount} type="number" placeholder={activeTab === 'international' ? 'Unlimited' : activeTab === 'bank' ? '300000' : '50000'} className={inputClass} />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                            <button form="vaultGatewayForm" type="submit" disabled={isSaving || !provider}
                                className="px-6 py-2.5 bg-[#0D47A1] dark:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16} strokeWidth={2.5} />{editingId ? 'Update Gateway' : 'Save Gateway'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
}