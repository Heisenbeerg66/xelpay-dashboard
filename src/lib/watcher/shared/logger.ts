// src/lib/watcher/shared/logger.ts
// Centralized error/event logging for all watcher processes
// Writes to watcher_error_logs table + console

import { getDb } from './db';
import type { WatcherErrorCode, WatcherType } from '@/types/watcher';

type Severity = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  watcher_id?: string;
  merchant_id?: string;
  business_id?: string | null;
  gateway_id?: string;
  watcher_type?: WatcherType;
  error_code?: WatcherErrorCode;
  error_message: string;
  error_stack?: string;
  context?: Record<string, unknown>;
  severity?: Severity;
}

// ─── Console prefix by severity ──────────────────────────────
const PREFIX: Record<Severity, string> = {
  debug: '🔍 [DEBUG]',
  info:  '✅ [INFO ]',
  warn:  '⚠️  [WARN ]',
  error: '❌ [ERROR]',
  fatal: '💀 [FATAL]',
};

// ─── Main log function ────────────────────────────────────────

export async function watcherLog(entry: LogEntry): Promise<void> {
  const severity = entry.severity ?? 'error';
  const ts = new Date().toISOString();

  // Always console log
  console.log(
    `${ts} ${PREFIX[severity]} [${entry.watcher_type ?? 'watcher'}]`,
    entry.error_message,
    entry.context ? JSON.stringify(entry.context) : ''
  );

  // Write to DB (don't await in hot paths — fire and forget)
  if (severity !== 'debug') {
    const db = getDb();
    db.from('watcher_error_logs').insert({
      watcher_id:    entry.watcher_id ?? null,
      merchant_id:   entry.merchant_id ?? null,
      business_id:   entry.business_id ?? null,
      gateway_id:    entry.gateway_id ?? null,
      watcher_type:  entry.watcher_type ?? null,
      error_code:    entry.error_code ?? 'UNKNOWN',
      error_message: entry.error_message,
      error_stack:   entry.error_stack ?? null,
      context:       entry.context ?? null,
      severity,
    }).then(({ error }) => {
      if (error) console.error('[logger] DB write failed:', error.message);
    });
  }
}

// ─── Convenience shortcuts ────────────────────────────────────

export const log = {
  debug: (msg: string, ctx?: Record<string, unknown>) =>
    watcherLog({ error_message: msg, context: ctx, severity: 'debug' }),

  info: (entry: Omit<LogEntry, 'severity'>) =>
    watcherLog({ ...entry, severity: 'info' }),

  warn: (entry: Omit<LogEntry, 'severity'>) =>
    watcherLog({ ...entry, severity: 'warn' }),

  error: (entry: Omit<LogEntry, 'severity'>) =>
    watcherLog({ ...entry, severity: 'error' }),

  fatal: (entry: Omit<LogEntry, 'severity'>) =>
    watcherLog({ ...entry, severity: 'fatal' }),
};
