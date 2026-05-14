import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Resend initialization
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, role, business_id } = await req.json();

    if (!email || !role || !business_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 } as any);
    }

    // বিজনেস থেকে মার্চেন্ট আইডি বের করা
    const { data: businessData, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id')
      .eq('id', business_id)
      .single();

    if (bizError || !businessData) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 } as any);
    }

    // ১. Database-এ invitation ক্রিয়েট করা
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        business_id,
        merchant_id: businessData.merchant_id,
        email: email.toLowerCase(),
        role,
        status: 'pending'
      })
      .select('token')
      .single();

    if (inviteError) {
      return NextResponse.json({ error: 'Failed to create invitation (Already exists?)' }, { status: 400 } as any);
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'XelPay';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xelpay.site';
    const inviteLink = `${baseUrl}/signup?invite_token=${invite.token}`;

    // ২. Resend দিয়ে মেইল পাঠানো (Verified Domain)
    const { data, error: sendError } = await resend.emails.send({
      from: `${siteName} Team <team@xelpay.site>`,
      to: [email],
      subject: `Invitation to join ${siteName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 30px; text-align: center;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">${siteName}</h1>
          <h3 style="color: #0f172a;">You're Invited!</h3>
          <p style="color: #475569; line-height: 1.6;">You have been invited to join the <strong>${siteName}</strong> workspace as a <strong>${role}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="font-size: 11px; color: #94a3b8;">If you did not expect this, you can ignore this email.</p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend Error:", sendError);
      return NextResponse.json({ error: 'Invitation created but mail failed', details: sendError.message }, { status: 500 } as any);
    }

    return NextResponse.json({ success: true, message: "Invitation sent!" });

  } catch (error: any) {
    console.error("Critical Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 } as any);
  }
}