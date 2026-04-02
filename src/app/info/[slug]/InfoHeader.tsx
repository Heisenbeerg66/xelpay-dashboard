'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X } from 'lucide-react';
import { useEffect } from 'react';

export default function InfoHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/info/contact', label: 'Contact Us' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/info/about', label: 'About Us' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Register' },
  ];

  return (
    <header className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="h-16 flex items-center px-5 md:px-8 justify-between max-w-5xl mx-auto w-full">
        {/* Left: Menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          aria-label="Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Center: Branding */}
        <Link href="/" className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
          <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
        </Link>

        {/* Right: Theme switch */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none border ${resolvedTheme === 'dark' ? 'bg-blue-600 border-blue-500' : 'bg-slate-200 border-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none">{resolvedTheme === 'dark' ? '🌙' : ''}</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none">{resolvedTheme !== 'dark' ? '☀️' : ''}</span>
          </button>
        )}
      </div>

      {/* Mobile/Dropdown Menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-5xl mx-auto px-5 py-3 flex flex-col gap-1">
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