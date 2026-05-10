import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Webhook-এর জন্য Service Role Key দিয়ে সাধারণ Client তৈরি করা হলো (কোনো কুকিজের প্রয়োজন নেই)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'; // আপনার সাইটের লিংক

function generateComplexString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export async function GET() {
    return NextResponse.json({ 
        status: "success", 
        message: "Webhook API is ALIVE and Working! 🚀"
    });
}

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
    });
}

async function editTelegramMessage(chatId: string | number, messageId: number, text: string) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML' }),
    });
}

async function getBotUsername() {
    const { data } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram').single();
    return data?.value ? data.value.replace('@', '') : 'xelpay_alert_bot';
}

// ─── কানেকশন লজিক (Bilingual & Identity Update) ───
async function connectTelegram(code: string, chatId: string | number, username: string | null, displayName: string | null): Promise<string> {
    const { data: merchantData } = await supabase.from('merchants').select('id').eq('telegram_link_code', code).single();
    if (merchantData) {
        await supabase.from('merchants').update({ 
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            telegram_display_name: displayName
        }).eq('id', merchantData.id);
        return `✅ <b>Successfully Connected!</b>\n<b>সফলভাবে সংযুক্ত হয়েছে!</b>\n\n🔹 <b>Account Type:</b> Master Vault Account\n\nYour master alerts will now be sent to this chat.\nএখন থেকে আপনার সব মাস্টার এলার্ট এই চ্যাটে পাঠানো হবে।`;
    }

    const { data: businessData } = await supabase.from('businesses').select('id, business_name').eq('telegram_link_code', code).single();
    if (businessData) {
        await supabase.from('businesses').update({ 
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            telegram_display_name: displayName,
            is_telegram_enabled: true
        }).eq('id', businessData.id);
        return `✅ <b>Successfully Connected!</b>\n<b>সফলভাবে সংযুক্ত হয়েছে!</b>\n\n🔹 <b>Workspace:</b> ${businessData.business_name}\n\nAlerts for this workspace will now be sent here.\nএই ওয়ার্কস্পেসের সব পেমেন্ট এলার্ট এখন থেকে এখানে আসবে।`;
    }

    return "❌ <b>Connection Failed!</b>\n<b>সংযোগ বিফল হয়েছে!</b>\n\nThe connection code has expired or is invalid.\nকোডটি ভুল বা মেয়াদ শেষ। দয়া করে নতুন লিংক তৈরি করুন।";
}

// ─── ডাটাবেস ইভেন্ট চ্যাট আইডি খোঁজার লজিক ───
async function getChatInfoForEvent(merchantId: string, businessId?: string) {
    if (businessId) {
        const { data } = await supabase.from('businesses').select('telegram_chat_id, business_name, is_telegram_enabled').eq('id', businessId).single();
        if (data?.telegram_chat_id && data.is_telegram_enabled) {
            return { chatId: data.telegram_chat_id, accountName: data.business_name, type: 'Business' };
        }
    }
    if (merchantId) {
        const { data } = await supabase.from('merchants').select('telegram_chat_id, display_name').eq('id', merchantId).single();
        if (data?.telegram_chat_id) {
            return { chatId: data.telegram_chat_id, accountName: data.display_name || 'Master Vault', type: 'Master Vault' };
        }
    }
    return null;
}

