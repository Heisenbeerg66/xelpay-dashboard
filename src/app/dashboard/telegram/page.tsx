'use client';

import { useState, useEffect } from 'react';
import {
  Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2,
  ExternalLink, Unlink, Copy, Link2, Info, User, MessageCircle, Replace
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  getBusinessSettings, generateBusinessTelegramCode,
  importVaultTelegramToBusiness, getVaultDataForImport
} from '@/lib/business_actions';
import { getTelegramBotUsername } from '@/lib/vault_actions';
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
      if (activeId) { setBusinessId(activeId); fetchData(activeId); }
      else { setLoading(false); }
    };
    loadActiveBusiness();
    window.addEventListener('businessChanged', loadActiveBusiness);
    return () => window.removeEventListener('businessChanged', loadActiveBusiness);
  }, []);

  const fetchData = async (id: string) => {
    setLoading(true);
    const [bizRes, botRes] = await Promise.all([
      getBusinessSettings(id),
      getTelegramBotUsername()
    ]);
    if (bizRes.success) setBusinessData(bizRes.data);
    if (botRes.success && botRes.username) setBotUsername(botRes.username.replace('@', ''));
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    if (!businessId) return;
    setGenerating(true);
    const res = await generateBusinessTelegramCode(businessId);
    if (res.success) {
      toast.success('New pairing link generated!');
      setBusinessData((prev: any) => ({ ...prev, telegram_link_code: res.code }));
    } else {
      toast.error('Failed to generate code.');
    }
    setGenerating(false);
  };

  const handleUnlink = async () => {
    if (!businessId || !confirm('Are you sure you want to unlink Telegram?')) return;
    setUnlinking(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null })
        .eq('id', businessId);
      if (error) throw error;
      setBusinessData((prev: any) => ({ ...prev, telegram_chat_id: null, telegram_display_name: null, telegram_username: null }));
      toast.success('Telegram unlinked.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlink.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleImportFromVault = async () => {
    if (!businessId) return;
    setImporting(true);
    const res = await importVaultTelegramToBusiness(businessId);
    if (res.success) {
      toast.success(res.message);
      fetchData(businessId);
    } else {
      toast.error(res.message);
    }
    setImporting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!')).catch(() => toast.error('Failed to copy'));
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-600 mb-3" size={36} strokeWidth={2.5} />
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
  const displayName = businessData?.telegram_display_name || null;
  const username = businessData?.telegram_username || null;

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Telegram Alerts</h1>
        <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Workspace Alert System — {businessData?.business_name || ''}</p>
      </div>

      {/* Content */}
      {isConnected ? (
        /* ── Connected State ── */
        <div className="space-y-5">
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl overflow-hidden shadow-xl p-6 md:p-8 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-20" />
            </div>
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                  <CheckCircle2 size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Bot Status</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Connected</h2>
                  <p className="text-emerald-100 text-sm font-medium mt-0.5">Payment alerts are active for this workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/30 text-white">
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Live
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Telegram Identity</h3>
            </div>
            <div className="space-y-3">
              {displayName && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Display Name</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{displayName}</span>
                </div>
              )}
              {username && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Username</span>
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">@{username}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chat ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {String(businessData.telegram_chat_id).replace(/(?<=.{3}).(?=.{3})/g, '•')}
                  </span>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlink}
            disabled={unlinking}
            className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />} Unlink Telegram
          </button>
        </div>
      ) : (
        /* ── Pending State — two cards side by side on desktop ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Setup Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gradient-to-br from-sky-600 to-blue-700 px-8 py-10 text-white text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg">
                <Bot size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Setup Pending</h2>
              <p className="text-sky-100 text-sm mt-2 max-w-sm font-medium">Link the bot to receive instant alerts for this workspace.</p>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              {!businessData?.telegram_link_code ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">Generate a secure pairing link to connect this workspace.</p>
                  <button
                    onClick={handleGenerateCode}
                    disabled={generating}
                    className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Generate Pairing Link
                  </button>
                  <button
                    onClick={handleImportFromVault}
                    disabled={importing}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {importing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />} Import from Vault
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Link Preview */}
                  <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/30 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Your Pairing Link</p>
                    <p className="text-xs font-mono text-sky-800 dark:text-sky-300 break-all leading-relaxed">{telegramLink}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleGenerateCode}
                      disabled={generating}
                      className="py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={2.5} />}
                      Regenerate
                    </button>
                    <button
                      onClick={() => copyToClipboard(telegramLink)}
                      className="py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy size={13} strokeWidth={2.5} /> Copy Link
                    </button>
                  </div>

                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25"
                  >
                    <ExternalLink size={15} strokeWidth={2.5} /> Open in Telegram
                  </a>

                  <button
                    onClick={handleImportFromVault}
                    disabled={importing}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {importing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />} Import from Vault Instead
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-8 py-10 text-white text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg">
                <Info size={38} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">How It Works</h2>
              <p className="text-slate-300 text-sm mt-2 font-medium">Connect in 3 simple steps</p>
            </div>
            <div className="p-6 flex-1">
              <div className="space-y-5">
                {[
                  { icon: Link2, title: 'Generate Link', desc: 'Click "Generate Pairing Link" to create your unique encrypted connection code.' },
                  { icon: ExternalLink, title: 'Open in Telegram', desc: 'Click "Open in Telegram" or copy the link and paste it in your browser.' },
                  { icon: Bot, title: 'Start the Bot', desc: 'Tap /start in the bot. Your workspace is paired instantly.' },
                  { icon: MessageCircle, title: 'Receive Alerts', desc: 'All payment notifications for this workspace will now be sent to your Telegram.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/40 shrink-0">
                      <Icon size={15} className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">{title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}