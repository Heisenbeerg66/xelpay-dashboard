// ── src/app/info/privacy/layout.tsx  (REPLACE existing) ─────────────────────
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — XelPay',
  description:
    'XelPay\'s comprehensive Privacy Policy. Learn what data we collect, how it\'s secured with AES-256, AML retention rules, and your data rights. Compliant with Bangladesh Digital Security Act 2018, BFIU guidelines, and GDPR principles.',
  keywords: [
    'XelPay privacy policy',
    'XelPay data protection',
    'payment gateway Bangladesh privacy',
    'bKash data security policy',
    'GDPR compliant Bangladesh payment',
    'XelPay BFIU AML compliance',
    'payment gateway data protection Bangladesh',
  ],
  alternates: {
    canonical: 'https://www.xelpay.site/info/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — XelPay',
    description:
      'How XelPay collects, uses, and protects your data. AES-256 encryption. Bangladesh Digital Security Act 2018 & GDPR compliant.',
    url: 'https://www.xelpay.site/info/privacy',
    siteName: 'XelPay',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy — XelPay',
    description:
      'XelPay data protection policy. AES-256 encryption. Bangladesh Digital Security Act 2018 compliant.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


// ── src/app/pay/[order_id]/layout.tsx  (NEW FILE) ─────────────────────────────
// Checkout pages must NEVER be indexed by Google — private session pages

/*
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout — XelPay',
  description: 'Complete your payment securely via XelPay.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
*/


// ── src/app/[merchant_slug]/[payment_id]/layout.tsx  (NEW FILE) ───────────────
// Merchant payment link — session-specific, never index

/*
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Payment — XelPay',
  description: 'Complete your payment securely via XelPay merchant checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MerchantPayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
*/


// ── src/app/auth/callback/layout.tsx  (NEW FILE) ──────────────────────────────
// Auth callback — never index

/*
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authenticating — XelPay',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
*/


// ── src/app/auth/no-merchant/layout.tsx  (NEW FILE) ───────────────────────────

/*
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup Incomplete — XelPay',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NoMerchantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
*/


// ── src/app/auth/force-signout/layout.tsx  (NEW FILE) ─────────────────────────

/*
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signing Out — XelPay',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForceSignoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
*/