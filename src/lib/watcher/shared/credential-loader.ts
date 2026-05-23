// src/lib/watcher/shared/credential-loader.ts
// Fetches IMAP and Binance credentials from:
//   - merchant_payment_vault (vault source)
//   - business_gateways (business source)
// Decrypts passwords/API keys using the same AES-256 key as vault_actions.ts

import { getDb, decryptData } from './db';
import { log } from './logger';
import type { GatewayCredentials, WatcherType } from '@/types/watcher';

// ─── Load all IMAP credentials ───────────────────────────────

export async function loadAllImapCredentials(): Promise<GatewayCredentials[]> {
  const db = getDb();
  const results: GatewayCredentials[] = [];

  // 1. From merchant_payment_vault
  const { data: vaultRows, error: vaultErr } = await db
    .from('merchant_payment_vault')
    .select(`
      id, merchant_id, provider,
      imap_email, imap_password, imap_bank_email
    `)
    .not('imap_email', 'is', null)
    .not('imap_password', 'is', null);

  if (vaultErr) {
    await log.error({ error_message: 'Failed to load vault IMAP credentials', error_code: 'DECRYPT_ERROR', context: { error: vaultErr.message } });
  } else {
    for (const row of vaultRows ?? []) {
      const decryptedPassword = decryptData(row.imap_password);
      if (!decryptedPassword) {
        await log.warn({ error_message: `Could not decrypt IMAP password for vault gateway ${row.id}`, gateway_id: row.id, error_code: 'DECRYPT_ERROR' });
        continue;
      }
      results.push({
        id: row.id,
        merchant_id: row.merchant_id,
        business_id: null,
        gateway_source: 'vault',
        provider: row.provider,
        imap_email: row.imap_email,
        imap_password: decryptedPassword,
        imap_bank_email: row.imap_bank_email ?? undefined,
      });
    }
  }

  // 2. From business_gateways (joined with businesses for merchant_id)
  const { data: bizRows, error: bizErr } = await db
    .from('business_gateways')
    .select(`
      id, business_id, provider,
      imap_email, imap_password, imap_bank_email,
      businesses!inner ( merchant_id )
    `)
    .not('imap_email', 'is', null)
    .not('imap_password', 'is', null);

  if (bizErr) {
    await log.error({ error_message: 'Failed to load business IMAP credentials', error_code: 'DECRYPT_ERROR', context: { error: bizErr.message } });
  } else {
    for (const row of bizRows ?? []) {
      const decryptedPassword = decryptData(row.imap_password);
      if (!decryptedPassword) {
        await log.warn({ error_message: `Could not decrypt IMAP password for business gateway ${row.id}`, gateway_id: row.id, error_code: 'DECRYPT_ERROR' });
        continue;
      }
      const merchantId = (row.businesses as { merchant_id: string }).merchant_id;
      results.push({
        id: row.id,
        merchant_id: merchantId,
        business_id: row.business_id,
        gateway_source: 'business',
        provider: row.provider,
        imap_email: row.imap_email,
        imap_password: decryptedPassword,
        imap_bank_email: row.imap_bank_email ?? undefined,
      });
    }
  }

  return results;
}

// ─── Load all Binance credentials ────────────────────────────

export async function loadAllBinanceCredentials(): Promise<GatewayCredentials[]> {
  const db = getDb();
  const results: GatewayCredentials[] = [];

  // 1. From merchant_payment_vault
  const { data: vaultRows, error: vaultErr } = await db
    .from('merchant_payment_vault')
    .select('id, merchant_id, provider, api_key, secret_key')
    .not('api_key', 'is', null)
    .not('secret_key', 'is', null)
    .ilike('provider', '%binance%');

  if (vaultErr) {
    await log.error({ error_message: 'Failed to load vault Binance credentials', error_code: 'DECRYPT_ERROR', context: { error: vaultErr.message } });
  } else {
    for (const row of vaultRows ?? []) {
      const apiKey = decryptData(row.api_key);
      const secretKey = decryptData(row.secret_key);
      if (!apiKey || !secretKey) {
        await log.warn({ error_message: `Could not decrypt Binance credentials for vault gateway ${row.id}`, gateway_id: row.id, error_code: 'DECRYPT_ERROR' });
        continue;
      }
      results.push({
        id: row.id,
        merchant_id: row.merchant_id,
        business_id: null,
        gateway_source: 'vault',
        provider: row.provider,
        api_key: apiKey,
        secret_key: secretKey,
      });
    }
  }

  // 2. From business_gateways
  const { data: bizRows, error: bizErr } = await db
    .from('business_gateways')
    .select(`
      id, business_id, provider, api_key, secret_key,
      businesses!inner ( merchant_id )
    `)
    .not('api_key', 'is', null)
    .not('secret_key', 'is', null)
    .ilike('provider', '%binance%');

  if (bizErr) {
    await log.error({ error_message: 'Failed to load business Binance credentials', error_code: 'DECRYPT_ERROR', context: { error: bizErr.message } });
  } else {
    for (const row of bizRows ?? []) {
      const apiKey = decryptData(row.api_key);
      const secretKey = decryptData(row.secret_key);
      if (!apiKey || !secretKey) {
        await log.warn({ error_message: `Could not decrypt Binance credentials for business gateway ${row.id}`, gateway_id: row.id, error_code: 'DECRYPT_ERROR' });
        continue;
      }
      const merchantId = (row.businesses as { merchant_id: string }).merchant_id;
      results.push({
        id: row.id,
        merchant_id: merchantId,
        business_id: row.business_id,
        gateway_source: 'business',
        provider: row.provider,
        api_key: apiKey,
        secret_key: secretKey,
      });
    }
  }

  return results;
}

// ─── Get single gateway credentials by ID ────────────────────

export async function getGatewayCredentials(
  gatewayId: string,
  gatewaySource: 'vault' | 'business',
  watcherType: WatcherType
): Promise<GatewayCredentials | null> {
  if (watcherType === 'imap') {
    const all = await loadAllImapCredentials();
    return all.find((c) => c.id === gatewayId && c.gateway_source === gatewaySource) ?? null;
  } else {
    const all = await loadAllBinanceCredentials();
    return all.find((c) => c.id === gatewayId && c.gateway_source === gatewaySource) ?? null;
  }
}
