'use client';

import { Menu, Search, Bell, Sun, Moon, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // 💥 This perfectly detects touch devices (mobile/tablet) even in Desktop Mode
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function Header({ merchant, setSidebarOpen }: any) {
  const [theme, setTheme] = useState('dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-500">
      
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Menu Button -> ONLY visible if it's a mobile/tablet hardware */}
        {isMobileDevice && (
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 shrink-0 transition-all"
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input type="text" placeholder="Search transactions, links..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
             <kbd className="px-2 py-1 text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        
        {/* Mobile Search Icon */}
        <button className="md:hidden p-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all">
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

        {/* Notification Bell */}
        <button className="relative p-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all active:scale-95 shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111827] animate-pulse"></span>
        </button>

        {/* PRO PROFILE DROPDOWN */}
        <div className="relative ml-1" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)} 
            className="flex items-center justify-center p-0.5 bg-white dark:bg-[#0B1120] rounded-full hover:shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black flex items-center justify-center text-sm shadow-inner ring-2 ring-white dark:ring-slate-800">
              {merchant?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{merchant?.name}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{merchant?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors">
                  <Settings size={16} /> Account Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
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