'use server';

import { supabase } from '@/lib/supabase';

// ==========================================
// 1. Auto Business Verification
// ==========================================
const BLACKLISTED_KEYWORDS = [
  'betting', 'casino', '1xbet', 'melbet', 'gambling', 'porn', 'xxx', 'escort', 'lottery'
];

export async function autoVerifyBusiness(businessId: string, url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return { status: 'pending', reason: 'Website unreachable for auto-check' };

    const htmlContent = await response.text();
    const lowerCaseHtml = htmlContent.toLowerCase();
    const foundKeyword = BLACKLISTED_KEYWORDS.find(keyword => lowerCaseHtml.includes(keyword));

    if (foundKeyword) {
      // Status updated to rejected (Ensure SQL constraint is updated as mentioned above)
      await supabase.from('businesses').update({ status: 'rejected' }).eq('id', businessId);
      return { status: 'rejected', reason: `Auto-rejected due to policy violation: Found restricted keyword.` };
    }
    return { status: 'pending', reason: 'Passed auto-check, waiting for admin approval.' };
  } catch (error) {
    return { status: 'pending', reason: 'Auto-check error (Timeout or Network issue).' };
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
      return { success: false, message: `Webhook rejected by server. Status: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: `Failed to connect. Is the URL correct and publicly accessible?` };
  }
}


// ==========================================
// 3. Domain Verification (Meta Tag Approach)
// ==========================================
export async function verifyDomain(businessId: string, url: string, verifyCode: string) {
  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(fetchUrl, { headers: { 'User-Agent': 'XelPay-Verification-Bot/1.0' } });
    
    if (!response.ok) throw new Error("Could not load the website.");
    
    const html = await response.text();
    const expectedTag = `<meta name="xelpay-verification" content="${verifyCode}"`;
    const expectedTagSingle = `<meta name='xelpay-verification' content='${verifyCode}'`; // Fallback for single quotes
    
    if (html.includes(expectedTag) || html.includes(expectedTagSingle)) {
      // Requires the 'is_domain_verified' column to exist in the database
      const { error } = await supabase.from('businesses').update({ is_domain_verified: true }).eq('id', businessId);
      
      if (error) throw new Error(error.message);

      return { success: true, message: "Domain verified successfully!" };
    } else {
      return { success: false, message: "Meta tag not found. Please add the tag to your <head>, clear your website cache, and try again." };
    }
  } catch (error: any) {
    return { success: false, message: `Verification failed: ${error.message}` };
  }
}