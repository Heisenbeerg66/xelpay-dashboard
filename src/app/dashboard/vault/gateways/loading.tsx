'use client';

import { Lock, ServerCog } from 'lucide-react';

export default function VaultLoading() {
    return (
        <div className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-[#F9FAFB] dark:bg-[#030712] relative overflow-hidden">
            
            {/* Glowing Background Textures */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
                {/* Core Animation Circle */}
                <div className="relative w-24 h-24 mb-8">
                    {/* Outer Rotating Dashed Ring */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-blue-500/30 animate-[spin_4s_linear_infinite]" />
                    
                    {/* Inner Pulsing Ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-blue-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
                    
                    {/* Center Icon Background */}
                    <div className="absolute inset-4 rounded-full bg-slate-900 dark:bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                        <Lock size={28} className="text-white animate-pulse" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Loading Text */}
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-2 flex items-center gap-2">
                    Accessing <span className="text-blue-600">Vault</span>
                </h2>
                
                {/* Subtext with dots animation */}
                <div className="flex items-center gap-2">
                    <ServerCog size={14} className="text-slate-400 animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-[3px] text-slate-500 dark:text-slate-400">
                        Decrypting Master Assets
                        <span className="inline-flex w-4 text-left">
                            <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                            <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                            <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}