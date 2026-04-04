import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
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
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
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
  // This cookie mirrors the Supabase session so headers/layouts can read auth
  // state server-side without calling Supabase on every Server Component.
  if (user) {
    // auth_session cookie — HttpOnly, Secure, SameSite=Strict, 24h
    response.cookies.set('auth_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,          // exactly 24 hours
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