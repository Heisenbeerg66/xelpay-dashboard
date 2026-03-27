import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // টেলিগ্রাম থেকে আসা মেসেজ অবজেক্ট চেক করা (অন্য কোনো ইভেন্ট হলে ইগনোর করবে)
        if (!body.message || !body.message.text) {
            return NextResponse.json({ ok: true }); 
        }

        const message = body.message;
        const chatId = message.chat.id.toString();
        const text = message.text.trim();
        const botToken = process.env.XELPAY_BOT_TOKEN;

        // .env ফাইলে টোকেন না থাকলে সার্ভার ক্র্যাশ ঠেকানোর জন্য
        if (!botToken) {
            console.error("Bot token is missing in .env configuration.");
            return NextResponse.json({ ok: false, error: "Server Configuration Error" });
        }

        // ১. মেসেজটি কি /start দিয়ে শুরু হয়েছে?
        if (text.startsWith('/start')) {
            const parts = text.split(' ');
            const code = parts.length > 1 ? parts[1] : null;

            // ২. যদি কোড ছাড়া শুধু /start দেয় (সরাসরি বটে ঢুকে স্টার্ট দিলে)
            if (!code) {
                const welcomeMsg = `👋 Welcome to **XelPay Notifications**!\n\nPlease go to your XelPay Merchant Dashboard and click the "Connect Telegram" button to link your account.`;
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: welcomeMsg, parse_mode: 'Markdown' })
                });
                return NextResponse.json({ ok: true });
            }

            // ৩. ডাটাবেসে চেক করা এই কোডটি কোনো মার্চেন্টের কি না
            const { data: merchant, error } = await supabase
                .from('merchants')
                .select('id, brand_name, telegram_chat_id')
                .eq('telegram_link_code', code)
                .single();

            if (error || !merchant) {
                // কোড ভুল হলে বা ডাটাবেসে না থাকলে এরর মেসেজ দেওয়া
                const errorMsg = `❌ Invalid linking code. Please generate a new link from your XelPay dashboard.`;
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: errorMsg })
                });
                return NextResponse.json({ ok: true });
            }

            // ৪. যদি আগে থেকেই লিঙ্ক করা থাকে (ডাবল ক্লিক ঠেকাতে)
            if (merchant.telegram_chat_id === chatId) {
                const alreadyLinkedMsg = `✅ Your account **${merchant.brand_name}** is already linked to this chat!`;
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: alreadyLinkedMsg, parse_mode: 'Markdown' })
                });
                return NextResponse.json({ ok: true });
            }

            // ৫. নতুন লিংক হলে: মার্চেন্টের Chat ID ডাটাবেসে আপডেট করা
            const { error: updateError } = await supabase
                .from('merchants')
                .update({ telegram_chat_id: chatId })
                .eq('id', merchant.id);

            if (updateError) {
                console.error("Failed to update chat ID:", updateError);
                return NextResponse.json({ ok: false });
            }

            // ৬. সফলতার মেসেজ মার্চেন্টকে পাঠিয়ে দেওয়া
            const successMsg = `🎉 **Successfully linked to XelPay!**\n\nWelcome, **${merchant.brand_name}**. You will now receive all your payment notifications instantly in this chat.`;
            
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: successMsg, parse_mode: 'Markdown' })
            });

        } else {
            // ৭. ইউজার অন্য কোনো টেক্সট মেসেজ দিলে
            const defaultMsg = `ℹ️ This bot is used for XelPay payment notifications.\n\nPlease connect from your merchant dashboard.`;
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: defaultMsg })
            });
        }
        
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram Webhook Error:", error);
        return NextResponse.json({ ok: false });
    }
}