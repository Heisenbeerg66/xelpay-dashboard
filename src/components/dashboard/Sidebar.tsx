'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Receipt, MessageSquare, Wallet, Link as LinkIcon,
  Settings, LineChart, Send, Users, Code, Headphones, LogOut,
  ChevronDown, Building2, Plus, Check, Loader2, PlusCircle,
  ServerCog, Smartphone, CreditCard, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type UserRole = 'owner' | 'admin' | 'developer' | 'support' | 'viewer';

// Role-based menu — যে role-এ যে menu দেখা যাবে
const ALL_MENU_ITEMS = [
  { name: 'Dashboard',              icon: LayoutDashboard, path: '/dashboard',             roles: ['owner','admin','developer','support','viewer'] },
  { name: 'Global Vault',           icon: ServerCog,       path: '/dashboard/vault',        roles: ['owner'] },
  { name: 'New Business',           icon: PlusCircle,      path: '/dashboard/business/new', roles: ['owner'] },
  { name: 'Brand Settings',         icon: Settings,        path: '/dashboard/brand',         roles: ['owner','admin'] },
  { name: 'Transactions',           icon: Receipt,         path: '/dashboard/transactions',  roles: ['owner','admin','developer','support','viewer'] },
  { name: 'Gateway Manager',        icon: Wallet,          path: '/dashboard/gateways',      roles: ['owner','admin'] },
  { name: 'Devices Manager',        icon: Smartphone,      path: '/dashboard/devices',       roles: ['owner','admin'] },
  { name: 'Telegram Alerts',        icon: Send,            path: '/dashboard/telegram',      roles: ['owner','admin'] },
  { name: 'Payment Links',          icon: LinkIcon,        path: '/dashboard/links',         roles: ['owner','admin','developer','support','viewer'] },
  { name: 'Reports',                icon: LineChart,       path: '/dashboard/reports',       roles: ['owner','admin','developer','support','viewer'] },
  { name: 'SMS Data',               icon: MessageSquare,   path: '/dashboard/sms',           roles: ['owner','admin','support','viewer'] },
  { name: 'Customers',              icon: Users,           path: '/dashboard/customers',     roles: ['owner','admin','support','viewer'] },
  { name: 'System Settings',        icon: Settings,        path: '/dashboard/settings',      roles: ['owner','admin'] },
  { name: 'Billing & Subscriptions',icon: CreditCard,      path: '/dashboard/subscriptions', roles: ['owner'] },
  { name: 'API & Plugins',          icon: Code,            path: '/dashboard/api',           roles: ['owner','admin','developer'] },
  { name: 'Support',                icon: Headphones,      path: '/dashboard/support',       roles: ['owner','admin','developer','support','viewer'] },
];

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Admin',     color: 'text-violet-400', bg: 'bg-violet-500/20' },
  developer: { label: 'Developer', color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  support:   { label: 'Support',   color: 'text-emerald-400',bg: 'bg-emerald-500/20' },
  viewer:    { label: 'Viewer',    color: 'text-slate-400',  bg: 'bg-slate-500/20' },
};

