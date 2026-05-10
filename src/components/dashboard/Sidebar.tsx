'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Receipt, MessageSquare, Wallet, Link as LinkIcon,
  Settings, LineChart, Send, Users, Code, Headphones, LogOut,
  ChevronDown, Building2, Plus, Check, Loader2, PlusCircle, ServerCog, Smartphone, CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Global Vault', icon: ServerCog, path: '/dashboard/vault' },
  { name: 'Transactions', icon: Receipt, path: '/dashboard/transactions' },
  { name: 'Connected Gateways', icon: Wallet, path: '/dashboard/gateways' },
  { name: 'Devices / Automation', icon: Smartphone, path: '/dashboard/devices' },
  { name: 'Telegram Alerts', icon: Send, path: '/dashboard/telegram' },
  { name: 'Payment Links', icon: LinkIcon, path: '/dashboard/links' },
  { name: 'SMS Data', icon: MessageSquare, path: '/dashboard/sms' },
  { name: 'Add New Business', icon: PlusCircle, path: '/dashboard/business/new' },
  { name: 'Brand Settings', icon: Settings, path: '/dashboard/brand' },
  { name: 'Customers', icon: Users, path: '/dashboard/customers' },
  { name: 'Reports', icon: LineChart, path: '/dashboard/reports' },
  { name: 'Subscriptions', icon: CreditCard, path: '/dashboard/subscriptions' },
  { name: 'API & Plugins', icon: Code, path: '/dashboard/api' },
  { name: 'Support', icon: Headphones, path: '/dashboard/support' },
];

export default function Sidebar({ merchant, isOpen, setIsOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setBusinesses(data);
        const savedBizId = localStorage.getItem('active_business_id');
        const savedBiz = data.find((b: any) => b.id === savedBizId) || data[0];
        setActiveBusiness(savedBiz);
        localStorage.setItem('active_business_id', savedBiz.id);
      }
      setIsLoading(false);
    };
    fetchBusinesses();
  }, [merchant.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBusinessChange = async (biz: any) => {
    setActiveBusiness(biz);
    localStorage.setItem('active_business_id', biz.id);
    setIsSwitcherOpen(false);
    toast.loading(`Switching to ${biz.business_name}...`, { id: 'switch' });
    await supabase.from('merchants').update({ active_business_id: biz.id }).eq('id', merchant.id);
    window.dispatchEvent(new Event('businessChanged'));
    router.refresh();
    toast.success(`Switched to ${biz.business_name}`, { id: 'switch' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1120] border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

      {/* ── Top Logo ── */}
      <div className="flex items-center h-[72px] px-5 border-b border-slate-800/80 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="text-2xl font-black text-blue-500 tracking-tighter">X</span>
          <span className="text-xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
      </div>

      {/* ── Business Switcher ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/80 shrink-0" ref={switcherRef}>
        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen(v => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              {activeBusiness?.logo_url
                ? <img src={activeBusiness.logo_url} className="w-full h-full rounded-lg object-cover" alt="" />
                : <Building2 size={14} className="text-blue-400" />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-white truncate">{activeBusiness?.business_name || 'Select Business'}</p>
            </div>
            {isLoading
              ? <Loader2 size={14} className="text-slate-500 animate-spin shrink-0" />
              : <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180' : ''}`} />}
          </button>

          {isSwitcherOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Businesses</div>
              {businesses.length === 0 ? (
                <div className="px-4 py-3 text-sm font-medium text-slate-400">No business found.</div>
              ) : (
                businesses.map((biz) => (
                  <button key={biz.id} onClick={() => handleBusinessChange(biz)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#0B1120] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                        {biz.logo_url ? <img src={biz.logo_url} className="w-full h-full object-cover rounded-md" alt="" /> : <Building2 size={12} />}
                      </div>
                      <span className={`text-sm font-bold ${activeBusiness?.id === biz.id ? 'text-blue-500' : 'text-slate-300 group-hover:text-white'}`}>
                        {biz.business_name}
                      </span>
                    </div>
                    {activeBusiness?.id === biz.id && <Check size={16} className="text-blue-500" />}
                  </button>
                ))
              )}
              <div className="h-px bg-slate-800 my-2" />
              <Link
                href="/dashboard/business/new"
                onClick={() => { setIsSwitcherOpen(false); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-[#0B1120] hover:text-blue-500 transition-colors"
              >
                <div className="w-6 h-6 rounded-md border border-dashed border-slate-600 flex items-center justify-center"><Plus size={14} /></div>
                Create New Business
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.path === '/dashboard'
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon size={16} strokeWidth={2} className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400">
            {merchant?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{merchant?.name || 'Merchant'}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{merchant?.email || ''}</p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          onClick={() => setIsOpen(false)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors mb-1"
        >
          <Settings size={14} className="text-slate-400" /> Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}