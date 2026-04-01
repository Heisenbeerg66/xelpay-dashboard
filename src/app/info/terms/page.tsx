'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ShieldCheck, FileText, AlertTriangle, Globe,
  ChevronDown, ChevronUp, Lock, Eye, Database, Server,
  CreditCard, Users, Bell, Scale, Gavel, HelpCircle,
  Smartphone, Mail, Cookie, Trash2, RefreshCw, UserCheck,
  AlertCircle, BookOpen, Building2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = 'en' | 'bn';

// ─── Section Accordion ───────────────────────────────────────────────────────
function SectionBlock({ title, children, icon: Icon, accent = 'blue' }: {
  title: string;
  children: React.ReactNode;
  icon?: any;
  accent?: string;
}) {
  const [open, setOpen] = useState(true);
  const accentMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  };
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-xl ${accentMap[accent]}`}>
              <Icon size={18} />
            </div>
          )}
          <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm md:text-base">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      {open && <div className="p-5 md:p-6 space-y-3 text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">{children}</div>}
    </div>
  );
}

function InfoBox({ type, children }: { type: 'warning' | 'info' | 'danger' | 'success'; children: React.ReactNode }) {
  const styles = {
    warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400',
    info:    'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-300',
    danger:  'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400',
    success: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400',
  };
  const icons = { warning: AlertTriangle, info: AlertCircle, danger: AlertTriangle, success: ShieldCheck };
  const Icon = icons[type];
  return (
    <div className={`flex gap-3 items-start p-4 rounded-xl border font-semibold text-sm ${styles[type]}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

