// app/page.tsx
import { supabase } from '@/lib/supabase';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

// ✅ Best SEO Metadata for Production
export const metadata: Metadata = {
  title: 'XelPay - Ultimate Payment Automation Gateway',
  description: 'Automate payment verifications using your Personal, Agent, or Merchant accounts. Secure, fast, and zero commission payment gateway in Bangladesh.',
  openGraph: {
    title: 'XelPay - Payment Automation',
    description: 'Automate verifications using your Personal, Agent, or Merchant accounts.',
    url: 'https://xelpay.com',
    siteName: 'XelPay',
    type: 'website',
  },
};

export const revalidate = 3600; // 1 Hour Cache for super-fast loading

export default async function LandingPage() {
  // ✅ Server-Side Fetching (No loading screens for users)
  const [plansRes, reviewsRes, faqsRes, settingsRes] = await Promise.all([
    supabase.from('plans').select('*').order('serial', { ascending: true }),
    supabase.from('reviews').select('*'),
    supabase.from('faqs').select('*'),
    supabase.from('site_settings').select('key_name, value')
  ]);

  // Settings Map
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