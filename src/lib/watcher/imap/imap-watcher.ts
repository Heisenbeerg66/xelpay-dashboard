// src/lib/watcher/imap/imap-watcher.ts
// Manages ONE persistent IMAP IDLE connection per mailbox.
// Uses imapflow for modern IMAP with IDLE support.
// On new email → parse → store to email_transactions.

import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { simpleParser } from 'mailparser';
import { getDb } from '../shared/db';
import { log } from '../shared/logger';
import { parseEmailTransaction } from './email-parser';
import type { GatewayCredentials } from '@/types/watcher';

const RECONNECT_BASE_MS = 5_000;    // 5s base backoff
const RECONNECT_MAX_MS  = 300_000;  // 5min max backoff
const IDLE_TIMEOUT_MS   = 20 * 60 * 1000; // 20 min IDLE refresh

export class ImapWatcher {
  private client: ImapFlow | null = null;
  private watcherId: string;
  private credentials: GatewayCredentials;
  private isRunning = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(watcherId: string, credentials: GatewayCredentials) {
    this.watcherId = watcherId;
    this.credentials = credentials;
  }

  // ── Start watcher (called by orchestrator) ──────────────────
  async start(): Promise<void> {
    this.isRunning = true;
    await this.connect();
  }

  // ── Stop watcher ────────────────────────────────────────────
  async stop(): Promise<void> {
    this.isRunning = false;
    this.clearTimers();
    if (this.client) {
      try { await this.client.logout(); } catch { /* ignore */ }
      this.client = null;
    }
    await this.updateConnectionState(false);
  }

