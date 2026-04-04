// PATH: src/app/signup/page.tsx

import SignUpClient from './SignUpClient';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Create Free Account — XelPay Payment Gateway Bangladesh',
  description:
    'Create your free XelPay merchant account and start automating bKash, Nagad, and Rocket payments in minutes. No setup fee. Instant activation. Bangladesh\'s #1 payment automation platform.',
  keywords: [
    'create XelPay account',
    'sign up payment gateway Bangladesh',
    'free bKash automation account',
    'Nagad API signup Bangladesh',
    'payment automation Bangladesh register',
    'merchant account Bangladesh free',
    'automated payment signup Bangladesh',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site/signup',
  },
  openGraph: {
    title: 'Create Free Account — XelPay Payment Gateway Bangladesh',
    description:
      'Join XelPay free. Automate bKash, Nagad, and Rocket payments in minutes. No setup fee. Instant activation.',
    url: 'https://www.xelpay.site/signup',
    siteName: 'XelPay',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Create Free XelPay Account',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Free Account — XelPay Payment Gateway Bangladesh',
    description:
      'Start automating bKash, Nagad, Rocket payments free. Zero commission. Instant webhook alerts.',
    images: ['/og-image.png'],
  },
};

export default async function SignUp() {
  const cookieStore = await cookies();
  // ইতিমধ্যে login থাকলে dashboard এ redirect করো
  if (cookieStore.get('auth_session')?.value === 'authenticated') {
    redirect('/dashboard');
  }
  return <SignUpClient />;
}