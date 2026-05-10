// PATH: /app/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
  description:
    "Instantly automate bKash, Nagad, Rocket, Upay, Cellfin, Pathao Pay, Bank, and Crypto payments with XelPay. Bangladesh's most trusted, zero-commission payment automation API and gateway for developers and businesses.",
  keywords: [
    'automated payment gateway Bangladesh',
    'payment automation platform BD',
    'bKash payment automation',
    'bKash auto verification',
    'bKash personal automation',
    'Nagad payment gateway API',
    'Nagad personal automation',
    'Rocket automated payment',
    'Rocket personal automation',
    'Upay webhook integration',
    'Cellfin payment automation',
    'Pathao Pay verification API',
    'Bank payment automation Bangladesh',
    'Crypto payment gateway BD',
    'cryptocurrency auto payment',
    'mobile banking automation',
    'zero commission payment gateway',
    'zero hidden fee payment API',
    'instant payment verification BD',
    'payment gateway for developers',
    'payment link generator Bangladesh',
    'e-commerce payment solution Bangladesh',
    'secure payment gateway BD',
    'bKash merchant API',
    'XelPay API integration',
    'best payment gateway Bangladesh',
    'Uddoktapay alternative',
    'ZiniPay alternative',
    'shurjopay alternative',
    'SSLCommerz alternative',
    'AamarPay alternative',
    'Paystation alternative',
    'Stripe alternative Bangladesh',
    'Binance payment alternative BD',
    'XelPay'
  ],
  alternates: { canonical: 'https://www.xelpay.site' },
  openGraph: {
    title: 'XelPay — Best Automated Payment Gateway in Bangladesh',
    description: 'Automate bKash, Nagad, Rocket, Bank & Crypto payments instantly. Zero commission webhook API. Start free today.',
    url: 'https://www.xelpay.site',
    siteName: 'XelPay',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'XelPay Payment Automation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XelPay — Automated Payment Gateway Bangladesh',
    description: 'Zero-commission bKash, Nagad, Rocket, Upay & Crypto payment automation. Start for free.',
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
    support_email: 'support@xelpay.site',
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