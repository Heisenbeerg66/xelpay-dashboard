'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone, ArrowLeft, Download, Battery, Cpu, Copy, Loader2, X,
  RefreshCw, Trash2, Key, Eye, EyeOff, CheckCircle2, DownloadCloud, Wifi, Clock, Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  getMerchantVaultSettings, generateDeviceKey, getConnectedDevice,
  deleteMerchantDevice, getAppDownloadLinks
} from '@/lib/vault_actions';

function maskKey(key: string): string {
  if (!key || key.length <= 8) return key;
  const show = 4;
  return key.slice(0, show) + '•'.repeat(Math.max(key.length - show * 2, 4)) + key.slice(-show);
}

export default function MasterDevicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const [merchantData, setMerchantData] = useState<any>(null);
  const [activeDevice, setActiveDevice] = useState<any>(null);
  const [downloadLinks, setDownloadLinks] = useState({ play_store: '', direct_apk: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [merchantRes, deviceRes, linksRes] = await Promise.all([
      getMerchantVaultSettings(),
      getConnectedDevice(),
      getAppDownloadLinks()
    ]);
    if (merchantRes.success) setMerchantData(merchantRes.data);
    if (deviceRes.success && deviceRes.data) setActiveDevice(deviceRes.data);
    if (linksRes.success) setDownloadLinks(linksRes.links);
    setLoading(false);
  };

  const handleGenerateKey = async () => {
    setGenerating(true);
    const res = await generateDeviceKey();
    if (res.success) {
      setMerchantData((prev: any) => ({ ...prev, device_connection_key: res.key }));
      toast.success('New key generated!');
    } else {
      toast.error('Failed to generate key.');
    }
    setGenerating(false);
  };

  const handleOpenManualModal = async () => {
    setIsManualModalOpen(true);
    if (!merchantData?.device_connection_key) await handleGenerateKey();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Key copied!')).catch(() => toast.error('Failed to copy'));
  };

  const handleDeleteDevice = async () => {
    if (!confirm('Are you sure you want to delete and disconnect this node?')) return;
    setLoading(true);
    const res = await deleteMerchantDevice();
    if (res.success) { 
      setActiveDevice(null); 
      setMerchantData((prev: any) => ({ ...prev, device_connection_key: null }));
      toast.success('Device disconnected.'); 
    }
    else toast.error(res.message);
    setLoading(false);
  };

  const deviceKey = merchantData?.device_connection_key || '';
  const displayedKey = showKey ? deviceKey : maskKey(deviceKey);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Vault</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      <div className="flex justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Devices</h1>
            <p className="text-slate-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-wider">SMS Automation Node</p>
          </div>
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${activeDevice ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                {activeDevice ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Smartphone size={28} strokeWidth={2.5} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeDevice ? 'Master Device Online' : 'Connect Master Node'}
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  {activeDevice ? 'Global SMS automation is active.' : 'Link dedicated global gateway device.'}
                </p>
              </div>
            </div>
            
            {activeDevice && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Connection</span>
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
                    <li>Click <b>Connect with Secret Key</b> to login.</li>
                  </ol>
                </div>
                
                <button onClick={handleOpenManualModal} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all">
                  <Key size={16} /> Connect with Secret Key
                </button>
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
                      <item.icon size={20} className="text-emerald-600 dark:text-emerald-400" />
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
                    <button onClick={() => copyToClipboard(deviceKey)} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 flex items-center justify-center">
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

      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
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