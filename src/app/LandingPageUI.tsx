'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, Moon, Sun, Check, Star, Zap, Shield, Smartphone, Globe, 
  FileText, CreditCard, ArrowRight, PlayCircle, Server, Send, Mail, 
  Facebook, Youtube, ChevronDown, ChevronUp, HelpCircle, Code, 
  Link as LinkIcon, BadgeCheck, Database, Building2, BookOpen, User, ChevronRight
} from 'lucide-react';

// --- ✅ Reusable Components Updated ---
const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="group p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all hover:-translate-y-1.5 duration-300 flex flex-col items-center text-center">
    {/* Container turns blue on hover, text turns white */}
    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-6">
      {/* ✅ Fixed: Removed fill-current, added strokeWidth={1.5} for thinner outline style like images 7 & 8 */}
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
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-5 flex justify-between items-center text-left focus-visible:ring-2 focus-visible:ring-blue-600 outline-none rounded-lg">
        <span className="text-base font-bold text-slate-800 dark:text-slate-200">{question}</span>
        {isOpen ? <ChevronUp className="text-blue-600 shrink-0" /> : <ChevronDown className="text-slate-400 shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
};

const WhatsAppIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default function LandingPageUI({ initialPlans, initialReviews, initialFaqs, initialSettings }: any) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // Auto Slider Logic (3 Seconds)
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

  const handleLiveDemo = () => {
    router.push('/login?mode=demo');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-500 overflow-x-hidden">
      {/* 1. Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Text-Based Brand Logo */}
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
            
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <Link href="/login" className="text-slate-900 dark:text-white hover:text-blue-600 transition">Login</Link>
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'} className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-transform">Start Free Trial</Link>
          </div>

          {/* Mobile Nav Actions */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <Link href="/login" className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <User size={20}/>
            </Link>
            <button className="text-slate-900 dark:text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5 shadow-xl z-40 animate-in slide-in-from-top-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 dark:text-white text-lg">Home</Link>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 dark:text-white text-lg">Features</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 dark:text-white text-lg">Pricing</Link>
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 dark:text-white text-lg">About</Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 dark:text-white text-lg">Help Center</Link>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'} className="bg-blue-600 text-white text-center py-3.5 rounded-xl font-bold text-lg shadow-lg">Start Free Trial</Link>
          </div>
        )}
      </nav>

      {/* 2. Premium Hero Section */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 max-w-7xl mx-auto text-center lg:text-left grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] md:text-xs mb-6 uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
            <Zap size={14} /> The Ultimate Payment Solution
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.15] mb-6 tracking-tight">
            {/* ✅ ULTIMATE FIX for T Cutoff: inline-block + extra padding + tight leading */}
            Instant <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic pr-8 py-3 leading-tight">Payment Automation</span> for Your Business
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Automate verifications using your <span className="text-slate-900 dark:text-white font-black underline decoration-blue-500 decoration-2">Personal, Agent, or Merchant</span> accounts. Receive funds directly without any third-party holding.
          </p>
          
          {/* Side-by-Side Mobile Buttons */}
          <div className="flex flex-row gap-3 justify-center lg:justify-start w-full mx-auto lg:mx-0">
            <Link href={starterPlanId ? `/signup?plan=${starterPlanId}` : '/signup'} className="flex-1 lg:flex-none bg-blue-600 text-white px-2 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-full font-bold text-sm md:text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-1.5 hover:-translate-y-1 transition-all">
              Get Started <ArrowRight size={18}/>
            </Link>
            <button onClick={handleLiveDemo} className="flex-1 lg:flex-none bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-2 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <PlayCircle size={18}/> Live Demo
            </button>
          </div>
        </div>
        
        <div className="relative bg-white dark:bg-[#111827] p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 hidden lg:block overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 animate-pulse"></div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Server className="text-blue-600 animate-pulse"/>
              <h4 className="font-bold dark:text-white text-sm uppercase tracking-wider">Live Server Log</h4>
            </div>
            <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full font-black animate-pulse flex items-center gap-2 border border-green-100 dark:border-green-800/30">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> ONLINE
            </span>
          </div>
          <div className="space-y-4 relative">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800">
              <BadgeCheck className="text-green-500 shrink-0" size={28}/>
              <div className="flex-1">
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Payment Verified</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">bKash Merchant • ৳ 1,500.00</p>
              </div>
              <span className="text-xs font-black text-green-600">Just now</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <Zap className="text-blue-500 shrink-0" size={28}/>
              <div className="flex-1">
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Webhook Triggered</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Order #XEL9921XP</p>
              </div>
              <span className="text-xs font-black text-blue-600">2s ago</span>
            </div>
          </div>
        </div>
      </section>{/* 3. Features Section */}
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

      {/* 4. Pricing */}
      <section id="pricing" className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Choose Your Plan</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-3 text-sm md:text-base">Transparent pricing for every scale of business.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {initialPlans?.map((plan: any) => {
            const isPremium = plan.serial === 2;
            return (
              <div key={plan.id} className={`p-8 md:p-10 rounded-3xl border md:border-2 transition-all hover:-translate-y-2 duration-300 flex flex-col relative ${isPremium ? 'border-blue-600 bg-slate-900 text-white shadow-2xl shadow-blue-600/20 dark:bg-[#111827]' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'}`}>
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    Best Value
                  </div>
                )}
                <h3 className={`text-xl font-black uppercase tracking-tight ${!isPremium && 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                <div className="my-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${!isPremium && 'text-slate-900 dark:text-white'}`}>৳{plan.price}</span>
                  <span className="text-sm opacity-60 font-bold">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className={`flex items-start gap-3 font-medium text-sm md:text-base ${!isPremium && 'text-slate-600 dark:text-slate-300'}`}>
                      <Check size={18} className={`shrink-0 mt-0.5 ${isPremium ? 'text-blue-400' : 'text-blue-600'}`}/> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan.id}`} className={`w-full block py-3.5 text-center rounded-xl font-bold transition-all ${isPremium ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-500' : 'bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>Select Plan</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Reviews */}
      <section id="reviews" className="py-20 md:py-24 bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 overflow-hidden">
         <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tight">Trusted by Merchants</h2>
         </div>
         
         <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-[calc((100vw-1280px)/2+24px)] pb-10 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {initialReviews?.map((r: any, index: number) => (
              <div key={r.id} className="snap-center shrink-0 w-[85vw] md:w-[420px] flex flex-col pt-4">
                
                {/* Chat Bubble Card */}
                <div className="relative bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                  <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium leading-relaxed">"{r.comment}"</p>
                  
                  {/* Dynamic Stars Rating */}
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (r.rating || 5) ? "currentColor" : "none"} strokeWidth={i < (r.rating || 5) ? 0 : 2} />
                    ))}
                  </div>

                  {/* Down Arrow (Bubble Tail) */}
                  <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white dark:bg-[#111827] border-b border-r border-slate-200 dark:border-slate-800 rotate-45 z-10"></div>
                </div>

                {/* User Info Below Bubble */}
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

          {/* Slider Indicators */}
          <div className="flex justify-center gap-2 mt-2">
            {initialReviews?.map((_: any, idx: number) => {
                return (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-800'}`}></div>
                );
            })}
          </div>
      </section>

      {/* 6. FAQ & Contact */}
      <section className="py-20 md:py-24 px-6 bg-white dark:bg-[#0B1120]">
        <div className="max-w-3xl mx-auto mb-20 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-10 text-center uppercase tracking-tight">Common Questions</h2>
          <div className="space-y-2 bg-[#F8FAFC] dark:bg-[#111827] p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {initialFaqs?.map((f: any) => <FaqItem key={f.id} question={f.question} answer={f.answer} />)}
          </div>
        </div>

        <div id="contact" className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
           <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6 flex items-center justify-center backdrop-blur-sm shadow-inner"><HelpCircle size={32} /></div>
             <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Need Help?</h2>
             <p className="mb-8 font-medium opacity-90 max-w-xl text-sm md:text-base">Our technical support team is available 24/7 to help you with your payment automation journey.</p>
             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <a href={initialSettings.telegram} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-1 transition shadow-xl w-full sm:w-auto"><Send size={18} /> Join Telegram</a>
               <a href={`mailto:${initialSettings.support_email}`} className="bg-blue-700 border border-blue-400 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-1 transition w-full sm:w-auto"><Mail size={18} /> Email Support</a>
             </div>
           </div>
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer id="about" className="bg-[#0f172a] text-slate-400 py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 pr-4">
            {/* Text-Based Logo in Footer */}
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-black text-blue-600 tracking-tighter">X</span>
              <span className="text-2xl font-bold text-white tracking-tight -ml-0.5">elPay</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed">Empowering merchants with the most reliable payment automation system in Bangladesh. Reliable, Secure, Precise.</p>
          </div>
          
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2"><Building2 size={16} className="text-blue-600"/> Company</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/about" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> About XelPay</Link></li>
              <li><Link href="/info/privacy" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Privacy Policy</Link></li>
              <li><Link href="/info/terms" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Terms of Service</Link></li>
              <li><Link href="/info/reseller" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Reseller Program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2"><BookOpen size={16} className="text-blue-600"/> Developer</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/docs" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Developer Guidance</Link></li>
              <li><Link href="/info/api-reference" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> API Reference</Link></li>
              <li><Link href="/info/status" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> System Status</Link></li>
              <li><Link href="/info/plugins" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> CMS Plugins</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2"><HelpCircle size={16} className="text-blue-600"/> Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/info/ticket" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Help Center</Link></li>
              <li><a href={`mailto:${initialSettings.support_email}`} className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Direct Support</a></li>
              <li><Link href="/info/affiliate" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> Affiliate Program</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition flex items-center gap-1.5 group"><ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition"/> All FAQs</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Icons & Copyright at the bottom */}
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <div className="flex gap-4">
            <a href={initialSettings.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600 transition shadow-sm"><Facebook size={18} /></a>
            <a href={initialSettings.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-red-600 transition shadow-sm"><Youtube size={18} /></a>
            <a href={initialSettings.telegram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-blue-400 transition shadow-sm"><Send size={18} /></a>
            <a href={initialSettings.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-green-500 transition shadow-sm"><WhatsAppIcon size={18} /></a>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            &copy; {new Date().getFullYear()} XelPay &bull; A product of <span className="text-blue-500 opacity-100">Xenverse IT</span>
          </div>
          
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-60 hidden md:flex">
            <span>Grow with tech</span>
            <span>Made with Precision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}