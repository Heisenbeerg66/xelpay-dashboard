import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';

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

  // ইউজার না থাকলে লগইনে পাঠাবে
  if (!user) redirect('/login');

  // ইউজারের মার্চেন্ট প্রোফাইল ফেচ করা হচ্ছে
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!merchant) redirect('/login');

  return (
    <DashboardClient merchant={merchant} user={user}>
      {children}
    </DashboardClient>
  );
}