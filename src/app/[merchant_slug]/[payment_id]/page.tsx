import { supabase } from '@/lib/supabase';
import Step1UI from './Step1UI';
import { AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

// ট্যাব টাইটেল
export const metadata: Metadata = {
  title: 'Secure Payment',
};

// 🚀 FIX: 'payment_id' matches the folder name [payment_id]
export default async function Step1EntryPage({ params }: { params: Promise<{ merchant_slug: string, payment_id: string }> }) {
  
  const resolvedParams = await params;
  const businessSlug = resolvedParams.merchant_slug; 
  const linkParam = resolvedParams.payment_id; // ✅ এখানে এখন payment_id ব্যবহার করা হয়েছে

  // 1️⃣ Business টেবিল চেক
  const { data: business, error: bError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .single();

  if (bError || !business) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F0F4F8] text-red-500 p-4">
        <AlertTriangle size={48} className="mb-4 text-red-400" />
        <p className="font-bold text-lg text-slate-800">Workspace Not Found</p>
        <p className="text-sm text-slate-500 mt-2">The business link you clicked does not exist.</p>
      </div>
    );
  }

  // 2️⃣ Payment Links টেবিল চেক
  const { data: link, error: lError } = await supabase
    .from('payment_links')
    .select('*')
    .eq('link_id', linkParam)
    .eq('business_id', business.id)
    .single();

  if (lError || !link || link.status !== 'active') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F0F4F8] text-red-500 p-4">
        <AlertTriangle size={48} className="mb-4 text-orange-400" />
        <p className="font-bold text-lg text-slate-800">Link Unavailable</p>
        <p className="text-sm text-slate-500 mt-2">This payment link is invalid or has been deactivated.</p>
      </div>
    );
  }

  // 3️⃣ Merchant ডেমো স্ট্যাটাস চেক
  const { data: merchant, error: mError } = await supabase
    .from('merchants')
    .select('id, is_demo')
    .eq('id', business.merchant_id)
    .single();

  if (mError || !merchant) {
    return <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F0F4F8]"><p>Merchant configuration error.</p></div>;
  }

  return <Step1UI business={business} merchant={merchant} link={link} />;
}