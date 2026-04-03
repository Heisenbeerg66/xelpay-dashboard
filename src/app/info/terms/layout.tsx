// ── src/app/info/terms/layout.tsx  (REPLACE existing) ───────────────────────
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — XelPay',
  description:
    'XelPay\'s complete Terms of Service. 25 sections covering billing, strict no-refund policy, acceptable use policy, KYC requirements, liability limits, webhook idempotency, and merchant obligations under Bangladesh law.',
  keywords: [
    'XelPay terms of service',
    'XelPay terms and conditions',
    'payment gateway Bangladesh terms',
    'XelPay refund policy',
    'XelPay merchant agreement Bangladesh',
    'XelPay KYC AML policy',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site/info/terms',
  },
  openGraph: {
    title: 'Terms of Service — XelPay',
    description:
      'Full 25-section Terms of Service for XelPay merchants. Covers billing, refunds, KYC, AML, liability limits, and Bangladesh law compliance.',
    url: 'https://www.xelpay.site/info/terms',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service — XelPay',
    description:
      'Full Terms of Service for XelPay merchants. 25 sections. Bangladesh law compliant.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}