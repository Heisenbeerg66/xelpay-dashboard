'use server';

import { supabase } from '@/lib/supabase';

// ==========================================
// 1. Auto Business Verification (Previous Code)
// ==========================================
const BLACKLISTED_KEYWORDS = [
  'betting', 'casino', '1xbet', 'melbet', 'gambling', 'porn', 'xxx', 'escort', 'lottery'
];

export async function autoVerifyBusiness(businessId: string, url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return { status: 'pending', reason: 'Website unreachable for auto-check' };

    const htmlContent = await response.text();
    const lowerCaseHtml = htmlContent.toLowerCase();
    const foundKeyword = BLACKLISTED_KEYWORDS.find(keyword => lowerCaseHtml.includes(keyword));

    if (foundKeyword) {
      await supabase.from('businesses').update({ status: 'rejected' }).eq('id', businessId);
      return { status: 'rejected', reason: `Auto-rejected due to policy violation.` };
    }
    return { status: 'pending', reason: 'Passed auto-check, waiting for admin' };
  } catch (error) {
    return { status: 'pending', reason: 'Auto-check error' };
  }
}


// ==========================================
// 2. Webhook Tester
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
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': secretKey // Basic auth simulation
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      return { success: true, message: `Webhook received successfully! (Status: ${response.status})` };
    } else {
      return { success: false, message: `Webhook rejected. Status: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: `Failed to connect. Is the URL correct?` };
  }
}


// ==========================================
// 3. Domain Verification (Meta Tag Approach)
// ==========================================
export async function verifyDomain(businessId: string, url: string, verifyCode: string) {
  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(fetchUrl, { headers: { 'User-Agent': 'Gateway-Bot/1.0' } });
    
    if (!response.ok) throw new Error("Could not load the website.");
    
    const html = await response.text();
    const expectedTag = `<meta name="xelpay-verification" content="${verifyCode}"`;
    const expectedTagSingle = `<meta name='xelpay-verification' content='${verifyCode}'`; // Fallback for single quotes
    
    if (html.includes(expectedTag) || html.includes(expectedTagSingle)) {
      await supabase.from('businesses').update({ is_domain_verified: true }).eq('id', businessId);
      return { success: true, message: "Domain verified successfully!" };
    } else {
      return { success: false, message: "Meta tag not found. Please clear your website cache and try again." };
    }
  } catch (error: any) {
    return { success: false, message: `Could not verify: ${error.message}` };
  }
}