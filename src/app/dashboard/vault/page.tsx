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
            color: 'text-[#EC4899]', // Original Solid Pink
            status: 'Master Access'
        },
        {
            id: 'devices',
            title: 'Master Devices',
            desktopDesc: 'Manage physical Android devices for SMS parsing and transaction automation.',
            mobileDesc: 'SMS automation node.',
            icon: Smartphone,
            path: '/dashboard/vault/devices',
            color: 'text-[#10B981]', // Original Solid Emerald
            status: 'Device Cloud'
        },
        {
            id: 'telegram',
            title: 'Master Telegram',
            desktopDesc: 'Configure unified Telegram bots for global alerting across all businesses.',
            mobileDesc: 'Global alert bot system.',
            icon: Send,
            path: '/dashboard/vault/telegram',
            color: 'text-[#3B82F6]', // Original Solid Blue
            status: 'Bot Matrix'
        }
    ];

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Header Card */}
            <div className="relative p-6 md:p-10 rounded-2xl bg-slate-900 dark:bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 blur-[60px] rounded-full -ml-10 -mb-10 pointer-events-none" />
                
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
                        Your <strong className="text-slate-200">Merchant-Level Repository</strong>. Store master credentials securely and deploy them across multiple business instances with AES-256 encryption.
                    </p>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {vaultModules.map((module) => (
                    <Link href={module.path} key={module.id} className="group relative bg-white dark:bg-[#111827] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-2xl transition-all duration-300 flex flex-col h-full active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-6">
                            {/* FIXED: No BG color, solid colorful icon */}
                            <div className={`${module.color} group-hover:scale-110 transition-transform duration-500 origin-left`}>
                                <module.icon size={36} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0 ml-4">
                                {module.status}
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg md:text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium md:hidden leading-relaxed">{module.mobileDesc}</p>
                            <p className="hidden md:block text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">{module.desktopDesc}</p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors">
                            <span>Configure</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}

                {/* Infrastructure Card */}
                <div className="sm:col-span-2 lg:col-span-3 p-5 md:p-6 bg-slate-50 dark:bg-emerald-950/10 rounded-2xl border border-slate-200 dark:border-emerald-900/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#111827] rounded-xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Enterprise-Grade Security</h4>
                        <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium mt-1">All assets and credentials are encrypted using AES-256 merchant-key rotation. Access is strictly audited.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}