import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
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
      .maybeSingle(); // ✅ single() এর বদলে maybeSingle() — not found হলে error throw করবে না

    if (error) {
      console.error('Validate invite DB error:', error);
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Invalid invitation link.' }, { status: 404 });
    }

    // Status check — স্পষ্ট বাংলা এবং English error
    if (data.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invitation has already been accepted. Please login instead.' },
        { status: 410 }
      );
    }

    if (data.status === 'revoked') {
      return NextResponse.json(
        { error: 'This invitation has been revoked. Please contact the workspace owner.' },
        { status: 410 }
      );
    }

    if (data.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation is no longer valid.' },
        { status: 410 }
      );
    }

    // Expiry check
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired. Please ask for a new invitation.' },
        { status: 410 }
      );
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