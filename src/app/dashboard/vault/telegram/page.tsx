'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, ExternalLink, Unlink, Copy, Link2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getMerchantVaultSettings, generateTelegramCode, getTelegramBotUsername } from '@/lib/vault_actions';
import { supabase } from '@/lib/supabase';

export default function MasterTelegramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
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
    if (!confirm('Are you sure you want to unlink Telegram? You will stop receiving automated alerts.')) return;
    setUnlinking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');
      const { error } = await supabase.from('merchants').update({ telegram_chat_id: null }).eq('id', user.id);
      if (error) throw error;
      setMerchantData((prev: any) => ({ ...prev, telegram_chat_id: null }));
      toast.success('Telegram unlinked successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlink.');
    } finally {
      setUnlinking(false);
    }
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Telegram</h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Global Notification Node</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-5">

          {/* ── Status / Main Card ── */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Status Banner */}
            <div className={`px-8 py-8 flex flex-col items-center text-center ${isConnected ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              <div className="w-18 h-18 w-[72px] h-[72px] bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg text-white">
                {isConnected ? <CheckCircle2 size={38} strokeWidth={2} /> : <Bot size={38} strokeWidth={1.5} />}
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {isConnected ? 'Bot Connected' : 'Setup Pending'}
              </h2>
              <p className={`text-sm font-medium mt-2 max-w-sm ${isConnected ? 'text-emerald-100' : 'text-blue-100'}`}>
                {isConnected
                  ? 'Real-time payment alerts are being sent to your Telegram.'
                  : 'Link our official bot to receive instant transaction alerts.'}
              </p>
            </div>

            <div className="p-6 md:p-8">
              {isConnected ? (
                <div className="space-y-5">
                  {/* Chat ID */}
                  <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Registered Telegram ID</p>
                      <p className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest">
                        {String(merchantData.telegram_chat_id).replace(/(?<=.{3}).(?=.{3})/g, '•')}
                      </p>
                    </div>
                    <ShieldCheck className="text-emerald-500 shrink-0" size={28} strokeWidth={1.5} />
                  </div>

                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                    Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center leading-relaxed">
                    Generate a unique encrypted pairing link. Open it in Telegram to automatically pair your account with our notification bot.
                  </p>

                  {!merchantData?.telegram_link_code ? (
                    <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                      {generating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><RefreshCw size={16} strokeWidth={2.5} /> Generate Secure Link</>}
                    </button>
                  ) : (
                    <div className="space-y-5 animate-in fade-in zoom-in-95">
                      {/* Link Box - redesigned premium */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm" />
                        <div className="relative bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl p-5">
                          <div className="flex items-start gap-3">
                            <Link2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Your Pairing Link</p>
                              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all leading-relaxed select-all">{telegramLink}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-slate-300 transition-all disabled:opacity-50">
                          {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={2.5} />} Regenerate
                        </button>
                        <button onClick={() => copyToClipboard(telegramLink)} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-blue-400 transition-all">
                          <Copy size={13} strokeWidth={2.5} /> Copy Link
                        </button>
                        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                          <ExternalLink size={13} strokeWidth={2.5} /> Open in Telegram
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Bot Info Card ── */}
          {!isConnected && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Click "Generate Secure Link" to create your unique pairing code.' },
                  { step: '2', text: 'Click "Open in Telegram" or copy and open the link manually.' },
                  { step: '3', text: 'Send /start in the bot chat — your account will be paired automatically.' },
                  { step: '4', text: 'Receive instant payment notifications directly in Telegram.' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">{step}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{text}</p>
                  </div>
                ))}
              </div>

              {/* Official Bot Link */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Official Bot</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">@{botUsername}</p>
                </div>
                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Send size={12} /> View Bot
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}