// src/lib/watcher/shared/db.ts
// Supabase admin client for watcher processes
// Reuses same env vars as existing XelPay project

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ─── Admin DB client (service role, no RLS) ───────────────────
let _db: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (!_db) {
    _db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _db;
}

// ─── Encryption helpers (matching vault_actions.ts pattern) ───
// Same ENCRYPTION_KEY env as existing project

function getValidKey(): Buffer {
  let key = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  if (key.length < 32) key = key.padEnd(32, '0');
  if (key.length > 32) key = key.substring(0, 32);
  return Buffer.from(key);
}

export function decryptData(encryptedText: string): string | null {
  if (!encryptedText) return null;
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getValidKey(), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return null;
  }
}

export function encryptData(text: string): string | null {
  if (!text) return null;
  try {
    const IV_LENGTH = 16;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', getValidKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch {
    return null;
  }
}
