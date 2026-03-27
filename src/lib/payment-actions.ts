'use server';

import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be exactly 32 chars
const IV_LENGTH = 16;

// 🔓 Decryption Function (Export করা হয়নি, তাই async লাগবে না)
function decryptKey(text: string) {
    try {
        if (!text || !text.includes(':')) return text; 
        
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift()!, 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error, falling back to raw text.");
        return text; 
    }
}

// 🔐 Encryption Function (✅ FIX: Added 'async' as required by Next.js Server Actions)
export async function encryptKey(text: string) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// ✅ 10 Digit Random Alphanumeric Generator
function generateRandom10DigitID(brand_name: string) {
    const brandPrefix = brand_name ? brand_name.substring(0, 3).toUpperCase() : 'ORD';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 7; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${brandPrefix}${randomStr}`; 
}

export async function createSecureOrder(payload: any) {
  try {
    // ✅ FIX: Added redirect_url in destructured object
    const { merchant_id, business_id, link_id, fullname, email, phone, amount, currency, brand_name, product_name, is_demo, redirect_url } = payload;
    const newOrderNo = generateRandom10DigitID(brand_name);

    const { error } = await supabase.from('orders').insert({
        merchant_id,
        business_id, // 🚀 FIX: Inserting business_id into the orders table
        order_no: newOrderNo,
        link_id,
        source: 'link', 
        customer_name: fullname,
        customer_email: email,
        customer_number: phone,
        amount,
        currency: currency || 'BDT',
        status: 'pending',
        product_name: product_name || 'Digital Purchase',
        is_demo_order: is_demo || false,
        is_send_email: false,
        redirect_url: redirect_url || null // ✅ Save redirect_url in database
    });

    if (error) throw new Error(error.message);
    return { success: true, orderId: newOrderNo };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function sendSuccessNotifications(merchant: any, order: any, trxId: string) {
    const { order_no, amount, currency, customer_name, product_name, method } = order;
    const formattedMethod = method ? method.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown Method';

    if (merchant.telegram_chat_id) {
        const companyBotToken = process.env.XELPAY_BOT_TOKEN; 
        const text = `💰 **New Payment Received!**\n\n━━━━━━━━━━━━━━\n🔹 **Order ID:** ${order_no}\n🔹 **Amount:** ${amount} ${currency}\n🔹 **Product:** ${product_name}\n🔹 **Customer:** ${customer_name}\n🔹 **Method:** ${formattedMethod}\n━━━━━━━━━━━━━━\n✅ *Status: Paid*`;
        fetch(`https://api.telegram.org/bot${companyBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: merchant.telegram_chat_id, text, parse_mode: 'Markdown' })
        }).catch(e => console.error("Telegram Warning:", e));
    }

    if (merchant.webhook_url) {
        const payloadStr = JSON.stringify({ 
            event: 'payment.success', 
            order_id: order_no, 
            amount, 
            trx_id: trxId,
            payment_method: formattedMethod
        });
        
        const webhookSecret = merchant.webhook_secret ? decryptKey(merchant.webhook_secret) : 'default_secret_key';
        const signature = crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');

        try {
            const response = await fetch(merchant.webhook_url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-XelPay-Signature': signature
                },
                body: payloadStr
            });

            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        } catch (error: any) {
            console.error("Webhook Delivery Failed:", error.message);
            await supabase.from('failed_webhooks').insert({
                merchant_id: merchant.id,
                order_id: order_no,
                url: merchant.webhook_url,
                payload: payloadStr
            });
        }
    }
}

export async function verifyAndCompletePayment(payload: any) {
  try {
    const { trxId, merchantId, orderId, expectedAmount, method, parentMethod } = payload;

    const { data: merchant, error: mErr } = await supabase.from('merchants').select('*').eq('id', merchantId).single();
    if (mErr || !merchant) return { success: false, message: "Merchant not found." };

    if (merchant.is_demo) {
        const { data: dOrder } = await supabase.from('orders').update({ status: 'paid', trx_id: trxId, method }).eq('order_no', orderId).select().single();
        if (dOrder) sendSuccessNotifications(merchant, dOrder, trxId);
        return { success: true, isDemo: true }; 
    }

    const { data: smsData, error: smsError } = await supabase.from('sms_transactions')
      .select('*').eq('merchant_id', merchantId).eq('trx_id', trxId).single();

    if (smsError || !smsData) return { success: false, message: "Transaction Not found." };
    if (smsData.method?.toLowerCase() !== parentMethod?.toLowerCase()) return { success: false, message: `Transaction not found in ${parentMethod}.` };
    if (parseFloat(smsData.amount) !== expectedAmount) return { success: false, message: "Amount mismatch!" };
    if (smsData.is_used) return { success: false, message: "TrxID already used." };

    const { error: updateSmsError } = await supabase.from('sms_transactions')
      .update({ is_used: true }).eq('id', smsData.id).eq('is_used', false); 

    if (updateSmsError) return { success: false, message: "TrxID already used." };

    const { data: order, error: orderErr } = await supabase.from('orders')
      .update({ status: 'paid', trx_id: trxId, method: method })
      .eq('order_no', orderId).select().single();

    if (order) sendSuccessNotifications(merchant, order, trxId);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: "System Error." };
  }
}

// 🚀 NEW: Webhook Notification for Canceled Order (Securely Hash Signed)
async function sendCancelNotifications(merchant: any, order: any) {
    if (merchant.webhook_url) {
        const payloadStr = JSON.stringify({ 
            event: 'payment.canceled', 
            order_id: order.order_no, 
            amount: order.amount 
        });
        
        const webhookSecret = merchant.webhook_secret ? decryptKey(merchant.webhook_secret) : 'default_secret_key';
        const signature = crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');

        try {
            const response = await fetch(merchant.webhook_url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-XelPay-Signature': signature
                },
                body: payloadStr
            });

            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        } catch (error: any) {
            console.error("Cancel Webhook Delivery Failed:", error.message);
            await supabase.from('failed_webhooks').insert({
                merchant_id: merchant.id,
                order_id: order.order_no,
                url: merchant.webhook_url,
                payload: payloadStr
            });
        }
    }
}

// 🚀 NEW: Server Action to Cancel Order & Trigger Webhook
export async function cancelAndNotifyOrder(orderNo: string) {
    try {
        // ১. অর্ডার স্ট্যাটাস 'canceled' করা হলো
        const { data: order, error: orderErr } = await supabase.from('orders')
            .update({ status: 'canceled' })
            .eq('order_no', orderNo)
            .select()
            .single();

        if (orderErr || !order) return { success: false };

        // ২. মার্চেন্টের ডাটা কল করে Webhook ফায়ার করা হলো
        const { data: merchant } = await supabase.from('merchants').select('*').eq('id', order.merchant_id).single();
        if (merchant) {
            await sendCancelNotifications(merchant, order);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false };
    }
}