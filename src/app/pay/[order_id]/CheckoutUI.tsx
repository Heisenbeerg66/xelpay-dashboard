'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Headphones, HelpCircle, Info, Copy, Loader2, ArrowLeft, X, ShieldCheck, CheckCircle, Download, Home, Lock, XCircle 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'sonner'; 
import { verifyAndCompletePayment, cancelAndNotifyOrder } from '@/lib/payment-actions';
import { supabase } from '@/lib/supabase';

export default function CheckoutUI({ order, business, merchant, linkData, gateways }: { order: any, business: any, merchant: any, linkData: any, gateways: any[] }) {
  const router = useRouter();
  
  const [step, setStep] = useState(2); 
  const [topView, setTopView] = useState<'none' | 'support' | 'help' | 'info'>('none');
  const [activeTab, setActiveTab] = useState('mobile'); 
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [trxId, setTrxId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(order.currency || 'BDT');

  useEffect(() => {
    if(order.status === 'pending') {
        const savedStep = sessionStorage.getItem(`step_${order.order_no}`);
        const savedMethodId = sessionStorage.getItem(`methodId_${order.order_no}`);
        if (savedStep === '3' && savedMethodId) {
            const restoredMethod = gateways.find((g: any) => g.id === savedMethodId);
            if (restoredMethod) {
                setStep(3);
                setSelectedMethod(restoredMethod);
                setActiveTab(restoredMethod.category);
                setTrxId(merchant?.is_demo ? 'DEMO-PAYMENT' : ''); 
            }
        }
    }
  }, [order.order_no, order.status, merchant, gateways]);

  const getDisplayAmount = () => {
      if (activeTab === 'international') {
          const rate = business?.exchange_rate > 0 ? business.exchange_rate : 1;
          return parseFloat((order.amount / rate).toFixed(2));
      }
      return order.amount;
  };

  // ✅ NEW: Added branch & routing_number logic
  const getCopyValue = (key: string) => {
      if(key === 'amount') return getDisplayAmount().toString();
      if(key === 'orderId' || key === 'ref_code') return order.order_no;
      if(key === 'account_number' || key === 'wallet_number') return selectedMethod?.account_number;
      if(key === 'account_name') return selectedMethod?.account_name || business?.business_name;
      if(key === 'branch') return selectedMethod?.branch; // ✅ Added
      if(key === 'routing_number') return selectedMethod?.routing_number; // ✅ Added
      return '';
  };

  const handleTabSwitch = (tab: string) => {
      setActiveTab(tab); 
      setSelectedMethod(null);
      setTrxId(''); 
      setCurrentCurrency(tab === 'international' ? 'USD' : (order.currency || 'BDT'));
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text.toString());
      toast.success("Copied to clipboard!"); 
  };

  const handleVerify = async () => {
      if (!trxId) { toast.error("Enter Transaction ID please"); return; }
      setVerifying(true); 
      const res = await verifyAndCompletePayment({
          trxId, 
          merchantId: merchant.id, 
          orderId: order.order_no, 
          expectedAmount: order.amount, 
          method: selectedMethod.name, 
          parentMethod: selectedMethod.parentMethod 
      });
      if (res.success) {
          toast.success("Payment Verified Successfully!");
          setStep(4); 
          sessionStorage.removeItem(`step_${order.order_no}`);
          sessionStorage.removeItem(`methodId_${order.order_no}`);
      } else {
          toast.error(res.message); 
      }
      setVerifying(false);
  };

  const handleCancelOrder = async () => {
      setCancelling(true);
      await cancelAndNotifyOrder(order.order_no);
      
      toast.error("Order Cancelled!"); // 🚀 NEW: Added Cancellation Toast Message
      
      const targetUrl = order?.redirect_url || linkData?.redirect_url;
      if (targetUrl) {
          try {
              const urlObj = new URL(targetUrl);
              urlObj.searchParams.set('status', 'canceled');
              urlObj.searchParams.set('order_id', order.order_no);
              window.location.href = urlObj.toString();
          } catch (e) {
              window.location.href = targetUrl; 
          }
      } else {
          setStep(5);
      }
      setCancelling(false);
  };

  const getTrxLabel = () => {
      if (activeTab === 'mobile') return { label: 'Enter Transaction ID', hint: 'Enter Your Trx Id' };
      if (activeTab === 'bank') return { label: 'Enter Reference / Notes', hint: 'Reference No' };
      return { label: 'Enter Transaction Hash/ID', hint: 'TxHash' };
  };

  const getEligibleGateways = () => {
      return gateways.filter((gw: any) => {
          // 🚀 NEW: 'global' also shows in 'international' tab
          const cat = gw.category?.toLowerCase() || 'mobile';
          if (activeTab === 'international') {
              if (cat !== 'international' && cat !== 'global') return false;
          } else {
              if (cat !== activeTab) return false;
          }
          
          const checkAmount = activeTab === 'international' ? (order.amount / (business?.exchange_rate || 1)) : order.amount;
          const minLimit = gw.min_amount ? parseFloat(gw.min_amount) : 0;
          const maxLimit = gw.max_amount ? parseFloat(gw.max_amount) : 0;

          if (minLimit > 0 && checkAmount < minLimit) return false;
          if (maxLimit > 0 && checkAmount > maxLimit) return false;
          return true;
      });
  };

  const generatePremiumInvoice = () => { /* PDF Logic */ };
  
  const inputLabels = getTrxLabel();
  const eligibleGateways = getEligibleGateways();

  return (
    <div className="min-h-[100dvh] font-sans flex justify-center items-center md:py-4 md:px-4 bg-[#F0F4F8] relative text-black">
      <Toaster position="top-center" richColors /> 
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block" style={{ backgroundImage: `radial-gradient(#CFD8E3 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

      <div className="w-full max-w-[450px] bg-white min-h-[100dvh] md:min-h-[750px] md:h-[750px] md:rounded-[30px] md:shadow-2xl md:border md:border-gray-100 relative overflow-hidden flex flex-col z-10">
        
        {step === 2 && (
          <div className="flex flex-col h-full bg-white relative">
            {merchant?.is_demo && (
              <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold py-1.5 text-center uppercase tracking-widest border-b border-yellow-200 shrink-0">
                Demo Mode - No Real Money Required
              </div>
            )}
            <div className="pt-6 px-6 pb-2 flex justify-between items-center text-gray-700">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all"><ArrowLeft size={24}/></button>
                <span className="font-bold text-lg text-black">Secure Payments</span>
                <button onClick={handleCancelOrder} disabled={cancelling} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all disabled:opacity-50"><X size={24}/></button>
            </div>
            <div className="px-6 pt-2 pb-4">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-white rounded-full border shadow-sm flex items-center justify-center p-2 mb-3">
                        {business?.logo_url ? <img src={business.logo_url} className="w-full h-full object-contain" alt="logo"/> : <span className="text-xl font-bold">{business?.business_name?.charAt(0)}</span>}
                    </div>
                    <h2 className="text-lg font-medium text-black">{business?.business_name}</h2>
                </div>
                
                <div className="flex justify-center gap-4 mb-6">
                   <button onClick={() => setTopView(topView==='support'?'none':'support')} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${topView==='support'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-500'}`}><Headphones size={18}/></button>
                   <button onClick={() => setTopView(topView==='help'?'none':'help')} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${topView==='help'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-500'}`}><HelpCircle size={18}/></button>
                   <button onClick={() => setTopView(topView==='info'?'none':'info')} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${topView==='info'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-500'}`}><Info size={18}/></button>
                </div>

                {topView !== 'none' && ( 
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 text-sm text-black animate-in slide-in-from-top-2">
                     {topView === 'support' && <div className="space-y-1"><p>Email: {business?.support_email || 'N/A'}</p><p>Phone: {business?.support_phone || 'N/A'}</p></div>}
                     {topView === 'help' && <div className="space-y-1.5 font-medium"><p>1. Select Payment Method</p><p>2. Read Instructions Carefully</p><p>3. Make The Payment</p><p>4. Verify Your Payment</p></div>}
                     {topView === 'info' && <div className="space-y-1.5 font-medium"><p><strong>Name:</strong> {order.customer_name}</p><p><strong>Phone:</strong> {order.customer_number}</p><p><strong>Email:</strong> {order.customer_email}</p><div className="h-px bg-gray-200 my-1"></div><p><strong>Product:</strong> {order.product_name}</p>{linkData?.description && <p><strong>Details:</strong> {linkData.description}</p>}<p><strong>Amount:</strong> {getDisplayAmount()} {currentCurrency}</p></div>}
                  </div>
                )}
                
                <div className="w-full p-1 bg-[#0D47A1] rounded-xl flex gap-1">{['mobile', 'bank', 'international'].map((tab) => (<button key={tab} onClick={() => handleTabSwitch(tab)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-white text-[#0D47A1]' : 'text-blue-200 hover:text-white'}`}>{tab}</button>))}</div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 mt-5">
               {eligibleGateways.length > 0 ? (
                 <div className="grid grid-cols-2 gap-3">
                   {eligibleGateways.map((gw: any) => (
                     <div key={gw.id} onClick={() => { setSelectedMethod(selectedMethod?.id === gw.id ? null : gw); setTrxId(''); }} className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-2 h-28 cursor-pointer relative transition-all shadow-sm group ${selectedMethod?.id === gw.id ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white hover:border-blue-300'}`}>
                       {selectedMethod?.id === gw.id && <div className="absolute top-1 right-1 text-blue-600"><ShieldCheck size={16}/></div>}
                       <img src={gw.logo} className="h-8 object-contain" alt={gw.name}/>
                       <div className="w-full h-px bg-gray-100 my-1"></div>
                       <p className="text-[10px] font-bold text-gray-700 text-center uppercase tracking-tight leading-none">{gw.labelText}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-10 opacity-60">
                   <p className="font-bold text-gray-500">No payment methods available</p>
                   <p className="text-xs text-gray-400 mt-1">for this amount in this category.</p>
                 </div>
               )}
            </div>
            <div className="absolute bottom-0 w-full left-0 p-6 pt-2 bg-white">
                <button onClick={() => { 
                    setStep(3); 
                    sessionStorage.setItem(`step_${order.order_no}`, '3');
                    sessionStorage.setItem(`methodId_${order.order_no}`, selectedMethod.id);
                    if(merchant?.is_demo) setTrxId('DEMO-PAYMENT'); 
                }} disabled={!selectedMethod} className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all ${selectedMethod ? 'bg-[#0D47A1] text-white active:scale-95' : 'bg-blue-100 text-blue-300 cursor-not-allowed'}`}>
                    Pay {getDisplayAmount()} {currentCurrency}
                </button>
            </div>
          </div>
        )}{step === 3 && selectedMethod && (
          <div className="flex flex-col h-full bg-white relative">
            {merchant?.is_demo && (
              <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold py-1.5 text-center uppercase tracking-widest border-b border-yellow-200 shrink-0">
                Demo Mode Active
              </div>
            )}
            <div className="pt-6 px-6 pb-4 flex justify-between items-center text-gray-700">
                <button onClick={() => { setStep(2); sessionStorage.setItem(`step_${order.order_no}`, '2'); setTrxId(''); }} className="hover:bg-gray-100 p-2 rounded-full transition-all"><ArrowLeft size={24}/></button>
                <span className="font-bold text-lg text-black">Secure Payments</span>
                <button onClick={handleCancelOrder} disabled={cancelling} className="hover:bg-red-50 hover:text-red-500 p-2 rounded-full transition-all disabled:opacity-50"><X size={24}/></button>
            </div>
            <div className="px-6 pb-24 overflow-y-auto h-full hide-scrollbar">
                <div className="flex items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center p-2"><img src={selectedMethod.logo} className="w-full h-full object-contain" alt="logo"/></div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase">Payable Amount</p>
                        <h2 className="text-xl font-black text-black">{getDisplayAmount()} {currentCurrency}</h2>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">Order ID: {order.order_no}</p>
                    </div>
                </div>
                <div className="rounded-2xl p-6 shadow-lg mb-8 transition-all" style={{ backgroundColor: selectedMethod.themeColor, color: '#FFFFFF' }}>
                   <ul className="space-y-3 text-sm font-medium">
                      {selectedMethod.instructions?.map((instr: any, index: number) => {
                          let val = instr.copyKey ? getCopyValue(instr.copyKey) : (instr.value === 'MERCHANT_NAME_PLACEHOLDER' ? (selectedMethod.account_name || business?.business_name || 'N/A') : instr.value);
                          const isAddress = instr.label.toLowerCase().includes('address');
                          const isAmount = instr.copyKey === 'amount';
                          return (
                              <li key={index} className={`flex ${isAddress ? 'flex-col items-start gap-1' : 'justify-between items-center'} py-2 border-b border-white/20 last:border-0`}>
                                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div><span>{instr.label}</span></div>
                                  <div className="flex items-center gap-2">
                                      <span className={`font-bold ${isAddress ? 'font-mono text-xs break-all bg-black/10 p-2 rounded' : ''}`}>{val}{isAmount && <span className="text-[10px] opacity-80 ml-1">{currentCurrency === 'BDT' ? 'TK' : currentCurrency}</span>}</span>
                                      {instr.type === 'copy' && <button onClick={() => handleCopy(val)} className="bg-white/20 p-1.5 rounded hover:bg-white/30 transition-all"><Copy size={14}/></button>}
                                  </div>
                              </li>
                          )
                      })}
                   </ul>
                   <div className="mt-8 text-black">
                       <label className="text-xs font-bold text-white opacity-80 mb-2 block">{inputLabels.label}</label>
                       <input placeholder={inputLabels.hint} className="w-full px-4 py-3.5 rounded-lg border-0 outline-none text-black font-bold bg-white focus:ring-2 focus:ring-white/50 placeholder:text-gray-400" onChange={(e) => setTrxId(e.target.value)} value={trxId}/>
                   </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 pt-2 bg-white">
                <button onClick={handleVerify} disabled={verifying} className="w-full font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center text-white hover:brightness-90 active:scale-95 disabled:opacity-70" style={{ backgroundColor: selectedMethod.themeColor }}>
                    {verifying ? <Loader2 className="animate-spin" size={20}/> : "VERIFY PAYMENT"}
                </button>
            </div>
          </div>
        )}

        {step === 4 && (
            <div className="absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 rounded-[30px] z-50 overflow-hidden text-black">
                <div className="shrink-0 mb-6 flex flex-col items-center"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="text-green-600 w-16 h-16" strokeWidth={3} /></div><h1 className="text-2xl font-black">Success!</h1><p className="text-gray-500 text-sm mt-1">Transaction ID: <span className="font-mono font-bold text-gray-700">{trxId || order.trx_id}</span></p></div>
                
                <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Paid to</span><span className="font-bold">{business?.business_name}</span></div>
                    <div className="flex justify-between"><span>Method</span><span className="font-bold">{selectedMethod?.name || order.method}</span></div>
                    <div className="flex justify-between"><span>Order ID</span><span className="font-bold">{order.order_no}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-3"><span>Amount Paid</span><span className="font-bold text-green-600">{getDisplayAmount()} {currentCurrency}</span></div>
                </div>

                <div className="w-full space-y-3 shrink-0">
                    <button onClick={generatePremiumInvoice} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-all flex justify-center gap-2"><Download size={18}/> Download Receipt</button>
                    <button onClick={() => { if (order?.redirect_url) window.location.href = order.redirect_url; else if (linkData?.redirect_url) window.location.href = linkData.redirect_url; else window.location.href = '/'; }} className="w-full bg-[#0D47A1] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center gap-2"><Home size={18}/> Back to Home</button>
                </div>
            </div>
        )}

        {step === 5 && (
            <div className="absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 rounded-[30px] z-50 overflow-hidden text-black">
                <div className="shrink-0 mb-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="text-red-500 w-12 h-12" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Payment Cancelled</h1>
                    <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">You have cancelled this transaction.<br/>No money was deducted.</p>
                </div>
                
                <div className="w-full space-y-3 shrink-0 mt-8">
                    <button onClick={() => window.location.reload()} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-all flex justify-center gap-2">Try Again</button>
                    <button onClick={() => window.location.href = '/'} className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all flex justify-center gap-2"><Home size={18}/> Back to Home</button>
                </div>
                <div className="mt-auto py-4 flex items-center justify-center gap-1.5 opacity-60"><Lock size={12} className="text-gray-500"/><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secured with XelPay</span></div>
            </div>
        )}

      </div>
    </div>
  );
}