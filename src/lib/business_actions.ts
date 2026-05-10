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

// ─── Vault Data Fetcher for Import (Business Only) ────────────────────────────
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
export async function generateBusinessTelegramCode(businessId: string) {
    try {
        const supabase = await getSupabase();
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

        const { data: merchantData } = await supabase
            .from('merchants')
            .select('telegram_chat_id, telegram_display_name, telegram_username')
            .eq('id', user.id)
            .single();
        if (!merchantData?.telegram_chat_id) throw new Error('No Telegram ID found in vault.');

        // Import korar shomoy webhook crash na korar jonno code new generete ba null rakha hoy
        const newCode = generateComplexString(12);
        await supabase.from('businesses').update({
            telegram_chat_id: merchantData.telegram_chat_id,
            telegram_link_code: newCode, // Webhook theke separate
            telegram_display_name: merchantData.telegram_display_name || null,
            telegram_username: merchantData.telegram_username || null,
            is_telegram_enabled: true,
        }).eq('id', businessId);

        return { success: true, message: 'Telegram imported successfully to Business!' };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function unlinkBusinessTelegram(businessId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };
        
        // BEST PRACTICE: Unlink korlei auto notun 12 digit code toiri hoye jabe
        const newCode = generateComplexString(12);

        const { error } = await supabase.from('businesses').update({
            telegram_chat_id: null,
            telegram_display_name: null,
            telegram_username: null,
            telegram_link_code: newCode,
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

export async function generateBusinessDeviceKey(businessId: string) {
    try {
        const supabase = await getSupabase();
        const randomKey = generateComplexString(24);
        await supabase.from('businesses').update({ device_connection_key: randomKey }).eq('id', businessId);
        return { success: true, key: randomKey };
    } catch (error: any) { return { success: false, message: error.message }; }
}

export async function deleteBusinessDevice(businessId: string) {
    try {
        const supabase = await getSupabase();
        await supabase.from('business_devices').delete().eq('business_id', businessId);
        
        // BEST PRACTICE: Unlink korlei auto notun 24 digit key toiri hoye jabe
        const newKey = generateComplexString(24);
        await supabase.from('businesses').update({ device_connection_key: newKey }).eq('id', businessId);
        
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