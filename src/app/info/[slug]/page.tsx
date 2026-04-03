import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Users, Code, BookOpen,
  Activity, Puzzle, Ticket, BadgeDollarSign, Building2,
  Send, Mail, HelpCircle, ChevronRight, Phone, MessageCircle,
  Facebook, Globe, LockKeyhole, RotateCcw } from 'lucide-react';
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

// ── WhatsApp deep link helper (server-side) ──
function buildWhatsAppLink(value: string): string {
  const digits = value.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

// ── Page data map ──
// NOTE: 'privacy' and 'terms' have been moved to standalone pages at /info/privacy and /info/terms.
// Their route remains functional via those dedicated files. They are intentionally excluded here.
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
    metaDescription: 'Learn about XelPay — Bangladesh\'s leading payment automation infrastructure. Our mission, vision, and values.',
    icon: Building2,
    content: 'XelPay is an enterprise-grade payment automation infrastructure built for high-growth businesses and digital commerce in Bangladesh and beyond.',
    sections: [
      {
        heading: 'Our Mission',
        body: 'We exist to dismantle the friction between merchants and their revenue. XelPay bridges personal MFS accounts — bKash, Nagad, Rocket — with professional business-grade automation, enabling any merchant to collect, verify, and reconcile payments at scale without relying on third-party custodians.',
      },
      {
        heading: 'What We Do',
        body: 'XelPay delivers real-time payment verification by connecting directly to your personal, agent, or merchant MFS accounts. Every incoming transaction is matched, verified, and webhook-dispatched within milliseconds. Funds settle directly into your account — XelPay never touches your money.',
      },
      {
        heading: 'Our Technology',
        body: 'Our platform is built on a distributed, fault-tolerant architecture with zero single points of failure. We run AES-256 encryption at rest, TLS 1.3 in transit, and HMAC-SHA256 signed webhook payloads so every integration is cryptographically verifiable end-to-end.',
      },
      {
        heading: 'Our Vision',
        body: 'We are building the most reliable and compliant payment infrastructure for emerging markets — starting with Bangladesh and expanding to Southeast Asia. Our roadmap includes native Stripe, PayPal, and cryptocurrency gateway support, full B2B invoicing, and enterprise white-label deployments.',
      },
      {
        heading: 'Compliance & Trust',
        body: 'XelPay operates in accordance with Bangladesh Bank guidelines and is committed to AML/KYC-compliant merchant onboarding. Our infrastructure is audited regularly and all sensitive operations are logged with immutable audit trails.',
      },
    ],
  },

  'reseller': {
    title: 'Reseller Program',
    metaTitle: 'Reseller Program | XelPay',
    metaDescription: 'Build a scalable B2B revenue stream by becoming a certified XelPay reseller. White-label options available.',
    icon: Users,
    content: 'The XelPay Reseller Program is designed for agencies, system integrators, and digital entrepreneurs who want to build a sustainable, recurring-revenue business by onboarding merchants onto our platform.',
    sections: [
      {
        heading: 'Program Overview',
        body: 'Certified XelPay Resellers gain access to a dedicated partner dashboard where they can create, manage, and monitor merchant accounts under their own portfolio. Resellers are the primary relationship owner for their merchants and earn recurring revenue for each active subscription.',
      },
      {
        heading: 'Revenue Structure',
        body: 'Resellers earn a competitive, tiered percentage of every subscription renewal — monthly and annually. Revenue scales automatically with your portfolio size. There is no cap on earnings, and commissions are disbursed on a defined monthly cycle with full transparency via the partner earnings dashboard.',
      },
      {
        heading: 'White-Label Deployment',
        body: 'Enterprise-tier resellers are eligible for a full white-label configuration, including a custom subdomain, branded dashboard UI, custom email sender identity, and co-branded merchant-facing materials. Branding guidelines and technical onboarding are provided by our partner success team.',
      },
      {
        heading: 'Partner Support & SLA',
        body: 'Reseller accounts receive priority support with a dedicated SLA separate from standard merchant support queues. A named partner success manager is assigned to Enterprise-tier partners. Technical integration queries are handled within 4 business hours.',
      },
      {
        heading: 'How to Apply',
        body: 'Applications are submitted through the Reseller Program section of your merchant dashboard. Our partnership team conducts a brief verification call and reviews your application within 2 business days. Approved partners receive onboarding documentation, a co-branding kit, and access to the partner portal immediately.',
      },
    ],
  },

  'docs': {
    title: 'Developer Guidance',
    metaTitle: 'Developer Documentation | XelPay',
    metaDescription: 'Complete developer documentation for integrating XelPay. RESTful API, webhook events, HMAC signatures, and official SDKs.',
    icon: Code,
    content: 'XelPay provides a modern, RESTful API designed for rapid integration. Whether you are building a custom checkout, a headless storefront, or an automated reconciliation pipeline, our documentation guides you from first API key to production in minutes.',
    sections: [
      {
        heading: 'Getting Started',
        body: 'Create a merchant account and navigate to Settings → API Keys in your dashboard to generate your credentials. All API requests are authenticated using Bearer token authorization. We recommend storing your API key in environment variables and never exposing it client-side.',
      },
      {
        heading: 'Supported Frameworks & SDKs',
        body: 'Official SDKs are available for Node.js, PHP, Python, and Laravel. Community-maintained libraries exist for Go and Ruby. All SDKs handle authentication, request signing, and webhook verification out of the box. Code examples are provided in the API Reference for plain HTTP, cURL, and each SDK.',
      },
      {
        heading: 'Webhook Integration',
        body: 'XelPay dispatches real-time webhook events for every payment state change: payment.verified, payment.failed, payment.pending, and refund.issued. Register your endpoint URL in the dashboard. All payloads are signed with HMAC-SHA256 using your webhook secret — always verify the X-XelPay-Signature header before processing.',
      },
      {
        heading: 'Sandbox & Testing',
        body: 'A full-fidelity sandbox environment mirrors production behavior with isolated test credentials. Simulate successful payments, failures, partial payments, and timeouts using the test mode toggle in your dashboard. Sandbox events trigger real webhook deliveries to your configured test endpoint.',
      },
      {
        heading: 'Idempotency & Reliability',
        body: 'All mutation endpoints support idempotency keys via the Idempotency-Key header. This prevents duplicate payments in the event of network retries. We recommend generating a UUID per transaction and storing it alongside your order record.',
      },
    ],
  },

  'api-reference': {
    title: 'API Reference',
    metaTitle: 'API Reference | XelPay',
    metaDescription: 'Complete API reference for all XelPay endpoints, authentication, webhook signatures, and rate limits.',
    icon: BookOpen,
    content: 'The XelPay REST API provides programmatic access to payment creation, verification status, transaction history, webhook management, and merchant configuration. All endpoints return structured JSON with standard HTTP semantics.',
    sections: [
      {
        heading: 'Authentication',
        body: 'Every API request must include a valid API key in the Authorization header as a Bearer token: Authorization: Bearer <YOUR_API_KEY>. Keys are scoped to a single merchant account. Rotate compromised keys immediately from the dashboard — revoked keys are invalidated within 60 seconds globally.',
      },
      {
        heading: 'Base URL & Versioning',
        body: 'All API requests target: https://api.xelpay.com/v1. The API version is embedded in the path to ensure backward compatibility. Breaking changes are released as new major versions with a minimum 6-month deprecation notice and migration guides.',
      },
      {
        heading: 'Webhook Signature Verification',
        body: 'Every webhook payload is signed using HMAC-SHA256. Compute the expected signature by hashing the raw request body with your webhook secret and compare it against the X-XelPay-Signature header. Reject payloads with mismatched signatures immediately. Timestamp validation (X-XelPay-Timestamp) prevents replay attacks beyond a 5-minute tolerance window.',
      },
      {
        heading: 'Rate Limits',
        body: 'Standard merchants are permitted up to 300 API requests per minute. Sustained bursts beyond this threshold will receive HTTP 429 responses with Retry-After headers. Enterprise plans have configurable limits. Rate limit consumption data is available in the X-RateLimit-Remaining and X-RateLimit-Reset response headers.',
      },
      {
        heading: 'Error Handling',
        body: 'XelPay uses conventional HTTP status codes: 2xx for success, 4xx for client errors, 5xx for infrastructure issues. Error responses include a machine-readable error code, a human-readable message, and a request_id field for use in support escalations. Always handle 409 Conflict responses for idempotency-key collisions.',
      },
    ],
  },

  'status': {
    title: 'System Status',
    metaTitle: 'System Status | XelPay',
    metaDescription: 'Real-time operational status of all XelPay services, infrastructure, and payment gateway connectivity.',
    icon: Activity,
    content: 'XelPay maintains enterprise-grade infrastructure with redundant systems across multiple availability zones. This page reflects the real-time health of all platform components and historical incident data.',
    sections: [
      {
        heading: 'Core Platform Services',
        body: 'The payment verification engine, API gateway, webhook delivery system, merchant dashboard, and authentication services are all fully operational. Aggregate uptime over the trailing 90 days stands at 99.97%, exceeding our published SLA of 99.9%.',
      },
      {
        heading: 'MFS Gateway Connectivity',
        body: 'Direct integrations with bKash, Nagad, and Rocket are active and processing normally. Median verification latency is currently under 750ms. Gateway health is monitored continuously with automated failover and alerting.',
      },
      {
        heading: 'International Gateways',
        body: 'Stripe and PayPal integrations are operating normally. Cryptocurrency settlement via Binance Pay is active. These gateways are subject to third-party uptime policies; XelPay propagates any third-party degradation transparently on this status page.',
      },
      {
        heading: 'Scheduled Maintenance',
        body: 'No maintenance windows are currently scheduled. When planned maintenance is necessary, merchants are notified via dashboard banner and email a minimum of 24 hours in advance. Maintenance is always performed during off-peak hours (2 AM – 5 AM BST).',
      },
      {
        heading: 'Incident History',
        body: 'No critical incidents have been recorded in the past 30 days. All historical incident reports, root cause analyses, and resolution timelines are available in the full status history archive.',
      },
    ],
  },

  'plugins': {
    title: 'CMS Plugins',
    metaTitle: 'CMS Plugins & Integrations | XelPay',
    metaDescription: 'Official XelPay plugins for WooCommerce, Shopify, WordPress, and any custom platform via REST API.',
    icon: Puzzle,
    content: 'XelPay provides officially maintained plugins for the most widely used eCommerce and CMS platforms. Each plugin is version-controlled, actively maintained, and validated against our API to ensure stable, production-grade integrations.',
    sections: [
      {
        heading: 'WooCommerce',
        body: 'The XelPay WooCommerce plugin enables automatic payment verification for WordPress stores running WooCommerce. Installation takes under 5 minutes: install the plugin, enter your API key from the XelPay dashboard, and select your active payment methods. Orders are automatically fulfilled upon verified payment.',
      },
      {
        heading: 'Shopify',
        body: 'The XelPay Shopify app integrates with Shopify Payments and checkout flows to surface bKash, Nagad, and Rocket as native payment options for Bangladeshi buyers. Configuration is handled entirely through the Shopify admin panel with no code required.',
      },
      {
        heading: 'WordPress (General)',
        body: 'For non-WooCommerce WordPress sites, our plugin provides payment collection via Gutenberg blocks and shortcodes. Suitable for membership sites, digital product sales, and donation pages. Compatible with Elementor and popular page builders.',
      },
      {
        heading: 'Custom & Headless Integrations',
        body: 'For platforms not covered by a native plugin — Next.js, Nuxt, custom PHP, or mobile applications — use the XelPay REST API directly. Our webhooks and SDKs provide the same verified payment events and signature security that power our native plugins.',
      },
    ],
  },

  'affiliate': {
    title: 'Affiliate Program',
    metaTitle: 'Affiliate Program | XelPay',
    metaDescription: 'Earn lifetime recurring commissions by referring merchants to XelPay. 10% commission, no cap, paid monthly.',
    icon: BadgeDollarSign,
    content: 'The XelPay Affiliate Program rewards you with a 10% lifetime recurring commission on every subscription fee paid by the merchants you refer. There is no referral cap, no expiry on your commission rights, and no complex tier requirements.',
    sections: [
      {
        heading: 'Commission Structure',
        body: 'You earn 10% of the monthly or annual subscription fee for every active merchant you have referred, credited every billing cycle for as long as that merchant remains a XelPay subscriber. Commissions are not one-time — they compound with every renewal for the lifetime of the account.',
      },
      {
        heading: 'How It Works',
        body: 'Register for the Affiliate Program from your merchant dashboard to receive a unique referral link and access your affiliate control panel. When a new merchant signs up using your link and activates a paid plan, you begin earning immediately. Attribution is tracked via first-touch cookie with a 90-day window.',
      },
      {
        heading: 'Payout & Processing',
        body: 'Commission payouts are processed on the 5th of each calendar month for the prior month\'s earnings. Payouts are issued via bKash or direct bank transfer. The minimum payout threshold is ৳500. Earnings below the threshold roll over to the following month automatically.',
      },
      {
        heading: 'Real-Time Analytics',
        body: 'Your affiliate dashboard provides real-time visibility into click volume, conversion rates, active referrals, pending commissions, and payout history. All data is available for export in CSV format for your own reporting and reconciliation.',
      },
      {
        heading: 'Promotional Assets',
        body: 'Approved affiliates receive access to a media kit including banners, landing page copy, API documentation snippets, and co-branded presentation materials. Custom promotional campaigns can be requested through your affiliate manager for high-volume partners.',
      },
    ],
  },

  'contact': {
    title: 'Contact Us',
    metaTitle: 'Contact Us | XelPay',
    metaDescription: 'Reach XelPay\'s support team via Telegram, WhatsApp, Email, or Facebook. Available 24/7 for merchant support.',
    icon: HelpCircle,
    content: 'Our dedicated support team is available around the clock. Choose the channel that works best for you — we are committed to responding promptly and resolving your issues with full accountability.',
    sections: [],
  },

  // ── Task 2: New 'ticket' entry ──
  'ticket': {
    title: 'Submit a Support Ticket',
    metaTitle: 'Support Tickets | XelPay',
    metaDescription: 'Submit SLA-backed support tickets directly from your XelPay merchant dashboard for tracked, priority assistance.',
    icon: Ticket,
    content: 'XelPay\'s formal support ticketing system is available exclusively through your authenticated merchant dashboard. All tickets are assigned a unique ID, tracked through to resolution, and backed by our published SLA commitments.',
    sections: [
      {
        heading: 'How to Submit a Ticket',
        body: 'Log in to your XelPay dashboard and navigate to Support → New Ticket. Select the issue category (payment failure, integration, billing, or account), provide a detailed description, and attach any relevant screenshots or logs. You will receive a unique ticket ID immediately upon submission.',
      },
      {
        heading: 'Why Authentication is Required',
        body: 'Requiring authentication to submit tickets protects merchant data, allows our engineers to access your account context directly, and ensures that sensitive information such as transaction IDs and API keys are handled within a secure, encrypted session rather than over public channels.',
      },
      {
        heading: 'SLA Response Commitments',
        body: 'Critical issues (payment verification failure, API outage): initial response within 2 hours, resolution target 4 hours. High-priority issues (configuration, webhook, dashboard errors): response within 8 business hours. Standard queries: response within 24 business hours. SLAs apply during standard business hours (9 AM – 11 PM BST) unless otherwise specified in your plan.',
      },
      {
        heading: 'Ticket Status & Tracking',
        body: 'All open and resolved tickets are visible from your dashboard under Support → My Tickets. You will receive email and in-dashboard notifications for every status change, engineer response, and resolution confirmation. You can reply directly within the ticket thread to provide additional information.',
      },
      {
        heading: 'Escalation Policy',
        body: 'If an open ticket has not received an initial response within the SLA window, it is automatically escalated to a senior support engineer and flagged for priority handling. Enterprise and Reseller plan holders have a dedicated escalation path to their assigned account manager.',
      },
    ],
  },

  // ── Task 2: New 'aml' entry ──
  'aml': {
    title: 'AML & KYC Policy',
    metaTitle: 'AML & KYC Policy | XelPay',
    metaDescription: 'XelPay\'s Anti-Money Laundering and Know Your Customer compliance framework for merchant onboarding and transaction monitoring.',
    icon: LockKeyhole,
    content: 'XelPay is committed to operating a fully compliant, transparent payment infrastructure. Our Anti-Money Laundering (AML) and Know Your Customer (KYC) policies are aligned with Bangladesh Bank guidelines and international best practices to prevent financial crime and protect all platform participants.',
    sections: [
      {
        heading: 'Merchant Identity Verification (KYC)',
        body: 'All merchants are required to complete identity verification before activating payment collection. KYC requirements include a valid National ID (NID) or passport, a live selfie for biometric verification, and proof of business activity where applicable. Verification is processed within 1 business day. Merchants operating in regulated categories may be required to submit additional documentation.',
      },
      {
        heading: 'Transaction Monitoring',
        body: 'XelPay maintains an automated transaction monitoring system that applies real-time risk scoring to all payment events. Transactions that exceed defined thresholds for volume, frequency, or behavioral anomaly are flagged for manual review. Patterns indicative of structuring, layering, or other money laundering typologies are escalated to our compliance team immediately.',
      },
      {
        heading: 'Prohibited Activities',
        body: 'XelPay does not permit its infrastructure to be used for transactions related to illegal goods or services, gambling (where prohibited by law), unregistered financial services, sanctioned entities or jurisdictions, or any activity that violates Bangladesh Bank Foreign Exchange Regulation Act or the Prevention of Money Laundering Act 2012.',
      },
      {
        heading: 'Sanctions Screening',
        body: 'All merchants and their beneficial owners are screened against OFAC, UN, and Bangladesh Financial Intelligence Unit (BFIU) sanctions lists at onboarding and on a rolling basis. Matches result in immediate account suspension and mandatory reporting to the relevant authority.',
      },
      {
        heading: 'Suspicious Activity Reporting (SAR)',
        body: 'XelPay is legally obligated to file Suspicious Activity Reports with the Bangladesh Financial Intelligence Unit (BFIU) where reasonable grounds exist to suspect money laundering or terrorist financing. We cooperate fully with law enforcement and regulatory investigations.',
      },
      {
        heading: 'Merchant Obligations',
        body: 'Merchants are independently responsible for complying with all applicable laws in their jurisdiction, including maintaining their own KYC records for end customers where required. XelPay\'s compliance does not relieve merchants of their own regulatory obligations under Bangladesh law or any other applicable legal framework.',
      },
    ],
  },

  // ── Task 2: New 'refund' entry ──
  'refund': {
    title: 'Refund & Cancellation Policy',
    metaTitle: 'Refund & Cancellation Policy | XelPay',
    metaDescription: 'Understand XelPay\'s subscription refund eligibility, cancellation process, and merchant refund handling procedures.',
    icon: RotateCcw,
    content: 'XelPay operates a fair, transparent refund and cancellation policy designed to protect merchants while maintaining the commercial integrity of our subscription-based services. Please read this policy carefully before subscribing.',
    sections: [
      {
        heading: 'Subscription Cancellation',
        body: 'Merchants may cancel their active subscription at any time from the Billing section of the merchant dashboard. Upon cancellation, access to paid features continues until the end of the current billing period. XelPay does not automatically renew cancelled subscriptions, and no further charges are applied after the cancellation effective date.',
      },
      {
        heading: 'Refund Eligibility',
        body: 'Subscription fees may be eligible for a pro-rata refund if a cancellation request is submitted within 7 days of the subscription start date or renewal date, the merchant has not activated payment collection during that period, and no API calls or webhook deliveries have been made against the account in that billing cycle. Refund eligibility is assessed on a case-by-case basis at XelPay\'s discretion.',
      },
      {
        heading: 'Non-Refundable Items',
        body: 'The following are non-refundable under all circumstances: subscription fees for months already consumed, add-on services including custom bot configuration and white-label setup fees, any fees associated with partner integrations or third-party gateway usage, and promotional or discounted plan subscriptions.',
      },
      {
        heading: 'How to Request a Refund',
        body: 'Submit a refund request by opening a support ticket from your authenticated dashboard under Support → New Ticket with the category "Billing & Refund". Include your subscription invoice number and the reason for the request. Our billing team reviews all refund requests within 3 business days and will communicate the outcome via the ticket thread.',
      },
      {
        heading: 'Merchant-to-Customer Refunds',
        body: 'XelPay facilitates payment collection but does not manage end-customer transactions on merchants\' behalf. Merchants are solely responsible for issuing refunds to their own customers in accordance with their own refund policies and applicable consumer protection laws. XelPay does not mediate disputes between merchants and their customers.',
      },
      {
        heading: 'Processing Timelines',
        body: 'Approved refunds are processed within 5 business days of approval confirmation. Refunds are returned to the original payment method used for the subscription charge. Bank transfer refunds may take an additional 2–3 business days to appear depending on the receiving institution.',
      },
    ],
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

// ── Task 3: InfoFooter with verified Privacy and Terms hrefs ──
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
        <span className="opacity-40 uppercase tracking-widest text-[10px]">© {new Date().getFullYear()} XelPay · Xenverse IT · All Rights Reserved</span>
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
      href: s.whatsapp ? buildWhatsAppLink(s.whatsapp) : null,
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

          {/* Contact page — dynamic channels from DB */}
          {isContact ? (
            <ContactContent />
          ) : (
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