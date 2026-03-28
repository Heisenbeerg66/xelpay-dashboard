'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowLeft, Download, Battery, Cpu, Copy, Loader2, X, RefreshCw, Trash2, Replace, Key, Play, QrCode } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { QRCodeSVG } from 'qrcode.react'; 
import { getMerchantVaultSettings, generateDeviceKey, getConnectedDevice, deleteMerchantDevice, getAppDownloadLinks } from '@/lib/vault_actions';

export default function MasterDevicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
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
        const res = await generateDeviceKey();
        if (res.success) {
            setMerchantData((prev: any) => ({ ...prev, device_connection_key: res.key }));
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
            if(res.success) {
                // 🚀 Deep Linking: Replace 'yourapp' with your actual app scheme
                window.location.href = `yourapp://connect?key=${res.key}`;
            }
        } else {
            window.location.href = `yourapp://connect?key=${merchantData.device_connection_key}`;
        }
    };

    // 🚀 Advanced Copy Function with Fallback for non-HTTPS (Local IP)
    const copyToClipboard = () => {
        const textToCopy = merchantData?.device_connection_key;
        if (!textToCopy) return;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => toast.success("Key copied securely!"))
                .catch(() => toast.error("Failed to copy!"));
        } else {
            // Fallback for HTTP / Local IPs
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Key copied!");
            } catch (error) {
                toast.error("Failed to copy!");
            }
            textArea.remove();
        }
    };

    const handleDeleteDevice = async () => {
        if(!confirm("Are you sure you want to delete and disconnect this node?")) return;
        setLoading(true);
        const res = await deleteMerchantDevice();
        if(res.success) {
            setActiveDevice(null);
            toast.success("Device disconnected successfully.");
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] dark:bg-[#0B1120]"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;return (
        <div className="p-4 md:p-8 w-full max-w-5xl mx-auto min-h-screen bg-[#F4F7F9] dark:bg-[#0B1120] font-sans relative overflow-hidden transition-colors duration-300">
            <Toaster position="top-center" richColors />
            
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-3 mb-8 relative z-10">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/vault')} className="p-2 -ml-2 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent dark:border-slate-800 text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2">
                            <Smartphone className="text-emerald-500 hidden sm:block" size={26}/> Master Devices
                        </h1>
                    </div>
                </div>
                <button onClick={() => setIsDownloadModalOpen(true)} className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-[16px] font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-xs md:text-sm">
                    <Download size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Download App</span><span className="sm:hidden">Get App</span>
                </button>
            </div>

            {/* Dynamic Content Area */}
            <div className="relative z-10 max-w-3xl mx-auto mt-4">
                
                {!activeDevice ? (
                    <div className="bg-white dark:bg-[#111827] rounded-[32px] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="w-24 h-24 shrink-0 bg-emerald-50 dark:bg-[#0B1120] rounded-[24px] border border-emerald-100 dark:border-slate-800 flex items-center justify-center mb-6">
                            <Key className="text-emerald-500" size={40} />
                        </div>
                        
                        <div className="relative z-10 max-w-md">
                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[2px] rounded-full mb-3 border border-emerald-500/20">Setup Required</span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Connect Automation App</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Install the app and connect it to your merchant account to automate SMS parsing. Only one master device can be linked.</p>
                            
                            <div className="flex flex-col gap-3">
                                <button onClick={handleAutoConnect} className="w-full bg-emerald-500 text-white px-8 py-4 rounded-[18px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Smartphone size={16}/> Connect Device
                                </button>
                                <button onClick={handleOpenManualModal} className="w-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white px-8 py-4 rounded-[18px] font-black uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <QrCode size={16}/> Manually Connect
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 ml-2">Active Node</h3>
                        
                        <div className="bg-white dark:bg-[#111827] rounded-[32px] p-6 md:p-8 border border-emerald-100 dark:border-emerald-900/30 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-[#0B1120] rounded-[20px] flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-slate-800 shadow-sm">
                                    <Cpu size={32} />
                                </div>
                                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> {activeDevice.status || 'Online'}
                                </span>
                            </div>
                            
                            <div className="relative z-10 mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{activeDevice.device_name || 'Master Gateway Phone'}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeDevice.device_model || 'Android Device'}</p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px] flex items-center gap-2"><Battery size={14}/> Battery Level</span>
                                    <span className="font-black text-slate-900 dark:text-white">{activeDevice.battery_level || 0}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${activeDevice.battery_level > 20 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${activeDevice.battery_level || 0}%`}} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 relative z-10 mt-8">
                                <button onClick={handleOpenManualModal} className="flex-1 bg-slate-100 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 px-6 py-4 rounded-[16px] font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800">
                                    <Replace size={16}/> Change Device
                                </button>
                                <button onClick={handleDeleteDevice} className="flex-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-[16px] font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20">
                                    <Trash2 size={16}/> Delete Node
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🚀 PREMIUM DOWNLOAD MODAL */}
            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300" onClick={() => setIsDownloadModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full md:w-[420px] rounded-t-[36px] md:rounded-[36px] shadow-2xl animate-in slide-in-from-bottom-10 border border-white/10 overflow-hidden flex flex-col">
                        
                        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800/60">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Get App</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Choose your platform</p>
                            </div>
                            <button onClick={() => setIsDownloadModalOpen(false)} className="p-2.5 bg-slate-100 dark:bg-[#0B1120] rounded-full text-slate-500 active:scale-90 transition-all hover:text-slate-800 dark:hover:text-white"><X size={20} strokeWidth={2.5}/></button>
                        </div>

                        <div className="p-8 flex flex-col gap-4">
                            {downloadLinks.play_store && (
                                <a href={downloadLinks.play_store} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-[#00A273] dark:hover:border-[#00A273] transition-all p-5 rounded-[24px] flex items-center gap-5 group shadow-sm hover:shadow-md active:scale-[0.98]">
                                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 48 48" className="w-10 h-10 group-hover:scale-110 transition-transform">
                                            <path fill="#ea4335" d="M10.14 41.52L38 25.43c1.78-1.02 1.78-3.56 0-4.59L10.14 4.75C8.42 3.76 6.25 5 6.25 7.04v33.91c0 2.04 2.17 3.28 3.89 2.29z"/>
                                            <path fill="#fbbc04" d="M38 25.43L28.18 31.06 6.25 40.95c.57.98 1.83 1.25 2.83.67l28.92-16.19z"/>
                                            <path fill="#4285f4" d="M38 20.84L10.14 4.75C9.14 4.18 7.88 4.44 7.31 5.43l20.87 21.04L38 20.84z"/>
                                            <path fill="#34a853" d="M6.25 7.04v33.91L28.18 31.06 10.14 4.75C8.42 3.76 6.25 5 6.25 7.04z"/>
                                        </svg>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">GET IT ON</p>
                                        <h4 className="font-black text-lg text-[#00A273] dark:text-white leading-tight">Google Play</h4>
                                    </div>
                                </a>
                            )}
                            
                            {downloadLinks.direct_apk && (
                                <a href={downloadLinks.direct_apk} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all p-5 rounded-[24px] flex items-center gap-5 group shadow-sm hover:shadow-md active:scale-[0.98]">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-[16px] flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
                                        <Download size={22} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5}/>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">DIRECT INSTALL</p>
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Download APK</h4>
                                    </div>
                                </a>
                            )}

                            {!downloadLinks.play_store && !downloadLinks.direct_apk && (
                                <div className="text-center py-6 text-slate-500">
                                    <Cpu size={32} className="mx-auto opacity-20 mb-3" />
                                    <p className="text-sm font-medium">Download links are currently unavailable.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🚀 PREMIUM MANUAL PAIR MODAL */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300" onClick={() => setIsManualModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#111827] w-full md:w-[420px] rounded-t-[36px] md:rounded-[36px] shadow-2xl animate-in slide-in-from-bottom-10 border border-white/10 overflow-hidden flex flex-col">
                        
                        <div className="px-8 pt-8 pb-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Pair Device</h2>
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[2px] mt-1">Scan or Enter Key</p>
                            </div>
                            <button onClick={() => setIsManualModalOpen(false)} className="p-2.5 bg-slate-100 dark:bg-[#0B1120] rounded-full text-slate-500 active:scale-90 transition-all hover:text-slate-800 dark:hover:text-white"><X size={20} strokeWidth={2.5}/></button>
                        </div>

                        <div className="p-8 flex flex-col items-center text-center">
                            
                            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 rounded-tl-[20px] -translate-x-1 -translate-y-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 rounded-tr-[20px] translate-x-1 -translate-y-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 rounded-bl-[20px] -translate-x-1 translate-y-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 rounded-br-[20px] translate-x-1 translate-y-1"></div>
                                
                                <QRCodeSVG 
                                    value={merchantData?.device_connection_key || 'generating...'} 
                                    size={160} 
                                    level="H" 
                                    fgColor="#0B1120" 
                                    bgColor="#ffffff"
                                />
                            </div>

                            <div className="w-full mb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3 block">Secret Key</label>
                                
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex-1 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[20px] py-4 px-4 flex items-center justify-center">
                                        <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-widest">
                                            {merchantData?.device_connection_key || '••••••••'}
                                        </span>
                                    </div>
                                    <button onClick={copyToClipboard} className="w-14 h-14 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] active:scale-90 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500 flex items-center justify-center">
                                        <Copy size={20}/>
                                    </button>
                                    <button onClick={handleGenerateKey} disabled={generating} className="w-14 h-14 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-[20px] active:scale-90 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500 flex items-center justify-center">
                                        <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
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