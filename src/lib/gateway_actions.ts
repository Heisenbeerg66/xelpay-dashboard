'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

// ─── Supabase Client ────────────────────────────────────────────────────────

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

// ─── Encryption Utilities ────────────────────────────────────────────────────

const getValidKey = (): Buffer => {
    let key = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
    if (key.length < 32) key = key.padEnd(32, '0');
    if (key.length > 32) key = key.substring(0, 32);
    return Buffer.from(key);
};

const encryptData = (text: string): string | null => {
    if (!text) return null;
    const IV_LENGTH = 16;
    const iv        = crypto.randomBytes(IV_LENGTH);
    const cipher    = crypto.createCipheriv('aes-256-cbc', getValidKey(), iv);
    let encrypted   = cipher.update(text);
    encrypted       = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// ─── Merchant Vault ──────────────────────────────────────────────────────────

export async function getMerchantVault() {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: [] };

    const { data, error } = await supabase
        .from('merchant_payment_vault')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, message: error.message };
    return { success: true, data };
}

// ─── Import from Vault ───────────────────────────────────────────────────────
// Copies ALL vault data directly into business_gateways

export async function importGatewayFromVault(business_id: string, vault_gateway: any) {
    try {
        const supabase = await getSupabase();

        const { data: existingLink } = await supabase
            .from('business_gateways')
            .select('id')
            .eq('business_id', business_id)
            .eq('vault_gateway_id', vault_gateway.id)
            .single();

        if (existingLink) {
            throw new Error('This method is already imported to this business.');
        }

        const { data, error } = await supabase
            .from('business_gateways')
            .insert({
                business_id: business_id,
                vault_gateway_id: vault_gateway.id,
                category:         vault_gateway.category,
                provider:         vault_gateway.provider,
                account_type:     vault_gateway.account_type,
                account_number:   vault_gateway.account_number,
                account_name:     vault_gateway.account_name,
                branch:           vault_gateway.branch,
                routing_number:   vault_gateway.routing_number,
                imap_email:       vault_gateway.imap_email,
                imap_password:    vault_gateway.imap_password,
                imap_bank_email:  vault_gateway.imap_bank_email,
                api_key:          vault_gateway.api_key,
                secret_key:       vault_gateway.secret_key,
                display_name:     vault_gateway.display_name || `${vault_gateway.provider} ${vault_gateway.account_type || ''}`.trim(),
                min_amount:       vault_gateway.min_amount || (vault_gateway.category === 'international' ? 1 : 1000),
                max_amount:       vault_gateway.max_amount || null,
                is_active:        true,
            })
            .select('*')
            .single();

        if (error) {
            if (error.code === '23505') throw new Error('This method is already connected to this business.');
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ─── Save New Gateway ────────────────────────────────────────────────────────
// Saves directly to business_gateways with vault_gateway_id = null

export async function savePaymentGateway(payload: any) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized access.');

        const {
            business_id,
            category,
            provider,
            account_type,
            account_number,
            account_name,
            branch,
            routing_number,
            min_amount,
            max_amount,
            crypto_network,
            imap_email,
            imap_password,
            imap_bank_email,
            api_key,
            secret_key,
            display_name,
            has_discount,
            discount_percent,
            max_discount_amount,
            min_payment_for_discount,
            fixed_charge,
            percent_charge,
        } = payload;

        const safe_imap_pass  = imap_password ? encryptData(imap_password) : null;
        const safe_api_key    = api_key       ? encryptData(api_key)       : null;
        const safe_secret_key = secret_key    ? encryptData(secret_key)    : null;

        const finalProvider    = provider.toLowerCase();
        const finalAccountType = provider.toLowerCase() === 'usdt'
            ? crypto_network.toLowerCase()
            : (account_type ? account_type.toLowerCase() : null);

        const { data: businessData, error: bridgeError } = await supabase
            .from('business_gateways')
            .insert({
                business_id: business_id,
                vault_gateway_id:         null,
                category:                 category.toLowerCase(),
                provider:                 finalProvider,
                account_type:             finalAccountType,
                account_number,
                account_name:             account_name    || null,
                branch:                   branch          || null,
                routing_number:           routing_number  || null,
                imap_email:               imap_email      || null,
                imap_password:            safe_imap_pass,
                imap_bank_email:          imap_bank_email || null,
                api_key:                  safe_api_key,
                secret_key:               safe_secret_key,
                display_name:             display_name || provider,
                min_amount:               parseFloat(min_amount) || (category === 'international' ? 1 : 10),
                max_amount:               parseFloat(max_amount) || null,
                has_discount:             has_discount            || false,
                discount_percent:         parseFloat(discount_percent)           || 0,
                max_discount_amount:      parseFloat(max_discount_amount)        || 0,
                min_payment_for_discount: parseFloat(min_payment_for_discount)   || 0,
                fixed_charge:             fixed_charge   ? parseFloat(fixed_charge)   : null,
                percent_charge:           percent_charge ? parseFloat(percent_charge) : null,
                is_active:                true,
            })
            .select('*')
            .single();

        if (bridgeError) throw new Error('Bridge Error: ' + bridgeError.message);

        return { success: true, data: businessData };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ─── Update Gateway ───────────────────────────────────────────────────────────
// Updates ALL fields locally in business_gateways

export async function updatePaymentGateway(bridge_id: string, payload: any) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        const {
            category,
            provider,
            account_type,
            account_number,
            account_name,
            branch,
            routing_number,
            min_amount,
            max_amount,
            crypto_network,
            imap_email,
            imap_password,
            imap_bank_email,
            api_key,
            secret_key,
            display_name,
            has_discount,
            discount_percent,
            max_discount_amount,
            min_payment_for_discount,
            fixed_charge,
            percent_charge,
        } = payload;

        const finalProvider    = provider.toLowerCase();
        const finalAccountType = provider.toLowerCase() === 'usdt'
            ? crypto_network.toLowerCase()
            : (account_type ? account_type.toLowerCase() : null);

        const bridgeUpdateData: any = {
            category:                 category.toLowerCase(),
            provider:                 finalProvider,
            account_type:             finalAccountType,
            account_number,
            account_name:             account_name    || null,
            branch:                   branch          || null,
            routing_number:           routing_number  || null,
            imap_email:               imap_email      || null,
            imap_bank_email:          imap_bank_email || null,
            display_name,
            min_amount:               parseFloat(min_amount) || 0,
            max_amount:               parseFloat(max_amount) || null,
            has_discount:             has_discount           || false,
            discount_percent:         parseFloat(discount_percent)           || 0,
            max_discount_amount:      parseFloat(max_discount_amount)        || 0,
            min_payment_for_discount: parseFloat(min_payment_for_discount)   || 0,
            fixed_charge:             fixed_charge   ? parseFloat(fixed_charge)   : null,
            percent_charge:           percent_charge ? parseFloat(percent_charge) : null,
        };

        if (imap_password) bridgeUpdateData.imap_password = encryptData(imap_password);
        if (api_key)       bridgeUpdateData.api_key       = encryptData(api_key);
        if (secret_key)    bridgeUpdateData.secret_key    = encryptData(secret_key);

        const { data, error } = await supabase
            .from('business_gateways')
            .update(bridgeUpdateData)
            .eq('id', bridge_id)
            .select('*')
            .single();

        if (error) throw new Error(error.message);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ─── Toggle Status ────────────────────────────────────────────────────────────

export async function toggleGatewayStatus(id: string, currentStatus: boolean) {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from('business_gateways')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    return { success: !error };
}

// ─── Delete Gateway ───────────────────────────────────────────────────────────

export async function deleteGateway(id: string) {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from('business_gateways')
        .delete()
        .eq('id', id);

    return { success: !error };
}