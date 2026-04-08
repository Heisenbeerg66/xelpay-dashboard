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
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (merchant.status === 'pending' && !merchant.is_demo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 transition-colors duration-500">
        <ActivationScreen merchant={merchant} />
      </div>
    );
  }

  return (
    // 💥 max-w-[100vw] এবং overflow-x-hidden নিশ্চিত করবে স্ক্রিন কখনোই ডিভাইসের সাইজের চেয়ে বড় হবে না
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 dark:bg-[#0B1120] flex font-sans transition-colors duration-500">
      
      <Sidebar merchant={merchant} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`flex-1 flex flex-col min-h-screen w-full max-w-[100vw] transition-all duration-300 relative z-10 md:ml-72`}>
        
        <Header merchant={merchant} setSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 md:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
        />
      )}
    </div>
  );
}