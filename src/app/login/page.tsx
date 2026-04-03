import LoginClient from './LoginClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Login | XelPay',
  description: 'Access your XelPay merchant dashboard. Securely login with email or Google to manage automated bKash, Nagad, and Rocket payments.',
  keywords: ['XelPay Login', 'Merchant Dashboard', 'Automated Payment Gateway Login', 'Secure Login', 'bKash Auto Verification Login'],
  openGraph: {
    title: 'Sign in to XelPay',
    description: 'Securely access your XelPay merchant dashboard to automate your business payments.',
    url: 'https://www.xelpay.site/login',
    siteName: 'XelPay',
    type: 'website',
  }
};

export default function Login() {
  return <LoginClient />;
}