'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ActivationScreen from './ActivationScreen'; // ✅ Premium Activation Screen
import { Loader2 } from 'lucide-react';

export default function DashboardClient({ merchant, user, children }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration error রোধ করার জন্য useEffect ব্যবহার করা হয়েছে
  useEffect(() => {
    setMounted(true);
  }, []);

  // কম্পোনেন্ট মাউন্ট হওয়ার আগে স্মুথ লোডিং দেখাবে
  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  // 🔴 PENDING STATUS LOGIC: 
  // যদি ইউজারের স্ট্যাটাস 'pending' থাকে এবং সে 'demo' ইউজার না হয়, 
  // তাহলে তাকে ড্যাশবোর্ডে ঢুকতে না দিয়ে সরাসরি Activation Screen এ আটকে দিবে।
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
      <div className="flex-1 flex flex-col min-h-screen md:ml-72 transition-all duration-300 relative z-10">
        
        {/* Sticky Header with Theme Toggle & Notifications */}
        <Header merchant={merchant} setSidebarOpen={setIsSidebarOpen} />

        {/* Dynamic Page Content (যেমন: page.tsx এর Overview, Transactions ইত্যাদি) */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay (সাইডবার ওপেন থাকলে ব্যাকগ্রাউন্ড ব্লার করবে) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
        />
      )}
    </div>
  );
}