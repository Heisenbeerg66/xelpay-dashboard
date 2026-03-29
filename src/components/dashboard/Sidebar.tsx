'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Receipt, MessageSquare, Wallet, Link as LinkIcon, 
  Settings, LineChart, Send, Users, Code, LifeBuoy, LogOut, X, 
  ChevronDown, Building2, Plus, Check, Loader2, PlusCircle, ServerCog, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// 🚀 UPDATED: Adjusted Menu Items for better Top-Tier UX
const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  
  // 🚀 NEW: Global Assets (Vault) - Highlighted for easy access
  { name: 'Global Vault', icon: ServerCog, path: '/dashboard/vault' },
  
  { name: 'Add New Business', icon: PlusCircle, path: '/dashboard/business/new' },
  { name: 'Brand Settings', icon: Settings, path: '/dashboard/brand' },
  { name: 'Transactions', icon: Receipt, path: '/dashboard/transactions' },
  
  // Changed name to reflect specific business connection
  { name: 'Connected Gateways', icon: Wallet, path: '/dashboard/gateways' }, 
  
  { name: 'Devices / Automation', icon: Smartphone, path: '/dashboard/devices' }, // New option for devices
  { name: 'Telegram Alerts', icon: Send, path: '/dashboard/telegram' },
  
  { name: 'Payment Links', icon: LinkIcon, path: '/dashboard/links' },
  { name: 'SMS Data', icon: MessageSquare, path: '/dashboard/sms' },
  { name: 'Reports', icon: LineChart, path: '/dashboard/reports' },
  { name: 'API & Plugins', icon: Code, path: '/dashboard/api' },
  { name: 'Affiliate Program', icon: Users, path: '/dashboard/affiliate' },
  { name: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
];

// Most reliable device detection:
// pointer:coarse = touch/mobile hardware, pointer:fine = mouse/desktop hardware
// This does NOT change when mobile browser switches to "desktop mode"
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
  const isMobileDevice = useIsMobileDevice();

  // Business Switcher States
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setBusinesses(data);
        const savedBizId = localStorage.getItem('active_business_id');
        const savedBiz = data.find(b => b.id === savedBizId);
        
        if (savedBiz) {
          setActiveBusiness(savedBiz);
        } else {
          setActiveBusiness(data[0]);
          localStorage.setItem('active_business_id', data[0].id);
        }
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
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 transform ${(!isMobileDevice || isOpen) ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col ${isMobileDevice ? 'shadow-2xl' : 'shadow-none'}`}>
      
      {isMobileDevice && (
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 z-50">
          <X size={20} />
        </button>
      )}

      {/* Brand & Workspace Switcher */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="px-2 pt-2 pb-6">
          <Link href="/dashboard" className="flex items-center gap-1 group">
            <span className="text-3xl font-black text-blue-600 tracking-tighter group-hover:scale-105 transition-transform">X</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
        </div>

        <div className="relative" ref={switcherRef}>
          <button 
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="w-full flex items-center justify-between bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : activeBusiness ? (activeBusiness.logo_url ? <img src={activeBusiness.logo_url} className="w-full h-full object-cover rounded-lg" alt="logo" /> : <Building2 size={16} />) : <Building2 size={16} />}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Workspace</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none">
                  {isLoading ? 'Loading...' : activeBusiness ? activeBusiness.business_name : 'No Business Found'}
                </p>
              </div>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSwitcherOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Businesses</div>
              
              {businesses.length === 0 ? (
                 <div className="px-4 py-3 text-sm font-medium text-slate-500">No business found.</div>
              ) : (
                businesses.map((biz) => (
                  <button 
                    key={biz.id} 
                    onClick={() => handleBusinessChange(biz)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-[#0B1120] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        {biz.logo_url ? <img src={biz.logo_url} className="w-full h-full object-cover rounded-md" alt="" /> : <Building2 size={12} />}
                      </div>
                      <span className={`text-sm font-bold ${activeBusiness?.id === biz.id ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {biz.business_name}
                      </span>
                    </div>
                    {activeBusiness?.id === biz.id && <Check size={16} className="text-blue-600" />}
                  </button>
                ))
              )}

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              
              <Link 
                href="/dashboard/business/new" 
                onClick={() => setIsSwitcherOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0B1120] hover:text-blue-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-md border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                Create New Business
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            // FIX: Dashboard only active on exact match, other items use startsWith
            const isActive = item.path === '/dashboard'
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : item.isHighlight 
                      ? 'text-[#0D47A1] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0B1120] hover:text-blue-600 dark:hover:text-blue-500'
                }`}
              >
                <item.icon size={20} className={`${isActive ? 'text-white' : item.isHighlight ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'} transition-colors duration-300`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827] shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-lg shrink-0">
            {merchant.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{merchant.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 truncate">ID: #{merchant.merchant_id_display}</p>
          </div>
        </div>
        {/* FIX: justify-center → justify-start to align with list items */}
        <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-start gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}