// ============================================================
// src/types/mobile.ts
// XelPay Connect — Mobile API Types & Interfaces
// ============================================================

// ─── Device Connection ───────────────────────────────────────

export type ConnectionType = 'merchant' | 'business';

export interface DeviceConnectPayload {
  connection_key: string;
  device_name: string;
  device_model?: string;
  android_version?: string;
  app_version?: string;
  device_fingerprint: string;
}

export interface DeviceConnectResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  device_id: string;
  merchant_id: string | null;
  business_id: string | null;
  business_name: string;
  email: string;
  connection_type: ConnectionType;
  active_providers: string[];
}

export interface MobileTokenPayload {
  device_id: string;
  merchant_id: string | null;
  business_id: string | null;
  connection_type: ConnectionType;
  device_fingerprint: string;
  iat?: number;
  exp?: number;
}

// ─── SMS Sync ───────────────────────────────────────────────

export interface SmsSyncPayload {
  transactions: SmsTransactionInput[];
  device_fingerprint: string;
  request_id: string;     // UUID for replay attack prevention
  timestamp: number;      // Unix ms — must be within 5 min of server time
}

export interface SmsTransactionInput {
  sender: string;
  method: string;         // Provider: bKash, Nagad, Rocket, Upay, Bank
  message: string;        // Raw SMS body (encrypted on device)
  trx_id: string;
  amount: number;
  balance?: number;
  received_at?: string;   // ISO timestamp
  sms_hash: string;       // SHA-256(sender+message+timestamp_floor)
}

export interface SmsSyncResponse {
  success: boolean;
  synced: number;
  skipped: number;
  failed: number;
  details?: Array<{ trx_id: string; status: 'synced' | 'duplicate' | 'invalid' | 'blocked' }>;
}

// ─── Gateway ────────────────────────────────────────────────

export interface MobileGateway {
  id: string;
  provider: string;
  display_name: string;
  account_number: string;
  account_name?: string;
  account_type?: string;
  is_active: boolean;
  category: string;
}

export interface GatewaysResponse {
  success: boolean;
  gateways: MobileGateway[];
  active_providers: string[];
}

// ─── Balance ─────────────────────────────────────────────────

export interface BalanceUpdatePayload {
  gateway_id: string;
  account_number: string;
  provider: string;
  balance: number;
  updated_at: string;
}

// ─── Heartbeat ───────────────────────────────────────────────

export interface HeartbeatPayload {
  battery_level: string;
  app_version: string;
  android_version?: string;
  device_model?: string;
  is_sms_permission_granted: boolean;
  pending_sms_count?: number;
}

// ─── Device Status ───────────────────────────────────────────

export interface DeviceStatusResponse {
  success: boolean;
  is_active: boolean;
  connection_type: ConnectionType;
  device_name: string;
  last_sync: string | null;
  battery_level: string | null;
  app_version: string | null;
  active_providers: string[];
  today_sms_count: number;
  pending_sync_count: number;
}

// ─── Config ──────────────────────────────────────────────────

export interface MobileConfig {
  sync_interval_minutes: number;
  max_retry_attempts: number;
  active_providers: string[];
  sms_filter_senders: Record<string, string[]>;
  request_timeout_ms: number;
  max_batch_size: number;
}

// ─── Device Logs ─────────────────────────────────────────────

export interface DeviceLogPayload {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

// ─── Internal DB Rows ────────────────────────────────────────

export interface MerchantDeviceRow {
  id: string;
  merchant_id: string | null;
  connection_key: string | null;
  device_name: string | null;
  device_model: string | null;
  android_version: string | null;
  battery_level: string | null;
  app_version: string | null;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessDeviceRow {
  id: string;
  business_id: string | null;
  connection_key: string | null;
  device_name: string | null;
  device_model: string | null;
  android_version: string | null;
  battery_level: string | null;
  app_version: string | null;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}
