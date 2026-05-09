'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw, Trash2, Replace, Key, QrCode, DownloadCloud, CheckCircle2, Eye, EyeOff, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { getBusinessSettings, generateBusinessDeviceKey, getBusinessConnectedDevice, deleteBusinessDevice, importVaultDeviceToBusiness, getVaultDataForImport } from '@/lib/business_actions';
import { getAppDownloadLinks } from '@/lib/vault_actions';

function maskKey(key: string): string {
  if (!key || key.length <= 8) return key;
  const show = 4;
  return key.slice(0, show) + '•'.repeat(Math.max(key.length - show * 2, 4)) + key.slice(-show);
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
    if (res.success) { toast.success(res.message); fetchBusinessData(businessId); setIsImportModalOpen(false); }
    else toast.error(res.message);
    setImporting(false);
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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Devices</h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-wider">SMS Automation Node</p>
          </div>
        </div>
        <button onClick={() => setIsDownloadModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-md text-xs uppercase tracking-widest transition-all">
          <Download size={16} strokeWidth={2.5} /> Download App
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {!activeDevice ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 text-white text-center">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/20 shadow-lg">
                  <Smartphone size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">No Device Connected</h2>
                <p className="text-indigo-100 text-sm mt-2 max-w-sm mx-auto font-medium">Link your Android device to automate SMS-based payment verification for this workspace.</p>
              </div>

              <div className="p-8 space-y-3">
                <button onClick={handleOpenManualModal} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Key size={16} /> Connect with Secret Key
                </button>
                <button onClick={handleOpenImportModal} disabled={importing} className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                  {importing ? <Loader2 size={15} className="animate-spin" /> : <Replace size={15} />} Import from Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#111827] border border-indigo-200 dark:border-indigo-800/40 rounded-3xl overflow-hidden shadow-xl">
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
                      { label: 'Battery', value: `${activeDevice.battery_level ?? '--'}%`, icon: Battery },
                      { label: 'App Version', value: activeDevice.app_version || 'N/A', icon: Key },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Icon size={10} /> {label}
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleDeleteDevice} className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
                    <Trash2 size={14} /> Disconnect Device
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Manual Modal ── */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Manual Pairing</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter this key in your XelPay app</p>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {deviceKey && (
                <div className="flex justify-center p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-700">
                  <QRCodeSVG value={deviceKey} size={140} level="H" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secret Key (24-char)</p>
                <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5">
                  {/* FIXED: All buttons remain visible, no shift on mobile */}
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm font-bold text-slate-900 dark:text-white tracking-widest overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                      {generating ? '...' : displayedKey}
                    </code>
                    <button type="button" onClick={() => setShowKey(!showKey)} className="shrink-0 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors text-slate-500 hover:text-blue-600">
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button type="button" onClick={handleGenerateKey} disabled={generating} className="shrink-0 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 transition-colors text-slate-500 hover:text-indigo-600 disabled:opacity-50">
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    </button>
                    <button type="button" onClick={copyToClipboard} className="shrink-0 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors text-slate-500 hover:text-blue-600">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => setIsManualModalOpen(false)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Modal ── */}
      {isImportModalOpen && vaultData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Import from Vault</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center">
                <Cpu size={28} className="mx-auto text-indigo-500 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Master Device</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{vaultData.device_name || 'Unknown'}</p>
                <p className="text-xs text-slate-500 mt-1">{vaultData.device_model || 'N/A'}</p>
              </div>
              <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                {importing ? <><Loader2 size={15} className="animate-spin" /> Importing...</> : <><Replace size={15} /> Confirm Import</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Download Modal ── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Download XelPay App</h3>
              <button onClick={() => setIsDownloadModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {downloadLinks.play_store && (
                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md">
                  <ExternalLink size={15} /> Google Play Store
                </a>
              )}
              {downloadLinks.direct_apk && (
                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md">
                  <DownloadCloud size={15} /> Direct APK Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}