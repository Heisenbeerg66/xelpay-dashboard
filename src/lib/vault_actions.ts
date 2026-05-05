/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

// ─── Supabase Client ──────────────────────────────────────────────────────────

const getSupabase = async () => {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
};

// ─── Encryption Utilities ─────────────────────────────────────────────────────

const getValidKey = (): Buffer => {
    let key = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
    if (key.length < 32) key = key.padEnd(32, '0');
    if (key.length > 32) key = key.substring(0, 32);
    return Buffer.from(key);
};

const encryptData = (text: string): string | null => {
    if (!text) return null;
    const IV_LENGTH = 16;
    const iv         = crypto.randomBytes(IV_LENGTH);
    const cipher     = crypto.createCipheriv('aes-256-cbc', getValidKey(), iv);
    let encrypted    = cipher.update(text);
    encrypted        = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// ─── Complex String Generator Utility ──────────────────────────────────────────
// Generates mixed case letters and numbers
const generateComplexString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

// ═════════════════════════════════════════════════════════════════════════════
// VAULT ACTIONS  (Merchant Level)
// ═════════════════════════════════════════════════════════════════════════════

export async function getVaultGateways(merchantId: string) {
    try {
        const supabase = await getSupabase();

        const { data, error } = await supabase
            .from('merchant_payment_vault')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveVaultGateway(payload: any) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized access.');

        const {
            category, provider, account_type, account_number, account_name,
            branch, routing_number, crypto_network, imap_email, imap_password,
            imap_bank_email, api_key, secret_key, display_name, min_amount, max_amount,
        } = payload;

        const safe_imap_pass  = imap_password ? encryptData(imap_password) : null;
        const safe_api_key    = api_key       ? encryptData(api_key)       : null;
        const safe_secret_key = secret_key    ? encryptData(secret_key)    : null;

        const finalProvider    = provider.toLowerCase();
        const finalAccountType = provider.toLowerCase() === 'usdt'
            ? crypto_network.toLowerCase()
            : (account_type ? account_type.toLowerCase() : null);

        const { data, error } = await supabase
            .from('merchant_payment_vault')
            .insert({
                merchant_id:     user.id,
                category:        category.toLowerCase(),
                provider:        finalProvider,
                account_type:    finalAccountType,
                account_number,
                account_name:    account_name    || null,
                branch:          branch          || null,
                routing_number:  routing_number  || null,
                imap_email:      imap_email      || null,
                imap_password:   safe_imap_pass,
                imap_bank_email: imap_bank_email || null,
                api_key:         safe_api_key,
                secret_key:      safe_secret_key,
                display_name:    display_name || provider,
                min_amount:      parseFloat(min_amount) || 0,
                max_amount:      parseFloat(max_amount) || null,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateVaultGateway(id: string, payload: any) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        const {
            category, provider, account_type, account_number, account_name,
            branch, routing_number, crypto_network, imap_email, imap_password,
            imap_bank_email, api_key, secret_key, display_name, min_amount, max_amount,
        } = payload;

        const finalProvider    = provider.toLowerCase();
        const finalAccountType = provider.toLowerCase() === 'usdt'
            ? crypto_network.toLowerCase()
            : (account_type ? account_type.toLowerCase() : null);

        const updateData: any = {
            category:        category.toLowerCase(),
            provider:        finalProvider,
            account_type:    finalAccountType,
            account_number,
            account_name:    account_name    || null,
            branch:          branch          || null,
            routing_number:  routing_number  || null,
            imap_email:      imap_email      || null,
            imap_bank_email: imap_bank_email || null,
            display_name:    display_name    || provider,
            min_amount:      parseFloat(min_amount) || 0,
            max_amount:      parseFloat(max_amount) || null,
        };

        if (imap_password) updateData.imap_password = encryptData(imap_password);
        if (api_key)       updateData.api_key       = encryptData(api_key);
        if (secret_key)    updateData.secret_key    = encryptData(secret_key);

        const { data, error } = await supabase
            .from('merchant_payment_vault')
            .update(updateData)
            .eq('id', id)
            .eq('merchant_id', user.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteVaultGateway(id: string) {
    try {
        const supabase = await getSupabase();
        const { error } = await supabase.from('merchant_payment_vault').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// MASTER AUTOMATION ACTIONS  (Telegram & Device)
// ═════════════════════════════════════════════════════════════════════════════

export async function getMerchantVaultSettings() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Unauthorized' };

        const { data, error } = await supabase
            .from('merchants')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// FIXED: Generates 24 digit complex key
export async function generateDeviceKey() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Unauthorized' };

        // Logic retained, generation updated: 24 chars, mixed case, numbers
        const newKey = generateComplexString(24);

        const { error } = await supabase
            .from('merchants')
            .update({ device_connection_key: newKey })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true, key: newKey };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// FIXED: Generates 12 digit complex code
export async function generateTelegramCode() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Unauthorized' };

        // Logic retained, generation updated: 12 chars, mixed case, numbers
        const newCode = generateComplexString(12);

        const { error } = await supabase
            .from('merchants')
            .update({ telegram_link_code: newCode })
            .eq('id', user.id);

        if (error) throw error;
        return { success: true, code: newCode };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getConnectedDevice() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Unauthorized' };

        const { data, error } = await supabase
            .from('merchant_devices_vault')
            .select('*')
            .eq('merchant_id', user.id)
            .single(); 

        if (error && error.code !== 'PGRST116') throw error; 
        return { success: true, data: data || null };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteMerchantDevice() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Unauthorized' };

        await supabase.from('merchant_devices_vault').delete().eq('merchant_id', user.id);
        await supabase.from('merchants').update({ device_connection_key: null }).eq('id', user.id);

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getAppDownloadLinks() {
    try {
        const supabase = await getSupabase();

        const { data, error } = await supabase
            .from('site_settings')
            .select('key_name, value')
            .in('key_name', ['play_store', 'direct_apk']);

        if (error) throw error;

        const links = data.reduce((acc: any, curr: any) => {
            acc[curr.key_name] = curr.value;
            return acc;
        }, {});

        return { success: true, links };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getTelegramBotUsername() {
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key_name', 'telegram')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, username: data?.value || 'xelpay_alert_bot' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}