  // ── Connect to IMAP server ───────────────────────────────────
  private async connect(): Promise<void> {
    if (!this.isRunning) return;

    const { imap_email, imap_password } = this.credentials;
    if (!imap_email || !imap_password) {
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_code: 'INVALID_CREDENTIALS',
        error_message: 'IMAP email or password is missing',
      });
      return;
    }

    // Detect IMAP host from email domain
    const imapConfig = resolveImapConfig(imap_email, imap_password);

    try {
      this.client = new ImapFlow(imapConfig);

      // Error handler — triggers reconnect
      this.client.on('error', async (err: Error) => {
        await log.error({
          watcher_id: this.watcherId,
          merchant_id: this.credentials.merchant_id,
          gateway_id: this.credentials.id,
          watcher_type: 'imap',
          error_code: 'CONNECTION_LOST',
          error_message: err.message,
          error_stack: err.stack,
        });
        await this.scheduleReconnect();
      });

      await this.client.connect();
      this.reconnectAttempts = 0;

      await log.info({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_message: `Connected to IMAP: ${imap_email}`,
        severity: 'info',
      });

      await this.updateConnectionState(true);

      // Process existing unread emails first
      await this.processUnread();

      // Then start IDLE loop
      await this.idleLoop();

    } catch (err: unknown) {
      const error = err as Error;
      const isAuthError = error.message?.toLowerCase().includes('auth');
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_code: isAuthError ? 'AUTH_FAILED' : 'CONNECTION_REFUSED',
        error_message: error.message,
        error_stack: error.stack,
      });
      await this.updateConnectionState(false, error.message);
      await this.scheduleReconnect();
    }
  }

  // ── IDLE loop: wait for new messages, then process ───────────
  private async idleLoop(): Promise<void> {
    if (!this.client || !this.isRunning) return;

    try {
      const lock = await this.client.getMailboxLock('INBOX');
      try {
        // Schedule IDLE refresh before server kicks us (every 20 min)
        this.idleTimer = setTimeout(() => {
          this.restartIdle();
        }, IDLE_TIMEOUT_MS);

        // Block until new message or timeout
        await this.client.idle();

        // New mail arrived — process it
        if (this.isRunning) {
          this.clearIdleTimer();
          await this.processUnread();
          // Re-enter IDLE
          await this.idleLoop();
        }
      } finally {
        lock.release();
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (!this.isRunning) return;
      await log.warn({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_message: `IDLE error: ${error.message}`,
      });
      await this.scheduleReconnect();
    }
  }

  // ── Restart IDLE (keep-alive) ────────────────────────────────
  private async restartIdle(): Promise<void> {
    if (!this.client || !this.isRunning) return;
    try {
      // NOOP keeps connection alive and resets IDLE
      await this.client.noop();
    } catch { /* reconnect will handle it */ }
  }

  // ── Process unread / UNSEEN emails ───────────────────────────
  private async processUnread(): Promise<void> {
    if (!this.client || !this.isRunning) return;

    try {
      const lock = await this.client.getMailboxLock('INBOX');
      const db = getDb();

      try {
        // Fetch UNSEEN messages
        const messages = this.client.fetch('1:*', {
          flags: true,
          envelope: true,
          uid: true,
          bodyStructure: true,
          source: true,
        });

        let processedCount = 0;

        for await (const msg of messages) {
          if (!msg.flags.has('\\Seen')) {
            try {
              await this.processMessage(msg, db);
              processedCount++;
            } catch (err: unknown) {
              const error = err as Error;
              await log.warn({
                watcher_id: this.watcherId,
                merchant_id: this.credentials.merchant_id,
                gateway_id: this.credentials.id,
                watcher_type: 'imap',
                error_message: `Failed to process email UID ${msg.uid}: ${error.message}`,
              });
            }
          }
        }

        if (processedCount > 0) {
          await this.updateStats(processedCount);
          await log.info({
            watcher_id: this.watcherId,
            merchant_id: this.credentials.merchant_id,
            gateway_id: this.credentials.id,
            watcher_type: 'imap',
            error_message: `Processed ${processedCount} new emails`,
          });
        }
      } finally {
        lock.release();
      }
    } catch (err: unknown) {
      const error = err as Error;
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_code: 'PARSE_ERROR',
        error_message: `processUnread failed: ${error.message}`,
      });
    }
  }

  // ── Process a single email message ───────────────────────────
  private async processMessage(
    msg: { uid: number; source: Buffer; envelope?: { subject?: string; from?: Array<{ address?: string }>; date?: Date } },
    db: ReturnType<typeof getDb>
  ): Promise<void> {
    const emailUid = String(msg.uid);

    // Filter by bank email sender if configured
    const { imap_bank_email } = this.credentials;
    const from = msg.envelope?.from?.[0]?.address ?? '';

    if (imap_bank_email && !from.toLowerCase().includes(imap_bank_email.toLowerCase())) {
      return; // Not from the configured bank email — skip
    }

    // Parse full email
    const parsed = await simpleParser(msg.source);
    const subject = parsed.subject ?? msg.envelope?.subject ?? '';
    const date = parsed.date ?? msg.envelope?.date ?? new Date();
    const bodyText = parsed.text ?? '';
    const bodyHtml = parsed.html ?? '';
    const body = bodyText || bodyHtml;

    // Check duplicate
    const { data: existing } = await db
      .from('email_transactions')
      .select('id')
      .eq('gateway_id', this.credentials.id)
      .eq('email_uid', emailUid)
      .maybeSingle();

    if (existing) return; // Already processed

    // Parse transaction
    const txn = parseEmailTransaction(emailUid, subject, from, date, body);

    // Only store if we extracted meaningful data
    if (txn.amount === null && txn.trx_id === null) {
      return; // Not a transaction email
    }

    // Store to DB
    const { error: insertErr } = await db.from('email_transactions').insert({
      merchant_id:      this.credentials.merchant_id,
      business_id:      this.credentials.business_id,
      gateway_id:       this.credentials.id,
      gateway_source:   this.credentials.gateway_source,
      email_uid:        txn.email_uid,
      email_subject:    txn.email_subject?.substring(0, 500),
      email_from:       txn.email_from?.substring(0, 255),
      email_date:       txn.email_date.toISOString(),
      bank_name:        txn.bank_name,
      account_number:   txn.account_number,
      trx_id:           txn.trx_id,
      amount:           txn.amount,
      balance:          txn.balance,
      currency:         txn.currency,
      transaction_type: txn.transaction_type,
      sender_name:      txn.sender_name,
      description:      txn.description?.substring(0, 500),
      raw_body:         txn.raw_body?.substring(0, 5000),
      parsed_data:      txn.parsed_data,
      parse_confidence: txn.parse_confidence,
      status:           'parsed',
    });

    if (insertErr && insertErr.code !== '23505') { // ignore unique violations
      await log.error({
        watcher_id: this.watcherId,
        merchant_id: this.credentials.merchant_id,
        gateway_id: this.credentials.id,
        watcher_type: 'imap',
        error_code: 'PARSE_ERROR',
        error_message: `DB insert failed: ${insertErr.message}`,
      });
    }

    // Try match to pending orders
    if (txn.trx_id || txn.amount) {
      await this.tryMatchOrder(txn, db);
    }

    // Mark email as SEEN
    if (this.client) {
      try {
        await this.client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);
      } catch { /* non-critical */ }
    }
  }

  // ── Try matching to pending orders ───────────────────────────
  private async tryMatchOrder(
    txn: { trx_id: string | null; amount: number | null },
    db: ReturnType<typeof getDb>
  ): Promise<void> {
    if (!txn.trx_id && !txn.amount) return;

    try {
      let query = db
        .from('orders')
        .select('id, amount, status')
        .eq('merchant_id', this.credentials.merchant_id)
        .eq('status', 'pending');

      if (txn.trx_id) {
        query = query.eq('trx_id', txn.trx_id);
      } else if (txn.amount) {
        query = query.eq('amount', txn.amount);
      }

      const { data: order } = await query.maybeSingle();

      if (order) {
        await db.from('orders').update({ status: 'success' }).eq('id', order.id);
        await db.from('email_transactions').update({
          status: 'matched',
          matched_order_id: order.id,
          is_used: true,
        }).eq('gateway_id', this.credentials.id).eq('trx_id', txn.trx_id ?? undefined);
      }
    } catch { /* best-effort */ }
  }

  // ── Exponential backoff reconnect ─────────────────────────────
  private async scheduleReconnect(): Promise<void> {
    if (!this.isRunning) return;

    this.client = null;
    this.reconnectAttempts++;

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts - 1),
      RECONNECT_MAX_MS
    );

    // Update reconnect_after in DB
    const db = getDb();
    await db.from('watcher_connections').update({
      is_connected: false,
      reconnect_after: new Date(Date.now() + delay).toISOString(),
    }).eq('id', this.watcherId);

    await log.info({
      watcher_id: this.watcherId,
      merchant_id: this.credentials.merchant_id,
      gateway_id: this.credentials.id,
      watcher_type: 'imap',
      error_message: `Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})`,
    });

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // ── Update watcher_connections state ─────────────────────────
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
    this.clearIdleTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

// ─── Resolve IMAP config from email domain ────────────────────

function resolveImapConfig(email: string, password: string): ImapFlowOptions {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';

  const hostMap: Record<string, { host: string; port: number }> = {
    'gmail.com':       { host: 'imap.gmail.com',       port: 993 },
    'googlemail.com':  { host: 'imap.gmail.com',       port: 993 },
    'yahoo.com':       { host: 'imap.mail.yahoo.com',  port: 993 },
    'outlook.com':     { host: 'outlook.office365.com', port: 993 },
    'hotmail.com':     { host: 'outlook.office365.com', port: 993 },
    'live.com':        { host: 'outlook.office365.com', port: 993 },
    'icloud.com':      { host: 'imap.mail.me.com',     port: 993 },
    'dbbl.com.bd':     { host: 'imap.dbbl.com.bd',     port: 993 },
    'bracbank.com':    { host: 'mail.bracbank.com',     port: 993 },
  };

  const config = hostMap[domain] ?? { host: `imap.${domain}`, port: 993 };

  return {
    host: config.host,
    port: config.port,
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false }, // Some corporate mail servers have self-signed certs
  };
}
