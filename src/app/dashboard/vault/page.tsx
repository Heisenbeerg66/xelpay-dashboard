'use client';

import Link from 'next/link';
import { Wallet, Send, Smartphone, ArrowRight, Lock, Boxes } from 'lucide-react';

export default function GlobalVaultPage() {
    const vaultModules = [
        {
            id: 'gateways',
            title: 'Gateway Manager',
            desktopDesc: 'Centralize your bKash, Bank, and Crypto credentials. Secure master storage.',
            mobileDesc: 'Master payment credentials.',
            icon: Wallet,
            path: '/dashboard/vault/gateways',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            status: 'Master Access'
        },
        {
            id: 'devices',
            title: 'Master Devices',
            desktopDesc: 'Manage physical Android devices for SMS parsing and transaction automation.',
            mobileDesc: 'SMS automation node.',
            icon: Smartphone,
            path: '/dashboard/vault/devices',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            status: 'Device Cloud'
        },
        {
            id: 'telegram',
            title: 'Master Telegram',
            desktopDesc: 'Configure unified Telegram bots for global alerting across all businesses.',
            mobileDesc: 'Global alert bot system.',
            icon: Send,
            path: '/dashboard/vault/telegram',
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
            status: 'Bot Matrix'
        }
    ];

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Premium Header Card */}
            <div className="relative p-8 md:p-10 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-3 md:mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 shrink-0">
                                <Lock size={22} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="hidden md:block h-6 w-[2px] bg-slate-700" />
                            <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tight">
                                Global <span className="text-blue-500">Vault</span>
                            </h1>
                        </div>
                        <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed">
                            <span className="hidden md:inline">Your <span className="text-white">Merchant-Level Repository</span>. Store master credentials here to deploy them securely across multiple business instances.</span>
                            <span className="md:hidden">Secure Merchant Level Repository.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {vaultModules.map((module) => (
                    <Link href={module.path} key={module.id}
                        className="group relative bg-white dark:bg-[#111827] p-5 md:p-7 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 overflow-hidden active:scale-[0.98]">
                        <div className={`w-13 h-13 md:w-14 md:h-14 shrink-0 rounded-[18px] flex items-center justify-center md:mb-8 ${module.bg} ${module.color} border ${module.border} group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                            <module.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
                            <div className="hidden md:flex mb-1.5 items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{module.status}</span>
                                <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            </div>
                            <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white md:mb-2.5 tracking-tight truncate md:whitespace-normal group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate md:hidden">{module.mobileDesc}</p>
                            <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">{module.desktopDesc}</p>
                        </div>

                        <div className="text-slate-300 dark:text-slate-600 md:text-blue-600 group-hover:text-blue-500 font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-all duration-300 flex items-center">
                            <span className="hidden md:inline">Configure</span>
                            <ArrowRight size={18} className="md:w-4 md:h-4 md:ml-2" />
                        </div>
                    </Link>
                ))}

                {/* Infrastructure Card */}
                <div className="md:col-span-3 p-5 md:p-6 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 border-dashed">
                    <div className="p-3 bg-white dark:bg-[#111827] rounded-xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                        <Boxes className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs md:text-base font-black text-slate-900 dark:text-white uppercase md:normal-case">Vault Infrastructure</h4>
                        <p className="text-[10px] md:text-sm text-slate-500 font-medium mt-0.5">All assets are encrypted using AES-256 merchant-key rotation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}