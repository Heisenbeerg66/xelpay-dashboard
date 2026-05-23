// src/lib/watcher/binance/binance-watcher.ts
// Maintains a persistent Binance User Data Stream WebSocket.
// Flow:
//   1. Create listenKey via REST API
//   2. Connect WebSocket wss://stream.binance.com:9443/ws/<listenKey>
//   3. On each event → parse → store to binance_transactions
//   4. Keep-alive: PUT /api/v3/userDataStream every 30 min
//   5. Reconnect with backoff on disconnect

import WebSocket from 'ws';
import crypto from 'crypto';
import { getDb } from '../shared/db';
import { log } from '../shared/logger';
import type { GatewayCredentials } from '@/types/watcher';
import type { ParsedBinanceTransaction } from '@/types/watcher';

const BINANCE_API_URL   = 'https://api.binance.com';
const BINANCE_WS_URL    = 'wss://stream.binance.com:9443/ws';
const KEEPALIVE_MS      = 30 * 60 * 1000;  // 30 min
const RECONNECT_BASE_MS = 5_000;
const RECONNECT_MAX_MS  = 600_000;         // 10 min

export class BinanceWatcher {
  private watcherId: string;
  private credentials: GatewayCredentials;
  private ws: WebSocket | null = null;
  private listenKey: string | null = null;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private reconnectAttempts = 0;

  constructor(watcherId: string, credentials: GatewayCredentials) {
    this.watcherId = watcherId;
    this.credentials = credentials;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    await this.connect();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.clearTimers();
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
    if (this.listenKey) {
      await this.deleteListenKey(this.listenKey).catch(() => {});
      this.listenKey = null;
    }
    await this.updateConnectionState(false);
  }

