// app/page.tsx
import { supabase } from '@/lib/supabase';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XelPay - Ultimate Payment Automation Gateway in Bangladesh',
  description: 'Automate payment verifications using your Personal, Agent, or Merchant accounts for bKash, Nagad, and Rocket. Secure, fast, and zero commission payment gateway.',
  openGraph: {
    title: 'XelPay - Payment Automation Solution',
    description: 'Automate verifications using your Personal, Agent, or Merchant accounts instantly.',
    url: 'https://xelpay.site',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XelPay - Best Payment Automation Gateway',
    description: 'Instant bKash, Nagad, and Rocket payment automation.',
  }
};

export const revalidate = 3600;

export default async function LandingPage() {
  const [plansRes, reviewsRes, faqsRes, settingsRes] = await Promise.all([
    supabase.from('plans').select('*').order('serial', { ascending: true }),
    supabase.from('reviews').select('*'),
    supabase.from('faqs').select('*'),
    supabase.from('site_settings').select('key_name, value')
  ]);

  const settingsMap = settingsRes.data?.reduce((acc: any, row: any) => {
    acc[row.key_name] = row.value;
    return acc;
  }, { facebook: '#', youtube: '#', telegram: '#', whatsapp: '#', support_email: 'support@xelpay.com' }) || {};

  return (
    <LandingPageUI 
      initialPlans={plansRes.data || []} 
      initialReviews={reviewsRes.data || []} 
      initialFaqs={faqsRes.data || []} 
      initialSettings={settingsMap} 
    />
  );
}