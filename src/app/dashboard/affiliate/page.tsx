'use client';

import { useState, useEffect } from 'react';
import { Users, Gift, Copy, Wallet, ArrowUpRight, TrendingUp, CheckCircle2, Loader2, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AffiliateProgram() {
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState('');
  
  // Mock Data for UI (Future DB Connection)
  const stats = {
    clicks: 142,
    referrals: 12,
    totalEarned: 2450.00,
    availableBalance: 850.00
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMerchantId(user.id);
        // ইউজারের আইডি দিয়ে একটি ইউনিক রেফারেল লিংক জেনারেট করা হচ্ছে
        setReferralLink(`${window.location.origin}/register?ref=${user.id.substring(0, 8)}`);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Affiliate link copied to clipboard!');
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center"><Users size={20} className="-ml-0.5" /></div>
            Affiliate Program
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Invite other businesses to XelPay and earn 20% recurring commission for life!
          </p>
        </div>
        
        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
          <Wallet size={18} /> Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* 🔗 The Link & How it works */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Magic Link Box */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/20 shadow-inner">
                <Gift size={40} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-2">
                  Your Unique Invite Link <Sparkles size={20} className="text-yellow-300" />
                </h2>
                <p className="text-blue-100 text-sm font-medium mb-6 max-w-md">
                  Share this link on your YouTube channel, blog, or social media. Anyone who signs up using this link becomes your lifetime referral.
                </p>
                
                <div className="flex flex-col sm:flex-row bg-black/20 p-1.5 rounded-2xl border border-white/20 backdrop-blur-sm">
                  <input 
                    type="text" 
                    readOnly 
                    value={referralLink} 
                    className="w-full px-4 py-3.5 bg-transparent outline-none text-sm font-mono font-bold text-white truncate" 
                  />
                  <button onClick={copyToClipboard} className="sm:w-auto w-full bg-white text-blue-700 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shrink-0">
                    <Copy size={16} /> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 📈 Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Link Clicks</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.clicks}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Referrals</p>
              <p className="text-2xl font-black text-blue-600">{stats.referrals}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">৳ {stats.totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Available to Withdraw</p>
              <p className="text-2xl font-black text-blue-600">৳ {stats.availableBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Recent Referrals</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#0B1120]/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-4 md:px-6 md:py-4">Merchant</th>
                    <th className="p-4 md:px-6 md:py-4">Plan</th>
                    <th className="p-4 md:px-6 md:py-4">Date Joined</th>
                    <th className="p-4 md:px-6 md:py-4 text-right">Your Commission</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/50">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 md:px-6 md:py-4 font-bold">TechShop BD</td>
                    <td className="p-4 md:px-6 md:py-4"><span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Premium</span></td>
                    <td className="p-4 md:px-6 md:py-4 text-slate-500 text-xs font-bold">Oct 24, 2026</td>
                    <td className="p-4 md:px-6 md:py-4 text-right font-black text-green-600">+ ৳ 100.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 md:px-6 md:py-4 font-bold">Fashion House</td>
                    <td className="p-4 md:px-6 md:py-4"><span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Basic</span></td>
                    <td className="p-4 md:px-6 md:py-4 text-slate-500 text-xs font-bold">Oct 20, 2026</td>
                    <td className="p-4 md:px-6 md:py-4 text-right font-black text-green-600">+ ৳ 0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Instructions */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-[#0B1120] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">How it works</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Share your link</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Copy your unique referral link and share it with business owners, developers, or friends.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">They sign up</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">When someone clicks your link and creates a XelPay account, they are permanently tagged as your referral.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center font-black text-sm shrink-0"><CheckCircle2 size={16} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">You get paid!</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">You earn a <b className="text-slate-700 dark:text-slate-300">20% commission</b> on their monthly subscription fee, every single month.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
               <button className="w-full py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors flex justify-center items-center gap-2 uppercase tracking-widest">
                 <Share2 size={16} /> Share on Facebook
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}