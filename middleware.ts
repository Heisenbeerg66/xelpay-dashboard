import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
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

  const pathname = request.nextUrl.pathname;

  // এই paths এ middleware কিছু করে না
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return response;
  }

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some(
    path => pathname.startsWith(path)
  );
  const isDashboard = pathname.startsWith('/dashboard');

  // লগইন ছাড়া dashboard → login এ পাঠাও
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // লগইন আছে এবং auth page এ আসছে
  if (user && isAuthPage) {
    // Merchant আছে কিনা check করো
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!merchant) {
      // Auth আছে কিন্তু merchant নেই → force signout করে signup এ পাঠাও
      const url = new URL('/auth/force-signout', request.url);
      url.searchParams.set('redirect', '/signup');
      return NextResponse.redirect(url);
    }

    // Merchant আছে → dashboard এ পাঠাও
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
  ],
};