// ─── ENGLISH CONTENT ─────────────────────────────────────────────────────────
function EnglishContent() {
  return (
    <div className="space-y-14">

      {/* ══════════ PART 1: TERMS OF SERVICE ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={28} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 1: Terms of Service</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Welcome to <strong className="text-slate-900 dark:text-white">Xelpay</strong> — a product of <strong className="text-slate-900 dark:text-white">Xenverse IT</strong>. By registering an account, accessing our dashboard, utilizing our APIs, or interacting with any Xelpay service, you ("Merchant," "User," or "Client") legally agree to be fully bound by these Terms of Service. If you do not agree with any part of these Terms, you must immediately cease use of the platform.
          </p>

          <SectionBlock title="1. Right to Modify Terms & Policies" icon={RefreshCw} accent="blue">
            <InfoBox type="info">
              <strong>Authority Rights:</strong> Xelpay (Xenverse IT) reserves the absolute and exclusive right to update, modify, or replace any part of these Terms of Service or Privacy Policy at any time, at our sole discretion. In the event of major or sensitive policy changes, we will make reasonable efforts to notify active users via dashboard alerts or email. However, it remains your sole legal responsibility to review this page periodically. Continued use of the platform after updates constitutes binding acceptance of the revised terms.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="2. Description of Service & Core Disclaimer" icon={Server} accent="blue">
            <p>Xelpay is a strictly technological infrastructure providing payment verification software, API bridging, and automation tools for Mobile Financial Services (MFS), Bank Transfers, and International Payment Gateways. Xelpay operates as a software middleware layer.</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Crucial Financial Disclaimer</strong>
              Xelpay is a software layer, <strong>NOT</strong> a bank, financial institution, digital wallet, payment aggregator, or money service business (MSB). We do not hold, process, touch, or act as a custodian for your actual monetary funds. All transactions are peer-to-peer and settle directly into your own personal or corporate MFS/Bank accounts. We bear zero liability for missing funds, failed transfers, or disputes between you and your customers. Xelpay is <strong>not licensed</strong> as a financial institution under the Bank Companies Act, 1991 (Bangladesh) or any equivalent foreign legislation.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="3. Eligibility, Account Obligations, Age Restriction & Demo Mode" icon={UserCheck} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Age Restriction:</strong> You must be at least 18 years of age — or the legal age of majority in your jurisdiction — to create an account and operate a business using Xelpay. By registering, you confirm you meet this requirement.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Business Eligibility:</strong> Xelpay is intended for legitimate business use only. You must be a lawfully registered business owner or sole proprietor operating within the bounds of applicable law.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Accuracy of Information:</strong> You must provide truthful, current, and complete business information during registration. Providing false, misleading, or fraudulent information is strictly prohibited and will result in immediate account termination and potential legal referral.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Account Security:</strong> You are solely responsible for maintaining the absolute confidentiality of your login credentials, API keys, Webhook secrets, and assigned team member roles. Xelpay cannot be held liable for unauthorized access resulting from your negligence, credential sharing, or compromise.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">One Account Per Merchant:</strong> Creating multiple accounts to circumvent usage limits, bans, or fees is strictly prohibited and may result in permanent ban of all associated accounts.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Demo Mode Constraints:</strong> Xelpay provides a "Demo Mode" exclusively for UI/UX evaluation and API integration testing. You must <strong className="text-red-600 dark:text-red-400">NEVER</strong> process real customer data, real phone numbers, or execute genuine financial transactions using Demo Mode credentials. Misuse of Demo Mode for real transactions may constitute fraud.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="4. Intellectual Property (IP) Rights" icon={BookOpen} accent="purple">
            <p>All source code, UI/UX designs, API architectures, algorithms, logos, trademarks, trade names, and proprietary methodologies associated with Xelpay are the exclusive intellectual property of <strong className="text-slate-800 dark:text-slate-200">Xenverse IT</strong>, protected under the Copyright Act, 2000 (Bangladesh) and international IP treaties including the Berne Convention and TRIPS Agreement.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>You are granted a <strong>limited, non-exclusive, non-transferable, revocable license</strong> to use our APIs solely for your own legitimate business operations.</li>
              <li>You strictly agree <strong>NOT</strong> to copy, clone, scrape, reverse-engineer, decompile, disassemble, resell, sublicense, or create derivative works from any part of our platform.</li>
              <li>Any unauthorized use of Xelpay's IP constitutes infringement and will be pursued through appropriate legal channels, including civil and criminal remedies.</li>
              <li>Feedback, suggestions, or ideas submitted to Xelpay become our property and may be used without compensation or attribution.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="5. Subscription, Billing, Pricing & Strict Refund Policy" icon={CreditCard} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Free/Starter Tier:</strong> Xelpay may offer a free tier equipped with a strict monthly transaction quota. Upon exhaustion of this quota, automation services will instantly halt until the next billing cycle or an upgrade is initiated. Xelpay reserves the right to modify, restrict, or discontinue the free tier at any time without prior notice.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Paid Subscriptions:</strong> Premium capabilities — including Team Members, Custom Telegram Bots, International Gateways, and higher transaction limits — require an active, recurring paid subscription. Subscription fees are charged in advance and automatically renew.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Pricing Changes:</strong> Xelpay reserves the right to change subscription pricing at any time. Active subscribers will be notified at least 7 days before a price change takes effect on their account.</li>
              <li><strong className="text-slate-800 dark:text-slate-200 uppercase">Strict No-Refund Policy:</strong> Due to the digital, API-based, and infrastructural nature of our services, all subscription payments are <strong className="text-red-600 dark:text-red-400">strictly non-refundable</strong> once activated and payment is processed. Refunds are NOT issued for: change of mind, partial usage, unused transaction quotas, feature misunderstandings, or accounts suspended/banned due to policy violations. The sole exception, at Xelpay's exclusive discretion, is a provable, catastrophic, and unresolvable technical failure originating explicitly from Xelpay's own servers, reported within 48 hours of the payment date, where no service was delivered whatsoever.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Chargebacks & Payment Disputes:</strong> Initiating a chargeback or payment dispute for a legitimate subscription charge constitutes a breach of these Terms, will result in immediate permanent account ban, and may be subject to a penalty recovery charge.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Taxes:</strong> You are solely responsible for all applicable taxes, VAT, duties, or levies arising from your use of Xelpay services in your jurisdiction.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="6. Acceptable Use Policy (AUP) & Prohibited Conduct" icon={AlertTriangle} accent="red">
            <p>Xelpay maintains a <strong className="text-slate-800 dark:text-slate-200">zero-tolerance policy</strong> for abuse. You explicitly agree <strong>NOT</strong> to utilize Xelpay for any of the following prohibited activities:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Processing payments for illegal goods, narcotics, controlled substances, adult/pornographic content, unlicensed pharmaceuticals, unauthorized gambling, or any other activity prohibited under Bangladeshi law or applicable international law.</li>
              <li>Money laundering, terrorist financing, proliferation financing, or any attempt to obscure, disguise, or legitimize the origin of illegal funds — in violation of the Money Laundering Prevention Act, 2012 and Anti-Terrorism Act, 2009 (Bangladesh).</li>
              <li>Executing scams, Ponzi schemes, pyramid schemes, fraudulent investment plans, multi-level marketing fraud, or any deceptive scheme targeting end-consumers.</li>
              <li>Intentionally overwhelming, stress-testing beyond authorized limits, reverse-engineering, or deploying DDoS attacks against Xelpay APIs, servers, or integrated third-party systems.</li>
              <li>Unauthorized access or intrusion attempts against Xelpay's databases, administrative panels, or any connected user's systems — in violation of the Digital Security Act, 2018 (Bangladesh) and Computer Fraud and Abuse Act (international context).</li>
              <li>Impersonating Xelpay, Xenverse IT, or any Xelpay employee, partner, or affiliated entity.</li>
              <li>Using Xelpay to facilitate human trafficking, child exploitation, or any crime against persons.</li>
              <li>Operating any sanction-listed entity or individual as defined by OFAC, UN Security Council Sanctions Lists, or Bangladesh Bank directives.</li>
              <li>Using the platform to send unsolicited bulk communications (spam) to customers or any third party.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Enforcement Action</strong>
              Any violation of this AUP will trigger an immediate, irreversible, permanent ban of your merchant account, immediate revocation of all API keys, and automatic disclosure of your data, transaction logs, and IP history to local law enforcement, BFIU (Bangladesh Financial Intelligence Unit), Cyber Crime Division, and any relevant banking authorities — without further notice to you.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="7. Third-Party Integrations (IMAP, Telegram, SMS & External APIs)" icon={Smartphone} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Custom Telegram Bots:</strong> By supplying a Custom Telegram Bot Token to Xelpay, you grant our system explicit, automated permission to dispatch webhook payloads and operational notifications through your bot. You are responsible for your bot's compliance with Telegram's Terms of Service.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">IMAP Bank Email Synchronization:</strong> Utilizing our Bank Transfer verification feature requires IMAP read-only access to your payment notification email inbox. You acknowledge that Xelpay will programmatically and exclusively parse emails from specified banking domains. We hold zero liability for the broader security of your email provider or any other emails in your inbox.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">SMS Relay & Device Apps:</strong> Our Android Relay application reads payment SMS messages on your device for automated verification. By installing and using this app, you consent to the collection of device metadata and relevant SMS content as described in our Privacy Policy. The app operates strictly in read-only mode and does not send, delete, or modify SMS messages.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Third-Party Service Availability:</strong> Xelpay does not guarantee the continuous availability of integrated third-party services (Telegram, MFS providers, banks, etc.). Downtime of these services is outside our control and does not constitute grounds for a refund or service credit.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Webhook Delivery:</strong> Xelpay makes best-effort attempts to deliver webhook payloads to your configured endpoints. We do not guarantee delivery if your endpoint is unavailable, returns errors, or is misconfigured. Failed webhook deliveries are logged but retries are limited.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="8. Service Level, Uptime & Downtime" icon={Server} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">No Uptime Guarantee:</strong> While Xelpay strives for maximum availability, we do not provide a formal Service Level Agreement (SLA) or uptime guarantee. The service is provided on a best-efforts basis.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Scheduled Maintenance:</strong> Xelpay may take the platform offline for scheduled maintenance. Where reasonably possible, maintenance will be scheduled during low-traffic hours, and notice will be given via dashboard alerts or email.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">No Liability for Downtime:</strong> Xelpay shall not be liable for any loss of revenue, business opportunity, or damages arising from planned or unplanned service interruptions.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="9. Termination & Suspension Rights" icon={AlertCircle} accent="red">
            <p>Xelpay reserves the unilateral right to <strong className="text-slate-800 dark:text-slate-200">suspend or permanently terminate</strong> your account and all associated API access at any time, with or without prior notice, if we:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Suspect any breach of these Terms of Service or our Acceptable Use Policy.</li>
              <li>Detect unusual, suspicious, or potentially fraudulent activity on your account.</li>
              <li>Are required to do so by applicable law, court order, or regulatory authority.</li>
              <li>Determine your usage poses a severe security, legal, or operational risk to our infrastructure or other users.</li>
              <li>Receive a valid law enforcement request or regulatory directive.</li>
            </ul>
            <p className="mt-3">Upon termination, your right to access the platform ceases immediately. You remain liable for all outstanding fees and obligations. No refund will be issued for any remaining subscription period upon ban due to policy violations.</p>
            <p className="mt-3">You may terminate your account voluntarily at any time by submitting a formal request through our support channel. Voluntary termination does not entitle you to a refund of any pre-paid subscription amounts.</p>
          </SectionBlock>

          <SectionBlock title="10. Force Majeure, Limitation of Liability & Indemnification" icon={Scale} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Force Majeure:</strong> Xelpay shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to: acts of God, natural disasters, internet shutdowns, national telecom outages, third-party server failures, cyberattacks on our infrastructure, power outages, pandemics, strikes, or government-mandated restrictions or actions.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Limitation of Liability — MFS/Bank Account Actions:</strong> Under no legal framework shall Xelpay, its founders, directors, or Xenverse IT be held liable for your personal or business MFS/Bank accounts being flagged, restricted, frozen, or suspended by respective financial institutions or authorities due to transaction volume, velocity, patterns, or violations of their own terms of service.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">General Liability Cap:</strong> In no event shall Xelpay's total aggregate liability for all claims related to the service exceed the total amount paid by you to Xelpay during the ONE (1) month immediately preceding the date on which the claim arose. This limitation applies regardless of the form of action, whether in contract, tort, or otherwise.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Exclusion of Consequential Damages:</strong> Xelpay shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages — including but not limited to loss of profits, loss of data, loss of business opportunity, or business interruption — even if advised of the possibility of such damages.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Indemnification:</strong> You agree to fully indemnify, defend, and hold Xelpay, Xenverse IT, and their officers, directors, employees, and agents harmless from and against any and all claims, lawsuits, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from: (a) your use or misuse of the platform; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; (d) claims by your end-customers or third parties arising from your business operations.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="11. Dispute Resolution, Arbitration & Class-Action Waiver" icon={Gavel} accent="purple">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Informal Resolution First:</strong> Before filing any formal legal claim, you agree to contact Xelpay's support team in good faith and make a genuine attempt to resolve the dispute amicably within thirty (30) days of written notice.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Class-Action Waiver:</strong> You explicitly agree that any disputes or claims against Xelpay must be brought in your individual capacity only, and <strong>NOT</strong> as a plaintiff or class member in any purported class action, collective action, or representative proceeding.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Binding Arbitration (where applicable):</strong> For international users, where permitted by local law, you agree that disputes not resolved informally will be submitted to binding arbitration rather than resolved in court.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="12. Governing Law, Jurisdiction & Severability" icon={Building2} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Governing Law:</strong> These Terms shall be exclusively governed by and construed in accordance with the laws of the People's Republic of Bangladesh, including but not limited to the Contract Act, 1872; the Information and Communication Technology Act, 2006 (as amended); the Digital Security Act, 2018; and all applicable Bangladesh Bank regulations.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Jurisdiction:</strong> Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of competent authority located within Bangladesh.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Severability:</strong> If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that specific provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Xelpay regarding your use of the platform and supersede all prior agreements, representations, or understandings.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Waiver:</strong> Xelpay's failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="13. Affiliate Program Terms" icon={Users} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Eligibility:</strong> Participation in the Xelpay Affiliate Program is open to registered merchants in good standing. Xelpay reserves the right to approve or reject affiliate applications at its sole discretion.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Commission Structure:</strong> Affiliate commissions are calculated based on the program's current rate structure, which may be modified by Xelpay at any time with reasonable notice.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Promotion Methods:</strong> Affiliates must NOT engage in misleading advertising, spam, fake reviews, or any fraudulent method to generate referrals. Violations result in immediate disqualification and forfeiture of pending commissions.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Self-Referrals Prohibited:</strong> Using your own referral link to sign up secondary accounts for personal gain is strictly prohibited and constitutes fraud.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Commission Forfeiture:</strong> Commissions earned through fraudulent referrals, chargebacks, or referred accounts that violate our AUP will be forfeited and may be clawed back.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Payment Threshold:</strong> Affiliate commissions are disbursed upon reaching the minimum threshold as stated in the affiliate dashboard and are subject to applicable tax withholding.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="14. Payment Links & Checkout Pages" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant Responsibility:</strong> You are solely responsible for the accuracy, legality, and appropriateness of all products, services, prices, and descriptions listed on payment pages generated via Xelpay. Xelpay is merely the technical infrastructure; we are not a party to the commercial transaction between you and your customers.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Customer Data on Checkout Pages:</strong> Any personal data your customers submit on your Xelpay-powered checkout pages is processed as per this Privacy Policy. You must ensure your own customers are aware of how their data is handled and maintain your own privacy disclosures where legally required.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Content on Payment Links:</strong> Payment links must not be used to collect money for prohibited, illegal, or fraudulent purposes as outlined in Section 6 (AUP).</li>
            </ul>
          </SectionBlock>
        </div>
      </div>

      {/* ══════════ PART 2: PRIVACY POLICY ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><ShieldCheck size={28} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 2: Privacy Policy</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Xelpay (Xenverse IT) is committed to protecting your privacy and handling your personal data with full transparency, in compliance with the <strong className="text-slate-900 dark:text-white">Digital Security Act, 2018 (Bangladesh)</strong>, the Information and Communication Technology Act, 2006 (Bangladesh), Bangladesh Bank data protection guidelines, GDPR principles (for EU users), and general international best practices. This Privacy Policy explains exactly what data we collect, why we collect it, and how it is used, stored, and protected.
          </p>

          <SectionBlock title="1. Comprehensive Information We Collect" icon={Database} accent="green">
            <p className="font-semibold text-slate-700 dark:text-slate-300">We collect structured data across the following categories:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant Identification Data:</strong> Full legal name, verified email address, mobile phone number, business name, and geographic location — provided during account registration and onboarding.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Technical Integration Data:</strong> API keys generated by our system, Webhook endpoint URLs you configure, Custom Telegram Bot Tokens, associated Telegram Chat IDs, and IMAP email credentials stored in an encrypted vault.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Transaction & Payment Metadata:</strong> To verify and approve payment orders, our automated systems process and log Transaction IDs (TrxID), exact transaction amounts, timestamps, MFS sender phone numbers, payment method types, and order reference numbers.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Device & App Metadata (Relay Apps):</strong> If you use our Android Relay or SMS Reader application, we explicitly collect and store device-specific operational information, including: Device Model, Android OS Version, App Version, Connectivity Status (online/offline), and last-seen timestamp. This data is strictly required to maintain synchronization reliability, monitor device health, and ensure payment verification continuity.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Usage & Log Data:</strong> IP addresses, browser type, operating system, pages visited within the dashboard, feature interactions, and session timestamps — collected automatically for security monitoring, fraud detection, and system improvement.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Communications:</strong> Records of support conversations, feedback messages, and email correspondence between you and Xelpay support staff.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Affiliate & Referral Data:</strong> Referral link clicks, referred account details, and commission calculation data for participants in the Xelpay Affiliate Program.</li>
            </ul>
            <div className="mt-4">
              <InfoBox type="success">
                <strong className="block mb-1">What We NEVER Collect:</strong>
                Under absolutely no circumstances does Xelpay record, store, log, or intercept your: Bank Account Passwords, MFS App PIN Codes (bKash PIN, Nagad PIN, etc.), OTPs (One Time Passwords), NID/Passport Numbers, raw Credit/Debit Card numbers, or CVV codes. Our SMS and email reading is exclusively limited to post-transaction notification parsing — we do not read personal, private, or non-payment-related communications.
              </InfoBox>
            </div>
          </SectionBlock>

          <SectionBlock title="2. Legal Basis for Processing Personal Data" icon={Scale} accent="green">
            <p>Xelpay processes your personal data under one or more of the following legal bases:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Contractual Necessity:</strong> Processing is required to fulfil our service agreement with you (delivering payment automation, API access, and related features).</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legitimate Interests:</strong> Fraud prevention, security monitoring, platform abuse detection, and continuous service improvement — balanced against your rights.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legal Obligation:</strong> Compliance with applicable Bangladeshi law, Bangladesh Bank directives, AML regulations, court orders, and regulatory requirements.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Consent:</strong> For optional features such as marketing communications, from which you may withdraw consent at any time.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="3. Purpose of Data Utilization" icon={Eye} accent="green">
            <p>Your data is used strictly for the following operational purposes:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>To reliably authenticate users and maintain robust workspace security and session integrity.</li>
              <li>To algorithmically verify incoming payments and fire real-time Webhook payloads to your configured server endpoints.</li>
              <li>To dispatch instant payment success/failure alerts via Telegram to your connected personal DM or Team Group.</li>
              <li>To identify transaction anomalies, proactively prevent platform abuse, spam, and financial fraud.</li>
              <li>To generate analytics, reports, and dashboard metrics for your own business performance review.</li>
              <li>To send transactional system emails, security alerts, and billing notices.</li>
              <li>To fulfill our legal obligations under AML and fraud prevention regulations.</li>
              <li>To improve our platform's features, fix bugs, and optimize system performance based on anonymized usage patterns.</li>
            </ul>
            <InfoBox type="info">
              Xelpay does <strong>NOT</strong> use your data for third-party advertising, profiling, or sale to data brokers. Your data is never used to target you with ads on other platforms.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="4. Cookies & Tracking Technologies" icon={Cookie} accent="green">
            <p>Xelpay uses the following technologies on our platform:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Essential Session Cookies:</strong> Required to maintain your secure authenticated login state. These cannot be disabled without breaking platform functionality.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Preference Storage (Local Storage):</strong> We use browser local storage to remember your UI preferences, such as Dark/Light Mode selection, language preference, and dashboard layout settings.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Security Tokens:</strong> CSRF protection tokens and similar security mechanisms to protect your account from cross-site attacks.</li>
            </ul>
            <p className="mt-3">We do <strong>NOT</strong> deploy: third-party advertising cookies, cross-site tracking pixels, social media tracking buttons (beyond opt-in sharing features), or behavioral profiling technologies. You can clear cookies and local storage via your browser settings, which will log you out of the platform.</p>
          </SectionBlock>

          <SectionBlock title="5. Third-Party Data Sharing & Disclosure" icon={Users} accent="green">
            <p><strong className="text-slate-800 dark:text-slate-200">Xelpay does NOT monetize, sell, rent, or arbitrarily share your personal data.</strong> Data is only disclosed under the following strictly defined circumstances:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Infrastructure Providers:</strong> We share encrypted, minimal operational data with our trusted, industry-leading infrastructure partners — such as Vercel (hosting), Supabase (database), and equivalent providers — strictly necessary to host, operate, and maintain the software. These partners are contractually bound to data confidentiality.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legal & Regulatory Disclosure:</strong> If served with a legally valid subpoena, court order, or formal request from cybercrime investigation units, the Bangladesh Financial Intelligence Unit (BFIU), Bangladesh Bank, law enforcement agencies, or any competent regulatory authority — we will fully cooperate and release the minimum legally required merchant data, logs, and transaction records.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Fraud Prevention:</strong> In cases of suspected fraud, money laundering, or serious criminal activity detected on our platform, Xelpay may proactively share relevant account and transaction data with BFIU, law enforcement, or relevant MFS providers without prior notice.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Business Transfer:</strong> In the event of a merger, acquisition, asset sale, or corporate restructuring of Xenverse IT, your data may be transferred to the acquiring entity, subject to the same privacy protections. You will be notified in advance where legally required.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">With Your Explicit Consent:</strong> In any other circumstance not listed above, data will only be shared with your express written consent.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="6. Data Security & Breach Notification Protocol" icon={Lock} accent="green">
            <p>Xelpay deploys multiple layers of security to protect your information:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Encryption at Rest:</strong> Sensitive configuration strings — including Bot Tokens, IMAP credentials, and API configurations — are encrypted within our databases using industry-standard AES-256 encryption.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Encryption in Transit:</strong> All communication between your systems and Xelpay is exclusively enforced over HTTPS/TLS 1.2+ protocols. Plain HTTP connections are rejected.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Access Controls:</strong> Internal access to merchant data is restricted on a strict need-to-know basis. Administrative access requires multi-factor authentication.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Security Monitoring:</strong> Xelpay employs automated anomaly detection, rate limiting, and intrusion detection systems to monitor for unauthorized access attempts.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Breach Notification:</strong> In the event of a confirmed data breach that exposes your personal or API data, Xelpay commits to notifying affected merchants within <strong>72 hours</strong> of internal verification, in accordance with international best practices. The notification will describe the nature of the breach, data affected, and mitigation steps taken.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Limitation:</strong> No security system is completely impenetrable. While we implement industry-standard protections, Xelpay cannot guarantee absolute security against all possible threats. You use the platform acknowledging this inherent risk.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="7. Consent to Electronic Communications" icon={Bell} accent="green">
            <p>By registering a Xelpay account, you explicitly and freely consent to receive the following types of electronic communications from us:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Transactional & Operational:</strong> Account creation confirmations, payment verification alerts, API error notifications, security warnings, Telegram bot activity reports, and billing/invoice emails. These are mandatory and cannot be opted out of while the account is active, as they are essential to service delivery.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">System Updates & Policy Changes:</strong> Platform update announcements, maintenance notices, and policy change notifications.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Promotional & Marketing:</strong> News about new features, special offers, and platform upgrades. You may opt out of marketing communications at any time by clicking the unsubscribe link in any such email or by contacting our support.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="8. Data Retention Policy" icon={Database} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Active Account Data:</strong> Your merchant profile, gateway configurations, and transaction logs are retained for as long as your account is active and for a reasonable period thereafter to enable potential account reactivation.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Post-Termination AML Retention:</strong> To strictly comply with the Money Laundering Prevention Act, 2012 (Bangladesh), Bangladesh Bank AML/CFT guidelines, and applicable financial intelligence requirements, Xelpay reserves the legally mandated right to retain basic transaction logs, associated IP history, merchant identification metadata, and account activity records for a minimum period of <strong className="text-slate-800 dark:text-slate-200">Five (5) years</strong> following account termination, before executing a complete data purge.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Log Data:</strong> System access logs and security logs are retained for up to 24 months for security investigation purposes, then automatically purged.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Support Communications:</strong> Support ticket records are retained for up to 3 years from the last interaction to enable historical reference and dispute resolution.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="9. Your Data Rights & Account Deletion" icon={Trash2} accent="green">
            <p>Subject to applicable law and our AML retention obligations, you possess the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Right of Access:</strong> You may request a copy of the personal data Xelpay holds about you.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Rectification:</strong> You may update or correct inaccurate personal information through your account settings or by contacting support.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Erasure ("Right to be Forgotten"):</strong> You may submit a formal account deletion request via our support channel. Upon processing, your active merchant profile and non-AML-mandated data will be permanently deleted. AML-required records will be retained as per Section 8.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Data Portability:</strong> You may request your merchant data in a structured, machine-readable format.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Object:</strong> You may object to certain types of data processing, including direct marketing.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time, without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className="mt-3">To exercise any of the above rights, contact us at our official support channel. We will respond to valid requests within 30 days.</p>
          </SectionBlock>

          <SectionBlock title="10. Children's Privacy" icon={UserCheck} accent="red">
            <InfoBox type="warning">
              Xelpay services are strictly intended for users who are 18 years of age or older. We do not knowingly collect personal data from individuals under the age of 18. If we become aware that a minor has created an account or provided us with personal information, we will immediately delete the account and all associated data. If you believe a minor has accessed our platform, please contact us immediately.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="11. International Data Transfers" icon={Globe} accent="green">
            <p>Xelpay primarily operates from Bangladesh. However, due to our use of cloud infrastructure providers such as Vercel and Supabase, your data may be stored on or transmitted through servers located outside Bangladesh, including in the United States or European Union.</p>
            <p className="mt-3">We ensure that any such international transfer of data is conducted with appropriate contractual protections in place (such as Data Processing Agreements with our providers) and only with partners who maintain data security standards equivalent to or exceeding our own.</p>
          </SectionBlock>

          <SectionBlock title="12. Contact & Data Protection Inquiries" icon={Mail} accent="green">
            <p>For all privacy-related concerns, data access requests, account deletion requests, or to report a suspected data breach, please contact us through our official support channel listed in the dashboard. We are committed to responding to all legitimate privacy inquiries within <strong className="text-slate-800 dark:text-slate-200">30 business days</strong>.</p>
            <p className="mt-3">For legal notices or regulatory correspondence, include "LEGAL / DATA PROTECTION" in your subject line to ensure proper routing to our compliance team.</p>
          </SectionBlock>
        </div>
      </div>
    </div>
  );
}

// ─── BANGLA CONTENT ──────────────────────────────────────────────────────────
function BanglaContent() {
  return (
    <div className="space-y-14" style={{ fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}>

      {/* ══════════ পার্ট ১: সেবার শর্তাবলী ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={28} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">পার্ট ১: সেবার শর্তাবলী</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            <strong className="text-slate-900 dark:text-white">Xelpay</strong> — <strong className="text-slate-900 dark:text-white">Xenverse IT</strong>-এর একটি পণ্য — এ আপনাকে স্বাগত জানাই। অ্যাকাউন্ট তৈরি করে, ড্যাশবোর্ড ব্যবহার করে, আমাদের API ব্যবহার করে, বা Xelpay-এর যেকোনো সেবা গ্রহণ করে আপনি ("মার্চেন্ট", "ব্যবহারকারী", বা "ক্লায়েন্ট") এই সেবার শর্তাবলীতে আইনগতভাবে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে দ্বিমত পোষণ করেন, তাহলে আপনাকে অবিলম্বে প্ল্যাটফর্ম ব্যবহার বন্ধ করতে হবে।
          </p>

          <SectionBlock title="১. শর্তাবলী পরিবর্তনের অধিকার" icon={RefreshCw} accent="blue">
            <InfoBox type="info">
              <strong>কর্তৃপক্ষের অধিকার:</strong> Xelpay (Xenverse IT) যেকোনো সময়, সম্পূর্ণরূপে নিজেদের বিবেচনায়, এই সেবার শর্তাবলী বা গোপনীয়তা নীতির যেকোনো অংশ আপডেট, পরিবর্তন বা প্রতিস্থাপন করার একচেটিয়া এবং সম্পূর্ণ অধিকার সংরক্ষণ করে। বড় বা সংবেদনশীল নীতি পরিবর্তনের ক্ষেত্রে, আমরা ড্যাশবোর্ড সতর্কতা বা ইমেইলের মাধ্যমে সক্রিয় ব্যবহারকারীদের যুক্তিসংগতভাবে অবহিত করার চেষ্টা করব। তবে, এই পেজটি নিয়মিত পর্যালোচনা করা আপনার একান্ত আইনগত দায়িত্ব। আপডেটের পরে প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখা সংশোধিত শর্তাবলী গ্রহণের বাধ্যতামূলক প্রমাণ হিসেবে গণ্য হবে।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২. সেবার বিবরণ ও মূল দায়মুক্তি" icon={Server} accent="blue">
            <p>Xelpay হলো একটি সম্পূর্ণ প্রযুক্তিগত অবকাঠামো যা মোবাইল ফিনান্সিয়াল সার্ভিস (MFS), ব্যাংক ট্রান্সফার এবং আন্তর্জাতিক পেমেন্ট গেটওয়ের জন্য পেমেন্ট যাচাইকরণ সফটওয়্যার, API ব্রিজিং এবং অটোমেশন সরঞ্জাম সরবরাহ করে। Xelpay একটি সফটওয়্যার মিডলওয়্যার লেয়ার হিসেবে কাজ করে।</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">অত্যন্ত গুরুত্বপূর্ণ আর্থিক দায়মুক্তি বিবৃতি</strong>
              Xelpay একটি সফটওয়্যার লেয়ার — এটি কোনো ব্যাংক, আর্থিক প্রতিষ্ঠান, ডিজিটাল ওয়ালেট, পেমেন্ট অ্যাগ্রিগেটর বা মানি সার্ভিস বিজনেস (MSB) <strong>নয়</strong>। আমরা আপনার প্রকৃত অর্থ ধারণ, প্রক্রিয়া, স্পর্শ বা কাস্টোডিয়ান হিসেবে কাজ করি না। সমস্ত লেনদেন পিয়ার-টু-পিয়ার এবং সরাসরি আপনার নিজের ব্যক্তিগত বা কর্পোরেট MFS/ব্যাংক অ্যাকাউন্টে নিষ্পত্তি হয়। ব্যাংক কোম্পানি আইন, ১৯৯১ (বাংলাদেশ) বা কোনো সমতুল্য বিদেশী আইনের অধীনে Xelpay একটি আর্থিক প্রতিষ্ঠান হিসেবে <strong>লাইসেন্সপ্রাপ্ত নয়</strong>।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৩. যোগ্যতা, অ্যাকাউন্টের দায়িত্ব ও বয়স সীমাবদ্ধতা" icon={UserCheck} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">বয়স সীমাবদ্ধতা:</strong> Xelpay ব্যবহার করে ব্যবসা পরিচালনা করতে আপনার বয়স অবশ্যই কমপক্ষে ১৮ বছর হতে হবে অথবা আপনার অধিক্ষেত্রে প্রাপ্তবয়স্কতার আইনি বয়স পূর্ণ হতে হবে। নিবন্ধন করে আপনি নিশ্চিত করছেন যে আপনি এই শর্ত পূরণ করেছেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক যোগ্যতা:</strong> Xelpay শুধুমাত্র বৈধ ব্যবসায়িক ব্যবহারের জন্য। আপনাকে অবশ্যই আইনগতভাবে নিবন্ধিত ব্যবসার মালিক বা এককভাবে পরিচালক হতে হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">তথ্যের নির্ভুলতা:</strong> নিবন্ধনের সময় আপনাকে অবশ্যই সত্য, সঠিক এবং সম্পূর্ণ ব্যবসায়িক তথ্য প্রদান করতে হবে। মিথ্যা বা প্রতারণামূলক তথ্য প্রদান কঠোরভাবে নিষিদ্ধ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্টের নিরাপত্তা:</strong> আপনার লগইন ক্রেডেনশিয়াল, API কী, ওয়েবহুক সিক্রেট এবং টিম সদস্যদের ভূমিকার সম্পূর্ণ গোপনীয়তা বজায় রাখা সম্পূর্ণরূপে আপনার দায়িত্ব।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">একটি অ্যাকাউন্ট নীতি:</strong> ব্যবহারের সীমা, নিষেধাজ্ঞা বা ফি এড়াতে একাধিক অ্যাকাউন্ট তৈরি করা কঠোরভাবে নিষিদ্ধ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডেমো মোডের সীমাবদ্ধতা:</strong> Xelpay শুধুমাত্র UI/UX মূল্যায়ন এবং API ইন্টিগ্রেশন পরীক্ষার জন্য "ডেমো মোড" প্রদান করে। আপনাকে অবশ্যই ডেমো মোড ক্রেডেনশিয়াল ব্যবহার করে <strong className="text-red-600 dark:text-red-400">কখনোই</strong> বাস্তব গ্রাহক ডেটা বা প্রকৃত আর্থিক লেনদেন প্রক্রিয়া করা যাবে না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৪. মেধা সম্পত্তি অধিকার (IP Rights)" icon={BookOpen} accent="purple">
            <p>Xelpay-এর সাথে সম্পর্কিত সমস্ত সোর্স কোড, UI/UX ডিজাইন, API আর্কিটেকচার, অ্যালগরিদম, লোগো, ট্রেডমার্ক এবং মালিকানাধীন পদ্ধতি <strong className="text-slate-800 dark:text-slate-200">Xenverse IT</strong>-এর একচেটিয়া মেধা সম্পত্তি, কপিরাইট আইন, ২০০০ (বাংলাদেশ) এবং বার্ন কনভেনশন ও TRIPS চুক্তি সহ আন্তর্জাতিক IP চুক্তির অধীনে সুরক্ষিত।</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>আপনাকে শুধুমাত্র আপনার নিজের বৈধ ব্যবসায়িক কার্যক্রমের জন্য আমাদের API ব্যবহার করার একটি <strong>সীমিত, অ-একচেটিয়া, অ-হস্তান্তরযোগ্য, প্রত্যাহারযোগ্য লাইসেন্স</strong> দেওয়া হয়েছে।</li>
              <li>আমাদের প্ল্যাটফর্মের যেকোনো অংশ কপি, ক্লোন, স্ক্র্যাপ, রিভার্স-ইঞ্জিনিয়ার, ডিকম্পাইল, পুনরায় বিক্রি বা ডেরিভেটিভ কাজ তৈরি করা কঠোরভাবে <strong>নিষিদ্ধ</strong>।</li>
              <li>Xelpay-এর IP-এর যেকোনো অননুমোদিত ব্যবহার লঙ্ঘন গঠন করে এবং দেওয়ানি ও ফৌজদারি প্রতিকার সহ উপযুক্ত আইনি পদক্ষেপের মাধ্যমে অনুসরণ করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৫. সাবস্ক্রিপশন, বিলিং, মূল্য নির্ধারণ ও কঠোর অফেরতযোগ্য নীতি" icon={CreditCard} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">ফ্রি/স্টার্টার টায়ার:</strong> Xelpay একটি কঠোর মাসিক লেনদেন কোটা সহ বিনামূল্যের টায়ার অফার করতে পারে। এই কোটা শেষ হলে, পরবর্তী বিলিং চক্র বা আপগ্রেড না করা পর্যন্ত অটোমেশন সেবা তাৎক্ষণিকভাবে বন্ধ হয়ে যাবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পেইড সাবস্ক্রিপশন:</strong> প্রিমিয়াম সুবিধাগুলি — টিম মেম্বার, কাস্টম টেলিগ্রাম বট, ইন্টারন্যাশনাল গেটওয়ে এবং উচ্চতর লেনদেন সীমা সহ — একটি সক্রিয়, পুনরাবৃত্তিমূলক পেইড সাবস্ক্রিপশন প্রয়োজন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মূল্য পরিবর্তন:</strong> Xelpay যেকোনো সময় সাবস্ক্রিপশনের মূল্য পরিবর্তন করার অধিকার সংরক্ষণ করে। সক্রিয় সাবস্ক্রাইবারদের তাদের অ্যাকাউন্টে কোনো মূল্য পরিবর্তন কার্যকর হওয়ার কমপক্ষে ৭ দিন আগে অবহিত করা হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200uppercase">কঠোর অ-ফেরতযোগ্য নীতি:</strong> আমাদের পরিষেবার ডিজিটাল, API-ভিত্তিক এবং অবকাঠামোগত প্রকৃতির কারণে, একবার সক্রিয় হয়ে পেমেন্ট প্রক্রিয়া সম্পন্ন হলে সমস্ত সাবস্ক্রিপশন পেমেন্ট <strong className="text-red-600 dark:text-red-400">কঠোরভাবে অ-ফেরতযোগ্য</strong>। মন পরিবর্তনের জন্য, আংশিক ব্যবহারের জন্য, অব্যবহৃত লেনদেন কোটার জন্য, বৈশিষ্ট্য ভুলবোঝাবুঝির জন্য, বা নীতি লঙ্ঘনের কারণে স্থগিত/নিষিদ্ধ অ্যাকাউন্টের জন্য কোনো ফেরত দেওয়া হয় না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">চার্জব্যাক ও পেমেন্ট বিরোধ:</strong> একটি বৈধ সাবস্ক্রিপশন চার্জের জন্য চার্জব্যাক বা পেমেন্ট বিরোধ শুরু করা এই শর্তাবলীর লঙ্ঘন গঠন করে এবং তাৎক্ষণিক স্থায়ী অ্যাকাউন্ট নিষিদ্ধকরণের ফলে হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">কর:</strong> আপনার অধিক্ষেত্রে Xelpay সেবা ব্যবহারের ফলে উদ্ভূত সমস্ত প্রযোজ্য কর, ভ্যাট, শুল্ক বা চাঁদার জন্য আপনি সম্পূর্ণরূপে দায়ী।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৬. গ্রহণযোগ্য ব্যবহার নীতি (AUP) ও নিষিদ্ধ আচরণ" icon={AlertTriangle} accent="red">
            <p>Xelpay অপব্যবহারের বিরুদ্ধে <strong className="text-slate-800 dark:text-slate-200">শূন্য-সহনশীলতা নীতি</strong> বজায় রাখে। আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে নিম্নলিখিত নিষিদ্ধ কার্যক্রমের জন্য Xelpay ব্যবহার করবেন না:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <li>অবৈধ পণ্য, মাদকদ্রব্য, নিয়ন্ত্রিত পদার্থ, প্রাপ্তবয়স্ক/পর্নোগ্রাফিক বিষয়বস্তু, অ-লাইসেন্সপ্রাপ্ত ওষুধপত্র, অননুমোদিত জুয়া, বা বাংলাদেশের আইন বা প্রযোজ্য আন্তর্জাতিক আইনের অধীনে নিষিদ্ধ যেকোনো কার্যক্রমের জন্য পেমেন্ট প্রক্রিয়া করা।</li>
              <li>মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ এবং সন্ত্রাসবিরোধী আইন, ২০০৯ (বাংলাদেশ) লঙ্ঘন করে অর্থ পাচার, সন্ত্রাসী অর্থায়ন, বা অবৈধ অর্থের উৎস গোপন করার যেকোনো প্রচেষ্টা।</li>
              <li>স্ক্যাম, পঞ্জি স্কিম, পিরামিড স্কিম, প্রতারণামূলক বিনিয়োগ পরিকল্পনা বা শেষ গ্রাহকদের লক্ষ্য করে যেকোনো প্রতারণামূলক স্কিম পরিচালনা করা।</li>
              <li>ইচ্ছাকৃতভাবে Xelpay API, সার্ভার বা সংযুক্ত তৃতীয় পক্ষের সিস্টেমের বিরুদ্ধে DDoS আক্রমণ পরিচালনা করা।</li>
              <li>ডিজিটাল নিরাপত্তা আইন, ২০১৮ (বাংলাদেশ) লঙ্ঘন করে Xelpay-এর ডেটাবেস বা প্রশাসনিক প্যানেলে অননুমোদিত অ্যাক্সেস প্রচেষ্টা।</li>
              <li>মানব পাচার, শিশু শোষণ, বা ব্যক্তিদের বিরুদ্ধে যেকোনো অপরাধ সহজতর করতে প্ল্যাটফর্ম ব্যবহার করা।</li>
              <li>OFAC, জাতিসংঘ নিরাপত্তা পরিষদের নিষেধাজ্ঞা তালিকা বা বাংলাদেশ ব্যাংকের নির্দেশ দ্বারা নিষিদ্ধ তালিকাভুক্ত কোনো সত্তা বা ব্যক্তির পক্ষে পরিচালনা করা।</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">প্রয়োগমূলক পদক্ষেপ</strong>
              এই AUP-এর যেকোনো লঙ্ঘন আপনার মার্চেন্ট অ্যাকাউন্টের তাৎক্ষণিক, অপরিবর্তনীয়, স্থায়ী নিষিদ্ধকরণ, সমস্ত API কী বাতিল এবং স্থানীয় আইন প্রয়োগকারী সংস্থা, BFIU (বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট), সাইবার ক্রাইম বিভাগ এবং প্রাসঙ্গিক ব্যাংকিং কর্তৃপক্ষের কাছে আপনার ডেটা, লেনদেনের লগ এবং IP ইতিহাস স্বয়ংক্রিয়ভাবে প্রকাশ করার কারণ হবে — আপনাকে আর কোনো পূর্ববর্তী নোটিশ না দিয়েই।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৭. তৃতীয় পক্ষের ইন্টিগ্রেশন (IMAP, Telegram, SMS ও বাহ্যিক API)" icon={Smartphone} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">কাস্টম টেলিগ্রাম বট:</strong> Xelpay-এ একটি কাস্টম টেলিগ্রাম বট টোকেন সরবরাহ করে, আপনি আপনার বটের মাধ্যমে ওয়েবহুক পেলোড এবং অপারেশনাল বিজ্ঞপ্তি পাঠানোর জন্য আমাদের সিস্টেমকে স্পষ্ট, স্বয়ংক্রিয় অনুমতি দিচ্ছেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">IMAP ব্যাংক ইমেইল সিঙ্ক্রোনাইজেশন:</strong> আমাদের ব্যাংক ট্রান্সফার যাচাই বৈশিষ্ট্য ব্যবহার করতে আপনার পেমেন্ট বিজ্ঞপ্তি ইমেইল ইনবক্সে শুধুমাত্র পড়ার অ্যাক্সেস প্রয়োজন। আমরা শুধুমাত্র নির্দিষ্ট ব্যাংকিং ডোমেন থেকে ইমেইল পার্স করি। আপনার ইমেইল প্রদানকারীর ব্যাপক নিরাপত্তার জন্য আমরা কোনো দায় বহন করি না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">SMS রিলে ও ডিভাইস অ্যাপ:</strong> আমাদের অ্যান্ড্রয়েড রিলে অ্যাপ্লিকেশন স্বয়ংক্রিয় যাচাইয়ের জন্য আপনার ডিভাইসে পেমেন্ট SMS বার্তা পড়ে। এই অ্যাপটি ইনস্টল এবং ব্যবহার করে, আপনি আমাদের গোপনীয়তা নীতিতে বর্ণিত ডিভাইস মেটাডেটা এবং প্রাসঙ্গিক SMS বিষয়বস্তু সংগ্রহে সম্মত হচ্ছেন। অ্যাপটি শুধুমাত্র রিড-অনলি মোডে কাজ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ওয়েবহুক ডেলিভারি:</strong> Xelpay আপনার কনফিগার করা এন্ডপয়েন্টে ওয়েবহুক পেলোড পৌঁছে দেওয়ার সর্বোত্তম প্রচেষ্টা করে, তবে কোনো গ্যারান্টি দেওয়া হয় না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৮. সেবার স্তর, আপটাইম ও ডাউনটাইম" icon={Server} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">আপটাইমের কোনো গ্যারান্টি নেই:</strong> Xelpay সর্বোচ্চ প্রাপ্যতার জন্য প্রচেষ্টা করে, তবে আমরা কোনো আনুষ্ঠানিক SLA বা আপটাইম গ্যারান্টি প্রদান করি না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নির্ধারিত রক্ষণাবেক্ষণ:</strong> Xelpay নির্ধারিত রক্ষণাবেক্ষণের জন্য প্ল্যাটফর্ম অফলাইন নিতে পারে। যেখানে সম্ভব, রক্ষণাবেক্ষণ কম ট্র্যাফিকের সময়ে নির্ধারিত হবে এবং নোটিশ দেওয়া হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডাউনটাইমের জন্য কোনো দায় নেই:</strong> পরিকল্পিত বা অপরিকল্পিত সার্ভিস বিঘ্নের ফলে রাজস্ব, ব্যবসায়িক সুযোগ বা ক্ষতির জন্য Xelpay দায়ী থাকবে না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৯. অ্যাকাউন্ট বাতিল ও স্থগিতকরণের অধিকার" icon={AlertCircle} accent="red">
            <p>Xelpay যেকোনো সময়, পূর্ববর্তী নোটিশ সহ বা ছাড়াই আপনার অ্যাকাউন্ট এবং সমস্ত সম্পর্কিত API অ্যাক্সেস <strong className="text-slate-800 dark:text-slate-200">স্থগিত বা স্থায়ীভাবে বাতিল</strong> করার একতরফা অধিকার সংরক্ষণ করে যদি:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>আমরা এই শর্তাবলী বা AUP-এর যেকোনো লঙ্ঘন সন্দেহ করি।</li>
              <li>আমরা আপনার অ্যাকাউন্টে অস্বাভাবিক, সন্দেহজনক বা সম্ভাব্য প্রতারণামূলক কার্যক্রম সনাক্ত করি।</li>
              <li>প্রযোজ্য আইন, আদালতের আদেশ বা নিয়ন্ত্রক কর্তৃপক্ষ দ্বারা আমাদের তা করতে হয়।</li>
              <li>আমরা নির্ধারণ করি যে আপনার ব্যবহার আমাদের অবকাঠামো বা অন্যান্য ব্যবহারকারীদের জন্য গুরুতর নিরাপত্তা বা আইনগত ঝুঁকি তৈরি করে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১০. ফোর্স ম্যাজর, দায়ের সীমাবদ্ধতা ও ক্ষতিপূরণ" icon={Scale} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">ফোর্স ম্যাজর:</strong> আমাদের যুক্তিসংগত নিয়ন্ত্রণের বাইরের পরিস্থিতির কারণে — যেমন প্রাকৃতিক দুর্যোগ, ইন্টারনেট শাটডাউন, জাতীয় টেলিকম বিভ্রাট, তৃতীয় পক্ষের সার্ভার ব্যর্থতা, সাইবার আক্রমণ, বিদ্যুৎ বিভ্রাট, মহামারী বা সরকারি বাধ্যতামূলক বিধিনিষেধ — পারফরম্যান্সে ব্যর্থতা বা বিলম্বের জন্য Xelpay দায়ী থাকবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">MFS/ব্যাংক অ্যাকাউন্ট সংক্রান্ত দায়ের সীমাবদ্ধতা:</strong> কোনো আইনি কাঠামোর অধীনে Xelpay, এর প্রতিষ্ঠাতা, পরিচালক বা Xenverse IT আপনার ব্যক্তিগত বা ব্যবসায়িক MFS/ব্যাংক অ্যাকাউন্ট ফ্ল্যাগ, সীমাবদ্ধ, হিমায়িত বা স্থগিত হওয়ার জন্য দায়ী থাকবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সাধারণ দায়ের সীমা:</strong> দাবি উত্থাপনের তারিখের আগে অবিলম্বে ONE (1) মাসে আপনি Xelpay-কে যে মোট অর্থ পরিশোধ করেছেন তার বেশি Xelpay-এর মোট দায় কোনো পরিস্থিতিতে হবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পরোক্ষ ক্ষতি বাদ:</strong> লাভের ক্ষতি, ডেটার ক্ষতি, ব্যবসায়িক সুযোগের ক্ষতি বা ব্যবসায়িক বাধা সহ যেকোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ, পরিণামী বা শাস্তিমূলক ক্ষতির জন্য Xelpay দায়ী থাকবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ক্ষতিপূরণ:</strong> আপনি Xelpay, Xenverse IT এবং তাদের কর্মকর্তা, পরিচালক, কর্মচারী এবং প্রতিনিধিদের আপনার প্ল্যাটফর্ম ব্যবহার বা অপব্যবহার থেকে উদ্ভূত সমস্ত দাবি, মামলা, দায়, ক্ষতি, খরচ এবং ব্যয় থেকে সম্পূর্ণরূপে ক্ষতিপূরণ দিতে, রক্ষা করতে এবং নির্দোষ রাখতে সম্মত হচ্ছেন।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১১. বিরোধ নিষ্পত্তি ও ক্লাস-অ্যাকশন পরিত্যাগ" icon={Gavel} accent="purple">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">প্রথমে অনানুষ্ঠানিক সমাধান:</strong> যেকোনো আনুষ্ঠানিক আইনি দাবি দাখিল করার আগে, আপনি সম্মত হচ্ছেন যে লিখিত নোটিশের ৩০ দিনের মধ্যে সৌহার্দ্যপূর্ণভাবে বিরোধ সমাধানের জন্য সদিচ্ছার সাথে Xelpay-এর সাপোর্ট টিমের সাথে যোগাযোগ করবেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ক্লাস-অ্যাকশন পরিত্যাগ:</strong> আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে Xelpay-এর বিরুদ্ধে যেকোনো বিরোধ বা দাবি শুধুমাত্র আপনার ব্যক্তিগত ক্ষমতায় আনতে হবে — কোনো পুরোহিত শ্রেণী বা প্রতিনিধিমূলক কার্যক্রমে বাদী বা শ্রেণী সদস্য হিসেবে নয়।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১২. প্রযোজ্য আইন, এখতিয়ার ও বিভাজ্যতা" icon={Building2} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">প্রযোজ্য আইন:</strong> এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন — চুক্তি আইন, ১৮৭২; তথ্য ও যোগাযোগ প্রযুক্তি আইন, ২০০৬ (সংশোধিত); ডিজিটাল নিরাপত্তা আইন, ২০১৮; এবং সমস্ত প্রযোজ্য বাংলাদেশ ব্যাংক বিধিমালা সহ — এর দ্বারা একচেটিয়াভাবে নিয়ন্ত্রিত হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">এখতিয়ার:</strong> এই শর্তাবলীর অধীনে উদ্ভূত যেকোনো বিরোধ বাংলাদেশে অবস্থিত সক্ষম কর্তৃপক্ষের আদালতের একচেটিয়া এখতিয়ারের অধীনে হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বিভাজ্যতা:</strong> যদি এই শর্তাবলীর কোনো বিধান অপ্রয়োগযোগ্য বা অবৈধ পাওয়া যায়, সেই বিধানটি ন্যূনতম পরিমাণে সীমিত বা বাদ দেওয়া হবে এবং অবশিষ্ট বিধানগুলি সম্পূর্ণ কার্যকর থাকবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সম্পূর্ণ চুক্তি:</strong> এই শর্তাবলী, আমাদের গোপনীয়তা নীতির সাথে একত্রে, প্ল্যাটফর্ম ব্যবহার সংক্রান্ত আপনার এবং Xelpay-এর মধ্যে সম্পূর্ণ চুক্তি গঠন করে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৩. অ্যাফিলিয়েট প্রোগ্রামের শর্তাবলী" icon={Users} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">যোগ্যতা:</strong> Xelpay অ্যাফিলিয়েট প্রোগ্রামে অংশগ্রহণ শুধুমাত্র ভালো অবস্থানে থাকা নিবন্ধিত মার্চেন্টদের জন্য উন্মুক্ত। Xelpay তার একক বিবেচনায় অ্যাফিলিয়েট আবেদন অনুমোদন বা প্রত্যাখ্যান করার অধিকার সংরক্ষণ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ প্রচার পদ্ধতি:</strong> অ্যাফিলিয়েটরা রেফারেল তৈরির জন্য বিভ্রান্তিকর বিজ্ঞাপন, স্প্যাম, ভুয়া রিভিউ বা যেকোনো প্রতারণামূলক পদ্ধতিতে নিযুক্ত হতে পারবেন না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">স্ব-রেফারেল নিষিদ্ধ:</strong> ব্যক্তিগত লাভের জন্য নিজের রেফারেল লিঙ্ক ব্যবহার করে সেকেন্ডারি অ্যাকাউন্ট সাইন আপ করা কঠোরভাবে নিষিদ্ধ এবং প্রতারণা গঠন করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">কমিশন বাজেয়াপ্ত:</strong> প্রতারণামূলক রেফারেল বা AUP লঙ্ঘনকারী রেফার করা অ্যাকাউন্টের মাধ্যমে অর্জিত কমিশন বাজেয়াপ্ত করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৪. পেমেন্ট লিঙ্ক ও চেকআউট পেজ" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের দায়িত্ব:</strong> Xelpay-এর মাধ্যমে তৈরি পেমেন্ট পেজে তালিকাভুক্ত সমস্ত পণ্য, সেবা, মূল্য এবং বিবরণের নির্ভুলতা, বৈধতা এবং উপযুক্ততার জন্য আপনি সম্পূর্ণরূপে দায়ী। Xelpay শুধুমাত্র প্রযুক্তিগত অবকাঠামো।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট লিঙ্কে নিষিদ্ধ বিষয়বস্তু:</strong> পেমেন্ট লিঙ্ক ধারা ৬ (AUP)-এ উল্লিখিত নিষিদ্ধ, অবৈধ বা প্রতারণামূলক উদ্দেশ্যে অর্থ সংগ্রহের জন্য ব্যবহার করা যাবে না।</li>
            </ul>
          </SectionBlock>
        </div>
      </div>

      {/* ══════════ পার্ট ২: গোপনীয়তা নীতি ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><ShieldCheck size={28} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">পার্ট ২: গোপনীয়তা নীতি</h2>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Xelpay (Xenverse IT) <strong className="text-slate-900 dark:text-white">ডিজিটাল নিরাপত্তা আইন, ২০১৮ (বাংলাদেশ)</strong>, তথ্য ও যোগাযোগ প্রযুক্তি আইন, ২০০৬ (বাংলাদেশ), বাংলাদেশ ব্যাংকের ডেটা সুরক্ষা নির্দেশিকা, GDPR নীতি (EU ব্যবহারকারীদের জন্য) এবং সাধারণ আন্তর্জাতিক সর্বোত্তম অনুশীলন মেনে আপনার গোপনীয়তা রক্ষা এবং আপনার ব্যক্তিগত ডেটা সম্পূর্ণ স্বচ্ছতার সাথে পরিচালনা করতে প্রতিশ্রুতিবদ্ধ।
          </p>

          <SectionBlock title="১. আমরা কী কী তথ্য সংগ্রহ করি" icon={Database} accent="green">
            <p className="font-semibold text-slate-700 dark:text-slate-300">আমরা নিম্নলিখিত বিভাগগুলিতে কাঠামোগত ডেটা সংগ্রহ করি:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্ট পরিচয় ডেটা:</strong> অ্যাকাউন্ট নিবন্ধন এবং অনবোর্ডিংয়ের সময় প্রদত্ত পূর্ণ আইনি নাম, যাচাইকৃত ইমেইল ঠিকানা, মোবাইল ফোন নম্বর, ব্যবসার নাম এবং ভৌগোলিক অবস্থান।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">প্রযুক্তিগত ইন্টিগ্রেশন ডেটা:</strong> আমাদের সিস্টেম দ্বারা তৈরি API কী, আপনার কনফিগার করা ওয়েবহুক এন্ডপয়েন্ট URL, কাস্টম টেলিগ্রাম বট টোকেন, সংশ্লিষ্ট টেলিগ্রাম চ্যাট আইডি এবং একটি এনক্রিপ্টেড ভল্টে সংরক্ষিত IMAP ইমেইল ক্রেডেনশিয়াল।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লেনদেন ও পেমেন্ট মেটাডেটা:</strong> পেমেন্ট অর্ডার যাচাই এবং অনুমোদনের জন্য, আমাদের স্বয়ংক্রিয় সিস্টেম লেনদেন আইডি (TrxID), সঠিক লেনদেনের পরিমাণ, টাইমস্ট্যাম্প, MFS প্রেরকের ফোন নম্বর, পেমেন্ট পদ্ধতির ধরন এবং অর্ডার রেফারেন্স নম্বর প্রক্রিয়া ও লগ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডিভাইস ও অ্যাপ মেটাডেটা (রিলে অ্যাপ):</strong> আপনি আমাদের অ্যান্ড্রয়েড রিলে বা SMS রিডার অ্যাপ্লিকেশন ব্যবহার করলে, আমরা স্পষ্টভাবে ডিভাইস-নির্দিষ্ট অপারেশনাল তথ্য সংগ্রহ ও সংরক্ষণ করি — ডিভাইস মডেল, অ্যান্ড্রয়েড OS সংস্করণ, অ্যাপ সংস্করণ, কানেক্টিভিটি স্ট্যাটাস এবং শেষ দেখার টাইমস্ট্যাম্প সহ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবহার ও লগ ডেটা:</strong> নিরাপত্তা পর্যবেক্ষণ, জালিয়াতি সনাক্তকরণ এবং সিস্টেম উন্নতির জন্য স্বয়ংক্রিয়ভাবে সংগৃহীত IP ঠিকানা, ব্রাউজারের ধরন, অপারেটিং সিস্টেম, ড্যাশবোর্ডের মধ্যে পরিদর্শন করা পেজ এবং সেশন টাইমস্ট্যাম্প।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">যোগাযোগ:</strong> আপনার এবং Xelpay সাপোর্ট স্টাফের মধ্যে সাপোর্ট কথোপকথন, মতামত বার্তা এবং ইমেইল যোগাযোগের রেকর্ড।</li>
            </ul>
            <div className="mt-4">
              <InfoBox type="success">
                <strong className="block mb-1">আমরা যা কখনও সংগ্রহ করি না:</strong>
                Xelpay কখনোই আপনার ব্যাংক অ্যাকাউন্টের পাসওয়ার্ড, MFS অ্যাপ PIN কোড (bKash PIN, Nagad PIN ইত্যাদি), OTP (ওয়ান টাইম পাসওয়ার্ড), NID/পাসপোর্ট নম্বর, ক্রেডিট/ডেবিট কার্ড নম্বর বা CVV কোড রেকর্ড, সংরক্ষণ, লগ বা আটকায় না। আমাদের SMS এবং ইমেইল পড়া একচেটিয়াভাবে লেনদেন-পরবর্তী বিজ্ঞপ্তি পার্সিংয়ের মধ্যে সীমাবদ্ধ।
              </InfoBox>
            </div>
          </SectionBlock>

          <SectionBlock title="২. ব্যক্তিগত ডেটা প্রক্রিয়াকরণের আইনগত ভিত্তি" icon={Scale} accent="green">
            <p>Xelpay নিম্নলিখিত এক বা একাধিক আইনগত ভিত্তিতে আপনার ব্যক্তিগত ডেটা প্রক্রিয়া করে:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">চুক্তিগত প্রয়োজনীয়তা:</strong> আপনার সাথে আমাদের সেবা চুক্তি পূরণের জন্য প্রক্রিয়াকরণ প্রয়োজন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বৈধ স্বার্থ:</strong> জালিয়াতি প্রতিরোধ, নিরাপত্তা পর্যবেক্ষণ, প্ল্যাটফর্ম অপব্যবহার সনাক্তকরণ এবং ক্রমাগত সেবা উন্নতি।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">আইনগত বাধ্যবাধকতা:</strong> প্রযোজ্য বাংলাদেশ আইন, বাংলাদেশ ব্যাংক নির্দেশিকা, AML বিধিমালা এবং নিয়ন্ত্রক প্রয়োজনীয়তার সাথে সম্মতি।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সম্মতি:</strong> মার্কেটিং যোগাযোগের মতো ঐচ্ছিক বৈশিষ্ট্যের জন্য, যা থেকে আপনি যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৩. ডেটা ব্যবহারের উদ্দেশ্য" icon={Eye} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li>ব্যবহারকারীদের নির্ভরযোগ্যভাবে প্রমাণীকরণ এবং শক্তিশালী ওয়ার্কস্পেস নিরাপত্তা বজায় রাখা।</li>
              <li>আগত পেমেন্ট অ্যালগরিদমিকভাবে যাচাই করা এবং আপনার কনফিগার করা সার্ভার এন্ডপয়েন্টে রিয়েল-টাইম ওয়েবহুক পেলোড পাঠানো।</li>
              <li>আপনার সংযুক্ত টেলিগ্রামে তাৎক্ষণিক পেমেন্ট সফল/ব্যর্থতার সতর্কতা পাঠানো।</li>
              <li>লেনদেনের অসঙ্গতি সনাক্ত করা, প্ল্যাটফর্ম অপব্যবহার, স্প্যাম এবং আর্থিক জালিয়াতি প্রতিরোধ করা।</li>
              <li>আপনার নিজস্ব ব্যবসায়িক কর্মক্ষমতা পর্যালোচনার জন্য বিশ্লেষণ, রিপোর্ট এবং ড্যাশবোর্ড মেট্রিক্স তৈরি করা।</li>
              <li>AML এবং জালিয়াতি প্রতিরোধ বিধিমালার অধীনে আমাদের আইনগত বাধ্যবাধকতা পূরণ করা।</li>
            </ul>
            <InfoBox type="info">
              Xelpay তৃতীয় পক্ষের বিজ্ঞাপন, প্রোফাইলিং বা ডেটা ব্রোকারের কাছে বিক্রির জন্য আপনার ডেটা <strong>ব্যবহার করে না</strong>।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৪. কুকিজ ও ট্র্যাকিং প্রযুক্তি" icon={Cookie} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">অপরিহার্য সেশন কুকিজ:</strong> আপনার সুরক্ষিত প্রমাণীকৃত লগইন অবস্থা বজায় রাখার জন্য প্রয়োজনীয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পছন্দ স্টোরেজ (Local Storage):</strong> ডার্ক/লাইট মোড নির্বাচন, ভাষার পছন্দ এবং ড্যাশবোর্ড লেআউট সেটিংস মনে রাখার জন্য।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নিরাপত্তা টোকেন:</strong> ক্রস-সাইট আক্রমণ থেকে আপনার অ্যাকাউন্ট রক্ষা করার জন্য CSRF সুরক্ষা টোকেন।</li>
            </ul>
            <p className="mt-3">আমরা তৃতীয় পক্ষের বিজ্ঞাপন কুকিজ বা ক্রস-সাইট ট্র্যাকিং পিক্সেল <strong>ব্যবহার করি না</strong>।</p>
          </SectionBlock>

          <SectionBlock title="৫. তৃতীয় পক্ষের সাথে ডেটা শেয়ারিং ও প্রকাশ" icon={Users} accent="green">
            <p><strong className="text-slate-800 dark:text-slate-200">Xelpay আপনার ব্যক্তিগত ডেটা নগদীকরণ, বিক্রয়, ভাড়া বা স্বেচ্ছায় শেয়ার করে না।</strong> শুধুমাত্র নিম্নলিখিত কঠোরভাবে সংজ্ঞায়িত পরিস্থিতিতে ডেটা প্রকাশ করা হয়:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">অবকাঠামো প্রদানকারী:</strong> আমাদের বিশ্বস্ত, শিল্প-শীর্ষস্থানীয় অবকাঠামো অংশীদারদের — যেমন Vercel (হোস্টিং), Supabase (ডেটাবেস) — সাথে এনক্রিপ্টেড, ন্যূনতম অপারেশনাল ডেটা শেয়ার করা হয় যা সফটওয়্যার হোস্ট, পরিচালনা এবং রক্ষণাবেক্ষণের জন্য কঠোরভাবে প্রয়োজনীয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">আইনগত ও নিয়ন্ত্রক প্রকাশ:</strong> আইনগতভাবে বৈধ সাবপোয়েনা, আদালতের আদেশ, বা BFIU, বাংলাদেশ ব্যাংক, আইন প্রয়োগকারী সংস্থা বা যেকোনো সক্ষম নিয়ন্ত্রক কর্তৃপক্ষের আনুষ্ঠানিক অনুরোধে সাড়া দিলে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">জালিয়াতি প্রতিরোধ:</strong> আমাদের প্ল্যাটফর্মে সন্দেহজনক জালিয়াতি, মানি লন্ডারিং বা গুরুতর অপরাধমূলক কার্যক্রমের ক্ষেত্রে, Xelpay পূর্ববর্তী নোটিশ ছাড়াই BFIU বা আইন প্রয়োগকারী সংস্থার সাথে প্রাসঙ্গিক ডেটা সক্রিয়ভাবে শেয়ার করতে পারে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক হস্তান্তর:</strong> Xenverse IT-এর একীভূতকরণ, অধিগ্রহণ বা সম্পদ বিক্রয়ের ক্ষেত্রে, আপনার ডেটা অধিগ্রহণকারী সত্তায় স্থানান্তরিত হতে পারে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">আপনার স্পষ্ট সম্মতিতে:</strong> উপরে তালিকাভুক্ত নয় এমন অন্য যেকোনো পরিস্থিতিতে, শুধুমাত্র আপনার স্পষ্ট লিখিত সম্মতিতে ডেটা শেয়ার করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৬. ডেটা নিরাপত্তা ও লঙ্ঘন বিজ্ঞপ্তি প্রোটোকল" icon={Lock} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">বিশ্রামে এনক্রিপশন:</strong> বট টোকেন, IMAP ক্রেডেনশিয়াল এবং API কনফিগারেশন সহ সংবেদনশীল কনফিগারেশন স্ট্রিং শিল্প-মানক AES-256 এনক্রিপশন ব্যবহার করে আমাদের ডেটাবেসে এনক্রিপ্ট করা হয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ট্রান্সিটে এনক্রিপশন:</strong> আপনার সিস্টেম এবং Xelpay-এর মধ্যে সমস্ত যোগাযোগ একচেটিয়াভাবে HTTPS/TLS 1.2+ প্রোটোকলের মাধ্যমে প্রয়োগ করা হয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাক্সেস নিয়ন্ত্রণ:</strong> মার্চেন্ট ডেটায় অভ্যন্তরীণ অ্যাক্সেস কঠোর প্রয়োজন-ভিত্তিতে সীমাবদ্ধ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লঙ্ঘন বিজ্ঞপ্তি:</strong> একটি নিশ্চিত ডেটা লঙ্ঘনের ঘটনায় যা আপনার ব্যক্তিগত বা API ডেটা প্রকাশ করে, Xelpay আন্তর্জাতিক সর্বোত্তম অনুশীলনের সাথে সামঞ্জস্য রেখে অভ্যন্তরীণ যাচাইয়ের <strong>৭২ ঘণ্টার মধ্যে</strong> প্রভাবিত মার্চেন্টদের বিজ্ঞপ্তি দেওয়ার প্রতিশ্রুতি দেয়।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৭. ইলেকট্রনিক যোগাযোগে সম্মতি" icon={Bell} accent="green">
            <p>Xelpay অ্যাকাউন্ট নিবন্ধন করে, আপনি স্পষ্টভাবে নিম্নলিখিত ধরনের ইলেকট্রনিক যোগাযোগ গ্রহণে সম্মতি দিচ্ছেন:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">লেনদেনগত ও অপারেশনাল:</strong> অ্যাকাউন্ট তৈরির নিশ্চিতকরণ, পেমেন্ট যাচাই সতর্কতা, নিরাপত্তা সতর্কতা এবং বিলিং/চালান ইমেইল। এগুলি বাধ্যতামূলক এবং অ্যাকাউন্ট সক্রিয় থাকাকালীন অপ্ট-আউট করা যাবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সিস্টেম আপডেট ও নীতি পরিবর্তন:</strong> প্ল্যাটফর্ম আপডেট ঘোষণা, রক্ষণাবেক্ষণ নোটিশ এবং নীতি পরিবর্তন বিজ্ঞপ্তি।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">প্রচারমূলক ও মার্কেটিং:</strong> নতুন বৈশিষ্ট্য, বিশেষ অফার এবং প্ল্যাটফর্ম আপগ্রেডের সংবাদ — যা থেকে আপনি যেকোনো ইমেইলের আনসাবস্ক্রাইব লিঙ্কে ক্লিক করে অপ্ট-আউট করতে পারেন।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৮. ডেটা সংরক্ষণ নীতি" icon={Database} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">সক্রিয় অ্যাকাউন্ট ডেটা:</strong> আপনার মার্চেন্ট প্রোফাইল, গেটওয়ে কনফিগারেশন এবং লেনদেনের লগ আপনার অ্যাকাউন্ট সক্রিয় থাকাকালীন এবং তারপরে একটি যুক্তিসংগত সময়ের জন্য রাখা হয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্ট বন্ধের পরে AML সংরক্ষণ:</strong> মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ (বাংলাদেশ) এবং বাংলাদেশ ব্যাংক AML/CFT নির্দেশিকা মেনে, Xelpay অ্যাকাউন্ট বন্ধের পরে ন্যূনতম <strong className="text-slate-800 dark:text-slate-200">পাঁচ (৫) বছরের</strong> জন্য মৌলিক লেনদেনের লগ, সম্পর্কিত IP ইতিহাস, মার্চেন্ট পরিচয় মেটাডেটা এবং অ্যাকাউন্ট কার্যক্রমের রেকর্ড রাখার আইনগতভাবে বাধ্যতামূলক অধিকার সংরক্ষণ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লগ ডেটা:</strong> সিস্টেম অ্যাক্সেস লগ এবং নিরাপত্তা লগ নিরাপত্তা তদন্তের উদ্দেশ্যে ২৪ মাস পর্যন্ত রাখা হয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সাপোর্ট যোগাযোগ:</strong> সাপোর্ট টিকেটের রেকর্ড শেষ মিথস্ক্রিয়া থেকে ৩ বছর পর্যন্ত রাখা হয়।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৯. আপনার ডেটার অধিকার ও অ্যাকাউন্ট মুছে ফেলা" icon={Trash2} accent="green">
            <p>প্রযোজ্য আইন এবং আমাদের AML সংরক্ষণ বাধ্যবাধকতার সাপেক্ষে, আপনার ব্যক্তিগত ডেটা সংক্রান্ত নিম্নলিখিত অধিকার রয়েছে:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাক্সেসের অধিকার:</strong> Xelpay আপনার সম্পর্কে যে ব্যক্তিগত ডেটা রাখে তার একটি অনুলিপি অনুরোধ করতে পারেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সংশোধনের অধিকার:</strong> আপনার অ্যাকাউন্ট সেটিংসের মাধ্যমে বা সাপোর্টে যোগাযোগ করে ভুল ব্যক্তিগত তথ্য আপডেট বা সংশোধন করতে পারেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মুছে ফেলার অধিকার ("ভুলে যাওয়ার অধিকার"):</strong> আমাদের সাপোর্ট চ্যানেলের মাধ্যমে একটি আনুষ্ঠানিক অ্যাকাউন্ট মুছে ফেলার অনুরোধ জমা দিতে পারেন। প্রক্রিয়াকরণের পরে, আপনার সক্রিয় মার্চেন্ট প্রোফাইল এবং AML-বাধ্যতামূলক নয় এমন ডেটা স্থায়ীভাবে মুছে ফেলা হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডেটা পোর্টেবিলিটির অধিকার:</strong> একটি কাঠামোগত, মেশিন-পঠনযোগ্য বিন্যাসে আপনার মার্চেন্ট ডেটার অনুরোধ করতে পারেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">আপত্তি করার অধিকার:</strong> প্রত্যক্ষ বিপণন সহ নির্দিষ্ট ধরনের ডেটা প্রক্রিয়াকরণে আপত্তি করতে পারেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সম্মতি প্রত্যাহারের অধিকার:</strong> যেখানে প্রক্রিয়াকরণ সম্মতির উপর ভিত্তি করে, আপনি যেকোনো সময় এটি প্রত্যাহার করতে পারেন।</li>
            </ul>
            <p className="mt-3">উপরোক্ত যেকোনো অধিকার প্রয়োগ করতে, আমাদের অফিসিয়াল সাপোর্ট চ্যানেলে যোগাযোগ করুন। আমরা ৩০ দিনের মধ্যে বৈধ অনুরোধে সাড়া দেব।</p>
          </SectionBlock>

          <SectionBlock title="১০. শিশুদের গোপনীয়তা" icon={UserCheck} accent="red">
            <InfoBox type="warning">
              Xelpay সেবাগুলি কঠোরভাবে ১৮ বছর বা তার বেশি বয়সী ব্যবহারকারীদের জন্য। আমরা ১৮ বছরের কম বয়সীদের কাছ থেকে জেনেশুনে ব্যক্তিগত ডেটা সংগ্রহ করি না। আমরা যদি জানতে পারি যে কোনো নাবালক অ্যাকাউন্ট তৈরি করেছে বা আমাদের ব্যক্তিগত তথ্য প্রদান করেছে, আমরা অবিলম্বে অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট ডেটা মুছে ফেলব।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="১১. আন্তর্জাতিক ডেটা স্থানান্তর" icon={Globe} accent="green">
            <p>Xelpay প্রাথমিকভাবে বাংলাদেশ থেকে পরিচালিত হয়। তবে, Vercel এবং Supabase-এর মতো ক্লাউড অবকাঠামো প্রদানকারীদের ব্যবহারের কারণে, আপনার ডেটা বাংলাদেশের বাইরে সার্ভারে সংরক্ষিত বা প্রেরিত হতে পারে।</p>
            <p className="mt-3">আমরা নিশ্চিত করি যে যেকোনো আন্তর্জাতিক ডেটা স্থানান্তর উপযুক্ত চুক্তিভিত্তিক সুরক্ষার সাথে পরিচালিত হয় এবং কেবলমাত্র এমন অংশীদারদের সাথে যারা আমাদের নিজস্বের সমতুল্য বা তার বেশি ডেটা নিরাপত্তা মান বজায় রাখে।</p>
          </SectionBlock>

          <SectionBlock title="১২. যোগাযোগ ও ডেটা সুরক্ষা অনুসন্ধান" icon={Mail} accent="green">
            <p>সমস্ত গোপনীয়তা-সম্পর্কিত উদ্বেগ, ডেটা অ্যাক্সেসের অনুরোধ, অ্যাকাউন্ট মুছে ফেলার অনুরোধ, বা সন্দেহজনক ডেটা লঙ্ঘন রিপোর্ট করতে, অনুগ্রহ করে ড্যাশবোর্ডে তালিকাভুক্ত আমাদের অফিসিয়াল সাপোর্ট চ্যানেলের মাধ্যমে যোগাযোগ করুন।</p>
            <p className="mt-3">আইনি নোটিশ বা নিয়ন্ত্রক চিঠিপত্রের জন্য, সঠিক রাউটিং নিশ্চিত করতে আপনার বিষয়ের শিরোনামে "আইনি / ডেটা সুরক্ষা" অন্তর্ভুক্ত করুন।</p>
          </SectionBlock>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LegalPage() {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] md:py-12 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl border-0 md:border border-slate-200 dark:border-slate-800 p-6 md:p-14 min-h-[100dvh] md:min-h-0">

        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {lang === 'en' ? 'Terms & Privacy' : 'শর্তাবলী ও গোপনীয়তা'}
          </h1>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Globe size={16} className="text-slate-400" />
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-black">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 transition-colors uppercase tracking-widest ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-4 py-2 transition-colors ${lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
          {lang === 'en' ? 'Last Updated: April 01, 2026 · Effective Immediately' : 'সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬ · তাৎক্ষণিকভাবে কার্যকর'}
        </p>

        {/* Table of Contents */}
        <div className="mb-10 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <HelpCircle size={14} />
            {lang === 'en' ? 'Quick Navigation' : 'দ্রুত নেভিগেশন'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            {lang === 'en' ? (
              <>
                <span>Part 1: Terms of Service (14 sections)</span>
                <span>Part 2: Privacy Policy (12 sections)</span>
                <span>· Eligibility & Age Restrictions</span>
                <span>· Data We Collect & Legal Basis</span>
                <span>· Billing & No-Refund Policy</span>
                <span>· Third-Party Sharing Rules</span>
                <span>· Acceptable Use & AUP</span>
                <span>· Your Data Rights</span>
                <span>· Limitation of Liability</span>
                <span>· AML Retention Policy (5 years)</span>
                <span>· Governing Law (Bangladesh)</span>
                <span>· Security & Breach Notification</span>
              </>
            ) : (
              <>
                <span>পার্ট ১: সেবার শর্তাবলী (১৪টি অনুচ্ছেদ)</span>
                <span>পার্ট ২: গোপনীয়তা নীতি (১২টি অনুচ্ছেদ)</span>
                <span>· যোগ্যতা ও বয়স সীমাবদ্ধতা</span>
                <span>· ডেটা সংগ্রহ ও আইনগত ভিত্তি</span>
                <span>· বিলিং ও অ-ফেরতযোগ্য নীতি</span>
                <span>· তৃতীয় পক্ষের শেয়ারিং নিয়ম</span>
                <span>· গ্রহণযোগ্য ব্যবহার নীতি</span>
                <span>· আপনার ডেটার অধিকার</span>
                <span>· দায়ের সীমাবদ্ধতা</span>
                <span>· AML সংরক্ষণ নীতি (৫ বছর)</span>
                <span>· প্রযোজ্য আইন (বাংলাদেশ)</span>
                <span>· নিরাপত্তা ও লঙ্ঘন বিজ্ঞপ্তি</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
          {lang === 'en' ? <EnglishContent /> : <BanglaContent />}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest">
            {lang === 'en'
              ? 'By checking the agreement box during registration or by utilizing our APIs, you legally bind yourself to the entirety of this document.'
              : 'নিবন্ধনের সময় চুক্তির বাক্সে চেক করে বা আমাদের API ব্যবহার করে, আপনি এই দলিলের সম্পূর্ণতার সাথে আইনিভাবে নিজেকে আবদ্ধ করছেন।'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {lang === 'en'
              ? '© 2026 Xenverse IT · Xelpay is a product of Xenverse IT · All Rights Reserved · Bangladesh'
              : '© ২০২৬ Xenverse IT · Xelpay হলো Xenverse IT-এর একটি পণ্য · সর্বস্বত্ব সংরক্ষিত · বাংলাদেশ'}
          </p>
        </div>

      </div>
    </div>
  );
}
