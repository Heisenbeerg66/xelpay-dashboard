'use client';

import Link from 'next/link';
import { Wallet, Send, Smartphone, ArrowRight, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function GlobalVaultPage() {
  const vaultModules = [
    {
      id: 'gateways',
      title: 'Gateway Manager',
      desc: 'Centralize your bKash, Bank, and Crypto credentials securely.',
      icon: Wallet,
      path: '/dashboard/vault/gateways',
      accent: '#2563EB',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      iconBg: 'bg-blue-600',
      border: 'border-blue-100 dark:border-blue-500/20',
      tag: 'Master Access',
      tagColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    },
    {
      id: 'devices',
      title: 'Master Devices',
      desc: 'Manage Android devices for SMS parsing and transaction automation.',
      icon: Smartphone,
      path: '/dashboard/vault/devices',
      accent: '#059669',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconBg: 'bg-emerald-600',
      border: 'border-emerald-100 dark:border-emerald-500/20',
      tag: 'Device Cloud',
      tagColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      id: 'telegram',
      title: 'Master Telegram',
      desc: 'Configure unified Telegram bots for global alerting across all businesses.',
      icon: Send,
      path: '/dashboard/vault/telegram',
      accent: '#0284C7',
      bg: 'bg-sky-50 dark:bg-sky-500/10',
      iconBg: 'bg-sky-600',
      border: 'border-sky-100 dark:border-sky-500/20',
      tag: 'Bot Matrix',
      tagColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    },
  ];

  return (
    <div className="w-full space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 shadow-xl">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full -translate-y-20 translate-x-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-400 rounded-full translate-y-20 -translate-x-10 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 shrink-0">
            <Lock size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Global Vault
              </h1>
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">
                <ShieldCheck size={12} /> Secure
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
              Your merchant-level repository. Store master credentials securely and deploy them across all business workspaces.
            </p>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {vaultModules.map((mod) => (
          <Link
            key={mod.id}
            href={mod.path}
            className={`group bg-white dark:bg-[#111827] border ${mod.border} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-5`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 ${mod.iconBg} rounded-xl shadow-md shrink-0`}>
                <mod.icon size={22} className="text-white" strokeWidth={2} />
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${mod.tagColor}`}>
                {mod.tag}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">{mod.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{mod.desc}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest" style={{ color: mod.accent }}>
              <span>Manage</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-5 py-4">
        <ShieldCheck size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-0.5">Vault Security</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">All vault data is encrypted with AES-256. Credentials stored here are only accessible by you and can be deployed to business workspaces securely.</p>
        </div>
      </div>
    </div>
  );
}