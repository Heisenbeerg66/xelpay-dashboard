import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Webhook-এর জন্য Service Role Key দিয়ে সাধারণ Client তৈরি করা হলো (কোনো কুকিজের প্রয়োজন নেই)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;

function generateComplexString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export async function GET() {
    return NextResponse.json({ 
        status: "success", 
        message: "Telegram Webhook is ALIVE and Working! 🚀"
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

async function connectTelegram(code: string, chatId: string | number, username: string | null, displayName: string | null): Promise<string> {
    const { data: merchantData } = await supabase.from('merchants').select('id').eq('telegram_link_code', code).single();
    if (merchantData) {
        await supabase.from('merchants').update({ 
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            telegram_display_name: displayName
        }).eq('id', merchantData.id);
        return "✅ <b>Successfully Connected to Vault!</b>\nYour master alerts will now be sent to this chat.";
    }

    const { data: businessData } = await supabase.from('businesses').select('id, business_name').eq('telegram_link_code', code).single();
    if (businessData) {
        await supabase.from('businesses').update({ 
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            telegram_display_name: displayName,
            is_telegram_enabled: true
        }).eq('id', businessData.id);
        return `✅ <b>Successfully Connected to Business Workspace!</b>\nAlerts for <b>${businessData.business_name}</b> will now be sent here.`;
    }

    return "❌ <b>Connection Failed!</b>\nThe connection code has expired or is invalid. Please generate a new link from your dashboard.";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

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
                        await sendTelegramMessage(chatId, "⚠️ <b>Invalid Command!</b>\nPlease generate a valid connection link from your Xelpay Dashboard.");
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

                await sendTelegramMessage(chatId, "🤔 <b>Where do you want to receive alerts?</b>\n\nYou can receive alerts directly in this chat, or add me to a group to notify your whole team.", replyMarkup);
                return NextResponse.json({ status: 'asked_user' });
            }
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error) {
        console.error("Telegram Webhook Error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}