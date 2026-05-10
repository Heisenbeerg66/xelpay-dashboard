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
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Master Devices</h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">SMS Automation Node</p>
          </div>
        </div>
        <button onClick={() => setIsDownloadModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-widest">
          <Download size={16} strokeWidth={2.5} /> Download App
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {!activeDevice ? (
            /* ── No Device: single card with embedded instructions ── */
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              {/* Top gradient area */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 text-white text-center">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/20 shadow-lg">
                  <Smartphone size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">No Device Connected</h2>
                <p className="text-indigo-100 text-sm mt-2 max-w-sm mx-auto font-medium">Link your Android device to automate SMS-based payment verification for this workspace.</p>
              </div>

              {/* How to connect — inline steps */}
              <div className="px-8 pt-6 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">How to Connect</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { n: '1', t: 'Download the XelPay Android app using the button above.' },
                    { n: '2', t: 'Open the app and tap "Connect with Secret Key".' },
                    { n: '3', t: 'Paste your secret key or scan the QR code shown in the modal.' },
                    { n: '4', t: 'Once connected, SMS verification runs automatically.' },
                  ].map(({ n, t }) => (
                    <div key={n} className="flex items-start gap-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                      <span className="w-6 h-6 bg-indigo-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center shrink-0">{n}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 space-y-3">
                <button onClick={handleOpenManualModal} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Key size={16} /> Connect with Secret Key
                </button>
              </div>
            </div>
          ) : (
            /* ── Connected Device Card ── */
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#111827] border border-indigo-200 dark:border-indigo-800/40 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-8 text-white text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <CheckCircle2 size={36} strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Device Connected</h2>
                  <p className="text-indigo-100 text-sm mt-1.5">SMS automation is active for this workspace.</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Device Name', value: activeDevice.device_name || 'Unknown', icon: Smartphone },
                      { label: 'Model', value: activeDevice.device_model || 'N/A', icon: Cpu },
                      { label: 'Battery', value: `${activeDevice.battery_level ?? '?'}%`, icon: Battery },
                      { label: 'Last Sync', value: activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleTimeString() : 'N/A', icon: Clock },
                      { label: 'Status', value: activeDevice.is_active ? 'Online' : 'Offline', icon: Wifi },
                      { label: 'App Version', value: activeDevice.app_version || 'N/A', icon: Info },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><Icon size={10} /> {label}</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleDeleteDevice} className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all">
                    <Trash2 size={14} /> Disconnect Device
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Connect with Secret Key Modal (square/sharp design) ── */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsManualModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-[#0B1120] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200" style={{ borderRadius: '0px' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]">
              <div className="flex items-center gap-2.5">
                <Key size={16} className="text-indigo-500" strokeWidth={2.5} />
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Secret Key</span>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" style={{ borderRadius: '0' }}>
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* QR Code */}
              {deviceKey && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 border-2 border-slate-200 dark:border-slate-600" style={{ borderRadius: '0px' }}>
                    <QRCodeSVG value={deviceKey} size={160} level="M" />
                  </div>
                </div>
              )}

              {/* Key Display */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Secret Key</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center" style={{ borderRadius: '0' }}>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-widest break-all">{displayedKey}</span>
                  </div>
                  <button onClick={() => setShowKey(v => !v)} className="px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors shrink-0" style={{ borderRadius: '0' }}>
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => copyToClipboard(deviceKey)} className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0" style={{ borderRadius: '0' }}>
                    <Copy size={15} />
                  </button>
                </div>
              </div>

              {/* Regenerate */}
              <button onClick={handleGenerateKey} disabled={generating} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50" style={{ borderRadius: '0' }}>
                {generating ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><RefreshCw size={13} /> Regenerate Key</>}
              </button>

              <p className="text-[11px] text-slate-400 text-center font-medium">Open the XelPay app on your Android device, go to Connect → Secret Key, and paste the key above.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Download Apps Modal (square design) ── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsDownloadModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-[#0B1120] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200" style={{ borderRadius: '0px' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]">
              <div className="flex items-center gap-2.5">
                <Download size={16} className="text-emerald-500" strokeWidth={2.5} />
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Download App</span>
              </div>
              <button onClick={() => setIsDownloadModalOpen(false)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" style={{ borderRadius: '0' }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {downloadLinks.play_store && (
                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                  style={{ borderRadius: '0' }}>
                  <ExternalLink size={15} /> Google Play Store
                </a>
              )}
              {downloadLinks.direct_apk && (
                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                  style={{ borderRadius: '0' }}>
                  <DownloadCloud size={15} /> Direct APK Download
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