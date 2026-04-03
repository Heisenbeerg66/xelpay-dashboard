import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // গুগলে www সহ ইনডেক্সড তাই metadataBase আপডেট করা হয়েছে
  metadataBase: new URL('https://www.xelpay.site'),
  title: {
    default: "XelPay - Automated Payment Gateway Bangladesh",
    template: "%s | XelPay"
  },
  description: "Automate your personal bKash, Nagad, and Rocket payments instantly with XelPay. The most secure and zero-commission payment automation gateway in Bangladesh.",
  keywords: ["XelPay", "Payment Gateway Bangladesh", "bKash Automation", "Nagad Automation", "Automated Payment Verification", "Rocket Payment Gateway", "Payment Automation Solutions"],
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