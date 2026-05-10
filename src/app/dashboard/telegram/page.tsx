'use client';

import { useState, useEffect } from 'react';
import {
  Send, Bot, RefreshCw, CheckCircle2, ShieldCheck, Loader2,
  Unlink, Copy, ExternalLink, Replace, AlertTriangle, User, AtSign, X, DownloadCloud
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
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Telegram Alerts</h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-wider">Workspace Channel</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm max-w-2xl">
        <div className={`p-8 text-center relative overflow-hidden ${isConnected ? 'bg-gradient-to-br from-sky-600 to-indigo-700' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
          <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-5 shadow-lg mx-auto ${isConnected ? 'bg-white/10 text-white border border-white/20' : 'bg-white dark:bg-slate-800 text-sky-500 border border-slate-200 dark:border-slate-700'}`}>
            {isConnected ? <CheckCircle2 size={38} strokeWidth={2} /> : <Bot size={38} strokeWidth={1.5} />}
          </div>
          <h2 className={`text-xl font-black uppercase tracking-tight ${isConnected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {isConnected ? 'Bot Connected' : 'Setup Pending'}
          </h2>
          <p className={`text-sm font-medium mt-2 max-w-sm mx-auto ${isConnected ? 'text-sky-100' : 'text-slate-500'}`}>
            {isConnected ? `Alerts for ${businessData.business_name} are active.` : 'Link the bot to receive instant payment alerts for this workspace.'}
          </p>
        </div>

        <div className="p-6 md:p-8 text-center">
          {isConnected ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-full flex items-center justify-center mb-3">
                  <User size={30} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{businessData?.telegram_display_name || 'Connected User'}</h3>
                {businessData?.telegram_username && (
                  <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-1">
                    <AtSign size={14} /> {businessData.telegram_username}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  <ShieldCheck size={14} /> Active Connection
                </div>
              </div>

              <button onClick={() => setShowUnlinkModal(true)} className="w-full py-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <Unlink size={16} strokeWidth={2.5} /> Unlink Telegram
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!businessData?.telegram_link_code ? (
                <div className="space-y-3">
                  <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                  </button>
                  <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    <DownloadCloud size={16} strokeWidth={2.5} /> Import from Vault
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleGenerateCode} disabled={generating} className="py-3.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-sky-400 transition-all disabled:opacity-60">
                      <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? '...' : 'Regenerate'}
                    </button>
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                      <ExternalLink size={14} strokeWidth={2.5} /> Open Bot
                    </a>
                  </div>
                  
                  {/* Link Box */}
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-700 w-full text-left">
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
                        className="p-2 sm:p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-lg transition-colors shrink-0"
                      >
                        <Copy size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center gap-2 transition-all">
                      <DownloadCloud size={14} strokeWidth={2.5} /> Or Import from Vault
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><DownloadCloud size={16} className="text-emerald-600" /></div>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Import Telegram</span>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-lg">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This will link the following Vault Telegram account to this workspace:</p>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">{vaultTelegramData?.display_name || 'Connected User'}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">{vaultTelegramData?.username || 'Private Account'}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowImportModal(false)} disabled={importing} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleConfirmImport} disabled={importing} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all">
                  {importing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUnlinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Unlink Telegram?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Alerts for this workspace will stop. You can reconnect anytime.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUnlinkModal(false)} disabled={unlinking} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button onClick={handleUnlink} disabled={unlinking} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60">
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