'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ShieldCheck, FileText, AlertTriangle, Globe,
  ChevronDown, ChevronUp, Lock, Server,
  CreditCard, Users, Scale, Gavel, HelpCircle,
  Smartphone, Database, Trash2, RefreshCw, UserCheck,
  AlertCircle, BookOpen, Building2, Zap, Fingerprint, ShieldAlert
} from 'lucide-react';

type Lang = 'en' | 'bn';

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
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-xl ${accentMap[accent] ?? accentMap['blue']}`}>
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

// ─── ENGLISH TERMS CONTENT ────────────────────────────────────────────────────
function EnglishTermsContent() {
  return (
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

      <SectionBlock title="5. Subscription, Billing, Pricing, Add-On Services & Strict Refund Policy" icon={CreditCard} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Free/Starter Tier:</strong> Xelpay may offer a free tier equipped with a strict monthly transaction quota. Upon exhaustion of this quota, automation services will instantly halt until the next billing cycle or an upgrade is initiated. Xelpay reserves the right to modify, restrict, or discontinue the free tier at any time without prior notice.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Paid Subscriptions:</strong> Premium capabilities — including Team Members, Custom Telegram Bots, International Gateways, and higher transaction limits — require an active, recurring paid subscription. Subscription fees are charged in advance and automatically renew.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Pricing Changes:</strong> Xelpay reserves the right to change subscription pricing at any time. Active subscribers will be notified at least 7 days before a price change takes effect on their account.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Add-On Services & Usage-Based Billing:</strong> In addition to the base subscription plan, Xelpay reserves the right to charge separate, additional usage-based fees for specific "Add-On" services consumed beyond the base plan's included allowances. Such Add-On services may include, but are not limited to: outbound notification emails dispatched via Xelpay's own email infrastructure, premium SMS alerts delivered through Xelpay's third-party SMS gateway integrations, or any other resource-intensive features explicitly designated as usage-billed at the time of activation. Usage-based fees will be calculated based on actual consumption during the applicable billing period and will be clearly itemized on your invoice. By enabling and utilizing any Add-On service, you explicitly authorize Xelpay to charge the applicable usage-based fees to your registered payment method. Xelpay will endeavor to provide usage monitoring tools within the dashboard; however, it is the Merchant's sole responsibility to monitor their own Add-On consumption and manage usage accordingly. Xelpay shall bear no liability for unexpected charges resulting from unmonitored or unintended Add-On usage by the Merchant or their authorized team members.
            <InfoBox type="warning">
              <strong>Important:</strong> Enabling an Add-On service constitutes your binding agreement to the associated usage-based pricing. There are no refunds for Add-On charges already incurred and billed, consistent with our strict No-Refund Policy below.
            </InfoBox>
          </li>
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
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS Relay & Device App — Device & Internet Dependency:</strong> Our Android Relay application reads payment SMS messages on your device for automated verification. By installing and using this app, you consent to the collection of device metadata and relevant SMS content as described in our Privacy Policy. The app operates strictly in read-only mode and does not send, delete, or modify SMS messages.
            <div className="mt-3">
              <InfoBox type="warning">
                <strong className="block mb-1">Critical Device & Connectivity Requirement:</strong>
                The uninterrupted and accurate functioning of the SMS Relay verification system is entirely contingent upon the Merchant maintaining a dedicated Android device with: (a) a continuous, stable, and active mobile data or Wi-Fi internet connection; (b) the Xelpay Relay application running persistently in the foreground or background without interruption; and (c) the device powered on at all times during business operation hours. Xelpay holds <strong>absolutely zero liability</strong> for any missed, delayed, or failed payment verifications caused by — or resulting from — device power loss or shutdown, mobile network instability or internet connectivity drops, aggressive Android OS battery optimization, device memory management (RAM clearing), or any manufacturer-specific background app restrictions that terminate the Relay application process. It is the Merchant's sole operational responsibility to configure their device's battery optimization settings to exempt the Xelpay Relay application, maintain a reliable power supply, and ensure continuous internet connectivity on the relay device. Xelpay strongly recommends using a dedicated device exclusively for relay operations.
              </InfoBox>
            </div>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">MFS SMS Format Changes & Verification Failures:</strong> Xelpay's automated payment verification engine parses incoming SMS notifications from Mobile Financial Service (MFS) operators — including but not limited to bKash, Nagad, Rocket, and Upay — based on the specific SMS template formats and message structures that are active and known at the time of system development and configuration. You acknowledge and explicitly agree that:
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>MFS operators may, at their own discretion and without prior notice to Xelpay or the Merchant, modify, restructure, reformat, or entirely replace the SMS notification templates they dispatch to their customers.</li>
              <li>Any such unilateral change to an MFS operator's SMS format will render Xelpay's parsing engine temporarily unable to correctly extract transaction data, causing payment verifications to fail until Xelpay's technical team has been made aware of the change, developed a corresponding fix, tested the update, and deployed the patch to production systems.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Xelpay bears absolutely no liability</strong> for any unverified, incorrectly verified, or missed payment transactions that occur during the period between an MFS operator's SMS format change and Xelpay's successful deployment of the corresponding system patch. The Merchant agrees to promptly notify Xelpay's support team upon detecting any pattern of unexpected verification failures, which may assist in identifying format changes more rapidly.</li>
            </ul>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS Spoofing & False Positive Verifications:</strong> Xelpay's verification engine operates entirely and exclusively upon the basis of SMS notifications received on the Merchant's registered relay device. The system has no independent ability to cross-verify received SMS against the actual internal ledger or transaction database of any MFS operator or banking institution.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — SMS Spoofing & False Positives</strong>
                In the event that any person — whether a customer, third party, or malicious actor — transmits, injects, or causes to be received on the Merchant's relay device any spoofed, fabricated, forged, simulated, or otherwise fraudulent SMS message that mimics a legitimate MFS payment notification, and Xelpay's system processes and verifies such fraudulent SMS as a valid completed payment ("False Positive"), <strong>Xelpay bears absolutely no legal, financial, or operational liability whatsoever</strong> for: any goods delivered, services rendered, or digital content released by the Merchant in reliance on such False Positive verification; any financial loss, revenue loss, or business loss suffered by the Merchant as a direct or indirect result of such False Positive; or any claims brought by the Merchant, their customers, or any third party arising from such an event. The Merchant is solely and entirely responsible for implementing their own independent verification procedures — including, but not limited to, manual cross-checking of large-value transactions directly with the MFS operator's official channels — before releasing high-value goods or services based on automated verifications. Reliance solely on Xelpay's automated verification for high-risk transactions is done entirely at the Merchant's own risk.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Third-Party Service Availability:</strong> Xelpay does not guarantee the continuous availability of integrated third-party services (Telegram, MFS providers, banks, etc.). Downtime of these services is outside our control and does not constitute grounds for a refund or service credit.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Webhook Delivery & Merchant Server Outages:</strong> Xelpay makes best-effort attempts to deliver webhook payloads to your configured endpoints. In the event that your webhook endpoint is offline, unreachable, or returns HTTP 4xx or 5xx error status codes, Xelpay will attempt a limited number of automated retries as per our internal retry policy. However:
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Xelpay does <strong>not</strong> guarantee delivery if your endpoint is unavailable, returns persistent errors, times out, or is misconfigured by the Merchant.</li>
              <li>Failed webhook delivery attempts are logged in the Merchant dashboard for a limited retention period for reference purposes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Xelpay holds absolutely no liability</strong> for any business loss, order processing failures, revenue loss, or downstream application failures resulting from permanently missed webhook deliveries caused by the Merchant's server downtime, infrastructure failures, misconfiguration, or network issues on the Merchant's end. It is the Merchant's sole responsibility to maintain a highly available, properly configured, and publicly accessible webhook endpoint and to implement their own reconciliation mechanisms — such as periodic polling of Xelpay's order status API — to account for any potential webhook delivery gaps.</li>
            </ul>
          </li>
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
          <li>Determine that the Merchant has failed to comply with a KYC/Business Verification request as outlined in Section 15.</li>
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

      <SectionBlock title="15. KYC & Business Verification" icon={Fingerprint} accent="orange">
        <p>In strict compliance with the Bangladesh Financial Intelligence Unit (BFIU) directives, Anti-Money Laundering (AML) regulations, the Money Laundering Prevention Act, 2012, and the Anti-Terrorism Act, 2009 (Bangladesh), Xelpay expressly reserves the right to conduct Know Your Customer (KYC) and Business Verification procedures at any point during the lifecycle of a Merchant account — including, but not limited to, at the time of initial registration, upon a change in subscription tier, upon detection of unusual transaction patterns, or upon explicit request from any competent regulatory or law enforcement authority.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Requested Documentation:</strong> Xelpay may, at its sole and absolute discretion, formally request the submission of one or more of the following KYC and business verification documents: valid Trade License or Business Registration Certificate, National Identity Card (NID) of the business owner(s) or authorized signatories, TIN (Taxpayer Identification Number) Certificate, relevant bank account details for verification purposes, and/or any other supporting documentation deemed reasonably necessary by Xelpay's compliance team to satisfy applicable AML and BFIU obligations.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Mandatory Compliance Obligation:</strong> The Merchant is legally obligated to respond to any KYC verification request from Xelpay within the timeframe specified in the formal request (which shall be no less than 72 hours from the date of the request, unless expedited by regulatory circumstances). All submitted documents must be genuine, current, legally valid, and unaltered. Submission of forged, falsified, or fraudulently obtained documentation constitutes a serious criminal offense under Bangladesh law and will result in immediate permanent account termination and mandatory referral to the appropriate law enforcement authorities.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Consequences of Non-Compliance:</strong> Failure or refusal to provide the requested KYC documentation within the stipulated timeframe will result in the immediate suspension of the Merchant's account and all associated API access, without any prior further notice. Extended non-compliance, or failure to provide satisfactory documentation upon review, will result in permanent account termination.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">No Refund on KYC-Triggered Suspension</strong>
              Account suspension or termination arising from non-compliance with a KYC or Business Verification request does not entitle the Merchant to any refund of pre-paid subscription fees or Add-On charges, consistent with Xelpay's strict No-Refund Policy stated in Section 5.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Data Handling of KYC Documents:</strong> All KYC documents submitted to Xelpay are handled and stored in strict accordance with our Privacy Policy (Part 2), subject to the mandatory AML-required data retention obligations outlined therein. KYC documents are accessible only by Xelpay's authorized compliance personnel on a strict need-to-know basis.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="16. Reversed Transactions, MFS Clawbacks & Operator Disputes" icon={ShieldAlert} accent="red">
        <p>Xelpay's role is strictly limited to that of a technological verification intermediary. The platform confirms the receipt of a payment notification and fires the corresponding webhook; it does not guarantee the finality, permanence, or irrevocability of any underlying financial transaction conducted through a third-party MFS provider, Bank, or payment gateway.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Zero Liability — Reversals, Clawbacks & Operator Disputes</strong>
          In the event that any payment transaction that was previously verified and confirmed by Xelpay's system is subsequently reversed, recalled, frozen, disputed, or clawed back by the originating customer/sender, the relevant MFS operator (e.g., bKash, Nagad, Rocket), the Merchant's or customer's bank, any payment gateway provider, Bangladesh Bank, or any other competent financial or regulatory authority — for any reason whatsoever, including but not limited to: fraud investigations, unauthorized transaction claims, customer disputes, regulatory orders, or system reconciliation errors — <strong>Xelpay bears absolutely no legal, financial, or operational liability or responsibility</strong> for: any goods delivered, services rendered, digital content released, or access granted by the Merchant in reliance on the prior verification confirmation; any resulting financial loss, revenue loss, inventory loss, or business loss suffered by the Merchant; or any claims, lawsuits, or proceedings brought against the Merchant by their customers or any third party arising from such a reversal or clawback event.
        </InfoBox>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Independent Risk Obligation:</strong> It is the Merchant's sole and exclusive responsibility to maintain their own robust fraud prevention, order verification, and risk management policies — independent of Xelpay's automated verification — before releasing high-value goods, services, or irreversible digital deliverables. Xelpay's verification confirmation is a technical signal only and does not constitute a guarantee of payment finality or a warranty against future reversals.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Dispute Resolution Between Merchant & Customer:</strong> Any payment dispute, refund request, or chargeback initiated by the Merchant's end-customer is a matter strictly and exclusively between the Merchant and their customer (and/or the respective MFS operator or bank). Xelpay is not a party to any such dispute and is under no legal obligation to intervene, mediate, or provide any form of financial restitution in connection therewith.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Cooperation in Investigations:</strong> Notwithstanding the foregoing liability limitations, Xelpay will, where legally required or operationally feasible, cooperate with authorized regulatory and law enforcement investigations related to disputed transactions by providing relevant transaction log data held by our systems, subject to our Privacy Policy and applicable legal requirements.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="17. Strict B2B Service — No End-Customer Support Obligation" icon={Users} accent="purple">
        <p>Xelpay is an exclusively <strong className="text-slate-800 dark:text-slate-200">Business-to-Business (B2B)</strong> technology platform. The contractual relationship established by these Terms of Service exists solely and exclusively between Xelpay (Xenverse IT) and the registered Merchant entity.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">No Direct Relationship with End-Customers:</strong> Xelpay has no direct legal, contractual, commercial, or financial relationship with any end-customer, buyer, or third party who transacts through the Merchant's Xelpay-powered payment interface or checkout page. End-customers are customers of the Merchant, not of Xelpay.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">No Support Obligation for End-Customers:</strong> Xelpay is under <strong>absolutely no legal or contractual obligation</strong> to: respond to, investigate, or resolve any support inquiry, complaint, or claim submitted directly by a Merchant's end-customer; process, approve, or facilitate any refund, chargeback, or payment dispute on behalf of a Merchant's end-customer; or provide any form of customer service, dispute resolution, or after-sales support to the Merchant's end-customers in connection with their purchases or transactions.
            <InfoBox type="info">
              <strong>Merchant Responsibility:</strong> It is the Merchant's sole and exclusive legal responsibility to provide adequate customer support, honor their own refund policies, and resolve all disputes with their end-customers directly. Xelpay's support channels are available exclusively to registered Merchants for platform-related technical issues and account management queries.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant Indemnification for End-Customer Claims:</strong> The Merchant explicitly agrees to fully indemnify, defend, and hold Xelpay harmless from and against any claim, lawsuit, regulatory complaint, or legal proceeding initiated by any of the Merchant's end-customers arising from — or in connection with — the Merchant's commercial operations, product or service quality, delivery failures, refund disputes, or any misrepresentation made by the Merchant to their customers, regardless of whether such activities utilized the Xelpay platform as a technical payment interface.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="18. Webhook Idempotency & Double-Crediting Prevention" icon={Zap} accent="purple">
        <p>Xelpay's webhook delivery system is engineered to dispatch payment confirmation payloads upon verified transaction events. However, in scenarios involving network timeouts, transient connectivity failures between Xelpay's servers and the Merchant's endpoint, or the receipt of an ambiguous HTTP response code from the Merchant's server, Xelpay's system may, in accordance with its retry policy, automatically re-attempt the delivery of the same webhook payload one or more times within a defined retry window.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Merchant Responsibility — Idempotency Implementation</strong>
          It is the <strong>absolute, non-delegable, and sole technical and legal responsibility</strong> of the Merchant's development team to implement robust <strong>idempotency logic</strong> within their webhook receiver endpoint. Idempotency, in this context, means that the Merchant's system must be architecturally designed to recognize and gracefully discard duplicate webhook deliveries carrying the same unique Transaction ID (TrxID) or Xelpay Order Reference, thereby ensuring that any given verified transaction is credited, fulfilled, or actioned only once, regardless of how many times the webhook notification is received. Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> whatsoever for any instance of double-crediting, duplicate order fulfillment, duplicate digital content delivery, or any other form of duplicate financial or operational action taken by the Merchant's system as a result of the Merchant's failure to implement adequate idempotency safeguards. The financial and reputational consequences of double-crediting a Merchant's end-customers — including any resulting losses, disputes, or regulatory exposure — fall entirely and exclusively upon the Merchant. Xelpay's webhook documentation provides technical guidance on implementing idempotency, and the Merchant is solely responsible for ensuring their implementation is operationally sound.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="19. Regulatory Shutdown, Government Directives & Force Majeure on Service Features" icon={Building2} accent="red">
        <p>Xelpay operates in a regulated and rapidly evolving technological and regulatory environment. Several of Xelpay's core verification capabilities — specifically SMS-reading automation via the Android Relay application, IMAP-based bank email scraping and parsing, and related data extraction functionalities — depend upon regulatory permissions, operator compliance postures, and the absence of governmental or quasi-governmental restrictions that may be imposed at any future time without prior notice to Xelpay.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Regulatory Authority:</strong> In the event that Bangladesh Bank, the Bangladesh Telecommunication Regulatory Commission (BTRC), the Ministry of Posts, Telecommunications and Information Technology, or any other competent governmental, quasi-governmental, judicial, or regulatory authority of Bangladesh or any other relevant jurisdiction issues a directive, circular, order, regulation, or policy — whether formal or informal — that prohibits, restricts, limits, conditions, or requires modification of Xelpay's SMS-reading automation, IMAP email scraping, automated transaction parsing, or any other feature or component of the Xelpay platform, Xelpay reserves the absolute and unilateral right to:</li>
        </ul>
        <ul className="list-disc pl-5 mt-2 ml-4 space-y-2">
          <li>Immediately suspend, disable, modify, or permanently discontinue the affected service feature(s) with immediate effect and without any prior notice to the Merchant.</li>
          <li>Modify, restrict, or fundamentally alter how the relevant feature operates to bring it into compliance with the applicable directive or regulatory requirement.</li>
          <li>Permanently terminate the affected service offering entirely, where compliance is deemed impossible or commercially impractical by Xelpay at its sole discretion.</li>
        </ul>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability & Zero Refund — Regulatory Shutdown</strong>
          Xelpay shall bear <strong>absolutely no legal or financial liability</strong> of any nature — and no refunds, service credits, or compensatory payments of any kind shall be due or payable to the Merchant — in connection with any such regulatory-mandated suspension, modification, or permanent discontinuation of any service feature. The Merchant explicitly acknowledges and accepts that the risk of regulatory change affecting Xelpay's service capabilities is an inherent and foreseeable risk of operating a digital payment business in Bangladesh and that such events shall be treated as a Force Majeure occurrence under these Terms. The Merchant is solely responsible for maintaining contingency plans for their business operations that do not rely exclusively upon Xelpay's automated verification capabilities.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="20. Publicity & Marketing Rights" icon={Users} accent="green">
        <p>By registering a Xelpay merchant account and actively utilizing the Xelpay platform for your business operations, you hereby grant Xelpay (Xenverse IT) a <strong className="text-slate-800 dark:text-slate-200">non-exclusive, royalty-free, worldwide, perpetual (until opt-out), sublicensable license</strong> to use, display, and reproduce your registered business name, associated business brand name, and official business logo in the following limited contexts:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li>On Xelpay's official website, landing pages, and marketing materials, including but not limited to "Trusted By," "Our Partners," "Merchants," or equivalent sections showcasing businesses that utilize the Xelpay platform.</li>
          <li>In Xelpay's case studies, promotional blog posts, social media content, press releases, investor materials, and sales collateral, to illustrate the breadth and legitimacy of Xelpay's merchant base.</li>
          <li>In pitches, presentations, and materials prepared for potential business partners, investors, or regulatory bodies.</li>
        </ul>
        <InfoBox type="info">
          <strong>Opt-Out Right:</strong> If you do not wish for your business name, brand, or logo to be used in any of the above promotional contexts, you may exercise your opt-out right at any time by submitting a formal written opt-out request to Xelpay's support team through the official support channel. Upon receipt and processing of a valid opt-out request, Xelpay will cease future use of your brand assets in new promotional materials within a commercially reasonable timeframe. This license does not grant Xelpay any right to use your brand assets in a manner that misrepresents your business, implies an exclusive partnership, or constitutes an endorsement of any third-party products or services.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="21. Account Non-Transferability" icon={Lock} accent="red">
        <p>Xelpay merchant accounts are issued to, and are for the exclusive use of, the specific registered business entity or individual sole proprietor that completed the account registration process. Xelpay accounts are, at all times, <strong className="text-slate-800 dark:text-slate-200">strictly and absolutely non-transferable</strong>.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Transfer Actions:</strong> Merchants are expressly prohibited from — and hereby agree not to — sell, transfer, assign, lease, rent, sublicense, gift, pledge, hypothecate, or in any other manner convey or attempt to convey ownership, access, or control of their Xelpay merchant account, associated API keys, Webhook secrets, or any account credentials to any third party, whether for consideration or otherwise.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Business Succession:</strong> In the event of a legitimate business acquisition, merger, or change of beneficial ownership of the Merchant's registered business entity, the Merchant must notify Xelpay in writing prior to completing any such transaction. Xelpay reserves the right to review the proposed transaction, require updated KYC documentation for the new controlling entity, and either approve the transition or, at its sole discretion, require the new entity to register a separate, independent Xelpay account.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Enforcement — Immediate Lifetime Ban:</strong> Any unauthorized transfer of, or attempt to transfer, a Xelpay merchant account will be treated as a critical, immediate security and AML compliance breach. Upon detection of any such unauthorized transfer — whether through account access pattern analysis, third-party reporting, or any other means — Xelpay will:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Immediately impose a permanent, irrevocable lifetime ban on the transferred account and all associated API keys with immediate effect.</li>
              <li>Permanently ban any new or existing accounts linked to the original registrant's verified identity and the identity of the unauthorized recipient.</li>
              <li>Retain all account data in accordance with our AML data retention obligations and report the incident to BFIU and relevant authorities where legally required.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">AML Risk — Zero Tolerance</strong>
              The strict prohibition on account transfers is a core AML compliance control. Unauthorized account transfers obscure beneficial ownership, enable circumvention of KYC controls, and create unacceptable money laundering and fraud risks — all of which Xelpay is legally obligated to prevent under Bangladeshi law. No refunds will be issued upon account termination due to unauthorized transfer.
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>

      <SectionBlock title="22. Underlying MFS, Bank & Third-Party Transaction Fees" icon={CreditCard} accent="amber">
        <p>Xelpay's subscription fees and any applicable Add-On service fees, as described in Section 5 of these Terms, exclusively cover access to and use of Xelpay's proprietary software infrastructure, payment verification engine, API services, dashboard, and associated technical support. These fees do <strong className="text-slate-800 dark:text-slate-200">NOT</strong> cover, include, absorb, or offset any third-party fees, charges, or costs associated with the underlying financial transactions conducted by the Merchant or their customers.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Sole Responsibility for Third-Party Fees:</strong> The Merchant is solely, exclusively, and entirely responsible for bearing all costs and fees imposed by third-party financial service providers in connection with their business transactions, including but not limited to: MFS cash-out charges (bKash cash-out fees, Nagad cash-out fees, Rocket cash-out fees, etc.); MFS person-to-person (P2P) send money fees or transfer charges; bank-to-bank transfer fees and BEFTN/RTGS charges; international payment gateway processing fees, currency conversion fees, and cross-border transaction charges; any merchant discount rates (MDR) applicable on payment gateway transactions; and all applicable taxes, levies, VAT, or duties payable to the Government of Bangladesh or any other tax authority on financial transactions.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Fee Structure Changes by Third Parties:</strong> Xelpay has no control over the fee structures, pricing policies, or terms of service of any MFS operator, bank, or payment gateway provider. Third-party fee changes are outside Xelpay's authority and will not constitute grounds for a reduction in Xelpay's subscription fees or any form of refund.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Obligation to Verify Fees:</strong> It is the Merchant's sole responsibility to independently verify and remain current with the fee schedules of all third-party financial service providers they use in conjunction with the Xelpay platform, and to factor such fees appropriately into their business pricing and financial planning.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="23. Dashboard Log Retention Limits & Data Export Responsibility" icon={Database} accent="amber">
        <p>To maintain optimal server performance, system stability, and cost-efficient infrastructure operations, Xelpay's merchant dashboard displays active transaction logs, order history, webhook delivery logs, and associated operational data on a <strong className="text-slate-800 dark:text-slate-200">limited rolling window basis</strong>. By default, the dashboard will display transactional and operational logs for the most recent rolling period, which is currently set at <strong className="text-slate-800 dark:text-slate-200">ninety (90) calendar days</strong> from the date of the transaction or event. Xelpay reserves the right to adjust this rolling display window at its sole discretion, with reasonable notice provided to active Merchants via dashboard notification.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Data Export Responsibility:</strong> It is the Merchant's sole and absolute responsibility to regularly and proactively export their transaction data, order logs, and any other operational records they require for their own business accounting, reconciliation, tax compliance, auditing, or dispute resolution purposes, using the CSV export or equivalent data export functionality provided within the Xelpay dashboard. Xelpay will not be responsible for providing historical data that has aged beyond the active dashboard display window upon request.
            <InfoBox type="warning">
              <strong>Recommendation:</strong> Xelpay strongly recommends that Merchants establish a routine data export schedule — at minimum, on a monthly basis — to maintain a complete and up-to-date archive of their transaction history in their own secure storage systems. Failure to export data regularly may result in the permanent loss of dashboard-visible transaction records beyond the rolling retention window.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Backend AML Retention (Non-Dashboard):</strong> Notwithstanding the limited dashboard display window described above, Xelpay's backend systems separately retain encrypted, immutable transaction logs and associated account activity records for a minimum period of <strong className="text-slate-800 dark:text-slate-200">Five (5) years</strong> following the transaction date, in strict compliance with AML regulatory requirements as detailed in the Privacy Policy. These backend-retained records are not directly accessible via the Merchant dashboard but may be made available to competent regulatory or law enforcement authorities upon valid legal request, or to the Merchant in connection with a specific formal compliance or dispute investigation, at Xelpay's discretion and subject to applicable law.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Liability for Dashboard Data Loss:</strong> Xelpay bears absolutely no liability for any business losses, accounting discrepancies, tax compliance issues, or any other consequences arising from the Merchant's failure to export and maintain their own records within the dashboard display window, regardless of the reason for such failure.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="24. API Versioning, Updates & Deprecation Policy" icon={Zap} accent="purple">
        <p>Xelpay continuously invests in the improvement, security hardening, and capability expansion of its API infrastructure. As part of this ongoing development mandate, Xelpay expressly reserves the right to release new versions of its API, introduce breaking or non-breaking changes to existing API endpoints, modify API request or response schemas, and deprecate or permanently retire older API versions at any time.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Deprecation Notice:</strong> Where operationally feasible and commercially reasonable, Xelpay will endeavor to provide advance notice of planned API version deprecations via dashboard notifications, email alerts, or API changelog updates. However, in cases involving critical security vulnerabilities, mandatory regulatory compliance changes, or other urgent operational necessities, Xelpay reserves the right to implement changes or deprecate API versions with immediate effect and without prior notice.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Absolute Maintenance Responsibility:</strong> It is the <strong>absolute, non-delegable, and sole technical responsibility</strong> of the Merchant and their development team to actively monitor Xelpay's API changelog, version release notes, and deprecation announcements; update their integration code in a timely manner to remain compatible with current and supported API versions; and test their integration thoroughly following any API update or version migration.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — Broken Integrations from Outdated Code</strong>
              Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> for any broken integrations, failed payment verifications, missed webhook deliveries, API authentication failures, data parsing errors, or any other technical malfunction or business disruption experienced by the Merchant as a direct or indirect result of the Merchant's failure to update their integration code to remain compatible with Xelpay's current API version. A Merchant's use of a deprecated or retired API version constitutes the Merchant's sole risk, and Xelpay is under no obligation to maintain backward compatibility with deprecated versions beyond any stated deprecation window.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Refunds for Integration Failures:</strong> API version-related integration failures or service disruptions experienced by the Merchant due to outdated integration code do not constitute grounds for a refund of subscription fees or any other form of financial compensation from Xelpay.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="25. Support Policy, SLA & Zero-Tolerance for Staff Harassment" icon={ShieldAlert} accent="red">
        <p>Xelpay provides merchant support services through its designated official support channels as communicated within the merchant dashboard. Xelpay is committed to providing responsive and helpful support to all Merchants; however, the following terms govern the nature, scope, and conduct expectations of the support relationship.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Best-Effort Support — No Guaranteed Response SLA:</strong> Unless the Merchant has entered into a separate, formally executed Enterprise Agreement with Xelpay that explicitly specifies binding response time Service Level Agreements (SLAs), all merchant support is provided strictly on a <strong>"best-effort" basis</strong>. Xelpay makes no binding guarantee regarding specific response times, resolution times, or the order in which support tickets are addressed. Support queue prioritization is at Xelpay's sole discretion. Standard support response times may vary depending on ticket volume, issue complexity, and staffing availability.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Scope of Support:</strong> Xelpay's support services cover platform-related technical issues, API integration assistance, account configuration guidance, and billing inquiries. Support does not extend to general software development consulting, custom feature development, debugging of the Merchant's own proprietary codebase (beyond direct Xelpay API integration issues), or any support for the Merchant's end-customers.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Zero-Tolerance Policy Against Support Staff Harassment:</strong> Xelpay maintains an absolute and non-negotiable zero-tolerance policy against any form of abusive, threatening, harassing, intimidating, defamatory, or discriminatory conduct directed by a Merchant (or any person acting on their behalf) toward any Xelpay support staff member, employee, contractor, or representative, through any communication channel.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Immediate Permanent Ban — Harassment of Support Staff</strong>
              Prohibited conduct includes, without limitation: the use of abusive, vulgar, profane, or threatening language in written or verbal communications; the issuance of threats of physical harm, legal action used as intimidation (as distinct from legitimate legal correspondence), or public defamation; repeated harassment, trolling, or deliberately bad-faith communications designed to obstruct support operations; and any other behavior that a reasonable person would consider to constitute harassment or workplace abuse. Any single confirmed instance of harassment of Xelpay support staff will result in the <strong>immediate, permanent, and irrevocable termination</strong> of the Merchant's account and all associated API access, with no prior warning. This termination is non-negotiable, non-reversible, and will be treated as a policy violation under Section 6 (AUP). <strong>No refunds of any pre-paid subscription fees or Add-On charges will be issued upon termination under this policy</strong>, consistent with our strict No-Refund Policy.
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>
    </div>
  );
}

// ─── BANGLA TERMS CONTENT ─────────────────────────────────────────────────────
function BanglaTermsContent() {
  return (
    <div className="space-y-4" style={{ fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}>
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

      <SectionBlock title="৫. সাবস্ক্রিপশন, বিলিং, মূল্য নির্ধারণ, অ্যাড-অন সেবা ও কঠোর অফেরতযোগ্য নীতি" icon={CreditCard} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">ফ্রি/স্টার্টার টায়ার:</strong> Xelpay একটি কঠোর মাসিক লেনদেন কোটা সহ বিনামূল্যের টায়ার অফার করতে পারে। এই কোটা শেষ হলে, পরবর্তী বিলিং চক্র বা আপগ্রেড না করা পর্যন্ত অটোমেশন সেবা তাৎক্ষণিকভাবে বন্ধ হয়ে যাবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেইড সাবস্ক্রিপশন:</strong> প্রিমিয়াম সুবিধাগুলি — টিম মেম্বার, কাস্টম টেলিগ্রাম বট, ইন্টারন্যাশনাল গেটওয়ে এবং উচ্চতর লেনদেন সীমা সহ — একটি সক্রিয়, পুনরাবৃত্তিমূলক পেইড সাবস্ক্রিপশন প্রয়োজন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">মূল্য পরিবর্তন:</strong> Xelpay যেকোনো সময় সাবস্ক্রিপশনের মূল্য পরিবর্তন করার অধিকার সংরক্ষণ করে। সক্রিয় সাবস্ক্রাইবারদের তাদের অ্যাকাউন্টে কোনো মূল্য পরিবর্তন কার্যকর হওয়ার কমপক্ষে ৭ দিন আগে অবহিত করা হবে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">অ্যাড-অন সেবা ও ব্যবহার-ভিত্তিক বিলিং:</strong> বেস সাবস্ক্রিপশন প্ল্যানের পাশাপাশি, Xelpay নির্দিষ্ট "অ্যাড-অন" সেবার জন্য আলাদা, অতিরিক্ত ব্যবহার-ভিত্তিক ফি চার্জ করার অধিকার সংরক্ষণ করে — যা বেস প্ল্যানের অন্তর্ভুক্ত ভাতার বাইরে ব্যবহৃত হয়। এই ধরনের অ্যাড-অন সেবার মধ্যে অন্তর্ভুক্ত থাকতে পারে কিন্তু সীমাবদ্ধ নয়: Xelpay-এর নিজস্ব ইমেইল অবকাঠামোর মাধ্যমে প্রেরিত আউটবাউন্ড নোটিফিকেশন ইমেইল, Xelpay-এর তৃতীয় পক্ষের SMS গেটওয়ে ইন্টিগ্রেশনের মাধ্যমে ডেলিভার করা প্রিমিয়াম SMS সতর্কতা, বা সক্রিয়করণের সময় ব্যবহার-বিলযোগ্য হিসেবে স্পষ্টভাবে মনোনীত যেকোনো অন্যান্য রিসোর্স-নিবিড় বৈশিষ্ট্য। ব্যবহার-ভিত্তিক ফি প্রযোজ্য বিলিং পিরিয়ডে প্রকৃত ব্যবহারের উপর ভিত্তি করে গণনা করা হবে এবং আপনার চালানে স্পষ্টভাবে আইটেমাইজ করা হবে। যেকোনো অ্যাড-অন সেবা সক্ষম ও ব্যবহার করে, আপনি স্পষ্টভাবে Xelpay-কে আপনার নিবন্ধিত পেমেন্ট পদ্ধতিতে প্রযোজ্য ব্যবহার-ভিত্তিক ফি চার্জ করার অনুমোদন দিচ্ছেন।
            <div className="mt-3">
              <InfoBox type="warning">
                <strong>গুরুত্বপূর্ণ:</strong> একটি অ্যাড-অন সেবা সক্ষম করা সংশ্লিষ্ট ব্যবহার-ভিত্তিক মূল্য নির্ধারণে আপনার বাধ্যতামূলক সম্মতির প্রমাণ গঠন করে। ইতিমধ্যে বিল করা অ্যাড-অন চার্জের জন্য কোনো ফেরত দেওয়া হয় না, নিচে উল্লিখিত আমাদের কঠোর অ-ফেরতযোগ্য নীতির সাথে সামঞ্জস্য রেখে।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">কঠোর অ-ফেরতযোগ্য নীতি:</strong> আমাদের পরিষেবার ডিজিটাল, API-ভিত্তিক এবং অবকাঠামোগত প্রকৃতির কারণে, একবার সক্রিয় হয়ে পেমেন্ট প্রক্রিয়া সম্পন্ন হলে সমস্ত সাবস্ক্রিপশন পেমেন্ট <strong className="text-red-600 dark:text-red-400">কঠোরভাবে অ-ফেরতযোগ্য</strong>।</li>
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
          <li>Xelpay, Xenverse IT, বা যেকোনো Xelpay কর্মচারী, অংশীদার বা অনুমোদিত সত্তার ছদ্মবেশ ধারণ করা।</li>
          <li>মানব পাচার, শিশু শোষণ, বা ব্যক্তিদের বিরুদ্ধে যেকোনো অপরাধ সহজতর করতে প্ল্যাটফর্ম ব্যবহার করা।</li>
          <li>OFAC, জাতিসংঘ নিরাপত্তা পরিষদের নিষেধাজ্ঞা তালিকা বা বাংলাদেশ ব্যাংকের নির্দেশ দ্বারা নিষিদ্ধ তালিকাভুক্ত কোনো সত্তা বা ব্যক্তির পক্ষে পরিচালনা করা।</li>
          <li>গ্রাহক বা যেকোনো তৃতীয় পক্ষকে অযাচিত বাল্ক যোগাযোগ (স্প্যাম) পাঠাতে প্ল্যাটফর্ম ব্যবহার করা।</li>
        </ul>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">প্রয়োগমূলক পদক্ষেপ</strong>
          এই AUP-এর যেকোনো লঙ্ঘন আপনার মার্চেন্ট অ্যাকাউন্টের তাৎক্ষণিক, অপরিবর্তনীয়, স্থায়ী নিষিদ্ধকরণ, সমস্ত API কী বাতিল এবং স্থানীয় আইন প্রয়োগকারী সংস্থা, BFIU (বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট), সাইবার ক্রাইম বিভাগ এবং প্রাসঙ্গিক ব্যাংকিং কর্তৃপক্ষের কাছে আপনার ডেটা, লেনদেনের লগ এবং IP ইতিহাস স্বয়ংক্রিয়ভাবে প্রকাশ করার কারণ হবে — আপনাকে আর কোনো পূর্ববর্তী নোটিশ না দিয়েই।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="৭. তৃতীয় পক্ষের ইন্টিগ্রেশন (IMAP, Telegram, SMS ও বাহ্যিক API)" icon={Smartphone} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">কাস্টম টেলিগ্রাম বট:</strong> Xelpay-এ একটি কাস্টম টেলিগ্রাম বট টোকেন সরবরাহ করে, আপনি আপনার বটের মাধ্যমে ওয়েবহুক পেলোড এবং অপারেশনাল বিজ্ঞপ্তি পাঠানোর জন্য আমাদের সিস্টেমকে স্পষ্ট, স্বয়ংক্রিয় অনুমতি দিচ্ছেন। আপনি Telegram-এর সেবার শর্তাবলীর সাথে আপনার বটের সম্মতির জন্য দায়ী।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">IMAP ব্যাংক ইমেইল সিঙ্ক্রোনাইজেশন:</strong> আমাদের ব্যাংক ট্রান্সফার যাচাই বৈশিষ্ট্য ব্যবহার করতে আপনার পেমেন্ট বিজ্ঞপ্তি ইমেইল ইনবক্সে শুধুমাত্র পড়ার অ্যাক্সেস প্রয়োজন। আপনি স্বীকার করছেন যে Xelpay প্রোগ্রাম্যাটিকভাবে এবং একচেটিয়াভাবে নির্দিষ্ট ব্যাংকিং ডোমেন থেকে ইমেইল পার্স করবে। আমরা আপনার ইমেইল প্রদানকারীর ব্যাপক নিরাপত্তা বা আপনার ইনবক্সের অন্য যেকোনো ইমেইলের জন্য কোনো দায় বহন করি না।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS রিলে ও ডিভাইস অ্যাপ — ডিভাইস ও ইন্টারনেট নির্ভরতা:</strong> আমাদের অ্যান্ড্রয়েড রিলে অ্যাপ্লিকেশন স্বয়ংক্রিয় যাচাইয়ের জন্য আপনার ডিভাইসে পেমেন্ট SMS বার্তা পড়ে। এই অ্যাপটি ইনস্টল এবং ব্যবহার করে, আপনি আমাদের গোপনীয়তা নীতিতে বর্ণিত ডিভাইস মেটাডেটা এবং প্রাসঙ্গিক SMS বিষয়বস্তু সংগ্রহে সম্মত হচ্ছেন। অ্যাপটি শুধুমাত্র রিড-অনলি মোডে কাজ করে এবং SMS বার্তা পাঠায়, মুছে বা পরিবর্তন করে না।
            <div className="mt-3">
              <InfoBox type="warning">
                <strong className="block mb-1">গুরুত্বপূর্ণ ডিভাইস ও সংযোগ প্রয়োজনীয়তা:</strong>
                SMS রিলে যাচাই সিস্টেমের নিরবচ্ছিন্ন ও নির্ভুল কার্যকারিতা সম্পূর্ণরূপে নির্ভর করে মার্চেন্টের একটি ডেডিকেটেড অ্যান্ড্রয়েড ডিভাইস বজায় রাখার উপর, যেখানে থাকবে: (ক) একটি ক্রমাগত, স্থিতিশীল এবং সক্রিয় মোবাইল ডেটা বা Wi-Fi ইন্টারনেট সংযোগ; (খ) Xelpay রিলে অ্যাপ্লিকেশন বিঘ্নহীনভাবে ফোরগ্রাউন্ড বা ব্যাকগ্রাউন্ডে চলমান; এবং (গ) ব্যবসায়িক সময়ে সর্বদা ডিভাইস চালু থাকা। Xelpay নিম্নলিখিত কারণে কোনো মিসড, বিলম্বিত বা ব্যর্থ পেমেন্ট যাচাইয়ের জন্য <strong>সম্পূর্ণরূপে কোনো দায় বহন করে না</strong>: ডিভাইসের বিদ্যুৎ বিভ্রাট বা বন্ধ হওয়া, মোবাইল নেটওয়ার্ক অস্থিরতা বা ইন্টারনেট সংযোগ বিচ্ছিন্ন হওয়া, আগ্রাসী অ্যান্ড্রয়েড OS ব্যাটারি অপ্টিমাইজেশন, ডিভাইস মেমোরি ম্যানেজমেন্ট (RAM ক্লিয়ারিং), বা রিলে অ্যাপ্লিকেশন প্রক্রিয়া বন্ধ করে দেওয়া যেকোনো নির্মাতা-নির্দিষ্ট ব্যাকগ্রাউন্ড অ্যাপ বিধিনিষেধ। Xelpay দৃঢ়ভাবে একটি ডেডিকেটেড ডিভাইস একচেটিয়াভাবে রিলে অপারেশনের জন্য ব্যবহার করার পরামর্শ দেয়।
              </InfoBox>
            </div>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">MFS SMS ফরম্যাট পরিবর্তন ও যাচাই ব্যর্থতা:</strong> Xelpay-এর স্বয়ংক্রিয় পেমেন্ট যাচাই ইঞ্জিন মোবাইল ফিনান্সিয়াল সার্ভিস (MFS) অপারেটরদের — bKash, Nagad, Rocket, Upay সহ — কাছ থেকে আসা ইনকামিং SMS বিজ্ঞপ্তি পার্স করে। আপনি স্বীকার করছেন এবং স্পষ্টভাবে সম্মত হচ্ছেন যে:
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>MFS অপারেটররা তাদের নিজস্ব বিবেচনায় এবং Xelpay বা মার্চেন্টকে পূর্ববর্তী নোটিশ না দিয়ে তাদের গ্রাহকদের কাছে পাঠানো SMS বিজ্ঞপ্তি টেমপ্লেট পরিবর্তন, পুনর্গঠন, পুনর্বিন্যাস বা সম্পূর্ণরূপে প্রতিস্থাপন করতে পারে।</li>
              <li>কোনো MFS অপারেটরের SMS ফরম্যাটে এই ধরনের একতরফা পরিবর্তন Xelpay-এর পার্সিং ইঞ্জিনকে সাময়িকভাবে লেনদেনের ডেটা সঠিকভাবে নিষ্কাশন করতে অক্ষম করবে, যার ফলে Xelpay-এর প্যাচ মোতায়েন সম্পন্ন না হওয়া পর্যন্ত পেমেন্ট যাচাই ব্যর্থ হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Xelpay সম্পূর্ণরূপে কোনো দায় বহন করে না</strong> MFS অপারেটরের SMS ফরম্যাট পরিবর্তন এবং Xelpay-এর সংশ্লিষ্ট সিস্টেম প্যাচ সফলভাবে মোতায়েনের মধ্যবর্তী সময়কালে যে কোনো অযাচাইকৃত, ভুলভাবে যাচাইকৃত বা মিসড পেমেন্ট লেনদেনের জন্য।</li>
            </ul>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS স্পুফিং ও মিথ্যা ইতিবাচক যাচাই:</strong> Xelpay-এর যাচাই ইঞ্জিন সম্পূর্ণ এবং একচেটিয়াভাবে মার্চেন্টের নিবন্ধিত রিলে ডিভাইসে প্রাপ্ত SMS বিজ্ঞপ্তির উপর ভিত্তি করে কাজ করে।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় — SMS স্পুফিং ও মিথ্যা ইতিবাচক</strong>
                যে কোনো ব্যক্তি — গ্রাহক, তৃতীয় পক্ষ বা দুর্ভাবনাপ্রসূত কারুকলার মাধ্যমে — মার্চেন্টের রিলে ডিভাইসে কোনো স্পুফড, বানোয়াট, জাল, সিমুলেটেড বা অন্যথায় প্রতারণামূলক SMS বার্তা প্রেরণ করলে যা একটি বৈধ MFS পেমেন্ট বিজ্ঞপ্তি অনুকরণ করে, এবং Xelpay-এর সিস্টেম এই ধরনের প্রতারণামূলক SMS-কে একটি বৈধ সম্পন্ন পেমেন্ট হিসেবে প্রক্রিয়া ও যাচাই করলে ("মিথ্যা ইতিবাচক") — <strong>Xelpay এর জন্য কোনো আইনগত, আর্থিক বা পরিচালনগত দায় বহন করে না</strong>: মার্চেন্ট কর্তৃক এই ধরনের মিথ্যা ইতিবাচক যাচাইয়ের উপর নির্ভর করে প্রদত্ত পণ্য, সেবা বা ডিজিটাল বিষয়বস্তু; বা মার্চেন্টের আর্থিক ক্ষতি, রাজস্ব ক্ষতি বা ব্যবসায়িক ক্ষতির জন্য। উচ্চ-মূল্যের পণ্য বা সেবা প্রদানের আগে মার্চেন্টের স্বাধীনভাবে লেনদেন যাচাই করার একমাত্র দায়িত্ব রয়েছে।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের সেবার প্রাপ্যতা:</strong> Xelpay সমন্বিত তৃতীয় পক্ষের সেবা (Telegram, MFS প্রদানকারী, ব্যাংক ইত্যাদি)-এর ক্রমাগত প্রাপ্যতার গ্যারান্টি দেয় না। এই সেবাগুলির ডাউনটাইম আমাদের নিয়ন্ত্রণের বাইরে এবং ফেরত বা সেবা ক্রেডিটের ভিত্তি গঠন করে না।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">ওয়েবহুক ডেলিভারি ও মার্চেন্ট সার্ভার আউটেজ:</strong> Xelpay আপনার কনফিগার করা এন্ডপয়েন্টে ওয়েবহুক পেলোড পৌঁছে দেওয়ার সর্বোত্তম প্রচেষ্টা করে। আপনার ওয়েবহুক এন্ডপয়েন্ট অফলাইন থাকলে বা HTTP 4xx বা 5xx ত্রুটি কোড ফেরত দিলে, Xelpay আমাদের অভ্যন্তরীণ রিট্রাই নীতি অনুযায়ী একটি সীমিত সংখ্যক স্বয়ংক্রিয় পুনরায় চেষ্টা করবে। তবে:
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>আপনার এন্ডপয়েন্ট অনুপলব্ধ থাকলে, ক্রমাগত ত্রুটি ফেরত দিলে, টাইম আউট হলে, বা মার্চেন্ট কর্তৃক ভুলভাবে কনফিগার করা হলে Xelpay ডেলিভারির <strong>গ্যারান্টি দেয় না</strong>।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের সার্ভার ডাউনটাইম বা নেটওয়ার্ক সমস্যার কারণে স্থায়ীভাবে মিসড ওয়েবহুক ডেলিভারির ফলে যেকোনো ব্যবসায়িক ক্ষতি বা রাজস্ব ক্ষতির জন্য Xelpay সম্পূর্ণরূপে কোনো দায় বহন করে না।</strong> মার্চেন্টের নিজস্ব রিকনসিলিয়েশন প্রক্রিয়া বজায় রাখা একমাত্র দায়িত্ব।</li>
            </ul>
          </li>
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
          <li>মার্চেন্ট ধারা ১৫-তে বর্ণিত KYC/ব্যবসা যাচাই অনুরোধের সাথে সম্মতি করতে ব্যর্থ হয়েছে বলে আমরা নির্ধারণ করি।</li>
        </ul>
        <p className="mt-3">বাতিলের পরে, প্ল্যাটফর্মে আপনার অ্যাক্সেসের অধিকার তাৎক্ষণিকভাবে বন্ধ হয়। আপনি সমস্ত বকেয়া ফি এবং দায়বদ্ধতার জন্য দায়ী থাকবেন। নীতি লঙ্ঘনের কারণে নিষিদ্ধ হলে কোনো অবশিষ্ট সাবস্ক্রিপশন মেয়াদের জন্য কোনো ফেরত দেওয়া হবে না।</p>
        <p className="mt-3">আপনি যেকোনো সময় আমাদের সাপোর্ট চ্যানেলের মাধ্যমে একটি আনুষ্ঠানিক অনুরোধ জমা দিয়ে স্বেচ্ছায় আপনার অ্যাকাউন্ট বন্ধ করতে পারেন। স্বেচ্ছামূলক বন্ধকরণ আপনাকে কোনো পূর্বপ্রদত্ত সাবস্ক্রিপশন পরিমাণ ফেরত পাওয়ার অধিকার দেয় না।</p>
      </SectionBlock>

      <SectionBlock title="১০. ফোর্স ম্যাজর, দায়ের সীমাবদ্ধতা ও ক্ষতিপূরণ" icon={Scale} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">ফোর্স ম্যাজর:</strong> আমাদের যুক্তিসংগত নিয়ন্ত্রণের বাইরের পরিস্থিতির — ঈশ্বরের কাজ, প্রাকৃতিক দুর্যোগ, ইন্টারনেট বন্ধ, জাতীয় টেলিকম বিভ্রাট, তৃতীয় পক্ষের সার্ভার ব্যর্থতা, সাইবার আক্রমণ, বিদ্যুৎ বিভ্রাট, মহামারী, ধর্মঘট, বা সরকার কর্তৃক আরোপিত বিধিনিষেধ বা পদক্ষেপ সহ — কারণে পারফরম্যান্সে ব্যর্থতা বা বিলম্বের জন্য Xelpay দায়ী থাকবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">MFS/ব্যাংক অ্যাকাউন্ট সংক্রান্ত দায়ের সীমাবদ্ধতা:</strong> কোনো আইনি কাঠামোর অধীনে Xelpay, এর প্রতিষ্ঠাতা, পরিচালক বা Xenverse IT আপনার ব্যক্তিগত বা ব্যবসায়িক MFS/ব্যাংক অ্যাকাউন্ট ফ্ল্যাগ, সীমাবদ্ধ, হিমায়িত বা স্থগিত হওয়ার জন্য দায়ী থাকবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সাধারণ দায়ের সীমা:</strong> দাবি উত্থাপনের তারিখের আগে অবিলম্বে ONE (1) মাসে আপনি Xelpay-কে যে মোট অর্থ পরিশোধ করেছেন তার বেশি Xelpay-এর মোট দায় কোনো পরিস্থিতিতে হবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পরোক্ষ ক্ষতি বাদ:</strong> লাভের ক্ষতি, ডেটার ক্ষতি, ব্যবসায়িক সুযোগের ক্ষতি বা ব্যবসায়িক বাধা সহ যেকোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ, পরিণামী বা শাস্তিমূলক ক্ষতির জন্য Xelpay দায়ী থাকবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ক্ষতিপূরণ:</strong> আপনি Xelpay, Xenverse IT এবং তাদের কর্মকর্তা, পরিচালক, কর্মচারী এবং প্রতিনিধিদের আপনার প্ল্যাটফর্ম ব্যবহার বা অপব্যবহার থেকে, এই শর্তাবলীর লঙ্ঘন থেকে, বা আপনার শেষ-গ্রাহক বা তৃতীয় পক্ষের দাবি থেকে উদ্ভূত সমস্ত দাবি, মামলা, দায়, ক্ষতি, খরচ এবং ব্যয় থেকে সম্পূর্ণরূপে ক্ষতিপূরণ দিতে, রক্ষা করতে এবং নির্দোষ রাখতে সম্মত হচ্ছেন।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১১. বিরোধ নিষ্পত্তি, সালিশি ও ক্লাস-অ্যাকশন পরিত্যাগ" icon={Gavel} accent="purple">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">প্রথমে অনানুষ্ঠানিক সমাধান:</strong> যেকোনো আনুষ্ঠানিক আইনি দাবি দাখিল করার আগে, আপনি সম্মত হচ্ছেন যে লিখিত নোটিশের ৩০ দিনের মধ্যে সৌহার্দ্যপূর্ণভাবে বিরোধ সমাধানের জন্য সদিচ্ছার সাথে Xelpay-এর সাপোর্ট টিমের সাথে যোগাযোগ করবেন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ক্লাস-অ্যাকশন পরিত্যাগ:</strong> আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে Xelpay-এর বিরুদ্ধে যেকোনো বিরোধ বা দাবি শুধুমাত্র আপনার ব্যক্তিগত ক্ষমতায় আনতে হবে — কোনো ক্লাস অ্যাকশন বা প্রতিনিধি কার্যধারায় বাদী বা শ্রেণী সদস্য হিসেবে নয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক সালিশি (যেখানে প্রযোজ্য):</strong> আন্তর্জাতিক ব্যবহারকারীদের জন্য, যেখানে স্থানীয় আইন দ্বারা অনুমোদিত, আপনি সম্মত হচ্ছেন যে অনানুষ্ঠানিকভাবে সমাধান না হওয়া বিরোধগুলি আদালতে নয়, বরং বাধ্যতামূলক সালিশিতে জমা দেওয়া হবে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১২. প্রযোজ্য আইন, এখতিয়ার ও বিভাজ্যতা" icon={Building2} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">প্রযোজ্য আইন:</strong> এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন — চুক্তি আইন, ১৮৭২; তথ্য ও যোগাযোগ প্রযুক্তি আইন, ২০০৬ (সংশোধিত); ডিজিটাল নিরাপত্তা আইন, ২০১৮; এবং সমস্ত প্রযোজ্য বাংলাদেশ ব্যাংক বিধিমালা সহ — এর দ্বারা একচেটিয়াভাবে নিয়ন্ত্রিত হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">এখতিয়ার:</strong> এই শর্তাবলীর অধীনে উদ্ভূত যেকোনো বিরোধ বাংলাদেশে অবস্থিত সক্ষম কর্তৃপক্ষের আদালতের একচেটিয়া এখতিয়ারের অধীনে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বিভাজ্যতা:</strong> যদি এই শর্তাবলীর কোনো বিধান অপ্রয়োগযোগ্য বা অবৈধ পাওয়া যায়, সেই বিধানটি ন্যূনতম পরিমাণে সীমিত বা বাদ দেওয়া হবে এবং অবশিষ্ট বিধানগুলি সম্পূর্ণ কার্যকর থাকবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সম্পূর্ণ চুক্তি:</strong> এই শর্তাবলী, আমাদের গোপনীয়তা নীতির সাথে একত্রে, প্ল্যাটফর্ম ব্যবহার সংক্রান্ত আপনার এবং Xelpay-এর মধ্যে সম্পূর্ণ চুক্তি গঠন করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পরিত্যাগ:</strong> Xelpay-এর কোনো অধিকার বা বিধান প্রয়োগ করতে ব্যর্থতা সেই অধিকার বা বিধানের পরিত্যাগ গঠন করবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৩. অ্যাফিলিয়েট প্রোগ্রামের শর্তাবলী" icon={Users} accent="green">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">যোগ্যতা:</strong> Xelpay অ্যাফিলিয়েট প্রোগ্রামে অংশগ্রহণ শুধুমাত্র ভালো অবস্থানে থাকা নিবন্ধিত মার্চেন্টদের জন্য উন্মুক্ত। Xelpay তার একক বিবেচনায় অ্যাফিলিয়েট আবেদন অনুমোদন বা প্রত্যাখ্যান করার অধিকার সংরক্ষণ করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">কমিশন কাঠামো:</strong> অ্যাফিলিয়েট কমিশন প্রোগ্রামের বর্তমান হার কাঠামোর উপর ভিত্তি করে গণনা করা হয়, যা যুক্তিসংগত নোটিশের সাথে Xelpay দ্বারা যেকোনো সময় পরিবর্তন করা যেতে পারে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ প্রচার পদ্ধতি:</strong> অ্যাফিলিয়েটরা রেফারেল তৈরির জন্য বিভ্রান্তিকর বিজ্ঞাপন, স্প্যাম, ভুয়া রিভিউ বা যেকোনো প্রতারণামূলক পদ্ধতিতে নিযুক্ত হতে পারবেন না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">স্ব-রেফারেল নিষিদ্ধ:</strong> ব্যক্তিগত লাভের জন্য নিজের রেফারেল লিঙ্ক ব্যবহার করে সেকেন্ডারি অ্যাকাউন্ট সাইন আপ করা কঠোরভাবে নিষিদ্ধ এবং প্রতারণা গঠন করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">কমিশন বাজেয়াপ্ত:</strong> প্রতারণামূলক রেফারেল বা AUP লঙ্ঘনকারী রেফার করা অ্যাকাউন্টের মাধ্যমে অর্জিত কমিশন বাজেয়াপ্ত করা হবে এবং ক্ল্যাওব্যাক করা হতে পারে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট থ্রেশহোল্ড:</strong> অ্যাফিলিয়েট ড্যাশবোর্ডে উল্লিখিত ন্যূনতম থ্রেশহোল্ড পৌঁছানোর পরে অ্যাফিলিয়েট কমিশন বিতরণ করা হয় এবং প্রযোজ্য কর উইথহোল্ডিং সাপেক্ষে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৪. পেমেন্ট লিঙ্ক ও চেকআউট পেজ" icon={CreditCard} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের দায়িত্ব:</strong> Xelpay-এর মাধ্যমে তৈরি পেমেন্ট পেজে তালিকাভুক্ত সমস্ত পণ্য, সেবা, মূল্য এবং বিবরণের নির্ভুলতা, বৈধতা এবং উপযুক্ততার জন্য আপনি সম্পূর্ণরূপে দায়ী। Xelpay শুধুমাত্র প্রযুক্তিগত অবকাঠামো; আমরা আপনার এবং আপনার গ্রাহকদের মধ্যে বাণিজ্যিক লেনদেনের পক্ষ নই।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">চেকআউট পেজে গ্রাহক ডেটা:</strong> আপনার Xelpay-চালিত চেকআউট পেজে আপনার গ্রাহকরা যে ব্যক্তিগত ডেটা জমা দেন তা এই গোপনীয়তা নীতি অনুযায়ী প্রক্রিয়া করা হয়। আপনাকে নিশ্চিত করতে হবে যে আপনার নিজস্ব গ্রাহকরা সচেতন যে তাদের ডেটা কীভাবে পরিচালনা করা হয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট লিঙ্কে নিষিদ্ধ বিষয়বস্তু:</strong> পেমেন্ট লিঙ্ক ধারা ৬ (AUP)-এ উল্লিখিত নিষিদ্ধ, অবৈধ বা প্রতারণামূলক উদ্দেশ্যে অর্থ সংগ্রহের জন্য ব্যবহার করা যাবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৫. KYC ও ব্যবসা যাচাইকরণ" icon={Fingerprint} accent="orange">
        <p>বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU) নির্দেশিকা, অ্যান্টি-মানি লন্ডারিং (AML) বিধিমালা, মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ এবং সন্ত্রাসবিরোধী আইন, ২০০৯ (বাংলাদেশ)-এর কঠোর সম্মতিতে, Xelpay একটি মার্চেন্ট অ্যাকাউন্টের জীবনচক্রের যেকোনো পর্যায়ে Know Your Customer (KYC) এবং ব্যবসা যাচাইকরণ পদ্ধতি পরিচালনার অধিকার স্পষ্টভাবে সংরক্ষণ করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">অনুরোধকৃত ডকুমেন্টেশন:</strong> Xelpay তার একক এবং সম্পূর্ণ বিবেচনায়, নিম্নলিখিত এক বা একাধিক KYC এবং ব্যবসা যাচাই দলিল জমা দেওয়ার আনুষ্ঠানিক অনুরোধ করতে পারে: বৈধ ট্রেড লাইসেন্স বা ব্যবসা নিবন্ধন সার্টিফিকেট, ব্যবসার মালিক(দের) বা অনুমোদিত স্বাক্ষরকারীদের জাতীয় পরিচয়পত্র (NID), TIN সার্টিফিকেট, যাচাইয়ের উদ্দেশ্যে প্রাসঙ্গিক ব্যাংক অ্যাকাউন্টের বিবরণ এবং/অথবা অন্য যেকোনো সহায়ক ডকুমেন্টেশন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক সম্মতির দায়িত্ব:</strong> মার্চেন্ট Xelpay-এর যেকোনো KYC যাচাই অনুরোধে আনুষ্ঠানিক অনুরোধে উল্লিখিত সময়সীমার মধ্যে সাড়া দিতে আইনগতভাবে বাধ্য (যা অনুরোধের তারিখ থেকে কমপক্ষে ৭২ ঘণ্টার কম হবে না)। জাল, মিথ্যা বা প্রতারণামূলকভাবে প্রাপ্ত ডকুমেন্টেশন জমা দেওয়া বাংলাদেশ আইনে একটি গুরুতর অপরাধ গঠন করে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">অ-সম্মতির পরিণতি:</strong> নির্ধারিত সময়সীমার মধ্যে অনুরোধকৃত KYC ডকুমেন্টেশন প্রদান করতে ব্যর্থ হলে বা অস্বীকার করলে মার্চেন্টের অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট API অ্যাক্সেস তাৎক্ষণিকভাবে স্থগিত করা হবে।
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">KYC-জনিত স্থগিতকরণে কোনো ফেরত নেই</strong>
              KYC বা ব্যবসা যাচাই অনুরোধের অ-সম্মতির কারণে অ্যাকাউন্ট স্থগিতকরণ বা বন্ধকরণ মার্চেন্টকে ধারা ৫-এ বর্ণিত Xelpay-এর কঠোর অ-ফেরতযোগ্য নীতির সাথে সামঞ্জস্য রেখে কোনো পূর্বপ্রদত্ত সাবস্ক্রিপশন ফি বা অ্যাড-অন চার্জ ফেরত পাওয়ার অধিকার দেয় না।
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">KYC দলিলের ডেটা পরিচালনা:</strong> Xelpay-এ জমা দেওয়া সমস্ত KYC দলিল আমাদের গোপনীয়তা নীতি অনুযায়ী কঠোরভাবে পরিচালনা এবং সংরক্ষণ করা হয়। KYC দলিলগুলি শুধুমাত্র Xelpay-এর অনুমোদিত সম্মতি কর্মীদের দ্বারা অ্যাক্সেসযোগ্য।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৬. বিপরীত লেনদেন, MFS ক্ল্যাওব্যাক ও অপারেটর বিরোধ" icon={ShieldAlert} accent="red">
        <p>Xelpay-এর ভূমিকা একটি প্রযুক্তিগত যাচাই মধ্যস্থতাকারীর মধ্যে কঠোরভাবে সীমাবদ্ধ। প্ল্যাটফর্ম একটি পেমেন্ট বিজ্ঞপ্তির প্রাপ্তি নিশ্চিত করে এবং সংশ্লিষ্ট ওয়েবহুক পাঠায়; এটি তৃতীয় পক্ষের MFS প্রদানকারী, ব্যাংক বা পেমেন্ট গেটওয়ের মাধ্যমে পরিচালিত যেকোনো অন্তর্নিহিত আর্থিক লেনদেনের চূড়ান্ততা, স্থায়িত্ব বা অপরিবর্তনীয়তার নিশ্চয়তা দেয় না।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">সম্পূর্ণ শূন্য দায় — বিপরীতকরণ, ক্ল্যাওব্যাক ও অপারেটর বিরোধ</strong>
          Xelpay-এর সিস্টেম দ্বারা পূর্বে যাচাই ও নিশ্চিত করা যেকোনো পেমেন্ট লেনদেন যদি পরবর্তীতে মূল গ্রাহক/প্রেরক, সংশ্লিষ্ট MFS অপারেটর (bKash, Nagad, Rocket), মার্চেন্টের বা গ্রাহকের ব্যাংক, যেকোনো পেমেন্ট গেটওয়ে প্রদানকারী, বাংলাদেশ ব্যাংক, বা অন্য যেকোনো সক্ষম আর্থিক বা নিয়ন্ত্রক কর্তৃপক্ষ কর্তৃক বিপরীত, প্রত্যাহার, হিমায়িত, বিতর্কিত বা ক্ল্যাওব্যাক করা হয় — যেকোনো কারণে — <strong>Xelpay এর জন্য কোনো আইনগত, আর্থিক বা পরিচালনগত দায় বহন করে না</strong>: মার্চেন্ট কর্তৃক প্রদত্ত পণ্য, সেবা বা ডিজিটাল বিষয়বস্তুর জন্য; বা মার্চেন্টের আর্থিক ক্ষতি, রাজস্ব ক্ষতি, ইনভেন্টরি ক্ষতি বা ব্যবসায়িক ক্ষতির জন্য।
        </InfoBox>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের স্বাধীন ঝুঁকি দায়িত্ব:</strong> উচ্চ-মূল্যের পণ্য, সেবা বা অপরিবর্তনীয় ডিজিটাল ডেলিভারেবল প্রকাশের আগে Xelpay-এর স্বয়ংক্রিয় যাচাইয়ের স্বাধীনে নিজস্ব শক্তিশালী জালিয়াতি প্রতিরোধ, অর্ডার যাচাই এবং ঝুঁকি ব্যবস্থাপনা নীতি বজায় রাখা মার্চেন্টের একমাত্র এবং একচেটিয়া দায়িত্ব। Xelpay-এর যাচাই নিশ্চিতকরণ শুধুমাত্র একটি প্রযুক্তিগত সংকেত এবং পেমেন্টের চূড়ান্ততার গ্যারান্টি নয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্ট ও গ্রাহকের মধ্যে বিরোধ নিষ্পত্তি:</strong> মার্চেন্টের শেষ গ্রাহক কর্তৃক শুরু করা যেকোনো পেমেন্ট বিরোধ, ফেরতের অনুরোধ বা চার্জব্যাক সম্পূর্ণ এবং একচেটিয়াভাবে মার্চেন্ট এবং তাদের গ্রাহকের মধ্যকার বিষয়। Xelpay এই ধরনের যেকোনো বিরোধের পক্ষ নয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তদন্তে সহযোগিতা:</strong> পূর্বোক্ত দায়ের সীমাবদ্ধতা সত্ত্বেও, Xelpay, যেখানে আইনগতভাবে প্রয়োজন বা অপারেশনালভাবে সম্ভব, বিতর্কিত লেনদেন সম্পর্কিত অনুমোদিত নিয়ন্ত্রক এবং আইন প্রয়োগকারী তদন্তে সহযোগিতা করবে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৭. কঠোর B2B সেবা — শেষ-গ্রাহক সহায়তার কোনো বাধ্যবাধকতা নেই" icon={Users} accent="purple">
        <p>Xelpay একটি একচেটিয়া <strong className="text-slate-800 dark:text-slate-200">বিজনেস-টু-বিজনেস (B2B)</strong> প্রযুক্তি প্ল্যাটফর্ম। এই শর্তাবলী দ্বারা প্রতিষ্ঠিত চুক্তিগত সম্পর্ক সম্পূর্ণ এবং একচেটিয়াভাবে Xelpay (Xenverse IT) এবং নিবন্ধিত মার্চেন্ট সত্তার মধ্যে বিদ্যমান।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহকদের সাথে কোনো সরাসরি সম্পর্ক নেই:</strong> Xelpay-এর মার্চেন্টের Xelpay-চালিত পেমেন্ট ইন্টারফেস বা চেকআউট পেজের মাধ্যমে লেনদেন করা যেকোনো শেষ-গ্রাহক, ক্রেতা বা তৃতীয় পক্ষের সাথে কোনো সরাসরি আইনগত, চুক্তিগত, বাণিজ্যিক বা আর্থিক সম্পর্ক নেই। শেষ-গ্রাহকরা মার্চেন্টের গ্রাহক, Xelpay-এর নয়।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহকদের জন্য কোনো সহায়তার বাধ্যবাধকতা নেই:</strong> Xelpay মার্চেন্টের শেষ-গ্রাহক কর্তৃক সরাসরি জমা দেওয়া যেকোনো সহায়তা অনুসন্ধান, অভিযোগ বা দাবিতে সাড়া দিতে, তদন্ত করতে বা সমাধান করতে <strong>কোনো আইনগত বা চুক্তিগত বাধ্যবাধকতার অধীনে নেই</strong>।
            <InfoBox type="info">
              <strong>মার্চেন্টের দায়িত্ব:</strong> পর্যাপ্ত গ্রাহক সহায়তা প্রদান করা, নিজস্ব ফেরতের নীতি মেনে চলা এবং শেষ-গ্রাহকদের সাথে সমস্ত বিরোধ সরাসরি সমাধান করা মার্চেন্টের একমাত্র আইনগত দায়িত্ব।
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহক দাবির জন্য মার্চেন্টের ক্ষতিপূরণ:</strong> মার্চেন্ট স্পষ্টভাবে Xelpay-কে তাদের বাণিজ্যিক কার্যক্রম থেকে উদ্ভূত মার্চেন্টের শেষ-গ্রাহকদের কর্তৃক শুরু করা যেকোনো দাবি, মামলা বা আইনি কার্যধারা থেকে সম্পূর্ণরূপে ক্ষতিপূরণ দিতে এবং রক্ষা করতে সম্মত হচ্ছেন।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৮. ওয়েবহুক আইডেম্পোটেন্সি ও ডাবল-ক্রেডিটিং প্রতিরোধ" icon={Zap} accent="purple">
        <p>Xelpay-এর ওয়েবহুক ডেলিভারি সিস্টেম যাচাইকৃত লেনদেন ইভেন্টে পেমেন্ট নিশ্চিতকরণ পেলোড প্রেরণ করার জন্য ডিজাইন করা হয়েছে। তবে, নেটওয়ার্ক টাইমআউট বা Xelpay-এর সার্ভার এবং মার্চেন্টের এন্ডপয়েন্টের মধ্যে ক্ষণস্থায়ী সংযোগ ব্যর্থতার পরিস্থিতিতে, Xelpay-এর সিস্টেম তার রিট্রাই নীতি অনুযায়ী একই ওয়েবহুক পেলোডের ডেলিভারি স্বয়ংক্রিয়ভাবে পুনরায় প্রচেষ্টা করতে পারে।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">মার্চেন্টের পরম দায়িত্ব — আইডেম্পোটেন্সি বাস্তবায়ন</strong>
          মার্চেন্টের ডেভেলপমেন্ট টিমের <strong>একমাত্র, অপ্রত্যায়নযোগ্য এবং সম্পূর্ণ প্রযুক্তিগত ও আইনগত দায়িত্ব</strong> হলো তাদের ওয়েবহুক রিসিভার এন্ডপয়েন্টে শক্তিশালী <strong>আইডেম্পোটেন্সি লজিক</strong> বাস্তবায়ন করা। আইডেম্পোটেন্সি মানে হলো মার্চেন্টের সিস্টেম অবশ্যই একই অনন্য Transaction ID (TrxID) বহনকারী ডুপ্লিকেট ওয়েবহুক ডেলিভারি চিনতে এবং বাদ দিতে সক্ষমভাবে ডিজাইন করা হতে হবে, যাতে যেকোনো যাচাইকৃত লেনদেন মাত্র একবার ক্রেডিট বা পূরণ করা হয় — ওয়েবহুক বিজ্ঞপ্তি কতবার প্রাপ্ত হয় তা নির্বিশেষে। মার্চেন্টের পর্যাপ্ত আইডেম্পোটেন্সি সুরক্ষা বাস্তবায়নে ব্যর্থতার ফলে ডাবল-ক্রেডিটিং, ডুপ্লিকেট অর্ডার পূরণ, বা যেকোনো ডুপ্লিকেট আর্থিক কার্যক্রমের জন্য <strong>Xelpay সম্পূর্ণরূপে কোনো আইনগত, আর্থিক বা পরিচালনগত দায় বহন করে না।</strong>
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="১৯. নিয়ন্ত্রক শাটডাউন, সরকারি নির্দেশিকা ও সার্ভিস ফিচারে ফোর্স ম্যাজর" icon={Building2} accent="red">
        <p>বাংলাদেশ ব্যাংক, বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC), ডাক, টেলিযোগাযোগ ও তথ্যপ্রযুক্তি মন্ত্রণালয়, বা যেকোনো অন্যান্য সক্ষম সরকারি, আধা-সরকারি, বিচারিক বা নিয়ন্ত্রক কর্তৃপক্ষ যদি Xelpay-এর SMS-রিডিং অটোমেশন, IMAP ইমেইল স্ক্র্যাপিং, স্বয়ংক্রিয় লেনদেন পার্সিং, বা Xelpay প্ল্যাটফর্মের অন্য যেকোনো বৈশিষ্ট্য নিষিদ্ধ, সীমাবদ্ধ, বা পরিবর্তনের প্রয়োজন এমন কোনো নির্দেশিকা, সার্কুলার, আদেশ বা বিধিমালা জারি করে — Xelpay তাৎক্ষণিকভাবে প্রভাবিত সার্ভিস ফিচার(গুলি) স্থগিত, নিষ্ক্রিয়, পরিবর্তন বা স্থায়ীভাবে বন্ধ করার সম্পূর্ণ এবং একতরফা অধিকার সংরক্ষণ করে।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় ও শূন্য ফেরত — নিয়ন্ত্রক শাটডাউন</strong>
          যেকোনো এই ধরনের নিয়ন্ত্রক-বাধ্যতামূলক স্থগিতকরণ, পরিবর্তন বা সার্ভিস ফিচারের স্থায়ী বন্ধকরণের সাথে সংযুক্ত কোনো ধরনের <strong>কোনো আইনগত বা আর্থিক দায় Xelpay বহন করবে না</strong> — এবং মার্চেন্টকে কোনো ধরনের ফেরত, সার্ভিস ক্রেডিট বা ক্ষতিপূরণমূলক পেমেন্ট প্রদেয় বা প্রযোজ্য হবে না। মার্চেন্ট স্পষ্টভাবে স্বীকার করে এবং গ্রহণ করে যে এই ধরনের ঘটনাগুলি এই শর্তাবলীর অধীনে একটি ফোর্স ম্যাজর ঘটনা হিসেবে গণ্য হবে।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="২০. প্রচার ও মার্কেটিং অধিকার" icon={Users} accent="green">
        <p>Xelpay মার্চেন্ট অ্যাকাউন্ট নিবন্ধন করে এবং আপনার ব্যবসায়িক কার্যক্রমের জন্য সক্রিয়ভাবে Xelpay প্ল্যাটফর্ম ব্যবহার করে, আপনি Xelpay (Xenverse IT)-কে নিম্নলিখিত সীমিত প্রেক্ষাপটে আপনার নিবন্ধিত ব্যবসার নাম, সংশ্লিষ্ট ব্র্যান্ড নাম এবং অফিসিয়াল ব্যবসায়িক লোগো ব্যবহার, প্রদর্শন এবং পুনরুৎপাদন করার একটি <strong className="text-slate-800 dark:text-slate-200">অ-একচেটিয়া, রয়্যালটি-মুক্ত, বিশ্বব্যাপী লাইসেন্স</strong> প্রদান করছেন:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li>Xelpay-এর অফিসিয়াল ওয়েবসাইট, ল্যান্ডিং পেজ এবং মার্কেটিং উপকরণে, "Trusted By," "আমাদের পার্টনার," "মার্চেন্ট" বা সমতুল্য বিভাগ সহ।</li>
          <li>Xelpay-এর কেস স্টাডি, প্রচারমূলক ব্লগ পোস্ট, সোশ্যাল মিডিয়া বিষয়বস্তু, প্রেস রিলিজ, বিনিয়োগকারী উপকরণ এবং বিক্রয় সহায়তায়।</li>
          <li>সম্ভাব্য ব্যবসায়িক অংশীদার, বিনিয়োগকারী বা নিয়ন্ত্রক সংস্থার জন্য প্রস্তুত উপস্থাপনা এবং উপকরণে।</li>
        </ul>
        <InfoBox type="info">
          <strong>অপ্ট-আউটের অধিকার:</strong> আপনি যদি উপরোক্ত প্রচারমূলক প্রেক্ষাপটে আপনার ব্যবসার নাম, ব্র্যান্ড বা লোগো ব্যবহার না চান, তাহলে আপনি যেকোনো সময় অফিসিয়াল সাপোর্ট চ্যানেলের মাধ্যমে একটি আনুষ্ঠানিক লিখিত অপ্ট-আউট অনুরোধ জমা দিয়ে আপনার অপ্ট-আউট অধিকার প্রয়োগ করতে পারেন।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="২১. অ্যাকাউন্ট অ-হস্তান্তরযোগ্যতা" icon={Lock} accent="red">
        <p>Xelpay মার্চেন্ট অ্যাকাউন্ট নির্দিষ্ট নিবন্ধিত ব্যবসায়িক সত্তা বা স্বতন্ত্র একক মালিকের জন্য জারি করা হয় এবং সর্বদা <strong className="text-slate-800 dark:text-slate-200">কঠোর এবং সম্পূর্ণরূপে অ-হস্তান্তরযোগ্য</strong>।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ হস্তান্তর কার্যক্রম:</strong> মার্চেন্টরা তাদের Xelpay মার্চেন্ট অ্যাকাউন্ট, সংশ্লিষ্ট API কী, ওয়েবহুক সিক্রেট বা যেকোনো অ্যাকাউন্ট ক্রেডেনশিয়াল যেকোনো তৃতীয় পক্ষের কাছে বিক্রয়, হস্তান্তর, অ্যাসাইন, ইজারা, ভাড়া, সাবলাইসেন্স, উপহার বা অন্য যেকোনো উপায়ে হস্তান্তর করা বা হস্তান্তরের চেষ্টা করা থেকে স্পষ্টভাবে নিষিদ্ধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক উত্তরাধিকার:</strong> মার্চেন্টের নিবন্ধিত ব্যবসায়িক সত্তার বৈধ অধিগ্রহণ, একীভূতকরণ বা সুবিধাভোগী মালিকানার পরিবর্তনের ক্ষেত্রে, মার্চেন্টকে অবশ্যই কোনো এই ধরনের লেনদেন সম্পন্ন করার আগে Xelpay-কে লিখিতভাবে অবহিত করতে হবে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">প্রয়োগ — তাৎক্ষণিক আজীবন নিষিদ্ধকরণ:</strong> একটি Xelpay মার্চেন্ট অ্যাকাউন্টের যেকোনো অননুমোদিত হস্তান্তর বা হস্তান্তরের প্রচেষ্টা একটি গুরুতর, তাৎক্ষণিক নিরাপত্তা এবং AML সম্মতি লঙ্ঘন হিসেবে গণ্য করা হবে।
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">AML ঝুঁকি — শূন্য সহনশীলতা</strong>
              অ্যাকাউন্ট হস্তান্তরের উপর কঠোর নিষেধাজ্ঞা একটি মূল AML সম্মতি নিয়ন্ত্রণ। অননুমোদিত অ্যাকাউন্ট হস্তান্তর সুবিধাভোগী মালিকানা অস্পষ্ট করে, KYC নিয়ন্ত্রণ পরিহার সক্ষম করে এবং অগ্রহণযোগ্য মানি লন্ডারিং ও প্রতারণার ঝুঁকি তৈরি করে। অননুমোদিত হস্তান্তরের কারণে অ্যাকাউন্ট বন্ধকরণে কোনো ফেরত দেওয়া হবে না।
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২২. অন্তর্নিহিত MFS, ব্যাংক ও তৃতীয় পক্ষের লেনদেন ফি" icon={CreditCard} accent="amber">
        <p>Xelpay-এর সাবস্ক্রিপশন ফি এবং যেকোনো প্রযোজ্য অ্যাড-অন সার্ভিস ফি একচেটিয়াভাবে Xelpay-এর মালিকানাধীন সফটওয়্যার অবকাঠামো, পেমেন্ট যাচাই ইঞ্জিন, API সার্ভিস, ড্যাশবোর্ড এবং সংশ্লিষ্ট প্রযুক্তিগত সহায়তায় অ্যাক্সেস এবং ব্যবহার কভার করে। এই ফিগুলি মার্চেন্ট বা তাদের গ্রাহকদের দ্বারা পরিচালিত অন্তর্নিহিত আর্থিক লেনদেনের সাথে সম্পর্কিত কোনো তৃতীয় পক্ষের ফি, চার্জ বা খরচ কভার, অন্তর্ভুক্ত, শোষণ বা অফসেট <strong className="text-slate-800 dark:text-slate-200">করে না</strong>।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের ফির জন্য মার্চেন্টের একমাত্র দায়িত্ব:</strong> মার্চেন্ট তাদের ব্যবসায়িক লেনদেনের সাথে সংযুক্ত তৃতীয় পক্ষের আর্থিক সেবা প্রদানকারীদের দ্বারা আরোপিত সমস্ত খরচ এবং ফি বহন করার জন্য সম্পূর্ণরূপে দায়ী: MFS ক্যাশ-আউট চার্জ (bKash, Nagad, Rocket ক্যাশ-আউট ফি ইত্যাদি); MFS পার্সন-টু-পার্সন (P2P) সেন্ড মানি ফি বা ট্রান্সফার চার্জ; ব্যাংক-টু-ব্যাংক ট্রান্সফার ফি এবং BEFTN/RTGS চার্জ; আন্তর্জাতিক পেমেন্ট গেটওয়ে প্রক্রিয়াকরণ ফি এবং ক্রস-বর্ডার লেনদেন চার্জ; এবং আর্থিক লেনদেনে বাংলাদেশ সরকার বা যেকোনো অন্যান্য কর কর্তৃপক্ষকে প্রদেয় সমস্ত প্রযোজ্য কর, ভ্যাট বা শুল্ক।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের ফি কাঠামোর পরিবর্তন:</strong> Xelpay-এর কোনো MFS অপারেটর, ব্যাংক বা পেমেন্ট গেটওয়ে প্রদানকারীর ফি কাঠামো বা মূল্য নির্ধারণ নীতির উপর কোনো নিয়ন্ত্রণ নেই। তৃতীয় পক্ষের ফি পরিবর্তন Xelpay-এর সাবস্ক্রিপশন ফি হ্রাস বা ফেরতের ভিত্তি গঠন করবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের ফি যাচাইয়ের দায়িত্ব:</strong> Xelpay প্ল্যাটফর্মের সাথে তারা যে সমস্ত তৃতীয় পক্ষের আর্থিক সেবা প্রদানকারী ব্যবহার করেন তাদের ফি শিডিউল স্বাধীনভাবে যাচাই করা এবং সর্বশেষ তথ্যের সাথে আপ-টু-ডেট থাকা মার্চেন্টের একমাত্র দায়িত্ব।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৩. ড্যাশবোর্ড লগ সংরক্ষণ সীমা ও ডেটা রপ্তানির দায়িত্ব" icon={Database} accent="amber">
        <p>সর্বোত্তম সার্ভার পারফরম্যান্স এবং খরচ-দক্ষ অবকাঠামো পরিচালনা বজায় রাখতে, Xelpay-এর মার্চেন্ট ড্যাশবোর্ড একটি <strong className="text-slate-800 dark:text-slate-200">সীমিত রোলিং উইন্ডো ভিত্তিতে</strong> সক্রিয় লেনদেনের লগ, অর্ডার ইতিহাস এবং সংশ্লিষ্ট অপারেশনাল ডেটা প্রদর্শন করে। ডিফল্টভাবে, ড্যাশবোর্ড বর্তমানে <strong className="text-slate-800 dark:text-slate-200">নব্বই (৯০) ক্যালেন্ডার দিনের</strong> সাম্প্রতিক রোলিং পিরিয়ডের লেনদেন এবং অপারেশনাল লগ প্রদর্শন করবে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের ডেটা রপ্তানির দায়িত্ব:</strong> Xelpay ড্যাশবোর্ডের মধ্যে প্রদত্ত CSV রপ্তানি বা সমমানের ডেটা রপ্তানি কার্যকারিতা ব্যবহার করে তাদের নিজস্ব ব্যবসায়িক হিসাব, পুনর্মিলন, কর সম্মতি, অডিটিং বা বিরোধ সমাধানের উদ্দেশ্যে তাদের প্রয়োজনীয় লেনদেন ডেটা, অর্ডার লগ এবং যেকোনো অন্যান্য অপারেশনাল রেকর্ড নিয়মিত এবং সক্রিয়ভাবে রপ্তানি করা মার্চেন্টের একমাত্র এবং সম্পূর্ণ দায়িত্ব।
            <InfoBox type="warning">
              <strong>পরামর্শ:</strong> Xelpay দৃঢ়ভাবে মার্চেন্টদের একটি নিয়মিত ডেটা রপ্তানি সময়সূচী — ন্যূনতম মাসিক ভিত্তিতে — প্রতিষ্ঠা করার পরামর্শ দেয়। নিয়মিত ডেটা রপ্তানি করতে ব্যর্থতার ফলে রোলিং সংরক্ষণ উইন্ডোর বাইরের ড্যাশবোর্ড-দৃশ্যমান লেনদেনের রেকর্ড স্থায়ীভাবে হারিয়ে যেতে পারে।
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যাকএন্ড AML সংরক্ষণ (ড্যাশবোর্ড-বহির্ভূত):</strong> উপরে বর্ণিত সীমিত ড্যাশবোর্ড ডিসপ্লে উইন্ডো সত্ত্বেও, Xelpay-এর ব্যাকএন্ড সিস্টেম AML নিয়ন্ত্রক প্রয়োজনীয়তার কঠোর সম্মতিতে লেনদেনের তারিখ থেকে ন্যূনতম <strong className="text-slate-800 dark:text-slate-200">পাঁচ (৫) বছরের</strong> জন্য এনক্রিপ্টেড, অপরিবর্তনীয় লেনদেনের লগ আলাদাভাবে সংরক্ষণ করে। এই ব্যাকএন্ড-সংরক্ষিত রেকর্ডগুলি মার্চেন্ট ড্যাশবোর্ডের মাধ্যমে সরাসরি অ্যাক্সেসযোগ্য নয় কিন্তু বৈধ আইনি অনুরোধে সক্ষম নিয়ন্ত্রক বা আইন প্রয়োগকারী কর্তৃপক্ষকে উপলব্ধ করা হতে পারে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ড্যাশবোর্ড ডেটা লসের জন্য কোনো দায় নেই:</strong> ড্যাশবোর্ড ডিসপ্লে উইন্ডোর মধ্যে মার্চেন্টের নিজস্ব রেকর্ড রপ্তানি ও বজায় রাখতে ব্যর্থতার ফলে উদ্ভূত কোনো ব্যবসায়িক ক্ষতি, হিসাবের অসামঞ্জস্য বা কর সম্মতির সমস্যার জন্য Xelpay কোনো দায় বহন করে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৪. API সংস্করণ, আপডেট ও অবচয় নীতি" icon={Zap} accent="purple">
        <p>Xelpay তার API অবকাঠামোর ক্রমাগত উন্নতি এবং নতুন সংস্করণ প্রকাশের অধিকার সংরক্ষণ করে। Xelpay নতুন API সংস্করণ প্রকাশ, বিদ্যমান API এন্ডপয়েন্টে পরিবর্তন প্রবর্তন এবং পুরানো API সংস্করণ বাতিল বা স্থায়ীভাবে প্রত্যাহার করার অধিকার যেকোনো সময় সংরক্ষণ করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">অবচয় নোটিশ:</strong> যেখানে অপারেশনালভাবে সম্ভব, Xelpay পরিকল্পিত API সংস্করণ অবচয়ের অগ্রিম নোটিশ প্রদানের চেষ্টা করবে। তবে, গুরুতর নিরাপত্তা দুর্বলতা বা জরুরি অপারেশনাল প্রয়োজনীয়তার ক্ষেত্রে, Xelpay তাৎক্ষণিকভাবে পরিবর্তন বাস্তবায়ন বা API সংস্করণ বাতিল করার অধিকার সংরক্ষণ করে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের পরম রক্ষণাবেক্ষণ দায়িত্ব:</strong> Xelpay-এর API চেঞ্জলগ, সংস্করণ রিলিজ নোট এবং অবচয় ঘোষণা সক্রিয়ভাবে পর্যবেক্ষণ করা; বর্তমান এবং সমর্থিত API সংস্করণের সাথে সামঞ্জস্যপূর্ণ থাকতে সময়মতো ইন্টিগ্রেশন কোড আপডেট করা মার্চেন্ট এবং তাদের ডেভেলপমেন্ট টিমের <strong>একমাত্র, অপ্রত্যায়নযোগ্য এবং সম্পূর্ণ প্রযুক্তিগত দায়িত্ব</strong>।
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় — পুরানো কোডের কারণে ভাঙা ইন্টিগ্রেশন</strong>
              Xelpay-এর বর্তমান API সংস্করণের সাথে সামঞ্জস্যপূর্ণ থাকার জন্য মার্চেন্টের ইন্টিগ্রেশন কোড আপডেট করতে ব্যর্থতার প্রত্যক্ষ বা পরোক্ষ ফলে মার্চেন্টের অভিজ্ঞতা হওয়া ভাঙা ইন্টিগ্রেশন, ব্যর্থ পেমেন্ট যাচাই, মিসড ওয়েবহুক ডেলিভারি বা যেকোনো অন্যান্য প্রযুক্তিগত খারাপ কার্যকারিতার জন্য Xelpay <strong>সম্পূর্ণরূপে কোনো আইনগত, আর্থিক বা পরিচালনগত দায় বহন করে না।</strong>
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">ইন্টিগ্রেশন ব্যর্থতায় কোনো ফেরত নেই:</strong> পুরানো ইন্টিগ্রেশন কোডের কারণে মার্চেন্টের অভিজ্ঞতা হওয়া API সংস্করণ-সম্পর্কিত ইন্টিগ্রেশন ব্যর্থতা বা সার্ভিস বিঘ্ন সাবস্ক্রিপশন ফির ফেরত বা Xelpay-এর কাছ থেকে কোনো আর্থিক ক্ষতিপূরণের ভিত্তি গঠন করে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৫. সহায়তা নীতি, SLA ও সহায়তা কর্মীদের হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা" icon={ShieldAlert} accent="red">
        <p>Xelpay মার্চেন্ট ড্যাশবোর্ডের মধ্যে যোগাযোগ করা তার নির্ধারিত অফিসিয়াল সাপোর্ট চ্যানেলের মাধ্যমে মার্চেন্ট সহায়তা সেবা প্রদান করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">সর্বোত্তম-প্রচেষ্টা সহায়তা — কোনো গ্যারান্টিযুক্ত রেসপন্স SLA নেই:</strong> যদি না মার্চেন্ট Xelpay-এর সাথে একটি পৃথক, আনুষ্ঠানিকভাবে কার্যকর এন্টারপ্রাইজ চুক্তিতে প্রবেশ করে থাকে যা স্পষ্টভাবে বাধ্যতামূলক রেসপন্স টাইম SLA উল্লেখ করে, সমস্ত মার্চেন্ট সহায়তা কঠোরভাবে <strong>"সর্বোত্তম-প্রচেষ্টা" ভিত্তিতে</strong> প্রদান করা হয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সহায়তার পরিধি:</strong> Xelpay-এর সহায়তা সেবা প্ল্যাটফর্ম-সম্পর্কিত প্রযুক্তিগত সমস্যা, API ইন্টিগ্রেশন সহায়তা, অ্যাকাউন্ট কনফিগারেশন নির্দেশিকা এবং বিলিং অনুসন্ধান কভার করে। সহায়তা মার্চেন্টের শেষ-গ্রাহকদের জন্য সাধারণ সফটওয়্যার ডেভেলপমেন্ট পরামর্শ বা সহায়তা পর্যন্ত বিস্তৃত নয়।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">সহায়তা কর্মীদের হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা নীতি:</strong> Xelpay যেকোনো যোগাযোগ চ্যানেলের মাধ্যমে যেকোনো Xelpay সহায়তা কর্মচারী, ঠিকাদার বা প্রতিনিধির প্রতি মার্চেন্ট (বা তাদের পক্ষে কাজ করা যেকোনো ব্যক্তি) কর্তৃক যেকোনো ধরনের অপমানজনক, হুমকিমূলক, হয়রানিমূলক, ভয়ভীতিমূলক, মানহানিকর বা বৈষম্যমূলক আচরণের বিরুদ্ধে একটি পরম এবং অ-আলোচনাযোগ্য শূন্য-সহনশীলতা নীতি বজায় রাখে।
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">তাৎক্ষণিক স্থায়ী নিষিদ্ধকরণ — সহায়তা কর্মীদের হয়রানি</strong>
              নিষিদ্ধ আচরণের মধ্যে অন্তর্ভুক্ত রয়েছে: লিখিত বা মৌখিক যোগাযোগে অপমানজনক, অশ্লীল বা হুমকিমূলক ভাষার ব্যবহার; শারীরিক ক্ষতির হুমকি প্রদান; বারবার হয়রানি বা ইচ্ছাকৃত খারাপ বিশ্বাসের যোগাযোগ। Xelpay সহায়তা কর্মীদের হয়রানির যেকোনো একটি নিশ্চিত ঘটনার ফলে কোনো পূর্ববর্তী সতর্কতা ছাড়াই মার্চেন্টের অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট API অ্যাক্সেসের <strong>তাৎক্ষণিক, স্থায়ী এবং অপরিবর্তনীয় বন্ধকরণ</strong> হবে। <strong>এই নীতির অধীনে বন্ধকরণে কোনো পূর্বপ্রদত্ত সাবস্ক্রিপশন ফি বা অ্যাড-অন চার্জ ফেরত দেওয়া হবে না।</strong>
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>
    </div>
  );
}

// ─── MAIN TERMS PAGE ──────────────────────────────────────────────────────────
export default function TermsPage() {
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
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={28} /></div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {lang === 'en' ? 'Terms of Service' : 'সেবার শর্তাবলী'}
            </h1>
          </div>

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

        {/* Also see Privacy Policy link */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {lang === 'en' ? 'Also read our Privacy Policy for data handling information.' : 'ডেটা পরিচালনার তথ্যের জন্য আমাদের গোপনীয়তা নীতিও পড়ুন।'}
          </p>
          <Link href="/info/privacy" className="shrink-0 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 border border-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
            {lang === 'en' ? 'Privacy Policy →' : 'গোপনীয়তা নীতি →'}
          </Link>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <HelpCircle size={14} />
            {lang === 'en' ? 'Quick Navigation — 25 Sections' : 'দ্রুত নেভিগেশন — ২৫টি অনুচ্ছেদ'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            {lang === 'en' ? (
              <>
                <span>1 · Right to Modify Terms</span>
                <span>14 · Payment Links & Checkout Pages</span>
                <span>2 · Service Description & Disclaimer</span>
                <span>15 · KYC & Business Verification</span>
                <span>3 · Eligibility & Age Restriction</span>
                <span>16 · Reversed Transactions & Clawbacks</span>
                <span>4 · Intellectual Property Rights</span>
                <span>17 · B2B Service — No End-Customer Support</span>
                <span>5 · Billing, Add-Ons & No-Refund Policy</span>
                <span>18 · Webhook Idempotency</span>
                <span>6 · Acceptable Use Policy (AUP)</span>
                <span>19 · Regulatory Shutdown & Force Majeure</span>
                <span>7 · Third-Party Integrations & SMS Relay</span>
                <span>20 · Publicity & Marketing Rights</span>
                <span>8 · Service Level & Uptime</span>
                <span>21 · Account Non-Transferability</span>
                <span>9 · Termination & Suspension Rights</span>
                <span>22 · Underlying MFS/Bank Fees</span>
                <span>10 · Force Majeure & Liability Limits</span>
                <span>23 · Dashboard Log Retention (90 Days)</span>
                <span>11 · Dispute Resolution & Arbitration</span>
                <span>24 · API Versioning & Deprecation</span>
                <span>12 · Governing Law (Bangladesh)</span>
                <span>25 · Support SLA & Zero Harassment Tolerance</span>
                <span>13 · Affiliate Program Terms</span>
                <span></span>
              </>
            ) : (
              <>
                <span>ধারা ১ · শর্তাবলী পরিবর্তনের অধিকার</span>
                <span>ধারা ১৪ · পেমেন্ট লিঙ্ক ও চেকআউট পেজ</span>
                <span>ধারা ২ · সেবার বিবরণ ও দায়মুক্তি</span>
                <span>ধারা ১৫ · KYC ও ব্যবসা যাচাইকরণ</span>
                <span>ধারা ৩ · যোগ্যতা ও বয়স সীমাবদ্ধতা</span>
                <span>ধারা ১৬ · বিপরীত লেনদেন ও ক্ল্যাওব্যাক</span>
                <span>ধারা ৪ · মেধা সম্পত্তি অধিকার</span>
                <span>ধারা ১৭ · B2B সেবা — শেষ-গ্রাহক সহায়তা নেই</span>
                <span>ধারা ৫ · বিলিং, অ্যাড-অন ও অ-ফেরতযোগ্য নীতি</span>
                <span>ধারা ১৮ · ওয়েবহুক আইডেম্পোটেন্সি</span>
                <span>ধারা ৬ · গ্রহণযোগ্য ব্যবহার নীতি (AUP)</span>
                <span>ধারা ১৯ · নিয়ন্ত্রক শাটডাউন ও ফোর্স ম্যাজর</span>
                <span>ধারা ৭ · তৃতীয় পক্ষের ইন্টিগ্রেশন ও SMS রিলে</span>
                <span>ধারা ২০ · প্রচার ও মার্কেটিং অধিকার</span>
                <span>ধারা ৮ · সেবার স্তর ও আপটাইম</span>
                <span>ধারা ২১ · অ্যাকাউন্ট অ-হস্তান্তরযোগ্যতা</span>
                <span>ধারা ৯ · অ্যাকাউন্ট বাতিল ও স্থগিতকরণ</span>
                <span>ধারা ২২ · অন্তর্নিহিত MFS/ব্যাংক ফি</span>
                <span>ধারা ১০ · ফোর্স ম্যাজর ও দায়ের সীমাবদ্ধতা</span>
                <span>ধারা ২৩ · ড্যাশবোর্ড লগ সংরক্ষণ (৯০ দিন)</span>
                <span>ধারা ১১ · বিরোধ নিষ্পত্তি ও সালিশি</span>
                <span>ধারা ২৪ · API সংস্করণ ও অবচয় নীতি</span>
                <span>ধারা ১২ · প্রযোজ্য আইন (বাংলাদেশ)</span>
                <span>ধারা ২৫ · সহায়তা SLA ও হয়রানি-বিরোধী নীতি</span>
                <span>ধারা ১৩ · অ্যাফিলিয়েট প্রোগ্রামের শর্তাবলী</span>
                <span></span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
          {lang === 'en' ? <EnglishTermsContent /> : <BanglaTermsContent />}
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
          <div className="pt-2">
            <Link href="/privacy" className="text-xs font-bold text-blue-500 hover:text-blue-600 underline underline-offset-2">
              {lang === 'en' ? 'View Privacy Policy →' : 'গোপনীয়তা নীতি দেখুন →'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
