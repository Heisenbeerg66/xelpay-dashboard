// ── src/app/login/page.tsx ────────────────────────────────────────────────────
import LoginClient from './LoginClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Login — XelPay Dashboard',
  description:
    'Sign in to your XelPay merchant dashboard. Manage automated bKash, Nagad, and Rocket payment verification. Secure login with email/password or Google OAuth.',
  keywords: [
    'XelPay login',
    'merchant dashboard login Bangladesh',
    'payment gateway login',
    'bKash automation dashboard login',
    'XelPay merchant account sign in',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site/login',
  },
  openGraph: {
    title: 'Merchant Login — XelPay Dashboard',
    description:
      'Access your XelPay merchant dashboard. Manage automated bKash, Nagad, and Rocket payments.',
    url: 'https://www.xelpay.site/login',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Merchant Login — XelPay Dashboard',
    description: 'Sign in to XelPay merchant dashboard for automated payment management.',
  },
};

export default function Login() {
  return <LoginClient />;
}