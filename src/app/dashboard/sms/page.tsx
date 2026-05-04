'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, Loader2, Smartphone, CheckCircle2, Clock, ShieldAlert, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const providers: Record<string, { name: string; color: string }> = {
  bkash:   { name: 'bKash',   color: 'text-pink-600 dark:text-pink-400' },
  nagad:   { name: 'Nagad',   color: 'text-orange-500 dark:text-orange-400' },
  rocket:  { name: 'Rocket',  color: 'text-purple-600 dark:text-purple-400' },
  upay:    { name: 'Upay',    color: 'text-blue-600 dark:text-blue-400' },
  unknown: { name: 'Unknown', color: 'text-slate-500 dark:text-slate-400' },
};

const getProvider = (method: string): { name: string; color: string } => {
  const m = (method || '').toLowerCase();
  for (const key of Object.keys(providers)) {
    if (key !== 'unknown' && m.includes(key)) return providers[key];
  }
  return providers.unknown;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

export default function SmsData() {
  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState<any[]>([]);
  const [filteredSms, setFilteredSms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSMS = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('sms_transactions')
          .select('id, sender, method, message, trx_id, amount, received_at, is_used, created_at')
          .eq('merchant_id', user.id)
          .order('received_at', { ascending: false });
        if (data) { setSmsList(data); setFilteredSms(data); }
      }
      setLoading(false);
    };
    fetchSMS();
  }, []);

  useEffect(() => {
    if (!searchTerm) { setFilteredSms(smsList); return; }
    const s = searchTerm.toLowerCase();
    setFilteredSms(smsList.filter(sms =>
      sms.trx_id?.toLowerCase().includes(s) ||
      sms.sender?.toLowerCase().includes(s) ||
      sms.amount?.toString().includes(s) ||
      sms.method?.toLowerCase().includes(s)
    ));
  }, [searchTerm, smsList]);

  const getStatus = (sms: any) => {
    if (sms.is_used) return { label: 'PAID', cls: 'text-emerald-500 dark:text-emerald-400', icon: CheckCircle2 };
    return { label: 'PENDING', cls: 'text-amber-500 dark:text-amber-400', icon: Clock };
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SMS</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare size={22} className="text-slate-600 dark:text-slate-400" />
            SMS Log
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of all SMS received by your Android automated reader app.
          </p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" size={15} />
          <input
            type="text"
            placeholder="Search by TrxID, Sender, Amount..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-9 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-slate-400 dark:focus:border-slate-600 text-sm font-medium text-slate-900 dark:text-white transition-all shadow-sm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* App Sync Notice */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone size={16} className="text-slate-500 dark:text-slate-400" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Android App Sync Status</h4>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Ensure your Android SMS Forwarder app is running in the background and connected to the internet. All incoming payment SMS will automatically appear here within 2 seconds.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : filteredSms.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-14 h-14 bg-slate-50 dark:bg-[#0B1120] text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">No SMS Data Found</h3>
            <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto">
              {searchTerm ? 'No SMS matches your search query.' : "Your app hasn't forwarded any SMS yet. Make sure the app is running and your API key is correctly set up."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800">
                  {['Sender', 'Method', 'TRX ID', 'Amount', 'Message Preview', 'Received At', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredSms.map((sms) => {
                  const provider = getProvider(sms.method);
                  const statusInfo = getStatus(sms);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={sms.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">

                      {/* Sender */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">{sms.sender || 'Unknown'}</p>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${provider.color}`}>
                          {provider.name}
                        </span>
                        {sms.method && sms.method.toLowerCase() !== provider.name.toLowerCase() && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{sms.method}</p>
                        )}
                      </td>

                      {/* TRX ID */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{sms.trx_id || '—'}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          ৳{parseFloat(sms.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Message Preview */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="bg-slate-50 dark:bg-[#0B1120] px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate" title={sms.message}>
                          {sms.message || '—'}
                        </div>
                      </td>

                      {/* Received At */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(sms.received_at)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(sms.received_at)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${statusInfo.cls}`}>
                          <StatusIcon size={11} className={sms.is_used ? '' : 'animate-pulse'} />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredSms.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-xs text-slate-400">
              {filteredSms.length} records
              {searchTerm && <> · filtered</>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}