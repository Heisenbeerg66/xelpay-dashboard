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

// ─── Unlink Merchant Telegram (clears all telegram identity fields) ───────────
export async function unlinkMerchantTelegram() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };
        const { error } = await supabase.from('merchants').update({
            telegram_chat_id: null,
            telegram_display_name: null,
            telegram_username: null,
        }).eq('id', user.id);
        if (error) throw error;
        return { success: true };
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

// ─── Vault Import Support ─────────────────────────────────────────────────────

export async function getVaultDataForImport(type: 'telegram' | 'device') {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        if (type === 'telegram') {
            const { data } = await supabase
                .from('merchants')
                .select('telegram_chat_id, telegram_display_name, telegram_username')
                .eq('id', user.id)
                .single();
            if (!data?.telegram_chat_id) return { success: false, message: 'No active Telegram found in Vault.' };
            return {
                success: true,
                data: {
                    chat_id: data.telegram_chat_id,
                    display_name: data.telegram_display_name,
                    username: data.telegram_username,
                },
            };
        } else {
            const { data } = await supabase
                .from('merchant_devices_vault')
                .select('device_name, device_model')
                .eq('merchant_id', user.id)
                .single();
            if (!data) return { success: false, message: 'No connected device found in Vault.' };
            return { success: true, data };
        }
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function importVaultTelegramToBusiness(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: merchantData } = await supabase
            .from('merchants')
            .select('telegram_chat_id, telegram_link_code, telegram_display_name, telegram_username')
            .eq('id', user.id)
            .single();
        if (!merchantData?.telegram_chat_id) throw new Error('No Telegram ID found in vault.');

        await supabase.from('businesses').update({
            telegram_chat_id: merchantData.telegram_chat_id,
            telegram_link_code: merchantData.telegram_link_code,
            telegram_display_name: merchantData.telegram_display_name,
            telegram_username: merchantData.telegram_username,
            is_telegram_enabled: true,
        }).eq('id', businessId);

        return { success: true, message: 'Telegram imported successfully to Business!' };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function importVaultDeviceToBusiness(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: merchantData } = await supabase
            .from('merchants')
            .select('device_connection_key')
            .eq('id', user.id)
            .single();
        if (!merchantData?.device_connection_key) throw new Error('No device key found in vault.');

        await supabase.from('businesses').update({ device_connection_key: merchantData.device_connection_key }).eq('id', businessId);

        const { data: vaultDevice } = await supabase
            .from('merchant_devices_vault')
            .select('*')
            .eq('merchant_id', user.id)
            .single();

        if (vaultDevice) {
            await supabase.from('business_devices').delete().eq('business_id', businessId);
            await supabase.from('business_devices').insert({
                business_id: businessId,
                connection_key: merchantData.device_connection_key,
                device_name: vaultDevice.device_name,
                device_model: vaultDevice.device_model,
                android_version: vaultDevice.android_version,
                battery_level: vaultDevice.battery_level,
                app_version: vaultDevice.app_version,
                is_active: vaultDevice.is_active,
                last_sync: vaultDevice.last_sync,
                updated_at: new Date().toISOString()
            });
        }
        return { success: true, message: 'Device imported successfully to Business!' };
    } catch (error: any) { return { success: false, message: error.message }; }
}