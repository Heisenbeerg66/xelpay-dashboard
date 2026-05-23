// src/app/api/watcher/restart/route.ts
// POST — Enable, disable, or force-reset a watcher connection
// Body: { watcher_id, action: 'enable' | 'disable' | 'reset' }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  let body: { watcher_id: string; action: string; merchant_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { watcher_id, action, merchant_id } = body;
  if (!watcher_id || !action || !merchant_id) {
    return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
  }

  // Ownership check
  const { data: watcher } = await db
    .from('watcher_connections')
    .select('id, merchant_id, is_enabled')
    .eq('id', watcher_id)
    .eq('merchant_id', merchant_id)
    .maybeSingle();

  if (!watcher) {
    return NextResponse.json({ success: false, message: 'Watcher not found' }, { status: 404 });
  }

  let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  switch (action) {
    case 'enable':
      updateData = { ...updateData, is_enabled: true };
      break;
    case 'disable':
      updateData = { ...updateData, is_enabled: false, is_connected: false };
      break;
    case 'reset':
      // Force reconnect by clearing error state + reconnect_after
      updateData = {
        ...updateData,
        error_count: 0,
        last_error: null,
        reconnect_after: null,
        is_connected: false,
      };
      break;
    default:
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  }

  const { error } = await db
    .from('watcher_connections')
    .update(updateData)
    .eq('id', watcher_id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Watcher ${action}d. Orchestrator will apply change within 60 seconds.`,
  });
}
