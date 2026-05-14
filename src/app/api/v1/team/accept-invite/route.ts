import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Service role client — RLS সম্পূর্ণ bypass করে
// global headers-এ Authorization explicitly set করা হয়েছে
// যাতে business_team_members-এ insert RLS block না করে
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);

export async function POST(req: Request) {
  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // ── ১. Invitation validate ─────────────────────────────────────────────────
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('id, business_id, merchant_id, email, role, status, expires_at')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      console.error('Invite fetch error:', inviteError);
      return NextResponse.json({ error: 'Invalid or expired invitation link.' }, { status: 400 });
    }

    // Expiry check
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation link has expired.' }, { status: 410 });
    }

    // ── ২. Business info ─────────────────────────────────────────────────────
    const { data: businessData, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, merchant_id')
      .eq('id', invite.business_id)
      .single();

    if (bizError || !businessData) {
      console.error('Business fetch error:', bizError);
      return NextResponse.json({ error: 'The workspace no longer exists.' }, { status: 404 });
    }

    // ── ৩. Auth user তৈরি করো ────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error('Auth createUser error:', authError);
      const msg = authError.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('already been registered') ||
        msg.includes('email address is already')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please login instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // ── ৪. merchants টেবিলে minimal row insert ────────────────────────────────
    // dashboard/layout.tsx merchants row না পেলে force-signout করে।
    // refer_id NOT NULL — unique value দিতে হবে।
    // merchant_id_display UNIQUE — timestamp + random দিয়ে collision এড়ানো হয়েছে।
    const teamMemberDisplayId = `TM${Date.now()}${Math.floor(Math.random() * 999)}`;
    const uniqueReferId = `tm_${newUserId.replace(/-/g, '').slice(0, 16)}`;

    const { error: merchantInsertError } = await supabaseAdmin
      .from('merchants')
      .insert({
        id: newUserId,
        name: fullName,
        email: invite.email,
        merchant_id_display: teamMemberDisplayId,
        active_business_id: invite.business_id,
        refer_id: uniqueReferId,
        status: 'active',
        subscription_status: 'active',
        is_email_verified: true,
      });

    if (merchantInsertError) {
      console.error('Merchant insert error:', merchantInsertError);
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: `Account setup failed: ${merchantInsertError.message}` },
        { status: 500 }
      );
    }

    // ── ৫. business_team_members-এ insert ────────────────────────────────────
    // ✅ KEY FIX: supabaseAdmin (service role) দিয়ে insert।
    // RLS policy শুধু: merchant_id = auth.uid() — service role এটা bypass করে।
    // আগের route-এ এই step-এই fail হচ্ছিল।
    const { error: memberInsertError } = await supabaseAdmin
      .from('business_team_members')
      .insert({
        business_id: invite.business_id,
        user_id: newUserId,
        role: invite.role,
      });

    if (memberInsertError) {
      console.error('Team member insert error:', memberInsertError);
      // Rollback: merchants + auth user
      await supabaseAdmin.from('merchants').delete().eq('id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: `Failed to add to workspace: ${memberInsertError.message}` },
        { status: 500 }
      );
    }

    // ── ৬. Invitation → accepted ──────────────────────────────────────────────
    const { error: inviteUpdateError } = await supabaseAdmin
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    if (inviteUpdateError) {
      // Critical না — member added হয়ে গেছে
      console.error('Invite status update (non-critical):', inviteUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and linked to workspace successfully.',
    });

  } catch (error: any) {
    console.error('Accept invite unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}