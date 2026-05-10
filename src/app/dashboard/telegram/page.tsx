'use client';

import { useState, useEffect } from 'react';
import {
  Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2,
  Unlink, Copy, ExternalLink, Replace, AlertTriangle, User, AtSign, X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  generateBusinessTelegramCode, importVaultTelegramToBusiness,
  getVaultDataForImport, getBusinessSettings, getTelegramBotUsername,
  unlinkBusinessTelegram
} from '@/lib/business_actions';

export default function BusinessTelegramPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [vaultTelegramData, setVaultTelegramData] = useState<any>(null);

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

  const handleOpenImportModal = async () => {
    setImporting(true);
    const res = await getVaultDataForImport('telegram');
    if (res.success) {
      setVaultTelegramData(res.data);
      setShowImportModal(true);
    } else {
      toast.error(res.message || 'No Vault Telegram found.');
    }
    setImporting(false);
  };

  const handleConfirmImport = async () => {
    if (!businessId) return;
    setImporting(true);
    const res = await importVaultTelegramToBusiness(businessId);
    if (res.success) {
      toast.success(res.message);
      fetchBusinessData(businessId);
      setShowImportModal(false);
    } else toast.error(res.message);
    setImporting(false);
  };

  const handleUnlink = async () => {
    if (!businessId) return;
    setUnlinking(true);
    const res = await unlinkBusinessTelegram(businessId);
    if (res.success) {
      setBusinessData((prev: any) => ({
        ...prev,
        telegram_chat_id: null,
        is_telegram_enabled: false,
        telegram_display_name: null,
        telegram_username: null,
      }));
      toast.success('Telegram unlinked successfully.');
    } else toast.error(res.message || 'Failed to unlink.');
    setUnlinking(false);
    setShowUnlinkModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!')).catch(() => toast.error('Failed to copy'));
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading</p>
    </div>
  );

  if (!businessId) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Send size={32} className="text-slate-400" /></div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
      <p className="text-slate-500 mt-2 font-medium text-sm">Please select a business from the sidebar.</p>
    </div>
  );

  const isConnected = !!businessData?.telegram_chat_id;
  const telegramLink = `https://t.me/${botUsername}?start=${businessData?.telegram_link_code || ''}`;

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Telegram Alerts</h1>
        <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">Notification Bot — {businessData?.business_name || 'This Workspace'}</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-4">

          {/* ── Main Card ── */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className={`px-8 py-8 flex flex-col items-center text-center ${isConnected ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-sky-600 to-indigo-700'}`}>
              <div className="w-[72px] h-[72px] bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/20 shadow-lg text-white">
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
                <div className="space-y-4">
                  {businessData?.telegram_display_name && (
                    <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                      <User size={18} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Full Name</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{businessData.telegram_display_name}</p>
                      </div>
                    </div>
                  )}
                  {businessData?.telegram_username && (
                    <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                      <AtSign size={18} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Username</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">@{businessData.telegram_username}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Chat ID</p>
                        <p className="font-mono text-sm font-black text-slate-900 dark:text-white">{String(businessData.telegram_chat_id)}</p>
                      </div>
                    </div>
                    <button onClick={() => copyToClipboard(businessData.telegram_chat_id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                      <Copy size={15} />
                    </button>
                  </div>
                  <button onClick={() => setShowUnlinkModal(true)} className="w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all">
                    <Unlink size={14} /> Unlink Telegram
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!businessData?.telegram_link_code ? (
                    <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-sky-400 transition-all disabled:opacity-60">
                        {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Regenerate
                      </button>
                      <button onClick={() => copyToClipboard(telegramLink)} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-sky-400 transition-all">
                        <Copy size={13} /> Copy Link
                      </button>
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                        <ExternalLink size={13} /> Open
                      </a>
                    </div>
                  )}

                  {/* Import from Vault */}
                  <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-60">
                    {importing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />} Import from Vault
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
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

      {/* ── Import From Vault Modal ── */}
      {showImportModal && vaultTelegramData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Import from Vault</h3>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-lg">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This will link the following Vault Telegram account to this workspace:</p>
              {/* Vault Account Card */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4 space-y-3">
                {vaultTelegramData.display_name && (
                  <div className="flex items-center gap-3">
                    <User size={15} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{vaultTelegramData.display_name}</p>
                    </div>
                  </div>
                )}
                {vaultTelegramData.username && (
                  <div className="flex items-center gap-3">
                    <AtSign size={15} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">@{vaultTelegramData.username}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chat ID</p>
                    <p className="text-sm font-mono font-black text-slate-900 dark:text-white">{vaultTelegramData.chat_id}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button onClick={handleConfirmImport} disabled={importing} className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                  {importing ? <Loader2 size={13} className="animate-spin" /> : <Replace size={13} />} Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Alerts for this workspace will stop. You can reconnect anytime.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUnlinkModal(false)} disabled={unlinking} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
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