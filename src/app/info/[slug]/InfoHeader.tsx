// PATH: /components/InfoHeader.tsx
// তোমার আগের InfoHeader.tsx কে REPLACE করো।
// এটা Server Component — cookie পড়ে, client component এ prop পাস করে।

import { cookies } from 'next/headers';
import InfoHeaderClient from './InfoHeaderClient';

export default async function InfoHeader() {
  const cookieStore = await cookies();
  // HttpOnly cookie — Supabase call ছাড়াই auth state জানা যায়
  const isAuthenticated = cookieStore.get('auth_session')?.value === 'authenticated';

  return <InfoHeaderClient isAuthenticated={isAuthenticated} />;
}