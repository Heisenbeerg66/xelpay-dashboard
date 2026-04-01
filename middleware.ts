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

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // এই পেজগুলোতে middleware কিছুই করবে না
  const bypassPaths = ['/auth/', '/verify-success', '/auth/verify-success'];
  if (bypassPaths.some(p => pathname.startsWith(p))) {
    return response;
  }

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some(
    path => pathname.startsWith(path)
  );
  const isDashboard = pathname.startsWith('/dashboard');

  // লগইন ছাড়া ড্যাশবোর্ডে গেলে লগইনে পাঠাবে
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // লগইন করা থাকলে auth পেজে গেলে ড্যাশবোর্ডে পাঠাবে
  // কিন্তু শুধুমাত্র যখন user আছে — merchant check করবে না middleware তে
  if (user && isAuthPage) {
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