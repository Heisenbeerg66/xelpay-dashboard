import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
      return NextResponse.json({ error: 'Invitation already exists or DB error' }, { status: 400 } as any);
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'XelPay';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xelpay.site';
    const inviteLink = `${baseUrl}/signup?invite_token=${invite.token}`;

    // ২. Clean & Minimal Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <div style="margin-bottom: 32px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                        Xel<span style="color: #2563eb;">Pay</span>
                      </h1>
                    </div>
                    <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Join the Team</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
                      You have been invited to join the <strong>${siteName}</strong> workspace to collaborate as <strong>${role}</strong>.
                    </p>
                    <div style="margin-bottom: 32px;">
                      <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Accept Invitation
                      </a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0 0 24px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                      If you weren't expecting this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // ৩. Resend দিয়ে মেইল পাঠানো
    const { data, error: sendError } = await resend.emails.send({
      from: `XelPay Team <team@xelpay.site>`,
      to: [email],
      subject: `Invitation to join ${siteName}`,
      html: emailHtml,
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 } as any);
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully!" });

  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 } as any);
  }
}