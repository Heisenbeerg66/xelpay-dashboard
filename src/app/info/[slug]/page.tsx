import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Users, Code, BookOpen,
  Activity, Puzzle, Ticket, BadgeDollarSign, Building2,
  Send, Mail, HelpCircle, ChevronRight, Phone, MessageCircle,
  Facebook, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import InfoHeader from './InfoHeader';

// ── Supabase server client ──
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Page data map ──
const pageData: Record<string, {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  icon: any;
  sections?: { heading: string; body: string }[];
}> = {
  'about': {
    title: 'About XelPay',
    metaTitle: 'About Us | XelPay',
    metaDescription: 'Learn about XelPay — Bangladesh\'s leading payment automation gateway. Our mission, vision, and what we do.',
    icon: Building2,
    content: 'XelPay is a robust payment automation gateway designed for modern businesses in Bangladesh.',
    sections: [
      { heading: 'Our Mission', body: 'We empower merchants by bridging the gap between personal MFS accounts and professional business automation — making payment collection seamless, secure, and scalable.' },
      { heading: 'What We Do', body: 'XelPay automates payment verification using your personal, agent, or merchant bKash, Nagad, and Rocket accounts. Funds land directly in your account with no third-party holding.' },
      { heading: 'Our Vision', body: 'We are building the most reliable payment infrastructure in Bangladesh, expanding globally with support for Stripe, PayPal, and crypto gateways.' },
    ]
  },
  'privacy': {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | XelPay',
    metaDescription: 'XelPay\'s privacy policy — how we collect, use, and protect your personal data.',
    icon: Shield,
    content: 'We take your privacy seriously. Your trust is our highest priority.',
    sections: [
      { heading: 'Data Collection', body: 'We collect only the minimum information necessary — including account credentials, business name, and transaction identifiers. We never collect unnecessary personal data.' },
      { heading: 'Data Usage', body: 'Your data is used exclusively to provide secure payment verification services and match incoming payments to your orders in real time.' },
      { heading: 'Data Security', body: 'All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We follow industry-standard security protocols and conduct regular audits.' },
      { heading: 'Third Parties', body: 'We do not sell, rent, or share your personal data for marketing. Payment processor integrations are governed by their respective privacy policies.' },
      { heading: 'Your Rights', body: 'You may request deletion of your data at any time by contacting support. We will comply within 7 business days.' },
    ]
  },
  'terms': {
    title: 'Terms of Service',
    metaTitle: 'Terms of Service | XelPay',
    metaDescription: 'Read XelPay\'s terms of service before using our payment automation platform.',
    icon: FileText,
    content: 'Please read these terms carefully before using XelPay services.',
    sections: [
      { heading: 'Acceptance', body: 'By using XelPay, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please discontinue use immediately.' },
      { heading: 'Permitted Use', body: 'XelPay is intended for legal business payment collection only. Do not use our platform for fraudulent transactions, money laundering, or any illegal activities.' },
      { heading: 'Merchant Responsibility', body: 'Merchants are solely responsible for the legality of their business, proper tax compliance, and ensuring payment activities comply with Bangladesh Bank regulations.' },
      { heading: 'Service Availability', body: 'We strive for 99.9% uptime but do not guarantee uninterrupted service. Planned maintenance windows will be communicated 24 hours in advance.' },
      { heading: 'Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm other users.' },
    ]
  },
  'reseller': {
    title: 'Reseller Program',
    metaTitle: 'Reseller Program | XelPay',
    metaDescription: 'Join XelPay\'s reseller program and earn recurring income by onboarding merchants.',
    icon: Users,
    content: 'Join our reseller program and build a recurring business empowering merchants with XelPay.',
    sections: [
      { heading: 'Overview', body: 'As a XelPay reseller, you onboard merchants under your own brand while earning sustainable recurring income from every active subscription.' },
      { heading: 'Earning Potential', body: 'Resellers earn a competitive percentage of every subscription renewal. The more merchants you onboard, the higher your monthly recurring revenue.' },
      { heading: 'White-Label', body: 'Enterprise resellers can access white-label configurations with custom domains and branding.' },
      { heading: 'How to Join', body: 'Apply from your merchant dashboard. Our partnership team will review your application within 48 hours.' },
    ]
  },
  'docs': {
    title: 'Developer Guidance',
    metaTitle: 'Developer Docs | XelPay',
    metaDescription: 'Everything you need to integrate XelPay into your application. API guides, SDKs, and webhooks.',
    icon: Code,
    content: 'Everything you need to integrate XelPay into your application.',
    sections: [
      { heading: 'Getting Started', body: 'XelPay provides a RESTful API easy to integrate with any backend. Start by creating a merchant account and generating your API key from dashboard settings.' },
      { heading: 'Supported Frameworks', body: 'Official SDKs and code examples for Node.js, PHP, Python, React, Vue, and plain JavaScript.' },
      { heading: 'Webhook Integration', body: 'XelPay uses webhooks for real-time payment notifications. Configure your webhook URL in the dashboard and verify payloads using HMAC signatures.' },
      { heading: 'Testing', body: 'A full sandbox environment is available for development. Use test credentials from your dashboard to simulate payments.' },
    ]
  },
  'api-reference': {
    title: 'API Reference',
    metaTitle: 'API Reference | XelPay',
    metaDescription: 'Complete API reference for all XelPay endpoints, authentication, and webhook signatures.',
    icon: BookOpen,
    content: 'Complete reference for all XelPay API endpoints and authentication.',
    sections: [
      { heading: 'Authentication', body: 'All API requests must include your API key in the Authorization header as a Bearer token. Never expose keys client-side.' },
      { heading: 'Base URL', body: 'All requests go to: https://api.xelpay.com/v1. Responses are in JSON with standard HTTP status codes.' },
      { heading: 'HMAC Signature', body: 'XelPay signs all webhook payloads using HMAC-SHA256. Verify the X-XelPay-Signature header against your webhook secret.' },
      { heading: 'Rate Limits', body: 'Up to 300 requests per minute per merchant. Rate limit headers are included in every response.' },
    ]
  },
  'status': {
    title: 'System Status',
    metaTitle: 'System Status | XelPay',
    metaDescription: 'Real-time operational status of all XelPay services and infrastructure.',
    icon: Activity,
    content: 'Real-time status of all XelPay services and infrastructure.',
    sections: [
      { heading: 'Core Services', body: 'All payment verification engines, webhook delivery, and dashboard panels are fully operational with 99.99% uptime over the past 90 days.' },
      { heading: 'MFS Connectivity', body: 'bKash, Nagad, and Rocket gateways are active and processing normally. Average verification latency is under 800ms.' },
      { heading: 'Maintenance', body: 'No maintenance windows currently scheduled. We notify merchants 24 hours in advance via dashboard and email.' },
      { heading: 'Incident History', body: 'No critical incidents in the past 30 days.' },
    ]
  },
  'plugins': {
    title: 'CMS Plugins',
    metaTitle: 'CMS Plugins | XelPay',
    metaDescription: 'Official XelPay plugins for WooCommerce, Shopify, WordPress, and more.',
    icon: Puzzle,
    content: 'Official XelPay plugins for popular CMS and eCommerce platforms.',
    sections: [
      { heading: 'WooCommerce', body: 'Our official WooCommerce plugin enables automatic payment verification for WordPress stores. Configure with your API key in under 5 minutes.' },
      { heading: 'Shopify', body: 'The XelPay Shopify app integrates directly with checkout, enabling bKash and Nagad payment options natively.' },
      { heading: 'WordPress', body: 'For general WordPress sites, our plugin provides payment collection and verification via shortcodes and blocks.' },
      { heading: 'Custom Integration', body: 'Use our REST API and webhook system to build a custom integration for any platform.' },
    ]
  },
  'ticket': {
    title: 'Help Center',
    metaTitle: 'Help Center | XelPay',
    metaDescription: 'Get support from XelPay\'s technical team. Submit tickets, live chat, and community support.',
    icon: Ticket,
    content: 'Get support from our dedicated technical team anytime.',
    sections: [
      { heading: 'Submit a Ticket', body: 'Navigate to Support > New Ticket in your dashboard. Describe your issue, attach screenshots if needed, and submit. You will receive a ticket ID immediately.' },
      { heading: 'Response Times', body: 'Our team responds within 24 hours. Critical payment issues are typically resolved within 4 hours during business hours.' },
      { heading: 'Live Chat', body: 'Use the live chat widget in your dashboard. Available 9 AM to 11 PM Bangladesh Standard Time, 7 days a week.' },
      { heading: 'Telegram Community', body: 'Join our merchant Telegram group for community support and announcements.' },
    ]
  },
  'affiliate': {
    title: 'Affiliate Program',
    metaTitle: 'Affiliate Program | XelPay',
    metaDescription: 'Earn lifetime recurring commissions by referring merchants to XelPay. 10% commission, no cap.',
    icon: BadgeDollarSign,
    content: 'Earn lifetime recurring commissions by referring merchants to XelPay.',
    sections: [
      { heading: 'Commission', body: 'Earn 10% lifetime recurring commission on every subscription fee paid by referred merchants, credited monthly with no cap.' },
      { heading: 'How It Works', body: 'Register from your dashboard to receive a unique referral link. When merchants subscribe using your link, you earn automatically.' },
      { heading: 'Payout', body: 'Paid monthly via bKash or bank transfer. Minimum payout: ৳500. Processed on the 5th of each month.' },
      { heading: 'Tracking', body: 'Real-time click tracking, signups, active referrals, and commission history in your affiliate dashboard.' },
    ]
  },
  // Fix 7: contact page — dynamic from DB
  'contact': {
    title: 'Contact Us',
    metaTitle: 'Contact Us | XelPay',
    metaDescription: 'Reach XelPay\'s support team via Telegram, WhatsApp, Email, or Facebook. We\'re here 24/7.',
    icon: HelpCircle,
    content: 'Our support team is available 24/7 to help you with any questions.',
    sections: [],
  },
};

