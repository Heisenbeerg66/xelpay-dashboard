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

    // ১. ইনভাইটেশন ভ্যালিড কিনা তা ডাটাবেস থেকে চেক করা
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link' }, { status: 400 });
    }

    // ২. Supabase Admin দিয়ে ইউজার ক্রিয়েট করা (এর ফলে OTP বাইপাস হয়ে সরাসরি অ্যাকাউন্ট কনফার্ম হয়ে যাবে)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true, // এটি OTP বাইপাস করবে
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // ৩. ইউজারের আইডি নিয়ে তাকে `business_team_members` টেবিলে যুক্ত করা
    const { error: teamError } = await supabaseAdmin.from('business_team_members').insert({
      business_id: invite.business_id,
      user_id: authData.user.id,
      role: invite.role
    });

    if (teamError) {
       console.error("Team insert error:", teamError);
       return NextResponse.json({ error: 'Failed to assign team role.' }, { status: 500 });
    }

    // ৪. ইনভাইটেশনের স্ট্যাটাস "accepted" করে দেওয়া যাতে এই লিংক আর কেউ ব্যবহার করতে না পারে
    await supabaseAdmin.from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    return NextResponse.json({ success: true, message: 'Account created and linked to workspace' });

  } catch (error: any) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}