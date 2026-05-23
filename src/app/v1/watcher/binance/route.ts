// src/app/api/watcher/binance/route.ts
// GET — List Binance transactions for merchant

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const merchantId = params.get('merchant_id');
  const page = parseInt(params.get('page') ?? '1', 10);
  const limit = Math.min(parseInt(params.get('limit') ?? '20', 10), 100);
  const asset = params.get('asset');
  const side = params.get('side');
  const status = params.get('status');
  const dateFrom = params.get('date_from');
  const dateTo = params.get('date_to');
  const businessId = params.get('business_id');

  if (!merchantId) {
    return NextResponse.json({ success: false, message: 'merchant_id required' }, { status: 400 });
  }

  let query = db
    .from('binance_transactions')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (asset) query = query.eq('asset', asset.toUpperCase());
  if (side) query = query.eq('side', side.toUpperCase());
  if (status) query = query.eq('status', status);
  if (businessId) query = query.eq('business_id', businessId);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
