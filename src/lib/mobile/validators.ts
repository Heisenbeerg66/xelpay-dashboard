// ============================================================
// src/lib/mobile/validators.ts
// Zod schemas for all mobile API request payloads
// ============================================================

import { z } from 'zod';

// ─── Device Connect ──────────────────────────────────────────

export const connectDeviceSchema = z.object({
  connection_key: z
    .string()
    .min(8, 'Connection key too short')
    .max(255, 'Connection key too long')
    .regex(/^[A-Za-z0-9_\-]+$/, 'Invalid connection key format'),
  device_name: z.string().min(1).max(255),
  device_model: z.string().max(255).optional(),
  android_version: z.string().max(50).optional(),
  app_version: z.string().max(50).optional(),
  device_fingerprint: z.string().min(16).max(512),
});

// ─── SMS Sync ────────────────────────────────────────────────

const smsTransactionSchema = z.object({
  sender: z.string().min(1).max(20),
  method: z.string().min(1).max(50),
  message: z.string().min(5).max(2000),
  trx_id: z.string().min(1).max(100),
  amount: z.number().positive().max(10_000_000),
  balance: z.number().optional(),
  received_at: z.string().datetime().optional(),
  sms_hash: z.string().length(64).optional(), // SHA-256 hex
});

export const smsSyncSchema = z.object({
  transactions: z
    .array(smsTransactionSchema)
    .min(1, 'At least one transaction required')
    .max(100, 'Maximum 100 transactions per batch'),
  device_fingerprint: z.string().min(16).max(512),
  request_id: z.string().uuid('request_id must be a UUID'),
  timestamp: z.number().int().positive(),
});

// ─── Balance Update ──────────────────────────────────────────

export const balanceUpdateSchema = z.object({
  gateway_id: z.string().uuid(),
  account_number: z.string().min(1).max(100),
  provider: z.string().min(1).max(50),
  balance: z.number().min(0).max(100_000_000),
  updated_at: z.string().datetime(),
});

// ─── Heartbeat ───────────────────────────────────────────────

export const heartbeatSchema = z.object({
  battery_level: z.string().max(10),
  app_version: z.string().max(50),
  android_version: z.string().max(50).optional(),
  device_model: z.string().max(255).optional(),
  is_sms_permission_granted: z.boolean(),
  pending_sms_count: z.number().int().min(0).optional(),
});

// ─── Device Logs ─────────────────────────────────────────────

const deviceLogEntrySchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string().min(1).max(1000),
  context: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export const deviceLogsSchema = z.object({
  logs: z.array(deviceLogEntrySchema).min(1).max(50),
});

// ─── Validation helper ───────────────────────────────────────

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, error: null };
  }
  const firstError = result.error.errors[0];
  return {
    data: null,
    error: `${firstError.path.join('.')}: ${firstError.message}`,
  };
}
