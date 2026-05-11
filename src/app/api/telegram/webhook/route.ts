import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

function generateComplexString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export async function GET() {
    return NextResponse.json({ status: "success", message: "Webhook API is ALIVE and Working! 🚀" });
}

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
    });
}

async function editTelegramMessage(chatId: string | number, messageId: number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
    });
}

async function getBotUsername() {
    const { data } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram').single();
    return data?.value ? data.value.replace('@', '') : 'xelpay_alert_bot';
}

async function connectTelegram(code: string, chatId: string | number, username: string | null, displayName: string | null): Promise<{ text: string, replyMarkup?: any }> {
    const chatStr = chatId.toString();

    const { data: merchantData } = await supabase.from('merchants').select('id').eq('telegram_link_code', code).single();
    if (merchantData) {
        // Fix: Clear previous identical chat IDs to prevent Unique Constraint silent failures
        await supabase.from('merchants').update({ telegram_chat_id: null }).eq('telegram_chat_id', chatStr);

        await supabase.from('merchants').update({ 
            telegram_chat_id: chatStr,
            telegram_username: username,
            telegram_display_name: displayName
        }).eq('id', merchantData.id).select(); // Added .select() to ensure db mutation completes

        return {
            text: `✅ <b>Connection Successful</b>\n<b>সংযোগ সফল হয়েছে</b>\n\n🔹 <b>Account Type:</b> Master Vault\n\nYour master alerts will now be routed here.\nআপনার সব মাস্টার এলার্ট এখন থেকে এই চ্যাটে আসবে।`,
            replyMarkup: { inline_keyboard: [[{ text: "Disconnect ❌", callback_data: `disconnect_m_${merchantData.id}` }]] }
        };
    }

    const { data: businessData } = await supabase.from('businesses').select('id, business_name').eq('telegram_link_code', code).single();
    if (businessData) {
        // Fix: Clear previous identical chat IDs to prevent Unique Constraint silent failures
        await supabase.from('businesses').update({ telegram_chat_id: null, is_telegram_enabled: false }).eq('telegram_chat_id', chatStr);

        await supabase.from('businesses').update({ 
            telegram_chat_id: chatStr,
            telegram_username: username,
            telegram_display_name: displayName,
            is_telegram_enabled: true
        }).eq('id', businessData.id).select(); // Added .select() to ensure db mutation completes

        return {
            text: `✅ <b>Connection Successful</b>\n<b>সংযোগ সফল হয়েছে</b>\n\n🔹 <b>Workspace:</b> ${businessData.business_name}\n\nWorkspace alerts will now be routed here.\nএই ওয়ার্কস্পেসের পেমেন্ট এলার্ট এখন থেকে এখানে আসবে।`,
            replyMarkup: { inline_keyboard: [[{ text: "Disconnect ❌", callback_data: `disconnect_b_${businessData.id}` }]] }
        };
    }

    return {
        text: "❌ <b>Connection Failed</b>\n<b>সংযোগ বিফল</b>\n\nThe connection code has expired or is invalid.\nলিংকটি মেয়াদোত্তীর্ণ বা ভুল।"
    };
}

// ─── ডাটাবেস ইভেন্ট চ্যাট আইডি খোঁজার লজিক (Orders) ───
async function getOrderTargets(merchantId?: string | null, businessId?: string | null) {
    let targets: { chatId: string, accountName: string }[] = [];

    // ১. প্রথমে Business ID থাকলে সেই Business এর চ্যাট আইডি নিবে (Priority 1)
    if (businessId) {
        const { data } = await supabase.from('businesses').select('telegram_chat_id, business_name, is_telegram_enabled').eq('id', businessId).single();
        if (data?.telegram_chat_id && data.is_telegram_enabled) {
            targets.push({ chatId: data.telegram_chat_id, accountName: data.business_name });
            return targets; // Business এ পেলে সরাসরি রিটার্ন করবে, Master এ যাবে না
        }
    }

    // ২. যদি Business এ না থাকে, তবে Master/Merchant এর চ্যাট আইডি নিবে (Priority 2)
    if (merchantId) {
        const { data } = await supabase.from('merchants').select('telegram_chat_id, display_name').eq('id', merchantId).single();
        if (data?.telegram_chat_id) {
            targets.push({ chatId: data.telegram_chat_id, accountName: data.display_name || 'Master Vault' });
        }
    }

    return targets; 
}

