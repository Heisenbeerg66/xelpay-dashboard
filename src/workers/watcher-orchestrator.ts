// src/workers/watcher-orchestrator.ts
// Main orchestrator process.
// - Loads all gateway credentials from DB
// - Starts one ImapWatcher per IMAP gateway
// - Starts one BinanceWatcher per Binance gateway
// - Polls DB for new gateways every 60 seconds
// - Handles graceful shutdown on SIGTERM/SIGINT
//
// Run: npx tsx src/workers/watcher-orchestrator.ts

import 'dotenv/config';
import { getDb } from '../lib/watcher/shared/db';
import { log } from '../lib/watcher/shared/logger';
import {
  loadAllImapCredentials,
  loadAllBinanceCredentials,
} from '../lib/watcher/shared/credential-loader';
import { ImapWatcher } from '../lib/watcher/imap/imap-watcher';
import { BinanceWatcher } from '../lib/watcher/binance/binance-watcher';
import type { GatewayCredentials } from '../types/watcher';

// ─── Active watcher instances ─────────────────────────────────
const imapWatchers  = new Map<string, ImapWatcher>();    // key = gateway_id
const binanceWatchers = new Map<string, BinanceWatcher>();

let pollingInterval: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 60_000; // Check for new gateways every 60s

// ─── Main entry ──────────────────────────────────────────────
async function main() {
  console.log('🚀 XelPay Watcher Orchestrator starting...');
  console.log(`   IMAP + Binance persistent connection manager`);
  console.log(`   DB: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  // Initial watcher load
  await syncWatchers();

  // Periodic sync to pick up new gateways
  pollingInterval = setInterval(syncWatchers, POLL_INTERVAL_MS);

  console.log('✅ Watcher orchestrator running. Press Ctrl+C to stop.\n');

  // Graceful shutdown
  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
}

// ─── Sync: load credentials, start/stop watchers as needed ───
async function syncWatchers(): Promise<void> {
  try {
    await syncImapWatchers();
    await syncBinanceWatchers();
  } catch (err: unknown) {
    const error = err as Error;
    await log.error({ error_message: `Orchestrator sync error: ${error.message}`, error_stack: error.stack });
  }
}

async function syncImapWatchers(): Promise<void> {
  const credentials = await loadAllImapCredentials();
  const activeGatewayIds = new Set(credentials.map((c) => c.id));

  // Stop watchers for gateways that no longer have IMAP creds
  for (const [gatewayId, watcher] of imapWatchers) {
    if (!activeGatewayIds.has(gatewayId)) {
      console.log(`🔴 Stopping IMAP watcher: ${gatewayId}`);
      await watcher.stop();
      imapWatchers.delete(gatewayId);
    }
  }

  // Start new watchers
  for (const cred of credentials) {
    if (imapWatchers.has(cred.id)) continue; // Already running

    // Check if disabled in watcher_connections
    const watcherRow = await getWatcherRow(cred.id, 'imap');
    if (watcherRow && !watcherRow.is_enabled) {
      console.log(`⏸️  IMAP watcher disabled: ${cred.imap_email}`);
      continue;
    }

    const watcherId = watcherRow?.id ?? cred.id;
    console.log(`🟢 Starting IMAP watcher: ${cred.imap_email} (${cred.gateway_source})`);

    // Register in watcher_connections if not yet
    const registeredId = await ensureWatcherRegistered(cred, 'imap');

    const watcher = new ImapWatcher(registeredId, cred);
    imapWatchers.set(cred.id, watcher);
    watcher.start().catch(async (err: Error) => {
      await log.fatal({
        watcher_id: registeredId,
        merchant_id: cred.merchant_id,
        gateway_id: cred.id,
        watcher_type: 'imap',
        error_message: `ImapWatcher crashed: ${err.message}`,
        error_stack: err.stack,
      });
      imapWatchers.delete(cred.id);
    });
  }

  console.log(`📬 IMAP watchers active: ${imapWatchers.size}`);
}

async function syncBinanceWatchers(): Promise<void> {
  const credentials = await loadAllBinanceCredentials();
  const activeGatewayIds = new Set(credentials.map((c) => c.id));

  // Stop removed
  for (const [gatewayId, watcher] of binanceWatchers) {
    if (!activeGatewayIds.has(gatewayId)) {
      console.log(`🔴 Stopping Binance watcher: ${gatewayId}`);
      await watcher.stop();
      binanceWatchers.delete(gatewayId);
    }
  }

  // Start new
  for (const cred of credentials) {
    if (binanceWatchers.has(cred.id)) continue;

    const watcherRow = await getWatcherRow(cred.id, 'binance');
    if (watcherRow && !watcherRow.is_enabled) {
      console.log(`⏸️  Binance watcher disabled: ${cred.id}`);
      continue;
    }

    console.log(`🟢 Starting Binance watcher: ${cred.id} (${cred.gateway_source})`);
    const registeredId = await ensureWatcherRegistered(cred, 'binance');

    const watcher = new BinanceWatcher(registeredId, cred);
    binanceWatchers.set(cred.id, watcher);
    watcher.start().catch(async (err: Error) => {
      await log.fatal({
        watcher_id: registeredId,
        merchant_id: cred.merchant_id,
        gateway_id: cred.id,
        watcher_type: 'binance',
        error_message: `BinanceWatcher crashed: ${err.message}`,
        error_stack: err.stack,
      });
      binanceWatchers.delete(cred.id);
    });
  }

  console.log(`₿  Binance watchers active: ${binanceWatchers.size}`);
}

// ─── Ensure gateway is registered in watcher_connections ─────
async function ensureWatcherRegistered(
  cred: GatewayCredentials,
  type: 'imap' | 'binance'
): Promise<string> {
  const db = getDb();
  const { data: existing } = await db
    .from('watcher_connections')
    .select('id')
    .eq('gateway_id', cred.id)
    .eq('watcher_type', type)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inserted } = await db
    .from('watcher_connections')
    .insert({
      merchant_id:   cred.merchant_id,
      business_id:   cred.business_id,
      gateway_id:    cred.id,
      gateway_source: cred.gateway_source,
      watcher_type:  type,
      is_enabled:    true,
    })
    .select('id')
    .single();

  return inserted?.id ?? cred.id;
}

// ─── Get watcher row from DB ──────────────────────────────────
async function getWatcherRow(gatewayId: string, type: 'imap' | 'binance') {
  const db = getDb();
  const { data } = await db
    .from('watcher_connections')
    .select('id, is_enabled')
    .eq('gateway_id', gatewayId)
    .eq('watcher_type', type)
    .maybeSingle();
  return data;
}

// ─── Graceful shutdown ────────────────────────────────────────
async function shutdown(): Promise<void> {
  console.log('\n⏹️  Shutting down watcher orchestrator...');

  if (pollingInterval) clearInterval(pollingInterval);

  const stopAll = [
    ...Array.from(imapWatchers.values()).map((w) => w.stop()),
    ...Array.from(binanceWatchers.values()).map((w) => w.stop()),
  ];

  await Promise.allSettled(stopAll);
  console.log('✅ All watchers stopped. Goodbye.');
  process.exit(0);
}

// ─── Run ─────────────────────────────────────────────────────
main().catch(async (err) => {
  console.error('❌ Fatal orchestrator error:', err);
  await log.fatal({ error_message: `Orchestrator boot failed: ${err.message}`, error_stack: err.stack });
  process.exit(1);
});
