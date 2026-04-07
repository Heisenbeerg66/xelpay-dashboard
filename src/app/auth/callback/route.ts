import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // 💥 ডায়নামিক প্রোটোকল চেক: লাইভে https এবং লোকালহোস্টে http
  const isSecure = requestUrl.protocol === 'https:';

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', requestUrl.origin)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              secure: isSecure, // 👈 ডায়নামিক সিকিউর চেক
              sameSite: 'lax',  // 👈 Redirect এর জন্য এটি সবচেয়ে নিরাপদ
            });
          });
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data?.user) {
    return NextResponse.redirect(
      new URL('/login?error=exchange_failed', requestUrl.origin)
    );
  }

  const user = data.user;

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, status, is_demo')
    .eq('id', user.id)
    .maybeSingle();

  if (merchantError) {
    return NextResponse.redirect(
      new URL('/login?error=db_error', requestUrl.origin)
    );
  }

  if (!merchant) {
    // Sign out so the user isn't stuck in a limbo auth state
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/login?error=no_account', requestUrl.origin)
    );
  }

  const mStatus = merchant.status?.toLowerCase();

  if (['suspended', 'ban', 'banned'].includes(mStatus)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/login?error=suspended', requestUrl.origin)
    );
  }

  if (mStatus === 'pending') {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/login?error=pending', requestUrl.origin)
    );
  }

  const safeNext =
    next.startsWith('/') && !next.startsWith('//')
      ? next
      : '/dashboard';

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}