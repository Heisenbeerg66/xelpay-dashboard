import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: { default: 'Dashboard — XelPay', template: '%s — XelPay' },
  description: 'XelPay merchant dashboard.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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

  // ✅ FIX: merchant row না থাকলে force-signout করা হতো।
  // কিন্তু team member user-এর এখন merchants row আছে (accept-invite route-এ insert করা হয়েছে)।
  // তবুও কোনো edge case-এ না থাকলে force-signout করো।
  if (!merchant) redirect('/auth/force-signout?redirect=/signup');

  // ✅ FIX: Team member হলে তার active_business_id সেট নাও থাকতে পারে।
  // business_team_members থেকে তার assigned business খুঁজে নিই এবং
  // merchant-এর active_business_id আপডেট করে দিই।
  let resolvedMerchant = merchant;

  if (!merchant.active_business_id) {
    // নিজের business আছে কিনা দেখো
    const { data: ownBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('merchant_id', user.id)
      .limit(1)
      .maybeSingle();

    if (ownBusiness) {
      // নিজের business আছে — সেটা active করো
      await supabase
        .from('merchants')
        .update({ active_business_id: ownBusiness.id })
        .eq('id', user.id);

      resolvedMerchant = { ...merchant, active_business_id: ownBusiness.id };
    } else {
      // নিজের business নেই — team member কিনা চেক করো
      const { data: teamMembership } = await supabase
        .from('business_team_members')
        .select('business_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (teamMembership) {
        // Team member — তার assigned business active করো
        await supabase
          .from('merchants')
          .update({ active_business_id: teamMembership.business_id })
          .eq('id', user.id);

        resolvedMerchant = { ...merchant, active_business_id: teamMembership.business_id };
      }
    }
  }

  return (
    <DashboardClient merchant={resolvedMerchant} user={user}>
      <Toaster richColors position="top-center" />
      {children}
    </DashboardClient>
  );
}