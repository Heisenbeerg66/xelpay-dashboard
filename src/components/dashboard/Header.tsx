'use client';

import { Menu, Search, Sun, Moon, Settings, LogOut, X, LayoutDashboard, Receipt, Link2, MessageSquare, Building2, User, KeyRound, Bell, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  {
    label: 'Dashboard Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'overview', 'home', 'stats', 'revenue', 'analytics'],
    description: 'View your business metrics and recent transactions',
  },
  {
    label: 'All Transactions',
    path: '/dashboard/transactions',
    icon: Receipt,
    keywords: ['transactions', 'orders', 'payments', 'history', 'trx'],
    description: 'Browse and filter all payment transactions',
  },
  {
    label: 'Payment Links',
    path: '/dashboard/links',
    icon: Link2,
    keywords: ['links', 'payment links', 'checkout', 'products'],
    description: 'Create and manage payment links',
  },
  {
    label: 'SMS Data',
    path: '/dashboard/sms',
    icon: MessageSquare,
    keywords: ['sms', 'messages', 'mobile banking', 'bkash', 'nagad', 'rocket'],
    description: 'View incoming SMS from your Android reader device',
  },
  {
    label: 'Business Settings',
    path: '/dashboard/settings',
    icon: Building2,
    keywords: ['settings', 'business', 'configure', 'setup'],
    description: 'Manage your business configuration',
  },
  {
    label: 'Profile Settings',
    path: '/dashboard/settings/profile',
    icon: User,
    keywords: ['profile', 'account', 'name', 'avatar', 'personal'],
    description: 'Update your personal profile information',
  },
  {
    label: 'API Keys',
    path: '/dashboard/settings/api',
    icon: KeyRound,
    keywords: ['api', 'api keys', 'developer', 'integration', 'webhook', 'secret'],
    description: 'Manage API keys and webhook configuration',
  },
  {
    label: 'Notifications',
    path: '/dashboard/settings/notifications',
    icon: Bell,
    keywords: ['notifications', 'alerts', 'telegram', 'email'],
    description: 'Configure notification preferences',
  },
];

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof SEARCH_PAGES>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setIsOpen(false); return; }
    const lower = q.toLowerCase();
    const matched = SEARCH_PAGES.filter(p =>
      p.label.toLowerCase().includes(lower) ||
      p.keywords.some(k => k.includes(lower)) ||
      p.description.toLowerCase().includes(lower)
    );
    setResults(matched);
    setIsOpen(matched.length > 0);
    setSelectedIdx(0);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  // Global keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) { navigate(results[selectedIdx].path); }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md lg:max-w-lg">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(results.length > 0)}
          placeholder="Search pages & settings..."
          className="w-full pl-11 pr-16 py-2.5 bg-[#111827] border border-slate-800 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium text-white transition-all placeholder:text-slate-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button onClick={() => { setQuery(''); setIsOpen(false); }} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
              <X size={12} className="text-slate-400" />
            </button>
          ) : (
            <kbd className="px-2 py-1 text-[10px] font-black bg-slate-800 border border-slate-700 rounded-full text-slate-400">⌘K</kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pages & Settings</p>
          </div>
          <div className="py-1.5">
            {results.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.path}
                  onClick={() => navigate(r.path)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === selectedIdx ? 'bg-blue-900/30' : 'hover:bg-slate-800/80'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === selectedIdx ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${i === selectedIdx ? 'text-blue-400' : 'text-slate-200'}`}>{r.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{r.description}</p>
                  </div>
                  <ChevronRight size={12} className={`shrink-0 ${i === selectedIdx ? 'text-blue-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
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
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const initials = merchant?.full_name
    ? merchant.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';

  return (
    <header className="fixed top-0 inset-x-0 h-[72px] z-50 w-full bg-[#0B1120] border-b border-slate-800/80 flex items-center transition-colors duration-500">

      {/* 💥 BRANDING AREA: Strictly aligned with the 288px (w-72) sidebar 💥 */}
      <div className="hidden md:flex items-center h-full w-72 shrink-0 px-4 md:px-6 border-r border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-1 group w-max">
          <span className="text-3xl font-black text-blue-500 tracking-tighter group-hover:scale-105 transition-transform">X</span>
          <span className="text-2xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
      </div>

      {/* ─── REST OF THE HEADER (Search + Profile) ─── */}
      <div className="flex flex-1 items-center justify-between h-full px-4 md:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle (Only visible on mobile) */}
          <button
            onClick={() => setSidebarOpen((prev: boolean) => !prev)}
            className="md:hidden p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 shrink-0 transition-all"
          >
            <Menu size={20} />
          </button>

          {/* Desktop Global Search - Starts right after the sidebar border perfectly */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <GlobalSearch />
          </div>

          {/* Mobile Search Overlay */}
          {mobileSearchOpen && (
            <div className="absolute inset-x-0 top-0 h-[72px] z-50 bg-[#0B1120] px-4 flex items-center gap-3 border-b border-slate-800">
              <div className="flex-1">
                <GlobalSearch />
              </div>
              <button onClick={() => setMobileSearchOpen(false)} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Mobile Search Icon */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2.5 bg-[#111827] border border-slate-800 rounded-full text-slate-400 hover:text-blue-500 transition-all"
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle (Changes Main Content Theme) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border shadow-sm ${
              theme === 'dark'
                ? 'bg-[#111827] border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-700'
            }`}
            title="Toggle Main Content Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111827] border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-700 transition-all shadow-sm"
          >
            <Settings size={18} />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(v => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#111827] border border-slate-800 hover:border-blue-700 transition-all shadow-sm"
            >
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
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
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
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}