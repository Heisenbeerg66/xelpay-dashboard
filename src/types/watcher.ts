// src/types/watcher.ts
// Shared types for IMAP and Binance watcher system

export type WatcherType = 'imap' | 'binance';
export type GatewaySource = 'vault' | 'business';

// ─── Gateway credential row (from DB) ────────────────────────

export interface GatewayCredentials {
  id: string;                   // gateway_id
  merchant_id: string;
  business_id: string | null;
  gateway_source: GatewaySource;
  provider: string;

  // IMAP
  imap_email?: string;
  imap_password?: string;       // AES-256 encrypted in DB
  imap_bank_email?: string;     // filter: only emails from this sender

  // Binance
  api_key?: string;             // AES-256 encrypted in DB
  secret_key?: string;          // AES-256 encrypted in DB
}

// ─── Watcher connection registry row ─────────────────────────

export interface WatcherConnection {
  id: string;
  merchant_id: string;
  business_id: string | null;
  gateway_id: string;
  gateway_source: GatewaySource;
  watcher_type: WatcherType;
  is_enabled: boolean;
  is_connected: boolean;
  last_connected: string | null;
  last_activity: string | null;
  last_error: string | null;
  error_count: number;
  reconnect_after: string | null;
  total_processed: number;
}

// ─── Parsed email transaction ─────────────────────────────────

export interface ParsedEmailTransaction {
  email_uid: string;
  email_subject: string;
  email_from: string;
  email_date: Date;

  bank_name: string | null;
  account_number: string | null;
  trx_id: string | null;
  amount: number | null;
  balance: number | null;
  currency: string;
  transaction_type: 'credit' | 'debit' | 'unknown';
  sender_name: string | null;
  sender_account: string | null;
  description: string | null;

  raw_body: string;
  parsed_data: Record<string, unknown>;
  parse_confidence: number;
}

// ─── Parsed Binance transaction ───────────────────────────────

export interface ParsedBinanceTransaction {
  binance_order_id: string | null;
  binance_trx_id: string | null;
  client_order_id: string | null;
  asset: string;
  symbol: string;
  side: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'UNKNOWN';
  order_type: string | null;
  order_status: string;
  quantity: number;
  price: number;
  amount_usdt: number;
  commission: number | null;
  commission_asset: string | null;
  wallet_address: string | null;
  network: string | null;
  event_type: string;
  raw_payload: Record<string, unknown>;
  event_time: Date | null;
  transaction_time: Date | null;
}

// ─── Watcher error codes ──────────────────────────────────────

export type WatcherErrorCode =
  | 'AUTH_FAILED'
  | 'CONNECTION_LOST'
  | 'CONNECTION_REFUSED'
  | 'PARSE_ERROR'
  | 'DECRYPT_ERROR'
  | 'DUPLICATE'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INVALID_CREDENTIALS'
  | 'MAILBOX_NOT_FOUND'
  | 'WEBSOCKET_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN';
