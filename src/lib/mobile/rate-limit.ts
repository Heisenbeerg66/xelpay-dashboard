// ============================================================
// src/lib/mobile/rate-limit.ts
// Simple sliding-window rate limiter
// For production: replace with Redis (Upstash or ioredis)
// ============================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (per serverless instance)
// In production: use Upstash Redis or similar
const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check if a key is within the rate limit.
 * @param key - e.g. `connect:${ip}` or `sms-sync:${device_id}`
 * @param maxRequests - max allowed in the window
 * @param windowMs - window size in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetMs: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: entry.windowStart + windowMs,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetMs: entry.windowStart + windowMs,
  };
}

// ─── Pre-defined limiters ────────────────────────────────────

export const LIMITS = {
  // Device connect: 10 attempts per 15 min per IP
  DEVICE_CONNECT: { max: 10, windowMs: 15 * 60 * 1000 },
  // SMS sync: 120 requests per minute per device
  SMS_SYNC: { max: 120, windowMs: 60 * 1000 },
  // Heartbeat: 60 per minute per device
  HEARTBEAT: { max: 60, windowMs: 60 * 1000 },
  // Balance update: 30 per minute per device
  BALANCE: { max: 30, windowMs: 60 * 1000 },
  // Logs: 20 per minute per device
  LOGS: { max: 20, windowMs: 60 * 1000 },
} as const;
