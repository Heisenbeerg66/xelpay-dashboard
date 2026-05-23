import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Service role — সব cleanup করার জন্য
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    },
  }
);

// ── DELETE: Team member সম্পূর্ণ remove ─────────────────────────────────────
// memberId = business_team_members.id
export async function DELETE(req: Request) {
  try {
    const { memberId, businessId } = await req.json();

    if (!memberId || !businessId) {
      return NextResponse.json({ error: 'memberId and businessId required.' }, { status: 400 });
    }

    // ── Caller verify: business owner কিনা ────────────────────────────────
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Business owner check
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id')
      .eq('id', businessId)
      .single();

    if (!business || business.merchant_id !== user.id) {
      return NextResponse.json({ error: 'Only the workspace owner can remove members.' }, { status: 403 });
    }

    // ── Member fetch: user_id বের করো ────────────────────────────────────
    const { data: member, error: memberFetchError } = await supabaseAdmin
      .from('business_team_members')
      .select('id, user_id')
      .eq('id', memberId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (memberFetchError || !member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const targetUserId = member.user_id;

    // ── Step 1: business_team_members থেকে remove ─────────────────────────
    const { error: memberDeleteError } = await supabaseAdmin
      .from('business_team_members')
      .delete()
      .eq('id', memberId);

    if (memberDeleteError) {
      console.error('[remove-member] member delete error:', memberDeleteError);
      return NextResponse.json({ error: 'Failed to remove member.' }, { status: 500 });
    }

    // ── Step 2: এই user কি team member হিসেবে তৈরি হয়েছিল? ──────────────
    // is_team_member = true হলে সম্পূর্ণ cleanup করো
    const { data: merchantData } = await supabaseAdmin
      .from('merchants')
      .select('id, is_team_member, email')
      .eq('id', targetUserId)
      .maybeSingle();

    if (merchantData?.is_team_member) {
      // ── Step 3: team_invitations-এ email reset করো (পুনরায় invite করা যাবে) ──
      // accepted invitation-টা delete করো (re-invite block না হওয়ার জন্য)
      await supabaseAdmin
        .from('team_invitations')
        .delete()
        .eq('email', merchantData.email)
        .eq('business_id', businessId)
        .eq('status', 'accepted');

      // ── Step 4: merchants table থেকে delete ───────────────────────────
      const { error: merchantDeleteError } = await supabaseAdmin
        .from('merchants')
        .delete()
        .eq('id', targetUserId);

      if (merchantDeleteError) {
        console.error('[remove-member] merchant delete error:', merchantDeleteError);
        // Non-critical — member already removed from team
      }

      // ── Step 5: affiliate_wallets cleanup ─────────────────────────────
      await supabaseAdmin
        .from('affiliate_wallets')
        .delete()
        .eq('merchant_id', targetUserId);

      // ── Step 6: merchant_subscriptions cleanup ────────────────────────
      await supabaseAdmin
        .from('merchant_subscriptions')
        .delete()
        .eq('merchant_id', targetUserId);

      // ── Step 7: auth.users থেকে delete (সম্পূর্ণ remove) ────────────
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (authDeleteError) {
        console.error('[remove-member] auth delete error:', authDeleteError);
        // Non-critical — DB already cleaned
      }
    } else {
      // Regular merchant যিনি team-এ যোগ দিয়েছেন — শুধু business_team_members থেকে remove
      // merchants বা auth delete করো না
      // Invitation accepted status revoke করো (re-invite-এর জন্য)
      if (merchantData?.email) {
        await supabaseAdmin
          .from('team_invitations')
          .delete()
          .eq('email', merchantData.email)
          .eq('business_id', businessId)
          .eq('status', 'accepted');
      }
    }

    return NextResponse.json({ success: true, message: 'Member removed successfully.' });

  } catch (error: any) {
    console.error('[remove-member] unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ── PATCH: Team member role update ──────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const { memberId, businessId, newRole } = await req.json();

    const validRoles = ['admin', 'developer', 'support', 'viewer'];
    if (!memberId || !businessId || !newRole || !validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'memberId, businessId and valid newRole required.' }, { status: 400 });
    }

    // ── Caller verify ─────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Business owner check
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id')
      .eq('id', businessId)
      .single();

    if (!business || business.merchant_id !== user.id) {
      return NextResponse.json({ error: 'Only the workspace owner can update roles.' }, { status: 403 });
    }

    // Role update
    const { error: updateError } = await supabaseAdmin
      .from('business_team_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('[remove-member] role update error:', updateError);
      return NextResponse.json({ error: 'Failed to update role.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Role updated successfully.' });

  } catch (error: any) {
    console.error('[remove-member] role update unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}