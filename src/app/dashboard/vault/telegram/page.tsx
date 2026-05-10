'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bot, RefreshCw, CheckCircle2,
  Loader2, ExternalLink, Unlink, Copy, AlertTriangle, User
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getMerchantVaultSettings, generateTelegramCode, getTelegramBotUsername, unlinkMerchantTelegram } from '@/lib/vault_actions';

export default function MasterTelegramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [botUsername, setBotUsername] = useState<string>('xelpay_alert_bot');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [res, botRes] = await Promise.all([
      getMerchantVaultSettings(),
      getTelegramBotUsername()
    ]);
    if (res.success) setMerchantData(res.data);
    if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    const res = await generateTelegramCode();
    if (res.success) {
      toast.success('New Link Generated!');
      setMerchantData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
    } else {
      toast.error('Failed to generate code.');
    }
    setGenerating(false);
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    const res = await unlinkMerchantTelegram();
    if (res.success) {
      setMerchantData((prev: any) => ({
        ...prev,
        telegram_chat_id: null,
        telegram_display_name: null,
        telegram_username: null,
        telegram_link_code: null
      }));
      toast.success('Telegram unlinked successfully.');
    } else {
      toast.error(res.message || 'Failed to unlink.');
    }
    setUnlinking(false);
    setShowUnlinkModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!')).catch(() => toast.error('Failed to copy'));
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Vault</p>
    </div>
  );

  const isConnected = !!merchantData?.telegram_chat_id;
  const telegramLink = `https://t.me/${botUsername}?start=${merchantData?.telegram_link_code || ''}`;

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Telegram</h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Vault Alert Channel</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-sm">
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${isConnected ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                {isConnected ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Bot size={28} strokeWidth={2.5} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isConnected ? 'Bot Connected' : 'Setup Pending'}
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  {isConnected ? 'Alerts are actively routing.' : 'Link bot for instant alerts.'}
                </p>
              </div>
            </div>
            
            {isConnected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Connection</span>
              </div>
            )}
          </div>
          
          <div className="p-6 md:p-8">
            {isConnected ? (
              <div className="space-y-6">
                {/* Premium Connected Box */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-lg border border-emerald-400/30">
                  <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm">
                    <User size={28} strokeWidth={2.5} />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-xl font-black text-white mb-0.5">{merchantData?.telegram_display_name || 'Connected User'}</h3>
                    {merchantData?.telegram_username && (
                      <p className="text-sm font-medium text-emerald-100">
                        {merchantData.telegram_username}
                      </p>
                    )}
                  </div>
                </div>

                <button onClick={() => setShowUnlinkModal(true)} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                  <Unlink size={16} strokeWidth={2.5} /> Unlink Telegram
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {!merchantData?.telegram_link_code ? (
                  <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all">
                    {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                  </button>
                ) : (
                  <div className="space-y-5">
                    {/* Updated Instruction Box with Code */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">How to Connect</h4>
                      <ol className="text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-3 list-decimal list-inside font-medium">
                        <li>Copy the Bot Link or click <b>Open Bot</b>.</li>
                        <li>For Personal Chat: Simply hit <b>Start</b>.</li>
                        <li>
                           <span className="font-bold text-indigo-600 dark:text-indigo-400">For Groups:</span> Add the bot, then send this exact command:
                           <div className="mt-2 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                               <code className="flex-1 text-xs sm:text-sm font-black text-slate-800 dark:text-white px-2">/start {merchantData.telegram_link_code}</code>
                               <button onClick={() => copyToClipboard(`/start ${merchantData.telegram_link_code}`)} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors shrink-0">
                                   <Copy size={16} strokeWidth={2.5} />
                               </button>
                           </div>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-700 w-full text-left">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">Your Pairing Link</p>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                        <input 
                          type="text" 
                          readOnly 
                          value={telegramLink} 
                          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono font-bold px-2 outline-none w-full"
                        />
                        <button 
                          onClick={() => copyToClipboard(telegramLink)}
                          className="p-2 sm:p-2.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg transition-colors shrink-0"
                        >
                          <Copy size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleGenerateCode} disabled={generating} className="py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                        <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? '...' : 'Regenerate'}
                      </button>
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                        <ExternalLink size={14} strokeWidth={2.5} /> Open Bot
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUnlinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/30">
                <AlertTriangle size={28} className="text-red-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Unlink Telegram?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">Alerts will stop routing to this connection immediately. You can reconnect anytime.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUnlinkModal(false)} disabled={unlinking} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button onClick={handleUnlink} disabled={unlinking} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md">
                  {unlinking ? <Loader2 size={16} className="animate-spin" /> : 'Unlink'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}