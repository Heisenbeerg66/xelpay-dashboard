'use client';
// PATH: components/dashboard/Sidebar.tsx

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, Receipt, MessageSquare, Wallet, Link as LinkIcon, 
  Settings, LineChart, Send, Users, Code, LifeBuoy, LogOut, X, 
  ChevronDown, Building2, Plus, Check, Loader2, PlusCircle, ServerCog, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Global Vault', icon: ServerCog, path: '/dashboard/vault' },
  { name: 'Add New Business', icon: PlusCircle, path: '/dashboard/business/new' },
  { name: 'Brand Settings', icon: Settings, path: '/dashboard/brand' },
  { name: 'Transactions', icon: Receipt, path: '/dashboard/transactions' },
  { name: 'Connected Gateways', icon: Wallet, path: '/dashboard/gateways' },
  { name: 'Devices / Automation', icon: Smartphone, path: '/dashboard/devices' },
  { name: 'Telegram Alerts', icon: Send, path: '/dashboard/telegram' },
  { name: 'Payment Links', icon: LinkIcon, path: '/dashboard/links' },
  { name: 'SMS Data', icon: MessageSquare, path: '/dashboard/sms' },
  { name: 'Reports', icon: LineChart, path: '/dashboard/reports' },
  { name: 'API & Plugins', icon: Code, path: '/dashboard/api' },
  { name: 'Affiliate Program', icon: Users, path: '/dashboard/affiliate' },
  { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
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

async function fullSignOut() {
  try { await supabase.auth.signOut({ scope: 'global' }); } catch (e) {}
  const KEEP_KEYS = ['theme'];
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !KEEP_KEYS.includes(key)) toRemove.push(key);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  sessionStorage.clear();
  window.location.href = '/login';
}

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export default function Sidebar({ merchant, isOpen, setIsOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobileDevice = useIsMobileDevice();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const switcherRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(async () => {
      toast.error('Session expired due to inactivity. Please login again.');
      await fullSignOut();
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase.from('businesses').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setBusinesses(data);
        const savedBizId = localStorage.getItem('active_business_id');
        const savedBiz = data.find((b: any) => b.id === savedBizId);
        if (savedBiz) { setActiveBusiness(savedBiz); } 
        else { setActiveBusiness(data[0]); localStorage.setItem('active_business_id', data[0].id); }
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

  const handleBusinessChange = (biz: any) => {
    setActiveBusiness(biz);
    localStorage.setItem('active_business_id', biz.id);
    setIsSwitcherOpen(false);
    toast.success(`Switched to ${biz.business_name}`);
    window.dispatchEvent(new Event('businessChanged'));
  };

  const handleLogout = async () => {
    toast.loading('Signing out...');
    await fullSignOut();
  };

  const showSidebar = !isMobileDevice || isOpen;

  return (
    <aside className={`fixed top-[72px] bottom-0 left-0 z-40 w-72 bg-[#0B1120] border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out flex flex-col ${showSidebar ? 'translate-x-0' : '-translate-x-full'} ${isMobileDevice ? 'shadow-2xl' : 'shadow-none'}`}>

      {/* Close button visible ONLY on mobile devices */}
      {isMobileDevice && (
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors z-50">
          <X size={18} />
        </button>
      )}

      {/* Workspace Switcher - Branding Removed from here since it's now on the Header */}
      <div className="p-4 border-b border-slate-800/80 shrink-0">
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="w-full flex items-center justify-between bg-[#111827] hover:bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> :
                  activeBusiness ? (
                    activeBusiness.logo_url
                      ? <img src={activeBusiness.logo_url} className="w-full h-full object-cover rounded-lg" alt="logo" />
                      : <Building2 size={16} />
                  ) : <Building2 size={16} />}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Workspace</p>
                <p className="text-sm font-black text-white truncate leading-none">
                  {isLoading ? 'Loading...' : activeBusiness ? activeBusiness.business_name : 'No Business Found'}
                </p>
              </div>
            </div>
            <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSwitcherOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto custom-scrollbar">
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
              <div className="h-px bg-slate-800 my-2"></div>
              <Link href="/dashboard/business/new" onClick={() => { setIsSwitcherOpen(false); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-[#0B1120] hover:text-blue-500 transition-colors">
                <div className="w-6 h-6 rounded-md border border-dashed border-slate-600 flex items-center justify-center"><Plus size={14} /></div>
                Create New Business
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.path === '/dashboard' ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link key={item.name} href={item.path} onClick={() => { if(isMobileDevice) setIsOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                  isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-[#111827] hover:text-blue-400'
                }`}
              >
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'} transition-colors duration-300`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-[#111827] shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-inner ring-2 ring-slate-800">
            {merchant.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-bold text-sm text-white truncate">{merchant.name}</h4>
            <p className="text-[10px] font-bold text-slate-500 truncate">ID: #{merchant.merchant_id_display}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-start gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-900/20 rounded-xl transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}