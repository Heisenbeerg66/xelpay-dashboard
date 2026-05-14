// src/app/api/v1/team/invite/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      role,
      business_id,
      invited_by,
    }: {
      email: string;
      role: string;
      business_id: string;
      invited_by?: string;
    } = body;

    if (!email || !role || !business_id) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // FIXED: name -> business_name
    const { data: businessData, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id, business_name')
      .eq('id', business_id)
      .single();

    if (bizError || !businessData) {
      return NextResponse.json(
        { error: 'Business not found.' },
        { status: 404 }
      );
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: existingInvite } = await supabaseAdmin
      .from('team_invitations')
      .select('id')
      .eq('business_id', business_id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email.' },
        { status: 409 }
      );
    }

    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        business_id,
        email: email.toLowerCase(),
        role,
        token,
        invited_by: invited_by || null,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error('Invite insert error:', inviteError);

      return NextResponse.json(
        { error: 'Failed to create invitation.' },
        { status: 500 }
      );
    }

    // FIXED: name -> business_name
    const workspaceName =
      businessData.business_name || 'Your Workspace';

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    try {
      await sendEmail({
        to: email,
        subject: `You're invited to join ${workspaceName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Team Invitation</h2>

            <p>
              You have been invited to join
              <strong>${workspaceName}</strong>
              as <strong>${role}</strong>.
            </p>

            <p>
              Click the button below to accept the invitation:
            </p>

            <p>
              <a
                href="${inviteUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#000;
                  color:#fff;
                  text-decoration:none;
                  border-radius:8px;
                "
              >
                Accept Invitation
              </a>
            </p>

            <p>
              Or open this link manually:
            </p>

            <p>
              ${inviteUrl}
            </p>

            <p>
              This invitation will expire in 7 days.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error('Team invite error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { invitation_id } = body;

    if (!invitation_id) {
      return NextResponse.json(
        { error: 'Invitation ID is required.' },
        { status: 400 }
      );
    }

    const { data: invitation, error: invitationError } =
      await supabaseAdmin
        .from('team_invitations')
        .select('*')
        .eq('id', invitation_id)
        .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found.' },
        { status: 404 }
      );
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: updateError } = await supabaseAdmin
      .from('team_invitations')
      .update({
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .eq('id', invitation_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to resend invitation.' },
        { status: 500 }
      );
    }

    // FIXED: name -> business_name
    const { data: businessData } = await supabaseAdmin
      .from('businesses')
      .select('business_name')
      .eq('id', invitation.business_id)
      .single();

    // FIXED: name -> business_name
    const workspaceName =
      businessData?.business_name || 'Your Workspace';

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    try {
      await sendEmail({
        to: invitation.email,
        subject: `Invitation to join ${workspaceName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Team Invitation</h2>

            <p>
              You have been invited to join
              <strong>${workspaceName}</strong>
              as <strong>${invitation.role}</strong>.
            </p>

            <p>
              Click below to accept:
            </p>

            <p>
              <a
                href="${inviteUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#000;
                  color:#fff;
                  text-decoration:none;
                  border-radius:8px;
                "
              >
                Accept Invitation
              </a>
            </p>

            <p>${inviteUrl}</p>

            <p>
              This invitation expires in 7 days.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Resend email error:', emailError);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Resend invite error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

function sendEmail(arg0: { to: string; subject: string; html: string; }) {
  throw new Error('Function not implemented.');
}
