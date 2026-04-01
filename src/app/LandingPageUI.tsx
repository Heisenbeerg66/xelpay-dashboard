'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Menu, X, Moon, Sun, Check, Star, Zap, Shield, Smartphone, Globe,
  FileText, CreditCard, ArrowRight, PlayCircle, Server, Send, Mail,
  ChevronDown, ChevronUp, HelpCircle, Code,
  Link as LinkIcon, BadgeCheck, Database, Building2, BookOpen, ChevronRight
} from 'lucide-react';

// --- Reusable Components ---
const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="group p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all hover:-translate-y-1.5 duration-300 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-6">
      <Icon size={32} strokeWidth={1.5} className="transition-all duration-300" />
    </div>
    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

const FaqItem = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left focus-visible:ring-2 focus-visible:ring-blue-600 outline-none rounded-lg"
      >
        <span className="text-base font-bold text-slate-800 dark:text-slate-200">{question}</span>
        {isOpen ? <ChevronUp className="text-blue-600 shrink-0" /> : <ChevronDown className="text-slate-400 shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
};

// --- Colorful Social SVG Icons ---
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#26A5E4">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

// FIX 3: Mail icon for footer
const MailIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// FIX 2: Tag badge renderer — parses "POPULAR:blue" or "⭐ Best Value:green" format
// DB column format: "text:color" where color = blue | green | orange | purple | red | amber
// If no colon, renders with default blue gradient (backward compatible)
function PlanTagBadge({ tag }: { tag: string }) {
  const colorMap: Record<string, { gradient: string; text: string; glow: string }> = {
    blue:   { gradient: 'from-blue-500 to-indigo-600',   text: 'text-white', glow: 'shadow-blue-500/40' },
    green:  { gradient: 'from-emerald-500 to-teal-600',  text: 'text-white', glow: 'shadow-emerald-500/40' },
    orange: { gradient: 'from-orange-500 to-amber-500',  text: 'text-white', glow: 'shadow-orange-500/40' },
    purple: { gradient: 'from-purple-500 to-violet-600', text: 'text-white', glow: 'shadow-purple-500/40' },
    red:    { gradient: 'from-red-500 to-rose-600',      text: 'text-white', glow: 'shadow-red-500/40' },
    amber:  { gradient: 'from-amber-400 to-yellow-500',  text: 'text-slate-900', glow: 'shadow-amber-400/40' },
  };

  const parts = tag.split(':');
  const label = parts[0].trim();
  const colorKey = (parts[1] || 'blue').trim().toLowerCase();
  const colors = colorMap[colorKey] || colorMap.blue;

  return (
    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${colors.gradient} ${colors.text} px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${colors.glow} whitespace-nowrap flex items-center gap-1.5 border border-white/20`}>
      <span className="text-sm leading-none">{label.match(/^\p{Emoji}/u)?.[0] || '✦'}</span>
      <span>{label.replace(/^\p{Emoji}\s*/u, '')}</span>
    </div>
  );
}

export default function LandingPageUI({ initialPlans, initialReviews, initialFaqs, initialSettings }: any) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!initialReviews || initialReviews.length === 0) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = clientWidth > 768 ? 400 : window.innerWidth * 0.85;
        if (scrollLeft >= maxScroll - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          setCurrentSlide(0);
        } else {
          sliderRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
          setCurrentSlide((prev) => (prev + 1) % initialReviews.length);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [initialReviews]);

  const starterPlanId = initialPlans?.find((p: any) => p.serial === 0)?.id || '';
  const handleLiveDemo = () => { router.push('/login?mode=demo'); };

  const handleScrollToFaq = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (faqSectionRef.current) {
      faqSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const methodLabels: Record<string, string> = {
    mobile: 'Mobile Banking (bKash / Nagad / Rocket)',
    bank: 'Bank Transfer via IMAP Sync',
    international: 'International (Stripe / PayPal / Crypto)',
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-500 overflow-x-hidden">

      {/* ===================== 1. NAVIGATION ===================== */}
      <nav ref={mobileMenuRef} className="fixed w-full z-50 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter group-hover:scale-105 transition-transform">X</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            <Link href="/" className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300">Home</Link>
            <Link href="#features" className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300">Features</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300">Pricing</Link>
            <Link href="#about" className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300">About</Link>
            <Link href="#contact" className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300">Help</Link>
            <a href="#faq" onClick={handleScrollToFaq} className="hover:text-blue-600 transition text-slate-700 dark:text-slate-300 cursor-pointer">FAQs</a>

            {/* FIX 1: Desktop theme icon — same style as mobile (round, colored) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="text-slate-900 dark:text-white hover:text-blue-600 transition">Login</Link>
            <Link
              href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-transform"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Nav icons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <button className="text-slate-900 dark:text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0d1526] border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="px-5 pt-5 pb-3 flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '#features', label: 'Features' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#about', label: 'About' },
                { href: '#contact', label: 'Help Center' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all text-base">
                  {item.label}
                </Link>
              ))}
              <a href="#faq" onClick={handleScrollToFaq}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all text-base cursor-pointer">
                FAQs
              </a>
            </div>
            <div className="mx-5 h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
            <div className="px-5 pb-6 pt-3 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-base border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                Login Now
              </Link>
              <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">
                <Zap size={18} /> Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===================== 2. HERO SECTION ===================== */}
      {/* FIX 1: Hero text bigger on desktop */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] mb-4 uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
            <Zap size={12} /> The Ultimate Payment Solution
          </div>

          {/* FIX 1: Larger hero text — text-4xl md:text-5xl lg:text-6xl */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-5 tracking-tight">
            Automate Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic">
              Payments
            </span>
            <br className="hidden md:block" />
            {' & '}Grow Your Business
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
            Instant verification via your{' '}
            <span className="text-slate-900 dark:text-white font-black underline decoration-blue-500 decoration-2">
              Personal, Agent, or Merchant
            </span>{' '}
            accounts. Receive funds directly — no third-party holding.
          </p>

          <div className="flex flex-row gap-2 md:gap-3 justify-center md:justify-start w-full mx-auto md:mx-0">
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'}
              className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-1.5 hover:-translate-y-1 transition-all">
              Get Started <ArrowRight size={16} />
            </Link>
            <button onClick={handleLiveDemo}
              className="flex-1 md:flex-none bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <PlayCircle size={16} /> Live Demo
            </button>
          </div>
        </div>

        {/* Server Log Card */}
        <div className="hidden md:flex flex-col gap-3">
          <div className="relative bg-white dark:bg-[#0f172a] p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-green-400 to-blue-500 animate-pulse"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Server size={12} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-slate-700 dark:text-white font-black text-xs uppercase tracking-wider">Live Server Log</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full font-black uppercase border border-green-200 dark:border-green-800/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 inline-block"></span> Online
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/40">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-600/20 border border-pink-200 dark:border-pink-500/30 flex items-center justify-center shrink-0">
                  <span className="text-pink-600 dark:text-pink-400 font-black text-[10px]">bK</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-white font-black text-[11px] uppercase tracking-tight">Payment Verified</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">bKash Merchant • ৳1,500</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-green-600 dark:text-green-400 text-[10px] font-black block">Just now</span>
                  <div className="mt-1 w-2 h-2 bg-green-500 rounded-full ml-auto animate-ping"></div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-700/30">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                  <Zap size={12} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-white font-black text-[11px] uppercase tracking-tight">Webhook Triggered</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Order #XEL9921XP</p>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black shrink-0">2s ago</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/40">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-600/20 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center shrink-0">
                  <span className="text-orange-600 dark:text-orange-400 font-black text-[10px]">NG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-white font-black text-[11px] uppercase tracking-tight">Nagad Verified</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Personal • ৳850</p>
                </div>
                <span className="text-green-600 dark:text-green-400 text-[10px] font-black shrink-0">5s ago</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-700/30">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-[10px]">ST</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-white font-black text-[11px] uppercase tracking-tight">Stripe Payment</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">International • $29.00</p>
                </div>
                <span className="text-green-600 dark:text-green-400 text-[10px] font-black shrink-0">12s ago</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-center">
              <p className="text-blue-600 font-black text-lg">99.9%</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Uptime</p>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-center">
              <p className="text-green-600 font-black text-lg">&lt;1s</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Verify</p>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-center">
              <p className="text-purple-600 font-black text-lg">25+</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Methods</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 3. FEATURES ===================== */}
      <section id="features" className="py-20 md:py-24 px-6 bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Powerful Features</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-3 text-sm md:text-base">Everything you need to automate your payments seamlessly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard icon={Code} title="Easy Integration" desc="Seamlessly integrate with our robust API. Experience effortless payment verification automation in minutes." />
            <FeatureCard icon={Smartphone} title="Personal Automation" desc="Automate payments directly through your personal MFS accounts (bKash/Nagad) with 100% accuracy." />
            <FeatureCard icon={FileText} title="Invoice Automation" desc="Instantly send automated professional invoices and payment links to your customers' email upon order placement." />
            <FeatureCard icon={LinkIcon} title="Dynamic Payment Links" desc="Create no-code payment links to collect funds securely. No website required for your business operations." />
            <FeatureCard icon={Globe} title="Global Connectivity" desc="XelPay scales your business globally by supporting Stripe, PayPal, and Cryptocurrency gateways like Binance." />
            <FeatureCard icon={CreditCard} title="25+ Payment Methods" desc="Support for 25+ local and international methods, providing the most comprehensive automation suite available." />
            <FeatureCard icon={Shield} title="Bank-Grade Security" desc="Your money is 100% secure as funds are settled directly into your own bank or MFS account instantly." />
            <FeatureCard icon={Star} title="Affiliate Rewards" desc="Join our ecosystem and earn a 10% recurring lifetime commission for every successful merchant referral." />
            <FeatureCard icon={Database} title="Bank Sync (IMAP)" desc="Track bank transfers securely via IMAP. We monitor transaction emails without needing direct server-side access." />
          </div>
        </div>
      </section>

      {/* ===================== 4. PRICING ===================== */}
      <section id="pricing" className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Choose Your Plan</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-3 text-sm md:text-base">Transparent pricing for every scale of business.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {initialPlans?.map((plan: any) => {
            const transactionLabel =
              (plan.transaction_limit_monthly ?? 100) === 0
                ? 'Unlimited transactions / month'
                : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`;

            const columnFeatures: (string | null)[] = [
              transactionLabel,
              `${plan.business_limit ?? 1} business${(plan.business_limit ?? 1) > 1 ? 'es' : ''}`,
              ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map(
                (m: string) => methodLabels[m] ?? m
              ),
              plan.is_team_allowed
                ? `Team access — up to ${plan.allowed_team_members ?? 1} members`
                : 'Single user only',
              `${plan.device_limit ?? 1} device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
              plan.allowed_telegram_group ? 'Telegram group alerts' : null,
              plan.is_custom_bot_allowed ? 'Custom Telegram bot' : null,
            ];

            const extraFeatures: string[] = Array.isArray(plan.features) ? plan.features : [];
            const allFeatures = [...columnFeatures.filter(Boolean) as string[], ...extraFeatures];
            const planTag: string | null = plan.tag || null;

            return (
              // FIX 2: Light mode — white card with blue border; dark mode — dark card
              <div
                key={plan.id}
                className="p-8 md:p-10 rounded-3xl border-2 border-blue-600 transition-all hover:-translate-y-2 duration-300 flex flex-col relative
                  bg-white dark:bg-[#111827]
                  shadow-xl shadow-blue-600/10
                  mt-5"
              >
                {/* FIX 2: Dynamic tag badge from DB — format "text:color" */}
                {planTag && <PlanTagBadge tag={planTag} />}

                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {plan.name}
                </h3>

                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600">
                    {plan.price === 0 ? 'Free' : `৳${(plan.price).toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-slate-500 dark:text-slate-400 opacity-70 font-bold">/month</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {allFeatures.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 font-medium text-sm text-slate-600 dark:text-slate-300">
                      <Check size={16} className="shrink-0 mt-0.5 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Select button always blue */}
                <Link
                  href={`/signup?plan=${plan.id}`}
                  className="w-full block py-3.5 text-center rounded-xl font-bold transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5"
                >
                  {plan.price === 0 ? 'Start Free' : 'Select Plan'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== 5. REVIEWS ===================== */}
      <section id="reviews" className="py-20 md:py-24 bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tight">Trusted by Merchants</h2>
        </div>
        <div ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-[calc((100vw-1280px)/2+24px)] pb-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {initialReviews?.map((r: any) => (
            <div key={r.id} className="snap-center shrink-0 w-[85vw] md:w-[420px] flex flex-col pt-4">
              <div className="relative bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium leading-relaxed">"{r.comment}"</p>
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < (r.rating || 5) ? 'currentColor' : 'none'} strokeWidth={i < (r.rating || 5) ? 0 : 2} />
                  ))}
                </div>
                <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white dark:bg-[#111827] border-b border-r border-slate-200 dark:border-slate-800 rotate-45 z-10"></div>
              </div>
              <div className="flex items-center gap-4 mt-6 pl-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black text-white uppercase text-lg shadow-md">
                  {r.user_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{r.user_name}</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{r.user_role || 'Merchant'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {initialReviews?.map((_: any, idx: number) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-800'}`}></div>
          ))}
        </div>
      </section>

      {/* ===================== 6. FAQ & CONTACT ===================== */}
      <section className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div ref={faqSectionRef} className="max-w-3xl mx-auto mb-20 md:mb-24 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-10 text-center uppercase tracking-tight">Common Questions</h2>
          <div className="space-y-2 bg-[#F8FAFC] dark:bg-[#111827] p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {initialFaqs?.map((f: any) => <FaqItem key={f.id} question={f.question} answer={f.answer} />)}
          </div>
        </div>

        <div id="contact" className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Need Help?</h2>
            <p className="mb-8 font-medium opacity-90 max-w-xl text-sm md:text-base">
              Our technical support team is available 24/7 to help you with your payment automation journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href={initialSettings?.support_telegram} target="_blank" rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-1 transition shadow-xl w-full sm:w-auto">
                <Send size={18} /> Join Telegram
              </a>
              <a href={`mailto:${initialSettings?.support_email}`}
                className="bg-blue-700 border border-blue-400 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-1 transition w-full sm:w-auto">
                <Mail size={18} /> Email Support
              </a>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* ===================== 7. FOOTER — Always dark (standard practice) ===================== */}
      <footer id="about" className="bg-[#0f172a] text-slate-400 py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 pr-4">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-black text-blue-600 tracking-tighter">X</span>
              <span className="text-2xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed">
              Empowering merchants with the most reliable payment automation system in Bangladesh. Reliable, Secure, Precise.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> Company
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/about" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> About XelPay</Link></li>
              <li><Link href="/info/privacy" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Privacy Policy</Link></li>
              <li><Link href="/info/terms" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Terms of Service</Link></li>
              <li><Link href="/info/reseller" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Reseller Program</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" /> Developer
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/docs" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Developer Guidance</Link></li>
              <li><Link href="/info/api-reference" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> API Reference</Link></li>
              <li><Link href="/info/status" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> System Status</Link></li>
              <li><Link href="/info/plugins" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> CMS Plugins</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <HelpCircle size={16} className="text-blue-600" /> Support
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/ticket" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Help Center</Link></li>
              <li><a href={`mailto:${initialSettings?.support_email}`} className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Direct Support</a></li>
              <li><Link href="/info/affiliate" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> Affiliate Program</Link></li>
              <li>
                <a href="#faq" onClick={handleScrollToFaq} className="hover:text-white transition flex items-center gap-1.5 group cursor-pointer">
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition" /> All FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* FIX 3: Social icons — no card/bg, just icons. Mail icon added from support_email */}
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <div className="flex gap-5 items-center">
            <a href={initialSettings?.facebook} target="_blank" rel="noopener noreferrer"
              className="hover:scale-125 hover:opacity-100 opacity-80 transition-all duration-200" title="Facebook">
              <FacebookIcon size={22} />
            </a>
            <a href={initialSettings?.youtube} target="_blank" rel="noopener noreferrer"
              className="hover:scale-125 hover:opacity-100 opacity-80 transition-all duration-200" title="YouTube">
              <YoutubeIcon size={22} />
            </a>
            <a href={initialSettings?.support_telegram} target="_blank" rel="noopener noreferrer"
              className="hover:scale-125 hover:opacity-100 opacity-80 transition-all duration-200" title="Telegram">
              <TelegramIcon size={22} />
            </a>
            <a href={initialSettings?.whatsapp} target="_blank" rel="noopener noreferrer"
              className="hover:scale-125 hover:opacity-100 opacity-80 transition-all duration-200" title="WhatsApp">
              <WhatsAppIcon size={22} />
            </a>
            {/* FIX 3: Email icon — same source as Need Help card */}
            <a href={`mailto:${initialSettings?.support_email}`}
              className="hover:scale-125 hover:opacity-100 opacity-80 transition-all duration-200" title="Email">
              <MailIcon size={22} />
            </a>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            &copy; {new Date().getFullYear()} XelPay &bull; A product of{' '}
            <a href={initialSettings?.xenverse_link || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 opacity-100">
              Xenverse IT
            </a>
          </div>

          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-60">
            <span>Grow with tech</span>
            <span>Made with Precision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}