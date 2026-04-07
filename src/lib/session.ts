'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
// Dashboard এর যেকোনো জায়গা থেকে call করো।
// Supabase session + auth_session cookie দুটোই destroy করে।
export async function logoutAction() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                secure: process.env.NODE_ENV === 'production',
              });
            });
          } catch (error) {
            // Server Component থেকে কল হলে কুকি সেট করা যায় না, তাই এটি ইগনোর করা হলো
          }
        },
      },
    }
  );

  await supabase.auth.signOut();       // Supabase session invalidate
  cookieStore.delete('auth_session');  // আমাদের HttpOnly cookie destroy

  redirect('/');  // Landing page এ পাঠাও — server-side, instant
}

// ─── AUTH STATE (fast — Supabase call ছাড়াই) ─────────────────────────────
// যেকোনো Server Component এ use করো শুধু isAuthenticated জানতে।
export async function getServerAuthState(): Promise<{ isAuthenticated: boolean }> {
  const cookieStore = await cookies();
  return {
    isAuthenticated: cookieStore.get('auth_session')?.value === 'authenticated',
  };
}

// ─── FULL USER OBJECT (Supabase call করে — দরকার হলেই use করো) ──────────
export async function getServerUser() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                secure: process.env.NODE_ENV === 'production',
              });
            });
          } catch (error) {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}