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

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center bg-[#F4F7F9] dark:bg-[#0B1120]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    const isConnected = !!merchantData?.telegram_chat_id;
    const telegramLink = `https://t.me/${botUsername}?start=${merchantData?.telegram_link_code || ''}`;

    return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen bg-[#F4F7F9] dark:bg-[#0B1120] font-sans transition-colors duration-300">
            <Toaster position="top-center" richColors />
            
            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-3 mb-8">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/vault')} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2"><Send className="text-blue-500" size={28}/> Master Telegram</h1>
                        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1.5 font-medium truncate">Global alert notification system.</p>
                    </div>
                </div>
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
                                        <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{merchantData.telegram_chat_id.replace(/.(?=.{4})/g, '*')}</p>
                                    </div>
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <button onClick={() => { /* Option to disconnect/unlink if needed */ }} className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl text-sm font-bold transition-all hover:bg-red-100 dark:hover:bg-red-900/20">
                                    Unlink Telegram
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <p className="text-slate-600 dark:text-slate-300 font-medium mb-8 max-w-md">Click the button below to generate a unique secure link. Opening this link in Telegram will automatically pair your account with our master bot.</p>
                                
                                {!merchantData?.telegram_link_code ? (
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
        </div>
    );
}