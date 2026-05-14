import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — RLS bypass করে, unauthenticated user-এর জন্যও কাজ করবে
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET /api/v1/team/validate-invite?token=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('team_invitations')
      .select('email, role, status, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired invitation link.' }, { status: 404 });
    }

    // Status check
    if (data.status !== 'pending') {
      return NextResponse.json(
        { error: data.status === 'accepted' ? 'This invitation has already been accepted.' : 'This invitation has been revoked.' },
        { status: 410 }
      );
    }

    // Expiry check
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation link has expired.' }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      email: data.email,
      role: data.role,
    });

  } catch (error: any) {
    console.error('Validate invite error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}