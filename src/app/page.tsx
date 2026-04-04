// PATH: /app/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
  description:
    "Instantly automate bKash, Nagad, Rocket, Upay and Cellfin payment verification. Zero commission, zero hidden fees. Bangladesh's most trusted payment automation platform.",
  keywords: [
    'automated payment gateway Bangladesh',
    'bKash payment automation',
    'Nagad automated verification',
    'Rocket payment gateway',
    'payment automation API Bangladesh',
    'zero commission payment gateway',
    'automatic bKash verification',
  ],
  alternates: { canonical: 'https://www.xelpay.site' },
  openGraph: {
    title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
    description: 'Automate bKash, Nagad, Rocket payments. Zero commission. Instant webhook. Start free today.',
    url: 'https://www.xelpay.site',
    siteName: 'XelPay',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'XelPay' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
    description: 'Zero-commission bKash, Nagad, Rocket automation. Start free.',
    images: ['/og-image.png'],
  },
};

export const revalidate = 3600;

export default async function LandingPage() {
  const cookieStore = await cookies();

  // HttpOnly cookie — Supabase call ছাড়াই auth state জানা যায়
  const isAuthenticated = cookieStore.get('auth_session')?.value === 'authenticated';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );

  const [
    { data: plans },
    { data: reviews },
    { data: faqs },
    { data: settings },
  ] = await Promise.all([
    supabase.from('plans').select('*').order('serial', { ascending: true }),
    supabase.from('reviews').select('*'),
    supabase.from('faqs').select('*'),
    supabase.from('site_settings').select('key_name, value, is_active'),
  ]);

  // Default fallback values
  const settingsMap: Record<string, any> = {
    facebook: '#',
    youtube: '#',
    telegram: '#',
    whatsapp: '#',
    support_email: 'support@xelpay.com',
    otp_login: 'true',
    refer_commission: '0',
  };

  // Flatten: value + _active suffix
  (settings || []).forEach((row: any) => {
    settingsMap[row.key_name] = row.value;
    settingsMap[`${row.key_name}_active`] = row.is_active !== false;
  });

  return (
    <LandingPageUI
      isAuthenticated={isAuthenticated}
      initialPlans={plans || []}
      initialReviews={reviews || []}
      initialFaqs={faqs || []}
      initialSettings={settingsMap}
    />
  );
}