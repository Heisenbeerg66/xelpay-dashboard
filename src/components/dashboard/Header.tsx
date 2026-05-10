'use client';

import {
  Menu, Search, Sun, Moon, Bell, LogOut, X,
  LayoutDashboard, Receipt, Link2, MessageSquare, Building2, User,
  KeyRound, Settings, ChevronRight, CheckCircle, Clock, AlertCircle,
  Smartphone, Send, CreditCard, DollarSign, Loader2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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

// ─── Searchable Pages ─────────────────────────────────────────────────────────
const SEARCH_PAGES = [
  { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard, keywords: ['dashboard', 'overview', 'home', 'stats', 'revenue'], description: 'View your business metrics and recent transactions' },
  { label: 'All Transactions', path: '/dashboard/transactions', icon: Receipt, keywords: ['transactions', 'orders', 'payments', 'history', 'trx'], description: 'Browse and filter all payment transactions' },
  { label: 'Payment Links', path: '/dashboard/links', icon: Link2, keywords: ['links', 'payment links', 'checkout', 'products'], description: 'Create and manage payment links' },
  { label: 'SMS Data', path: '/dashboard/sms', icon: MessageSquare, keywords: ['sms', 'messages', 'mobile banking', 'bkash', 'nagad', 'rocket'], description: 'View incoming SMS from your Android reader device' },
  { label: 'Business Settings', path: '/dashboard/settings', icon: Building2, keywords: ['settings', 'business', 'configure', 'setup'], description: 'Manage your business configuration' },
  { label: 'Profile Settings', path: '/dashboard/settings/profile', icon: User, keywords: ['profile', 'account', 'name', 'avatar', 'personal'], description: 'Update your personal profile information' },
  { label: 'API Keys', path: '/dashboard/settings/api', icon: KeyRound, keywords: ['api', 'api keys', 'developer', 'integration', 'webhook', 'secret'], description: 'Manage API keys and webhook configuration' },
  { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: CreditCard, keywords: ['subscription', 'plan', 'billing', 'upgrade'], description: 'Manage your subscription plan' },
  { label: 'Reports', path: '/dashboard/reports', icon: Receipt, keywords: ['reports', 'analytics', 'revenue', 'chart'], description: 'View payment analytics and reports' },
  { label: 'Customers', path: '/dashboard/customers', icon: User, keywords: ['customers', 'clients', 'buyers'], description: 'View customer information from orders' },
  { label: 'Telegram Alerts', path: '/dashboard/telegram', icon: Send, keywords: ['telegram', 'alerts', 'notifications', 'bot'], description: 'Configure Telegram payment notifications' },
  { label: 'Devices', path: '/dashboard/devices', icon: Smartphone, keywords: ['devices', 'sms', 'android', 'automation'], description: 'Manage connected Android devices' },
];

// ─── Notification type icon ───────────────────────────────────────────────────
function NotifIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  if (type === 'payment') return <DollarSign size={14} className={`text-emerald-500 ${cls}`} />;
  if (type === 'success') return <CheckCircle size={14} className={`text-emerald-500 ${cls}`} />;
  if (type === 'warning') return <AlertCircle size={14} className={`text-amber-500 ${cls}`} />;
  if (type === 'error') return <AlertCircle size={14} className={`text-red-500 ${cls}`} />;
  if (type === 'system') return <Settings size={14} className={`text-blue-500 ${cls}`} />;
  return <Bell size={14} className={`text-slate-400 ${cls}`} />;
}

