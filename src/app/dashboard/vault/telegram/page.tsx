'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getMerchantVaultSettings, generateTelegramCode, getTelegramBotUsername } from '@/lib/vault_actions';

export default function MasterTelegramPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
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
        const res = await generateTelegramCode();
        if (res.success) {
            toast.success("New Telegram Link Generated!");
            setMerchantData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
        } else {
            toast.error("Failed to generate code.");
        }
        setGenerating(false);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    const isConnected = !!merchantData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${merchantData?.telegram_link_code || ''}`;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/vault')} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Send className="text-blue-500" size={24} /> Master Telegram
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Global alert notification system.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl">
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                    {/* Status Banner */}
                    <div className={`p-5 border-b flex items-center gap-4 ${isConnected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-[#0B1120] border-slate-100 dark:border-slate-800'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isConnected ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-blue-500 border border-slate-200 dark:border-slate-700'}`}>
                            {isConnected ? <CheckCircle2 size={24} /> : <Bot size={24} />}
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">{isConnected ? 'Bot Connected & Active' : 'Not Connected'}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{isConnected ? 'Notifications are being sent to your Telegram.' : 'Link our official bot to receive instant transaction alerts.'}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {isConnected ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Chat ID</p>
                                        <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{merchantData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}</p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={28} />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={() => { /* unlink */ }} className="px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl text-sm font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/20">
                                        Unlink Telegram
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-slate-600 dark:text-slate-300 font-medium mb-6 max-w-md text-sm leading-relaxed">Click below to generate a unique secure link. Opening this link in Telegram will automatically pair your account with our master bot.</p>

                                {!merchantData?.telegram_link_code ? (
                                    <button onClick={handleGenerateCode} disabled={generating} className="bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 active:scale-95 text-sm">
                                        {generating ? <Loader2 className="animate-spin" size={18} /> : <><RefreshCw size={18} /> Generate Connect Link</>}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-500 dark:text-slate-400 break-all text-left">
                                            {telegramLink}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                            <button onClick={handleGenerateCode} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm transition-all">
                                                Regenerate Link
                                            </button>
                                            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="bg-[#0D47A1] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                                                <ExternalLink size={16} /> Open in Telegram
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