  // ── Connect flow ─────────────────────────────────────────────
  private async connect(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // 1. Get listen key
      this.listenKey = await this.createListenKey();

      await log.info({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'binance',
        error_message: 'Binance listen key created, connecting WebSocket...',
      });

      // 2. Connect WebSocket
      this.ws = new WebSocket(`${BINANCE_WS_URL}/${this.listenKey}`);

      this.ws.on('open', async () => {
        this.reconnectAttempts = 0;
        await this.updateConnectionState(true);
        await log.info({
          watcher_id: this.watcherId,
          merchant_id: this.credentials.merchant_id,
          gateway_id: this.credentials.id,
          watcher_type: 'binance',
          error_message: 'Binance WebSocket connected',
        });
        this.startKeepAlive();
      });

      this.ws.on('message', async (data: WebSocket.RawData) => {
        try {
          const event = JSON.parse(data.toString()) as Record<string, unknown>;
          await this.handleEvent(event);
        } catch (err: unknown) {
          const error = err as Error;
          await log.warn({
            watcher_id: this.watcherId,
            merchant_id: this.credentials.merchant_id,
            gateway_id: this.credentials.id,
            watcher_type: 'binance',
            error_message: `Event parse error: ${error.message}`,
          });
        }
      });

      this.ws.on('error', async (err: Error) => {
        await log.error({
          watcher_id: this.watcherId,
          merchant_id: this.credentials.merchant_id,
          gateway_id: this.credentials.id,
          watcher_type: 'binance',
          error_code: 'WEBSOCKET_ERROR',
          error_message: err.message,
        });
      });

      this.ws.on('close', async (code: number, reason: Buffer) => {
        this.stopKeepAlive();
        if (this.isRunning) {
          await log.warn({
            watcher_id: this.watcherId,
            merchant_id: this.credentials.merchant_id,
            gateway_id: this.credentials.id,
            watcher_type: 'binance',
            error_message: `WebSocket closed: code=${code} reason=${reason.toString()}`,
          });
          await this.updateConnectionState(false);
          await this.scheduleReconnect();
        }
      });

    } catch (err: unknown) {
      const error = err as Error;
      const isAuth = error.message?.includes('401') || error.message?.toLowerCase().includes('auth');
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'binance',
        error_code: isAuth ? 'AUTH_FAILED' : 'CONNECTION_REFUSED',
        error_message: error.message,
      });
      await this.updateConnectionState(false, error.message);
      await this.scheduleReconnect();
    }
  }

  // ── Handle incoming Binance WebSocket event ──────────────────
  private async handleEvent(event: Record<string, unknown>): Promise<void> {
    const eventType = event.e as string;

    // Only process trade/order execution events
    const supportedEvents = ['executionReport', 'outboundAccountPosition', 'balanceUpdate'];
    if (!supportedEvents.includes(eventType)) return;

    const txn = parseBinanceEvent(event);
    if (!txn) return;

    const db = getDb();

    // Duplicate check
    if (txn.binance_order_id || txn.binance_trx_id) {
      const { data: existing } = await db
        .from('binance_transactions')
        .select('id')
        .eq('gateway_id', this.credentials.id)
        .eq('binance_order_id', txn.binance_order_id ?? '')
        .eq('binance_trx_id', txn.binance_trx_id ?? '')
        .maybeSingle();

      if (existing) return; // Already processed
    }

    // Store to DB
    const { error: insertErr } = await db.from('binance_transactions').insert({
      merchant_id:      this.credentials.merchant_id,
      business_id:      this.credentials.business_id,
      gateway_id:       this.credentials.id,
      gateway_source:   this.credentials.gateway_source,
      binance_order_id: txn.binance_order_id,
      binance_trx_id:   txn.binance_trx_id,
      client_order_id:  txn.client_order_id,
      asset:            txn.asset,
      symbol:           txn.symbol,
      side:             txn.side,
      order_type:       txn.order_type,
      order_status:     txn.order_status,
      quantity:         txn.quantity,
      price:            txn.price,
      amount_usdt:      txn.amount_usdt,
      commission:       txn.commission,
      commission_asset: txn.commission_asset,
      wallet_address:   txn.wallet_address,
      network:          txn.network,
      event_type:       txn.event_type,
      raw_payload:      txn.raw_payload,
      event_time:       txn.event_time?.toISOString(),
      transaction_time: txn.transaction_time?.toISOString(),
      status:           'received',
    });

    if (insertErr && insertErr.code !== '23505') {
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'binance',
        error_code: 'PARSE_ERROR',
        error_message: `DB insert failed: ${insertErr.message}`,
        context: { event_type: eventType },
      });
      return;
    }

    await this.updateStats(1);

    await log.info({
      watcher_id: this.watcherId,
      merchant_id: this.credentials.merchant_id,
      gateway_id: this.credentials.id,
      watcher_type: 'binance',
      error_message: `Binance ${eventType}: ${txn.side} ${txn.quantity} ${txn.asset} @ ${txn.price}`,
    });
  }

  // ── Keep-alive: PUT /userDataStream every 30 min ─────────────
  private startKeepAlive(): void {
    this.keepAliveTimer = setInterval(async () => {
      if (!this.listenKey) return;
      try {
        await this.putListenKey(this.listenKey);
      } catch (err: unknown) {
        const error = err as Error;
        await log.warn({
          watcher_id: this.watcherId,
          merchant_id: this.credentials.merchant_id,
          gateway_id: this.credentials.id,
          watcher_type: 'binance',
          error_message: `Keep-alive failed: ${error.message}`,
        });
      }
    }, KEEPALIVE_MS);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  // ── Binance REST: Create listen key ──────────────────────────
  private async createListenKey(): Promise<string> {
    const res = await fetch(`${BINANCE_API_URL}/api/v3/userDataStream`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.credentials.api_key!,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Binance listen key creation failed: ${res.status} ${body}`);
    }

    const data = await res.json() as { listenKey: string };
    return data.listenKey;
  }

  // ── Binance REST: Keep-alive PUT ─────────────────────────────
  private async putListenKey(listenKey: string): Promise<void> {
    await fetch(`${BINANCE_API_URL}/api/v3/userDataStream?listenKey=${listenKey}`, {
      method: 'PUT',
      headers: { 'X-MBX-APIKEY': this.credentials.api_key! },
    });
  }

  // ── Binance REST: Delete listen key ──────────────────────────
  private async deleteListenKey(listenKey: string): Promise<void> {
    await fetch(`${BINANCE_API_URL}/api/v3/userDataStream?listenKey=${listenKey}`, {
      method: 'DELETE',
      headers: { 'X-MBX-APIKEY': this.credentials.api_key! },
    });
  }

  // ── Signed REST request helper ────────────────────────────────
  // (used for fetching historical deposits if needed)
  signedRequest(endpoint: string, params: Record<string, string | number> = {}): string {
    const timestamp = Date.now();
    const allParams = { ...params, timestamp };
    const query = new URLSearchParams(
      Object.entries(allParams).map(([k, v]) => [k, String(v)])
    ).toString();
    const signature = crypto
      .createHmac('sha256', this.credentials.secret_key!)
      .update(query)
      .digest('hex');
    return `${BINANCE_API_URL}${endpoint}?${query}&signature=${signature}`;
  }

  private async scheduleReconnect(): Promise<void> {
    if (!this.isRunning) return;
    this.reconnectAttempts++;
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts - 1),
      RECONNECT_MAX_MS
    );
    const db = getDb();
    await db.from('watcher_connections').update({
      is_connected: false,
      reconnect_after: new Date(Date.now() + delay).toISOString(),
    }).eq('id', this.watcherId);

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private async updateConnectionState(connected: boolean, error?: string): Promise<void> {
    const db = getDb();
    await db.from('watcher_connections').update({
      is_connected: connected,
      last_connected: connected ? new Date().toISOString() : undefined,
      last_activity: new Date().toISOString(),
      last_error: error ?? null,
      error_count: connected ? 0 : undefined,
      updated_at: new Date().toISOString(),
    }).eq('id', this.watcherId);
  }

  private async updateStats(count: number): Promise<void> {
    const db = getDb();
    const { data } = await db.from('watcher_connections').select('total_processed').eq('id', this.watcherId).maybeSingle();
    await db.from('watcher_connections').update({
      total_processed: (data?.total_processed ?? 0) + count,
      last_processed: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    }).eq('id', this.watcherId);
  }

  private clearTimers(): void {
    this.stopKeepAlive();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// ─── Parse a Binance WebSocket event into our schema ─────────

function parseBinanceEvent(event: Record<string, unknown>): ParsedBinanceTransaction | null {
  const eventType = event.e as string;

  if (eventType === 'executionReport') {
    // Order execution event
    const qty = parseFloat(event.q as string) || 0;
    const price = parseFloat(event.p as string) || parseFloat(event.L as string) || 0;
    return {
      binance_order_id: String(event.i ?? ''),
      binance_trx_id:   String(event.t ?? ''),
      client_order_id:  String(event.c ?? ''),
      asset:            String(event.s as string).replace('USDT', '').replace('BTC', '').slice(0, 10),
      symbol:           String(event.s ?? ''),
      side:             (event.S as string) === 'BUY' ? 'BUY' : 'SELL',
      order_type:       String(event.o ?? ''),
      order_status:     String(event.X ?? ''),
      quantity:         qty,
      price,
      amount_usdt:      qty * price,
      commission:       parseFloat(event.n as string) || null,
      commission_asset: (event.N as string) || null,
      wallet_address:   null,
      network:          null,
      event_type:       eventType,
      raw_payload:      event,
      event_time:       event.E ? new Date(event.E as number) : null,
      transaction_time: event.T ? new Date(event.T as number) : null,
    };
  }

  if (eventType === 'balanceUpdate') {
    return {
      binance_order_id: null,
      binance_trx_id:   String(event.T ?? Date.now()),
      client_order_id:  null,
      asset:            String(event.a ?? ''),
      symbol:           String(event.a ?? ''),
      side:             parseFloat(event.d as string) >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
      order_type:       'BALANCE_UPDATE',
      order_status:     'COMPLETED',
      quantity:         Math.abs(parseFloat(event.d as string) || 0),
      price:            1,
      amount_usdt:      Math.abs(parseFloat(event.d as string) || 0),
      commission:       null,
      commission_asset: null,
      wallet_address:   null,
      network:          null,
      event_type:       eventType,
      raw_payload:      event,
      event_time:       event.E ? new Date(event.E as number) : null,
      transaction_time: event.T ? new Date(event.T as number) : null,
    };
  }

  return null;
}
