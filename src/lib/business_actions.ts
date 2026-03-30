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
            const { data } = await supabase.from('merchants').select('telegram_chat_id').eq('id', user.id).single();
            if (!data?.telegram_chat_id) return { success: false, message: 'No active Telegram found in Vault.' };
            return { success: true, data: { chat_id: data.telegram_chat_id } };
        } else {
            const { data } = await supabase.from('merchant_devices_vault').select('device_name, device_model').eq('merchant_id', user.id).single();
            if (!data) return { success: false, message: 'No connected device found in Vault.' };
            return { success: true, data };
        }
    } catch (error: any) { return { success: false, message: error.message }; }
}

// ─── Business Telegram Actions (UPDATED FOR MIXED CODE) ───────────────────────
export async function generateBusinessTelegramCode(businessId: string) {
    try {
        const supabase = await getSupabase();
        
        // ভল্টের মতো সেইম লজিক: ওয়ার্ড এবং নম্বরের মিক্স (উদাঃ TG-4F8K9X2P)
        const code = 'TG-' + Math.random().toString(36).substring(2, 12).toUpperCase();
        
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

        const { data: merchantData } = await supabase.from('merchants').select('telegram_chat_id, telegram_link_code').eq('id', user.id).single();
        if (!merchantData?.telegram_chat_id) throw new Error('No Telegram ID found in vault.');

        await supabase.from('businesses').update({
            telegram_chat_id: merchantData.telegram_chat_id,
            telegram_link_code: merchantData.telegram_link_code
        }).eq('id', businessId);

        return { success: true, message: 'Telegram imported successfully to Business!' };
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
        // ডিভাইসের জন্যও মিক্সড কোড
        const randomKey = 'BIZ-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
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