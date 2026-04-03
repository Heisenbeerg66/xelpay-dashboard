'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Moon, Sun } from 'lucide-react';

export default function InfoHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/info/contact', label: 'Contact Us' },
    { href: '/info/about', label: 'About Us' },
    { href: '/info/terms', label: 'Terms' },
    { href: '/info/privacy', label: 'Privacy' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Register' },
  ];

  // Round theme toggle — original style, same as landing/login/signup
  const ThemeToggle = () => (
    mounted ? (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    ) : <div className="w-9 h-9" />
  );

  return (
    <header className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">

      {/* Desktop: branding left, nav center/right, theme toggle right */}
      <div className="hidden md:flex items-center h-16 px-8 justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
          <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
        </Link>

        <div className="flex items-center gap-7 text-sm">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile: menu button left, branding center, theme toggle right */}
      <div className="flex md:hidden items-center h-16 px-5 justify-between relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          aria-label="Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        

        <ThemeToggle />
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}