// ── src/app/info/privacy/layout.tsx ─────────────────────
import type { Metadata } from 'next';
import InfoHeader from '@/app/info/[slug]/InfoHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy — XelPay',
  description:
    'XelPay\'s comprehensive Privacy Policy. Learn what data we collect, how it\'s secured with AES-256, AML retention rules, and your data rights. Compliant with Bangladesh Digital Security Act 2018, BFIU guidelines, and GDPR principles.',
  keywords: [
    'XelPay privacy policy',
    'XelPay data protection',
    'payment gateway Bangladesh privacy',
    'bKash data security policy',
    'GDPR compliant Bangladesh payment',
    'XelPay BFIU AML compliance',
    'payment gateway data protection Bangladesh',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site/info/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — XelPay',
    description:
      'How XelPay collects, uses, and protects your data. AES-256 encryption. Bangladesh Digital Security Act 2018 & GDPR compliant.',
    url: 'https://www.xelpay.site/info/privacy',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy — XelPay',
    description:
      'XelPay data protection policy. AES-256 encryption. Bangladesh Digital Security Act 2018 compliant.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 font-sans">
      <InfoHeader />
      {children}
    </div>
  );
}