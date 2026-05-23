// src/app/api/watcher/status/route.ts
// GET — Returns status of all active watcher connections
// Used by dashboard to show IMAP/Binance connection health

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  // Basic auth check — only merchant-scoped
  const merchantId = req.nextUrl.searchParams.get('merchant_id');
  if (!merchantId) {
    return NextResponse.json({ success: false, message: 'merchant_id required' }, { status: 400 });
  }

  const { data: connections, error } = await db
    .from('watcher_connections')
    .select(`
      id, watcher_type, gateway_source, is_enabled, is_connected,
      last_connected, last_activity, last_error, error_count,
      total_processed, last_processed, reconnect_after, business_id
    `)
    .eq('merchant_id', merchantId)
    .order('watcher_type');

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Recent errors
  const { data: recentErrors } = await db
    .from('watcher_error_logs')
    .select('id, watcher_type, error_code, error_message, severity, created_at')
    .eq('merchant_id', merchantId)
    .in('severity', ['error', 'fatal'])
    .order('created_at', { ascending: false })
    .limit(10);

  // Summary stats
  const imapCount = connections?.filter((c) => c.watcher_type === 'imap').length ?? 0;
  const binanceCount = connections?.filter((c) => c.watcher_type === 'binance').length ?? 0;
  const connectedCount = connections?.filter((c) => c.is_connected).length ?? 0;

  return NextResponse.json({
    success: true,
    summary: {
      total: connections?.length ?? 0,
      connected: connectedCount,
      imap: imapCount,
      binance: binanceCount,
    },
    connections: connections ?? [],
    recent_errors: recentErrors ?? [],
  });
}
