// ============================================================
// src/lib/mobile/audit.ts
// Audit trail for all mobile API actions
// Reuses existing public.audit_logs table
// ============================================================

import { getMobileDb } from './db';

interface AuditEntry {
  action: string;
  entity_id?: string;
  ip?: string;
  details?: Record<string, unknown>;
  user_id?: string;
}

// ─── Write audit log entry ───────────────────────────────────

export async function auditLog(entry: AuditEntry): Promise<void> {
  try {
    const db = getMobileDb();
    await db.from('audit_logs').insert({
      user_id: entry.user_id ?? null,
      action: entry.action,
      details: {
        ...entry.details,
        entity_id: entry.entity_id,
        source: 'mobile_api',
      },
      ip_address: entry.ip ?? 'mobile',
    });
  } catch {
    // Audit failures must never break the main flow
    console.error('[audit] Failed to write audit log:', entry.action);
  }
}

// ─── Common audit actions ────────────────────────────────────

export const AUDIT = {
  DEVICE_CONNECTED: 'mobile.device.connected',
  DEVICE_DISCONNECTED: 'mobile.device.disconnected',
  SMS_SYNCED: 'mobile.sms.synced',
  SMS_DUPLICATE: 'mobile.sms.duplicate',
  SMS_BLOCKED: 'mobile.sms.provider_blocked',
  BALANCE_UPDATED: 'mobile.balance.updated',
  HEARTBEAT: 'mobile.device.heartbeat',
  TOKEN_REFRESHED: 'mobile.token.refreshed',
  INVALID_AUTH: 'mobile.auth.invalid',
  RATE_LIMITED: 'mobile.rate.limited',
  LOG_RECEIVED: 'mobile.device.log',
} as const;