// ─── ডাটাবেস ইভেন্ট চ্যাট আইডি খোঁজার লজিক (Notifications) ───
async function getNotificationTargets(merchantId?: string | null, businessId?: string | null) {
    let targets: { chatId: string, accountName: string }[] = [];

    // Universal Notification (কোনো ID না থাকলে)
    if (!merchantId && !businessId) {
        const { data: merchants } = await supabase.from('merchants').select('telegram_chat_id').not('telegram_chat_id', 'is', null);
        const { data: businesses } = await supabase.from('businesses').select('telegram_chat_id').not('telegram_chat_id', 'is', null).eq('is_telegram_enabled', true);
        
        const uniqueChats = new Map<string, string>();
        merchants?.forEach(m => uniqueChats.set(m.telegram_chat_id, 'System Notice'));
        businesses?.forEach(b => uniqueChats.set(b.telegram_chat_id, 'System Notice'));
        
        uniqueChats.forEach((accountName, chatId) => {
            targets.push({ chatId, accountName });
        });
        return targets;
    }

    // Targeted Notification
    let bChatId: string | null = null;
    let bAccountName: string = '';
    if (businessId) {
        const { data } = await supabase.from('businesses').select('telegram_chat_id, business_name, is_telegram_enabled').eq('id', businessId).single();
        if (data?.telegram_chat_id && data.is_telegram_enabled) {
            bChatId = data.telegram_chat_id;
            bAccountName = data.business_name;
        }
    }

    let mChatId: string | null = null;
    let mAccountName: string = '';
    if (merchantId) {
        const { data } = await supabase.from('merchants').select('telegram_chat_id, display_name').eq('id', merchantId).single();
        if (data?.telegram_chat_id) {
            mChatId = data.telegram_chat_id;
            mAccountName = data.display_name || 'Master Vault';
        }
    }

    // দুটিতেই থাকলে এবং চ্যাট আইডি একই হলে শুধু একবার পাঠাবে
    if (mChatId && bChatId && mChatId === bChatId) {
        targets.push({ chatId: mChatId, accountName: `${mAccountName} (Vault & Workspace)` });
    } else {
        // আলাদা হলে বা যেকোনো একটা থাকলে সেগুলোতে পাঠাবে
        if (mChatId) targets.push({ chatId: mChatId, accountName: mAccountName });
        if (bChatId) targets.push({ chatId: bChatId, accountName: bAccountName });
    }

    return targets;
}

// ─── Supabase Database Webhook Handler ───
async function handleSupabaseWebhook(body: any) {
    const { type, table, record } = body;

    // ১. Order Paid Event (Premium Design)
    if (table === 'orders' && type === 'UPDATE' && (record.status === 'success' || record.status === 'paid')) {
        const targets = await getOrderTargets(record.merchant_id, record.business_id);
        
        if (targets.length > 0) {
            const payMethod = record.method ? record.method.toUpperCase() : 'GATEWAY';
            const currency = record.currency || 'BDT';

            const message = `
🟢 <b>Payment Received Successfully</b>
<b>পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে</b>

━━━━━━━━━━━━━━━━━━━━
▪️ <b>Account :</b> ${targets[0].accountName}
▪️ <b>Amount  :</b> ${record.amount} ${currency}
▪️ <b>Method  :</b> ${payMethod}
▪️ <b>Product :</b> ${record.product_name || 'N/A'}
▪️ <b>Trx ID  :</b> <code>${record.trx_id || 'N/A'}</code>
▪️ <b>Order # :</b> <code>${record.order_no || record.id}</code>
━━━━━━━━━━━━━━━━━━━━
<i>This transaction has been automatically verified.</i>`;

            const replyMarkup = {
                inline_keyboard: [[{ text: "View Transaction ➔", url: `${SITE_URL}/dashboard/transactions` }]]
            };

            for (const target of targets) {
                await sendTelegramMessage(target.chatId, message, replyMarkup);
            }
        }
    }

    // ২. Notification Event (Universal or Targeted)
    if (table === 'notifications' && type === 'INSERT') {
        const targets = await getNotificationTargets(record.merchant_id, record.business_id);
        
        if (targets.length > 0) {
            const message = `
📢 <b>System Notice</b>

<b>${record.title}</b>
${record.message}`;

            const replyMarkup: any = { inline_keyboard: [] };
            
            if (record.action_url) {
                const actionUrl = record.action_url.startsWith('http') ? record.action_url : `${SITE_URL}${record.action_url}`;
                replyMarkup.inline_keyboard.push([
                    { text: "View Details ➔", url: actionUrl }
                ]);
            }

            for (const target of targets) {
                await sendTelegramMessage(target.chatId, message, replyMarkup.inline_keyboard.length > 0 ? replyMarkup : undefined);
            }
        }
    }

    return NextResponse.json({ status: 'webhook_processed' });
}


