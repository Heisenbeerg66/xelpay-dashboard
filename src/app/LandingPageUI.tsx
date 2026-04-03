'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, cubicBezier } from 'framer-motion';
import {
  Menu, X, Moon, Sun, Check, Star, Zap, Shield, Smartphone, Globe,
  FileText, CreditCard, ArrowRight, PlayCircle, Send, Mail,
  ChevronDown, ChevronUp, HelpCircle, Code,
  Link as LinkIcon, Database, Building2, BookOpen, ChevronRight,
  Wallet, TrendingUp, Bell, QrCode, ArrowUpRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ── Supabase client (browser-safe) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── WhatsApp deep link helper ──
function buildWhatsAppLink(value: string): string {
  const digits = value.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

// ── Framer Motion variants ──
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: cubicBezier(0.22, 1, 0.36, 1) },
  }),
};

const FeatureCard = ({ icon: Icon, title, desc, index }: any) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={cardVariants}
    className="group p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all hover:-translate-y-1 duration-300 flex flex-col items-center text-center"
  >
    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-5">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

const FaqItem = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left outline-none"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-4">{question}</span>
        {isOpen ? <ChevronUp size={18} className="text-blue-600 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

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
const MailIconSvg = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

function PlanTagBadge({ tag }: { tag: string }) {
  const colorMap: Record<string, { gradient: string; text: string }> = {
    blue:   { gradient: 'from-blue-500 to-indigo-600',   text: 'text-white' },
    green:  { gradient: 'from-emerald-500 to-teal-600',  text: 'text-white' },
    orange: { gradient: 'from-orange-500 to-amber-500',  text: 'text-white' },
    purple: { gradient: 'from-purple-500 to-violet-600', text: 'text-white' },
    red:    { gradient: 'from-red-500 to-rose-600',      text: 'text-white' },
    amber:  { gradient: 'from-amber-400 to-yellow-500',  text: 'text-slate-900' },
  };
  const parts = tag.split(':');
  const label = parts[0].trim();
  const colorKey = (parts[1] || 'blue').trim().toLowerCase();
  const colors = colorMap[colorKey] || colorMap.blue;
  return (
    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${colors.gradient} ${colors.text} px-5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-lg whitespace-nowrap flex items-center gap-1.5`}>
      <span>{label.match(/^\p{Emoji}/u)?.[0] || '✦'}</span>
      <span>{label.replace(/^\p{Emoji}\s*/u, '')}</span>
    </div>
  );
}

function getPlanColors(tag: string | null): {
  border: string;
  button: string;
  price: string;
  check: string;
} {
  if (!tag) return {
    border: 'border-slate-200 dark:border-slate-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20',
    price: 'text-blue-600',
    check: 'text-blue-500',
  };
  const colorKey = (tag.split(':')[1] || 'blue').trim().toLowerCase();
  const map: Record<string, { border: string; button: string; price: string; check: string }> = {
    blue:   { border: 'border-blue-500',   button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20',     price: 'text-blue-600',    check: 'text-blue-500'    },
    green:  { border: 'border-emerald-500', button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20', price: 'text-emerald-600', check: 'text-emerald-500' },
    orange: { border: 'border-orange-500', button: 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20',   price: 'text-orange-500',  check: 'text-orange-500'  },
    purple: { border: 'border-purple-500', button: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20',   price: 'text-purple-600',  check: 'text-purple-500'  },
    red:    { border: 'border-red-500',    button: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20',           price: 'text-red-600',     check: 'text-red-500'     },
    amber:  { border: 'border-amber-400',  button: 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md shadow-amber-500/20', price: 'text-amber-500',   check: 'text-amber-500'   },
  };
  return map[colorKey] || map.blue;
}

const SECTIONS = ['hero', 'features', 'pricing', 'reviews', 'faq', 'contact'];

export default function LandingPageUI({ initialPlans, initialReviews, initialFaqs, initialSettings }: any) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('theme')) {
      setTheme('dark');
    }
  }, []);

  // ── Task 1: IntersectionObserver replaces scroll listener ──
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
              const hash = id === 'hero' ? '' : `#${id}`;
              window.history.replaceState(null, '', hash || window.location.pathname);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
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

  const handleScrollToFaq = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Task 4: Auth-aware support routing ──
  const handleTicketClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard/support');
    } else {
      router.push('/login?next=/dashboard/support');
    }
  };

  const methodLabels: Record<string, string> = {
    mobile: 'Mobile Banking (bKash / Nagad / Rocket)',
    bank: 'Bank Transfer via IMAP Sync',
    international: 'International (Stripe / PayPal / Crypto)',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-500 overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav ref={mobileMenuRef} className="fixed w-full z-50 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              { href: '/', label: 'Home' },
              { href: '#features', label: 'Features' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#about', label: 'About' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium">{item.label}</Link>
            ))}
            <a href="#faq" onClick={handleScrollToFaq} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium cursor-pointer">FAQs</a>
            {/* Auth-aware Help link */}
            <a href="#contact" onClick={handleTicketClick} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition font-medium cursor-pointer">Help</a>

            {mounted ? (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
              >
                {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            <Link href="/login" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition font-medium">Login</Link>
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-transform font-medium text-sm">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile icons */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted ? (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-amber-400 border border-blue-100 dark:border-blue-800/50 hover:scale-110 transition-all"
              >
                {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
            <Link href="/login" className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <button className="text-slate-900 dark:text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0d1526] border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="px-5 pt-4 pb-2 flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '#features', label: 'Features' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#about', label: 'About' },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all text-sm">
                  {item.label}
                </Link>
              ))}
              <a href="#faq" onClick={handleScrollToFaq}
                className="px-4 py-3 rounded-xl font-medium text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all text-sm cursor-pointer">
                FAQs
              </a>
              {/* Auth-aware Help Center for mobile */}
              <a href="#contact" onClick={(e) => { setMobileMenuOpen(false); handleTicketClick(e); }}
                className="px-4 py-3 rounded-xl font-medium text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all text-sm cursor-pointer">
                Help Center
              </a>
            </div>
            <div className="mx-5 h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
            <div className="px-5 pb-5 pt-3 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                Login Now
              </Link>
              <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">
                <Zap size={16} /> Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="pt-28 pb-12 md:pt-32 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium text-[10px] mb-5 uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
            <Zap size={11} /> The Ultimate Payment Solution
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.12] mb-5 tracking-tight">
            Automate Your{' '}
            <span className="text-blue-600">Payments</span>
            <br className="hidden md:block" />
            {' & '}Grow Your Business
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-7 leading-relaxed max-w-lg mx-auto md:mx-0">
            Instant verification via your{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">Personal, Agent, or Merchant</span>{' '}
            accounts. Receive funds directly — no third-party holding.
          </p>
          <div className="flex flex-row gap-3 justify-center md:justify-start">
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'}
              className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 md:px-7 md:py-3.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all">
              Get Started <ArrowRight size={15} />
            </Link>
            <button onClick={() => router.push('/login?mode=demo')}
              className="flex-1 md:flex-none bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-5 py-3 md:px-7 md:py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <PlayCircle size={15} /> Live Demo
            </button>
          </div>
        </div>

        {/* ── Task 3: Glassmorphism Hero Card ── */}
        <div className="hidden md:flex flex-col gap-3">
          {/* Main glass card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/30 dark:border-white/10 shadow-2xl shadow-blue-900/20">
            {/* Glass background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-slate-100/80 to-indigo-500/10 dark:from-blue-900/40 dark:via-[#0f172a]/80 dark:to-indigo-900/30 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-white/60 dark:bg-[#0f172a]/60" />
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

            <div className="relative z-10 p-5">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/40">
                    <Wallet size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-white font-semibold text-xs tracking-tight">Payment Dashboard</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">Real-time · Automated</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Live
                </span>
              </div>

              {/* Balance card — inner glass */}
              <div className="relative rounded-xl overflow-hidden mb-4 shadow-lg shadow-blue-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                <div className="relative z-10 p-4">
                  <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-[0.12em] mb-1.5">Total Collected Today</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-blue-300 font-medium">৳</span>
                    <span className="text-3xl font-black text-white tracking-tight tabular-nums">48,250</span>
                    <span className="text-blue-300 text-base font-medium">.00</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <TrendingUp size={11} className="text-emerald-300" />
                    <span className="text-[10px] text-emerald-300 font-semibold">+12.5% from yesterday</span>
                  </div>
                </div>
              </div>

              {/* Method breakdown — frosted mini cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'bKash', amount: '৳24,500', dotColor: 'bg-rose-500', labelColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-900/20', border: 'border-rose-200/60 dark:border-rose-800/30' },
                  { label: 'Nagad', amount: '৳18,750', dotColor: 'bg-orange-500', labelColor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50/70 dark:bg-orange-900/20', border: 'border-orange-200/60 dark:border-orange-800/30' },
                  { label: 'Stripe', amount: '$58.00', dotColor: 'bg-blue-500', labelColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/70 dark:bg-blue-900/20', border: 'border-blue-200/60 dark:border-blue-800/30' },
                ].map((m, i) => (
                  <div key={i} className={`${m.bg} border ${m.border} backdrop-blur-sm rounded-xl p-2.5 text-center`}>
                    <div className={`w-1.5 h-1.5 ${m.dotColor} rounded-full mx-auto mb-1.5`}></div>
                    <p className={`text-[9px] font-bold ${m.labelColor} uppercase tracking-wider`}>{m.label}</p>
                    <p className="text-slate-700 dark:text-slate-200 text-[10px] font-black mt-0.5 tabular-nums">{m.amount}</p>
                  </div>
                ))}
              </div>

              {/* Live transaction feed */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] mb-2">Recent Activity</p>
                {[
                  { icon: '💳', label: 'bKash Payment Verified', amount: '+৳1,500', time: 'Just now', color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: '🔔', label: 'Webhook → Order #XEL9921', amount: 'Sent', time: '2s ago', color: 'text-blue-500' },
                  { icon: '💰', label: 'Nagad Personal Verified', amount: '+৳850', time: '5s ago', color: 'text-emerald-600 dark:text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shrink-0 text-sm shadow-sm border border-white/60 dark:border-slate-700/50">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-200 font-semibold text-[10px] truncate">{item.label}</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[9px] mt-0.5 font-medium">{item.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${item.color} shrink-0`}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[{ val: '99.9%', label: 'Uptime' }, { val: '<1s', label: 'Verify' }, { val: '25+', label: 'Methods' }].map(s => (
              <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-center">
                <p className="text-blue-600 font-bold text-lg">{s.val}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 md:py-24 px-6 bg-slate-50 dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Powerful Features</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Everything you need to automate your payments seamlessly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard index={0} icon={Code} title="Easy Integration" desc="Seamlessly integrate with our robust API. Automate payment verification in minutes." />
            <FeatureCard index={1} icon={Smartphone} title="Personal Automation" desc="Automate payments directly through your personal MFS accounts (bKash/Nagad) with 100% accuracy." />
            <FeatureCard index={2} icon={FileText} title="Invoice Automation" desc="Instantly send automated professional invoices and payment links to your customers." />
            <FeatureCard index={3} icon={LinkIcon} title="Dynamic Payment Links" desc="Create no-code payment links to collect funds securely. No website required." />
            <FeatureCard index={4} icon={Globe} title="Global Connectivity" desc="Scale globally with Stripe, PayPal, and Cryptocurrency gateways like Binance." />
            <FeatureCard index={5} icon={CreditCard} title="25+ Payment Methods" desc="Support for 25+ local and international methods for comprehensive automation." />
            <FeatureCard index={6} icon={Shield} title="Bank-Grade Security" desc="Funds settle directly into your own bank or MFS account instantly and securely." />
            <FeatureCard index={7} icon={Star} title="Affiliate Rewards" desc="Earn a 10% recurring lifetime commission for every successful merchant referral." />
            <FeatureCard index={8} icon={Database} title="Bank Sync (IMAP)" desc="Track bank transfers securely via IMAP without needing direct server access." />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Choose Your Plan</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Transparent pricing for every scale of business.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {initialPlans?.map((plan: any, planIdx: number) => {
            const transactionLabel = (plan.transaction_limit_monthly ?? 100) === 0
              ? 'Unlimited transactions / month'
              : `${(plan.transaction_limit_monthly ?? 100).toLocaleString()} transactions / month`;
            const columnFeatures: (string | null)[] = [
              transactionLabel,
              `${plan.business_limit ?? 1} business${(plan.business_limit ?? 1) > 1 ? 'es' : ''}`,
              ...(Array.isArray(plan.allowed_method) ? plan.allowed_method : ['mobile']).map((m: string) => methodLabels[m] ?? m),
              plan.is_team_allowed ? `Team access — up to ${plan.allowed_team_members ?? 1} members` : 'Single user only',
              `${plan.device_limit ?? 1} device${(plan.device_limit ?? 1) > 1 ? 's' : ''}`,
              plan.allowed_telegram_group ? 'Telegram group alerts' : null,
              plan.is_custom_bot_allowed ? 'Custom Telegram bot' : null,
            ];
            const extraFeatures: string[] = Array.isArray(plan.features) ? plan.features : [];
            const allFeatures = [...columnFeatures.filter(Boolean) as string[], ...extraFeatures];
            const planTag: string | null = plan.tag || null;
            const planColors = getPlanColors(planTag);
            return (
              <motion.div
                key={plan.id}
                custom={planIdx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={cardVariants}
                className={`p-8 md:p-10 rounded-3xl border-2 ${planColors.border} transition-all hover:-translate-y-1 duration-300 flex flex-col relative bg-white dark:bg-[#111827] shadow-lg mt-5`}
              >
                {planTag && <PlanTagBadge tag={planTag} />}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="my-5 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${planColors.price}`}>
                    {plan.price === 0 ? 'Free' : `৳${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-slate-400 font-medium">/month</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {allFeatures.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <Check size={15} className={`shrink-0 mt-0.5 ${planColors.check}`} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan.id}`}
                  className={`w-full block py-3.5 text-center rounded-xl font-medium text-sm transition-all ${planColors.button}`}>
                  {plan.price === 0 ? 'Start Free' : 'Select Plan'}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-20 md:py-24 bg-slate-50 dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 tracking-tight">Trusted by Merchants</h2>
        </div>
        <div ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-[calc((100vw-1280px)/2+24px)] pb-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {initialReviews?.map((r: any) => (
            <div key={r.id} className="snap-center shrink-0 w-[85vw] md:w-[420px] flex flex-col pt-4">
              <div className="relative bg-white dark:bg-[#111827] p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <p className="text-slate-600 dark:text-slate-300 mb-5 leading-relaxed text-sm">"{r.comment}"</p>
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < (r.rating || 5) ? 'currentColor' : 'none'} strokeWidth={i < (r.rating || 5) ? 0 : 2} />
                  ))}
                </div>
                <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white dark:bg-[#111827] border-b border-r border-slate-200 dark:border-slate-800 rotate-45 z-10"></div>
              </div>
              <div className="flex items-center gap-4 mt-6 pl-6">
                <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-base shadow-md">
                  {r.user_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm">{r.user_name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{r.user_role || 'Merchant'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {initialReviews?.map((_: any, idx: number) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}></div>
          ))}
        </div>
      </section>

      {/* ── FAQ & CONTACT ── */}
      <section id="faq" className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div ref={faqSectionRef} className="max-w-3xl mx-auto mb-20 scroll-mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center tracking-tight">Common Questions</h2>
          <div className="bg-slate-50 dark:bg-[#111827] p-5 md:p-7 rounded-3xl border border-slate-200 dark:border-slate-800">
            {initialFaqs?.map((f: any) => <FaqItem key={f.id} question={f.question} answer={f.answer} />)}
          </div>
        </div>

        {/* ── Task 4: Contact section with auth-aware button ── */}
        <div id="contact" className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl mb-5 flex items-center justify-center">
              <HelpCircle size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Need Help?</h2>
            <p className="mb-8 opacity-90 max-w-xl text-sm leading-relaxed">
              Our technical support team is available 24/7 to help with your payment automation journey.
            </p>
            <button
              onClick={handleTicketClick}
              className="bg-white text-blue-600 px-10 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition shadow-xl w-full sm:w-auto cursor-pointer"
            >
              <HelpCircle size={16} /> Contact Us
            </button>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" className="bg-[#0f172a] text-slate-400 py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5 pr-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-3xl font-black text-blue-600 tracking-tighter">X</span>
              <span className="text-2xl font-semibold text-white tracking-tight -ml-0.5">elPay</span>
            </Link>
            <p className="text-sm leading-relaxed">Empowering merchants with the most reliable payment automation in Bangladesh.</p>
            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Contact Us</p>
              {initialSettings?.support_email && (
                <a href={`mailto:${initialSettings.support_email}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                    <Mail size={13} className="text-slate-500 group-hover:text-blue-400" />
                  </div>
                  {initialSettings.support_email}
                </a>
              )}
              {initialSettings?.whatsapp && (
                <a href={buildWhatsAppLink(initialSettings.whatsapp)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-blue-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.08-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  {initialSettings.whatsapp}
                </a>
              )}
            </div>
          </div>

          {[
            { title: 'Useful Links', links: [
              { href: '/signup', label: 'Register' },
              { href: '/login', label: 'Login' },
              { href: '#pricing', label: 'Pricing' },
              { href: '/info/affiliate', label: 'Affiliate Program' },
              { href: '/info/reseller', label: 'Reseller Program' },
            ]},
            { title: 'Company & Legal', links: [
              { href: '/info/about', label: 'About XelPay' },
              { href: '/info/privacy', label: 'Privacy Policy' },
              { href: '/info/terms', label: 'Terms of Service' },
              { href: '/info/status', label: 'System Status' },
            ]},
            { title: 'Developer & Support', links: [
              { href: '/info/docs', label: 'Developer Guidance' },
              { href: '/info/api-reference', label: 'API Reference' },
              { href: '/info/plugins', label: 'CMS Plugins' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-[10px] uppercase tracking-widest mb-5">{col.title}</h4>
              <ul className="space-y-3 text-sm">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white transition flex items-center gap-1.5 group">
                      <ChevronRight size={13} className="text-slate-700 group-hover:text-blue-500 transition" /> {link.label}
                    </Link>
                  </li>
                ))}
                {col.title === 'Developer & Support' && (
                  <>
                    <li>
                      <a href="#faq" onClick={handleScrollToFaq} className="hover:text-white transition flex items-center gap-1.5 group cursor-pointer">
                        <ChevronRight size={13} className="text-slate-700 group-hover:text-blue-500 transition" /> All FAQs
                      </a>
                    </li>
                    {/* Auth-aware Help Center link in footer */}
                    <li>
                      <a href="#contact" onClick={handleTicketClick} className="hover:text-white transition flex items-center gap-1.5 group cursor-pointer">
                        <ChevronRight size={13} className="text-slate-700 group-hover:text-blue-500 transition" /> Submit a Ticket
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex gap-5 items-center">
            {[
              { href: initialSettings?.facebook, Icon: FacebookIcon },
              { href: initialSettings?.youtube, Icon: YoutubeIcon },
              { href: initialSettings?.support_telegram, Icon: TelegramIcon },
              {
                href: initialSettings?.whatsapp ? buildWhatsAppLink(initialSettings.whatsapp) : undefined,
                Icon: WhatsAppIcon,
              },
              { href: `mailto:${initialSettings?.support_email}`, Icon: MailIconSvg },
            ].map(({ href, Icon }, i) => (
              href ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="hover:scale-125 hover:opacity-100 opacity-70 transition-all duration-200">
                  <Icon size={22} />
                </a>
              ) : null
            ))}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest opacity-50">
            &copy; {new Date().getFullYear()} XelPay &bull; A product of{' '}
            <a href={initialSettings?.xenverse_link || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 opacity-100">
              Xenverse IT
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}