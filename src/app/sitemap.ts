import { MetadataRoute } from "next";

// Vercel env থেকে লিংক নিবে, না পেলে ডিফল্ট হিসেবে আপনার ডোমেইন নিবে
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.xelpay.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ─── Home ─────────────────────────────────────────────────────────────────
    // Most important page — highest priority, crawled weekly
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ─── Core Auth Pages ──────────────────────────────────────────────────────
    // Login/signup are high-value conversion pages — keep priority high
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
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/reset-password`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // ─── Auth Flow / Utility Pages ────────────────────────────────────────────
    // These pages are part of auth flow — low SEO value, keep low priority
    {
      url: `${BASE_URL}/auth/verify-success`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },

    // ─── Legal / Policy Pages ─────────────────────────────────────────────────
    // Required for trust signals & E-E-A-T (Expertise, Authoritativeness, Trust)
    {
      url: `${BASE_URL}/info/privacy`,
      lastModified: new Date("2026-04-01"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/info/terms`,
      lastModified: new Date("2026-04-01"),
      changeFrequency: "yearly",
      priority: 0.5,
    },

    // ─── About & Company Pages ────────────────────────────────────────────────
    // Great for brand recognition & E-E-A-T
    {
      url: `${BASE_URL}/info/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/info/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // ─── Developer / Product Pages ────────────────────────────────────────────
    // Highly valuable for organic SEO — developers search for these
    {
      url: `${BASE_URL}/info/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/info/api-reference`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // ─── Plugin / Integration Pages ───────────────────────────────────────────
    // Searchable by WooCommerce/Shopify users — good organic traffic
    {
      url: `${BASE_URL}/info/plugins`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // ─── Support / Help Pages ─────────────────────────────────────────────────
    // Users actively search for support — important for brand trust
    {
      url: `${BASE_URL}/info/ticket`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // ─── Revenue / Growth Pages ───────────────────────────────────────────────
    // Affiliate & reseller pages attract business-minded searchers
    {
      url: `${BASE_URL}/info/affiliate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/info/reseller`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // ─── Status Page ──────────────────────────────────────────────────────────
    // Searched during outages — good for trust signals
    {
      url: `${BASE_URL}/info/status`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];
}