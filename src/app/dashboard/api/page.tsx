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

  const API_BASE = `${baseUrl}/v1`;

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
                      { icon: Globe, title: 'Base URL', value: `${baseUrl}/v1` },
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
                      { step: '2', text: 'Create a payment session with POST /v1/payment/create' },
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
                  <EndpointHeader method="POST" path="/v1/payment/create"
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
                  <EndpointHeader method="GET" path="/v1/payment/verify?order_id={order_id}"
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

                {/* ── Architecture Overview ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Webhook Events</h2>
                  <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                    When a payment is verified, XelPay dispatches a signed <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">POST</code> request to your configured Webhook URL. The payload is signed with HMAC-SHA256 using your Webhook Secret — always verify the signature before processing.
                  </p>

                  {/* Flow diagram */}
                  <div className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Flow</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      {['Customer Pays', '→', 'XelPay Verifies', '→', 'Webhook Dispatched', '→', 'Your Server Processes', '→', 'Respond 200 OK'].map((s, i) => (
                        s === '→'
                          ? <span key={i} className="text-slate-400">{s}</span>
                          : <span key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Actual Payload (matches payment-actions.ts) ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Payload</h3>
                  <p className="text-xs text-slate-500 mb-4">XelPay sends the following JSON body. The raw body string is what is signed — do NOT parse before verifying.</p>
                  <CodeBlock language="JSON" code={`{
  "event": "payment.success",
  "order_id": "INV-12345",
  "amount": 500,
  "trx_id": "8N7AB23KC1",
  "payment_method": "Bkash"
}`} />
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { field: 'event', type: 'string', desc: 'Always "payment.success" on successful verification' },
                      { field: 'order_id', type: 'string', desc: 'Your original order_id from the create-payment request' },
                      { field: 'amount', type: 'number', desc: 'Verified payment amount in your business currency' },
                      { field: 'trx_id', type: 'string', desc: 'Mobile banking / gateway transaction reference ID' },
                      { field: 'payment_method', type: 'string', desc: 'Human-readable method name (e.g. Bkash, Nagad, Rocket)' },
                    ].map(f => (
                      <div key={f.field} className="flex gap-2 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="shrink-0">
                          <code className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-400">{f.field}</code>
                          <span className="ml-2 text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{f.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Request Headers ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Headers</h3>
                  <div className="space-y-2">
                    {[
                      { header: 'Content-Type', value: 'application/json', note: 'Always JSON' },
                      { header: 'X-XelPay-Signature', value: '<hmac_sha256_hex>', note: 'HMAC-SHA256 of raw JSON body using your Webhook Secret' },
                    ].map(h => (
                      <div key={h.header} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800">
                        <code className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 shrink-0 w-56">{h.header}</code>
                        <code className="text-xs font-mono text-slate-600 dark:text-slate-400 shrink-0">{h.value}</code>
                        <span className="text-[10px] text-slate-400">{h.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Signature Verification (matches real implementation) ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signature Verification</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    XelPay computes <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-purple-600 dark:text-purple-400">HMAC-SHA256(rawBody, webhook_secret)</code> and sends the hex digest in the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">X-XelPay-Signature</code> header. You must recompute this on your server and compare using a constant-time function to prevent timing attacks.
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 mb-5 flex gap-2.5">
                    <span className="text-amber-500 text-base shrink-0">⚠️</span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                      You must use the <strong>raw request body bytes</strong> for signature computation — not a re-serialized JSON object. Parsing and re-stringifying may alter whitespace or key order and will produce a mismatched signature.
                    </p>
                  </div>

                  <CodeBlock language="Node.js" code={`// Node.js + Express — Webhook Verification
const crypto = require('crypto');
const express = require('express');
const app = express();

// CRITICAL: Use express.raw() — NOT express.json() — to preserve raw bytes
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-xelpay-signature'];
  const webhookSecret = process.env.XELPAY_WEBHOOK_SECRET; // your whsec_... value

  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or secret' });
  }

  // Step 1: Recompute HMAC-SHA256 over raw body using your Webhook Secret
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)           // req.body is a Buffer here (raw bytes)
    .digest('hex');

  // Step 2: Constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );

  if (!isValid) {
    console.error('Invalid webhook signature — rejecting request');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Step 3: Safe to process — parse the verified payload
  const event = JSON.parse(req.body.toString());

  if (event.event === 'payment.success') {
    // Implement idempotency: check trx_id has not been processed before
    const alreadyFulfilled = await db.orders.findOne({ trxId: event.trx_id });
    if (!alreadyFulfilled) {
      await fulfillOrder(event.order_id, event.trx_id, event.amount);
    }
  }

  // Always respond 200 to acknowledge receipt
  res.json({ received: true });
});`} />

                  <div className="mt-5">
                    <CodeBlock language="PHP" code={`<?php
// PHP — Webhook Verification

$webhookSecret = getenv('XELPAY_WEBHOOK_SECRET'); // your whsec_... value

// Step 1: Read raw body BEFORE any parsing
$rawBody   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_XELPAY_SIGNATURE'] ?? '';

// Step 2: Recompute HMAC-SHA256
$expectedSig = hash_hmac('sha256', $rawBody, $webhookSecret);

// Step 3: Constant-time comparison
if (!hash_equals($expectedSig, $signature)) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid signature']));
}

// Step 4: Safe to parse
$event = json_decode($rawBody, true);

if ($event['event'] === 'payment.success') {
    // Idempotency check before fulfilling
    $alreadyProcessed = db_query(
        'SELECT id FROM orders WHERE trx_id = ?',
        [$event['trx_id']]
    );
    if (!$alreadyProcessed) {
        fulfill_order($event['order_id'], $event['trx_id'], $event['amount']);
    }
}

http_response_code(200);
echo json_encode(['received' => true]);`} />
                  </div>
                </div>

                {/* ── Event Types ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Event Types</h3>
                  <div className="space-y-2.5">
                    {[
                      { event: 'payment.success', color: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30', desc: 'Payment verified and confirmed by XelPay. Safe to fulfill the order.' },
                    ].map(e => (
                      <div key={e.event} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className={`w-2 h-2 rounded-full ${e.color} shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">{e.event}</code>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${e.badge}`}>Active</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{e.desc}</p>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                      <p className="text-[11px] text-slate-400 font-semibold">Additional events (<code className="font-mono">payment.failed</code>, <code className="font-mono">payment.cancelled</code>, <code className="font-mono">refund.issued</code>) are on the roadmap.</p>
                    </div>
                  </div>
                </div>

                {/* ── Retry & Failure Handling ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Retry & Failure Handling</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    If your endpoint returns a non-2xx response or times out, XelPay logs the failed delivery to an internal <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">failed_webhooks</code> queue. Failed deliveries can be retried manually from the admin panel.
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { icon: '✅', title: 'Successful Delivery', desc: 'Your endpoint returns HTTP 200 within the timeout window. No retry.' },
                      { icon: '🔄', title: 'Failed Delivery', desc: 'Non-2xx response or timeout. Event is logged to failed_webhooks with the full payload for retry.' },
                      { icon: '⚠️', title: 'Idempotency Requirement', desc: 'Because retries may occur, your handler must check trx_id uniqueness before fulfilling any order to prevent double-crediting.' },
                      { icon: '⏱️', title: 'Respond Quickly', desc: 'Return 200 immediately after signature verification. Run order fulfillment asynchronously to avoid timeouts.' },
                    ].map(item => (
                      <div key={item.title} className="flex gap-3 p-3.5 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Security Best Practices ── */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security Best Practices</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: '🔐', title: 'Verify every request', desc: 'Never skip signature verification, even in development.' },
                      { icon: '📦', title: 'Use raw body', desc: 'Read req.body as Buffer/raw bytes before any JSON parsing.' },
                      { icon: '🧪', title: 'Constant-time compare', desc: 'Use timingSafeEqual / hash_equals to prevent timing attacks.' },
                      { icon: '🔁', title: 'Implement idempotency', desc: 'Store processed trx_id values. Reject duplicates silently.' },
                      { icon: '🔒', title: 'Store secret securely', desc: 'Keep your whsec_... in environment variables, never in source code.' },
                      { icon: '↩️', title: 'Respond 200 fast', desc: 'Acknowledge immediately; run fulfillment in the background.' },
                      { icon: '🔑', title: 'Rotate if compromised', desc: 'Regenerate the Webhook Secret from Brand Settings → API & Webhooks if leaked.' },
                      { icon: '🚫', title: 'Reject on mismatch', desc: 'Return HTTP 400 and do not process the payload if signatures differ.' },
                    ].map(item => (
                      <div key={item.title} className="flex gap-2.5 p-3 bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
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