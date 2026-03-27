'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, ArrowRight, Zap, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ActivationScreen({ merchant }: any) {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ডাটাবেস থেকে প্ল্যানগুলো নিয়ে আসা
  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase.from('plans').select('*').order('serial', { ascending: true });
      if (data) {
        setPlans(data);
        const selected = data.find(p => p.id === merchant.plan_id) || data[0];
        setCurrentPlan(selected);
      }
    };
    fetchPlans();
  }, [merchant.plan_id]);

  // পেমেন্ট সিমুলেশন (আপনার XelPay গেটওয়ের API এখানে বসবে)
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // XelPay Gateway Simulation (3 seconds loading)
    setTimeout(async () => {
      // পেমেন্ট সাকসেস হলে ডাটাবেসে স্ট্যাটাস 'active' করে দেওয়া
      const { error } = await supabase.from('merchants').update({ status: 'active', plan_id: currentPlan.id }).eq('id', merchant.id);
      
      if (!error) {
        toast.success("Payment Successful! Welcome to XelPay.");
        window.location.reload(); // রিলোড দিলে ড্যাশবোর্ড ওপেন হয়ে যাবে
      } else {
        toast.error("Failed to activate account. Try again.");
        setIsProcessing(false);
      }
    }, 3000);
  };

  if (!currentPlan) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch bg-white dark:bg-[#111827] md:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
      
      {/* Left Side: Information */}
      <div className="flex-1 p-8 md:p-12 bg-slate-50 dark:bg-[#0B1120] flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-lg text-xs font-black uppercase tracking-widest w-fit mb-6">
          <ShieldCheck size={16} /> Action Required
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-tight">
          Activate Your <br/> <span className="text-blue-600">Merchant Account</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          Hello <b className="text-slate-700 dark:text-slate-200">{merchant.name}</b>, your account is currently pending. Please complete your subscription payment to unlock the full potential of your XelPay dashboard.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle size={16}/></div>
             Instant Gateway Setup
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle size={16}/></div>
             API & Plugins Access
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle size={16}/></div>
             Unlimited Transactions
          </div>
        </div>
      </div>

      {/* Right Side: Checkout Form */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-[#111827]">
        
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Order Summary</h3>
        
        {/* Selected Plan Card */}
        <div className="bg-slate-50 dark:bg-[#0B1120] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 mb-8 relative group hover:border-blue-500 transition-colors">
           <button onClick={() => setShowPlanSwitcher(true)} className="absolute top-4 right-4 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1">
             <RefreshCw size={12}/> Change Plan
           </button>
           <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-1">{currentPlan.name}</h4>
           <div className="flex items-baseline gap-1 mb-4">
             <span className="text-3xl font-black text-blue-600">৳{currentPlan.price}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase">/month</span>
           </div>
           
           <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-4"></div>
           <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white uppercase">
             <span>Total to Pay</span>
             <span className="text-lg">৳{currentPlan.price}</span>
           </div>
        </div>

        {/* Secure Checkout Button */}
        <button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="w-full bg-blue-600 disabled:bg-slate-400 text-white py-4 md:py-5 rounded-2xl font-black text-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 relative overflow-hidden group"
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" size={24}/> Processing Payment...</>
          ) : (
            <>
               <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
               Pay with XelPay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-6 text-xs font-bold text-slate-400">
           <CreditCard size={14} /> 100% Secure & Automated Payment
        </div>

      </div>

      {/* Plan Switcher Modal */}
      {showPlanSwitcher && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-4xl rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-center mb-8 uppercase text-slate-900 dark:text-white">Choose a New Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {plans.map(p => (
                 <div key={p.id} onClick={() => { setCurrentPlan(p); setShowPlanSwitcher(false); }} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${currentPlan.id === p.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] hover:border-blue-300'}`}>
                    <h4 className="font-black text-lg uppercase mb-2 text-slate-900 dark:text-white">{p.name}</h4>
                    <div className="text-2xl font-black text-blue-600 mb-4">৳{p.price}</div>
                    <div className="w-full py-2 text-center rounded-lg bg-white dark:bg-slate-800 text-sm font-bold shadow-sm">Select</div>
                 </div>
               ))}
            </div>
            <button onClick={() => setShowPlanSwitcher(false)} className="w-full mt-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}