// ─── Global Search ────────────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof SEARCH_PAGES>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router_ref = useRef<any>(null);

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(SEARCH_PAGES.filter(p =>
      p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))
    ).slice(0, 5));
    setSelectedIdx(0);
  }, [query]);

  const navigate = (path: string) => { window.location.href = path; setQuery(''); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') navigate(results[selectedIdx].path);
    else if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2.5 bg-[#111827] border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-2.5 transition-all w-full">
        <Search size={15} className="text-slate-500 shrink-0" />
        <input ref={inputRef} type="text" placeholder="Search pages, features…" value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="bg-transparent text-slate-300 placeholder-slate-600 text-sm font-medium outline-none w-full" />
        {query && <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>}
      </div>
      {isFocused && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-full bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button key={r.path} onClick={() => navigate(r.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === selectedIdx ? 'bg-blue-900/30' : 'hover:bg-slate-800/80'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === selectedIdx ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Icon size={14} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${i === selectedIdx ? 'text-blue-400' : 'text-slate-200'}`}>{r.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{r.description}</p>
                </div>
                <ChevronRight size={12} className={`shrink-0 ${i === selectedIdx ? 'text-blue-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
          <div className="px-3 py-2 border-t border-slate-800/80 flex items-center gap-3">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 border border-slate-700 rounded text-slate-400">↑↓</kbd>
            <span className="text-[10px] text-slate-500">Navigate</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 border border-slate-700 rounded text-slate-400">↵</kbd>
            <span className="text-[10px] text-slate-500">Go</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 border border-slate-700 rounded text-slate-400">Esc</kbd>
            <span className="text-[10px] text-slate-500">Close</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────
export default function Header({ merchant, setSidebarOpen }: any) {
  const [theme, setTheme] = useState('dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const isMobileDevice = useIsMobileDevice();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!merchant?.id) return;
    setNotifLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
    } catch {
      // silently fail
    } finally {
      setNotifLoading(false);
    }
  };

  const handleOpenNotif = () => {
    setIsNotifOpen(v => {
      if (!v) fetchNotifications();
      return !v;
    });
    setIsProfileOpen(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!merchant?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('merchant_id', merchant.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const initials = merchant?.full_name
    ? merchant.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';

  const fmtNotifTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <header className="fixed top-0 inset-x-0 h-[72px] z-50 w-full bg-[#0B1120] border-b border-slate-800/80 flex items-center transition-colors duration-500">

      {/* Branding aligned with sidebar */}
      <div className="hidden md:flex items-center h-full w-72 shrink-0 px-4 md:px-6 border-r border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-1 group w-max">
          <span className="text-3xl font-black text-blue-500 tracking-tighter group-hover:scale-105 transition-transform">X</span>
          <span className="text-2xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-between h-full px-4 md:px-6 lg:px-8">

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={() => setSidebarOpen((prev: boolean) => !prev)} className="md:hidden p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 shrink-0 transition-all">
            <Menu size={20} />
          </button>
          <div className="hidden md:flex flex-1 max-w-xl">
            <GlobalSearch />
          </div>
          {mobileSearchOpen && (
            <div className="absolute inset-x-0 top-0 h-[72px] z-50 bg-[#0B1120] px-4 flex items-center gap-3 border-b border-slate-800">
              <div className="flex-1"><GlobalSearch /></div>
              <button onClick={() => setMobileSearchOpen(false)} className="p-2 rounded-full hover:bg-slate-800 transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button onClick={() => setMobileSearchOpen(true)} className="md:hidden p-2.5 bg-[#111827] border border-slate-800 rounded-full text-slate-400 hover:text-blue-500 transition-all">
            <Search size={18} />
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border shadow-sm ${theme === 'dark' ? 'bg-[#111827] border-slate-700 text-amber-400 hover:bg-slate-800' : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-700'}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotif}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#111827] border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-700 transition-all shadow-sm"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
                  <div>
                    <p className="text-sm font-black text-white">Notifications</p>
                    {unreadCount > 0 && <p className="text-[10px] text-slate-400 font-medium">{unreadCount} unread</p>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[340px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { markAsRead(n.id); if (n.action_url) window.location.href = n.action_url; }}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 last:border-0 ${!n.is_read ? 'bg-blue-900/10' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'payment' ? 'bg-emerald-900/30' : n.type === 'success' ? 'bg-emerald-900/30' : n.type === 'warning' ? 'bg-amber-900/30' : n.type === 'error' ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
                          <NotifIcon type={n.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black truncate ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-600 font-medium mt-1">{fmtNotifTime(n.created_at)}</p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setIsProfileOpen(v => !v); setIsNotifOpen(false); }} className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#111827] border border-slate-800 hover:border-blue-700 transition-all shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                {merchant?.full_name || 'Merchant'}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{merchant?.full_name || 'Merchant'}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{merchant?.email || ''}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                    <Settings size={14} className="text-slate-400" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-900/20 rounded-xl transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}