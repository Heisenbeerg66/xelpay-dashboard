'use server';

import { supabase } from '@/lib/supabase';

// ==========================================
// 1. Auto Business Verification
// ==========================================
const BLACKLISTED_KEYWORDS = [
  // Gambling / Betting
  'betting', 'casino', '1xbet', 'melbet', 'betwinner', 'mostbet', 'gambling',
  'sportsbet', 'bet365', 'betway', 'stake.com', 'rollbit', 'roobet',
  'lottery', 'jackpot', 'poker', 'slots', 'roulette', 'blackjack',
  // Adult
  'porn', 'xxx', 'escort', 'adult content', 'sex.com', 'onlyfans', 'nude',
  'nsfw', 'erotic', 'hentai', 'camgirl',
  // Drugs / Illegal
  'buy weed', 'buy drugs', 'dark web', 'darknet', 'cocaine', 'heroin',
  // Scam
  'mlm scheme', 'pyramid scheme', 'get rich quick',
];

const BLACKLISTED_META_PATTERNS = [
  /casino/i, /betting/i, /gambling/i, /poker/i, /xxx/i, /porn/i,
  /escort/i, /adult.?entertainment/i,
];

export async function autoVerifyBusiness(businessId: string, url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'XelPay-Verification-Bot/1.0' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return { status: 'pending', reason: 'Website unreachable for auto-check' };

    const htmlContent = await response.text();
    const lowerCaseHtml = htmlContent.toLowerCase();

    const foundKeyword = BLACKLISTED_KEYWORDS.find(keyword => lowerCaseHtml.includes(keyword));
    if (foundKeyword) {
      await supabase.from('businesses').update({ status: 'rejected' }).eq('id', businessId);
      return { status: 'rejected', reason: 'Auto-rejected due to policy violation: Found restricted keyword.' };
    }

    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].toLowerCase() : '';
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const descText = descMatch ? descMatch[1].toLowerCase() : '';

    for (const pattern of BLACKLISTED_META_PATTERNS) {
      if (pattern.test(titleText) || pattern.test(descText)) {
        await supabase.from('businesses').update({ status: 'rejected' }).eq('id', businessId);
        return { status: 'rejected', reason: 'Auto-rejected: Policy violation in page metadata.' };
      }
    }

    return { status: 'pending', reason: 'Passed auto-check, waiting for admin approval.' };
  } catch {
    return { status: 'pending', reason: 'Auto-check error (Timeout or Network issue).' };
  }
}

// ==========================================
// 2. Duplicate Website/Domain Detection
// ==========================================
export async function checkDuplicateWebsite(url: string): Promise<{
  isDuplicate: boolean;
  existingBusinessId?: string;
  existingBusinessName?: string;
}> {
  if (!url) return { isDuplicate: false };

  try {
    const normalized = normalizeDomain(url);
    if (!normalized) return { isDuplicate: false };

    const { data, error } = await supabase
      .from('businesses')
      .select('id, business_name, website_url')
      .not('website_url', 'is', null)
      .neq('website_url', '');

    if (error || !data) return { isDuplicate: false };

    for (const biz of data) {
      if (!biz.website_url) continue;
      if (isFacebookLink(biz.website_url)) continue;
      const existingNorm = normalizeDomain(biz.website_url);
      if (existingNorm && existingNorm === normalized) {
        return {
          isDuplicate: true,
          existingBusinessId: biz.id,
          existingBusinessName: biz.business_name,
        };
      }
    }

    return { isDuplicate: false };
  } catch {
    return { isDuplicate: false };
  }
}

function normalizeDomain(url: string): string | null {
  try {
    let u = url.trim().toLowerCase();
    if (!u.startsWith('http')) u = 'https://' + u;
    const parsed = new URL(u);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isFacebookLink(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('facebook.com') || u.includes('fb.com') || u.includes('m.facebook.com');
}

// ==========================================
// 3. Webhook Tester
// ==========================================
export async function testWebhookUrl(webhookUrl: string, secretKey: string) {
  try {
    const testPayload = {
      event: 'payment.success.test',
      order_id: 'TEST_' + Math.floor(Math.random() * 100000),
      message: 'This is a test webhook from your Payment Gateway',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Signature': secretKey },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      return { success: true, message: `Webhook received successfully! (Status: ${response.status})` };
    }
    return { success: false, message: `Webhook rejected. Status: ${response.status}` };
  } catch (error: any) {
    return { success: false, message: `Failed to connect. Is the URL correct and publicly accessible?` };
  }
}

// ==========================================
// 4. Domain Verification (Meta Tag Approach)
// ==========================================
export async function verifyDomain(businessId: string, url: string, verifyCode: string) {
  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(fetchUrl, { headers: { 'User-Agent': 'XelPay-Verification-Bot/1.0' } });

    if (!response.ok) throw new Error('Could not load the website.');

    const html = await response.text();
    const expectedTag = `<meta name="xelpay-verification" content="${verifyCode}"`;
    const expectedTagSingle = `<meta name='xelpay-verification' content='${verifyCode}'`;

    if (html.includes(expectedTag) || html.includes(expectedTagSingle)) {
      const { error } = await supabase
        .from('businesses')
        .update({ is_domain_verified: true, website_verified_at: new Date().toISOString() })
        .eq('id', businessId);
      if (error) throw new Error(error.message);
      return { success: true, message: 'Domain verified successfully!' };
    }

    return {
      success: false,
      message: 'Meta tag not found. Add it to your <head>, clear cache, and try again.',
    };
  } catch (error: any) {
    return { success: false, message: `Verification failed: ${error.message}` };
  }
}

// ==========================================
// 5. Ownership Verification for duplicate domains
// ==========================================
export async function verifyDomainOwnership(
  businessId: string,
  url: string,
  verifyCode: string,
  method: 'meta' | 'txt'
): Promise<{ success: boolean; message: string }> {
  if (method === 'meta') {
    return verifyDomain(businessId, url, verifyCode);
  }

  // DNS TXT record check via Cloudflare DoH
  try {
    const domain = normalizeDomain(url);
    if (!domain) throw new Error('Invalid domain');

    const dnsRes = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } }
    );
    const dnsData = await dnsRes.json();

    const txtRecords: string[] = (dnsData?.Answer || []).map((r: any) => r.data || '');
    const expectedTxt = `xelpay-verification=${verifyCode}`;
    const found = txtRecords.some(r => r.replace(/"/g, '').includes(expectedTxt));

    if (found) {
      const { error } = await supabase
        .from('businesses')
        .update({ is_domain_verified: true, website_verified_at: new Date().toISOString() })
        .eq('id', businessId);
      if (error) throw new Error(error.message);
      return { success: true, message: 'Domain ownership verified via DNS TXT record!' };
    }

    return {
      success: false,
      message: `TXT record not found. Add a DNS TXT record with value: ${expectedTxt}`,
    };
  } catch (error: any) {
    return { success: false, message: `DNS verification failed: ${error.message}` };
  }
}