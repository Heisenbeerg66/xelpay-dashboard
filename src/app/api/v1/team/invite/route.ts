import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Resend initialization (.env থেকে API Key নিচ্ছে)
const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase Admin Client
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

    // ১. Database-এ invitation ক্রিয়েট করা
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        business_id,
        email,
        role,
        status: 'pending'
      })
      .select('token')
      .single();

    if (inviteError) {
      console.error("DB Insert Error:", inviteError);
      return NextResponse.json({ 
        error: 'Failed to create invitation. Maybe already invited?',
        details: inviteError.message 
      }, { status: 400 } as any);
    }

    // ২. Invitation link তৈরি করা
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xelpay.site';
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'XelPay';
    const inviteLink = `${baseUrl}/signup?invite_token=${invite.token}`;

    // ৩. Premium HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; margin: 0; padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <div style="max-width: 480px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); border: 1px solid #f1f5f9; text-align: center;">
                
                <div style="margin-bottom: 32px;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                    ${siteName === 'XelPay' ? 'Xel<span style="color: #2563eb;">Pay</span>' : siteName}
                  </h1>
                </div>

                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Team Invitation</h2>
                
                <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
                  You have been invited to join the <strong>${siteName}</strong> workspace to collaborate and manage operations.
                </p>

                <div style="margin-bottom: 32px;">
                  <div style="display: inline-block; background-color: #f8fafc; color: #475569; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e2e8f0;">
                    Role: ${role}
                  </div>
                </div>

                <div style="margin-bottom: 32px;">
                  <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    Accept Invitation
                  </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0 0 24px;">

                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                  If you were not expecting this invitation, you can safely ignore this email. This invite link is secure and unique to you.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    console.log(`---- SENDING INVITE TO ${email} ----`);

    // ৪. Resend দিয়ে মেইল পাঠানো
    const { data, error: sendError } = await resend.emails.send({
      from: `${siteName} Team <team@xelpay.site>`,
      to: [email],
      subject: `Invitation to join ${siteName}`,
      html: emailHtml,
    });

    if (sendError) {
      console.error("---- RESEND ERROR ----", sendError);
      return NextResponse.json({ 
        error: 'Invitation created but failed to send email.', 
        details: sendError.message 
      }, { status: 500 } as any);
    }

    console.log("---- RESEND SUCCESS ----", data);
    return NextResponse.json({ success: true, message: "Invitation sent successfully!", data });

  } catch (error: any) {
    console.error("---- CRITICAL ERROR ----", error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 } as any);
  }
}