'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw,
  Trash2, Key, CheckCircle2, Eye, EyeOff, ArrowLeft, Wifi,
  Shield, Info, AlertCircle, Zap, CloudDownload
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

// Official Google Play Store SVG icon
function PlayStoreIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M48,59.49v393A48.16,48.16,0,0,0,96,512c11,0,22-3.83,31-11.5l232-196.45V208L127,11.5C118,3.83,107,.17,96,.17A48.16,48.16,0,0,0,48,59.49Z" fill="#2196F3"/>
      <path d="M359,232.11l-79.53-67.25L127,11.5C118,3.83,107,.17,96,.17A48.16,48.16,0,0,0,48,59.49v2.31L232,256Z" fill="#4CAF50"/>
      <path d="M48,450.2v2.31A48.16,48.16,0,0,0,96,500.5c11,0,22-3.83,31-11.5l152-128.62-79.53-67.25Z" fill="#F44336"/>
      <path d="M464,232.11,359,232.11,232,256l127,107.83,105-88.72A48,48,0,0,0,464,232.11Z" fill="#FFC107"/>
    </svg>
  );
}

export default function BusinessDevicesPage() {
  const router = useRouter();
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
      toast.success('New 24-character key generated!');
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
    if (res.success) { setActiveDevice(null); toast.success('Device disconnected.'); }
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
    if (res.success) {
      toast.success(res.message);
      fetchBusinessData(businessId);
      setIsImportModalOpen(false);
    } else toast.error(res.message);
    setImporting(false);
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emerald-500';
    if (level > 20) return 'text-amber-500';
    return 'text-red-500';
  };

  const deviceKey = businessData?.device_connection_key || '';
  const displayedKey = showKey ? deviceKey : maskKey(deviceKey);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500 mb-3" size={36} strokeWidth={2.5} />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading</p>
    </div>
  );

  if (!businessId) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <Smartphone size={36} className="text-slate-400 mb-3" />
      <h2 className="text-lg font-black text-slate-900 dark:text-white">No Workspace Selected</h2>
      <p className="text-sm text-slate-500 mt-1">Please select a business from the sidebar.</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Devices</h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">SMS Automation — {businessData?.business_name || 'Business'}</p>
        </div>
        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-widest"
        >
          <Download size={16} strokeWidth={2.5} /> Download App
        </button>
      </div>

      {/* Content */}
      {!activeDevice ? (
        /* No Device Connected — two cards side by side on desktop */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* No Device Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 text-white text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg">
                <Smartphone size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">No Device Connected</h2>
              <p className="text-indigo-100 text-sm mt-2 max-w-sm font-medium">Link your Android device to automate SMS-based payment verification for this workspace.</p>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-end">
              <button
                onClick={handleOpenManualModal}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Key size={16} /> Connect with Secret Key
              </button>
              <button
                onClick={handleOpenImportModal}
                disabled={importing}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
              >
                {importing ? <Loader2 size={15} className="animate-spin" /> : <CloudDownload size={16} />}
                Import from Vault
              </button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-8 py-10 text-white text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-lg">
                <Info size={38} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">How to Connect</h2>
              <p className="text-slate-300 text-sm mt-2 font-medium">Follow these steps to pair your Android device</p>
            </div>
            <div className="p-6 flex-1">
              <div className="space-y-4">
                {[
                  { icon: Download, title: 'Download the App', desc: 'Install XelPay SMS Agent from Play Store or via direct APK.' },
                  { icon: Key, title: 'Generate Secret Key', desc: 'Click "Connect with Secret Key" to generate your 24-character key.' },
                  { icon: Smartphone, title: 'Paste Key in App', desc: 'Open the app, go to Settings and paste your key to pair.' },
                  { icon: CloudDownload, title: 'Or Import from Vault', desc: 'If you already have a device in your Master Vault, import it instantly.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 shrink-0">
                      <Icon size={15} className="text-indigo-600 dark:text-indigo-400" />
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
      ) : (
        /* Device Connected — Premium UI */
        <div className="space-y-5">
          {/* Status Banner */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl overflow-hidden shadow-xl p-6 md:p-8 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-20 -translate-x-10" />
            </div>
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                  <CheckCircle2 size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Status</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Device Active</h2>
                  <p className="text-indigo-100 text-sm font-medium mt-0.5">SMS automation is live for this workspace</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/30 ${activeDevice.is_active ? 'text-white' : 'text-red-200'}`}>
                <div className={`w-2 h-2 rounded-full ${activeDevice.is_active ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
                {activeDevice.is_active ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          {/* Device Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={16} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Device Information</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Device Name', value: activeDevice.device_name || 'Unknown' },
                  { label: 'Model', value: activeDevice.device_model || 'N/A' },
                  { label: 'Android Version', value: activeDevice.android_version ? `Android ${activeDevice.android_version}` : 'N/A' },
                  { label: 'App Version', value: activeDevice.app_version ? `v${activeDevice.app_version}` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Live Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Battery</span>
                  <div className="flex items-center gap-1.5">
                    <Battery size={14} className={getBatteryColor(activeDevice.battery_level ?? 0)} />
                    <span className={`text-sm font-black ${getBatteryColor(activeDevice.battery_level ?? 0)}`}>
                      {activeDevice.battery_level != null ? `${activeDevice.battery_level}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Connection</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi size={14} className="text-indigo-500" />
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Last Sync</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SMS Automation</span>
                  <span className={`text-sm font-black ${activeDevice.is_active ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>
                    {activeDevice.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Key */}
          {businessData?.device_connection_key && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Connection Key</h3>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 tracking-wider break-all">
                  {displayedKey}
                </code>
                <button onClick={() => setShowKey(v => !v)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={copyToClipboard} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => businessId && fetchBusinessData(businessId)}
              className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={14} /> Refresh Status
            </button>
            <button
              onClick={handleDeleteDevice}
              className="flex-1 py-3.5 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={14} /> Disconnect Device
            </button>
          </div>
        </div>
      )}

      {/* Manual Connect Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Connect Device</h3>
                  <p className="text-indigo-200 text-xs mt-1">Use your secret key to pair</p>
                </div>
                <button onClick={() => setIsManualModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {deviceKey && (
                <div className="text-center mb-2">
                  <QRCodeSVG value={deviceKey} size={160} level="M" className="mx-auto rounded-2xl" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Scan with XelPay App</p>
                </div>
              )}
              <div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Secret Key</p>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                  <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all">{displayedKey}</code>
                  <button onClick={() => setShowKey(v => !v)} className="p-1 text-slate-400 hover:text-slate-600">
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={copyToClipboard} className="p-1 text-slate-400 hover:text-indigo-600">
                    <Copy size={15} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Regenerate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-sky-600 to-blue-700 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Import from Vault</h3>
                  <p className="text-sky-200 text-xs mt-1">Copy your master device settings</p>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {vaultData && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Vault Device</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">{vaultData.device_name || 'Unknown Device'}</p>
                  <p className="text-sm text-slate-500">{vaultData.device_model || ''}</p>
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400">This will import your Master Vault device configuration to this business workspace.</p>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md"
              >
                {importing ? <Loader2 size={14} className="animate-spin" /> : <CloudDownload size={14} />} Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Download App</h3>
                  <p className="text-slate-400 text-xs mt-1">XelPay SMS Agent for Android</p>
                </div>
                <button onClick={() => setIsDownloadModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {downloadLinks.play_store && (
                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-5 py-4 bg-black hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-lg">
                  <PlayStoreIcon size={24} />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Get it on</p>
                    <p className="text-base font-black leading-none">Google Play</p>
                  </div>
                </a>
              )}
              {downloadLinks.direct_apk && (
                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg">
                  <Download size={20} />
                  <div className="text-left">
                    <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Direct Download</p>
                    <p className="text-base font-black leading-none">Download APK</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}