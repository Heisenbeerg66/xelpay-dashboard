import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Resend API ইনিশিয়ালাইজেশন
const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase ক্লায়েন্ট ইনিশিয়ালাইজেশন (Server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ফ্রন্টএন্ড থেকে userEmail পাঠানো হয়েছে, তাই merchant টেবিলের ইমেইলের দরকার নেই
    const { merchant, plan, gateway, trxId, senderNumber, amount, billingCycle, discountAmount, userEmail } = body;

    const finalAmount = amount - (discountAmount || 0);
    let paymentStatus = 'pending'; // admin_orders এর জন্য
    let subStatus = 'pending';     // merchant_subscriptions এর জন্য
    const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

    // ১. ডুপ্লিকেট ট্রানজেকশন আইডি চেক (admin_orders টেবিল থেকে)
    const { data: duplicateOrder } = await supabase
      .from('admin_orders')
      .select('id')
      .eq('payment_reference', trxId.trim())
      .single();
      
    if (duplicateOrder) {
      return NextResponse.json({ error: "Transaction ID already used! (ডুপ্লিকেট পেমেন্ট)" }, { status: 400 });
    }

    // ২. SMS Data Verify (admin_sms_data টেবিল থেকে)
    const { data: smsData } = await supabase
      .from('admin_sms_data')
      .select('*')
      .eq('trx_id', trxId.trim())
      .single();

    if (smsData) {
      // যদি আগে থেকেই used হয়ে থাকে
      if (smsData.is_used) {
        return NextResponse.json({ error: "This Transaction ID is already claimed!" }, { status: 400 });
      }
      // যদি পেমেন্ট অ্যামাউন্ট প্ল্যানের দামের চেয়ে কম হয়
      if (Number(smsData.amount) < finalAmount) {
        return NextResponse.json({ error: `Amount ${smsData.amount} is less than required ${finalAmount}!` }, { status: 400 });
      }
      // কর্পোরেট না হলে সেন্ডার নাম্বার চেক করবে
      if (gateway.account_type !== 'corporate' && smsData.sender_number && !smsData.sender_number.includes(senderNumber.trim())) {
        return NextResponse.json({ error: "Sender number doesn't match our records!" }, { status: 400 });
      }

      // 🟢 Verification Success: admin_sms_data টেবিলে is_used = true করে দাও
      const { error: smsUpdateError } = await supabase
        .from('admin_sms_data')
        .update({ is_used: true })
        .eq('id', smsData.id);

      if (smsUpdateError) throw new Error("Failed to update SMS status.");

      paymentStatus = 'paid';
      subStatus = 'active';
    }

    const now = new Date();
    const expiresAt = billingCycle === 'yearly' 
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) 
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ৩. Insert into merchant_subscriptions
    const { data: newSub, error: subError } = await supabase.from('merchant_subscriptions').insert({
      merchant_id: merchant.id, 
      plan_id: plan.id, 
      billing_cycle: billingCycle, 
      amount_paid: finalAmount,
      currency: 'BDT', 
      status: subStatus, 
      started_at: now.toISOString(), 
      expires_at: expiresAt.toISOString(),
      payment_method: gateway.provider, 
      payment_reference: trxId.trim(),
    }).select('*').single();

    if (subError) throw new Error("Failed to create subscription record.");

    // ৪. Insert into admin_orders
    const { data: newOrder, error: orderError } = await supabase.from('admin_orders').insert({
      merchant_id: merchant.id, 
      plan_id: plan.id, 
      subscription_id: newSub?.id, 
      order_no: orderNo,
      amount: finalAmount, 
      currency: 'BDT', 
      billing_cycle: billingCycle, 
      payment_method: gateway.provider,
      payment_reference: trxId.trim(), 
      gateway_used: gateway.provider, 
      status: paymentStatus,
      sender_number: senderNumber.trim() || null
    }).select('*').single();

    if (orderError) throw new Error("Failed to create order record.");

    // ৫. Update Merchant's Active Plan & Send Email (যদি পেমেন্ট সাকসেস হয়)
    if (paymentStatus === 'paid') {
      // Update merchant table
      await supabase.from('merchants').update({ plan_id: plan.id }).eq('id', merchant.id);

      // ৬. Send Professional Email using Resend
      if (userEmail) {
        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #2563eb; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">XelPay</h1>
              <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 15px;">Payment Receipt & Plan Activation</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
              <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for upgrading your workspace. We have successfully received your payment and your <strong style="color: #0f172a;">${plan.name}</strong> plan is now fully active.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Transaction Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Invoice ID</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; font-family: monospace;">${orderNo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Billing Cycle</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; text-transform: capitalize;">${billingCycle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Transaction ID</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; font-family: monospace;">${trxId}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-bottom: 1px solid #e2e8f0; padding: 8px 0;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 0 0; color: #0f172a; font-size: 16px; font-weight: 600;">Total Paid</td>
                    <td style="padding: 16px 0 0 0; color: #2563eb; font-size: 20px; font-weight: 800; text-align: right;">${finalAmount} BDT</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 30px;">You can download your detailed PDF invoice directly from your billing dashboard.</p>
              
              <div style="text-align: center;">
                <a href="https://xelpay.site/subscriptions" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Go to Dashboard</a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} XelPay. All rights reserved.</p>
            </div>
          </div>
        `;

        // Send Email
        await resend.emails.send({
          from: 'XelPay Billing <billing@xelpay.site>',
          to: userEmail,
          subject: `Payment Receipt - ${orderNo} (XelPay)`,
          html: emailHtml,
        });
      }
    }

    // Return final response
    return NextResponse.json({ success: true, order: newOrder, status: paymentStatus });
    
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

