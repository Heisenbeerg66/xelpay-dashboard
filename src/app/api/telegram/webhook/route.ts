import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ডাটাবেস আপডেট করার জন্য Service Role Key লাগবে (যেহেতু এটা ব্যাকএন্ড রিকোয়েস্ট)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;

// ─── ব্রাউজারে টেস্ট করার জন্য GET রিকোয়েস্ট (ALIVE চেকার) ───
export async function GET() {
    return NextResponse.json({ 
        status: "success", 
        message: "Telegram Webhook is ALIVE and Working! 🚀",
        tip: "Now try sending a /start command from your Telegram Bot."
    });
}

// ─── টেলিগ্রামের জন্য POST রিকোয়েস্ট (আসল লজিক) ───

// টেলিগ্রামে নরমাল মেসেজ পাঠানোর ফাংশন
async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
    });
}

// টেলিগ্রামের আগের মেসেজ এডিট করার ফাংশন (বাটন ক্লিক করার পর)
async function editTelegramMessage(chatId: string | number, messageId: number, text: string) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML' }),
    });
}

// ডাটাবেস থেকে বটের ইউজারনেম আনার ফাংশন
async function getBotUsername() {
    const { data } = await supabase.from('site_settings').select('value').eq('key_name', 'telegram').single();
    return data?.value ? data.value.replace('@', '') : 'xelpay_alert_bot';
}

// কানেকশন লজিক (Vault বা Business চেক করে আপডেট করবে)
async function connectTelegram(code: string, chatId: string | number, username: string | null, displayName: string | null): Promise<string> {
    // ১. প্রথমে চেক করব Vault (merchants) এ আছে কিনা
    const { data: merchantData } = await supabase.from('merchants').select('id').eq('telegram_link_code', code).single();
    if (merchantData) {
        await supabase.from('merchants').update({ 
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            telegram_display_name: displayName
        }).eq('id', merchantData.id);
        return "✅ <b>Successfully Connected to Vault!</b>\nYour master alerts will now be sent to this chat.";
    }

    // ২. Vault এ না পেলে চেক করব Business এ আছে কিনা
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

    // ৩. কোড ভুল হলে
    return "❌ <b>Connection Failed!</b>\nThe connection code has expired or is invalid. Please generate a new link from your dashboard.";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // ─── বাটন ক্লিক (Callback Query) হ্যান্ডেল করা ───
        if (body.callback_query) {
            const callbackQuery = body.callback_query;
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            const data = callbackQuery.data; // উদাঃ "connect_dm_TG-XXXX"

            const fromUser = callbackQuery.from || {};
            const username = fromUser.username ? `@${fromUser.username}` : null;
            const displayName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || null;

            if (data.startsWith('connect_dm_')) {
                const code = data.replace('connect_dm_', '');
                const resultMessage = await connectTelegram(code, chatId, username, displayName);
                // মেসেজ এডিট করে সাকসেস মেসেজ দেখাবো
                await editTelegramMessage(chatId, messageId, resultMessage);
            }
            return NextResponse.json({ status: 'success' });
        }

        // ─── নরমাল মেসেজ বা /start হ্যান্ডেল করা ───
        if (body.message && body.message.text) {
            const chatId = body.message.chat.id;
            const chatType = body.message.chat.type; // 'private', 'group', 'supergroup'
            const text = body.message.text.trim();

            const fromUser = body.message.from || {};
            const username = fromUser.username ? `@${fromUser.username}` : null;
            let displayName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || null;

            if (text.startsWith('/start')) {
                const code = text.split(' ')[1]; 

                if (!code) {
                    await sendTelegramMessage(chatId, "⚠️ <b>Invalid Command!</b>\nPlease generate a valid connection link from your Xelpay Dashboard.");
                    return NextResponse.json({ status: 'no_code' });
                }

                // যদি ইউজার গ্রুপে বট অ্যাড করে, তবে সরাসরি গ্রুপেই কানেক্ট হয়ে যাবে
                if (chatType === 'group' || chatType === 'supergroup') {
                    if (body.message.chat.title) {
                        displayName = body.message.chat.title;
                    }
                    const resultMessage = await connectTelegram(code, chatId, username, displayName);
                    await sendTelegramMessage(chatId, resultMessage);
                    return NextResponse.json({ status: 'connected_group' });
                }

                // যদি ইউজার পার্সোনাল মেসেজে বট স্টার্ট দেয়, তবে তাকে বাটন দেখাবো
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