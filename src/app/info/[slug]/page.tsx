import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Users, Code, BookOpen, 
         Activity, Puzzle, Ticket, BadgeDollarSign, Building2 } from 'lucide-react';

const pageData: Record<string, {
  title: string;
  content: string;
  icon: any;
  sections?: { heading: string; body: string }[];
}> = {
  'about': {
    title: 'About XelPay',
    icon: Building2,
    content: 'XelPay is a robust payment automation gateway designed specifically for the modern businesses of Bangladesh.',
    sections: [
      { heading: 'Our Mission', body: 'We empower merchants by bridging the gap between personal MFS accounts and professional business automation. Our goal is to make payment collection seamless, secure, and scalable for every business.' },
      { heading: 'What We Do', body: 'XelPay automates payment verification using your personal, agent, or merchant bKash, Nagad, and Rocket accounts. Funds land directly in your account — no third-party holding.' },
      { heading: 'Our Vision', body: 'We are building the most reliable payment infrastructure in Bangladesh, expanding globally with international payment support including Stripe, PayPal, and crypto gateways.' },
    ]
  },
  'privacy': {
    title: 'Privacy Policy',
    icon: Shield,
    content: 'We take your privacy seriously. Your trust is our highest priority.',
    sections: [
      { heading: 'Data Collection', body: 'We collect only the minimum information necessary to provide our services — including your account credentials, business name, and transaction identifiers. We never collect unnecessary personal data.' },
      { heading: 'Data Usage', body: 'Your data is used exclusively to provide secure payment verification services. We process transaction data to match incoming payments to your orders in real time.' },
      { heading: 'Data Security', body: 'All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We follow industry-standard security protocols and conduct regular audits.' },
      { heading: 'Third Parties', body: 'We do not sell, rent, or share your personal data with third parties for marketing purposes. Payment processor integrations are governed by their respective privacy policies.' },
      { heading: 'Your Rights', body: 'You may request deletion of your data at any time by contacting our support team. We will comply within 7 business days.' },
    ]
  },
  'terms': {
    title: 'Terms of Service',
    icon: FileText,
    content: 'Please read these terms carefully before using XelPay services.',
    sections: [
      { heading: 'Acceptance of Terms', body: 'By accessing or using XelPay, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please discontinue use immediately.' },
      { heading: 'Permitted Use', body: 'XelPay is intended for legal business payment collection only. You must not use our platform for fraudulent transactions, money laundering, or any illegal activities.' },
      { heading: 'Merchant Responsibility', body: 'Merchants are solely responsible for the legality of their business, proper tax compliance, and ensuring their payment activities comply with Bangladesh Bank regulations and relevant laws.' },
      { heading: 'Service Availability', body: 'We strive for 99.9% uptime but do not guarantee uninterrupted service. Planned maintenance windows will be communicated 24 hours in advance.' },
      { heading: 'Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm other users of the platform.' },
    ]
  },
  'reseller': {
    title: 'Reseller Program',
    icon: Users,
    content: 'Join our reseller program and build a recurring business empowering merchants with XelPay.',
    sections: [
      { heading: 'Program Overview', body: 'As a XelPay reseller, you gain the ability to onboard merchants under your own brand while earning a sustainable recurring income from every active subscription.' },
      { heading: 'Earning Potential', body: 'Resellers earn a competitive percentage of every subscription renewed under their portfolio. The more merchants you onboard, the higher your monthly recurring revenue.' },
      { heading: 'White-Label Options', body: 'Enterprise resellers can access white-label configurations, allowing you to present XelPay under your own brand with custom domains and branding.' },
      { heading: 'How to Join', body: 'Apply for the reseller program from your merchant dashboard. Our partnership team will review your application within 48 hours and provide your reseller credentials.' },
    ]
  },
  'docs': {
    title: 'Developer Guidance',
    icon: Code,
    content: 'Everything you need to integrate XelPay into your application.',
    sections: [
      { heading: 'Getting Started', body: 'XelPay provides a RESTful API that is easy to integrate with any backend. Start by creating a merchant account and generating your API key from the dashboard settings.' },
      { heading: 'Supported Frameworks', body: 'We provide official SDKs and code examples for Node.js, PHP, Python, and frontend frameworks including React, Vue, and plain JavaScript.' },
      { heading: 'Webhook Integration', body: 'XelPay uses webhooks to deliver real-time payment notifications to your server. Configure your webhook URL in the dashboard and verify payloads using HMAC signatures.' },
      { heading: 'Testing Environment', body: 'A full sandbox environment is available for development testing. Use test credentials from your dashboard to simulate payments without real transactions.' },
    ]
  },
  'api-reference': {
    title: 'API Reference',
    icon: BookOpen,
    content: 'Complete reference for all XelPay API endpoints and authentication.',
    sections: [
      { heading: 'Authentication', body: 'All API requests must include your API key in the Authorization header as a Bearer token. Keys are generated per-merchant and should never be exposed client-side.' },
      { heading: 'Base URL', body: 'All API requests should be made to: https://api.xelpay.com/v1. Responses are returned in JSON format with standard HTTP status codes.' },
      { heading: 'HMAC Signature', body: 'For webhook verification, XelPay signs all outgoing webhook payloads using HMAC-SHA256. Verify the X-XelPay-Signature header against your webhook secret to ensure payload integrity.' },
      { heading: 'Rate Limits', body: 'The API allows up to 300 requests per minute per merchant. Rate limit headers are included in every response. Exceeding limits returns a 429 status code.' },
    ]
  },
  'status': {
    title: 'System Status',
    icon: Activity,
    content: 'Real-time status of all XelPay services and infrastructure.',
    sections: [
      { heading: 'Core Services', body: 'All core payment verification engines, webhook delivery systems, and merchant dashboard panels are fully operational with 99.99% uptime over the past 90 days.' },
      { heading: 'MFS Connectivity', body: 'bKash, Nagad, and Rocket gateway connections are all active and processing normally. Average verification latency is under 800ms.' },
      { heading: 'Scheduled Maintenance', body: 'No maintenance windows are currently scheduled. We perform maintenance during low-traffic hours and notify merchants 24 hours in advance via dashboard and email.' },
      { heading: 'Incident History', body: 'No critical incidents in the past 30 days. Minor latency events are logged and resolved within our 99.9% SLA commitment.' },
    ]
  },
  'plugins': {
    title: 'CMS Plugins',
    icon: Puzzle,
    content: 'Official XelPay plugins for popular CMS and eCommerce platforms.',
    sections: [
      { heading: 'WooCommerce Plugin', body: 'Our official WooCommerce plugin enables automatic payment verification for WordPress-based stores. Install from your merchant dashboard and configure with your API key in under 5 minutes.' },
      { heading: 'Shopify App', body: 'The XelPay Shopify app integrates directly with your store checkout, enabling bKash and Nagad payment options natively without custom development.' },
      { heading: 'WordPress Plugin', body: 'For general WordPress sites using custom forms or page builders, our WordPress plugin provides payment collection and verification capabilities through shortcodes and blocks.' },
      { heading: 'Custom Integration', body: 'For platforms not listed above, use our REST API and webhook system to build a custom integration. Developer documentation provides complete code samples.' },
    ]
  },
  'ticket': {
    title: 'Help Center & Tickets',
    icon: Ticket,
    content: 'Get support from our dedicated technical team anytime you need it.',
    sections: [
      { heading: 'Submitting a Ticket', body: 'Log in to your merchant dashboard and navigate to Support > New Ticket. Describe your issue in detail, attach screenshots if needed, and submit. You will receive a ticket ID immediately.' },
      { heading: 'Response Times', body: 'Our technical team responds to all tickets within 24 hours. Critical payment issues are escalated and typically resolved within 4 hours during business hours.' },
      { heading: 'Live Chat', body: 'For urgent issues, use the live chat widget in your dashboard. Chat support is available from 9 AM to 11 PM Bangladesh Standard Time, 7 days a week.' },
      { heading: 'Community & Telegram', body: 'Join our merchant Telegram group for community support, announcements, and tips from other merchants. The link is available in your dashboard.' },
    ]
  },
  'affiliate': {
    title: 'Affiliate Program',
    icon: BadgeDollarSign,
    content: 'Earn lifetime recurring commissions by referring merchants to XelPay.',
    sections: [
      { heading: 'Commission Structure', body: 'Affiliates earn 10% lifetime recurring commission on every subscription fee paid by referred merchants. Commissions are credited monthly with no cap.' },
      { heading: 'How It Works', body: 'Register for the affiliate program from your dashboard to receive a unique referral link. Share it with merchants — when they subscribe using your link, you earn automatically.' },
      { heading: 'Payout Method', body: 'Commissions are paid out monthly via bKash or bank transfer. Minimum payout threshold is ৳500. Payouts are processed on the 5th of each month.' },
      { heading: 'Tracking & Reporting', body: 'Your affiliate dashboard shows real-time click tracking, signups, active referrals, and commission history. Full transparency at every step.' },
    ]
  },
};

// ✅ FIX: Next.js 14 — params must be awaited (async page component)
export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = pageData[slug] || {
    title: 'Page Not Found',
    icon: FileText,
    content: 'The information you are looking for does not exist or has been moved.',
    sections: [],
  };

  const IconComponent = data.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-bold mb-10 transition-colors text-sm">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
              <IconComponent size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{data.title}</h1>
              <div className="w-12 h-1 bg-blue-600 rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{data.content}</p>
        </div>

        {/* Content Sections */}
        {data.sections && data.sections.length > 0 && (
          <div className="space-y-4">
            {data.sections.map((section, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full inline-block shrink-0"></span>
                  {section.heading}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{section.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
