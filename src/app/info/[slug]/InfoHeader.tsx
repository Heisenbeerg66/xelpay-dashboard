// PATH: src/app/info/[slug]/InfoHeader.tsx
// এটা Server Component — 'use client' নেই, cookie পড়ে client এ prop পাস করে।

import { cookies } from 'next/headers';
import InfoHeaderClient from './InfoHeaderClient';

export default async function InfoHeader() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('auth_session')?.value === 'authenticated';
  return <InfoHeaderClient isAuthenticated={isAuthenticated} />;
}