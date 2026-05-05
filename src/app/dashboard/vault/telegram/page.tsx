'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Retained existing icons
import { Send, ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, Unlink } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getMerchantVaultSettings, generateTelegramCode, getTelegramBotUsername } from '@/lib/vault_actions';
import { supabase } from '@/lib/supabase';

export default function MasterTelegramPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [unlinking, setUnlinking] = useState(false);
    const [merchantData, setMerchantData] = useState<any>(null);
    const [botUsername, setBotUsername] = useState<string>('xelpay_alert_bot');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [res, botRes] = await Promise.all([
            getMerchantVaultSettings(),
            getTelegramBotUsername()
        ]);
        if (res.success) setMerchantData(res.data);
        if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
        setLoading(false);
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        // Logic retained, actions.ts handles 12 complex digits now
        const res = await generateTelegramCode();
        if (res.success) {
            toast.success("New 12-digit Secure Link Generated!");
            setMerchantData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
        } else {
            toast.error("Failed to generate code.");
        }
        setGenerating(false);
    };

    const handleUnlink = async () => {
        if (!confirm("Are you sure you want to unlink Telegram? You will stop receiving automated alerts.")) return;
        
        setUnlinking(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error("Authentication error");

            const { error } = await supabase
                .from('merchants')
                .update({ 
                    telegram_chat_id: null, 
                    bot_connection_status: false 
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Telegram unlinked successfully.");
            setMerchantData((prev: any) => ({ ...prev, telegram_chat_id: null, bot_connection_status: false }));
        } catch (error: any) {
            toast.error(error.message || "Failed to unlink Telegram account.");
        } finally {
            setUnlinking(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={36} strokeWidth={2.5} />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Vault</p>
        </div>
    );

    const isConnected = !!merchantData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${merchantData?.telegram_link_code || ''}`;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            {/* Header - Premium desktop, hidden mobile */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                    {/* FIXED: Back button premium desktop, hidden mobile */}
                    <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 dark:text-slate-400 shrink-0">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                            Master Telegram
                        </h1>
                        <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Global Notification Node</p>
                    </div>
                </div>
            </div>

            {/* Content - improved placement and max width for premium look */}
            <div className="flex justify-center py-4 md:py-8">
                <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    
                    {/* Status Banner */}
                    <div className={`p-8 md:p-12 border-b flex flex-col items-center text-center ${isConnected ? 'bg-emerald-600 border-emerald-700' : 'bg-blue-600 border-blue-700'}`}>
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 mb-6 text-white">
                            {isConnected ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <Bot size={40} strokeWidth={2} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">{isConnected ? 'System Connected' : 'Bot Link Required'}</h2>
                            <p className="text-sm text-blue-100 dark:text-emerald-100 font-medium mt-1.5 max-w-md">{isConnected ? 'Real-time notifications are actively being sent to your secured Telegram account.' : 'Link our official secure bot to receive instant transaction alerts across all business instances.'}</p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {isConnected ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-inner">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Registered Chat ID</p>
                                        <p className="font-mono text-xl font-black text-slate-950 dark:text-white tracking-widest">
                                            {merchantData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}
                                        </p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} strokeWidth={2} />
                                </div>
                                
                                <div className="flex justify-end pt-2">
                                    <button 
                                        onClick={handleUnlink} 
                                        disabled={unlinking}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-red-100 dark:hover:bg-red-950/40 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                                    >
                                        {unlinking ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />} 
                                        Unlink Account
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center space-y-8">
                                <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg text-sm leading-relaxed">
                                    Generate a unique, encrypted pairing link (containing a 12-digit complex code). Opening this link in the Telegram app will automatically authenticate and pair your account with our master bot.
                                </p>

                                {!merchantData?.telegram_link_code ? (
                                    <button onClick={handleGenerateCode} disabled={generating} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        {generating ? <Loader2 className="animate-spin" size={18} /> : <><RefreshCw size={18} strokeWidth={2.5} /> Generate Secure Link</>}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-6 animate-in fade-in zoom-in-95">
                                        {/* Premium Link Box */}
                                        <div className="p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 font-mono text-[13px] font-medium text-blue-600 dark:text-blue-400 break-all text-left shadow-inner select-all">
                                            {telegramLink}
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                                            <button onClick={handleGenerateCode} disabled={generating} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                                                {generating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />} Regenerate
                                            </button>
                                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                                <ExternalLink size={16} strokeWidth={2.5} /> Open Telegram
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}