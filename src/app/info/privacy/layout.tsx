import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | XelPay',
  description: 'XelPay\'s comprehensive privacy policy — data collection, security, AML retention, and your rights. Compliant with Bangladesh Digital Security Act 2018 and GDPR principles.',
  openGraph: {
    title: 'Privacy Policy | XelPay',
    description: 'How XelPay collects, uses, and protects your personal data. Full compliance with Bangladesh law and GDPR.',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | XelPay',
    description: 'How XelPay collects, uses, and protects your personal data.',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}