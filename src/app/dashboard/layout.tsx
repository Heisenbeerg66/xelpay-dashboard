import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Metadata } from 'next';

// ── Dashboard সব page noindex — কোনো dashboard page Google-এ দেখা যাওয়া উচিত না ──
export const metadata: Metadata = {
  title: {
    default: 'Dashboard — XelPay',
    template: '%s — XelPay',
  },
  description: 'XelPay merchant dashboard for managing automated bKash, Nagad, and Rocket payment verification.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
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

  if (!merchant) {
    redirect('/auth/force-signout?redirect=/signup');
  }

  return (
    <DashboardClient merchant={merchant} user={user}>
      {children}
    </DashboardClient>
  );
}