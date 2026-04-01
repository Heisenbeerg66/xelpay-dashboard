import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://xelpay.site'),
  title: {
    default: "XelPay | Automated Payment Gateway Bangladesh",
    template: "%s | XelPay"
  },
  description: "Automate your personal bKash, Nagad, and Rocket payments instantly with XelPay. The most secure payment automation gateway in Bangladesh.",
  keywords: ["XelPay", "Payment Gateway Bangladesh", "bKash Automation", "Nagad Automation", "Automated Payment Verification", "Rocket Payment Gateway"],
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
    canonical: 'https://xelpay.site',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://xelpay.site',
    siteName: 'XelPay Technologies',
    images: [
      {
        url: '/og-image.png', // আপনার পাবলিক ফোল্ডারে একটি ইমেজ থাকলে তার নাম দিন
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
    <html lang="en" suppressHydrationWarning>
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