/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Plus, X, Search, Smartphone, Building2, Globe, ShieldCheck,
    Trash2, Loader2, Edit, Tag, DollarSign, Archive, ArrowRight,
    Check, ChevronDown, Wallet,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
    savePaymentGateway, updatePaymentGateway, toggleGatewayStatus,
    deleteGateway, importGatewayFromVault, getMerchantVault,
} from '@/lib/gateway_actions';
import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOBILE_PROVIDERS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Cellfin', 'mCash', 'OK Wallet', 'Pathao Pay'];

const BANK_MAPPING: Record<string, string> = {
    ab:         'AB Bank',
    agrani:     'Agrani Bank',
    asia:       'Bank Asia',
    city:       'City Bank',
    dhaka:      'Dhaka Bank',
    dbbl:       'Dutch-Bangla Bank',
    ebl:        'Eastern Bank (EBL)',
    ific:       'IFIC Bank',
    ibbl:       'Islami Bank Limited',
    jamuna:     'Jamuna Bank',
    mercantile: 'Mercantile Bank',
    midland:    'Midland Bank',
    mtb:        'Mutual Trust Bank (MTB)',
    national:   'National Bank',
    ncc:        'NCC Bank',
    prime:      'Prime Bank',
    sonali:     'Sonali Bank',
    scb:        'Standard Chartered',
    ucb:        'UCB Bank',
    tb:         'Trust Bank Limited',
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

// ─── Device Detection ─────────────────────────────────────────────────────────
function useIsMobileDevice() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
interface DropdownOption { value: string; label: string }

function CustomDropdown({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    required,
    searchable = false,
}: {
    options: DropdownOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    searchable?: boolean;
}) {
    const [open, setOpen]     = useState(false);
    const [query, setQuery]   = useState('');
    const ref                 = useRef<HTMLDivElement>(null);
    const searchRef           = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useEffect(() => {
        if (open && searchable) setTimeout(() => searchRef.current?.focus(), 40);
    }, [open, searchable]);

    const filtered = searchable
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const selectedLabel = options.find(o => o.value === value)?.label;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between mt-1.5 px-3.5 py-3.5 bg-slate-50 dark:bg-[#0B1120] border rounded-xl text-left transition-all shadow-sm text-base
                    ${open
                        ? 'border-blue-600 ring-4 ring-blue-600/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                `}
            >
                <span className={`truncate font-semibold ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-normal'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown
                    size={15}
                    className={`shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    )}
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {filtered.length === 0 ? (
                            <p className="p-3 text-sm text-slate-400 text-center">No results</p>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                                    className={`w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-left transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0
                                        ${opt.value === value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.value === value && <Check size={13} className="text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={3} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
            {/* hidden input for native form required validation */}
            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value}
                    onChange={() => {}}
                    style={{ opacity: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                />
            )}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GatewayManagerUI({ merchantId }: { merchantId: string }) {

    const isMobile = useIsMobileDevice();

    // ── State ──────────────────────────────────────────────────────────────────
    const [loading,    setLoading]    = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [gateways,   setGateways]   = useState<any[]>([]);
    const [logos,      setLogos]      = useState<any[]>([]);

    const [isChoiceModalOpen,  setIsChoiceModalOpen]  = useState(false);
    const [isVaultModalOpen,   setIsVaultModalOpen]   = useState(false);
    const [vaultGateways,      setVaultGateways]      = useState<any[]>([]);
    const [selectedVaultItems, setSelectedVaultItems] = useState<string[]>([]);
    const [isImporting,        setIsImporting]        = useState<boolean>(false);
    const [isModalOpen,        setIsModalOpen]        = useState(false);

    const [activeTab,    setActiveTab]    = useState<'mobile' | 'bank' | 'international'>('mobile');
    const [isSaving,     setIsSaving]     = useState(false);
    const [editingId,    setEditingId]    = useState<string | null>(null);
    const [provider,     setProvider]     = useState('');
    const [accType,      setAccType]      = useState('personal');
    const [isCustomName, setIsCustomName] = useState(false);
    const [chargeType,   setChargeType]   = useState<'none' | 'fixed' | 'percent'>('none');

    const [formData, setFormData] = useState<any>({
        account_number:           '',
        account_name:             '',
        branch:                   '',
        routing_number:           '',
        min_amount:               '',
        max_amount:               '',
        crypto_network:           'trc20',
        imap_email:               '',
        imap_password:            '',
        imap_bank_email:          '',
        api_key:                  '',
        secret_key:               '',
        display_name:             '',
        has_discount:             false,
        discount_percent:         '',
        max_discount_amount:      '',
        min_payment_for_discount: '',
        fixed_charge:             '',
        percent_charge:           '',
    });

    const [searchQuery,    setSearchQuery]    = useState('');
    const [showDropdown,   setShowDropdown]   = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const bankDropdownRef = useRef<HTMLDivElement>(null);

    // ── Shared style constants ─────────────────────────────────────────────────
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

    // Shared modal wrappers
    const backdropClass = 'fixed inset-0 z-[100] flex flex-col justify-end md:flex-row md:items-center md:justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200';
    const sheetClass    = 'w-full md:max-w-md bg-white dark:bg-[#111827] rounded-t-[24px] md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden';

    // ── Data Fetching ──────────────────────────────────────────────────────────

    const fetchGatewayData = async (id: string) => {
        setLoading(true);
        const [gRes, lRes, vRes] = await Promise.all([
            supabase
                .from('business_gateways')
                .select('*, vault_gateway:merchant_payment_vault(*)')
                .eq('business_id', id)
                .order('created_at', { ascending: false }),
            supabase.from('payment_logos').select('*'),
            getMerchantVault(),
        ]);

        const formattedGateways = (gRes.data || []).map((g: any) => ({
            ...g.vault_gateway,
            ...g,
            id: g.id,
        }));

        setGateways(formattedGateways);
        setLogos(lRes.data || []);
        if (vRes.success) setVaultGateways(vRes.data || []);
        setLoading(false);
    };

    useEffect(() => {
        const loadActiveBusiness = () => {
            const activeId = localStorage.getItem('active_business_id');
            if (activeId) {
                setBusinessId(activeId);
                fetchGatewayData(activeId);
            } else {
                setLoading(false);
            }
        };
        loadActiveBusiness();
        window.addEventListener('businessChanged', loadActiveBusiness);
        return () => window.removeEventListener('businessChanged', loadActiveBusiness);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                if (!provider && searchQuery) setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [provider, searchQuery]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getDisplayName = (slug: string) => BANK_MAPPING[slug] || INTL_MAPPING[slug] || slug;

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
        const match = logos.find((l) => l.method_name?.toLowerCase() === provSlug?.toLowerCase());
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

    // ── Form Handlers ──────────────────────────────────────────────────────────

    const resetForm = () => {
        setEditingId(null);
        setProvider('');
        setAccType('personal');
        setIsCustomName(false);
        setSearchQuery('');
        setChargeType('none');
        setFormData({
            account_number: '', account_name: '', branch: '', routing_number: '',
            min_amount: '', max_amount: '', crypto_network: 'trc20',
            imap_email: '', imap_password: '', imap_bank_email: '',
            api_key: '', secret_key: '', display_name: '',
            has_discount: false, discount_percent: '', max_discount_amount: '',
            min_payment_for_discount: '', fixed_charge: '', percent_charge: '',
        });
    };

    const handleTabSwitch = (tabId: any) => {
        if (editingId) return;
        resetForm();
        setActiveTab(tabId);
        setFormData((prev: any) => ({
            ...prev,
            min_amount: tabId === 'international' ? '1'      : (tabId === 'bank' ? '1000'   : '10'),
            max_amount: tabId === 'bank'           ? '300000' : (tabId === 'international' ? '' : '50000'),
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
            has_discount: false, discount_percent: '', max_discount_amount: '',
            min_payment_for_discount: '', fixed_charge: '', percent_charge: '',
        }));
        generateDisplayName(newProviderSlug, newAccType, formData.crypto_network, false, activeTab);
    };

    const handleInputChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleChargeTypeChange = (val: string) => {
        setChargeType(val as any);
        if (val === 'none')         setFormData({ ...formData, fixed_charge: '',  percent_charge: '' });
        else if (val === 'fixed')   setFormData({ ...formData, percent_charge: '' });
        else if (val === 'percent') setFormData({ ...formData, fixed_charge: '' });
    };

    const handleEdit = (gw: any) => {
        setEditingId(gw.id);
        const correctTab = (gw.category?.toLowerCase() || 'mobile') as any;
        setActiveTab(correctTab);

        let exactProvider = gw.provider?.toLowerCase() || '';
        if (correctTab === 'mobile') {
            exactProvider = MOBILE_PROVIDERS.find((p) => p.toLowerCase() === exactProvider) || gw.provider;
        }
        setProvider(exactProvider);

        const correctAccType = correctTab === 'international'
            ? (exactProvider === 'usdt' ? '' : (gw.account_type || 'personal'))
            : (gw.account_type || 'personal');
        setAccType(correctAccType);

        let cType: 'none' | 'fixed' | 'percent' = 'none';
        if (gw.percent_charge) cType = 'percent';
        else if (gw.fixed_charge) cType = 'fixed';
        setChargeType(cType);

        const dispName    = getDisplayName(exactProvider);
        const suggestions = correctTab === 'mobile'
            ? [`${dispName} Personal`, 'Send Money', `${dispName} Agent`, 'Cash Out', `${dispName} Merchant`, 'Make Payment', dispName]
            : correctTab === 'bank'
                ? [dispName, `${dispName} Payment`]
                : exactProvider === 'usdt'
                    ? [`USDT (${gw.account_type?.toUpperCase()})`, 'USDT']
                    : [dispName];

        setIsCustomName(!suggestions.includes(gw.display_name));
        setFormData({
            vault_gateway_id: gw.vault_gateway_id,
            account_number:   gw.vault_gateway?.account_number  || gw.account_number  || '',
            account_name:     gw.vault_gateway?.account_name    || gw.account_name    || '',
            branch:           gw.vault_gateway?.branch          || '',
            routing_number:   gw.vault_gateway?.routing_number  || '',
            min_amount:       gw.min_amount  || '',
            max_amount:       gw.max_amount  || '',
            crypto_network:   correctTab === 'international' && exactProvider === 'usdt' ? gw.account_type : 'trc20',
            imap_email:       gw.vault_gateway?.imap_email      || '',
            imap_password:    '',
            imap_bank_email:  gw.vault_gateway?.imap_bank_email || '',
            api_key:          '',
            secret_key:       '',
            display_name:     gw.display_name || '',
            has_discount:             gw.has_discount             || false,
            discount_percent:         gw.discount_percent         || '',
            max_discount_amount:      gw.max_discount_amount      || '',
            min_payment_for_discount: gw.min_payment_for_discount || '',
            fixed_charge:             gw.fixed_charge             || '',
            percent_charge:           gw.percent_charge           || '',
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId)            return toast.error('No Business Selected!');
        if (!provider)              return toast.error('Please select a provider!');
        if (!formData.display_name) return toast.error('Display Name is required!');

        const minAmt = parseFloat(formData.min_amount) || 0;
        const maxAmt = formData.max_amount ? parseFloat(formData.max_amount) : null;
        if (minAmt < 0 || (maxAmt !== null && maxAmt < 0)) return toast.error('Amounts cannot be negative!');
        if (maxAmt !== null && minAmt > maxAmt) return toast.error('Min amount cannot be greater than Max amount!');
        if (formData.fixed_charge   && parseFloat(formData.fixed_charge)   < 0) return toast.error('Charge cannot be negative!');
        if (formData.percent_charge && parseFloat(formData.percent_charge) < 0) return toast.error('Charge cannot be negative!');
        if (formData.has_discount && (
            parseFloat(formData.discount_percent)         < 0 ||
            parseFloat(formData.max_discount_amount)      < 0 ||
            parseFloat(formData.min_payment_for_discount) < 0
        )) return toast.error('Discounts cannot be negative!');

        setIsSaving(true);
        const payload = { merchant_id: merchantId, business_id: businessId, category: activeTab, provider, account_type: accType, ...formData };
        const res = editingId
            ? await updatePaymentGateway(editingId, payload)
            : await savePaymentGateway(payload);

        if (res.success) {
            toast.success(`Gateway ${editingId ? 'Updated' : 'Added'}!`);
            const newlyFormatted = { ...res.data.vault_gateway, ...res.data, id: res.data.id };
            setGateways(editingId
                ? gateways.map((g) => (g.id === editingId ? newlyFormatted : g))
                : [newlyFormatted, ...gateways]);
            setIsModalOpen(false);
            resetForm();
        } else {
            toast.error(res.message);
        }
        setIsSaving(false);
    };

    const toggleVaultSelection = (id: string) => {
        if (selectedVaultItems.includes(id)) setSelectedVaultItems(selectedVaultItems.filter((item) => item !== id));
        else setSelectedVaultItems([...selectedVaultItems, id]);
    };

    const handleBulkImport = async () => {
        if (!businessId) return;
        if (selectedVaultItems.length === 0) return toast.error('Please select at least one gateway.');
        setIsImporting(true);
        let successCount = 0;
        const newGateways = [...gateways];
        for (const vId of selectedVaultItems) {
            const vaultItem = vaultGateways.find((v) => v.id === vId);
            if (vaultItem) {
                const res = await importGatewayFromVault(businessId, vaultItem);
                if (res.success) { successCount++; newGateways.unshift({ ...res.data.vault_gateway, ...res.data, id: res.data.id }); }
                else toast.error(`Failed: ${res.message}`);
            }
        }
        setGateways(newGateways);
        if (successCount > 0) toast.success(`${successCount} gateways imported!`);
        setIsImporting(false);
        setSelectedVaultItems([]);
        setIsVaultModalOpen(false);
    };

    const handleToggle = async (id: string, current: boolean) => {
        setGateways(gateways.map((g) => (g.id === id ? { ...g, is_active: !current } : g)));
        await toggleGatewayStatus(id, current);
        toast.success(`Gateway ${!current ? 'Enabled' : 'Disabled'}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gateway?')) return;
        setGateways(gateways.filter((g) => g.id !== id));
        await deleteGateway(id);
        toast.success('Gateway Deleted!');
    };

    // ── Sub-Renderers ──────────────────────────────────────────────────────────

    const renderDisplayNamePicker = (suggestions: string[]) => {
        const opts: DropdownOption[] = [
            ...suggestions.map(s => ({ value: s, label: s })),
            { value: '__custom__', label: '✨ Custom Name (Write your own)' },
        ];
        return (
            <div className="space-y-3">
                <div>
                    <label className={labelClass}>Display Name {reqStar}</label>
                    <CustomDropdown
                        options={opts}
                        value={isCustomName ? '__custom__' : formData.display_name}
                        onChange={(val) => {
                            if (val === '__custom__') { setIsCustomName(true); setFormData({ ...formData, display_name: '' }); }
                            else { setIsCustomName(false); setFormData({ ...formData, display_name: val }); }
                        }}
                        placeholder="-- Select Display Name --"
                        required
                    />
                </div>
                {isCustomName && (
                    <div className="animate-in fade-in zoom-in-95">
                        <input required type="text" name="display_name" onChange={handleInputChange} value={formData.display_name} placeholder="e.g. Pay via Personal Bkash" className={inputClass} />
                    </div>
                )}
            </div>
        );
    };

    const renderChargeSection = () => {
        const currency = activeTab === 'international' ? 'USD' : 'BDT';
        const chargeOpts: DropdownOption[] = [
            { value: 'none',    label: 'No Charge' },
            { value: 'fixed',   label: 'Fixed Amount' },
            { value: 'percent', label: 'Percentage (%)' },
        ];
        return (
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                            <DollarSign size={14} className="text-orange-500" /> Payment Charge
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apply an extra fee for using this method.</p>
                    </div>
                </div>
                <div className="p-4 bg-orange-50/40 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 space-y-3">
                    <div>
                        <label className={labelClass}>Charge Type</label>
                        <CustomDropdown options={chargeOpts} value={chargeType} onChange={handleChargeTypeChange} />
                    </div>
                    {chargeType === 'fixed' && (
                        <div className="animate-in fade-in">
                            <label className={labelClass}>Fixed Charge ({currency}) {reqStar}</label>
                            <input required type="number" step="0.01" name="fixed_charge" onChange={handleInputChange} value={formData.fixed_charge} placeholder="e.g. 10" className={inputClass} />
                        </div>
                    )}
                    {chargeType === 'percent' && (
                        <div className="animate-in fade-in">
                            <label className={labelClass}>Percentage Charge (%) {reqStar}</label>
                            <input required type="number" step="0.01" name="percent_charge" onChange={handleInputChange} value={formData.percent_charge} placeholder="e.g. 1.85" className={inputClass} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDiscountSection = () => {
        const currency = activeTab === 'international' ? 'USD' : 'BDT';
        return (
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                            <Tag size={14} className="text-blue-500" /> Enable Discount
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Offer users a percentage discount.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, has_discount: !formData.has_discount })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${formData.has_discount ? 'bg-[#34C759]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${formData.has_discount ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                </div>
                {formData.has_discount && (
                    <div className="grid grid-cols-1 gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-top-2">
                        <div>
                            <label className={labelClass}>Discount % {reqStar}</label>
                            <input required type="number" step="0.01" name="discount_percent" onChange={handleInputChange} value={formData.discount_percent} placeholder="e.g. 5" className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Max ({currency}) {reqStar}</label>
                                <input required type="number" step="0.01" name="max_discount_amount" onChange={handleInputChange} value={formData.max_discount_amount} placeholder="e.g. 100" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Min Pay ({currency}) {reqStar}</label>
                                <input required type="number" step="0.01" name="min_payment_for_discount" onChange={handleInputChange} value={formData.min_payment_for_discount} placeholder="e.g. 500" className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMobileInputs = () => {
        const dispName  = getDisplayName(provider);
        const needsName = accType === 'agent' || accType === 'merchant' || provider === 'Pathao Pay' || provider === 'Cellfin';
        const suggestions = provider
            ? accType === 'personal' ? [`${dispName} Personal`, 'Send Money']
                : accType === 'agent' ? [`${dispName} Agent`, 'Cash Out']
                : accType === 'merchant' ? [`${dispName} Merchant`, 'Make Payment']
                : [dispName]
            : [];
        const provOpts: DropdownOption[] = MOBILE_PROVIDERS.map(p => ({ value: p, label: p }));

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Select Provider {reqStar}</label>
                    <CustomDropdown options={provOpts} value={provider} onChange={handleProviderChange} placeholder="-- Choose Provider --" required />
                </div>

                {provider && provider !== 'Cellfin' && provider !== 'Pathao Pay' && (
                    <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {['personal', 'agent', 'merchant'].map((type) => (
                            <button key={type} type="button"
                                onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'mobile'); }}
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
        const bankOpts: DropdownOption[] = Object.entries(BANK_MAPPING)
            .filter(([slug]) => !EXCLUDED_BANKS.includes(slug))
            .map(([slug, name]) => ({ value: slug, label: name }));

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Select Bank {reqStar}</label>
                    <CustomDropdown options={bankOpts} value={provider} onChange={handleProviderChange} placeholder="Search Bank..." required searchable />
                </div>

                <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {['personal', 'business'].map((type) => (
                        <button key={type} type="button"
                            onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'bank'); }}
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
                    <div className="p-4 bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                        <div className="flex gap-3 text-emerald-800 dark:text-emerald-300">
                            <Smartphone size={20} className="shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
                            <p className="text-[13px] font-medium leading-relaxed"><b>SMS অটোমেশন রিকোয়ার্ড:</b> {BANK_MAPPING[provider]} এর পেমেন্ট ভেরিফাই করার জন্য <b>Master Device</b> থেকে SMS Automation চালু থাকতে হবে।</p>
                        </div>
                    </div>
                )}

                {isIMAPSupported && (
                    <div className="p-4 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-xl space-y-4">
                        <div className="flex gap-3 text-blue-900 dark:text-blue-200">
                            <ShieldCheck size={20} className="shrink-0 text-blue-600 dark:text-blue-400" />
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
        const intlOpts: DropdownOption[] = Object.entries(INTL_MAPPING).map(([slug, name]) => ({ value: slug, label: name }));

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Select Gateway {reqStar}</label>
                    <CustomDropdown options={intlOpts} value={provider} onChange={handleProviderChange} placeholder="-- Choose Crypto/Intl --" required />
                </div>

                {provider && provider !== 'usdt' && (
                    <div className="flex bg-slate-100/80 dark:bg-[#0B1120] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {['personal', 'business'].map((type) => (
                            <button key={type} type="button"
                                onClick={() => { setAccType(type); generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'international'); }}
                                className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all ${accType === type ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                {provider === 'usdt' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Select Network {reqStar}</label>
                            <div className="flex gap-2 mt-1.5">
                                {['trc20', 'bep20', 'erc20'].map((net) => (
                                    <button key={net} type="button"
                                        onClick={() => { setFormData({ ...formData, crypto_network: net }); generateDisplayName('usdt', '', net, isCustomName, 'international'); }}
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
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Binance Pay ID / Email {reqStar}</label>
                            <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder="Pay ID or Email" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name {reqStar}</label>
                            <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder="Name on Binance" className={inputClass} />
                        </div>
                        <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/60 dark:border-yellow-700/50 rounded-xl space-y-4">
                            <p className="text-xs font-medium text-yellow-900 dark:text-yellow-500 flex gap-2"><ShieldCheck size={16} className="shrink-0 text-yellow-600" /><span><b>API Settings:</b> Binance API.<br /><span className="opacity-70 text-[10px]">(Leave blank if unchanged)</span></span></p>
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
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Account ID / Email {reqStar}</label>
                            <input required name="account_number" onChange={handleInputChange} value={formData.account_number} type="text" placeholder="e.g. U1234567" className={`${inputClass} font-mono`} />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name {reqStar}</label>
                            <input required name="account_name" onChange={handleInputChange} value={formData.account_name} type="text" placeholder="Name" className={inputClass} />
                        </div>
                        <div className="p-4 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-xl space-y-4">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 flex gap-2"><ShieldCheck size={16} className="shrink-0 text-blue-600 dark:text-blue-400" /><span><b>IMAP Settings:</b><br /><span className="opacity-70 text-[10px]">(Leave blank if unchanged)</span></span></p>
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

    // ── Loading / No Business ──────────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    if (!businessId) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
            <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar.</p>
        </div>
    );

    // ── Main Render ────────────────────────────────────────────────────────────

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gateway Manager</h1>
                    <p className="text-slate-500 font-bold text-sm mt-1">Manage receiving methods for your business.</p>
                </div>
                <button
                    onClick={() => setIsChoiceModalOpen(true)}
                    className="shrink-0 bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 active:scale-95 text-xs md:text-sm"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span className="hidden sm:inline">Add New Gateway</span>
                    <span className="sm:hidden">Add New</span>
                </button>
            </div>

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.map((gw: any) => {
                    const maskedNumber = formatMaskedAccount(gw.account_number);
                    const currency     = gw.category === 'international' ? 'USD' : 'BDT';
                    const displayLimit = gw.max_amount
                        ? `${gw.min_amount} - ${gw.max_amount} ${currency}`
                        : `Min: ${gw.min_amount} ${currency} (Unlimited)`;

                    return (
                        <div key={gw.id} className={`relative bg-white dark:bg-[#111827] rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden z-0 ${!gw.is_active ? 'opacity-60 grayscale hover:opacity-80' : ''}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/5 pointer-events-none z-[-1]" />
                            <div className="absolute -right-6 -bottom-6 opacity-5 dark:opacity-10 text-slate-400 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500 pointer-events-none z-[-1]"><ShieldCheck size={140} /></div>

                            <div className="relative mb-5 w-full min-h-[48px] pr-[60px]">
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
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                                    <button onClick={() => handleToggle(gw.id, gw.is_active)} className={`relative inline-flex h-[30px] w-[52px] cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${gw.is_active ? 'bg-[#34C759]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <span className={`inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${gw.is_active ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                                    </button>
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
                                <div className="flex gap-1.5 flex-wrap justify-end items-center">
                                    {gw.has_discount && (<div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Tag size={10} /> {gw.discount_percent}% OFF</div>)}
                                    {(gw.fixed_charge || gw.percent_charge) && (<div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} /> FEE {gw.percent_charge ? `${gw.percent_charge}%` : ''}{gw.percent_charge && gw.fixed_charge ? ' + ' : ''}{gw.fixed_charge ? `${gw.fixed_charge}${gw.category === 'international' ? '$' : '৳'}` : ''}</div>)}
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
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">You haven't added any payment methods yet. Click the button above to start accepting payments.</p>
                    </div>
                )}
            </div>

            {/* ── Choice Modal ── */}
            {isChoiceModalOpen && (
                <div className={backdropClass} onClick={() => setIsChoiceModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className={sheetClass}>
                        {/* Drag handle – mobile only */}
                        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">Add Gateway</h2>
                            <button onClick={() => setIsChoiceModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>
                        {/* Body */}
                        <div className="p-4 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-3">
                            <button
                                onClick={() => { setIsChoiceModalOpen(false); setIsVaultModalOpen(true); }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left active:scale-[0.99]"
                            >
                                <Archive size={26} className="text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Import from Vault</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Use master credentials</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                            <button
                                onClick={() => { setIsChoiceModalOpen(false); handleTabSwitch('mobile'); setIsModalOpen(true); }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left active:scale-[0.99]"
                            >
                                <Wallet size={26} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Create New</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Setup manually</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            <button onClick={() => setIsChoiceModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Vault Import Modal ── */}
            {isVaultModalOpen && (
                <div className={backdropClass} onClick={() => setIsVaultModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className={`${sheetClass} md:max-w-lg`}>
                        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">Vault Assets</h2>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Select to import</p>
                            </div>
                            <button onClick={() => setIsVaultModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>
                        {/* Body */}
                        <div className="p-4 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-3">
                            {vaultGateways.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <Archive size={36} className="mx-auto opacity-20 mb-3" />
                                    <p className="text-sm font-medium">Your vault is empty.</p>
                                </div>
                            ) : (
                                vaultGateways.map((gw) => {
                                    const isAdded    = gateways.some((g) => g.vault_gateway_id === gw.id);
                                    const isSelected = selectedVaultItems.includes(gw.id);
                                    return (
                                        <div
                                            key={gw.id}
                                            onClick={() => !isAdded && toggleVaultSelection(gw.id)}
                                            className={`relative flex items-center p-3.5 border rounded-xl transition-all ${isAdded ? 'border-slate-100 dark:border-slate-800 opacity-50 grayscale cursor-not-allowed' : isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer'}`}
                                        >
                                            {isAdded && (<span className="absolute top-2 right-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Added</span>)}
                                            {!isAdded && (
                                                <div className={`w-5 h-5 shrink-0 rounded-md border-2 mr-3 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isSelected && <Check size={13} className="text-white" strokeWidth={3.5} />}
                                                </div>
                                            )}
                                            <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl p-2 flex items-center justify-center mr-3">
                                                <img src={getLogo(gw.provider)} alt="logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize truncate">{gw.display_name || getDisplayName(gw.provider)}</h4>
                                                <p className="text-xs font-mono text-slate-500 mt-0.5">{formatMaskedAccount(gw.account_number)}</p>
                                            </div>
                                            {!isAdded && gw.account_type && (<span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md ml-2 shrink-0">{gw.account_type}</span>)}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            {vaultGateways.length > 0 && (
                                <button
                                    onClick={() => {
                                        const availableIds = vaultGateways.filter((gw) => !gateways.some((g) => g.vault_gateway_id === gw.id)).map((gw) => gw.id);
                                        if (selectedVaultItems.length === availableIds.length) setSelectedVaultItems([]);
                                        else setSelectedVaultItems(availableIds);
                                    }}
                                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                                >
                                    {selectedVaultItems.length === vaultGateways.filter((gw) => !gateways.some((g) => g.vault_gateway_id === gw.id)).length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                            <button
                                onClick={selectedVaultItems.length > 0 ? handleBulkImport : undefined}
                                disabled={selectedVaultItems.length === 0 || isImporting}
                                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${selectedVaultItems.length > 0 ? 'bg-[#0D47A1] dark:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isImporting ? <Loader2 className="animate-spin" size={16} /> : `Import (${selectedVaultItems.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Form Modal ── */}
            {isModalOpen && (
                <div className={backdropClass} onClick={() => { setIsModalOpen(false); resetForm(); }}>
                    <div onClick={(e) => e.stopPropagation()} className={`${sheetClass} md:max-w-lg`}>
                        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">{editingId ? 'Edit Gateway' : 'Add Gateway'}</h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>
                        {/* Tab switcher */}
                        {!editingId && (
                            <div className="px-4 pt-3 shrink-0">
                                <div className="flex bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                    {[{ id: 'mobile', icon: Smartphone, label: 'Mobile' }, { id: 'bank', icon: Building2, label: 'Bank' }, { id: 'international', icon: Globe, label: 'Intl.' }].map((tab) => (
                                        <button key={tab.id} onClick={() => handleTabSwitch(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                                            <tab.icon size={13} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Body */}
                        <div className="p-4 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-4">
                            <form id="gatewayForm" onSubmit={handleSave} className="space-y-0">
                                {activeTab === 'mobile'        && renderMobileInputs()}
                                {activeTab === 'bank'          && renderBankInputs()}
                                {activeTab === 'international' && renderIntlInputs()}

                                {provider && (
                                    <div>
                                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Min Amount ({activeTab === 'international' ? 'USD' : 'BDT'}) {reqStar}</label>
                                                    <input required name="min_amount" onChange={handleInputChange} value={formData.min_amount} type="number" placeholder={activeTab === 'international' ? '1' : activeTab === 'bank' ? '1000' : '10'} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Max Amount ({activeTab === 'international' ? 'USD' : 'BDT'}) {activeTab === 'international' ? '' : reqStar}</label>
                                                    <input required={activeTab !== 'international'} name="max_amount" onChange={handleInputChange} value={formData.max_amount} type="number" placeholder={activeTab === 'international' ? 'Unlimited' : activeTab === 'bank' ? '300000' : '50000'} className={inputClass} />
                                                </div>
                                            </div>
                                        </div>
                                        {renderChargeSection()}
                                        {renderDiscountSection()}
                                    </div>
                                )}
                            </form>
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">Cancel</button>
                            <button
                                form="gatewayForm"
                                type="submit"
                                disabled={isSaving || !provider}
                                className="px-5 py-2.5 bg-[#0D47A1] dark:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={15} strokeWidth={2.5} />{editingId ? 'Update Gateway' : 'Save Gateway'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar         { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track   { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb   { background: #E2E8F0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
}