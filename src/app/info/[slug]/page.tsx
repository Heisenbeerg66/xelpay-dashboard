import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Users, Code, BookOpen,
  Activity, Puzzle, Ticket, BadgeDollarSign, Building2,
  Menu, Send, Mail, HelpCircle, ChevronRight } from 'lucide-react';

const pageData: Record<string, {
  title: string;
  content: string;
  icon: any;
  sections?: { heading: string; body: string }[];
}> = {
  'about': {
    title: 'About XelPay',
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
    icon: BadgeDollarSign,
    content: 'Earn lifetime recurring commissions by referring merchants to XelPay.',
    sections: [
      { heading: 'Commission', body: 'Earn 10% lifetime recurring commission on every subscription fee paid by referred merchants, credited monthly with no cap.' },
      { heading: 'How It Works', body: 'Register from your dashboard to receive a unique referral link. When merchants subscribe using your link, you earn automatically.' },
      { heading: 'Payout', body: 'Paid monthly via bKash or bank transfer. Minimum payout: ৳500. Processed on the 5th of each month.' },
      { heading: 'Tracking', body: 'Real-time click tracking, signups, active referrals, and commission history in your affiliate dashboard.' },
    ]
  },
};

// Fix 6: Landing page header & footer on info pages
async function InfoHeader() {
  return (
    <header className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-6 justify-between sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-1">
        <span className="text-2xl font-black text-blue-600 tracking-tighter">X</span>
        <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight -ml-0.5">elPay</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors font-medium">Home</Link>
        <Link href="/login" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-all">Login</Link>
      </div>
    </header>
  );
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

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = pageData[slug] || {
    title: 'Page Not Found',
    icon: FileText,
    content: 'The page you are looking for does not exist or has been moved.',
    sections: [],
  };

  const IconComponent = data.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col">
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

          {/* Sections */}
          {data.sections && data.sections.length > 0 && (
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