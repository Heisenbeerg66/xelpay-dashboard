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
            {/* Fixed Premium Adaptive Header Card */}
            <div className="relative p-6 md:p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-blue-500/30" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 blur-[60px] rounded-full -ml-10 -mb-10 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40 shrink-0">
                            <Lock size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Global <span className="text-blue-600 dark:text-blue-400">Vault</span>
                            </h1>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase">Secure Infrastructure</p>
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                        Your <strong className="text-slate-900 dark:text-slate-200">Merchant-Level Repository</strong>. Store master credentials securely and deploy them across multiple business instances with AES-256 encryption.
                    </p>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {vaultModules.map((module) => (
                    <Link href={module.path} key={module.id} className="group relative bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col h-full active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${module.bg} ${module.color} border ${module.border} group-hover:scale-110 transition-transform shadow-sm`}>
                                <module.icon size={26} strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                                {module.status}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{module.desktopDesc}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-[10px] uppercase tracking-widest transition-colors">
                            <span>Configure</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}

                {/* Security Card */}
                <div className="md:col-span-3 p-5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-[#111827] rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Encrypted with AES-256 merchant-key rotation. Access to this vault is strictly audited.</p>
                </div>
            </div>
        </div>
    );
}