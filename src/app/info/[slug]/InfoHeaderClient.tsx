'use client';
// PATH: src/app/info/[slug]/InfoHeaderClient.tsx
// isAuthenticated prop server থেকে আসে → initial HTML এই correct buttons থাকে → zero flicker

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, Moon, Sun, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { logoutAction } from '@/lib/session';

interface Props {
  isAuthenticated: boolean;
}

export default function InfoHeaderClient({ isAuthenticated }: Props) {
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
  ];

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

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    if (isAuthenticated) {
      return (
        <div className={`flex ${mobile ? 'flex-col gap-1 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800' : 'items-center gap-3'}`}>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all ${mobile ? 'px-4 py-3' : 'px-5 py-2 shadow-lg shadow-blue-600/20'}`}
          >
            <LayoutDashboard size={15} /> Go to Dashboard
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className={`flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors ${mobile ? 'px-4 py-3' : ''}`}
            >
              Logout
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className={`flex ${mobile ? 'flex-col gap-1 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800' : 'items-center gap-3'}`}>
        <Link
          href="/login"
          className={`flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors ${mobile ? 'px-4 py-3' : ''}`}
        >
          <LogIn size={15} /> Login
        </Link>
        <Link
          href="/signup"
          className={`flex items-center gap-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all ${mobile ? 'px-4 py-3' : 'px-5 py-2 shadow-lg shadow-blue-600/20'}`}
        >
          <UserPlus size={15} /> Sign Up
        </Link>
      </div>
    );
  };

  return (
    <header className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">

      {/* Desktop */}
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
          <AuthButtons />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center h-16 px-5 justify-between">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          aria-label="Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
        </Link>

        <ThemeToggle />
      </div>

      {/* Mobile Dropdown */}
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
            <AuthButtons mobile />
          </div>
        </div>
      )}
    </header>
  );
}