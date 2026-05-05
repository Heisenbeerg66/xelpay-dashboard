/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Plus, X, Search, Smartphone, Building2, Globe, ShieldCheck,
    Trash2, Loader2, Edit, Tag, DollarSign, Archive, ArrowRight, Check, ChevronDown,
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

// ─── Custom Premium Dropdown Component (White Theme with Orange Hover) ────────
const CustomDropdown = ({ value, onChange, options, placeholder, required = false }: { value: string, onChange: (val: string) => void, options: {label: string, value: string}[], placeholder: string, required?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full mt-1.5 p-3.5 bg-white border rounded-xl flex justify-between items-center cursor-pointer shadow-sm transition-all ${
                    isOpen ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-slate-200'
                }`}
            >
                <span className={value && value !== 'custom' ? 'text-slate-800 font-medium text-[15px] truncate' : 'text-slate-500 font-normal text-[15px] truncate'}>
                    {value ? options.find(opt => opt.value === value)?.label || placeholder : placeholder}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Hidden Input for Form Validation */}
            {required && !value && (
                <input type="text" required className="absolute opacity-0 w-0 h-0 pointer-events-none" value="" onChange={() => {}} tabIndex={-1} />
            )}

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-xl py-2 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`mx-1.5 px-4 py-3 text-[14px] rounded-lg cursor-pointer transition-colors ${
                                value === opt.value
                                    ? 'bg-[#E86744] text-white font-medium shadow-sm' // Orange Highlight like Base44
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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

    const generateDisplayName = (
        prov: string,
        type: string,
        net: string,
        custom: boolean,
        currentTab: string
    ) => {
        if (!custom && prov && !editingId) {
            let name = getDisplayName(prov);
            if (currentTab === 'mobile' && type) {
                name = `${name} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            } else if (currentTab === 'international' && prov === 'usdt') {
                name = `USDT (${net.toUpperCase()})`;
            }
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
                        ? <span key={i} className="text-blue-600 font-bold">{part}</span>
                        : part
                )}
            </span>
        );
    };

    // ── Style Constants (Matched to White Theme Screenshot) ─────────────────────

    const inputClass = [
        'w-full mt-1.5 p-3.5',
        'bg-white',
        'border border-slate-200 rounded-xl',
        'outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20',
        'text-slate-800 font-medium',
        'placeholder:text-slate-400 placeholder:font-normal',
        'text-[15px] shadow-sm transition-all',
    ].join(' ');

    const labelClass = 'text-[13px] font-semibold text-slate-700 block';
    const reqStar    = <span className="text-red-500 text-sm ml-0.5">*</span>;

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

    // ── Click-Outside for Bank Dropdown ───────────────────────────────────────

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                bankDropdownRef.current &&
                !bankDropdownRef.current.contains(event.target as Node)
            ) {
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
        setChargeType('none');
        setFormData({
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
        const newAccType = newProviderSlug === 'Pathao Pay'
            ? 'personal'
            : (newProviderSlug === 'Cellfin' ? '' : 'personal');
        setAccType(newAccType);
        setIsCustomName(false);
        setFormData((prev: any) => ({
            ...prev,
            account_number:           '',
            account_name:             '',
            branch:                   '',
            routing_number:           '',
            imap_email:               '',
            imap_password:            '',
            imap_bank_email:          '',
            api_key:                  '',
            secret_key:               '',
            has_discount:             false,
            discount_percent:         '',
            max_discount_amount:      '',
            min_payment_for_discount: '',
            fixed_charge:             '',
            percent_charge:           '',
        }));
        generateDisplayName(newProviderSlug, newAccType, formData.crypto_network, false, activeTab);
    };

    const handleInputChange = (e: any) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

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
            exactProvider = MOBILE_PROVIDERS.find(
                (p) => p.toLowerCase() === exactProvider
            ) || gw.provider;
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
        const suggestions =
            correctTab === 'mobile'
                ? [`${dispName} Personal`, 'Send Money', `${dispName} Agent`, 'Cash Out', `${dispName} Merchant`, 'Make Payment', dispName]
                : correctTab === 'bank'
                    ? [dispName, `${dispName} Payment`]
                    : exactProvider === 'usdt'
                        ? [`USDT (${gw.account_type?.toUpperCase()})`, 'USDT']
                        : [dispName];

        setIsCustomName(!suggestions.includes(gw.display_name));

        setFormData({
            vault_gateway_id:         gw.vault_gateway_id,
            account_number:           gw.vault_gateway?.account_number  || gw.account_number  || '',
            account_name:             gw.vault_gateway?.account_name    || gw.account_name    || '',
            branch:                   gw.vault_gateway?.branch          || '',
            routing_number:           gw.vault_gateway?.routing_number  || '',
            min_amount:               gw.min_amount  || '',
            max_amount:               gw.max_amount  || '',
            crypto_network:           correctTab === 'international' && exactProvider === 'usdt'
                ? gw.account_type
                : 'trc20',
            imap_email:               gw.vault_gateway?.imap_email      || '',
            imap_password:            '',
            imap_bank_email:          gw.vault_gateway?.imap_bank_email || '',
            api_key:                  '',
            secret_key:               '',
            display_name:             gw.display_name || '',
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

        if (minAmt < 0 || (maxAmt !== null && maxAmt < 0)) {
            return toast.error('Amounts cannot be negative!');
        }
        if (maxAmt !== null && minAmt > maxAmt) {
            return toast.error('Min amount cannot be greater than Max amount!');
        }
        if (formData.fixed_charge   && parseFloat(formData.fixed_charge)   < 0) return toast.error('Charge cannot be negative!');
        if (formData.percent_charge && parseFloat(formData.percent_charge) < 0) return toast.error('Charge cannot be negative!');
        if (
            formData.has_discount &&
            (
                parseFloat(formData.discount_percent)         < 0 ||
                parseFloat(formData.max_discount_amount)      < 0 ||
                parseFloat(formData.min_payment_for_discount) < 0
            )
        ) {
            return toast.error('Discounts cannot be negative!');
        }

        setIsSaving(true);
        const payload = {
            merchant_id:  merchantId,
            business_id:  businessId,
            category:     activeTab,
            provider,
            account_type: accType,
            ...formData,
        };
        const res = editingId
            ? await updatePaymentGateway(editingId, payload)
            : await savePaymentGateway(payload);

        if (res.success) {
            toast.success(`Gateway ${editingId ? 'Updated' : 'Added'}!`);
            const newlyFormatted = { ...res.data.vault_gateway, ...res.data, id: res.data.id };
            setGateways(
                editingId
                    ? gateways.map((g) => (g.id === editingId ? newlyFormatted : g))
                    : [newlyFormatted, ...gateways]
            );
            setIsModalOpen(false);
            resetForm();
        } else {
            toast.error(res.message);
        }
        setIsSaving(false);
    };

    const toggleVaultSelection = (id: string) => {
        if (selectedVaultItems.includes(id)) {
            setSelectedVaultItems(selectedVaultItems.filter((item) => item !== id));
        } else {
            setSelectedVaultItems([...selectedVaultItems, id]);
        }
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
                if (res.success) {
                    successCount++;
                    newGateways.unshift({ ...res.data.vault_gateway, ...res.data, id: res.data.id });
                } else {
                    toast.error(`Failed: ${res.message}`);
                }
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
        const dnOptions = suggestions.map(s => ({ label: s, value: s }));
        dnOptions.push({ label: '✨ Custom Name (Write your own)', value: 'custom' });

        return (
            <div className="space-y-3">
                <div>
                    <label className={labelClass}>Display Name {reqStar}</label>
                    <CustomDropdown
                        value={isCustomName ? 'custom' : formData.display_name}
                        onChange={(val) => {
                            if (val === 'custom') {
                                setIsCustomName(true);
                                setFormData({ ...formData, display_name: '' });
                            } else {
                                setIsCustomName(false);
                                setFormData({ ...formData, display_name: val });
                            }
                        }}
                        placeholder="-- Select Display Name --"
                        options={dnOptions}
                        required
                    />
                </div>
                {isCustomName && (
                    <div className="animate-in fade-in zoom-in-95">
                        <input
                            required
                            type="text"
                            name="display_name"
                            onChange={handleInputChange}
                            value={formData.display_name}
                            placeholder="e.g. Pay via Personal Bkash"
                            className={inputClass}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderChargeSection = () => {
        const currency = activeTab === 'international' ? 'USD' : 'BDT';
        return (
            <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <DollarSign size={16} className="text-orange-500" /> Payment Charge
                        </h4>
                    </div>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className={labelClass}>Select Charge Type</label>
                    <CustomDropdown
                        value={chargeType}
                        onChange={handleChargeTypeChange}
                        placeholder="No Charge"
                        options={[
                            { label: 'No Charge', value: 'none' },
                            { label: 'Fixed Amount', value: 'fixed' },
                            { label: 'Percentage (%)', value: 'percent' },
                        ]}
                    />
                    {chargeType === 'fixed' && (
                        <div className="mt-4 animate-in fade-in">
                            <label className={labelClass}>Fixed Charge ({currency}) {reqStar}</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="fixed_charge"
                                onChange={handleInputChange}
                                value={formData.fixed_charge}
                                placeholder="e.g. 10"
                                className={inputClass}
                            />
                        </div>
                    )}
                    {chargeType === 'percent' && (
                        <div className="mt-4 animate-in fade-in">
                            <label className={labelClass}>Percentage Charge (%) {reqStar}</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="percent_charge"
                                onChange={handleInputChange}
                                value={formData.percent_charge}
                                placeholder="e.g. 1.85"
                                className={inputClass}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDiscountSection = () => {
        const currency = activeTab === 'international' ? 'USD' : 'BDT';
        return (
            <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Tag size={16} className="text-[#3B82F6]" /> Enable Discount Offer
                        </h4>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, has_discount: !formData.has_discount })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                            formData.has_discount ? 'bg-[#34C759]' : 'bg-slate-200'
                        }`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                            formData.has_discount ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>
                {formData.has_discount && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                        <div>
                            <label className={labelClass}>Discount % {reqStar}</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="discount_percent"
                                onChange={handleInputChange}
                                value={formData.discount_percent}
                                placeholder="e.g. 5"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Max ({currency}) {reqStar}</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="max_discount_amount"
                                onChange={handleInputChange}
                                value={formData.max_discount_amount}
                                placeholder="e.g. 100"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Min Pay ({currency}) {reqStar}</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="min_payment_for_discount"
                                onChange={handleInputChange}
                                value={formData.min_payment_for_discount}
                                placeholder="e.g. 500"
                                className={inputClass}
                            />
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
            ? accType === 'personal'
                ? [`${dispName} Personal`, 'Send Money']
                : accType === 'agent'
                    ? [`${dispName} Agent`, 'Cash Out']
                    : accType === 'merchant'
                        ? [`${dispName} Merchant`, 'Make Payment']
                        : [dispName]
            : [];

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Customer *</label>
                    <CustomDropdown
                        value={provider}
                        onChange={handleProviderChange}
                        placeholder="Select Provider"
                        options={MOBILE_PROVIDERS.map(p => ({ label: p, value: p }))}
                        required
                    />
                </div>

                {provider && provider !== 'Cellfin' && provider !== 'Pathao Pay' && (
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        {['personal', 'agent', 'merchant'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    setAccType(type);
                                    generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'mobile');
                                }}
                                className={`flex-1 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                                    accType === type
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                <div>
                    <label className={labelClass}>Account / Wallet Number *</label>
                    <input
                        required
                        name="account_number"
                        onChange={handleInputChange}
                        value={formData.account_number}
                        type="text"
                        maxLength={11}
                        placeholder="e.g. 01712345678"
                        className={inputClass}
                    />
                </div>

                {needsName && (
                    <div>
                        <label className={labelClass}>
                            {provider === 'Cellfin'
                                ? 'Account Name'
                                : accType === 'agent'
                                    ? 'Agent Name'
                                    : 'Merchant Name'
                            } *
                        </label>
                        <input
                            required
                            name="account_name"
                            onChange={handleInputChange}
                            value={formData.account_name}
                            type="text"
                            placeholder="Enter Name"
                            className={inputClass}
                        />
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
            ([slug, name]) =>
                !EXCLUDED_BANKS.includes(slug) &&
                name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (!showDropdown) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightIndex((prev) => Math.min(prev + 1, filteredBanks.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && filteredBanks[highlightIndex]) {
                e.preventDefault();
                handleProviderChange(filteredBanks[highlightIndex][0]);
                setShowDropdown(false);
            }
        };

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                {/* Bank Search Dropdown */}
                <div className="relative" ref={bankDropdownRef}>
                    <label className={labelClass}>Select Bank *</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={provider && !showDropdown ? BANK_MAPPING[provider] : searchQuery}
                            onFocus={() => { setShowDropdown(true); setHighlightIndex(0); }}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                                setHighlightIndex(0);
                                setProvider('');
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search Bank..."
                            className={`${inputClass} pr-10`}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400" size={18} />
                    </div>

                    {showDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-xl max-h-56 overflow-y-auto py-2">
                            {filteredBanks.length === 0 ? (
                                <div className="p-3 text-sm text-slate-500 text-center">No banks found</div>
                            ) : (
                                filteredBanks.map(([slug, name], index) => (
                                    <div
                                        key={slug}
                                        onClick={() => { handleProviderChange(slug); setShowDropdown(false); }}
                                        onMouseEnter={() => setHighlightIndex(index)}
                                        className={`px-4 py-3 cursor-pointer text-[14px] font-medium transition-colors ${
                                            index === highlightIndex
                                                ? 'bg-slate-50 text-slate-900'
                                                : 'text-slate-700'
                                        }`}
                                    >
                                        {highlightMatch(name, searchQuery)}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Account Type Toggle */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl">
                    {['personal', 'business'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => {
                                setAccType(type);
                                generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'bank');
                            }}
                            className={`flex-1 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                                accType === type
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div>
                    <label className={labelClass}>Account Name *</label>
                    <input
                        required
                        name="account_name"
                        onChange={handleInputChange}
                        value={formData.account_name}
                        type="text"
                        placeholder={accType === 'personal' ? 'e.g. Md. Rahim' : 'e.g. Xenverse IT'}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Account Number *</label>
                    <input
                        required
                        name="account_number"
                        onChange={handleInputChange}
                        value={formData.account_number}
                        type="text"
                        placeholder="e.g. 102XXXXXXXXX"
                        className={`${inputClass} font-mono`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Branch Name *</label>
                        <input
                            required
                            name="branch"
                            onChange={handleInputChange}
                            value={formData.branch}
                            type="text"
                            placeholder="Gulshan Branch"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Routing No *</label>
                        <input
                            required
                            name="routing_number"
                            onChange={handleInputChange}
                            value={formData.routing_number}
                            type="text"
                            maxLength={9}
                            placeholder="123456789"
                            className={`${inputClass} font-mono`}
                        />
                    </div>
                </div>

                {provider && renderDisplayNamePicker(suggestions)}

                {isSMSSupported && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl mt-6">
                        <div className="flex gap-3 text-emerald-800">
                            <Smartphone size={24} className="shrink-0 text-emerald-600 mt-0.5" />
                            <p className="text-[13px] font-medium leading-relaxed">
                                <b>SMS অটোমেশন রিকোয়ার্ড:</b> {BANK_MAPPING[provider]} এর পেমেন্ট ভেরিফাই করার জন্য{' '}
                                <b>Master Device</b> থেকে SMS Automation চালু থাকতে হবে।
                            </p>
                        </div>
                    </div>
                )}

                {isIMAPSupported && (
                    <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl mt-6 space-y-4">
                        <div className="flex gap-3 text-slate-800">
                            <ShieldCheck size={24} className="shrink-0 text-blue-500" />
                            <p className="text-xs font-medium leading-relaxed">
                                <b>IMAP Automation:</b> Enter App Password and alert email.<br />
                                <span className="opacity-70 text-[11px] font-normal">(Leave blank when editing if unchanged)</span>
                            </p>
                        </div>
                        <div>
                            <label className={labelClass}>Your Email *</label>
                            <input
                                required={!editingId}
                                name="imap_email"
                                onChange={handleInputChange}
                                value={formData.imap_email}
                                type="email"
                                placeholder="you@gmail.com"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>App Password {editingId ? '' : '*'}</label>
                            <input
                                required={!editingId}
                                name="imap_password"
                                onChange={handleInputChange}
                                value={formData.imap_password}
                                type="password"
                                placeholder={editingId ? '•••••••• (Unchanged)' : '••••••••'}
                                className={`${inputClass} font-mono tracking-widest`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Bank's Alert Email *</label>
                            <input
                                required={!editingId}
                                name="imap_bank_email"
                                onChange={handleInputChange}
                                value={formData.imap_bank_email}
                                type="email"
                                placeholder="alerts@bank.com"
                                className={inputClass}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderIntlInputs = () => {
        const dispName  = getDisplayName(provider);
        const suggestions = provider
            ? provider === 'usdt'
                ? [`USDT (${formData.crypto_network.toUpperCase()})`, 'USDT']
                : [dispName]
            : [];

        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <label className={labelClass}>Template *</label>
                    <CustomDropdown
                        value={provider}
                        onChange={handleProviderChange}
                        placeholder="Select template"
                        options={Object.entries(INTL_MAPPING).map(([slug, name]) => ({ label: name, value: slug }))}
                        required
                    />
                </div>

                {provider && provider !== 'usdt' && (
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        {['personal', 'business'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    setAccType(type);
                                    generateDisplayName(provider, type, formData.crypto_network, isCustomName, 'international');
                                }}
                                className={`flex-1 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                                    accType === type
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                {provider === 'usdt' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Select Network *</label>
                            <div className="flex gap-2 mt-2">
                                {['trc20', 'bep20', 'erc20'].map((net) => (
                                    <button
                                        key={net}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, crypto_network: net });
                                            generateDisplayName('usdt', '', net, isCustomName, 'international');
                                        }}
                                        className={`flex-1 py-3 text-xs font-semibold uppercase rounded-xl border transition-all ${
                                            formData.crypto_network === net
                                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {net}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Wallet Address *</label>
                            <input
                                required
                                name="account_number"
                                onChange={handleInputChange}
                                value={formData.account_number}
                                type="text"
                                placeholder={`Enter ${formData.crypto_network.toUpperCase()} Address`}
                                className={`${inputClass} font-mono text-sm`}
                            />
                        </div>
                    </div>
                )}

                {provider === 'binance' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Binance Pay ID / Email *</label>
                            <input
                                required
                                name="account_number"
                                onChange={handleInputChange}
                                value={formData.account_number}
                                type="text"
                                placeholder="Pay ID or Email"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name *</label>
                            <input
                                required
                                name="account_name"
                                onChange={handleInputChange}
                                value={formData.account_name}
                                type="text"
                                placeholder="Name on Binance"
                                className={inputClass}
                            />
                        </div>
                        <div className="p-5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-4">
                            <p className="text-xs font-medium text-slate-800 flex gap-2">
                                <ShieldCheck size={18} className="shrink-0 text-yellow-600" />
                                <span>
                                    <b>API Settings:</b> Binance API.<br />
                                    <span className="text-[11px] font-normal text-slate-500">(Leave blank if unchanged)</span>
                                </span>
                            </p>
                            <div>
                                <label className={labelClass}>API Key {editingId ? '' : '*'}</label>
                                <input
                                    required={!editingId}
                                    name="api_key"
                                    onChange={handleInputChange}
                                    value={formData.api_key}
                                    type="text"
                                    placeholder="API Key"
                                    className={`${inputClass} font-mono text-xs`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Secret Key {editingId ? '' : '*'}</label>
                                <input
                                    required={!editingId}
                                    name="secret_key"
                                    onChange={handleInputChange}
                                    value={formData.secret_key}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`${inputClass} font-mono tracking-widest`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {provider && provider !== 'usdt' && provider !== 'binance' && (
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Account ID / Email *</label>
                            <input
                                required
                                name="account_number"
                                onChange={handleInputChange}
                                value={formData.account_number}
                                type="text"
                                placeholder="e.g. U1234567"
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Account Name *</label>
                            <input
                                required
                                name="account_name"
                                onChange={handleInputChange}
                                value={formData.account_name}
                                type="text"
                                placeholder="Name"
                                className={inputClass}
                            />
                        </div>
                        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                            <p className="text-xs font-medium text-slate-800 flex gap-2">
                                <ShieldCheck size={18} className="shrink-0 text-blue-500" />
                                <span>
                                    <b>IMAP Settings:</b><br />
                                    <span className="text-[11px] font-normal text-slate-500">(Leave blank if unchanged)</span>
                                </span>
                            </p>
                            <div>
                                <label className={labelClass}>Your Email *</label>
                                <input
                                    required={!editingId}
                                    name="imap_email"
                                    onChange={handleInputChange}
                                    value={formData.imap_email}
                                    type="email"
                                    placeholder="you@gmail.com"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>App Password {editingId ? '' : '*'}</label>
                                <input
                                    required={!editingId}
                                    name="imap_password"
                                    onChange={handleInputChange}
                                    value={formData.imap_password}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`${inputClass} font-mono tracking-widest`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Company Sender Email *</label>
                                <input
                                    required={!editingId}
                                    name="imap_bank_email"
                                    onChange={handleInputChange}
                                    value={formData.imap_bank_email}
                                    type="email"
                                    placeholder="noreply@provider.com"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {provider && renderDisplayNamePicker(suggestions)}
            </div>
        );
    };

    // ── Loading / No Business States ───────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (!businessId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Building2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">No Workspace Selected</h2>
                <p className="text-slate-500 mt-2 font-medium">Please select a business from the sidebar.</p>
            </div>
        );
    }

    // ── Main Render ────────────────────────────────────────────────────────────

    return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen bg-[#F4F7F9] font-sans">
            <Toaster position="top-center" richColors />

            {/* ── Header ── */}
            <div className="flex flex-row items-center justify-between gap-3 mb-8">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight truncate">
                        Gateway Manager
                    </h1>
                    <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 md:mt-1.5 font-medium truncate">
                        Manage receiving methods.
                    </p>
                </div>
                <button
                    onClick={() => setIsChoiceModalOpen(true)}
                    className="shrink-0 bg-[#0D47A1] hover:bg-blue-800 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-xs md:text-base"
                >
                    <Plus size={18} />
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
                        <div
                            key={gw.id}
                            className={`relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col overflow-hidden z-0 ${
                                !gw.is_active ? 'opacity-60 grayscale hover:opacity-80' : ''
                            }`}
                        >
                            <div className="relative mb-5 w-full min-h-[48px] pr-[60px]">
                                <div className="flex items-center gap-3 w-full overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 shadow-sm z-10">
                                        <img
                                            src={getLogo(gw.provider)}
                                            alt="logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 z-10">
                                        <h3 className="text-base font-bold text-slate-900 leading-tight flex flex-wrap items-center gap-1.5">
                                            <span className="truncate capitalize">{getDisplayName(gw.provider)}</span>
                                            {gw.account_type && (
                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 border border-slate-200">
                                                    {gw.account_type}
                                                </span>
                                            )}
                                        </h3>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                                    <button
                                        onClick={() => handleToggle(gw.id, gw.is_active)}
                                        className={`relative inline-flex h-[30px] w-[52px] cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                                            gw.is_active ? 'bg-[#34C759]' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span className={`inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                                            gw.is_active ? 'translate-x-[24px]' : 'translate-x-[2px]'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 z-10">
                                <p className="text-sm font-mono font-semibold text-slate-800 tracking-wide">
                                    {maskedNumber}
                                </p>
                                {gw.account_name && (
                                    <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                                        {gw.account_name}
                                    </p>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Limits</span>
                                    <span className="text-xs font-semibold text-slate-700 mt-0.5">{displayLimit}</span>
                                </div>

                                <div className="flex gap-1.5 flex-wrap justify-end items-center">
                                    {gw.has_discount && (
                                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Tag size={10} /> {gw.discount_percent}% OFF
                                        </div>
                                    )}
                                    {(gw.fixed_charge || gw.percent_charge) && (
                                        <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <DollarSign size={10} /> FEE{' '}
                                            {gw.percent_charge ? `${gw.percent_charge}%` : ''}
                                            {gw.percent_charge && gw.fixed_charge ? ' + ' : ''}
                                            {gw.fixed_charge ? `${gw.fixed_charge}${gw.category === 'international' ? '$' : '৳'}` : ''}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => handleEdit(gw)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all bg-white"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(gw.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all bg-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {gateways.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-60 bg-white rounded-[30px] border border-slate-200 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                            <ShieldCheck size={36} className="text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">No Gateways Found</h3>
                        <p className="text-slate-500 mt-2 max-w-sm font-medium">
                            You haven't added any payment methods yet. Click the button above to start accepting payments.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Choice Modal (White Mode Base44 Style) ── */}
            {isChoiceModalOpen && (
                <div
                    className={`fixed inset-0 z-[60] flex ${isMobile ? 'items-end' : 'items-center'} justify-center ${isMobile ? 'p-0' : 'p-4'} bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300`}
                    onClick={() => setIsChoiceModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-white w-full md:w-[420px] ${isMobile ? 'rounded-t-[24px]' : 'rounded-3xl'} shadow-xl animate-in ${isMobile ? 'slide-in-from-bottom-10' : 'zoom-in-95'} flex flex-col overflow-hidden`}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800">Add Gateway</h2>
                            <button
                                onClick={() => setIsChoiceModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <button
                                onClick={() => { setIsChoiceModalOpen(false); setIsVaultModalOpen(true); }}
                                className="w-full bg-white border border-slate-200 hover:border-blue-300 transition-all p-4 rounded-xl flex items-center gap-4 text-left"
                            >
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                    <Archive size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800 text-sm">Import from Vault</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Use master credentials</p>
                                </div>
                                <ArrowRight size={18} className="text-slate-300" />
                            </button>

                            <button
                                onClick={() => { setIsChoiceModalOpen(false); handleTabSwitch('mobile'); setIsModalOpen(true); }}
                                className="w-full bg-white border border-slate-200 hover:border-emerald-300 transition-all p-4 rounded-xl flex items-center gap-4 text-left"
                            >
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                    <Plus size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800 text-sm">Create New</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Setup manually</p>
                                </div>
                                <ArrowRight size={18} className="text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Vault Import Modal (White Mode Style) ── */}
            {isVaultModalOpen && (
                <div
                    className={`fixed inset-0 z-[60] flex ${isMobile ? 'items-end' : 'items-center'} justify-center ${isMobile ? 'p-0' : 'p-4'} bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300`}
                    onClick={() => setIsVaultModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-white w-full md:w-[500px] ${isMobile ? 'h-[85vh] rounded-t-[24px]' : 'h-auto max-h-[85vh] rounded-3xl'} shadow-xl animate-in ${isMobile ? 'slide-in-from-bottom-10' : 'zoom-in-95'} flex flex-col overflow-hidden`}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">Vault Assets</h2>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">Select gateways to import</p>
                            </div>
                            <button
                                onClick={() => setIsVaultModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-slate-50/50">
                            {vaultGateways.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <Archive size={32} className="mx-auto opacity-50 mb-3" />
                                    <p className="text-sm">Your vault is empty.</p>
                                </div>
                            ) : (
                                vaultGateways.map((gw) => {
                                    const isAdded    = gateways.some((g) => g.vault_gateway_id === gw.id);
                                    const isSelected = selectedVaultItems.includes(gw.id);

                                    return (
                                        <div
                                            key={gw.id}
                                            onClick={() => !isAdded && toggleVaultSelection(gw.id)}
                                            className={`relative flex items-center p-4 bg-white border rounded-xl transition-all shadow-sm ${
                                                isAdded
                                                    ? 'border-slate-100 opacity-50 grayscale cursor-not-allowed'
                                                    : isSelected
                                                        ? 'border-blue-500 bg-blue-50/50 cursor-pointer ring-1 ring-blue-500'
                                                        : 'border-slate-200 hover:border-blue-300 cursor-pointer'
                                            }`}
                                        >
                                            {isAdded && (
                                                <span className="absolute top-2 right-3 text-slate-400 text-[10px] font-semibold bg-slate-100 px-2 py-1 rounded">
                                                    Added
                                                </span>
                                            )}
                                            {!isAdded && gw.account_type && (
                                                <span className="absolute top-2 right-3 text-blue-600 bg-blue-50 text-[10px] font-semibold px-2 py-1 rounded capitalize">
                                                    {gw.account_type}
                                                </span>
                                            )}
                                            {!isAdded && (
                                                <div className={`w-5 h-5 shrink-0 rounded border mr-4 flex items-center justify-center transition-colors ${
                                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                            )}
                                            <div className={`w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-lg p-2 flex items-center justify-center ${!isAdded && 'mr-4'}`}>
                                                <img src={getLogo(gw.provider)} alt="logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-semibold text-[14px] text-slate-800 capitalize truncate">
                                                    {gw.display_name || getDisplayName(gw.provider)}
                                                </h4>
                                                <p className="text-[12px] text-slate-500 mt-0.5 font-mono">
                                                    {formatMaskedAccount(gw.account_number)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsVaultModalOpen(false)}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={selectedVaultItems.length > 0 ? handleBulkImport : undefined}
                                disabled={selectedVaultItems.length === 0 || isImporting}
                                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                                    selectedVaultItems.length > 0
                                        ? 'bg-[#3B82F6] text-white hover:bg-blue-600 shadow-sm'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isImporting ? <Loader2 className="animate-spin" size={16} /> : `Import (${selectedVaultItems.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Form Modal (White Mode Base44 Style) ── */}
            {isModalOpen && (
                <div
                    className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center ${isMobile ? 'p-0' : 'p-4'} bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300`}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-white w-full md:w-[500px] ${isMobile ? 'h-[92vh] rounded-t-[24px]' : 'max-h-[90vh] rounded-3xl'} flex flex-col shadow-xl animate-in ${isMobile ? 'slide-in-from-bottom-10' : 'zoom-in-95'} overflow-hidden relative`}
                    >
                        <div className="shrink-0 flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white z-10">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {editingId ? 'Edit Onboarding Plan' : 'Create Onboarding Plan'} 
                            </h2>
                            <button
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!editingId && (
                            <div className="px-6 pt-4 pb-2 bg-white shrink-0 z-10">
                                <div className="flex bg-slate-100/80 p-1 rounded-xl">
                                    {[
                                        { id: 'mobile', label: 'Mobile' },
                                        { id: 'bank',   label: 'Bank'   },
                                        { id: 'international', label: 'Intl.'  },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabSwitch(tab.id)}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-white text-slate-800 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-white">
                            <form id="gatewayForm" onSubmit={handleSave} className="space-y-5 pb-4">
                                {activeTab === 'mobile'        && renderMobileInputs()}
                                {activeTab === 'bank'          && renderBankInputs()}
                                {activeTab === 'international' && renderIntlInputs()}

                                {provider && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-slate-100">
                                            <div>
                                                <label className={labelClass}>Start Date</label>
                                                <input
                                                    required
                                                    name="min_amount"
                                                    onChange={handleInputChange}
                                                    value={formData.min_amount}
                                                    type="number"
                                                    placeholder="e.g. 10"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Target Date</label>
                                                <input
                                                    required={activeTab !== 'international'}
                                                    name="max_amount"
                                                    onChange={handleInputChange}
                                                    value={formData.max_amount}
                                                    type="number"
                                                    placeholder="Unlimited"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                        {renderChargeSection()}
                                        {renderDiscountSection()}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* White Footer matching Base44 screenshot */}
                        <div className="p-5 bg-slate-50/50 shrink-0 border-t border-slate-100 flex justify-end gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                form="gatewayForm"
                                type="submit"
                                disabled={isSaving || !provider}
                                className="px-5 py-2.5 bg-[#3B82F6] text-white text-sm font-medium rounded-xl transition-all flex justify-center items-center gap-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : (editingId ? 'Update Plan' : 'Create Plan')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar         { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track   { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb   { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
}