'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ActivationScreen from './ActivationScreen'; // ✅ Premium Activation Screen
import { Loader2 } from 'lucide-react';

// pointer:coarse = touch hardware = real mobile/tablet
// desktop mode on করলেও এটা change হয় না
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

  // Hydration error রোধ করার জন্য useEffect ব্যবহার করা হয়েছে
  useEffect(() => {
    setMounted(true);
  }, []);

  // কম্পোনেন্ট মাউন্ট হওয়ার আগে স্মুথ লোডিং দেখাবে
  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  // 🔴 PENDING STATUS LOGIC: 
  // যদি ইউজারের স্ট্যাটাস 'pending' থাকে এবং সে 'demo' ইউজার না হয়, 
  // তাহলে তাকে ড্যাশবোর্ডে ঢুকতে না দিয়ে সরাসরি Activation Screen এ আটকে দিবে।
  if (merchant.status === 'pending' && !merchant.is_demo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 transition-colors duration-500">
        <ActivationScreen merchant={merchant} />
      </div>
    );
  }

  // ✅ ACTIVE STATUS LOGIC (Main Dashboard Layout)
  // যদি ইউজার 'active' বা 'demo' মোডে থাকে, তাহলে সে মেইন ড্যাশবোর্ড দেখতে পাবে।
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex font-sans transition-colors duration-500">
      
      {/* Mobile-First Pro Sidebar */}
      <Sidebar merchant={merchant} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      {/* ml-72 শুধু তখনই লাগবে যখন real desktop device — mobile এ desktop mode on করলেও ml-72 লাগবে না */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${!isMobileDevice ? 'ml-72' : ''}`}>
        
        {/* Sticky Header with Theme Toggle & Notifications */}
        <Header merchant={merchant} setSidebarOpen={setIsSidebarOpen} />

        {/* Dynamic Page Content */}
        {/* max-w এবং mx-auto সরানো হয়েছে যাতে পুরো screen fill হয় */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay — real mobile device এ sidebar open থাকলে দেখাবে */}
      {isSidebarOpen && isMobileDevice && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
        />
      )}
    </div>
  );
}