// app/page.tsx
import { supabase } from '@/lib/supabase';
import LandingPageUI from './LandingPageUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // টাইটেল আরও আকর্ষণীয় করা হয়েছে
  title: 'XelPay - Best Automated Payment Gateway in Bangladesh (bKash, Nagad, Rocket,Upay,Cellfin ,etc)',
  description: 'Instant automated payment verification for bKash, Nagad, and Rocket. Use your Personal, Agent, or Merchant accounts with XelPay - the fastest secure payment automation gateway.',
  openGraph: {
    title: 'XelPay - Instant Payment Automation Solution',
    description: 'Verify bKash, Nagad, and Rocket payments automatically via your Personal, Agent, or Merchant accounts.',
    url: 'https://www.xelpay.site',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XelPay - Ultimate Payment Automation Solution',
    description: 'Zero commission bKash, Nagad, Rocket , Upay And Cellfin payment automation gateway.',
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