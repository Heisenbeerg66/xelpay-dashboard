'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, Unlink, X } from 'lucide-react';
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

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const [res, botRes] = await Promise.all([getMerchantVaultSettings(), getTelegramBotUsername()]);
        if (res.success) setMerchantData(res.data);
        if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
        setLoading(false);
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        // Logical call is same, assuming backend provides 12-digit key now
        const res = await generateTelegramCode();
        if (res.success) {
            setMerchantData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
            toast.success("New 12-Digit Code Generated!");
        } else {
            toast.error("Failed to generate code.");
        }
        setGenerating(false);
    };

    const handleUnlink = async () => {
        if (!confirm("Are you sure you want to unlink?")) return;
        setUnlinking(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth error");
            const { error } = await supabase.from('merchants').update({ telegram_chat_id: null, bot_connection_status: false }).eq('id', user.id);
            if (error) throw error;
            toast.success("Telegram unlinked.");
            setMerchantData((prev: any) => ({ ...prev, telegram_chat_id: null, bot_connection_status: false }));
        } catch (error: any) { toast.error(error.message); } 
        finally { setUnlinking(false); }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Vault</p>
        </div>
    );

    const isConnected = !!merchantData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${merchantData?.telegram_link_code || ''}`;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 shrink-0">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">Master Telegram</h1>
                        <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-wider">Global Notification Node</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center py-6">
                <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className={`p-8 md:p-12 text-center ${isConnected ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 text-white border border-white/30">
                            {isConnected ? <CheckCircle2 size={36} strokeWidth={2.5} /> : <Bot size={36} strokeWidth={2} />}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            {isConnected ? 'Alert System Online' : 'Bot Connection Required'}
                        </h2>
                    </div>

                    <div className="p-8 md:p-14 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                            {isConnected 
                                ? 'Real-time notifications are actively being sent to your secured Telegram account.' 
                                : 'Link our official secure bot to receive instant transaction alerts across all business instances.'}
                        </p>

                        {isConnected ? (
                            <div className="space-y-6 animate-in zoom-in-95">
                                <div className="p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered ID</p>
                                        <p className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                                            {merchantData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}
                                        </p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <button onClick={handleUnlink} disabled={unlinking} className="w-full py-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">
                                    {unlinking ? <Loader2 className="animate-spin inline mr-2" /> : <Unlink className="inline mr-2" size={16}/>} Unlink Telegram
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {merchantData?.telegram_link_code && (
                                    <div className="w-full p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 font-mono text-[13px] text-blue-600 dark:text-blue-400 break-all select-all shadow-inner">
                                        {telegramLink}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleGenerateCode} disabled={generating} className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                                        {generating ? 'Wait...' : 'Regenerate Code'}
                                    </button>
                                    <a href={telegramLink} target="_blank" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={16} strokeWidth={2.5} /> Link Telegram
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}