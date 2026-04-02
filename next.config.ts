import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // এই headers ফাংশনটি পুরো সাইটের গ্লোবাল সিকিউরিটি মেইনটেইন করবে
  async headers() {
    return [
      {
        source: "/(.*)", // /(.*) মানে হলো সাইটের প্রতিটি পেজ এবং রাউটের জন্য
        headers: [
          {
            key: "Content-Security-Policy",
            // এখানে Vercel, Supabase এবং reCAPTCHA এর জন্য পারমিশন দেওয়া হয়েছে
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com; frame-src 'self' https://www.google.com/recaptcha/;"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff" // ব্রাউজারকে ভুল ফাইল টাইপ রান করা থেকে বিরত রাখবে
          },
          {
            key: "X-Frame-Options",
            value: "DENY" // আপনার সাইটকে অন্য কেউ iFrame এর ভেতর দেখাতে পারবে না (Clickjacking প্রোটেকশন)
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block" // পুরনো ব্রাউজারে ক্রস-সাইট স্ক্রিপ্টিং অ্যাটাক ঠেকাবে
          }
        ]
      }
    ];
  },
};

export default nextConfig;