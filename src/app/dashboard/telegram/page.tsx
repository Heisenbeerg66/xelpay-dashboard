'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, DownloadCloud, Building2, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getBusinessSettings, generateBusinessTelegramCode, importVaultTelegramToBusiness, getVaultDataForImport } from '@/lib/business_actions';

export default function BusinessTelegramPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessData, setBusinessData] = useState<any>(null);

    // Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [vaultData, setVaultData] = useState<any>(null);

    const OFFICIAL_BOT_USERNAME = "YourOfficialBotUsername"; // Bot username

    const fetchBusinessData = async (id: string) => {
        setLoading(true);
        const res = await getBusinessSettings(id);
        if (res.success) setBusinessData(res.data);
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] dark:bg-[#0B1120]"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    if (!businessId) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] dark:bg-[#0B1120] text-slate-500 font-bold">Please select a Workspace.</div>;

    const isConnected = !!businessData?.telegram_chat_id;
    const telegramLink = `https://t.me/${OFFICIAL_BOT_USERNAME}?start=${businessData?.telegram_link_code || ''}`;

    return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen bg-[#F4F7F9] dark:bg-[#0B1120] font-sans transition-colors duration-300">
            <Toaster position="top-center" richColors />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2">
                            <Send className="text-blue-500 hidden sm:block" size={28}/> Business Telegram
                        </h1>
                        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1.5 font-medium truncate">Workspace alert notification system.</p>
                    </div>
                </div>
                <button onClick={handleOpenImportModal} disabled={importing} className="w-full md:w-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
                    {importing && !isImportModalOpen ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <DownloadCloud size={18} className="text-blue-500" />}
                    <span>Import Vault</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto mt-10">
                <div className="bg-white dark:bg-[#111827] rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    
                    {/* Status Banner */}
                    <div className={`p-6 border-b ${isConnected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-[#0B1120] border-slate-100 dark:border-slate-800'} flex items-center gap-4`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${isConnected ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-blue-500 border border-slate-200 dark:border-slate-700'}`}>
                            {isConnected ? <CheckCircle2 size={28} /> : <Bot size={28} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{isConnected ? 'Bot Connected & Active' : 'Not Connected'}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isConnected ? 'Notifications are being sent to your Telegram.' : 'Link our official bot to receive instant transaction alerts.'}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {isConnected ? (
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Chat ID</p>
                                        <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{businessData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}</p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <button className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl text-sm font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/20">
                                    Unlink Telegram
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-slate-600 dark:text-slate-300 font-medium mb-8 max-w-md">Click the button below to generate a unique secure link. Opening this link in Telegram will automatically pair your account.</p>
                                
                                {!businessData?.telegram_link_code ? (
                                    <button onClick={handleGenerateCode} disabled={generating} className="bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black shadow-xl shadow-blue-900/20 transition-all flex items-center gap-2 active:scale-95">
                                        {generating ? <Loader2 className="animate-spin" size={20}/> : <><RefreshCw size={20}/> Generate Connect Link</>}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-6 animate-in fade-in zoom-in-95">
                                        <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-500 dark:text-slate-400 break-all">
                                            {telegramLink}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                                                <ExternalLink size={20}/> Open in Telegram
                                            </a>
                                            <button onClick={handleGenerateCode} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold transition-all">
                                                Regenerate Link
                                            </button>
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
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300" onClick={() => setIsImportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full md:w-[420px] rounded-t-[36px] md:rounded-[36px] shadow-2xl animate-in slide-in-from-bottom-10 border border-white/10 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800/60">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Import Telegram</h2>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[2px] mt-1">From Vault</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-2.5 bg-slate-100 dark:bg-[#0B1120] rounded-full text-slate-500 active:scale-90 transition-all hover:text-slate-800 dark:hover:text-white"><X size={20} strokeWidth={2.5}/></button>
                        </div>
                        <div className="p-8 flex flex-col gap-4">
                            <div className="bg-slate-50 dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                <Bot size={32} className="mx-auto text-blue-500 mb-3" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Connected Chat ID</p>
                                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{vaultData.chat_id}</p>
                            </div>
                            <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-[18px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                                {importing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18}/> Confirm & Import</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}