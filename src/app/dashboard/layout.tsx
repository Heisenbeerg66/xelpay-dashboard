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
    .single();

  if (!merchant) redirect('/login');

  // ড্যাশবোর্ড এবং সাইডবারের জন্য রোল সেট করা (ডিফল্ট owner)
  let resolvedMerchant = { ...merchant, team_role: 'owner' };

  if (!merchant.active_business_id) {
    const { data: ownBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('merchant_id', user.id)
      .limit(1)
      .maybeSingle();

    if (ownBusiness) {
      await supabase.from('merchants').update({ active_business_id: ownBusiness.id }).eq('id', user.id);
      resolvedMerchant = { ...merchant, active_business_id: ownBusiness.id, team_role: 'owner' };
    } else {
      const { data: teamMembership } = await supabase
        .from('business_team_members')
        .select('business_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (teamMembership) {
        await supabase.from('merchants').update({ active_business_id: teamMembership.business_id }).eq('id', user.id);
        resolvedMerchant = { ...merchant, active_business_id: teamMembership.business_id, team_role: teamMembership.role };
      }
    }
  } else {
    // যদি অলরেডি active_business_id থাকে, তবে সেই বিজনেসে ইউজারের রোল কী তা চেক করা
    const { data: membership } = await supabase
      .from('business_team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('business_id', merchant.active_business_id)
      .maybeSingle();
    
    if (membership) {
      resolvedMerchant.team_role = membership.role;
    }
  }

  return (
    <DashboardClient merchant={resolvedMerchant}>
      <Toaster position="top-right" richColors />
      {children}
    </DashboardClient>
  );
}