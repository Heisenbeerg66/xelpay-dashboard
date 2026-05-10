'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck,
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
        telegram_username: null
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

      {/* ── Header ── */}
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Premium Clean Top Section */}
          <div className={`p-6 md:p-8 text-center border-b border-slate-100 dark:border-slate-800 ${isConnected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-indigo-50/50 dark:bg-indigo-900/10'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm mx-auto ${isConnected ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
              {isConnected ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Bot size={32} strokeWidth={2} />}
            </div>
            <h2 className={`text-xl font-black uppercase tracking-tight ${isConnected ? 'text-emerald-900 dark:text-emerald-400' : 'text-indigo-900 dark:text-indigo-400'}`}>
              {isConnected ? 'Bot Connected' : 'Setup Pending'}
            </h2>
            <p className="text-sm font-medium mt-1.5 max-w-sm mx-auto text-slate-500 dark:text-slate-400">
              {isConnected ? 'Payment notifications are active.' : 'Link the bot to receive instant alerts globally.'}
            </p>
          </div>
          
          <div className="p-6 md:p-8">
            {isConnected ? (
              <div className="space-y-4">
                {/* Connected Identity */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <User size={30} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{merchantData?.telegram_display_name || 'Connected User'}</h3>
                  {/* Removed the @ icon, kept just the username text */}
                  {merchantData?.telegram_username && (
                    <p className="text-sm text-slate-500 font-medium">
                      {merchantData.telegram_username}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    <ShieldCheck size={14} /> Active Connection
                  </div>
                </div>

                {/* Softer Unlink Button */}
                <button onClick={() => setShowUnlinkModal(true)} className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                  <Unlink size={16} strokeWidth={2.5} /> Unlink Telegram
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Instruction System with White Text in Dark Mode */}
                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">How to Connect</h4>
                  <ol className="text-xs md:text-sm text-slate-700 dark:text-white space-y-2.5 list-decimal list-inside font-medium">
                    <li>Click <b>Generate Link</b> below.</li>
                    <li>Copy the Bot Link or click <b>Open Bot</b>.</li>
                    <li>Hit the <b>Start</b> button in Telegram to sync.</li>
                  </ol>
                </div>

                {!merchantData?.telegram_link_code ? (
                  <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all">
                    {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Link Box on Top */}
                    <div className="p-4 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-700 w-full text-left">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2 uppercase tracking-widest">Your Bot Link</p>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                        <input 
                          type="text" 
                          readOnly 
                          value={telegramLink} 
                          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium px-2 outline-none w-full"
                        />
                        <button 
                          onClick={() => copyToClipboard(telegramLink)}
                          className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors shrink-0"
                        >
                          <Copy size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Premium Tinted Regenerate Button */}
                      <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                        <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? '...' : 'Regenerate'}
                      </button>
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-sm">
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
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-500 dark:text-red-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Unlink Telegram?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">You will stop receiving automated payment alerts. This action can be undone by reconnecting.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUnlinkModal(false)} disabled={unlinking} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  Cancel
                </button>
                {/* Softer Unlink action button */}
                <button onClick={handleUnlink} disabled={unlinking} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm">
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