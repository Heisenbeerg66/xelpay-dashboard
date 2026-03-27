'use client';

import { useState } from 'react';
import Link from 'next/link'; // 🚀 Added Link
import { Workflow, Plus, X, Code, Braces, Webhook, ArrowLeft } from 'lucide-react'; // 🚀 Added ArrowLeft
import { toast, Toaster } from 'sonner';

export default function AutomationPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [webhooks, setWebhooks] = useState<any[]>([]);

    return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen bg-[#F4F7F9] dark:bg-[#0B1120] font-sans transition-colors duration-300">
            <Toaster position="top-center" richColors />
            
            {/* 🚀 UPDATED Header with Explicit Back Button */}
            <div className="flex flex-row items-center justify-between gap-3 mb-8 animate-in fade-in slide-in-from-top-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/vault" className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all">
                            <ArrowLeft size={24} strokeWidth={2.5}/>
                        </Link>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Workflow className="text-purple-500" size={28} /> Apps & Automation
                        </h1>
                    </div>
                    <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium truncate ml-10 md:ml-12">Connect external servers and API Webhooks.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-900/20 active:scale-95 text-xs md:text-base">
                    <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Add Webhook</span><span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webhooks.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111827] rounded-[30px] border border-slate-200 dark:border-slate-800 border-dashed animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-5">
                            <Webhook size={36} className="text-purple-500"/>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">No Webhooks Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">Create a webhook to instantly send transaction data to your own server or 3rd party apps.</p>
                    </div>
                )}
            </div>

            {/* Bottom Sheet Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300">
                    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] w-full md:w-[500px] h-[90vh] md:h-auto md:max-h-[90vh] md:rounded-[32px] rounded-t-[32px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 border border-white/20 dark:border-slate-800 overflow-hidden relative">
                        
                        <div className="shrink-0 flex justify-between items-center px-6 pt-6 pb-4 bg-white dark:bg-[#111827] border-b border-slate-100 dark:border-slate-800 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Webhook</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Configure server endpoint.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all"><X size={20} strokeWidth={2.5}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-white dark:bg-[#111827]">
                            <form className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Endpoint Name <span className="text-red-500">*</span></label>
                                    <input required type="text" placeholder="e.g. My Main Server" className="w-full mt-1.5 p-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white font-semibold text-base"/>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Payload URL <span className="text-red-500">*</span></label>
                                    <input required type="url" placeholder="https://api.yoursite.com/webhook" className="w-full mt-1.5 p-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white font-medium text-sm"/>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Secret Key (Optional)</label>
                                    <input type="password" placeholder="Webhook Signature Secret" className="w-full mt-1.5 p-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 font-mono tracking-widest text-sm dark:text-white"/>
                                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Used to verify the incoming payload on your server.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#111827] shrink-0 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-purple-900/20 transition-all flex justify-center items-center gap-2 active:scale-95">
                                <Braces size={22} strokeWidth={2.5}/> Save Webhook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}