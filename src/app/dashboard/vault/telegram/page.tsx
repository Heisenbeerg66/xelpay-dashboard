'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck,
  Loader2, ExternalLink, Unlink, Copy, AlertTriangle, User, AtSign
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
      toast.success('New 12-digit Secure Link Generated!');
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
      <Loader2 className="animate-spin text-blue-600 mb-3" size={36} strokeWidth={2.5} />
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
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Global Notification Node</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-4">

          {/* ── Main Card ── */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Banner */}
            <div className={`px-8 py-8 flex flex-col items-center text-center ${isConnected ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              <div className="w-[72px] h-[72px] bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/20 shadow-lg text-white">
                {isConnected ? <CheckCircle2 size={38} strokeWidth={2} /> : <Bot size={38} strokeWidth={1.5} />}
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {isConnected ? 'Bot Connected' : 'Setup Pending'}
              </h2>
              <p className={`text-sm font-medium mt-2 max-w-sm ${isConnected ? 'text-emerald-100' : 'text-blue-100'}`}>
                {isConnected
                  ? 'Payment notifications are being sent to your Telegram.'
                  : 'Link the bot to receive instant payment alerts globally.'}
              </p>
            </div>

            <div className="p-6 md:p-8">
              {isConnected ? (
                <div className="space-y-4">
                  {/* Connected Identity */}
                  <div className="grid grid-cols-1 gap-3">
                    {merchantData?.telegram_display_name && (
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <User size={18} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Full Name</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{merchantData.telegram_display_name}</p>
                        </div>
                      </div>
                    )}
                    {merchantData?.telegram_username && (
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <AtSign size={18} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Username</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">@{merchantData.telegram_username}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Chat ID</p>
                          <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                            {String(merchantData.telegram_chat_id)}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => copyToClipboard(merchantData.telegram_chat_id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUnlinkModal(true)}
                    className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Unlink size={14} /> Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {!merchantData?.telegram_link_code ? (
                    <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-blue-400 transition-all disabled:opacity-60">
                          {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={2.5} />} Regenerate
                        </button>
                        <button onClick={() => copyToClipboard(telegramLink)} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-sky-400 transition-all">
                          <Copy size={13} strokeWidth={2.5} /> Copy Link
                        </button>
                        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                          <ExternalLink size={13} strokeWidth={2.5} /> Open
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── How It Works (compact, only when not connected) ── */}
          {!isConnected && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">How It Works</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { n: '1', t: 'Generate a secure pairing link.' },
                  { n: '2', t: 'Open the link in Telegram.' },
                  { n: '3', t: 'Click /start in the bot.' },
                  { n: '4', t: 'Alerts start flowing instantly.' },
                ].map(({ n, t }) => (
                  <div key={n} className="flex items-start gap-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-lg p-2.5">
                    <span className="w-5 h-5 bg-sky-600 text-white text-[9px] font-black rounded flex items-center justify-center shrink-0">{n}</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Unlink Confirmation Modal ── */}
      {showUnlinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Unlink Telegram?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">You will stop receiving automated payment alerts. This action can be undone by reconnecting.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUnlinkModal(false)} disabled={unlinking} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleUnlink} disabled={unlinking} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                  {unlinking ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />} Unlink
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}