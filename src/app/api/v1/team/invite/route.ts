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

    // বিজনেস থেকে মার্চেন্ট আইডি বের করা (যাতে ইনভিটেশন টেবিলে সেভ করা যায়)
    const { data: businessData } = await supabaseAdmin
      .from('businesses')
      .select('merchant_id')
      .eq('id', business_id)
      .single();

    // ১. Database-এ invitation ক্রিয়েট করা
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        business_id,
        merchant_id: businessData?.merchant_id, // মার্চেন্ট আইডি অ্যাড করা হলো
        email,
        role,
        status: 'pending'
      })
      .select('token')
      .single();

    if (inviteError) {
      return NextResponse.json({ error: 'Email already invited or DB error' }, { status: 400 } as any);
    }

    // ২. Invitation link তৈরি করা
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xelpay.site';
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'XelPay';
    const inviteLink = `${baseUrl}/signup?invite_token=${invite.token}`;

    // ৩. Premium HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="background-color: #f8fafc; font-family: sans-serif; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #f1f5f9; text-align: center;">
          <h1 style="color: #0f172a;">${siteName}</h1>
          <h2 style="color: #0f172a;">Team Invitation</h2>
          <p style="color: #475569;">You have been invited to join <strong>${siteName}</strong> workspace as <strong>${role}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background: #2563eb; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">If you were not expecting this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    // ৪. Resend দিয়ে মেইল পাঠানো
    const { data, error: sendError } = await resend.emails.send({
      from: `${siteName} Team <team@xelpay.site>`,
      to: [email],
      subject: `Invitation to join ${siteName}`,
      html: emailHtml,
    });

    if (sendError) {
      console.error("Resend Error:", sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 } as any);
    }

    return NextResponse.json({ success: true, message: "Sent!" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 } as any);
  }
}