export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.type && body.table && body.record) {
            return await handleSupabaseWebhook(body);
        }

        if (body.my_chat_member) {
            const newStatus = body.my_chat_member.new_chat_member.status;
            if (newStatus === 'left' || newStatus === 'kicked') {
                const chatId = body.my_chat_member.chat.id.toString();
                const newCode = generateComplexString(12);

                await supabase.from('merchants').update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode }).eq('telegram_chat_id', chatId);
                await supabase.from('businesses').update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode, is_telegram_enabled: false }).eq('telegram_chat_id', chatId);

                return NextResponse.json({ status: 'unlinked_on_kick' });
            }
        }

        if (body.callback_query) {
            const callbackQuery = body.callback_query;
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            const data = callbackQuery.data;

            const fromUser = callbackQuery.from || {};
            const username = fromUser.username ? `@${fromUser.username}` : null;
            const displayName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || null;

            if (data.startsWith('connect_dm_')) {
                const code = data.replace('connect_dm_', '');
                const result = await connectTelegram(code, chatId, username, displayName);
                await editTelegramMessage(chatId, messageId, result.text, result.replyMarkup);
            }
            // Disconnect Master
            else if (data.startsWith('disconnect_m_')) {
                const id = data.replace('disconnect_m_', '');
                const newCode = generateComplexString(12);
                await supabase.from('merchants').update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode }).eq('id', id);
                await editTelegramMessage(chatId, messageId, "❌ <b>Disconnected Successfully</b>\n<b>সফলভাবে বিচ্ছিন্ন করা হয়েছে</b>\n\nThis chat will no longer receive Master Vault alerts.");
            }
            // Disconnect Business
            else if (data.startsWith('disconnect_b_')) {
                const id = data.replace('disconnect_b_', '');
                const newCode = generateComplexString(12);
                await supabase.from('businesses').update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode, is_telegram_enabled: false }).eq('id', id);
                await editTelegramMessage(chatId, messageId, "❌ <b>Disconnected Successfully</b>\n<b>সফলভাবে বিচ্ছিন্ন করা হয়েছে</b>\n\nThis chat will no longer receive Workspace alerts.");
            }

            return NextResponse.json({ status: 'success' });
        }

        if (body.message) {
            const chat = body.message.chat;
            const chatId = chat.id;
            const chatType = chat.type;
            const text = body.message.text ? body.message.text.trim() : '';

            if (text.startsWith('/start')) {
                const parts = text.split(/\s+/);
                const code = parts.length > 1 ? parts[1] : null; 

                if (!code) {
                    if (chatType === 'private') {
                        await sendTelegramMessage(chatId, "⚠️ <b>Invalid Command!</b>\n<b>ভুল কমান্ড!</b>\nPlease generate a valid connection link from your dashboard.");
                    }
                    return NextResponse.json({ status: 'no_code' });
                }

                if (chatType === 'group' || chatType === 'supergroup') {
                    const groupTitle = chat.title || 'Connected Group';
                    const groupUsername = chat.username ? `@${chat.username}` : null;
                    
                    const result = await connectTelegram(code, chatId, groupUsername, groupTitle);
                    await sendTelegramMessage(chatId, result.text, result.replyMarkup);
                    return NextResponse.json({ status: 'connected_group' });
                }

                const botUsername = await getBotUsername();
                const replyMarkup = {
                    inline_keyboard: [
                        [{ text: "Connect to THIS Chat ➔", callback_data: `connect_dm_${code}` }],
                        [{ text: "Add to a GROUP instead ➔", url: `https://t.me/${botUsername}?startgroup=${code}` }]
                    ]
                };

                await sendTelegramMessage(chatId, "<b>Where do you want to receive alerts?</b>\n<b>আপনি কোথায় এলার্ট পেতে চান?</b>\n\nYou can receive alerts directly in this chat, or add me to a group.", replyMarkup);
                return NextResponse.json({ status: 'asked_user' });
            }
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}