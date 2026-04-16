import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner'; // 🚀 ফিক্স: Toaster ইম্পোর্ট করা হয়েছে

export const metadata: Metadata = {
  title: { default: 'Dashboard — XelPay', template: '%s — XelPay' },
  description: 'XelPay merchant dashboard.',
  robots: { index: false, follow: false },
};

// 💥 মোবাইলের জুম ইন/আউট চিরতরে বন্ধ করার ম্যাজিক ফিক্স
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // এটি আঙুল দিয়ে জুম করা বন্ধ করে দেবে
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  // Fast check — middleware already handled this
  if (cookieStore.get('auth_session')?.value !== 'authenticated') {
    redirect('/login');
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!merchant) redirect('/auth/force-signout?redirect=/signup');

  return (
    <DashboardClient merchant={merchant} user={user}>
      {/* 🚀 ফিক্স: ড্যাশবোর্ডে পপআপ/মেসেজ দেখানোর জন্য Toaster যুক্ত করা হয়েছে */}
      <Toaster richColors position="top-center" />
      {children}
    </DashboardClient>
  );
}