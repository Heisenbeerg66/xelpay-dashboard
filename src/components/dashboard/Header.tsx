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
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(results.length > 0)}
          placeholder="Search pages & settings..."
          className="w-full pl-11 pr-16 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button onClick={() => { setQuery(''); setIsOpen(false); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={12} className="text-slate-400" />
            </button>
          ) : (
            <kbd className="px-2 py-1 text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400">⌘K</kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pages & Settings</p>
          </div>
          <div className="py-1.5">
            {results.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.path}
                  onClick={() => navigate(r.path)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === selectedIdx ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === selectedIdx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${i === selectedIdx ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{r.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{r.description}</p>
                  </div>
                  <ChevronRight size={12} className={`shrink-0 ${i === selectedIdx ? 'text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400">↑↓</kbd>
            <span className="text-[10px] text-slate-400">Navigate</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400">↵</kbd>
            <span className="text-[10px] text-slate-400">Go</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400">Esc</kbd>
            <span className="text-[10px] text-slate-400">Close</span>
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
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-500">

      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Menu Button — mobile/tablet only */}
        {isMobileDevice && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 shrink-0 transition-all"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Desktop Global Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <GlobalSearch />
        </div>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="absolute inset-x-0 top-0 z-50 bg-white dark:bg-[#0B1120] p-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <button onClick={() => setMobileSearchOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

        {/* Mobile Search Icon */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden p-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all"
        >
          <Search size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border shadow-sm ${
            theme === 'dark'
              ? 'bg-[#111827] border-slate-700 text-amber-400 hover:bg-slate-800'
              : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
        >
          <Settings size={18} />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(v => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {merchant?.full_name || 'Merchant'}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{merchant?.full_name || 'Merchant'}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{merchant?.email || ''}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings size={14} className="text-slate-400" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}