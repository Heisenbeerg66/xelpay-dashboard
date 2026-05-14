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

    // ১. Invitation validate করো (service role — RLS bypass)
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link.' }, { status: 400 });
    }

    // Expiry check
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation link has expired.' }, { status: 410 });
    }

    // ২. Business info নিয়ে নাও (active_business_id সেট করার জন্য)
    const { data: businessData } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, merchant_id')
      .eq('id', invite.business_id)
      .single();

    if (!businessData) {
      return NextResponse.json({ error: 'The workspace no longer exists.' }, { status: 404 });
    }

    // ৩. Auth user তৈরি করো (OTP bypass — email ইতিমধ্যে invite দিয়ে verified)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      // ইতিমধ্যে registered হলে clear error দাও
      if (authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already been registered') ||
          authError.message.toLowerCase().includes('email address is already')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please login instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // ✅ ৪. merchants টেবিলে team member-এর জন্য একটি minimal row insert করো।
    //    কারণ: dashboard/layout.tsx merchants টেবিলে user-এর row না পেলে
    //    force-signout করে redirect করে দেয়।
    //    Team member business owner না — তাই minimal data দিয়ে insert।
    const teamMemberDisplayId = `TM${Math.floor(100000 + Math.random() * 900000)}`;
    const uniqueReferId = `ref_${newUserId.replace(/-/g, '').slice(0, 12)}`;

    const { error: merchantInsertError } = await supabaseAdmin
      .from('merchants')
      .insert({
        id: newUserId,
        name: fullName,
        email: invite.email,
        merchant_id_display: teamMemberDisplayId,
        // ✅ active_business_id সেট করো যেন login-এর পর সরাসরি তার workspace দেখতে পায়
        active_business_id: invite.business_id,
        refer_id: uniqueReferId,
        status: 'active',
        subscription_status: 'active',
        is_email_verified: true,
      });

    if (merchantInsertError) {
      console.error('Merchant row insert error:', merchantInsertError);
      // merchant insert fail হলে auth user delete করে দাও (rollback)
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: 'Failed to set up account. Please try again.' },
        { status: 500 }
      );
    }

    // ✅ ৫. business_team_members টেবিলে insert করো
    const { error: memberInsertError } = await supabaseAdmin
      .from('business_team_members')
      .insert({
        business_id: invite.business_id,
        user_id: newUserId,
        role: invite.role,
      });

    if (memberInsertError) {
      console.error('Team member insert error:', memberInsertError);
      // rollback
      await supabaseAdmin.from('merchants').delete().eq('id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: 'Failed to add you to the workspace. Please try again.' },
        { status: 500 }
      );
    }

    // ৬. Invitation status 'accepted' করো
    const { error: inviteUpdateError } = await supabaseAdmin
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    if (inviteUpdateError) {
      console.error('Invitation status update error:', inviteUpdateError);
      // এটা critical না — member already added, just log
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and linked to workspace successfully.',
    });

  } catch (error: any) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}