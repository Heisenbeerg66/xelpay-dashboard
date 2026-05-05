'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, DownloadCloud, X, Unlink, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getBusinessSettings, generateBusinessTelegramCode, importVaultTelegramToBusiness, getVaultDataForImport, getTelegramBotUsername } from '@/lib/business_actions';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BusinessTelegramPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [unlinking, setUnlinking] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessData, setBusinessData] = useState<any>(null);
    const [botUsername, setBotUsername] = useState<string>('xelpay_alert_bot');

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [vaultData, setVaultData] = useState<any>(null);

    const fetchBusinessData = async (id: string) => {
        setLoading(true);
        const [res, botRes] = await Promise.all([getBusinessSettings(id), getTelegramBotUsername()]);
        if (res.success) setBusinessData(res.data);
        if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
        setLoading(false);
    };

    useEffect(() => {
        const loadActiveBusiness = () => {
            const activeId = localStorage.getItem('active_business_id');
            if (activeId) { setBusinessId(activeId); fetchBusinessData(activeId); } else { setLoading(false); }
        };
        loadActiveBusiness();
        window.addEventListener('businessChanged', loadActiveBusiness);
        return () => window.removeEventListener('businessChanged', loadActiveBusiness);
    }, []);

    const handleGenerateCode = async () => {
        if (!businessId) return;
        setGenerating(true);
        // Logical call remains original
        const res = await generateBusinessTelegramCode(businessId);
        if (res.success) {
            toast.success("New 12-Digit Code Generated!");
            setBusinessData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
        } else { toast.error("Failed to generate code."); }
        setGenerating(false);
    };

    const handleOpenImportModal = async () => {
        setImporting(true);
        const res = await getVaultDataForImport('telegram');
        if (res.success) { setVaultData(res.data); setIsImportModalOpen(true); } else { toast.error(res.message); }
        setImporting(false);
    };

    const handleConfirmImport = async () => {
        if (!businessId) return;
        setImporting(true);
        const res = await importVaultTelegramToBusiness(businessId);
        if (res.success) { toast.success(res.message); fetchBusinessData(businessId); setIsImportModalOpen(false); } 
        else { toast.error(res.message); }
        setImporting(false);
    };

    const handleUnlink = async () => {
        if (!businessId || !confirm("Unlink this Telegram account?")) return;
        setUnlinking(true);
        try {
            const { error } = await supabase.from('businesses').update({ telegram_chat_id: null, is_telegram_enabled: false }).eq('id', businessId);
            if (error) throw error;
            toast.success("Unlinked successfully.");
            setBusinessData((prev: any) => ({ ...prev, telegram_chat_id: null, is_telegram_enabled: false }));
        } catch (error: any) { toast.error(error.message); } 
        finally { setUnlinking(false); }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-4" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Settings</p>
        </div>
    );
    if (!businessId) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Select Workspace</div>;

    const isConnected = !!businessData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${businessData?.telegram_link_code || ''}`;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3 justify-center md:justify-start text-center md:text-left">
                    <button onClick={() => router.back()} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 shrink-0">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">Business Telegram</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Workspace Alert Node</p>
                    </div>
                </div>
                <button onClick={handleOpenImportModal} disabled={importing} className="w-full md:w-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50">
                    {importing && !isImportModalOpen ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <DownloadCloud size={16} className="text-blue-500" />}
                    Import Vault
                </button>
            </div>

            <div className="flex justify-center py-6">
                <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className={`p-8 md:p-12 text-center ${isConnected ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 text-white border border-white/30">
                            {isConnected ? <CheckCircle2 size={36} strokeWidth={2.5} /> : <Bot size={36} strokeWidth={2} />}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            {isConnected ? 'Alerts Connected' : 'Bot Setup Pending'}
                        </h2>
                    </div>

                    <div className="p-8 md:p-14 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                            {isConnected ? 'Real-time workspace notifications are actively being sent to your Telegram.' : 'Link our bot to receive instant transaction alerts for this specific workspace.'}
                        </p>

                        {isConnected ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Workspace Chat ID</p>
                                        <p className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                                            {businessData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}
                                        </p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <button onClick={handleUnlink} disabled={unlinking} className="w-full py-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                                    {unlinking ? <Loader2 className="animate-spin inline mr-2" /> : <Unlink className="inline mr-2" size={16}/>} Unlink Workspace
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {businessData?.telegram_link_code && (
                                    <div className="w-full p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 font-mono text-[13px] text-blue-600 dark:text-blue-400 break-all select-all shadow-inner text-left">
                                        {telegramLink}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleGenerateCode} disabled={generating} className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                                        {generating ? 'Wait...' : 'Regenerate Code'}
                                    </button>
                                    <a href={telegramLink} target="_blank" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={16} strokeWidth={2.5} /> Open Bot
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {isImportModalOpen && vaultData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsImportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Alert Bot</h2>
                            <button onClick={() => setIsImportModalOpen(false)}><X size={18}/></button>
                        </div>
                        <div className="p-8 text-center">
                            <Bot size={40} className="mx-auto text-blue-500 mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Chat ID</p>
                            <p className="text-xl font-black text-blue-600 dark:text-blue-400 mb-8">{vaultData.chat_id}</p>
                            <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                {importing ? <Loader2 className="animate-spin inline" /> : <><CheckCircle2 className="inline mr-2" size={16}/> Confirm Import</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}