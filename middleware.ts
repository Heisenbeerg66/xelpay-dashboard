import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── ROUTE DEFINITIONS ──────────────────────────────────────────────────────
const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
// Everything else is public — no redirect in either direction.

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const pathname = request.nextUrl.pathname;

  // Pass-through: auth callbacks and API routes — never intercept these.
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return response;
  }

  // ── Build SSR Supabase client (keeps session cookies in sync) ────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production', // 👈 লোকালহোস্টের জন্য ফিক্স
            })
          );
        },
      },
    }
  );

  // ── Verify session server-side (never trust client state alone) ──────────
  // getUser() validates the JWT against Supabase — cannot be spoofed.
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // ─── 1. No session + protected route → force login ───────────────────────
  if (!user && isProtected) {
    // Clear stale auth_session cookie so landing page doesn't show Dashboard
    // button for a user whose Supabase session has already expired.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete('auth_session');
    return redirectResponse;
  }

  // ─── 2. Active session + auth route → bounce to dashboard ────────────────
  if (user && isAuthRoute) {
    // Special case: password-recovery flow must be allowed through
    const isRecoveryMode = request.cookies.get('xelpay_recovery_mode')?.value === 'true';
    if ((pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) && isRecoveryMode) {
      return response;
    }

    // Confirm merchant record exists before redirecting
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!merchant) {
      // Auth session exists but no merchant profile → force re-signup
      const url = new URL('/auth/force-signout', request.url);
      url.searchParams.set('redirect', '/signup');
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ─── 3. Set custom HttpOnly auth cookie on every valid session ───────────
  // No maxAge — cookie persists until user explicitly logs out or clears
  // browser data. Supabase handles its own token refresh automatically.
  if (user) {
    response.cookies.set('auth_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // No maxAge — session lives as long as the Supabase JWT is valid and
      // auto-refreshed. User must explicitly log out to clear.
      path: '/',
    });
  } else {
    // Clear our custom cookie if Supabase session is gone
    response.cookies.delete('auth_session');
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    // Include root and info pages so the auth_session cookie gets set/cleared
    '/',
    '/info/:path*',
  ],
};