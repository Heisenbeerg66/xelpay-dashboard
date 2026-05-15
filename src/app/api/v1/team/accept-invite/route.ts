import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Service role client — সব RLS bypass করে
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

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function generate6DigitID(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  let newUserId: string | null = null;
  let merchantInserted = false;

  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Invitation validate
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('id, business_id, merchant_id, email, role, status, expires_at')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle();

    if (inviteError) {
      console.error('[accept-invite] Invite fetch error:', inviteError);
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
    }

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link.' }, { status: 400 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // 2. Business exist check
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name')
      .eq('id', invite.business_id)
      .maybeSingle();

    if (bizError || !business) {
      console.error('[accept-invite] Business fetch error:', bizError);
      return NextResponse.json({ error: 'The workspace no longer exists.' }, { status: 404 });
    }

    // 3. Auth user create
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error('[accept-invite] Auth createUser error:', authError);
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

    newUserId = authData.user.id;

    // 4. merchants table insert — auth.ts registerMerchant pattern follow করা হয়েছে
    const merchantDisplayId = generate6DigitID();
    const referId = `XEL-TM-${merchantDisplayId}`;

    const { error: merchantInsertError } = await supabaseAdmin
      .from('merchants')
      .insert({
        id: newUserId,
        merchant_id_display: merchantDisplayId,
        name: fullName,
        email: invite.email,
        phone: null,
        address: null,
        slug: null,
        currency: 'BDT',
        status: 'active',
        subscription_status: 'active',
        plan_id: null,
        refer_id: referId,
        referred_by: null,
        total_refer: 0,
        affiliate_wallet: 0,
        is_demo: false,
        is_email_verified: true,
        telegram_link_code: generateRandomString(12),
        device_connection_key: generateRandomString(24),
        active_business_id: invite.business_id,
      });

    if (merchantInsertError) {
      console.error('[accept-invite] Merchant insert error:', merchantInsertError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      newUserId = null;
      return NextResponse.json(
        { error: `Account setup failed: ${merchantInsertError.message}` },
        { status: 500 }
      );
    }

    merchantInserted = true;

    // 5. business_team_members insert
    const { error: memberInsertError } = await supabaseAdmin
      .from('business_team_members')
      .insert({
        business_id: invite.business_id,
        user_id: newUserId,
        role: invite.role,
      });

    if (memberInsertError) {
      console.error('[accept-invite] Team member insert error:', memberInsertError);
      await supabaseAdmin.from('merchants').delete().eq('id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      newUserId = null;
      merchantInserted = false;
      return NextResponse.json(
        { error: `Failed to add to workspace: ${memberInsertError.message}` },
        { status: 500 }
      );
    }

    // 6. Invitation accepted
    const { error: inviteUpdateError } = await supabaseAdmin
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    if (inviteUpdateError) {
      console.error('[accept-invite] Invite status update (non-critical):', inviteUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and linked to workspace successfully.',
    });

  } catch (error: any) {
    console.error('[accept-invite] Unhandled error:', error);

    if (newUserId) {
      try {
        if (merchantInserted) {
          await supabaseAdmin.from('merchants').delete().eq('id', newUserId);
        }
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
      } catch (cleanupError) {
        console.error('[accept-invite] Cleanup error:', cleanupError);
      }
    }

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}