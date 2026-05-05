'use client';

import Link from 'next/link';
import { Wallet, Send, Smartphone, ArrowRight, Lock, ShieldCheck } from 'lucide-react';

export default function GlobalVaultPage() {
    const vaultModules = [
        {
            id: 'gateways',
            title: 'Gateway Manager',
            desktopDesc: 'Centralize your bKash, Bank, and Crypto credentials. Secure master storage.',
            mobileDesc: 'Master payment credentials.',
            icon: Wallet,
            path: '/dashboard/vault/gateways',
            color: 'text-blue-600 dark:text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-100 dark:border-blue-500/20',
            status: 'Master Access'
        },
        {
            id: 'devices',
            title: 'Master Devices',
            desktopDesc: 'Manage physical Android devices for SMS parsing and transaction automation.',
            mobileDesc: 'SMS automation node.',
            icon: Smartphone,
            path: '/dashboard/vault/devices',
            color: 'text-emerald-600 dark:text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-100 dark:border-emerald-500/20',
            status: 'Device Cloud'
        },
        {
            id: 'telegram',
            title: 'Master Telegram',
            desktopDesc: 'Configure unified Telegram bots for global alerting across all businesses.',
            mobileDesc: 'Global alert bot system.',
            icon: Send,
            path: '/dashboard/vault/telegram',
            color: 'text-sky-600 dark:text-sky-500',
            bg: 'bg-sky-50 dark:bg-sky-500/10',
            border: 'border-sky-100 dark:border-sky-500/20',
            status: 'Bot Matrix'
        }
    ];

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Header Card */}
            <div className="relative p-6 md:p-10 rounded-2xl bg-slate-900 dark:bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full -ml-10 -mb-10 pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50 shrink-0">
                            <Lock size={22} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="hidden md:block h-6 w-[2px] bg-slate-700" />
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                            Global <span className="text-blue-400">Vault</span>
                        </h1>
                    </div>
                    <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed max-w-2xl">
                        <span className="hidden md:inline">Your <strong className="text-slate-200">Merchant-Level Repository</strong>. Store master credentials securely and deploy them across multiple business instances with AES-256 encryption.</span>
                        <span className="md:hidden">Secure Merchant Level Repository for global credentials.</span>
                    </p>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {vaultModules.map((module) => (
                    <Link href={module.path} key={module.id} className="group relative bg-white dark:bg-[#111827] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col h-full active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${module.bg} ${module.color} border ${module.border} group-hover:scale-110 transition-transform duration-500 shadow-sm origin-left`}>
                                <module.icon size={26} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                {module.status}
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium md:hidden leading-relaxed">{module.mobileDesc}</p>
                            <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">{module.desktopDesc}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors">
                            <span>Configure Module</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}

                {/* Infrastructure Card */}
                <div className="md:col-span-3 p-5 md:p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#111827] rounded-xl shadow-sm shrink-0 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enterprise-Grade Security</h4>
                        <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium mt-1">All assets and credentials are encrypted using AES-256 merchant-key rotation. Access is strictly audited.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}