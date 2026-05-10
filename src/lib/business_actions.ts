'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

const getSupabase = async () => {
    const cookieStore = await cookies();
    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
    });
};

// ─── Utility: Generate complex alphanumeric string (mixed case + numbers) ─────
function generateComplexString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export async function getBusinessSettings(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function getVaultDataForImport(type: 'telegram' | 'device') {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        if (type === 'telegram') {
            // FIXED: also fetch telegram_display_name and telegram_username
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
                    display_name: data.telegram_display_name || null,
                    username: data.telegram_username || null,
                },
            };
        } else {
            const { data } = await supabase.from('merchant_devices_vault').select('device_name, device_model').eq('merchant_id', user.id).single();
            if (!data) return { success: false, message: 'No connected device found in Vault.' };
            return { success: true, data };
        }
    } catch (error: any) { return { success: false, message: error.message }; }
}

// ─── Business Telegram Actions ────────────────────────────────────────────────
// Telegram codes: 12 characters, mixed case + numbers
export async function generateBusinessTelegramCode(businessId: string) {
    try {
        const supabase = await getSupabase();
        // 12-char mixed code (unchanged)
        const code = generateComplexString(12);
        const { error } = await supabase.from('businesses').update({ telegram_link_code: code }).eq('id', businessId);
        if (error) throw error;
        return { success: true, code };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function importVaultTelegramToBusiness(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // FIXED: also fetch and copy telegram_display_name and telegram_username
        const { data: merchantData } = await supabase
            .from('merchants')
            .select('telegram_chat_id, telegram_link_code, telegram_display_name, telegram_username')
            .eq('id', user.id)
            .single();
        if (!merchantData?.telegram_chat_id) throw new Error('No Telegram ID found in vault.');

        // FIXED: also write display_name, username, and enable telegram
        await supabase.from('businesses').update({
            telegram_chat_id: merchantData.telegram_chat_id,
            telegram_link_code: merchantData.telegram_link_code,
            telegram_display_name: merchantData.telegram_display_name || null,
            telegram_username: merchantData.telegram_username || null,
            is_telegram_enabled: true,
        }).eq('id', businessId);

        return { success: true, message: 'Telegram imported successfully to Business!' };
    } catch (error: any) { return { success: false, message: error.message }; }
}

// ADDED: Unlink business telegram — clears all telegram identity fields
export async function unlinkBusinessTelegram(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };
        const { error } = await supabase.from('businesses').update({
            telegram_chat_id: null,
            telegram_display_name: null,
            telegram_username: null,
            is_telegram_enabled: false,
        }).eq('id', businessId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) { return { success: false, message: error.message }; }
}

// ─── Business Device Actions ──────────────────────────────────────────────────
export async function getBusinessConnectedDevice(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from('business_devices').select('*').eq('business_id', businessId).single();
        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, data: data || null };
    } catch (error: any) { return { success: false, message: error.message }; }
}

// Device keys: 24 characters, uppercase + lowercase + numbers
export async function generateBusinessDeviceKey(businessId: string) {
    try {
        const supabase = await getSupabase();
        // 24-char complex key
        const randomKey = generateComplexString(24);
        await supabase.from('businesses').update({ device_connection_key: randomKey }).eq('id', businessId);
        return { success: true, key: randomKey };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function deleteBusinessDevice(businessId: string) {
    try {
        const supabase = await getSupabase();
        await supabase.from('business_devices').delete().eq('business_id', businessId);
        await supabase.from('businesses').update({ device_connection_key: null }).eq('id', businessId);
        return { success: true };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function importVaultDeviceToBusiness(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: merchantData } = await supabase.from('merchants').select('device_connection_key').eq('id', user.id).single();
        if (!merchantData?.device_connection_key) throw new Error('No device key found in vault.');

        await supabase.from('businesses').update({ device_connection_key: merchantData.device_connection_key }).eq('id', businessId);

        const { data: vaultDevice } = await supabase.from('merchant_devices_vault').select('*').eq('merchant_id', user.id).single();

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

// ─── Vault Actions (Master Device & Telegram) ─────────────────────────────────
export async function getMerchantVaultSettings() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };
        const { data, error } = await supabase.from('merchants').select('*').eq('id', user.id).single();
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Vault Device key: 24 characters, mixed case + numbers
export async function generateDeviceKey() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        // 24-char complex key
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

// Vault Telegram code: 12 characters, mixed case + numbers
export async function generateTelegramCode() {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        // 12-char complex code
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
        const { error } = await supabase
            .from('merchant_devices_vault')
            .delete()
            .eq('merchant_id', user.id);
        if (error) throw error;
        await supabase.from('merchants').update({ device_connection_key: null }).eq('id', user.id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getAppDownloadLinks() {
    try {
        const supabase = await getSupabase();
        const { data } = await supabase
            .from('site_settings')
            .select('key_name, value')
            .in('key_name', ['app_play_store', 'app_direct_apk']);
        const links = { play_store: '', direct_apk: '' };
        data?.forEach((s: any) => {
            if (s.key_name === 'app_play_store') links.play_store = s.value;
            if (s.key_name === 'app_direct_apk') links.direct_apk = s.value;
        });
        return { success: true, links };
    } catch (error: any) {
        return { success: false, links: { play_store: '', direct_apk: '' } };
    }
}