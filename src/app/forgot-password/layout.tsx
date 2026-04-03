// ── src/app/forgot-password/layout.tsx  (NEW FILE — create this) ─────────────
// forgot-password/page.tsx is 'use client' so metadata goes in layout

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Your Password — XelPay',
  description:
    'Forgot your XelPay merchant account password? Reset it securely in minutes using your registered email address and OTP verification.',
  alternates: {
    canonical: 'https://www.xelpay.site/forgot-password',
  },
  robots: {
    index: false, // password reset page index করার দরকার নেই
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}