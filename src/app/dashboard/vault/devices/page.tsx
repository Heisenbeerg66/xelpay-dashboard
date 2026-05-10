'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone, ArrowLeft, Download, Battery, Cpu, Copy, Loader2, X,
  RefreshCw, Trash2, Replace, Key, Eye, EyeOff, CheckCircle2,
  DownloadCloud, ExternalLink, Wifi, Clock, Info
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

const PlayStoreIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.86 2.15L14.74 12L3.86 21.85C3.34 21.61 3 21.09 3 20.5Z" fill="#00E676"/>
    <path d="M14.74 12L17.5 9.42L20.4 11.05C21.2 11.5 21.2 12.5 20.4 12.95L17.5 14.58L14.74 12Z" fill="#FFC107"/>
    <path d="M3.86 2.15C4.05 2.06 4.27 2 4.5 2C4.83 2 5.14 2.1 5.4 2.25L17.5 9.42L14.74 12L3.86 2.15Z" fill="#FF3D00"/>
    <path d="M3.86 21.85L14.74 12L17.5 14.58L5.4 21.75C5.14 21.9 4.83 22 4.5 22C4.27 22 4.05 21.94 3.86 21.85Z" fill="#F50057"/>
  </svg>
);

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
      toast.success('New 24-character key generated!');
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
    if (res.success) { setActiveDevice(null); toast.success('Device disconnected.'); }
    else toast.error(res.message);
    setLoading(false);
  };

  const deviceKey = merchantData?.device_connection_key || '';
  const displayedKey = showKey ? deviceKey : maskKey(deviceKey);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Vault</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="flex justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Devices</h1>
            <p className="text-slate-500 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-wider">SMS Automation Node</p>
          </div>
        </div>
        <button onClick={() => setIsDownloadModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-[10px] md:text-xs uppercase tracking-widest shrink-0">
          <Download size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">Download App</span>
        </button>
      </div>

      {!activeDevice ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex-1">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone size={28} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3">Connect Master Node</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Install the Xelpay Android App on your dedicated device and link it to your Vault. This device will act as the master SMS gateway for all connected businesses.
              </p>
            </div>
            <div className="p-4 md:p-8 space-y-2.5 md:space-y-3">
              {[
                'Install the Android app on your dedicated device.',
                'Log in using your account credentials or secret key.',
                'Ensure the app is running in the background and battery optimization is disabled.',
                'Your device will appear here once successfully synced.'
              ].map((t, n) => (
                <div key={n} className="flex items-start gap-2.5 md:gap-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 md:p-3">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-emerald-600 text-white text-[10px] md:text-xs font-black rounded-lg flex items-center justify-center shrink-0">{n + 1}</span>
                  <p className="text-[11px] md:text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-0.5">{t}</p>
                </div>
              ))}
            </div>
            <div className="p-4 md:p-8 pt-0">
              <button onClick={handleOpenManualModal} className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] md:text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <Key size={16} /> Connect with Secret Key
              </button>
            </div>
          </div>

          {/* QR Component */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl flex flex-col items-center justify-center p-6 md:p-10 relative group">
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl mb-6 ring-4 ring-white/10 group-hover:ring-emerald-500/30 transition-all duration-500">
                {deviceKey ? (
                  <QRCodeSVG value={`xelpay://connect?key=${deviceKey}`} size={180} level="H" includeMargin={false} fgColor="#0f172a" />
                ) : (
                  <div className="w-[180px] h-[180px] bg-slate-100 rounded-xl flex items-center justify-center">
                    <Loader2 size={30} className="animate-spin text-slate-400" />
                  </div>
                )}
              </div>
              <h3 className="text-white font-black text-lg md:text-xl tracking-tight mb-2 text-center">Scan to Connect</h3>
              <p className="text-slate-400 text-xs md:text-sm font-medium text-center max-w-[250px] mb-8">
                Open the Xelpay App and scan this QR code to instantly pair your device.
              </p>
              <button onClick={handleGenerateKey} disabled={generating} className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 md:py-3 rounded-full">
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? 'Regenerating...' : 'Regenerate QR'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm max-w-3xl">
          <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
              <CheckCircle2 size={36} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Master Device Online</h2>
            <p className="text-emerald-100 text-sm mt-1.5 font-medium">Global SMS automation is active for the Vault.</p>
          </div>
          <div className="p-6 md:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                { label: 'Device Name', value: activeDevice.device_name || 'Unknown', icon: Smartphone },
                { label: 'Model', value: activeDevice.device_model || 'N/A', icon: Cpu },
                { label: 'Battery', value: `${activeDevice.battery_level ?? '?'}%`, icon: Battery },
                { label: 'Last Sync', value: activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleTimeString() : 'N/A', icon: Clock },
                { label: 'Status', value: activeDevice.is_active ? 'Online' : 'Offline', icon: Wifi },
                { label: 'App Version', value: activeDevice.app_version || 'v1.0.0', icon: Info },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={handleDeleteDevice} className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
                <Trash2 size={16} /> Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Key Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Key size={16} className="text-indigo-600" /></div>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Secret Key</span>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-lg">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6">
              {deviceKey && (
                <>
                  <div className="flex justify-center mb-5">
                    <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100">
                      <QRCodeSVG value={`xelpay://connect?key=${deviceKey}`} size={120} level="H" includeMargin={false} />
                    </div>
                  </div>
                  <div className="flex items-stretch bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="px-3 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                      <Key size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 py-3 px-3 overflow-x-auto text-center font-mono text-sm tracking-wider font-bold text-slate-800 dark:text-slate-200">
                      {displayedKey}
                    </div>
                    <button onClick={() => setShowKey(!showKey)} className="px-3 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors shrink-0">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => copyToClipboard(deviceKey)} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 flex items-center justify-center">
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Never share this key with anyone</p>
                </>
              )}
              <button onClick={handleGenerateKey} disabled={generating}
                className="w-full py-3.5 mt-5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> {generating ? 'Generating...' : 'Regenerate Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download App Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><Download size={16} className="text-emerald-600" /></div>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Download App</span>
              </div>
              <button onClick={() => setIsDownloadModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-lg">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {downloadLinks.play_store && (
                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md rounded-xl">
                  <PlayStoreIcon /> Google Play Store
                </a>
              )}
              {downloadLinks.direct_apk && (
                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md rounded-xl">
                  <DownloadCloud size={16} /> Direct APK Download
                </a>
              )}
              {!downloadLinks.play_store && !downloadLinks.direct_apk && (
                <p className="text-center text-sm text-slate-400 py-4 font-medium">No download links configured. Please contact support.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}