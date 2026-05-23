// ============================================================
// src/app/api/mobile/config/route.ts
// GET — Returns app configuration for the connected device
//       Active providers, sync intervals, sender whitelist etc.
//       App uses this on launch to configure SMS filter rules.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getActiveGatewaysForDevice, SMS_PROVIDERS } from '@/lib/mobile/gateway-service';
import type { MobileConfig } from '@/types/mobile';

// ─── Known authorized SMS sender IDs per provider ────────────
// The mobile app uses this to pre-filter at broadcast receiver level
const SENDER_WHITELIST: Record<string, string[]> = {
  bKash: ['bKash', '01847-102102', 'bKashAlert', '01755-500500'],
  Nagad: ['Nagad', 'Nagad-OTP', '01709-247901'],
  Rocket: ['Rocket', '01779-036666', 'DutchBangla'],
  Upay: ['Upay', '01521-111777', 'UCBUpay'],
  Bank: [
    'DBBL', 'BRAC', 'EBL', 'UCB', 'MTB', 'IFIC',
    'CITY', 'SEBL', 'NCCBL', 'PREMIER', 'EXIM',
    'ISLAMI', 'SIBL', 'PUBALI', 'JANATA', 'SONALI',
    'AGRANI', 'RUPALI', 'BDBL', 'BASIC', 'BKB',
    'RAKUB', 'PKSF', 'SBAC', 'AB-BANK', 'NBL',
  ],
};

async function handler(req: NextRequest, ctx: AuthContext) {
  const { activeProviders } = await getActiveGatewaysForDevice(ctx);

  // Build sender whitelist for only active providers
  const activeSenders: Record<string, string[]> = {};
  const effectiveProviders =
    activeProviders.length > 0 ? activeProviders : SMS_PROVIDERS;

  for (const provider of effectiveProviders) {
    const senders = SENDER_WHITELIST[provider] ?? [];
    if (senders.length > 0) {
      activeSenders[provider] = senders;
    }
  }

  const config: MobileConfig = {
    sync_interval_minutes: 1,
    max_retry_attempts: 3,
    active_providers: effectiveProviders,
    sms_filter_senders: activeSenders,
    request_timeout_ms: 30_000,
    max_batch_size: 100,
  };

  return NextResponse.json({
    success: true,
    config,
    server_time: new Date().toISOString(),
  });
}

export const GET = withMobileAuth(handler);
