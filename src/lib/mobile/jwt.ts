// ============================================================
// src/lib/mobile/jwt.ts
// Mobile-specific JWT service — separate from web auth JWTs
// ============================================================

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { MobileTokenPayload, ConnectionType } from '@/types/mobile';

const MOBILE_JWT_SECRET = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET!
);

const ACCESS_TOKEN_TTL = '24h';
const REFRESH_TOKEN_TTL = '30d';

// ─── Generate access token ───────────────────────────────────

export async function generateMobileAccessToken(
  payload: Omit<MobileTokenPayload, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setIssuer('xelpay-mobile')
    .setSubject(payload.device_id)
    .sign(MOBILE_JWT_SECRET);
}

// ─── Generate refresh token ──────────────────────────────────

export async function generateMobileRefreshToken(
  deviceId: string
): Promise<string> {
  return new SignJWT({ device_id: deviceId, type: 'refresh' } as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .setIssuer('xelpay-mobile')
    .sign(MOBILE_JWT_SECRET);
}

// ─── Verify access token ─────────────────────────────────────

export async function verifyMobileToken(
  token: string
): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, MOBILE_JWT_SECRET, {
      issuer: 'xelpay-mobile',
    });

    return {
      device_id: payload.device_id as string,
      merchant_id: payload.merchant_id as string | null,
      business_id: payload.business_id as string | null,
      connection_type: payload.connection_type as ConnectionType,
      device_fingerprint: payload.device_fingerprint as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

// ─── Verify refresh token ────────────────────────────────────

export async function verifyMobileRefreshToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, MOBILE_JWT_SECRET, {
      issuer: 'xelpay-mobile',
    });

    if (payload.type !== 'refresh') return null;
    return payload.device_id as string;
  } catch {
    return null;
  }
}

// ─── Extract token from Authorization header ─────────────────

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}
