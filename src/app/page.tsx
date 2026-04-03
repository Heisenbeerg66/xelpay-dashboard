// src/app/page.tsx
import { supabase } from '@/lib/supabase';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
  description:
    'Instantly automate bKash, Nagad, Rocket, Upay and Cellfin payment verification using your personal or merchant account. Zero commission, zero hidden fees. Bangladesh\'s most trusted payment automation platform.',
  keywords: [
    'automated payment gateway Bangladesh',
    'bKash payment automation',
    'Nagad automated verification',
    'Rocket payment gateway',
    'Upay payment integration',
    'Cellfin payment gateway',
    'payment automation API Bangladesh',
    'bKash webhook',
    'instant payment verification Bangladesh',
    'zero commission payment gateway',
    'MFS payment automation Bangladesh',
    'online business payment Bangladesh',
    'automatic bKash verification',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site',
  },
  openGraph: {
    title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
    description:
      'Automate bKash, Nagad, Rocket payments via your personal account. Zero commission. Instant webhook. Bank-grade security. Start free today.',
    url: 'https://www.xelpay.site',
    siteName: 'XelPay',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XelPay — Automated Payment Gateway Bangladesh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
    description:
      'Zero-commission bKash, Nagad, Rocket, Upay payment automation. Instant verification. Start free.',
    images: ['/og-image.png'],
  },
};

export const revalidate = 3600;

export default async function LandingPage() {
  const [plansRes, reviewsRes, faqsRes, settingsRes] = await Promise.all([
    supabase.from('plans').select('*').order('serial', { ascending: true }),
    supabase.from('reviews').select('*'),
    supabase.from('faqs').select('*'),
    supabase.from('site_settings').select('key_name, value'),
  ]);

  const settingsMap =
    settingsRes.data?.reduce(
      (acc: any, row: any) => {
        acc[row.key_name] = row.value;
        return acc;
      },
      {
        facebook: '#',
        youtube: '#',
        telegram: '#',
        whatsapp: '#',
        support_email: 'support@xelpay.com',
      }
    ) || {};

  return (
    <LandingPageUI
      initialPlans={plansRes.data || []}
      initialReviews={reviewsRes.data || []}
      initialFaqs={faqsRes.data || []}
      initialSettings={settingsMap}
    />
  );
}