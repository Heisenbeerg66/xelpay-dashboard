// ============================================================
// src/lib/mobile/db.ts
// Server-side Supabase admin client for mobile API routes
// Uses service role key — bypasses RLS
// ============================================================

import { createClient } from '@supabase/supabase-js';

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getMobileDb() {
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
