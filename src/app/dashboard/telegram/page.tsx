'use client';

import { useRouter } from 'next/navigation';
import { Send, Plus, ArrowLeft, Bot, Zap, Shield } from 'lucide-react';

export default function GlobalTelegramPage() {
    const router = useRouter();

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F9FAFB] dark:bg-[#030712]">
            <div className="flex items-center gap-4 mb-12">
                <button onClick={() => router.push('/dashboard/vault')} className="p-3.5 bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 rounded-2xl"><ArrowLeft size={24}/></button>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3"><Send className="text-sky-500"/> Master Bots</h1>
            </div>

            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[45px] p-10 md:p-16 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-bl-full -z-0" />
                <div className="w-24 h-24 bg-sky-50 dark:bg-sky-900/20 rounded-[35px] flex items-center justify-center mx-auto mb-8 text-sky-500 shadow-inner">
                    <Bot size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Unified Bot System</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-10">Configure a master Telegram bot that serves as the notification backbone for all business instances.</p>
                <button className="bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-[25px] font-black shadow-2xl active:scale-95 transition-all">
                    CREATE GLOBAL BOT
                </button>
            </div>
        </div>
    );
}