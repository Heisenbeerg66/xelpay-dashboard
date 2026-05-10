'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw,
  Trash2, Key, Eye, EyeOff, CheckCircle2, DownloadCloud, Wifi, Clock, Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  getBusinessSettings, generateBusinessDeviceKey, getBusinessConnectedDevice,
  deleteBusinessDevice, importVaultDeviceToBusiness, getVaultDataForImport
} from '@/lib/business_actions';
import { getAppDownloadLinks } from '@/lib/vault_actions';

function maskKey(key: string): string {
  if (!key || key.length <= 8) return key;
  const show = 4;
  return key.slice(0, show) + '•'.repeat(Math.max(key.length - show * 2, 4)) + key.slice(-show);
}

export default function BusinessDevicesPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [activeDevice, setActiveDevice] = useState<any>(null);
  const [downloadLinks, setDownloadLinks] = useState({ play_store: '', direct_apk: '' });
  const [vaultData, setVaultData] = useState<any>(null);

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
    const [bizRes, deviceRes, linksRes] = await Promise.all([
      getBusinessSettings(id),
      getBusinessConnectedDevice(id),
      getAppDownloadLinks()
    ]);
    if (bizRes.success) setBusinessData(bizRes.data);
    if (deviceRes.success && deviceRes.data) setActiveDevice(deviceRes.data);
    if (linksRes.success) setDownloadLinks(linksRes.links);
    setLoading(false);
  };

  const handleGenerateKey = async () => {
    if (!businessId) return;
    setGenerating(true);
    const res = await generateBusinessDeviceKey(businessId);
    if (res.success) {
      setBusinessData((prev: any) => ({ ...prev, device_connection_key: res.key }));
      toast.success('New key generated!');
    } else toast.error('Failed to generate key.');
    setGenerating(false);
  };

  const handleOpenManualModal = async () => {
    setIsManualModalOpen(true);
    if (!businessData?.device_connection_key) await handleGenerateKey();
  };

  const copyToClipboard = () => {
    const key = businessData?.device_connection_key;
    if (!key) return;
    navigator.clipboard.writeText(key).then(() => toast.success('Key copied!')).catch(() => toast.error('Failed to copy'));
  };

  const handleDeleteDevice = async () => {
    if (!businessId || !confirm('Are you sure you want to disconnect this device?')) return;
    setLoading(true);
    const res = await deleteBusinessDevice(businessId);
    if (res.success) { 
      setActiveDevice(null); 
      setBusinessData((prev: any) => ({ ...prev, device_connection_key: null }));
      toast.success('Device disconnected.'); 
    }
    else toast.error(res.message);
    setLoading(false);
  };

  const handleOpenImportModal = async () => {
    setImporting(true);
    const res = await getVaultDataForImport('device');
    if (res.success) { setVaultData(res.data); setIsImportModalOpen(true); }
    else toast.error(res.message);
    setImporting(false);
  };

  const handleConfirmImport = async () => {
    if (!businessId) return;
    setImporting(true);
    const res = await importVaultDeviceToBusiness(businessId);
    if (res.success) { toast.success(res.message); fetchBusinessData(businessId); setIsImportModalOpen(false); }
    else toast.error(res.message);
    setImporting(false);
  };

  const deviceKey = businessData?.device_connection_key || '';
  const displayedKey = showKey ? deviceKey : maskKey(deviceKey);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading</p>
    </div>
  );

  if (!businessId) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><Smartphone size={32} className="text-slate-400" /></div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Workspace Selected</h2>
      <p className="text-slate-500 mt-2 font-medium text-sm">Please select a business from the sidebar.</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      <div className="flex justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Devices</h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-wider">Workspace Nodes</p>
        </div>
        <button onClick={() => setIsDownloadModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 md:py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-widest shrink-0">
          <Download size={16} strokeWidth={2.5} /> 
          <span className="sm:hidden">App</span>
          <span className="hidden sm:inline">Download App</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-sm">
          
          {/* Premium Top Status Banner */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${activeDevice ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                {activeDevice ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Smartphone size={28} strokeWidth={2.5} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeDevice ? 'Device Online' : 'Connect Device'}
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  {activeDevice ? 'Workspace SMS automation is active.' : 'Link device for workspace automation.'}
                </p>
              </div>
            </div>
            
            {activeDevice && (
              <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-full shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">Active Connection</span>
              </div>
            )}
          </div>

          {!activeDevice ? (
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">How to Connect</h4>
                  <ol className="text-xs md:text-sm text-slate-600 dark:text-slate-300 space-y-3 list-decimal list-inside font-medium">
                    <li>Install the Android app on your dedicated device.</li>
                    <li>Ensure background running & ignore battery optimization.</li>
                    <li>Click <b>Connect with Secret Key</b> or <b>Import</b>.</li>
                  </ol>
                </div>
                
                <div className="space-y-3">
                  <button onClick={handleOpenManualModal} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all">
                    <Key size={16} /> Connect with Secret Key
                  </button>
                  <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all">
                    <DownloadCloud size={16} strokeWidth={2.5} /> Import from Vault
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Device Name', value: activeDevice.device_name || 'Unknown', icon: Smartphone },
                  { label: 'Model', value: activeDevice.device_model || 'N/A', icon: Cpu },
                  { label: 'Battery', value: `${activeDevice.battery_level ?? '?'}%`, icon: Battery },
                  { label: 'Last Sync', value: activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleTimeString() : 'N/A', icon: Clock },
                  { label: 'Status', value: activeDevice.is_active ? 'Online' : 'Offline', icon: Wifi },
                  { label: 'App Version', value: activeDevice.app_version || 'v1.0.0', icon: Info },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 shadow-sm rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                      <item.icon size={20} className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleDeleteDevice} className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/50">
                <Trash2 size={16} strokeWidth={2.5} /> Disconnect Device
              </button>
            </div>
          )}
        </div>
      </div>

      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600"><Key size={18} /></div>
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Secret Key</span>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-xl">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-8">
              {deviceKey && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                      <QRCodeSVG value={`xelpay://connect?key=${deviceKey}`} size={160} level="H" includeMargin={false} />
                    </div>
                  </div>

                  <div className="flex items-stretch bg-slate-50 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="px-3 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shrink-0">
                      <Key size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 py-4 px-3 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-mono text-sm tracking-wider font-bold text-slate-800 dark:text-slate-200">
                      {displayedKey}
                    </div>
                    <button onClick={() => setShowKey(!showKey)} className="px-3 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors shrink-0">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={copyToClipboard} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 flex items-center justify-center">
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Never share this key</p>
                </>
              )}
              <button onClick={handleGenerateKey} disabled={generating}
                className="w-full py-4 mt-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? 'Generating...' : 'Regenerate Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><DownloadCloud size={18} /></div>
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Device</span>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-xl">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">This will copy the master device connection from your Vault to this workspace.</p>
              {vaultData && (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm">
                    <Smartphone size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{vaultData.device_name || 'Unknown'}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{vaultData.device_model || 'N/A'}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsImportModalOpen(false)} disabled={importing} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
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

      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600"><Download size={18} /></div>
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Download App</span>
              </div>
              <button onClick={() => setIsDownloadModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors rounded-xl">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              {downloadLinks.play_store && (
                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md rounded-xl">
                  Google Play Store
                </a>
              )}
              {downloadLinks.direct_apk && (
                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md rounded-xl">
                  <DownloadCloud size={16} /> Direct APK Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}