'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw, Trash2, Replace, Key, QrCode, DownloadCloud, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react'; 
import { getBusinessSettings, generateBusinessDeviceKey, getBusinessConnectedDevice, deleteBusinessDevice, importVaultDeviceToBusiness, getVaultDataForImport } from '@/lib/business_actions';
import { getAppDownloadLinks } from '@/lib/vault_actions';

export default function BusinessDevicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    
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
            toast.info("Generating key first...");
            const res = await generateBusinessDeviceKey(businessId!);
            if(res.success) { window.location.href = `yourapp://connect?key=${res.key}`; }
        } else { window.location.href = `yourapp://connect?key=${businessData.device_connection_key}`; }
    };

    const copyToClipboard = () => {
        const textToCopy = businessData?.device_connection_key;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => toast.success("Copied!")).catch(() => toast.error("Failed!"));
    };

    const handleDeleteDevice = async () => {
        if(!businessId || !confirm("Disconnect this device?")) return;
        setLoading(true);
        const res = await deleteBusinessDevice(businessId);
        if(res.success) { setActiveDevice(null); toast.success("Disconnected."); } else { toast.error(res.message); }
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Devices</p>
        </div>
    );

    if (!businessId) return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Select Workspace</div>;

    return (
        <div className="w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 relative z-10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">Business Devices</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Workspace SMS Node</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleOpenImportModal} disabled={importing} className="flex-1 sm:flex-none bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                        {importing && !isImportModalOpen ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <DownloadCloud size={16} className="text-indigo-500" />} 
                        Import
                    </button>
                    <button onClick={() => setIsDownloadModalOpen(true)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all shadow-md active:scale-95">
                        <Download size={16} /> App
                    </button>
                </div>
            </div>

            {/* Content Centered */}
            <div className="flex justify-center py-6">
                <div className="w-full max-w-2xl">
                    {!activeDevice ? (
                        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 md:p-16 flex flex-col items-center text-center shadow-sm">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-[#0B1120] rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-sm">
                                <Key className="text-indigo-500" size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Connect Device</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed max-w-md">Install and link the automation app to this workspace for real-time parsing.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                                <button onClick={handleAutoConnect} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md active:scale-95 flex items-center justify-center gap-2 transition-all">
                                    <Smartphone size={16} /> Auto Connect
                                </button>
                                <button onClick={handleOpenManualModal} className="flex-1 bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 transition-all">
                                    <QrCode size={16} /> Manual Pair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 border-b-4 border-b-indigo-500 shadow-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-[#0B1120] rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-200 dark:border-slate-700 shadow-inner">
                                        <Cpu size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeDevice.device_name || 'Business Gateway'}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeDevice.device_model || 'Android Node'}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${activeDevice.is_active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200'}`}>
                                    <div className={`w-2 h-2 rounded-full ${activeDevice.is_active ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`} />
                                    {activeDevice.is_active ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Battery size={14} /> Power</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{activeDevice.battery_level || 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full ${activeDevice.battery_level > 20 ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${activeDevice.battery_level || 0}%` }} />
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Last Sync</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{activeDevice.last_sync ? new Date(activeDevice.last_sync).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={handleOpenManualModal} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50">
                                    <Replace size={16} className="inline mr-2" /> Reconfigure
                                </button>
                                <button onClick={handleDeleteDevice} className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-100">
                                    <Trash2 size={16} className="inline mr-2" /> Disconnect
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MANUAL MODAL - Masked 24-Digit Key */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setIsManualModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Pair Node</h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-inner">
                                <QRCodeSVG value={businessData?.device_connection_key || 'xelpay'} size={180} level="H" />
                            </div>

                            <div className="w-full space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Secure Key (24 Digits)</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 flex items-center justify-between group">
                                        <span className="font-mono text-[13px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                                            {showKey ? businessData?.device_connection_key : '•••••••• •••••••• ••••••••'}
                                        </span>
                                        <button onClick={() => setShowKey(!showKey)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button onClick={copyToClipboard} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-white active:scale-90 transition-all"><Copy size={20} /></button>
                                    <button onClick={handleGenerateKey} disabled={generating} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-white active:scale-90 transition-all"><RefreshCw size={20} className={generating ? 'animate-spin' : ''} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL - Kept original Import Logic */}
            {isImportModalOpen && vaultData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsImportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Import Device</h2>
                            <button onClick={() => setIsImportModalOpen(false)}><X size={18}/></button>
                        </div>
                        <div className="p-8 text-center">
                            <Cpu size={40} className="mx-auto text-indigo-500 mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Device</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white mb-8">{vaultData.device_name || 'Master Node'}</p>
                            <button onClick={handleConfirmImport} disabled={importing} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                {importing ? <Loader2 className="animate-spin inline" /> : <><CheckCircle2 className="inline mr-2" size={16}/> Confirm Import</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}