// ─── Supabase Database Webhook Handler (Transactions & Notifications) ───
async function handleSupabaseWebhook(body: any) {
    const { type, table, record } = body;

    // ১. Transaction Paid Event
    if (table === 'transactions' && type === 'UPDATE' && record.status === 'paid') {
        const chatInfo = await getChatInfoForEvent(record.merchant_id, record.business_id);
        if (chatInfo?.chatId) {
            const message = `
💎 <b>New Payment Received!</b>
<b>নতুন পেমেন্ট গ্রহণ করা হয়েছে!</b>

🏢 <b>Account:</b> ${chatInfo.accountName}
💰 <b>Amount:</b> ${record.amount} ${record.currency || 'BDT'}
💳 <b>Method:</b> ${record.payment_method || 'Gateway'}
🧾 <b>Trx ID:</b> <code>${record.transaction_id || record.id}</code>

<i>Payment has been verified and updated in your system.</i>`;

            const replyMarkup = {
                inline_keyboard: [[{ text: "👁️ View Order Details", url: `${SITE_URL}/dashboard/transactions` }]]
            };

            await sendTelegramMessage(chatInfo.chatId, message, replyMarkup);
        }
    }

    // ২. Notification Event
    if (table === 'notifications' && type === 'INSERT') {
        const chatInfo = await getChatInfoForEvent(record.merchant_id, record.business_id);
        if (chatInfo?.chatId) {
            const message = `
🔔 <b>New System Notice</b>
<b>নতুন নোটিফিকেশন!</b>

📌 <b>${record.title}</b>
${record.message}`;

            const replyMarkup: any = { inline_keyboard: [] };
            
            // ডাটাবেসে action_url থাকলে বাটন অ্যাড করবে
            if (record.action_url) {
                const actionUrl = record.action_url.startsWith('http') ? record.action_url : `${SITE_URL}${record.action_url}`;
                replyMarkup.inline_keyboard.push([
                    { text: "🔗 View Details / Action", url: actionUrl }
                ]);
            }

            await sendTelegramMessage(chatInfo.chatId, message, replyMarkup.inline_keyboard.length > 0 ? replyMarkup : undefined);
        }
    }

    return NextResponse.json({ status: 'webhook_processed' });
}


export async function POST(req: Request) {
    try {
        const body = await req.json();

        // ─── Supabase Database Webhook ইন্টারসেপ্টর ───
        if (body.type && body.table && body.record) {
            return await handleSupabaseWebhook(body);
        }

        // ─── ১. Bot Kicked or Removed Handler ───
        if (body.my_chat_member) {
            const newStatus = body.my_chat_member.new_chat_member.status;
            if (newStatus === 'left' || newStatus === 'kicked') {
                const chatId = body.my_chat_member.chat.id.toString();
                const newCode = generateComplexString(12);

                await supabase.from('merchants').update({
                    telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode
                }).eq('telegram_chat_id', chatId);

                await supabase.from('businesses').update({
                    telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode, is_telegram_enabled: false
                }).eq('telegram_chat_id', chatId);

                return NextResponse.json({ status: 'unlinked_on_kick' });
            }
        }

        // ─── ২. Callback Query Handler ───
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
                const resultMessage = await connectTelegram(code, chatId, username, displayName);
                await editTelegramMessage(chatId, messageId, resultMessage);
            }
            return NextResponse.json({ status: 'success' });
        }

        // ─── ৩. Message Handler ───
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
                        await sendTelegramMessage(chatId, "⚠️ <b>Invalid Command!</b>\n<b>ভুল কমান্ড!</b>\nPlease generate a valid connection link from your dashboard.\nদয়া করে ড্যাশবোর্ড থেকে সঠিক লিংকটি ব্যবহার করুন।");
                    }
                    return NextResponse.json({ status: 'no_code' });
                }

                if (chatType === 'group' || chatType === 'supergroup') {
                    const groupTitle = chat.title || 'Connected Group';
                    const groupUsername = chat.username ? `@${chat.username}` : null;
                    
                    const resultMessage = await connectTelegram(code, chatId, groupUsername, groupTitle);
                    await sendTelegramMessage(chatId, resultMessage);
                    return NextResponse.json({ status: 'connected_group' });
                }

                const botUsername = await getBotUsername();
                const replyMarkup = {
                    inline_keyboard: [
                        [{ text: "📩 Connect to THIS Chat", callback_data: `connect_dm_${code}` }],
                        [{ text: "👥 Add to a GROUP instead", url: `https://t.me/${botUsername}?startgroup=${code}` }]
                    ]
                };

                await sendTelegramMessage(chatId, "🤔 <b>Where do you want to receive alerts?</b>\n<b>আপনি কোথায় এলার্ট পেতে চান?</b>\n\nYou can receive alerts directly in this chat, or add me to a group.\nআপনি সরাসরি এই চ্যাটে বা একটি গ্রুপে এলার্ট পেতে পারেন।", replyMarkup);
                return NextResponse.json({ status: 'asked_user' });
            }
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}