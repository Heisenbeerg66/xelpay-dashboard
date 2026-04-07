import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', requestUrl.origin)
    );
  }

  const cookieStore = await cookies();

  // cookiesToCommit — redirect response-এ manually set করার জন্য collect করব
  const cookiesToCommit: { name: string; value: string; options: any }[] = [];

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
              secure: process.env.NODE_ENV === 'production',
            });
            cookiesToCommit.push({
              name,
              value,
              options: {
                ...options,
                secure: process.env.NODE_ENV === 'production',
              },
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

  // ── Redirect response-এ Supabase session cookies সরাসরি set করি ────────────
  // Next.js Route Handler-এ cookies() দিয়ে set করা values redirect response-এ
  // automatically forward হয় না। তাই collect করা cookies manually লাগাতে হয়।
  const redirectResponse = NextResponse.redirect(new URL(safeNext, requestUrl.origin));

  cookiesToCommit.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options);
  });

  return redirectResponse;
}