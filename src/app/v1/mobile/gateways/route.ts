// ============================================================
// src/app/api/mobile/gateways/route.ts
// GET — Fetch active payment gateways for the connected device
// Returns only SMS-capable providers that are active
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getActiveGatewaysForDevice } from '@/lib/mobile/gateway-service';

async function handler(req: NextRequest, ctx: AuthContext) {
  try {
    const { gateways, activeProviders } = await getActiveGatewaysForDevice(ctx);

    // Strip sensitive fields before returning to mobile
    const sanitizedGateways = gateways.map((g) => ({
      id: g.id,
      provider: g.provider,
      display_name: g.display_name,
      account_number: g.account_number,
      account_name: g.account_name,
      account_type: g.account_type,
      is_active: g.is_active,
      category: g.category,
      // Never expose: api_key, secret_key, imap_password
    }));

    return NextResponse.json({
      success: true,
      gateways: sanitizedGateways,
      active_providers: activeProviders,
      total: sanitizedGateways.length,
    });
  } catch (err) {
    console.error('[gateways] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch gateways.' },
      { status: 500 }
    );
  }
}

export const GET = withMobileAuth(handler);
