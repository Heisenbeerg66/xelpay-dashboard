'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw, Trash2, Replace, Key, QrCode, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react'; 
import { getBusinessSettings, generateBusinessDeviceKey, getBusinessConnectedDevice, deleteBusinessDevice, importVaultDeviceToBusiness, getVaultDataForImport } from '@/lib/business_actions';
import { getAppDownloadLinks } from '@/lib/vault_actions';

export default function BusinessDevicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    
    // Modal States
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false); 
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const [businessData, setBusinessData] = useState<any>(null);
    const [activeDevice, setActiveDevice] = useState<any>(null);
    const [vaultData, setVaultData] = useState<any>(null);
    const [downloadLinks, setDownloadLinks] = useState({ play_store: '', direct_apk: '' });

    const fetchBusinessData = async (id: string) => {
        setLoading(true);
        const [settingsRes, deviceRes, linksRes] = await Promise.all([
            getBusinessSettings(id), getBusinessConnectedDevice(id), getAppDownloadLinks() 
        ]);
        if (settingsRes.success) setBusinessData(settingsRes.data);
        if (deviceRes.success && deviceRes.data) setActiveDevice(deviceRes.data);
        if (linksRes.success) setDownloadLinks(linksRes.links);
        setLoading(false);
    };

    useEffect(() => {
        const loadActiveBusiness = () => {
            const activeId = localStorage.getItem('active_business_id');
            if (activeId) { setBusinessId(activeId); fetchBusinessData(activeId); } else { setLoading(false); }
        };
        loadActiveBusiness();
        window.addEventListener('businessChanged', loadActiveBusiness);
        return () => window.removeEventListener('businessChanged', loadActiveBusiness);
    }, []);

    const handleGenerateKey = async () => {
        if (!businessId) return;
        setGenerating(true);
        const res = await generateBusinessDeviceKey(businessId);
        if (res.success) {
            setBusinessData((prev: any) => ({ ...prev, device_connection_key: res.key }));
        } else { toast.error("Failed to generate key."); }
        setGenerating(false);
    };

    const handleOpenManualModal = async () => {
        setIsManualModalOpen(true);
        if (!businessData?.device_connection_key) { await handleGenerateKey(); }
    };

    const handleAutoConnect = async () => {
        if (!businessData?.device_connection_key) {
            toast.info("Generating secure key first...");
            const res = await generateBusinessDeviceKey(businessId!);
            if(res.success) { window.location.href = `yourapp://connect?key=${res.key}`; }
        } else { window.location.href = `yourapp://connect?key=${businessData.device_connection_key}`; }
    };

    const copyToClipboard = () => {
        const textToCopy = businessData?.device_connection_key;
        if (!textToCopy) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => toast.success("Key copied securely!")).catch(() => toast.error("Failed to copy!"));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy; textArea.style.position = "absolute"; textArea.style.left = "-999999px";
            document.body.appendChild(textArea); textArea.focus(); textArea.select();
            try { document.execCommand('copy'); toast.success("Key copied!"); } catch (error) { toast.error("Failed to copy!"); }
            textArea.remove();
        }
    };

    const handleDeleteDevice = async () => {
        if(!businessId) return;
        if(!confirm("Are you sure you want to delete and disconnect this node?")) return;
        setLoading(true);
        const res = await deleteBusinessDevice(businessId);
        if(res.success) { setActiveDevice(null); toast.success("Device disconnected successfully."); } else { toast.error(res.message); }
        setLoading(false);
    };

    const handleOpenImportModal = async () => {
        setImporting(true);
        const res = await getVaultDataForImport('device');
        if (res.success) { setVaultData(res.data); setIsImportModalOpen(true); } else { toast.error(res.message); }
        setImporting(false);
    };

    const handleConfirmImport = async () => {
        if (!businessId) return;
        setImporting(true);
        const res = await importVaultDeviceToBusiness(businessId);
        if (res.success) { toast.success(res.message); fetchBusinessData(businessId); setIsImportModalOpen(false); } else { toast.error(res.message); }
        setImporting(false);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={36} strokeWidth={2.5} />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Devices</p>
        </div>
    );
    if (!businessId) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold">Please select a Workspace.</div>;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Smartphone className="text-indigo-500 hidden sm:block" size={26}/> Business Devices
                        </h1>
                        <p className="text-[12px] md:text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Manage SMS automation node configuration.</p>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleOpenImportModal} disabled={importing} className="flex-1 sm:flex-none bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm shadow-sm disabled:opacity-50">
                        {importing && !isImportModalOpen ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <DownloadCloud size={16} className="text-indigo-500" />} 
                        <span className="hidden sm:inline">Import Vault</span><span className="sm:hidden">Import</span>
                    </button>
                    <button onClick={() => setIsDownloadModalOpen(true)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm">
                        <Download size={16} strokeWidth={2.5} /> 
                        <span className="hidden sm:inline">Download App</span><span className="sm:hidden">App</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl relative z-10">
                {!activeDevice ? (
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-10 flex flex-col items-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-[#0B1120] rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-sm">
                            <Key className="text-indigo-500" size={32} strokeWidth={2.5} />
                        </div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[2px] rounded-lg mb-4">Setup Required</span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Connect Automation App</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed max-w-md">Install the app and connect it to your workspace to automate SMS parsing. Only one node can be active per workspace.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                            <button onClick={handleAutoConnect} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Smartphone size={16} /> Auto Connect
                            </button>
                            <button onClick={handleOpenManualModal} className="flex-1 bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-6 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                                <QrCode size={16} /> Manual Pair
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 border-b-[4px] border-b-indigo-500 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-200 dark:border-slate-700 shadow-inner">
                                    <Cpu size={32} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{activeDevice.device_name || 'Business Gateway'}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{activeDevice.device_model || 'Android Node'}</p>
                                </div>
                            </div>
                            
                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl border shadow-sm ${activeDevice.is_active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'}`}>
                                <div className={`w-2 h-2 rounded-full ${activeDevice.is_active ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`} />
                                {activeDevice.is_active ? 'System Online' : 'Node Offline'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Battery size={14} className="text-slate-400" /> Battery Health</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{activeDevice.battery_level || 0}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${activeDevice.battery_level > 20 ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${activeDevice.battery_level || 0}%` }} />
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><RefreshCw size={14} className="text-slate-400" /> Last Server Sync</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleString() : 'Never'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={handleOpenManualModal} className="flex-1 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-[13px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm">
                                <Replace size={16} /> Reconfigure Node
                            </button>
                            <button onClick={handleDeleteDevice} className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl font-bold text-[13px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-sm">
                                <Trash2 size={16} /> Disconnect & Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* IMPORT MODAL */}
            {isImportModalOpen && vaultData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsImportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Device</h2>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[2px] mt-0.5">From Master Vault</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><X size={18} strokeWidth={2.5}/></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 bg-white dark:bg-[#0B1120]">
                            <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                <Cpu size={32} className="mx-auto text-indigo-500 mb-3" />
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vault Master Device</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{vaultData.device_name || 'Unknown Device'}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">Model: {vaultData.device_model || 'N/A'}</p>
                            </div>
                            <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                                {importing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16}/> Confirm & Import</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DOWNLOAD MODAL */}
            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDownloadModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">Get App</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Choose your platform</p>
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
                                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer" download className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all p-4 rounded-xl flex items-center gap-4 group active:scale-[0.98] shadow-sm">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/50 group-hover:scale-110 transition-transform">
                                        <Download size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5}/>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">DIRECT INSTALL</p>
                                        <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Download APK</h4>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL PAIR MODAL */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsManualModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">Pair Device</h2>
                                <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Scan or Enter Key</p>
                            </div>
                            <button onClick={() => setIsManualModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><X size={18} /></button>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#0B1120] flex flex-col items-center text-center">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 rounded-tl-[18px] -translate-x-1 -translate-y-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 rounded-tr-[18px] translate-x-1 -translate-y-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 rounded-bl-[18px] -translate-x-1 translate-y-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 rounded-br-[18px] translate-x-1 translate-y-1"></div>
                                <QRCodeSVG value={businessData?.device_connection_key || 'generating...'} size={160} level="H" fgColor="#0B1120" bgColor="#ffffff" />
                            </div>

                            <div className="w-full text-left">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Secret Key</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 flex items-center overflow-hidden">
                                        <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-widest truncate">
                                            {businessData?.device_connection_key || '••••••••'}
                                        </span>
                                    </div>
                                    <button onClick={copyToClipboard} className="w-12 h-12 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl active:scale-95 transition-all hover:bg-slate-200 dark:hover:border-indigo-500 flex items-center justify-center shrink-0">
                                        <Copy size={18} />
                                    </button>
                                    <button onClick={handleGenerateKey} disabled={generating} className="w-12 h-12 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl active:scale-95 transition-all hover:bg-slate-200 dark:hover:border-indigo-500 flex items-center justify-center shrink-0 disabled:opacity-50">
                                        <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}