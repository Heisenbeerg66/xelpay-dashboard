'use client';

import { useState, useEffect } from 'react';
import {
  Code, BookOpen, Webhook, Shield, Key, Copy, CheckCircle, ExternalLink,
  ChevronRight, Zap, Globe, Terminal, Package, Activity, Lock, ArrowRight,
  Server, RefreshCw, AlertCircle, Clock, Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// ── Types ─────────────────────────────────────────────────────
type Section = 'overview' | 'authentication' | 'create-payment' | 'verify-payment' | 'webhook' | 'status-codes' | 'callbacks';

const SECTIONS: { id: Section; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'authentication', label: 'Authentication', icon: Lock },
  { id: 'create-payment', label: 'Create Payment', icon: Zap },
  { id: 'verify-payment', label: 'Verify Payment', icon: CheckCircle },
  { id: 'webhook', label: 'Webhook Events', icon: Webhook },
  { id: 'callbacks', label: 'Callbacks & Redirect', icon: ArrowRight },
  { id: 'status-codes', label: 'Status Codes', icon: ActivityIcon },
];

function ActivityIcon({ size = 16, className = '' }) {
  return <Activity size={size} className={className} />;
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const copy = () => { navigator.clipboard.writeText(code); toast.success('Copied!'); };
  return (
    <div className="relative bg-slate-900 dark:bg-[#060d1a] rounded-2xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-white transition-colors">
          <Copy size={11} /> Copy
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

function Badge({ method }: { method: 'POST' | 'GET' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${method === 'POST' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {method}
    </span>
  );
}

function EndpointHeader({ method, path, desc }: { method: 'POST' | 'GET'; path: string; desc: string }) {
  return (
    <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Badge method={method} />
        <code className="text-sm font-mono font-black text-slate-900 dark:text-white">{path}</code>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function ParamRow({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{name}</code>
          {required && <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded uppercase">required</span>}
        </div>
      </td>
      <td className="py-3 pr-4"><code className="text-xs font-mono text-slate-500">{type}</code></td>
      <td className="py-3 text-xs text-slate-600 dark:text-slate-400">{desc}</td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [apiKey, setApiKey] = useState('xp_sec_••••••••••••••••••••••••••••••••');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from('businesses').select('secret_key, website_url').eq('merchant_id', user.id).eq('status', 'active').limit(1).maybeSingle();
      if (biz?.secret_key) setApiKey(biz.secret_key);
      if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
    };
    load();
  }, []);

  const API_BASE = `${baseUrl}/api/v1`;

  const navItem = (id: Section, label: string, Icon: any) => (
    <button key={id} onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${activeSection === id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
      <Icon size={15} />
      {label}
    </button>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center">
              <Code size={20} />
            </div>
            API Documentation
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Complete reference for integrating XelPay into your application.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Nav */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm lg:sticky lg:top-6 space-y-1">
              {SECTIONS.map(s => navItem(s.id, s.label, s.icon))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── OVERVIEW ── */}
            {activeSection === 'overview' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Getting Started</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    The XelPay REST API lets you create payment sessions, receive webhook notifications, and verify payment status programmatically. All requests use JSON and require Bearer token authentication.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Globe, title: 'Base URL', value: `${baseUrl}/api/v1` },
                      { icon: Shield, title: 'Auth', value: 'Bearer Token' },
                      { icon: Layers, title: 'Format', value: 'JSON' },
                    ].map(item => (
                      <div key={item.title} className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <item.icon size={16} className="text-blue-600 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                        <p className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5 break-all">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-base font-black text-slate-900 dark:text-white mb-4">Quick Start</h2>
                  <div className="space-y-3">
                    {[
                      { step: '1', text: 'Get your API credentials from Brand Settings → API & Webhooks' },
                      { step: '2', text: 'Create a payment session with POST /api/v1/payment/create' },
                      { step: '3', text: 'Redirect your customer to the returned payment_url' },
                      { step: '4', text: 'Receive webhook event when payment is verified' },
                      { step: '5', text: 'Verify the webhook signature and fulfill the order' },
                    ].map(item => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{item.step}</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AUTHENTICATION ── */}
            {activeSection === 'authentication' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Authentication</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    All API requests must include your <strong className="text-slate-900 dark:text-white">Secret Key</strong> as a Bearer token in the Authorization header. Never expose your secret key in client-side code.
                  </p>
                  <CodeBlock language="HTTP Header" code={`Authorization: Bearer ${apiKey}`} />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <span className="font-black">Security warning:</span> Your secret key grants full API access. Store it in environment variables, never in source code or version control. Rotate immediately if compromised from Brand Settings.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Example Request</h3>
                  <CodeBlock language="cURL" code={`curl -X POST ${API_BASE}/payment/create \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 500, "order_id": "INV-001", "customer_name": "John Doe"}'`} />
                </div>
              </div>
            )}

            {/* ── CREATE PAYMENT ── */}
            {activeSection === 'create-payment' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">Create Payment</h2>
                  <EndpointHeader method="POST" path="/api/v1/payment/create"
                    desc="Creates a new payment session and returns a hosted checkout URL to redirect your customer to." />

                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Request Body</h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-5">
                    <table className="w-full">
                      <thead><tr className="bg-slate-50 dark:bg-[#0B1120]">
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Parameter</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                      </tr></thead>
                      <tbody className="px-4">
                        <ParamRow name="amount" type="number" required desc="Payment amount in the business currency" />
                        <ParamRow name="order_id" type="string" required desc="Your unique order/invoice identifier" />
                        <ParamRow name="customer_name" type="string" desc="Full name of the customer" />
                        <ParamRow name="customer_phone" type="string" desc="Customer phone number" />
                        <ParamRow name="customer_email" type="string" desc="Customer email address" />
                        <ParamRow name="product_name" type="string" desc="Product or service name displayed on checkout" />
                        <ParamRow name="redirect_url" type="string" desc="Override success redirect URL for this payment" />
                        <ParamRow name="cancel_url" type="string" desc="Override cancel redirect URL for this payment" />
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Example Request</h3>
                  <CodeBlock language="Node.js" code={`const axios = require('axios');

const response = await axios.post('${API_BASE}/payment/create', {
  amount: 500.00,
  order_id: 'INV-12345',
  customer_name: 'John Doe',
  customer_phone: '017XXXXXXXX',
  customer_email: 'john@example.com',
  product_name: 'Premium Subscription',
  redirect_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
}, {
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  }
});

// Redirect customer to payment URL
console.log(response.data.payment_url);`} />

                  <div className="mt-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Success Response</h3>
                    <CodeBlock language="JSON" code={`{
  "success": true,
  "payment_url": "${baseUrl}/pay/ord_abc123xyz",
  "order_id": "INV-12345",
  "order_ref": "ord_abc123xyz",
  "amount": 500.00,
  "currency": "BDT",
  "expires_at": "2026-01-01T12:30:00Z"
}`} />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">PHP Example</h3>
                  <CodeBlock language="PHP" code={`<?php
$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => '${API_BASE}/payment/create',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode([
    'amount' => 500.00,
    'order_id' => 'INV-12345',
    'customer_name' => 'John Doe',
    'customer_phone' => '017XXXXXXXX',
  ]),
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer YOUR_SECRET_KEY',
    'Content-Type: application/json',
  ],
]);
$response = json_decode(curl_exec($ch));
header('Location: ' . $response->payment_url);`} />
                </div>
              </div>
            )}

            {/* ── VERIFY PAYMENT ── */}
            {activeSection === 'verify-payment' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">Verify Payment Status</h2>
                  <EndpointHeader method="GET" path="/api/v1/payment/verify?order_id={order_id}"
                    desc="Check the current status of a payment by your order ID. Use this to poll or verify after webhook delivery." />

                  <CodeBlock language="Node.js" code={`const response = await axios.get('${API_BASE}/payment/verify', {
  params: { order_id: 'INV-12345' },
  headers: { 'Authorization': 'Bearer YOUR_SECRET_KEY' }
});

if (response.data.status === 'success') {
  // Payment verified — fulfill the order
  fulfillOrder(response.data.order_id);
}`} />

                  <div className="mt-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Response</h3>
                    <CodeBlock language="JSON" code={`{
  "success": true,
  "order_id": "INV-12345",
  "status": "success",
  "amount": 500.00,
  "currency": "BDT",
  "method": "bkash",
  "trx_id": "8N7AB23KC1",
  "verified_at": "2026-01-01T12:15:00Z"
}`} />
                  </div>
                </div>
              </div>
            )}

            {/* ── WEBHOOK ── */}
            {activeSection === 'webhook' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Webhook Events</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    XelPay sends a POST request to your webhook URL when a payment event occurs. Always verify the signature to ensure authenticity.
                  </p>

                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Event Payload</h3>
                  <CodeBlock language="JSON" code={`{
  "event": "payment.verified",
  "timestamp": "2026-01-01T12:15:00Z",
  "data": {
    "order_id": "INV-12345",
    "order_ref": "ord_abc123xyz",
    "amount": 500.00,
    "currency": "BDT",
    "status": "success",
    "method": "bkash",
    "trx_id": "8N7AB23KC1",
    "customer_name": "John Doe",
    "customer_phone": "017XXXXXXXX"
  }
}`} />
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Verify Signature</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Every webhook request includes an <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">X-XelPay-Signature</code> header. Verify it using HMAC-SHA256 with your webhook secret.
                  </p>
                  <CodeBlock language="Node.js" code={`const crypto = require('crypto');

function verifyWebhook(rawBody, signature, webhookSecret) {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

// In your Express route:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-xelpay-signature'];
  
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  if (event.event === 'payment.verified') {
    fulfillOrder(event.data.order_id);
  }
  
  res.json({ received: true });
});`} />
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Event Types</h3>
                  <div className="space-y-3">
                    {[
                      { event: 'payment.verified', color: 'emerald', desc: 'Payment successfully verified and confirmed' },
                      { event: 'payment.pending', color: 'amber', desc: 'Payment received but awaiting verification' },
                      { event: 'payment.failed', color: 'red', desc: 'Payment could not be verified' },
                      { event: 'payment.cancelled', color: 'slate', desc: 'Customer cancelled the payment' },
                    ].map(e => (
                      <div key={e.event} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className={`w-2 h-2 rounded-full bg-${e.color}-500 shrink-0`} />
                        <code className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 flex-1">{e.event}</code>
                        <span className="text-xs text-slate-500 hidden sm:block">{e.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CALLBACKS ── */}
            {activeSection === 'callbacks' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Callbacks & Redirects</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    After payment, XelPay redirects the customer back to your site. Configure default URLs in Brand Settings, or override per-payment.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        label: 'Success URL',
                        desc: 'Customer is redirected here after successful payment',
                        params: '?order_id={order_id}&status=success&trx_id={trx_id}',
                        color: 'emerald',
                      },
                      {
                        label: 'Cancel URL',
                        desc: 'Customer is redirected here if they cancel or payment fails',
                        params: '?order_id={order_id}&status=cancelled',
                        color: 'red',
                      },
                    ].map(item => (
                      <div key={item.label} className={`p-4 bg-${item.color}-50 dark:bg-${item.color}-900/10 border border-${item.color}-200 dark:border-${item.color}-800 rounded-2xl`}>
                        <p className={`text-xs font-black text-${item.color}-700 dark:text-${item.color}-400 mb-1`}>{item.label}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{item.desc}</p>
                        <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300">https://yoursite.com/return{item.params}</code>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Handling Redirect Parameters</h3>
                    <CodeBlock language="Node.js" code={`// On your success page:
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('order_id');
const trxId = urlParams.get('trx_id');
const status = urlParams.get('status');

if (status === 'success') {
  // Always verify server-side — don't trust URL params alone
  const verified = await verifyWithApi(orderId);
  if (verified) showSuccessPage(orderId, trxId);
}`} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STATUS CODES ── */}
            {activeSection === 'status-codes' && (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">HTTP Status Codes</h2>
                <div className="space-y-2">
                  {[
                    { code: '200', label: 'OK', color: 'emerald', desc: 'Request succeeded' },
                    { code: '201', label: 'Created', color: 'emerald', desc: 'Payment session created successfully' },
                    { code: '400', label: 'Bad Request', color: 'amber', desc: 'Invalid parameters or missing required fields' },
                    { code: '401', label: 'Unauthorized', color: 'red', desc: 'Missing or invalid API key' },
                    { code: '403', label: 'Forbidden', color: 'red', desc: 'Key valid but not authorized for this action' },
                    { code: '404', label: 'Not Found', color: 'slate', desc: 'Order or resource not found' },
                    { code: '409', label: 'Conflict', color: 'amber', desc: 'Duplicate order_id — use idempotency keys' },
                    { code: '429', label: 'Too Many Requests', color: 'amber', desc: 'Rate limit exceeded (300 req/min)' },
                    { code: '500', label: 'Server Error', color: 'red', desc: 'Internal error — contact support with request_id' },
                  ].map(item => (
                    <div key={item.code} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className={`text-sm font-black text-${item.color}-600 dark:text-${item.color}-400 w-10 shrink-0`}>{item.code}</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 w-28 shrink-0">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Error Response Format</h3>
                  <CodeBlock language="JSON" code={`{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be a positive number",
    "request_id": "req_abc123xyz"
  }
}`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}