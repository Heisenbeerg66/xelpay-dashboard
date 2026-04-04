import { supabase } from '@/lib/supabase';
import CheckoutUI from './CheckoutUI';
import { AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Payment',
};

export default async function CheckoutPage({ params }: { params: Promise<{ order_id: string }> }) {
  
  const resolvedParams = await params;
  const orderNo = resolvedParams.order_id;
  
  const { data: order, error: oError } = await supabase.from('orders').select('*').eq('order_no', orderNo).single();
  
  if (oError || !order || order.status !== 'pending') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] text-red-500 p-4">
            <AlertTriangle size={48} className="mb-4 text-red-400"/>
            <p className="font-bold text-lg text-slate-800">Order not found or invalid link.</p>
            <p className="text-sm text-slate-500 mt-2">This payment session has expired, been paid, or cancelled.</p>
        </div>
    );
  }

  const [mRes, bRes, lRes, gRes, logosRes, methodsRes] = await Promise.all([
    supabase.from('merchants').select('id, is_demo').eq('id', order.merchant_id).single(),
    supabase.from('businesses').select('*').eq('id', order.business_id).single(), 
    supabase.from('payment_links').select('*').eq('id', order.link_id).single(),
    supabase.from('payment_gateways').select('*').eq('business_id', order.business_id).eq('is_active', true), 
    supabase.from('payment_logos').select('*'),
    supabase.from('payment_methods').select('*')
  ]);

  const formattedGateways = gRes.data?.map((g: any) => {
      
      const provider = g.provider?.toLowerCase(); 
      const accType = g.account_type?.toLowerCase(); 
      const compositeId = `${provider}_${accType}`; 

      const logoInfo = logosRes.data?.find((l: any) => l.method_name?.toLowerCase() === provider);
      const methodInfo = methodsRes.data?.find((m: any) => m.id?.toLowerCase() === compositeId);
      
      const getMethodLabelText = (type: string, prov: string) => {
        if (type === 'personal') return 'Send Money';
        if (type === 'merchant') return 'Make Payment';
        if (type === 'agent') return 'Agent Cash Out';
        return `${prov} ${type}`.toUpperCase(); 
      };

      const formattedName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${accType.charAt(0).toUpperCase() + accType.slice(1)}`;

      return {
          ...g,
          methodId: compositeId, 
          parentMethod: provider, 
          name: formattedName, 
          category: g.category || 'mobile', 
          logo: logoInfo?.logo_url || '',
          themeColor: logoInfo?.method_color || '#e2136e', 
          instructions: methodInfo?.global_instructions || [],
          labelText: getMethodLabelText(accType, provider),
          account_number: g.account_number || g.wallet_number, // ✅ Updated
          account_name: g.account_name,
          branch: g.branch, // ✅ Added
          routing_number: g.routing_number, // ✅ Added
          min_amount: g.min_amount, 
          max_amount: g.max_amount  
      };
  }) || [];

  return <CheckoutUI order={order} business={bRes.data} merchant={mRes.data} linkData={lRes.data} gateways={formattedGateways} />;
}