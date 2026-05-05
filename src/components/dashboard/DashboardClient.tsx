'use client';
// PATH: components/dashboard/DashboardClient.tsx

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ActivationScreen from './ActivationScreen'; 
import { Loader2 } from 'lucide-react';

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function DashboardClient({ merchant, user, children }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobileDevice = useIsMobileDevice();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#111827]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (merchant.status === 'pending' && !merchant.is_demo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111827] flex items-center justify-center p-4 transition-colors duration-500">
        <ActivationScreen merchant={merchant} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-sans">
      
      {/* Header */}
      <Header merchant={merchant} setSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-[72px]">
        
        {/* Sidebar */}
        <Sidebar merchant={merchant} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* 
          💥 FIX: 'relative z-10' রিমুভ করা হয়েছে যাতে পেজের ভেতরের মোডালগুলো হেডারের উপরে আসতে পারে।
        */}
        <div className={`flex flex-col h-[calc(100vh-72px)] w-full overflow-hidden transition-all duration-300 bg-slate-50 dark:bg-[#111827] ${!isMobileDevice ? 'ml-72' : ''}`}>
          
          {/* 💥 FIX: 'animate-in' রিমুভ করা হয়েছে যাতে Stacking Context Trap না হয়। */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>

      </div>

      {/* Overlay শুধু touch device-এ sidebar open থাকলে */}
      {isSidebarOpen && isMobileDevice && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 top-[72px] bg-slate-900/60 dark:bg-[#0B1120]/80 backdrop-blur-sm z-30 animate-in fade-in duration-300" 
        />
      )}
    </div>
  );
}