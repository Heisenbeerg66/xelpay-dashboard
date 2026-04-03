// ── src/app/auth/verify-success/layout.tsx  (NEW FILE) ───────────────────────
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Verified — XelPay',
  description:
    'Your XelPay merchant account email has been successfully verified. Your workspace is now active and ready.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifySuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}