import { MetadataRoute } from "next";

// Vercel env থেকে লিংক নিবে, না পেলে ডিফল্ট হিসেবে আপনার ডোমেইন নিবে
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://xelpay.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ─── Home ────────────────────────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ─── Core Auth Pages ─────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/reset-password`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },

    // ─── Auth Flow / Callback Pages ──────────────────────────────────────────
    {
      url: `${BASE_URL}/auth/verify-success`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // ─── Legal / Info Pages ───────────────────────────────────────────────────
    {
      url: `${BASE_URL}/info/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/info/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}