import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BOT_TOKEN = process.env.XELPAY_BOT_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'xelpay_alert_bot';

function generateComplexString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

function escapeHTML(text: string | null | undefined): string {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export async function GET() {
    return NextResponse.json({ status: "success", message: "Webhook API is Secure & Running! 🚀" });
}

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
    if (!BOT_TOKEN) return;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
        });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

async function editTelegramMessage(chatId: string | number, messageId: number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML', reply_markup: replyMarkup }),
    });
}

async function answerCallbackQuery(callbackQueryId: string, text: string, showAlert: boolean = true) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text: text, show_alert: showAlert }),
    });
}

async function isGroupAdmin(chatId: string | number, userId: string | number): Promise<boolean> {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok && data.result) {
            const status = data.result.status;
            return status === 'creator' || status === 'administrator';
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function connectTelegram(
    code: string, 
    chatId: string | number, 
    username: string | null, 
    displayName: string | null, 
    forceTakeover: boolean = false
): Promise<{ text: string, replyMarkup?: any }> {
    const chatStr = chatId.toString();

    const { data: targetMerchant } = await supabase.from('merchants').select('id').eq('telegram_link_code', code).single();
    const { data: targetBusiness } = await supabase.from('businesses').select('id, merchant_id, business_name').eq('telegram_link_code', code).single();

    if (!targetMerchant && !targetBusiness) {
        return { text: "❌ <b>Connection Failed</b>\nলিংকটি মেয়াদোত্তীর্ণ বা ভুল। নতুন করে জেনারেট করুন।" };
    }

    const currentMerchantId = targetMerchant ? targetMerchant.id : targetBusiness!.merchant_id;
    let takeoverNotice = '';

    const { data: existingMerchant } = await supabase.from('merchants').select('id').eq('telegram_chat_id', chatStr).single();
    const { data: existingBusinesses } = await supabase.from('businesses').select('id, merchant_id').eq('telegram_chat_id', chatStr);

    const isOwnedByOtherMerchant = (existingMerchant && existingMerchant.id !== currentMerchantId) || 
                                   (existingBusinesses && existingBusinesses.some(b => b.merchant_id !== currentMerchantId));

    if (isOwnedByOtherMerchant) {
        if (!forceTakeover) {
            const otherMerchantId = (existingMerchant && existingMerchant.id !== currentMerchantId) 
                ? existingMerchant.id 
                : existingBusinesses?.find(b => b.merchant_id !== currentMerchantId)?.merchant_id;
            
            let maskedEmail = 'Another Account';
            if (otherMerchantId) {
                const { data: authData } = await supabase.auth.admin.getUserById(otherMerchantId);
                if (authData?.user?.email) {
                    const parts = authData.user.email.split('@');
                    if (parts.length === 2) {
                        maskedEmail = `${parts[0].substring(0, 2)}***@${parts[1]}`;
                    }
                }
            }

            return {
                text: `⚠️ <b>Already Connected</b>\n\nThis group/chat is currently connected to another account (<code>${maskedEmail}</code>).\n\nDo you want to disconnect it from that account and take over?`,
                replyMarkup: {
                    inline_keyboard: [[{ text: "Confirm Takeover 🔄", callback_data: `takeover_${code}` }]]
                }
            };
        } else {
            const dummyCode = generateComplexString(12);
            await supabase.from('merchants').update({ telegram_chat_id: null, telegram_link_code: dummyCode }).eq('telegram_chat_id', chatStr);
            await supabase.from('businesses').update({ telegram_chat_id: null, is_telegram_enabled: false, telegram_link_code: dummyCode }).eq('telegram_chat_id', chatStr);
            takeoverNotice = `\n⚠️ <i>Unlinked from previous account.</i>`;
        }
    }

    if (targetMerchant) {
        const newCode = generateComplexString(12);
        await supabase.from('merchants').update({ 
            telegram_chat_id: chatStr,
            telegram_username: username,
            telegram_display_name: displayName,
            telegram_link_code: newCode 
        }).eq('id', targetMerchant.id).select();

        return {
            text: `✅ <b>Master Vault Connected</b>\n<b>মাস্টার ভল্ট সংযোগ সফল</b>${takeoverNotice}\n\nYour master alerts will now be routed here.`,
            replyMarkup: { inline_keyboard: [[{ text: "Disconnect ❌", callback_data: `disconnect_m_${targetMerchant.id}` }]] }
        };
    }

    if (targetBusiness) {
        if (existingMerchant && existingMerchant.id === currentMerchantId && !forceTakeover) {
            return { 
                text: `⚠️ <b>Already in Vault</b>\n\nএই চ্যাটটি অলরেডি আপনার Master Vault-এ যুক্ত আছে।\nনতুন করে কানেক্ট করার প্রয়োজন নেই, দয়া করে ড্যাশবোর্ড থেকে <b>"Import from Vault"</b> বাটনে ক্লিক করুন।` 
            };
        }

        const newCode = generateComplexString(12);
        await supabase.from('businesses').update({ 
            telegram_chat_id: chatStr,
            telegram_username: username,
            telegram_display_name: displayName,
            telegram_link_code: newCode,
            is_telegram_enabled: true
        }).eq('id', targetBusiness.id).select();

        return {
            text: `✅ <b>Workspace Connected</b>\n<b>ওয়ার্কস্পেস সংযোগ সফল</b>${takeoverNotice}\n\n🔹 <b>Workspace:</b> ${escapeHTML(targetBusiness.business_name)}\n\nWorkspace alerts will now be routed here.`,
            replyMarkup: { inline_keyboard: [[{ text: "Disconnect ❌", callback_data: `disconnect_b_${targetBusiness.id}` }]] }
        };
    }

    return { text: "❌ <b>Unknown Error Occurred</b>" };
}

async function getOrderTargets(merchantId?: string | null, businessId?: string | null) {
    let targets: { chatId: string, accountName: string }[] = [];

    if (businessId) {
        const { data } = await supabase.from('businesses').select('telegram_chat_id, business_name, is_telegram_enabled').eq('id', businessId).single();
        if (data?.telegram_chat_id && data.is_telegram_enabled) {
            targets.push({ chatId: data.telegram_chat_id, accountName: data.business_name });
            return targets; 
        }
    }

    if (merchantId) {
        const { data } = await supabase.from('merchants').select('telegram_chat_id, display_name').eq('id', merchantId).single();
        if (data?.telegram_chat_id) {
            targets.push({ chatId: data.telegram_chat_id, accountName: data.display_name || 'Master Vault' });
        }
    }

    return targets; 
}

async function getNotificationTargets(merchantId?: string | null, businessId?: string | null) {
    let targets: { chatId: string, accountName: string }[] = [];

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

    if (mChatId && bChatId && mChatId === bChatId) {
        targets.push({ chatId: mChatId, accountName: `${mAccountName} (Vault & Workspace)` });
    } else {
        if (mChatId) targets.push({ chatId: mChatId, accountName: mAccountName });
        if (bChatId) targets.push({ chatId: bChatId, accountName: bAccountName });
    }

    return targets;
}

async function handleSupabaseWebhook(body: any) {
    const { type, table, record } = body;

    if (table === 'orders' && type === 'UPDATE' && (record.status === 'success' || record.status === 'paid')) {
        const targets = await getOrderTargets(record.merchant_id, record.business_id);
        
        if (targets.length > 0) {
            const payMethod = record.method ? record.method.toUpperCase() : 'GATEWAY';
            const currency = record.currency || 'BDT';

            const message = `
🟢 <b>Payment Received Successfully</b>
<b>পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে</b>

━━━━━━━━━━━━━━━━━━━━
▪️ <b>Account :</b> ${escapeHTML(targets[0].accountName)}
▪️ <b>Amount  :</b> ${record.amount} ${currency}
▪️ <b>Method  :</b> ${escapeHTML(payMethod)}
▪️ <b>Product :</b> ${escapeHTML(record.product_name) || 'N/A'}
▪️ <b>Trx ID  :</b> <code>${escapeHTML(record.trx_id) || 'N/A'}</code>
▪️ <b>Order # :</b> <code>${escapeHTML(record.order_no) || record.id}</code>
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

    if (table === 'notifications' && type === 'INSERT') {
        const targets = await getNotificationTargets(record.merchant_id, record.business_id);
        
        if (targets.length > 0) {
            const message = `📢 <b>System Notice</b>\n\n<b>${escapeHTML(record.title)}</b>\n${escapeHTML(record.message)}`;

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

        // ─── 1. Supabase Webhook Authorization ───
        if (body.type && body.table && body.record) {
            const expectedSupabaseSecret = process.env.SUPABASE_WEBHOOK_SECRET;
            if (expectedSupabaseSecret) {
                const incomingSecret = req.headers.get('x-supabase-webhook-secret');
                if (incomingSecret !== expectedSupabaseSecret) {
                    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
                }
            }
            return await handleSupabaseWebhook(body);
        }

        // ─── 2. Telegram Webhook Authorization ───
        const expectedTelegramSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (expectedTelegramSecret) {
            const incomingTelegramSecret = req.headers.get('x-telegram-bot-api-secret-token');
            if (incomingTelegramSecret !== expectedTelegramSecret) {
                return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
            }
        }

        // ─── 3. Event Handlers ───
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
            const userId = fromUser.id;
            const username = fromUser.username ? `@${fromUser.username}` : null;
            const displayName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || null;
            const chatType = callbackQuery.message.chat.type;

            if (data.startsWith('takeover_')) {
                const code = data.replace('takeover_', '');

                if (chatType === 'group' || chatType === 'supergroup') {
                    // Check if clicked anonymously or as normal user
                    const isAnonymousAdminClick = fromUser.username === 'GroupAnonymousBot';
                    let isAdmin = false;
                    
                    if (isAnonymousAdminClick) {
                        isAdmin = true;
                    } else {
                        isAdmin = await isGroupAdmin(chatId, userId);
                    }

                    if (!isAdmin) {
                        await answerCallbackQuery(callbackQuery.id, "⚠️ Access Denied: Only admins can confirm this takeover.");
                        return NextResponse.json({ status: 'not_admin' });
                    }
                }

                const result = await connectTelegram(code, chatId, username, displayName, true);
                await editTelegramMessage(chatId, messageId, result.text, result.replyMarkup);
                return NextResponse.json({ status: 'success' });
            }

            if (data.startsWith('connect_dm_')) {
                const code = data.replace('connect_dm_', '');
                const result = await connectTelegram(code, chatId, username, displayName, false);
                await editTelegramMessage(chatId, messageId, result.text, result.replyMarkup);
            }
            else if (data.startsWith('disconnect_m_')) {
                const id = data.replace('disconnect_m_', '');
                const newCode = generateComplexString(12);
                await supabase.from('merchants').update({ telegram_chat_id: null, telegram_display_name: null, telegram_username: null, telegram_link_code: newCode }).eq('id', id);
                await editTelegramMessage(chatId, messageId, "❌ <b>Disconnected Successfully</b>\n<b>সফলভাবে বিচ্ছিন্ন করা হয়েছে</b>\n\nThis chat will no longer receive Master Vault alerts.");
            }
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
            const userId = body.message.from?.id;

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
                    // ফিক্সড: যদি Sender Chat (চ্যানেল/অ্যানোনিমাস) থাকে, তবে সে নিশ্চিত এডমিন
                    const isAnonymousOrChannelAdmin = !!body.message.sender_chat || body.message.from?.username === 'GroupAnonymousBot';
                    
                    let isAdmin = false;
                    
                    if (isAnonymousOrChannelAdmin) {
                        isAdmin = true; // অটোমেটিক অ্যাডমিন এক্সেস 
                    } else if (userId) {
                        isAdmin = await isGroupAdmin(chatId, userId);
                    }

                    if (!isAdmin) {
                        await sendTelegramMessage(chatId, "⚠️ <b>Access Denied</b>\n\nOnly group administrators can connect or configure this bot. Please ask an admin to send the connection command.");
                        return NextResponse.json({ status: 'not_admin' });
                    }

                    const groupTitle = chat.title || 'Connected Group';
                    const groupUsername = chat.username ? `@${chat.username}` : null;
                    
                    const result = await connectTelegram(code, chatId, groupUsername, groupTitle, false);
                    await sendTelegramMessage(chatId, result.text, result.replyMarkup);
                    return NextResponse.json({ status: 'connected_group' });
                }

                const replyMarkup = {
                    inline_keyboard: [
                        [{ text: "Connect to THIS Chat ➔", callback_data: `connect_dm_${code}` }],
                        [{ text: "Add to a GROUP instead ➔", url: `https://t.me/${BOT_USERNAME}?startgroup=${code}` }]
                    ]
                };

                await sendTelegramMessage(chatId, "<b>Where do you want to receive alerts?</b>\n<b>আপনি কোথায় এলার্ট পেতে চান?</b>\n\nYou can receive alerts directly in this chat, or add me to a group.", replyMarkup);
                return NextResponse.json({ status: 'asked_user' });
            }
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error) {
        console.error("Webhook Error Exception:", error);
        return NextResponse.json({ status: 'error_logged_but_ok' }, { status: 200 });
    }
}