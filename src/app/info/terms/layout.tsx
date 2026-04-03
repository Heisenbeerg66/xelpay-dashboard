import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | XelPay',
  description: 'XelPay\'s complete terms of service — 25 sections covering billing, refund policy, acceptable use, KYC requirements, liability limits, and merchant obligations under Bangladesh law.',
  openGraph: {
    title: 'Terms of Service | XelPay',
    description: 'Full terms of service for XelPay merchants. Covers billing, refunds, KYC, liability, and Bangladesh law compliance.',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | XelPay',
    description: 'Full terms of service for XelPay merchants.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}