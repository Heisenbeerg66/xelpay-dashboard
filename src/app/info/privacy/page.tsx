import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Privacy Policy</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">Last Updated: April 01, 2026</p>

        <div className="space-y-8 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          
          <section>
            <p>Welcome to Xelpay. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our payment automation infrastructure.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">1. Information We Collect</h2>
            <p>To provide our services, we collect the following types of information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, and business details provided during registration.</li>
              <li><strong>Technical Data:</strong> API keys, Webhook URLs, Telegram Bot Tokens, and server IP addresses used to connect with our system.</li>
              <li><strong>Transaction Metadata:</strong> To automate and verify payments, we process transaction IDs, amounts, timestamps, and sender phone numbers. <br/><span className="text-blue-600 font-bold">Note: We NEVER collect or store sensitive banking passwords, MFS PIN codes, or raw credit card details.</span></li>
              <li><strong>Device & Usage Data:</strong> Browser types, login timestamps, and usage patterns for security and fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To authenticate your login and secure your merchant workspace.</li>
              <li>To process, verify, and log transactions automatically via Webhooks and Telegram bots.</li>
              <li>To provide customer support, troubleshoot API errors, and send critical system updates.</li>
              <li>To enforce our Terms of Service and monitor for fraudulent or suspicious activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">3. Third-Party Integrations</h2>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Telegram Integration:</strong> If you use our Telegram alerts or connect a Custom Bot Token, we process messages to deliver real-time notifications to your designated chat or group.</li>
              <li><strong>IMAP Bank Sync:</strong> If you use our bank transfer automation via IMAP, we require read-only access to specific bank notification emails strictly to extract transaction data. We do not read, store, or access your personal emails.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">4. Data Sharing & Security</h2>
            <p><strong>We do not sell, rent, or trade your personal data.</strong> We use industry-standard encryption, secure databases (Supabase), and protected API endpoints to keep your data safe. We may only share information with legal authorities if strictly required by law to investigate fraud.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">5. Your Data Rights</h2>
            <p>You have the right to access, modify, or delete your account information directly from your Xelpay dashboard. If you wish to permanently delete your workspace and all associated data, please contact our support team.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

