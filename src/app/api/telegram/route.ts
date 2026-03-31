import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Webhook-এর জন্য Service Role Key লাগবে, কারণ এটা ব্যাকএন্ড-টু-ব্যাকএন্ড রিকোয়েস্ট
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // .env.local এ এটি রাখবেন

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;

// টেলিগ্রামে মেসেজ পাঠানোর ফাংশন
async function sendTelegramMessage(chatId: string | number, text: string) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // যদি মেসেজ না থাকে (যেমন এডিট করা মেসেজ বা অন্য ইভেন্ট), তাহলে ইগনোর করব
        if (!body.message || !body.message.text) {
            return NextResponse.json({ status: 'ignored' });
        }

        const chatId = body.message.chat.id;
        const text = body.message.text.trim(); // মেসেজটি হবে এরকম: "/start TG-12345ABC"

        // যদি মেসেজটি /start দিয়ে শুরু হয়
        if (text.startsWith('/start')) {
            // "/start TG-12345ABC" থেকে স্পেসের পরের অংশ (কোড) আলাদা করা
            const code = text.split(' ')[1]; 

            if (!code) {
                await sendTelegramMessage(chatId, "⚠️ <b>Invalid Command!</b>\nPlease generate a valid connection link from your Xelpay Dashboard.");
                return NextResponse.json({ status: 'no_code' });
            }

            // ১. প্রথমে চেক করব এটা Vault (merchants) এর কোড কিনা
            const { data: merchantData } = await supabase
                .from('merchants')
                .select('id')
                .eq('telegram_link_code', code)
                .single();

            if (merchantData) {
                // Vault-এ পাওয়া গেছে, তাই chat_id আপডেট করে দেব
                await supabase
                    .from('merchants')
                    .update({ telegram_chat_id: chatId.toString() })
                    .eq('id', merchantData.id);

                await sendTelegramMessage(chatId, "✅ <b>Successfully Connected to Vault!</b>\nYour master alerts will now be sent to this chat. You can return to your dashboard.");
                return NextResponse.json({ status: 'vault_connected' });
            }

            // ২. Vault এ না পেলে চেক করব Business টেবিলে আছে কিনা
            const { data: businessData } = await supabase
                .from('businesses')
                .select('id, business_name')
                .eq('telegram_link_code', code)
                .single();

            if (businessData) {
                // Business-এ পাওয়া গেছে, তাই chat_id আপডেট করে দেব
                await supabase
                    .from('businesses')
                    .update({ telegram_chat_id: chatId.toString() })
                    .eq('id', businessData.id);

                await sendTelegramMessage(chatId, `✅ <b>Successfully Connected to Business Workspace!</b>\nAlerts for <b>${businessData.business_name}</b> will now be sent here.`);
                return NextResponse.json({ status: 'business_connected' });
            }

            // ৩. কোথাও কোডটি পাওয়া না গেলে
            await sendTelegramMessage(chatId, "❌ <b>Connection Failed!</b>\nThe connection code has expired or is invalid. Please generate a new link from your dashboard.");
            return NextResponse.json({ status: 'invalid_code' });
        }

        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error("Telegram Webhook Error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}