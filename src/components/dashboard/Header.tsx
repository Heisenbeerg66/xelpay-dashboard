'use client';

import { Menu, Search, Bell, Sun, Moon, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Header({ merchant, setSidebarOpen }: any) {
  const [theme, setTheme] = useState('dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-500">
      
      <div className="flex items-center gap-4 flex-1">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input type="text" placeholder="Search transactions, links..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
             <kbd className="px-2 py-1 text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400">Ctrl</kbd>
             <kbd className="px-2 py-1 text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        
        <button onClick={toggleTheme} className="p-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative p-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all active:scale-95">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-[#0B1120] animate-pulse"></span>
        </button>

        <div className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-900/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-black text-green-700 dark:text-green-500 uppercase tracking-widest">{merchant?.is_demo ? 'Demo Mode' : 'Live Mode'}</span>
        </div>

        {/* 🚀 PRO PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-inner">
              {merchant?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{merchant?.name}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{merchant?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors">
                  <Settings size={16} /> Account Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}