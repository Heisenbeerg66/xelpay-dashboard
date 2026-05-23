// ============================================================
// src/lib/mobile/gateway-service.ts
// Fetches active gateways / providers for a connected device.
// Supports both merchant (merchants_gateways) and
// business (business_gateways) gateway tables.
// ============================================================

import { getMobileDb } from './db';
import type { MobileGateway } from '@/types/mobile';
import type { AuthContext } from './auth-middleware';

// ─── SMS-capable providers ───────────────────────────────────
export const SMS_PROVIDERS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Bank'];

// ─── Fetch active gateways for device ────────────────────────

export async function getActiveGatewaysForDevice(
  ctx: AuthContext
): Promise<{ gateways: MobileGateway[]; activeProviders: string[] }> {
  const db = getMobileDb();

  if (ctx.connection_type === 'merchant') {
    return getMerchantGateways(db, ctx.merchant_id!);
  } else {
    return getBusinessGateways(db, ctx.business_id!);
  }
}

// ─── Merchant gateways (merchants_gateways table) ────────────

async function getMerchantGateways(
  db: ReturnType<typeof getMobileDb>,
  merchantId: string
): Promise<{ gateways: MobileGateway[]; activeProviders: string[] }> {
  const { data, error } = await db
    .from('merchants_gateways')
    .select(`
      id,
      method_id,
      parent_method,
      wallet_number,
      account_name,
      is_active,
      method_category,
      min_amount,
      max_amount
    `)
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .in('parent_method', SMS_PROVIDERS);

  if (error || !data) return { gateways: [], activeProviders: [] };

  const gateways: MobileGateway[] = data.map((g) => ({
    id: g.id,
    provider: g.parent_method,
    display_name: g.method_id,
    account_number: g.wallet_number ?? '',
    account_name: g.account_name ?? undefined,
    account_type: g.method_category,
    is_active: g.is_active,
    category: g.method_category ?? 'mobile',
  }));

  const activeProviders = [...new Set(data.map((g) => g.parent_method))];
  return { gateways, activeProviders };
}

// ─── Business gateways (business_gateways table) ─────────────

async function getBusinessGateways(
  db: ReturnType<typeof getMobileDb>,
  businessId: string
): Promise<{ gateways: MobileGateway[]; activeProviders: string[] }> {
  const { data, error } = await db
    .from('business_gateways')
    .select(`
      id,
      provider,
      display_name,
      account_number,
      account_name,
      account_type,
      is_active,
      category
    `)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .in('provider', SMS_PROVIDERS);

  if (error || !data) return { gateways: [], activeProviders: [] };

  const gateways: MobileGateway[] = data.map((g) => ({
    id: g.id,
    provider: g.provider ?? '',
    display_name: g.display_name,
    account_number: g.account_number ?? '',
    account_name: g.account_name ?? undefined,
    account_type: g.account_type ?? undefined,
    is_active: g.is_active ?? true,
    category: g.category ?? 'mobile',
  }));

  const activeProviders = [
    ...new Set(data.map((g) => g.provider).filter(Boolean) as string[]),
  ];
  return { gateways, activeProviders };
}

// ─── Check if a provider is active for a device ──────────────

export async function isProviderActive(
  ctx: AuthContext,
  provider: string
): Promise<boolean> {
  const { activeProviders } = await getActiveGatewaysForDevice(ctx);
  return activeProviders.some(
    (p) => p.toLowerCase() === provider.toLowerCase()
  );
}
