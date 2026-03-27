'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, Loader2, Smartphone, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// প্রোভাইডার কনফিগারেশন (UI কালারের জন্য)
const providers = {
  bkash: { name: 'bKash', bg: 'bg-[#E2136E]/10', text: 'text-[#E2136E]', border: 'border-[#E2136E]/20' },
  nagad: { name: 'Nagad', bg: 'bg-[#F7941D]/10', text: 'text-[#F7941D]', border: 'border-[#F7941D]/20' },
  rocket: { name: 'Rocket', bg: 'bg-[#8C3494]/10', text: 'text-[#8C3494]', border: 'border-[#8C3494]/20' },
  upay: { name: 'Upay', bg: 'bg-[#00529B]/10', text: 'text-[#00529B]', border: 'border-[#00529B]/20' },
  unknown: { name: 'Unknown', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500', border: 'border-slate-200' },
};

export default function SmsData() {
  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState<any[]>([]);
  const [filteredSms, setFilteredSms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔄 ডাটাবেস থেকে SMS ফেচ করা (এখানে Business ID লাগবে না, শুধু Merchant ID লাগবে)
  useEffect(() => {
    const fetchSMS = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('sms_transactions')
          .select('*')
          .eq('merchant_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data) {
          setSmsList(data);
          setFilteredSms(data);
        }
      }
      setLoading(false);
    };

    fetchSMS();
  }, []);

  // 🔍 Smart Search Logic (TrxID বা Sender Number দিয়ে খোঁজা)
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSms(smsList);
    } else {
      const lowercased = searchTerm.toLowerCase();
      const filtered = smsList.filter(sms => 
        (sms.trx_id && sms.trx_id.toLowerCase().includes(lowercased)) ||
        (sms.sender_number && sms.sender_number.toLowerCase().includes(lowercased)) ||
        (sms.amount && sms.amount.toString().includes(lowercased))
      );
      setFilteredSms(filtered);
    }
  }, [searchTerm, smsList]);

  // Date Formatter
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare size={28} className="text-blue-600" /> SMS Log
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of all SMS received by your Android automated reader app.
          </p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by TrxID, Sender Number, or Amount..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* 📱 App Connection Alert */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0 mt-0.5"><Smartphone size={20} /></div>
        <div>
           <h4 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-1">Android App Sync Status</h4>
           <p className="text-xs font-bold text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
             Ensure your Android SMS Forwarder app is running in the background and connected to the internet. All incoming payment SMS will automatically appear here within 2 seconds.
           </p>
        </div>
      </div>

      {/* 🧾 SMS Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex justify-center items-center py-32"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : filteredSms.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">No SMS Data Found</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
              {searchTerm ? "No SMS matches your search query." : "Your app hasn't forwarded any SMS yet. Make sure the app is running and your API key is correctly setup."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#0B1120]/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/50">
                  <th className="p-4 md:px-6 md:py-5">Gateway & TrxID</th>
                  <th className="p-4 md:px-6 md:py-5">Amount</th>
                  <th className="p-4 md:px-6 md:py-5">Sender Details</th>
                  <th className="p-4 md:px-6 md:py-5 hidden lg:table-cell">Raw SMS Preview</th>
                  <th className="p-4 md:px-6 md:py-5">Date & Time</th>
                  <th className="p-4 md:px-6 md:py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredSms.map((sms) => {
                  const config = providers[(sms.provider as keyof typeof providers) || 'unknown'];
                  return (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      
                      {/* Provider & TrxID */}
                      <td className="p-4 md:px-6 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.bg} ${config.text} ${config.border}`}>
                            <span className="font-black text-sm uppercase">{config.name.substring(0, 1)}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white font-mono text-base">{sms.trx_id}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${config.text}`}>
                              {config.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 md:px-6 md:py-4">
                        <p className="font-black text-slate-900 dark:text-white text-lg">
                          ৳ {parseFloat(sms.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Sender Info */}
                      <td className="p-4 md:px-6 md:py-4">
                        <p className="font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                          {sms.sender_number || 'Unknown'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                          To: {sms.receiver_number || 'N/A'}
                        </p>
                      </td>

                      {/* Raw SMS (Desktop Only) */}
                      <td className="p-4 md:px-6 md:py-4 hidden lg:table-cell max-w-xs">
                        <div className="bg-slate-50 dark:bg-[#0B1120] px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono truncate" title={sms.sms_text}>
                          {sms.sms_text}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 md:px-6 md:py-4">
                        <p className="font-bold text-slate-700 dark:text-slate-300">{formatDate(sms.sms_date)}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatTime(sms.sms_date)}</p>
                      </td>

                      {/* Status */}
                      <td className="p-4 md:px-6 md:py-4 text-right">
                        {sms.status === 'used' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-900/50">
                            <CheckCircle2 size={12} /> Used
                          </span>
                        ) : sms.status === 'ignored' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            <ShieldAlert size={12} /> Ignored
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border border-yellow-200 dark:border-yellow-900/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            <Clock size={12} className="animate-pulse" /> Unused
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}