export default function Sidebar({ merchant, isOpen, setIsOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const switcherRef = useRef<HTMLDivElement>(null);

  // ✅ Realtime subscription — role update হলে instantly sidebar refresh হবে
  useEffect(() => {
    if (!merchant?.id) return;

    const channel = supabase
      .channel(`team-role-${merchant.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_team_members',
          filter: `user_id=eq.${merchant.id}`,
        },
        (payload: any) => {
          // Role update হলে নতুন role set করো — no logout needed
          if (payload.new?.role) {
            setUserRole(payload.new.role as UserRole);
            toast.success(`Your role has been updated to ${payload.new.role}`);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [merchant?.id]);

  // ✅ Business load
  useEffect(() => {
    if (!merchant?.id) return;
    loadBusinesses();
  }, [merchant?.id, merchant?.is_team_member]);

  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      if (merchant.is_team_member) {
        // ✅ Team member — business_team_members থেকে assigned businesses নিয়ে নাও
        const { data: memberships } = await supabase
          .from('business_team_members')
          .select('business_id, role, businesses(id, business_name, logo_url, slug)')
          .eq('user_id', merchant.id);

        if (memberships && memberships.length > 0) {
          const assignedBusinesses = memberships
            .map((m: any) => m.businesses)
            .filter(Boolean);

          setBusinesses(assignedBusinesses);

          // Active business determine করো
          const savedBizId = localStorage.getItem('active_business_id');
          const active = assignedBusinesses.find((b: any) => b.id === savedBizId)
            || assignedBusinesses[0];

          if (active) {
            setActiveBusiness(active);
            localStorage.setItem('active_business_id', active.id);

            // Role নিয়ে নাও active business-এর জন্য
            const membership = memberships.find((m: any) => m.business_id === active.id);
            if (membership?.role) setUserRole(membership.role as UserRole);
          }
        }
      } else {
        // ✅ Regular merchant — নিজের businesses
        const { data } = await supabase
          .from('businesses')
          .select('id, business_name, logo_url, slug')
          .eq('merchant_id', merchant.id)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setBusinesses(data);
          const savedBizId = localStorage.getItem('active_business_id');
          const saved = data.find((b: any) => b.id === savedBizId) || data[0];
          setActiveBusiness(saved);
          localStorage.setItem('active_business_id', saved.id);
        }
        setUserRole('owner');
      }
    } catch (e) {
      console.error('Sidebar loadBusinesses error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // businessChanged event-এ reload
  useEffect(() => {
    const handle = () => loadBusinesses();
    window.addEventListener('businessChanged', handle);
    return () => window.removeEventListener('businessChanged', handle);
  }, [merchant?.id]);

  const handleBusinessChange = async (biz: any) => {
    setActiveBusiness(biz);
    localStorage.setItem('active_business_id', biz.id);
    setIsSwitcherOpen(false);

    // Team member হলে role update করো for new business
    if (merchant.is_team_member) {
      const { data: membership } = await supabase
        .from('business_team_members')
        .select('role')
        .eq('user_id', merchant.id)
        .eq('business_id', biz.id)
        .maybeSingle();
      if (membership?.role) setUserRole(membership.role as UserRole);
    }

    toast.loading(`Switching to ${biz.business_name}...`, { id: 'switch' });
    await supabase.from('merchants').update({ active_business_id: biz.id }).eq('id', merchant.id);
    window.dispatchEvent(new Event('businessChanged'));
    router.refresh();
    toast.success(`Switched to ${biz.business_name}`, { id: 'switch' });
  };

  const handleLogout = async () => {
    localStorage.removeItem('active_business_id');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const visibleMenuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(userRole));
  const roleBadge = userRole !== 'owner' ? ROLE_BADGE[userRole] : null;
  const canAddBusiness = !merchant.is_team_member;

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1120] border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

      {/* ── Logo ── */}
      <div className="flex items-center h-[72px] px-5 border-b border-slate-800/80 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="text-2xl font-black text-blue-500 tracking-tighter">X</span>
          <span className="text-xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
        {roleBadge && (
          <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${roleBadge.color} ${roleBadge.bg}`}>
            <ShieldCheck size={9} />{roleBadge.label}
          </span>
        )}
      </div>

      {/* ── Business Switcher ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/80 shrink-0" ref={switcherRef}>
        <div className="relative">
          {/* Main button — সবসময় clickable, dropdown toggle করে */}
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
              <p className="text-xs font-black text-white truncate">
                {isLoading ? 'Loading...' : (activeBusiness?.business_name || 'Select Business')}
              </p>
              {merchant.is_team_member && (
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">Team workspace</p>
              )}
            </div>
            {isLoading
              ? <Loader2 size={14} className="text-slate-500 animate-spin shrink-0" />
              : <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
            }
          </button>

          {/* ✅ Dropdown — businesses list + add new */}
          {isSwitcherOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {merchant.is_team_member ? 'Your Workspaces' : 'Your Businesses'}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                </div>
              ) : businesses.length === 0 ? (
                <div className="px-4 py-3 text-sm font-medium text-slate-400">
                  {merchant.is_team_member ? 'No workspaces found.' : 'No business found.'}
                </div>
              ) : (
                businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => handleBusinessChange(biz)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#0B1120] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        {biz.logo_url
                          ? <img src={biz.logo_url} className="w-full h-full object-cover rounded-md" alt="" />
                          : <Building2 size={12} />}
                      </div>
                      <span className={`text-sm font-bold truncate max-w-[140px] ${activeBusiness?.id === biz.id ? 'text-blue-500' : 'text-slate-300 group-hover:text-white'}`}>
                        {biz.business_name}
                      </span>
                    </div>
                    {activeBusiness?.id === biz.id && <Check size={16} className="text-blue-500 shrink-0" />}
                  </button>
                ))
              )}

              {/* ✅ Add new business — only for owners */}
              {canAddBusiness && (
                <>
                  <div className="h-px bg-slate-800 my-2" />
                  <Link
                    href="/dashboard/business/new"
                    onClick={() => { setIsSwitcherOpen(false); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-[#0B1120] hover:text-blue-500 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md border border-dashed border-slate-600 flex items-center justify-center shrink-0">
                      <Plus size={14} />
                    </div>
                    Create New Business
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => {
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
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400 shrink-0">
            {merchant?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{merchant?.name || 'Merchant'}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{merchant?.email || ''}</p>
          </div>
        </div>
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