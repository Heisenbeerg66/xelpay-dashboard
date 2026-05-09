'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Receipt, MessageSquare, Wallet, Link as LinkIcon,
  Settings, Send, LogOut, X,
  ChevronDown, Building2, Plus, Check, Loader2, PlusCircle,
  ServerCog, Smartphone, BarChart2, Code2, LifeBuoy, CreditCard,
  Zap, Globe, FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const menuItems = [
  { name: 'Dashboard',           icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Global Vault',        icon: ServerCog,       path: '/dashboard/vault' },
  { name: 'Transactions',        icon: Receipt,         path: '/dashboard/transactions' },
  { name: 'Gateways',            icon: Wallet,          path: '/dashboard/gateways' },
  { name: 'Devices',             icon: Smartphone,      path: '/dashboard/devices' },
  { name: 'Telegram Alerts',     icon: Send,            path: '/dashboard/telegram' },
  { name: 'Payment Links',       icon: LinkIcon,        path: '/dashboard/links' },
  { name: 'SMS Data',            icon: MessageSquare,   path: '/dashboard/sms' },
  { name: 'Reports',             icon: BarChart2,       path: '/dashboard/reports' },
  { name: 'Subscriptions',       icon: CreditCard,      path: '/dashboard/subscriptions' },
  { name: 'API Access',          icon: Code2,           path: '/dashboard/api' },
  { name: 'Brand Settings',      icon: Settings,        path: '/dashboard/brand' },
  { name: 'Add Business',        icon: PlusCircle,      path: '/dashboard/business/new' },
  { name: 'Support',             icon: LifeBuoy,        path: '/dashboard/support' },
];

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function Sidebar({ merchant, isOpen, setIsOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobileDevice = useIsMobileDevice();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const loadBusinesses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('businesses')
      .select('id, business_name, logo_url, status')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setBusinesses(data);
      const activeId = localStorage.getItem('active_business_id');
      const found = data.find((b: any) => b.id === activeId) || data[0];
      if (found) {
        setActiveBusiness(found);
        if (!activeId) localStorage.setItem('active_business_id', found.id);
      }
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
    window.addEventListener('businessChanged', loadBusinesses);
    return () => window.removeEventListener('businessChanged', loadBusinesses);
  }, [loadBusinesses]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBusinessChange = (biz: any) => {
    setActiveBusiness(biz);
    localStorage.setItem('active_business_id', biz.id);
    window.dispatchEvent(new Event('businessChanged'));
    setIsSwitcherOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobileDevice && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-[72px] bg-black/50 backdrop-blur-sm z-30"
        />
      )}

      <aside
        className={`fixed top-[72px] left-0 h-[calc(100vh-72px)] w-72 z-40 flex flex-col bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 ease-in-out
          ${isOpen || !isMobileDevice ? 'translate-x-0' : '-translate-x-full'}
          ${!isMobileDevice ? 'md:translate-x-0' : ''}
        `}
      >
        {/* Mobile close */}
        {isMobileDevice && isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        )}

        {/* Business Switcher */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80" ref={switcherRef}>
          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen(v => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                {activeBusiness?.logo_url
                  ? <img src={activeBusiness.logo_url} className="w-full h-full object-cover rounded-lg" alt="" />
                  : <Building2 size={14} className="text-white" />}
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {activeBusiness?.business_name || 'Select Business'}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSwitcherOpen && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspaces</p>
                {businesses.length === 0 ? (
                  <p className="px-4 py-2.5 text-sm text-slate-400">No business found.</p>
                ) : (
                  businesses.map((biz, index) => (
                    <button
                      key={biz.id}
                      onClick={() => handleBusinessChange(biz)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {biz.logo_url
                            ? <img src={biz.logo_url} className="w-full h-full object-cover rounded-md" alt="" />
                            : <Building2 size={11} className="text-slate-400" />}
                        </div>
                        <span className={`text-sm font-semibold truncate ${activeBusiness?.id === biz.id ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {biz.business_name}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Main</span>
                        )}
                      </div>
                      {activeBusiness?.id === biz.id && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  ))
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <Link
                  href="/dashboard/business/new"
                  onClick={() => setIsSwitcherOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <Plus size={12} />
                  </div>
                  New Business
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const isAdd = item.name === 'Add Business';
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => { if (isMobileDevice) setIsOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                  ${active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                    : isAdd
                      ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <item.icon
                  size={17}
                  className={`shrink-0 transition-colors ${active ? 'text-white' : isAdd ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="truncate">{item.name}</span>
                {item.name === 'Subscriptions' && !active && (
                  <span className="ml-auto text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">Pro</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {merchant?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{merchant?.name || 'Merchant'}</p>
              <p className="text-[10px] text-slate-400 truncate">{merchant?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}