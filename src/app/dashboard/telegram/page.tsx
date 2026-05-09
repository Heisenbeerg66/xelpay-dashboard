'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2, Unlink, Copy, Link2, ExternalLink, Replace } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { generateBusinessTelegramCode, importVaultTelegramToBusiness, getVaultDataForImport, getBusinessSettings, getTelegramBotUsername } from '@/lib/business_actions';
import { supabase } from '@/lib/supabase';

export default function BusinessTelegramPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [importing, setImporting] = useState(false);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [botUsername, setBotUsername] = useState<string>('xelpay_alert_bot');

  useEffect(() => {
    const loadActiveBusiness = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) { setBusinessId(activeId); fetchBusinessData(activeId); }
      else { setLoading(false); }
    };
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const fetchBusinessData = async (id: string) => {
    setLoading(true);
    const [res, botRes] = await Promise.all([
      getBusinessSettings(id),
      getTelegramBotUsername()
    ]);
    if (res.success) setBusinessData(res.data);
    if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    if (!businessId) return;
    setGenerating(true);
    const res = await generateBusinessTelegramCode(businessId);
    if (res.success) {
      toast.success('New 12-digit Secure Link Generated!');
      setBusinessData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
    } else toast.error('Failed to generate code.');
    setGenerating(false);
  };

  const handleImportFromVault = async () => {
    if (!businessId) return;
    setImporting(true);
    const checkRes = await getVaultDataForImport('telegram');
    if (!checkRes.success) { toast.error(checkRes.message); setImporting(false); return; }
    const res = await importVaultTelegramToBusiness(businessId);
    if (res.success) { toast.success(res.message); fetchBusinessData(businessId); }
    else toast.error(res.message);
    setImporting(false);
  };

  const handleUnlink = async () => {
    if (!businessId || !confirm('Are you sure you want to unlink Telegram for this workspace?')) return;
    setUnlinking(true);
    try {
      const { error } = await supabase.from('businesses').update({ telegram_chat_id: null, is_telegram_enabled: false }).eq('id', businessId);
      if (error) throw error;
      setBusinessData((prev: any) => ({ ...prev, telegram_chat_id: null, is_telegram_enabled: false }));
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
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading</p>
    </div>
  );

  if (!businessId) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <Bot size={36} className="text-slate-400 mb-3" />
      <h2 className="text-lg font-black text-slate-900 dark:text-white">No Workspace Selected</h2>
      <p className="text-sm text-slate-500 mt-1">Please select a business from the sidebar.</p>
    </div>
  );

  const isConnected = !!businessData?.telegram_chat_id;
  const telegramLink = `https://t.me/${botUsername}?start=${businessData?.telegram_link_code || ''}`;

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Telegram</h1>
        <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Workspace Alert System</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-5">

          {/* ── Main Card ── */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Status Banner */}
            <div className={`px-8 py-8 flex flex-col items-center text-center ${isConnected ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-sky-600 to-blue-700'}`}>
              <div className="w-[72px] h-[72px] bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg text-white">
                {isConnected ? <CheckCircle2 size={38} strokeWidth={2} /> : <Bot size={38} strokeWidth={1.5} />}
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {isConnected ? 'Bot Connected' : 'Setup Pending'}
              </h2>
              <p className={`text-sm font-medium mt-2 max-w-sm ${isConnected ? 'text-emerald-100' : 'text-sky-100'}`}>
                {isConnected
                  ? 'Payment notifications are being sent to Telegram for this workspace.'
                  : 'Link the bot to receive instant alerts for this workspace.'}
              </p>
            </div>

            <div className="p-6 md:p-8">
              {isConnected ? (
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telegram Chat ID</p>
                      <p className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest">
                        {String(businessData.telegram_chat_id).replace(/(?<=.{3}).(?=.{3})/g, '•')}
                      </p>
                    </div>
                    <ShieldCheck className="text-emerald-500 shrink-0" size={28} strokeWidth={1.5} />
                  </div>

                  <button onClick={handleUnlink} disabled={unlinking} className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />} Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center leading-relaxed">
                    Generate a unique pairing link. Open it in Telegram to pair this workspace with our notification bot.
                  </p>

                  {!businessData?.telegram_link_code ? (
                    <div className="space-y-3">
                      <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                        {generating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><RefreshCw size={16} strokeWidth={2.5} /> Generate Secure Link</>}
                      </button>
                      <button onClick={handleImportFromVault} disabled={importing} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-60">
                        {importing ? <Loader2 size={15} className="animate-spin" /> : <Replace size={15} />} Import from Vault
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in zoom-in-95">
                      {/* Premium Link Box */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl blur-sm" />
                        <div className="relative bg-slate-50 dark:bg-[#0B1120] border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-2xl p-5">
                          <div className="flex items-start gap-3">
                            <Link2 size={18} className="text-sky-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1.5">Pairing Link</p>
                              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all leading-relaxed select-all">{telegramLink}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-slate-300 transition-all disabled:opacity-50">
                          {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={2.5} />} Regenerate
                        </button>
                        <button onClick={() => copyToClipboard(telegramLink)} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-sky-400 transition-all">
                          <Copy size={13} strokeWidth={2.5} /> Copy Link
                        </button>
                        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                          <ExternalLink size={13} strokeWidth={2.5} /> Open in Telegram
                        </a>
                      </div>

                      <button onClick={handleImportFromVault} disabled={importing} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-60">
                        {importing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />} Import from Vault Instead
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── How It Works (only when not connected) ── */}
          {!isConnected && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Generate a secure pairing link for this workspace.' },
                  { step: '2', text: 'Open the link in Telegram on your phone.' },
                  { step: '3', text: 'Click /start in the bot — your workspace is paired instantly.' },
                  { step: '4', text: 'All payment alerts for this workspace are sent to that Telegram chat.' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-sky-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">{step}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}