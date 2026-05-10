// PATH: /app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // গুগলে www সহ ইনডেক্সড তাই metadataBase আপডেট করা হয়েছে
  metadataBase: new URL('https://www.xelpay.site'),
  title: {
    default: "XelPay - Automated Payment Gateway Bangladesh",
    template: "%s | XelPay"
  },
  description: "Automate your bKash, Nagad, Rocket, Upay, Cellfin, Pathao Pay, Bank, and Crypto payments instantly with XelPay. The most secure, zero-commission payment automation API in Bangladesh.",
  keywords: [
     'automated payment gateway Bangladesh',
    'payment automation platform BD',
    'bKash payment automation',
    'bKash auto verification',
    'bKash personal automation',
    'Nagad payment gateway API',
    'Nagad personal automation',
    'Rocket automated payment',
    'Rocket personal automation',
    'Upay webhook integration',
    'Cellfin payment automation',
    'Pathao Pay verification API',
    'Bank payment automation Bangladesh',
    'Crypto payment gateway BD',
    'cryptocurrency auto payment',
    'mobile banking automation',
    'zero commission payment gateway',
    'zero hidden fee payment API',
    'instant payment verification BD',
    'payment gateway for developers',
    'payment link generator Bangladesh',
    'e-commerce payment solution Bangladesh',
    'secure payment gateway BD',
    'bKash merchant API',
    'XelPay API integration',
    'best payment gateway Bangladesh',
    'Uddoktapay alternative',
    'ZiniPay alternative',
    'shurjopay alternative',
    'SSLCommerz alternative',
    'AamarPay alternative',
    'Paystation alternative',
    'Stripe alternative Bangladesh',
    'Binance payment alternative BD',
    'XelPay'
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", rel: "icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    // সার্চ কনসোলে www ভার্সনটি ইনডেক্সড তাই এখানেও www সেট করা হলো
    canonical: 'https://www.xelpay.site',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.xelpay.site',
    siteName: 'XelPay Technologies',
    title: 'XelPay — Automated Payment Gateway Bangladesh',
    description: 'Automate bKash, Nagad, Rocket, Bank & Crypto payments instantly. Zero commission webhook API.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XelPay Payment Automation',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300`}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}