// ── Generate metadata per slug ──
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = pageData[slug];
  if (!data) return { title: 'Not Found | XelPay' };
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      siteName: 'XelPay',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

function InfoFooter() {
  return (
    <footer className="bg-[#0f172a] text-slate-500 py-8 px-6 border-t border-slate-800 mt-16">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
          <span className="text-lg font-semibold text-white tracking-tight -ml-0.5">elPay</span>
        </Link>
        <div className="flex gap-5">
          {[
            { href: '/info/privacy', label: 'Privacy' },
            { href: '/info/terms', label: 'Terms' },
            { href: '/info/about', label: 'About' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
          ))}
        </div>
        <span className="opacity-40 uppercase tracking-widest text-[10px]">© {new Date().getFullYear()} XelPay</span>
      </div>
    </footer>
  );
}

// ── Contact Page Content (dynamic from DB) ──
async function ContactContent() {
  const supabase = getSupabase();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key_name, value')
    .in('key_name', ['support_telegram', 'support_email', 'support_phone', 'whatsapp', 'facebook']);

  const s: Record<string, string> = {};
  settings?.forEach((r: any) => { s[r.key_name] = r.value; });

  const channels = [
    {
      key: 'support_telegram',
      label: 'Telegram',
      value: s.support_telegram,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="#26A5E4">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      href: s.support_telegram,
      isLink: true,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      value: s.whatsapp,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      ),
      href: s.whatsapp,
      isLink: true,
    },
    {
      key: 'support_email',
      label: 'Email',
      value: s.support_email,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      href: s.support_email ? `mailto:${s.support_email}` : null,
      isLink: true,
    },
    {
      key: 'support_phone',
      label: 'Phone',
      value: s.support_phone,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.08-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      href: s.support_phone ? `tel:${s.support_phone}` : null,
      isLink: true,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      value: s.facebook,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: s.facebook,
      isLink: true,
    },
  ].filter(ch => ch.value);

  return (
    <div className="space-y-3">
      {channels.map((ch) => (
        <div key={ch.key} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
            {ch.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{ch.label}</p>
            {ch.href ? (
              <a href={ch.href} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block">
                {ch.value}
              </a>
            ) : (
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{ch.value}</p>
            )}
          </div>
          {ch.href && (
            <a href={ch.href} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shrink-0">
              <ChevronRight size={14} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = pageData[slug] || {
    title: 'Page Not Found',
    metaTitle: 'Not Found | XelPay',
    metaDescription: '',
    icon: FileText,
    content: 'The page you are looking for does not exist or has been moved.',
    sections: [],
  };

  const IconComponent = data.icon;
  const isContact = slug === 'contact';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col">
      {/* Fix 6: InfoHeader is a client component with theme toggle, menu */}
      <InfoHeader />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Header Card */}
          <div className="bg-white dark:bg-[#111827] p-7 md:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                <IconComponent size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{data.title}</h1>
                <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-2"></div>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{data.content}</p>
          </div>

          {/* Fix 7: Contact page — dynamic channels from DB */}
          {isContact ? (
            <ContactContent />
          ) : (
            /* Regular Sections */
            data.sections && data.sections.length > 0 && (
              <div className="space-y-3">
                {data.sections.map((section, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#111827] p-5 md:p-7 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></span>
                      {section.heading}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{section.body}</p>
                  </div>
                ))}
              </div>
            )
          )}

          <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </main>

      <InfoFooter />
    </div>
  );
}