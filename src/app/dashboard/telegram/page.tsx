'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, DownloadCloud, X, Unlink } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getBusinessSettings, generateBusinessTelegramCode, importVaultTelegramToBusiness, getVaultDataForImport, getTelegramBotUsername } from '@/lib/business_actions';
import { supabase } from '@/lib/supabase'; // Imported for unlink logic

export default function BusinessTelegramPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [unlinking, setUnlinking] = useState(false); // New state for unlink
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessData, setBusinessData] = useState<any>(null);
    const [botUsername, setBotUsername] = useState<string>('xelpay_alert_bot');

    // Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [vaultData, setVaultData] = useState<any>(null);

    const fetchBusinessData = async (id: string) => {
        setLoading(true);
        const [res, botRes] = await Promise.all([
            getBusinessSettings(id),
            getTelegramBotUsername()
        ]);
        
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
        const res = await generateBusinessTelegramCode(businessId);
        if (res.success) {
            toast.success("New Telegram Link Generated!");
            setBusinessData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
        } else { toast.error("Failed to generate code."); }
        setGenerating(false);
    };

    const handleOpenImportModal = async () => {
        setImporting(true);
        const res = await getVaultDataForImport('telegram');
        if (res.success) {
            setVaultData(res.data);
            setIsImportModalOpen(true);
        } else {
            toast.error(res.message);
        }
        setImporting(false);
    };

    const handleConfirmImport = async () => {
        if (!businessId) return;
        setImporting(true);
        const res = await importVaultTelegramToBusiness(businessId);
        if (res.success) { 
            toast.success(res.message); 
            fetchBusinessData(businessId); 
            setIsImportModalOpen(false);
        } else { toast.error(res.message); }
        setImporting(false);
    };

    // New Unlink Logic
    const handleUnlink = async () => {
        if (!businessId) return;
        if (!confirm("Are you sure you want to unlink Telegram? You will stop receiving automated alerts for this workspace.")) return;
        
        setUnlinking(true);
        try {
            const { error } = await supabase
                .from('businesses')
                .update({ 
                    telegram_chat_id: null, 
                    is_telegram_enabled: false 
                })
                .eq('id', businessId);

            if (error) throw error;

            toast.success("Telegram unlinked successfully.");
            setBusinessData((prev: any) => ({ ...prev, telegram_chat_id: null, is_telegram_enabled: false }));
        } catch (error: any) {
            toast.error(error.message || "Failed to unlink Telegram account.");
        } finally {
            setUnlinking(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={36} strokeWidth={2.5} />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Settings</p>
        </div>
    );
    if (!businessId) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold">Please select a Workspace.</div>;

    const isConnected = !!businessData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${businessData?.telegram_link_code || ''}`;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Send className="text-blue-500 hidden sm:block" size={26}/> Business Telegram
                        </h1>
                        <p className="text-[12px] md:text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Workspace alert notification system.</p>
                    </div>
                </div>
                <button onClick={handleOpenImportModal} disabled={importing} className="w-full md:w-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm text-sm">
                    {importing && !isImportModalOpen ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <DownloadCloud size={16} className="text-blue-500" />}
                    <span>Import Vault</span>
                </button>
            </div>

            {/* Content */}
            <div className="max-w-3xl">
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    
                    {/* Status Banner */}
                    <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center gap-5 ${isConnected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-[#0B1120] border-slate-100 dark:border-slate-800'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isConnected ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-500 border border-slate-200 dark:border-slate-700'}`}>
                            {isConnected ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Bot size={28} strokeWidth={2} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{isConnected ? 'Bot Connected & Active' : 'Not Connected'}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">{isConnected ? 'Real-time notifications are actively being sent to your Telegram.' : 'Link our official bot to receive instant transaction alerts.'}</p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {isConnected ? (
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-inner">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registered Chat ID</p>
                                        <p className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                                            {businessData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}
                                        </p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} strokeWidth={2} />
                                </div>
                                <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
                                    <button 
                                        onClick={handleUnlink} 
                                        disabled={unlinking}
                                        className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {unlinking ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />} 
                                        Unlink Telegram
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 max-w-lg text-sm leading-relaxed">
                                    Click the button below to generate a unique secure link. Opening this link in Telegram will automatically pair your account with our business bot.
                                </p>
                                
                                {!businessData?.telegram_link_code ? (
                                    <button onClick={handleGenerateCode} disabled={generating} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                                        {generating ? <Loader2 className="animate-spin" size={18}/> : <><RefreshCw size={18} strokeWidth={2.5}/> Generate Connect Link</>}
                                    </button>
                                ) : (
                                    <div className="w-full max-w-lg space-y-5 animate-in fade-in zoom-in-95">
                                        <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm font-medium text-slate-600 dark:text-slate-400 break-all text-left shadow-inner">
                                            {telegramLink}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button onClick={handleGenerateCode} disabled={generating} className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2">
                                                {generating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />} Regenerate
                                            </button>
                                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                                                <ExternalLink size={16} strokeWidth={2.5}/> Open Telegram
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* IMPORT MODAL */}
            {isImportModalOpen && vaultData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsImportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Telegram</h2>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[2px] mt-0.5">From Master Vault</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><X size={18} strokeWidth={2.5}/></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 bg-white dark:bg-[#0B1120]">
                            <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                <Bot size={32} className="mx-auto text-blue-500 mb-3" />
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Connected Chat ID</p>
                                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{vaultData.chat_id}</p>
                            </div>
                            <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                                {importing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16}/> Confirm & Import</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}