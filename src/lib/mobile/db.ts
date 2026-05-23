// ============================================================
// src/lib/mobile/db.ts
// Server-side Supabase admin client for mobile API routes
// Uses service role key — bypasses RLS
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Loose typing until generated Supabase types are wired in
type MobileDb = SupabaseClient;

let _adminClient: MobileDb | null = null;

export function getMobileDb(): MobileDb {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _adminClient;
}

// ─── Convenience alias ───────────────────────────────────────
export const db = getMobileDb();
