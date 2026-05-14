import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'XelPay';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://xelpay.site';
const FROM_EMAIL = `XelPay Team <team@xelpay.site>`;
const MAX_RESENDS = 2;
const RESEND_COOLDOWN_HOURS = 12;

function buildEmailHtml(inviteLink: string, workspaceName: string, role: string, isResend = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0"
          style="max-width:480px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding:40px;text-align:center;">
              <h1 style="margin:0 0 32px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                Xel<span style="color:#2563eb;">Pay</span>
              </h1>
              ${isResend ? '<p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Reminder</p>' : ''}
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0f172a;">
                ${isResend ? 'Reminder: Join the Team' : "You're Invited to Join the Team"}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                You have been invited to join <strong>${workspaceName}</strong> on <strong>${SITE_NAME}</strong> as <strong>${role}</strong>.
              </p>
              <div style="margin-bottom:32px;">
                <a href="${inviteLink}"
                  style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
                  Accept Invitation
                </a>
              </div>
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Or copy this link:</p>
              <p style="margin:0 0 32px;font-size:11px;color:#64748b;word-break:break-all;background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;">
                ${inviteLink}
              </p>
              <hr style="border:0;border-top:1px solid #f1f5f9;margin:0 0 24px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── POST: নতুন invitation পাঠানো ────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, business_id } = body;

    if (!email || !role || !business_id) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Business info
    const { data: businessData, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id, name')
      .eq('id', business_id)
      .single();

    if (bizError || !businessData) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    // Duplicate pending invite check
    const { data: existing } = await supabaseAdmin
      .from('team_invitations')
      .select('id')
      .eq('business_id', business_id)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email. Use Resend from the pending list.' },
        { status: 409 }
      );
    }

    // Already accepted member check
    const { data: acceptedInvite } = await supabaseAdmin
      .from('team_invitations')
      .select('id')
      .eq('business_id', business_id)
      .eq('email', normalizedEmail)
      .eq('status', 'accepted')
      .maybeSingle();

    if (acceptedInvite) {
      return NextResponse.json(
        { error: 'This person has already joined the workspace.' },
        { status: 409 }
      );
    }

    // Create invitation
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        business_id,
        merchant_id: businessData.merchant_id,
        email: normalizedEmail,
        role,
        status: 'pending',
        resend_count: 0,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('token')
      .single();

    if (inviteError || !invite) {
      console.error('Invite DB error:', inviteError);
      return NextResponse.json({ error: 'Failed to create invitation.' }, { status: 400 });
    }

    const inviteLink = `${BASE_URL}/signup?invite_token=${invite.token}`;
    const workspaceName = businessData.name || SITE_NAME;

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [normalizedEmail],
      subject: `You're invited to join ${workspaceName} on ${SITE_NAME}`,
      html: buildEmailHtml(inviteLink, workspaceName, role, false),
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      await supabaseAdmin.from('team_invitations').delete().eq('token', invite.token);
      return NextResponse.json({ error: 'Failed to send invitation email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Invitation sent successfully!' });

  } catch (error: any) {
    console.error('Team invite error:', error);
    return NextResponse.json({ error: 'Server error.', details: error.message }, { status: 500 });
  }
}

// ─── PATCH: Resend existing invitation (rate limited) ─────────────────────────
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { invite_id, business_id } = body;

    if (!invite_id || !business_id) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Fetch invitation
    const { data: invite, error: fetchError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('id', invite_id)
      .eq('business_id', business_id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invitation not found or already accepted.' }, { status: 404 });
    }

    // Max resend check
    if ((invite.resend_count ?? 0) >= MAX_RESENDS) {
      return NextResponse.json(
        { error: `Maximum resend limit reached (${MAX_RESENDS} resends per invitation).` },
        { status: 429 }
      );
    }

    // Cooldown check
    if (invite.last_resent_at) {
      const hoursSinceLast = (Date.now() - new Date(invite.last_resent_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < RESEND_COOLDOWN_HOURS) {
        const hoursLeft = Math.ceil(RESEND_COOLDOWN_HOURS - hoursSinceLast);
        return NextResponse.json(
          { error: `Please wait ${hoursLeft} more hour${hoursLeft > 1 ? 's' : ''} before resending.` },
          { status: 429 }
        );
      }
    }

    // Business name
    const { data: businessData } = await supabaseAdmin
      .from('businesses')
      .select('name')
      .eq('id', business_id)
      .single();

    const workspaceName = businessData?.name || SITE_NAME;
    const inviteLink = `${BASE_URL}/signup?invite_token=${invite.token}`;

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [invite.email],
      subject: `Reminder: You're invited to join ${workspaceName} on ${SITE_NAME}`,
      html: buildEmailHtml(inviteLink, workspaceName, invite.role, true),
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to resend email. Please try again.' }, { status: 500 });
    }

    // Update resend tracking
    await supabaseAdmin
      .from('team_invitations')
      .update({
        resend_count: (invite.resend_count ?? 0) + 1,
        last_resent_at: new Date().toISOString(),
      })
      .eq('id', invite_id);

    const remaining = MAX_RESENDS - ((invite.resend_count ?? 0) + 1);
    return NextResponse.json({
      success: true,
      message: `Invitation resent! ${remaining} resend${remaining !== 1 ? 's' : ''} remaining.`,
      remaining_resends: remaining,
    });

  } catch (error: any) {
    console.error('Resend invite error:', error);
    return NextResponse.json({ error: 'Server error.', details: error.message }, { status: 500 });
  }
}