// PATH: /app/dashboard/layout.tsx
// তোমার আগের dashboard layout কে REPLACE করো।

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Dashboard — XelPay', template: '%s — XelPay' },
  description: 'XelPay merchant dashboard.',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  // Fast check — middleware already handled this, এটা safety net
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
      {children}
    </DashboardClient>
  );
}