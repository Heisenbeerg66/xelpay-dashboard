import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// সিকিউর ভাবে ডেটাবেস আপডেট করার জন্য
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchant, plan, gateway, trxId, senderNumber, amount, billingCycle, discountAmount } = body;

    const finalAmount = amount - discountAmount;
    let paymentStatus = 'pending';
    const orderNo = `ADM-${Date.now().toString(36).toUpperCase()}`;

    // ১. ডুপ্লিকেট অর্ডার চেক
    const { data: duplicateOrder } = await supabase.from('admin_orders').select('id').eq('payment_reference', trxId.trim()).single();
    if (duplicateOrder) return NextResponse.json({ error: "Transaction ID already used." }, { status: 400 });

    // ২. SMS Data Verify (admin_sms_data)
    const { data: smsData } = await supabase.from('admin_sms_data').select('*').eq('trx_id', trxId.trim()).single();

    if (smsData) {
      if (smsData.is_used) return NextResponse.json({ error: "Transaction ID is already claimed!" }, { status: 400 });
      if (Number(smsData.amount) < finalAmount) return NextResponse.json({ error: `Amount ${smsData.amount} is less than required ${finalAmount}!` }, { status: 400 });
      if (gateway.account_type !== 'corporate' && smsData.sender_number && !smsData.sender_number.includes(senderNumber.trim())) {
        return NextResponse.json({ error: "Sender number doesn't match!" }, { status: 400 });
      }

      // Success: Mark SMS Data as used
      await supabase.from('admin_sms_data').update({ is_used: true }).eq('id', smsData.id);
      paymentStatus = 'paid'; // Admin orders status
    }

    const now = new Date();
    const expiresAt = billingCycle === 'yearly' ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ৩. Insert Subscription
    const { data: newSub } = await supabase.from('merchant_subscriptions').insert({
      merchant_id: merchant.id, plan_id: plan.id, billing_cycle: billingCycle, amount_paid: finalAmount,
      currency: 'BDT', status: paymentStatus === 'paid' ? 'active' : 'pending', started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
      payment_method: gateway.provider, payment_reference: trxId.trim(),
    }).select('*').single();

    // ৪. Insert Admin Order
    const { data: newOrder } = await supabase.from('admin_orders').insert({
      merchant_id: merchant.id, plan_id: plan.id, subscription_id: newSub?.id, order_no: orderNo,
      amount: finalAmount, currency: 'BDT', billing_cycle: billingCycle, payment_method: gateway.provider,
      payment_reference: trxId.trim(), gateway_used: gateway.provider, status: paymentStatus,
      sender_number: senderNumber.trim() || null
    }).select('*').single();

    // ৫. Update Merchant Plan
    if (paymentStatus === 'paid') {
      await supabase.from('merchants').update({ plan_id: plan.id }).eq('id', merchant.id);

      // ৬. Send Professional Email using Resend
      if (merchant.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">XelPay Payment Receipt</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #334155;">Hello ${merchant.business_name || 'Merchant'},</p>
              <p style="font-size: 16px; color: #334155;">Thank you for your payment. Your subscription has been successfully activated.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Invoice Number: <strong style="color: #0f172a;">${orderNo}</strong></p>
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Plan: <strong style="color: #0f172a;">${plan.name} (${billingCycle})</strong></p>
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Amount Paid: <strong style="color: #2563eb; font-size: 18px;">${finalAmount} BDT</strong></p>
                <p style="margin: 0; color: #64748b; font-size: 14px;">Transaction ID: <strong style="color: #0f172a;">${trxId}</strong></p>
              </div>
              
              <p style="font-size: 14px; color: #64748b;">You can download the detailed PDF invoice from your Billing Dashboard.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://xelpay.site/subscriptions" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Manage Subscription</a>
              </div>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: 'XelPay Billing <billing@xelpay.site>',
          to: merchant.email,
          subject: `Payment Receipt - ${orderNo} (XelPay)`,
          html: emailHtml,
        });
      }
    }

    return NextResponse.json({ success: true, order: newOrder, status: paymentStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}