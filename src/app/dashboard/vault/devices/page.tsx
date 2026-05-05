'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// FIXED: Added Eye, EyeOff for masking toggle
import { Smartphone, ArrowLeft, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw, Trash2, Replace, Key, QrCode, Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { getMerchantVaultSettings, generateDeviceKey, getConnectedDevice, deleteMerchantDevice, getAppDownloadLinks } from '@/lib/vault_actions';

export default function MasterDevicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    // FIXED: State for masking toggle
    const [showKey, setShowKey] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const [merchantData, setMerchantData] = useState<any>(null);
    const [activeDevice, setActiveDevice] = useState<any>(null);
    const [downloadLinks, setDownloadLinks] = useState({ play_store: '', direct_apk: '' });

    useEffect(() => {
        fetchData();
    }, []);

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
        // Logic retained, actions.ts handles 24 digits now
        const res = await generateDeviceKey();
        if (res.success) {
            setMerchantData((prev: any) => ({ ...prev, device_connection_key: res.key }));
            toast.success("New 24-digit key generated!");
        } else {
            toast.error("Failed to generate key.");
        }
        setGenerating(false);
    };

    const handleOpenManualModal = async () => {
        setIsManualModalOpen(true);
        if (!merchantData?.device_connection_key) {
            await handleGenerateKey();
        }
    };

    const handleAutoConnect = async () => {
        if (!merchantData?.device_connection_key) {
            toast.info("Generating secure key first...");
            const res = await generateDeviceKey();
            if (res.success) window.location.href = `yourapp://connect?key=${res.key}`;
        } else {
            window.location.href = `yourapp://connect?key=${merchantData.device_connection_key}`;
        }
    };

    const copyToClipboard = () => {
        const textToCopy = merchantData?.device_connection_key;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => toast.success("Key copied securely!")).catch(() => toast.error("Failed to copy!"));
    };

    const handleDeleteDevice = async () => {
        if (!confirm("Are you sure you want to delete and disconnect this node?")) return;
        setLoading(true);
        const res = await deleteMerchantDevice();
        if (res.success) { setActiveDevice(null); toast.success("Device disconnected successfully."); }
        else toast.error(res.message);
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={36} strokeWidth={2.5} />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Vault</p>
        </div>
    );

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-center" richColors />

            {/* Header - Improved for premium mobile/desktop view */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                    {/* FIXED: Back button premium desktop, hidden mobile */}
                    <button onClick={() => router.push('/dashboard/vault')} className="hidden md:flex p-2 -ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 dark:text-slate-400 shrink-0">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                            Master Devices
                        </h1>
                        <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">Manage SMS automation node configuration.</p>
                    </div>
                </div>
                
                <button onClick={() => setIsDownloadModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-xs md:text-sm uppercase tracking-widest">
                    <Download size={16} strokeWidth={2.5} /> Download App
                </button>
            </div>

            {/* Content - improved placement and max width for premium desktop look */}
            <div className="flex justify-center py-4 md:py-8">
                <div className="w-full max-w-2xl">
                    {!activeDevice ? (
                        <div className="bg-white dark:bg-[#111827] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-12 flex flex-col items-center text-center shadow-sm">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-[#0B1120] rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mb-6 shadow-sm">
                                <Key className="text-emerald-500" size={32} strokeWidth={2.5} />
                            </div>
                            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[2px] rounded-lg mb-4">Setup Required</span>
                            <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Connect Automation App</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed max-w-md">Install the app and connect it to your merchant account to automate SMS parsing. Only one master device can be linked.</p>
                            
                            {/* Actions stack on small mobile, row on larger */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                <button onClick={handleAutoConnect} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Smartphone size={16} /> Auto Connect
                                </button>
                                <button onClick={handleOpenManualModal} className="flex-1 bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <QrCode size={16} /> Manual Pair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-slate-800 border-b-[4px] border-b-emerald-500 shadow-xl p-6 md:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] rounded-2xl flex items-center justify-center text-emerald-500 border border-slate-200 dark:border-slate-700 shadow-inner">
                                        <Cpu size={32} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">{activeDevice.device_name || 'Master Gateway'}</h3>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{activeDevice.device_model || 'Android Node'}</p>
                                    </div>
                                </div>
                                
                                <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border shrink-0 ${activeDevice.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'}`}>
                                    <div className={`w-2 h-2 rounded-full ${activeDevice.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    {activeDevice.is_active ? 'System Online' : 'Node Offline'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Battery size={14} className="text-slate-400" /> Battery Health</span>
                                        <span className="text-sm font-black text-slate-950 dark:text-white">{activeDevice.battery_level || 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${activeDevice.battery_level > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${activeDevice.battery_level || 0}%` }} />
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><RefreshCw size={14} className="text-slate-400" /> Last Server Sync</span>
                                    <span className="text-xs font-black text-slate-950 dark:text-white">{activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={handleOpenManualModal} className="flex-1 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm">
                                    <Replace size={16} /> Reconfigure
                                </button>
                                <button onClick={handleDeleteDevice} className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-sm">
                                    <Trash2 size={16} /> Disconnect
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FIXED Modals - Improved styles, removed green corners from QR */}
            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDownloadModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">Get App</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Choose platform</p>
                            </div>
                            <button onClick={() => setIsDownloadModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-3 bg-white dark:bg-[#0B1120]">
                            {downloadLinks.play_store && (
                                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 hover:border-[#00A273] dark:hover:border-[#00A273] transition-all p-4 rounded-xl flex items-center gap-4 group active:scale-[0.98] shadow-sm">
                                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 48 48" className="w-9 h-9 group-hover:scale-110 transition-transform"><path fill="#ea4335" d="M10.14 41.52L38 25.43c1.78-1.02 1.78-3.56 0-4.59L10.14 4.75C8.42 3.76 6.25 5 6.25 7.04v33.91c0 2.04 2.17 3.28 3.89 2.29z"/><path fill="#fbbc04" d="M38 25.43L28.18 31.06 6.25 40.95c.57.98 1.83 1.25 2.83.67l28.92-16.19z"/><path fill="#4285f4" d="M38 20.84L10.14 4.75C9.14 4.18 7.88 4.44 7.31 5.43l20.87 21.04L38 20.84z"/><path fill="#34a853" d="M6.25 7.04v33.91L28.18 31.06 10.14 4.75C8.42 3.76 6.25 5 6.25 7.04z"/></svg>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">GET IT ON</p>
                                        <h4 className="font-black text-base text-[#00A273] dark:text-white">Google Play</h4>
                                    </div>
                                </a>
                            )}
                            {downloadLinks.direct_apk && (
                                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer" className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all p-4 rounded-xl flex items-center gap-4 group active:scale-[0.98] shadow-sm">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
                                        <Download size={18} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">DIRECT INSTALL</p>
                                        <h4 className="font-black text-base text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Download APK</h4>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsManualModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight">Manual Pairing</h2>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Scan or Enter Key</p>
                            </div>
                            <button onClick={() => setIsManualModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>

                        <div className="p-8 bg-white dark:bg-[#0B1120] flex flex-col items-center text-center">
                            {/* FIXED: Plain simple square QR, removed green absolute corners */}
                            <div className="bg-white rounded-2xl p-6 shadow-inner border border-slate-100 mb-8 relative">
                                <QRCodeSVG value={merchantData?.device_connection_key || 'generating...'} size={180} level="H" fgColor="#0F172A" bgColor="#ffffff" />
                            </div>

                            <div className="w-full text-left space-y-3">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block ml-1">Secure Secret Key (24 Digits)</label>
                                <div className="flex items-center gap-2.5">
                                    {/* FIXED: Masking implemented with toggle */}
                                    <div className="flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl py-4 px-5 flex items-center justify-between shadow-inner group">
                                        <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                                            {showKey ? merchantData?.device_connection_key : '•••• •••• •••• •••• •••• ••••'}
                                        </span>
                                        <button onClick={() => setShowKey(!showKey)} className="text-slate-400 group-hover:text-emerald-500 transition-colors ml-3">
                                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button onClick={copyToClipboard} className="p-4 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl active:scale-90 transition-all hover:bg-slate-200 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0 shadow-sm">
                                        <Copy size={20} />
                                    </button>
                                    <button onClick={handleGenerateKey} disabled={generating} className="p-4 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl active:scale-90 transition-all hover:bg-slate-200 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0 disabled:opacity-50 shadow-sm">
                                        <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold text-center mt-2">Open app, scan QR or enter the masked key after revealing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}