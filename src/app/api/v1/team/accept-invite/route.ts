import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ১. ইনভাইটেশন ভ্যালিডেশন
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link' }, { status: 400 });
    }

    // ২. Auth User ক্রিয়েট করা (OTP বাইপাস করে)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true, // OTP বাইপাস
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // ৩. টিম মেম্বার হিসেবে ডাটাবেসে যুক্ত করা
    await supabaseAdmin.from('business_team_members').insert({
      business_id: invite.business_id,
      user_id: authData.user.id,
      role: invite.role
    });

    // ৪. ইনভাইটেশন স্ট্যাটাস আপডেট করা
    await supabaseAdmin.from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    return NextResponse.json({ success: true, message: 'Account created and linked to workspace' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}