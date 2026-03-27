'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { createSecureOrder } from '@/lib/payment-actions'; 

export default function Step1UI({ business, merchant, link }: { business: any, merchant: any, link: any }) {
  const router = useRouter(); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const [formData, setFormData] = useState({ fullname: '', email: '', phone: '' });
  const [customAmount, setCustomAmount] = useState<string>('');

  // 🧮 Discount & Final Price Calculation
  const baseAmount = parseFloat(link.amount || '0');
  const discount = parseFloat(link.discount || '0');
  let finalAmount = baseAmount;

  if (baseAmount > 0 && discount > 0) {
    if (link.discount_type === 'percentage') {
      finalAmount = baseAmount - (baseAmount * (discount / 100));
    } else {
      finalAmount = baseAmount - discount;
    }
  }

  const currencySymbol = link.currency === 'USD' ? '$' : '৳';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 5) val = val.substring(0, 5) + ' ' + val.substring(5, 11);
      setFormData({ ...formData, phone: val });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const amountToPay = baseAmount > 0 ? finalAmount : parseFloat(customAmount || '0');

    const payload = {
        merchant_id: merchant.id,
        business_id: business.id,
        link_id: link.id,
        brand_name: business.business_name, 
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ''),
        amount: amountToPay,
        currency: link.currency || 'BDT',
        product_name: link.title, 
        is_demo: merchant.is_demo,
        redirect_url: link.redirect_url 
    };

    const res = await createSecureOrder(payload);

    if (res.success) {
        router.push(`/pay/${res.orderId}`);
    } else {
        alert("Failed to create order: " + res.message);
        setIsProcessing(false);
    }
  };

  // 🚀 Logo Priority Logic: 1. Product Logo, 2. Business Logo, 3. Favicon
  const displayLogo = link.product_logo || business.logo_url || business.favicon_url;

  return (
    <div className="min-h-[100dvh] font-sans flex justify-center items-center md:py-4 md:px-4 bg-[#F0F4F8] relative text-black">
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `radial-gradient(#CFD8E3 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F0F4F8]/60 to-[#F0F4F8] z-0 pointer-events-none"></div>

      <div className="w-full max-w-[450px] bg-white min-h-[100dvh] md:min-h-[750px] md:h-[750px] md:rounded-[30px] md:shadow-2xl md:border md:border-gray-100 relative overflow-hidden flex flex-col z-10">
          
          {merchant.is_demo && (
            <div className="bg-yellow-100 text-yellow-800 text-xs font-bold py-2 text-center uppercase tracking-widest border-b border-yellow-200">
               ⚠️ Test Mode Active
            </div>
          )}

          <div className="flex flex-col h-full overflow-y-auto pb-10">
            <div className="p-8 pt-10 px-6 flex flex-col items-center">
               
               {displayLogo && (
                 <div className="w-40 h-40 bg-white rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center justify-center p-2">
                    <img src={displayLogo} className="w-full h-full object-contain" alt="Logo" />
                 </div>
               )}
               
               <h2 className="text-gray-600 font-medium text-lg text-center">{business.business_name}</h2> 
               
               <h1 className={`text-gray-800 text-xl font-bold text-center ${link.description ? 'mb-2 mt-1' : 'mb-8 mt-1'}`}>{link.title}</h1>
               
               {link.description && (
                 <p className="text-gray-500 text-sm text-center mb-8 px-2 leading-relaxed">
                   {link.description}
                 </p>
               )}
               
               <form className="w-full space-y-4" onSubmit={handleStep1Submit}>
                 <div className="space-y-1"><label className="text-sm text-gray-600 font-medium ml-1">Payable Amount</label>
                    
                    {baseAmount > 0 ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center">
                          <span className="text-black">{currencySymbol}</span>
                          <div className="text-right flex items-center gap-2">
                            {discount > 0 && (
                                <span className="text-sm text-gray-400 line-through decoration-red-400 font-medium">{currencySymbol}{baseAmount}</span>
                            )}
                            <span className="text-lg text-black font-bold">{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                    ) : (
                        <input required type="number" step="any" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Enter Amount" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black outline-none focus:border-blue-600 bg-white" />
                    )}
                 </div>

                 <input required type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black placeholder:text-gray-500 outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, fullname: e.target.value})} value={formData.fullname} />
                 <input required type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black placeholder:text-gray-500 outline-none focus:border-blue-600" onChange={(e) => setFormData({...formData, email: e.target.value})} value={formData.email} />
                 <input required type="tel" placeholder="Mobile Number (e.g. 01712 345678)" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black placeholder:text-gray-500 outline-none focus:border-blue-600" onChange={handlePhoneChange} value={formData.phone} />
                 
                 <button type="submit" disabled={isProcessing} className="w-full bg-[#0D47A1] text-white font-bold py-3.5 rounded-xl shadow-lg mt-6 active:scale-95 transition-all flex justify-center items-center">
                    {isProcessing ? <Loader2 className="animate-spin" size={20}/> : "Next"}
                 </button>
               </form>
            </div>
            <div className="mt-auto py-6 flex items-center justify-center gap-1.5 opacity-60"><Lock size={12} className="text-gray-500"/><span className="text-[10px] font-bold text-gray-500 uppercase">Payment Secured with XelPay</span></div>
          </div>
      </div>
    </div>
  );
}