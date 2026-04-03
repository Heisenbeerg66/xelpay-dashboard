'use client';

import { useState } from 'react';
import Link from 'next/link';
import InfoHeader from '@/app/info/[slug]/InfoHeader';
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
        <p>In strict compliance with the Bangladesh Financial Intelligence Unit (BFIU) directives, Anti-Money Laundering (AML) regulations, the Money Laundering Prevention Act, 2012, and the Anti-Terrorism Act, 2009 (Bangladesh), Xelpay expressly reserves the right to conduct Know Your Customer (KYC) and Business Verification procedures at any point during the lifecycle of a Merchant account.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Requested Documentation:</strong> Xelpay may formally request: valid Trade License or Business Registration Certificate, National Identity Card (NID), TIN Certificate, relevant bank account details, and/or any other supporting documentation deemed reasonably necessary by Xelpay's compliance team.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Mandatory Compliance Obligation:</strong> The Merchant is legally obligated to respond to any KYC verification request within the timeframe specified (no less than 72 hours). Submission of forged, falsified, or fraudulently obtained documentation constitutes a serious criminal offense under Bangladesh law and will result in immediate permanent account termination and mandatory referral to the appropriate law enforcement authorities.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Consequences of Non-Compliance:</strong> Failure or refusal to provide the requested KYC documentation within the stipulated timeframe will result in the immediate suspension of the Merchant's account and all associated API access, without any prior further notice.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">No Refund on KYC-Triggered Suspension</strong>
              Account suspension or termination arising from non-compliance with a KYC or Business Verification request does not entitle the Merchant to any refund of pre-paid subscription fees or Add-On charges, consistent with Xelpay's strict No-Refund Policy stated in Section 5.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Data Handling of KYC Documents:</strong> All KYC documents submitted to Xelpay are handled and stored in strict accordance with our Privacy Policy. KYC documents are accessible only by Xelpay's authorized compliance personnel on a strict need-to-know basis.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="16. Reversed Transactions, MFS Clawbacks & Operator Disputes" icon={ShieldAlert} accent="red">
        <p>Xelpay's role is strictly limited to that of a technological verification intermediary. The platform confirms the receipt of a payment notification and fires the corresponding webhook; it does not guarantee the finality, permanence, or irrevocability of any underlying financial transaction.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Zero Liability — Reversals, Clawbacks & Operator Disputes</strong>
          In the event that any payment transaction previously verified by Xelpay's system is subsequently reversed, recalled, frozen, disputed, or clawed back by the originating customer/sender, the relevant MFS operator (e.g., bKash, Nagad, Rocket), the Merchant's or customer's bank, any payment gateway provider, Bangladesh Bank, or any other competent financial or regulatory authority — for any reason whatsoever — <strong>Xelpay bears absolutely no legal, financial, or operational liability or responsibility</strong> for any goods delivered, services rendered, digital content released, or access granted by the Merchant in reliance on the prior verification confirmation; any resulting financial loss, revenue loss, inventory loss, or business loss suffered by the Merchant; or any claims, lawsuits, or proceedings brought against the Merchant by their customers or any third party arising from such a reversal or clawback event.
        </InfoBox>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Independent Risk Obligation:</strong> It is the Merchant's sole and exclusive responsibility to maintain their own robust fraud prevention, order verification, and risk management policies — independent of Xelpay's automated verification — before releasing high-value goods, services, or irreversible digital deliverables.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Dispute Resolution Between Merchant & Customer:</strong> Any payment dispute, refund request, or chargeback initiated by the Merchant's end-customer is a matter strictly and exclusively between the Merchant and their customer. Xelpay is not a party to any such dispute.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Cooperation in Investigations:</strong> Notwithstanding the foregoing liability limitations, Xelpay will, where legally required or operationally feasible, cooperate with authorized regulatory and law enforcement investigations related to disputed transactions.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="17. Strict B2B Service — No End-Customer Support Obligation" icon={Users} accent="purple">
        <p>Xelpay is an exclusively <strong className="text-slate-800 dark:text-slate-200">Business-to-Business (B2B)</strong> technology platform. The contractual relationship established by these Terms of Service exists solely and exclusively between Xelpay (Xenverse IT) and the registered Merchant entity.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">No Direct Relationship with End-Customers:</strong> Xelpay has no direct legal, contractual, commercial, or financial relationship with any end-customer, buyer, or third party who transacts through the Merchant's Xelpay-powered payment interface or checkout page. End-customers are customers of the Merchant, not of Xelpay.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">No Support Obligation for End-Customers:</strong> Xelpay is under <strong>absolutely no legal or contractual obligation</strong> to respond to, investigate, or resolve any support inquiry, complaint, or claim submitted directly by a Merchant's end-customer; process, approve, or facilitate any refund, chargeback, or payment dispute on behalf of a Merchant's end-customer.
            <InfoBox type="info">
              <strong>Merchant Responsibility:</strong> It is the Merchant's sole and exclusive legal responsibility to provide adequate customer support, honor their own refund policies, and resolve all disputes with their end-customers directly. Xelpay's support channels are available exclusively to registered Merchants for platform-related technical issues and account management queries.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant Indemnification for End-Customer Claims:</strong> The Merchant explicitly agrees to fully indemnify, defend, and hold Xelpay harmless from and against any claim, lawsuit, regulatory complaint, or legal proceeding initiated by any of the Merchant's end-customers arising from the Merchant's commercial operations, product or service quality, delivery failures, refund disputes, or any misrepresentation made by the Merchant to their customers.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="18. Webhook Idempotency & Double-Crediting Prevention" icon={Zap} accent="purple">
        <p>Xelpay's webhook delivery system is engineered to dispatch payment confirmation payloads upon verified transaction events. However, in scenarios involving network timeouts or transient connectivity failures, Xelpay's system may, in accordance with its retry policy, automatically re-attempt the delivery of the same webhook payload one or more times.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Merchant Responsibility — Idempotency Implementation</strong>
          It is the <strong>absolute, non-delegable, and sole technical and legal responsibility</strong> of the Merchant's development team to implement robust <strong>idempotency logic</strong> within their webhook receiver endpoint. Idempotency means that the Merchant's system must be architecturally designed to recognize and gracefully discard duplicate webhook deliveries carrying the same unique Transaction ID (TrxID) or Xelpay Order Reference, thereby ensuring that any given verified transaction is credited, fulfilled, or actioned only once, regardless of how many times the webhook notification is received. Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> whatsoever for any instance of double-crediting, duplicate order fulfillment, or any other form of duplicate financial action taken by the Merchant's system as a result of the Merchant's failure to implement adequate idempotency safeguards.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="19. Regulatory Shutdown, Government Directives & Force Majeure on Service Features" icon={Building2} accent="red">
        <p>Xelpay operates in a regulated and rapidly evolving technological and regulatory environment. Several of Xelpay's core verification capabilities — specifically SMS-reading automation, IMAP-based bank email scraping and parsing, and related data extraction functionalities — depend upon regulatory permissions and the absence of governmental restrictions that may be imposed at any future time without prior notice to Xelpay.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability & Zero Refund — Regulatory Shutdown</strong>
          Xelpay shall bear <strong>absolutely no legal or financial liability</strong> of any nature — and no refunds, service credits, or compensatory payments of any kind shall be due or payable to the Merchant — in connection with any regulatory-mandated suspension, modification, or permanent discontinuation of any service feature. The Merchant explicitly acknowledges and accepts that the risk of regulatory change affecting Xelpay's service capabilities is an inherent and foreseeable risk of operating a digital payment business in Bangladesh and that such events shall be treated as a Force Majeure occurrence under these Terms.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="20. Publicity & Marketing Rights" icon={Users} accent="green">
        <p>By registering a Xelpay merchant account and actively utilizing the Xelpay platform for your business operations, you hereby grant Xelpay (Xenverse IT) a <strong className="text-slate-800 dark:text-slate-200">non-exclusive, royalty-free, worldwide, perpetual (until opt-out), sublicensable license</strong> to use, display, and reproduce your registered business name, associated business brand name, and official business logo in marketing materials, case studies, promotional blog posts, social media content, press releases, investor materials, and sales collateral.</p>
        <InfoBox type="info">
          <strong>Opt-Out Right:</strong> If you do not wish for your business name, brand, or logo to be used in any promotional contexts, you may exercise your opt-out right at any time by submitting a formal written opt-out request to Xelpay's support team through the official support channel. Upon receipt and processing of a valid opt-out request, Xelpay will cease future use of your brand assets in new promotional materials within a commercially reasonable timeframe.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="21. Account Non-Transferability" icon={Lock} accent="red">
        <p>Xelpay merchant accounts are issued to, and are for the exclusive use of, the specific registered business entity or individual sole proprietor that completed the account registration process. Xelpay accounts are, at all times, <strong className="text-slate-800 dark:text-slate-200">strictly and absolutely non-transferable</strong>.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Transfer Actions:</strong> Merchants are expressly prohibited from selling, transferring, assigning, leasing, renting, sublicensing, gifting, pledging, hypothecating, or in any other manner conveying ownership, access, or control of their Xelpay merchant account, associated API keys, Webhook secrets, or any account credentials to any third party, whether for consideration or otherwise.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Business Succession:</strong> In the event of a legitimate business acquisition, merger, or change of beneficial ownership, the Merchant must notify Xelpay in writing prior to completing any such transaction. Xelpay reserves the right to review the proposed transaction and require updated KYC documentation for the new controlling entity.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Enforcement — Immediate Lifetime Ban:</strong> Any unauthorized transfer of a Xelpay merchant account will be treated as a critical, immediate security and AML compliance breach.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">AML Risk — Zero Tolerance</strong>
              The strict prohibition on account transfers is a core AML compliance control. Unauthorized account transfers obscure beneficial ownership, enable circumvention of KYC controls, and create unacceptable money laundering and fraud risks — all of which Xelpay is legally obligated to prevent under Bangladeshi law. No refunds will be issued upon account termination due to unauthorized transfer.
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>

      <SectionBlock title="22. Underlying MFS, Bank & Third-Party Transaction Fees" icon={CreditCard} accent="amber">
        <p>Xelpay's subscription fees exclusively cover access to and use of Xelpay's proprietary software infrastructure, payment verification engine, API services, dashboard, and associated technical support. These fees do <strong className="text-slate-800 dark:text-slate-200">NOT</strong> cover, include, absorb, or offset any third-party fees, charges, or costs associated with the underlying financial transactions conducted by the Merchant or their customers.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Sole Responsibility for Third-Party Fees:</strong> The Merchant is solely, exclusively, and entirely responsible for bearing all costs and fees imposed by third-party financial service providers in connection with their business transactions, including but not limited to: MFS cash-out charges; MFS P2P send money fees or transfer charges; bank-to-bank transfer fees and BEFTN/RTGS charges; international payment gateway processing fees, currency conversion fees, and cross-border transaction charges; and all applicable taxes, levies, VAT, or duties payable to the Government of Bangladesh or any other tax authority on financial transactions.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Fee Structure Changes by Third Parties:</strong> Xelpay has no control over the fee structures, pricing policies, or terms of service of any MFS operator, bank, or payment gateway provider. Third-party fee changes are outside Xelpay's authority and will not constitute grounds for a reduction in Xelpay's subscription fees or any form of refund.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Obligation to Verify Fees:</strong> It is the Merchant's sole responsibility to independently verify and remain current with the fee schedules of all third-party financial service providers they use in conjunction with the Xelpay platform.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="23. Dashboard Log Retention Limits & Data Export Responsibility" icon={Database} accent="amber">
        <p>To maintain optimal server performance, Xelpay's merchant dashboard displays active transaction logs, order history, webhook delivery logs, and associated operational data on a <strong className="text-slate-800 dark:text-slate-200">limited rolling window basis</strong>. By default, the dashboard will display transactional and operational logs for the most recent <strong className="text-slate-800 dark:text-slate-200">ninety (90) calendar days</strong>. Xelpay reserves the right to adjust this rolling display window at its sole discretion, with reasonable notice provided to active Merchants via dashboard notification.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Data Export Responsibility:</strong> It is the Merchant's sole and absolute responsibility to regularly and proactively export their transaction data, order logs, and any other operational records they require for their own business accounting, reconciliation, tax compliance, auditing, or dispute resolution purposes.
            <InfoBox type="warning">
              <strong>Recommendation:</strong> Xelpay strongly recommends that Merchants establish a routine data export schedule — at minimum, on a monthly basis — to maintain a complete and up-to-date archive of their transaction history in their own secure storage systems. Failure to export data regularly may result in the permanent loss of dashboard-visible transaction records beyond the rolling retention window.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Backend AML Retention (Non-Dashboard):</strong> Notwithstanding the limited dashboard display window, Xelpay's backend systems separately retain encrypted, immutable transaction logs and associated account activity records for a minimum period of <strong className="text-slate-800 dark:text-slate-200">Five (5) years</strong> following the transaction date, in strict compliance with AML regulatory requirements. These backend-retained records are not directly accessible via the Merchant dashboard but may be made available to competent regulatory or law enforcement authorities upon valid legal request.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Liability for Dashboard Data Loss:</strong> Xelpay bears absolutely no liability for any business losses, accounting discrepancies, tax compliance issues, or any other consequences arising from the Merchant's failure to export and maintain their own records within the dashboard display window.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="24. API Versioning, Updates & Deprecation Policy" icon={Zap} accent="purple">
        <p>Xelpay continuously invests in the improvement, security hardening, and capability expansion of its API infrastructure. Xelpay expressly reserves the right to release new versions of its API, introduce breaking or non-breaking changes to existing API endpoints, modify API request or response schemas, and deprecate or permanently retire older API versions at any time.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Deprecation Notice:</strong> Where operationally feasible and commercially reasonable, Xelpay will endeavor to provide advance notice of planned API version deprecations via dashboard notifications, email alerts, or API changelog updates. However, in cases involving critical security vulnerabilities, mandatory regulatory compliance changes, or other urgent operational necessities, Xelpay reserves the right to implement changes or deprecate API versions with immediate effect and without prior notice.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Absolute Maintenance Responsibility:</strong> It is the <strong>absolute, non-delegable, and sole technical responsibility</strong> of the Merchant and their development team to actively monitor Xelpay's API changelog, version release notes, and deprecation announcements; update their integration code in a timely manner to remain compatible with current and supported API versions; and test their integration thoroughly following any API update or version migration.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — Broken Integrations from Outdated Code</strong>
              Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> for any broken integrations, failed payment verifications, missed webhook deliveries, API authentication failures, data parsing errors, or any other technical malfunction or business disruption experienced by the Merchant as a direct or indirect result of the Merchant's failure to update their integration code to remain compatible with Xelpay's current API version.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Refunds for Integration Failures:</strong> API version-related integration failures or service disruptions experienced by the Merchant due to outdated integration code do not constitute grounds for a refund of subscription fees or any other form of financial compensation from Xelpay.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="25. Support Policy, SLA & Zero-Tolerance for Staff Harassment" icon={ShieldAlert} accent="red">
        <p>Xelpay provides merchant support services through its designated official support channels as communicated within the merchant dashboard. Xelpay is committed to providing responsive and helpful support to all Merchants; however, the following terms govern the nature, scope, and conduct expectations of the support relationship.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Best-Effort Support — No Guaranteed Response SLA:</strong> Unless the Merchant has entered into a separate, formally executed Enterprise Agreement with Xelpay that explicitly specifies binding response time Service Level Agreements (SLAs), all merchant support is provided strictly on a <strong>"best-effort" basis</strong>. Xelpay makes no binding guarantee regarding specific response times, resolution times, or the order in which support tickets are addressed. Support queue prioritization is at Xelpay's sole discretion.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Scope of Support:</strong> Xelpay's support services cover platform-related technical issues, API integration assistance, account configuration guidance, and billing inquiries. Support does not extend to general software development consulting, custom feature development, debugging of the Merchant's own proprietary codebase (beyond direct Xelpay API integration issues), or any support for the Merchant's end-customers.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Zero-Tolerance Policy Against Support Staff Harassment:</strong> Xelpay maintains an absolute and non-negotiable zero-tolerance policy against any form of abusive, threatening, harassing, intimidating, defamatory, or discriminatory conduct directed by a Merchant (or any person acting on their behalf) toward any Xelpay support staff member, employee, contractor, or representative, through any communication channel.
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Immediate Permanent Ban — Harassment of Support Staff</strong>
              Prohibited conduct includes, without limitation: the use of abusive, vulgar, profane, or threatening language in written or verbal communications; the issuance of threats of physical harm, legal action used as intimidation, or public defamation; repeated harassment, trolling, or deliberately bad-faith communications designed to obstruct support operations; and any other behavior that a reasonable person would consider to constitute harassment or workplace abuse. Any single confirmed instance of harassment of Xelpay support staff will result in the <strong>immediate, permanent, and irrevocable termination</strong> of the Merchant's account and all associated API access, with no prior warning. This termination is non-negotiable, non-reversible, and will be treated as a policy violation under Section 6 (AUP). <strong>No refunds of any pre-paid subscription fees or Add-On charges will be issued upon termination under this policy</strong>, consistent with our strict No-Refund Policy.
            </InfoBox>
          </li>
        </ul>
      </SectionBlock>
    </div>
  );
}function BanglaTermsContent() {
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
          Xelpay একটি সফটওয়্যার লেয়ার — এটি কোনো ব্যাংক, আর্থিক প্রতিষ্ঠান, ডিজিটাল ওয়ালেট, পেমেন্ট অ্যাগ্রিগেটর বা মানি সার্ভিস বিজনেস (MSB) <strong>নয়</strong>। আমরা আপনার প্রকৃত অর্থ ধারণ, প্রক্রিয়া, স্পর্শ বা কাস্টোডিয়ান হিসেবে কাজ করি না। সমস্ত লেনদেন পিয়ার-টু-পিয়ার এবং সরাসরি আপনার নিজের ব্যক্তিগত বা কর্পোরেট MFS/ব্যাংক অ্যাকাউন্টে নিষ্পত্তি হয়। ব্যাংক কোম্পানি আইন, ১৯৯১ (বাংলাদেশ)-এর অধীনে Xelpay একটি আর্থিক প্রতিষ্ঠান হিসেবে <strong>লাইসেন্সপ্রাপ্ত নয়</strong>।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="৩. যোগ্যতা, অ্যাকাউন্টের দায়িত্ব ও বয়স সীমাবদ্ধতা" icon={UserCheck} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">বয়স সীমাবদ্ধতা:</strong> Xelpay ব্যবহার করে ব্যবসা পরিচালনা করতে আপনার বয়স অবশ্যই কমপক্ষে ১৮ বছর হতে হবে অথবা আপনার অধিক্ষেত্রে প্রাপ্তবয়স্কতার আইনি বয়স পূর্ণ হতে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক যোগ্যতা:</strong> Xelpay শুধুমাত্র বৈধ ব্যবসায়িক ব্যবহারের জন্য। আপনাকে অবশ্যই আইনগতভাবে নিবন্ধিত ব্যবসার মালিক বা এককভাবে পরিচালক হতে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তথ্যের নির্ভুলতা:</strong> নিবন্ধনের সময় আপনাকে অবশ্যই সত্য, সঠিক এবং সম্পূর্ণ ব্যবসায়িক তথ্য প্রদান করতে হবে। মিথ্যা বা প্রতারণামূলক তথ্য প্রদান কঠোরভাবে নিষিদ্ধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্টের নিরাপত্তা:</strong> আপনার লগইন ক্রেডেনশিয়াল, API কী, ওয়েবহুক সিক্রেট এবং টিম সদস্যদের ভূমিকার সম্পূর্ণ গোপনীয়তা বজায় রাখা সম্পূর্ণরূপে আপনার দায়িত্ব।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">একটি অ্যাকাউন্ট নীতি:</strong> ব্যবহারের সীমা, নিষেধাজ্ঞা বা ফি এড়াতে একাধিক অ্যাকাউন্ট তৈরি করা কঠোরভাবে নিষিদ্ধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ডেমো মোডের সীমাবদ্ধতা:</strong> Xelpay শুধুমাত্র UI/UX মূল্যায়ন এবং API ইন্টিগ্রেশন পরীক্ষার জন্য "ডেমো মোড" প্রদান করে। আপনাকে অবশ্যই ডেমো মোড ক্রেডেনশিয়াল ব্যবহার করে <strong className="text-red-600 dark:text-red-400">কখনোই</strong> বাস্তব গ্রাহক ডেটা বা প্রকৃত আর্থিক লেনদেন প্রক্রিয়া করা যাবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৪. মেধা সম্পত্তি অধিকার (IP Rights)" icon={BookOpen} accent="purple">
        <p>Xelpay-এর সাথে সম্পর্কিত সমস্ত সোর্স কোড, UI/UX ডিজাইন, API আর্কিটেকচার, অ্যালগরিদম, লোগো, ট্রেডমার্ক এবং মালিকানাধীন পদ্ধতি <strong className="text-slate-800 dark:text-slate-200">Xenverse IT</strong>-এর একচেটিয়া মেধা সম্পত্তি, কপিরাইট আইন, ২০০০ (বাংলাদেশ) এবং আন্তর্জাতিক IP চুক্তির অধীনে সুরক্ষিত।</p>
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

      <SectionBlock title="৭ থেকে ২৫. বিস্তারিত অনুচ্ছেদসমূহ" icon={FileText} accent="blue">
        <InfoBox type="info">
          <strong>বিঃদ্রঃ:</strong> ধারা ৭ থেকে ২৫ পর্যন্ত সম্পূর্ণ বিস্তারিত বিষয়বস্তু ইংরেজি সংস্করণে পাওয়া যাবে। ইংরেজি সংস্করণটি আইনগতভাবে প্রযোজ্য। বাংলা সংস্করণ শুধুমাত্র সহায়ক তথ্যের জন্য প্রদান করা হয়েছে।
        </InfoBox>
        <p>ধারা ৭: তৃতীয় পক্ষের ইন্টিগ্রেশন (IMAP, Telegram, SMS ও বাহ্যিক API) — কাস্টম টেলিগ্রাম বট, IMAP ব্যাংক ইমেইল সিঙ্ক, SMS রিলে অ্যাপ, MFS SMS ফরম্যাট পরিবর্তন, SMS স্পুফিং সংক্রান্ত বিস্তারিত নির্দেশিকা।</p>
        <p>ধারা ৮-১২: সেবার স্তর ও আপটাইম, অ্যাকাউন্ট বাতিল, ফোর্স ম্যাজর ও দায়ের সীমাবদ্ধতা, বিরোধ নিষ্পত্তি, প্রযোজ্য আইন (বাংলাদেশ)।</p>
        <p>ধারা ১৩-১৭: অ্যাফিলিয়েট প্রোগ্রাম, পেমেন্ট লিঙ্ক, KYC ও ব্যবসা যাচাইকরণ, বিপরীত লেনদেন ও ক্ল্যাওব্যাক, কঠোর B2B সেবা।</p>
        <p>ধারা ১৮-২৫: ওয়েবহুক আইডেম্পোটেন্সি, নিয়ন্ত্রক শাটডাউন, প্রচার ও মার্কেটিং অধিকার, অ্যাকাউন্ট অ-হস্তান্তরযোগ্যতা, অন্তর্নিহিত MFS/ব্যাংক ফি, ড্যাশবোর্ড লগ সংরক্ষণ, API সংস্করণ ও অবচয় নীতি, সহায়তা SLA ও হয়রানি-বিরোধী নীতি।</p>
      </SectionBlock>
    </div>
  );
}

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 font-sans">
      <InfoHeader />

      <main className="py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Header Card */}
          <div className="bg-white dark:bg-[#111827] p-7 md:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {lang === 'en' ? 'Terms of Service' : 'সেবার শর্তাবলী'}
                  </h1>
                  <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-2"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Globe size={14} className="text-slate-400" />
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-black">
                  <button onClick={() => setLang('en')}
                    className={`px-3 py-1.5 transition-colors uppercase tracking-widest ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    EN
                  </button>
                  <button onClick={() => setLang('bn')}
                    className={`px-3 py-1.5 transition-colors ${lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    বাং
                  </button>
                </div>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {lang === 'en'
                ? 'Last Updated: April 01, 2026 · Effective Immediately · 25 Sections · Governed by Bangladesh Law.'
                : 'সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬ · তাৎক্ষণিকভাবে কার্যকর · ২৫টি অনুচ্ছেদ'}
            </p>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {lang === 'en' ? 'Also read our Privacy Policy for data handling information.' : 'ডেটা পরিচালনার তথ্যের জন্য আমাদের গোপনীয়তা নীতিও পড়ুন।'}
              </p>
              <Link href="/info/privacy" className="shrink-0 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 border border-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                {lang === 'en' ? 'Privacy →' : 'গোপনীয়তা →'}
              </Link>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
            {lang === 'en' ? <EnglishTermsContent /> : <BanglaTermsContent />}
          </div>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-slate-500 py-8 px-6 border-t border-slate-800 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-black text-blue-600 tracking-tighter">X</span>
            <span className="text-lg font-semibold text-white tracking-tight -ml-0.5">elPay</span>
          </Link>
          <div className="flex gap-5">
            <Link href="/info/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/info/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/info/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <span className="opacity-40 uppercase tracking-widest text-[10px]">© {new Date().getFullYear()} XelPay · Xenverse IT · All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
}