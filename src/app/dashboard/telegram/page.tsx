'use client';

import { useState, useEffect } from 'react';
import {
  Send, Bot, RefreshCw, CheckCircle2, Loader2,
  Unlink, Copy, ExternalLink, AlertTriangle, User, X, DownloadCloud
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
      toast.success('New Link Generated!');
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
        telegram_link_code: null // Cleared on unlink
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

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Telegram Alerts</h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-wider">Workspace Channel</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-sm">
          
          {/* Premium Top Status Banner */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${isConnected ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                {isConnected ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Bot size={28} strokeWidth={2.5} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isConnected ? 'Bot Connected' : 'Setup Pending'}
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  {isConnected ? 'Alerts are actively routing.' : 'Link bot for workspace alerts.'}
                </p>
              </div>
            </div>
            
            {isConnected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-full shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">Active Connection</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {isConnected ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                  <div className="w-14 h-14 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-600">
                    <User size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white mb-0.5">{businessData?.telegram_display_name || 'Connected User'}</h3>
                    {businessData?.telegram_username && (
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {businessData.telegram_username}
                      </p>
                    )}
                  </div>
                </div>

                <button onClick={() => setShowUnlinkModal(true)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/50">
                  <Unlink size={16} strokeWidth={2.5} /> Unlink Telegram
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">How to Connect</h4>
                  <ol className="text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-3 list-decimal list-inside font-medium">
                    <li>Click <b>Generate Link</b> or Import from Vault.</li>
                    <li>Copy the Bot Link or click <b>Open Bot</b>.</li>
                    <li><span className="font-bold text-sky-600 dark:text-sky-400">For Groups:</span> Adding the bot via link will instantly connect it!</li>
                  </ol>
                </div>

                {!businessData?.telegram_link_code ? (
                  <div className="space-y-3">
                    <button onClick={handleGenerateCode} disabled={generating} className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all">
                      {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><RefreshCw size={14} /> Generate Pairing Link</>}
                    </button>
                    <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all">
                      <DownloadCloud size={16} strokeWidth={2.5} /> Import from Vault
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 w-full text-left">
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
                          className="p-2 sm:p-2.5 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-900/30 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 rounded-lg transition-colors shrink-0"
                        >
                          <Copy size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleGenerateCode} disabled={generating} className="py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                        <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? '...' : 'Regenerate'}
                      </button>
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md">
                        <ExternalLink size={14} strokeWidth={2.5} /> Open Bot
                      </a>
                    </div>

                    <div className="pt-2">
                      <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-emerald-200 dark:border-emerald-800/50">
                        <DownloadCloud size={14} strokeWidth={2.5} /> Or Import from Vault
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><DownloadCloud size={18} /></div>
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Telegram</span>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-xl">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">This will link the following Vault Telegram account to this workspace:</p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm">
                  <User size={20} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{vaultTelegramData?.display_name || 'Connected User'}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{vaultTelegramData?.username || 'Private Account'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowImportModal(false)} disabled={importing} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleConfirmImport} disabled={importing} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                  {importing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <button onClick={handleUnlink} disabled={unlinking} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm">
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