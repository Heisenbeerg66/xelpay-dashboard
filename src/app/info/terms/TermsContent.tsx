'use client';

import { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Lock, Server,
  CreditCard, Users, Scale, Gavel, Smartphone, Database, RefreshCw,
  UserCheck, AlertCircle, BookOpen, Building2, Zap, Fingerprint, ShieldAlert, FileText
} from 'lucide-react';

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
            <strong className="text-slate-800 dark:text-slate-200">Add-On Services & Usage-Based Billing:</strong> In addition to the base subscription plan, Xelpay reserves the right to charge separate, additional usage-based fees for specific "Add-On" services consumed beyond the base plan's included allowances. Such Add-On services may include, but are not limited to: outbound notification emails dispatched via Xelpay's own email infrastructure, premium SMS alerts delivered through Xelpay's third-party SMS gateway integrations, or any other resource-intensive features explicitly designated as usage-billed at the time of activation. Usage-based fees will be calculated based on actual consumption during the applicable billing period and will be clearly itemized on your invoice. By enabling and utilizing any Add-On service, you explicitly authorize Xelpay to charge the applicable usage-based fees to your registered payment method.
            <div className="mt-3">
              <InfoBox type="warning">
                <strong>Important:</strong> Enabling an Add-On service constitutes your binding agreement to the associated usage-based pricing. There are no refunds for Add-On charges already incurred and billed, consistent with our strict No-Refund Policy below.
              </InfoBox>
            </div>
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
          <li>Unauthorized access or intrusion attempts against Xelpay's databases, administrative panels, or any connected user's systems — in violation of the Digital Security Act, 2018 (Bangladesh).</li>
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
                The uninterrupted and accurate functioning of the SMS Relay verification system is entirely contingent upon the Merchant maintaining a dedicated Android device with: (a) a continuous, stable, and active mobile data or Wi-Fi internet connection; (b) the Xelpay Relay application running persistently in the foreground or background without interruption; and (c) the device powered on at all times during business operation hours. Xelpay holds <strong>absolutely zero liability</strong> for any missed, delayed, or failed payment verifications caused by device power loss, mobile network instability, aggressive battery optimization, or any manufacturer-specific background app restrictions.
              </InfoBox>
            </div>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">MFS SMS Format Changes & Verification Failures:</strong> Xelpay's automated payment verification engine parses incoming SMS notifications from MFS operators based on known SMS template formats. MFS operators may, at their own discretion and without prior notice, modify or replace their SMS notification templates, which may render Xelpay's parsing engine temporarily unable to correctly extract transaction data. <strong className="text-slate-800 dark:text-slate-200">Xelpay bears absolutely no liability</strong> for any unverified or missed payment transactions during the period between an MFS operator's SMS format change and Xelpay's successful deployment of a corresponding system patch.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS Spoofing & False Positive Verifications:</strong> Xelpay's verification engine operates entirely upon the basis of SMS notifications received on the Merchant's registered relay device.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — SMS Spoofing & False Positives</strong>
                In the event that any person transmits a spoofed, fabricated, or fraudulent SMS message that mimics a legitimate MFS payment notification and Xelpay's system processes such fraudulent SMS as a valid payment ("False Positive"), <strong>Xelpay bears absolutely no legal, financial, or operational liability whatsoever</strong> for any goods delivered, services rendered, or financial loss suffered by the Merchant as a result. The Merchant is solely responsible for implementing independent verification procedures for high-value transactions.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Third-Party Service Availability:</strong> Xelpay does not guarantee the continuous availability of integrated third-party services (Telegram, MFS providers, banks, etc.). Downtime of these services is outside our control and does not constitute grounds for a refund or service credit.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Webhook Delivery & Merchant Server Outages:</strong> Xelpay makes best-effort attempts to deliver webhook payloads to your configured endpoints. Xelpay holds <strong>absolutely no liability</strong> for any business loss, order processing failures, or revenue loss resulting from permanently missed webhook deliveries caused by the Merchant's server downtime, misconfiguration, or network issues on the Merchant's end.
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
          <li><strong className="text-slate-800 dark:text-slate-200">Limitation of Liability — MFS/Bank Account Actions:</strong> Under no legal framework shall Xelpay, its founders, directors, or Xenverse IT be held liable for your personal or business MFS/Bank accounts being flagged, restricted, frozen, or suspended by respective financial institutions or authorities.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">General Liability Cap:</strong> In no event shall Xelpay's total aggregate liability for all claims related to the service exceed the total amount paid by you to Xelpay during the ONE (1) month immediately preceding the date on which the claim arose.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Exclusion of Consequential Damages:</strong> Xelpay shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages — including but not limited to loss of profits, loss of data, loss of business opportunity, or business interruption.</li>
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
          <li><strong className="text-slate-800 dark:text-slate-200">Governing Law:</strong> These Terms shall be exclusively governed by and construed in accordance with the laws of the People's Republic of Bangladesh, including but not limited to the Contract Act, 1872; the Information and Communication Technology Act, 2006; the Digital Security Act, 2018; and all applicable Bangladesh Bank regulations.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Jurisdiction:</strong> Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of competent authority located within Bangladesh.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Severability:</strong> If any provision of these Terms is found to be unenforceable or invalid, that specific provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Xelpay regarding your use of the platform and supersede all prior agreements.</li>
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
          <li><strong className="text-slate-800 dark:text-slate-200">Customer Data on Checkout Pages:</strong> Any personal data your customers submit on your Xelpay-powered checkout pages is processed as per this Privacy Policy. You must ensure your own customers are aware of how their data is handled.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Content on Payment Links:</strong> Payment links must not be used to collect money for prohibited, illegal, or fraudulent purposes as outlined in Section 6 (AUP).</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="15. KYC & Business Verification" icon={Fingerprint} accent="orange">
        <p>In strict compliance with the Bangladesh Financial Intelligence Unit (BFIU) directives, Anti-Money Laundering (AML) regulations, the Money Laundering Prevention Act, 2012, and the Anti-Terrorism Act, 2009 (Bangladesh), Xelpay expressly reserves the right to conduct Know Your Customer (KYC) and Business Verification procedures at any point during the lifecycle of a Merchant account.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Requested Documentation:</strong> Xelpay may formally request: valid Trade License or Business Registration Certificate, National Identity Card (NID), TIN Certificate, relevant bank account details, and/or any other supporting documentation deemed reasonably necessary by Xelpay's compliance team.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Mandatory Compliance Obligation:</strong> The Merchant is legally obligated to respond to any KYC verification request within the timeframe specified (no less than 72 hours). Submission of forged or fraudulently obtained documentation constitutes a serious criminal offense under Bangladesh law.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Consequences of Non-Compliance:</strong> Failure or refusal to provide the requested KYC documentation will result in the immediate suspension of the Merchant's account.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">No Refund on KYC-Triggered Suspension</strong>
                Account suspension or termination arising from non-compliance with a KYC or Business Verification request does not entitle the Merchant to any refund of pre-paid subscription fees or Add-On charges, consistent with Xelpay's strict No-Refund Policy stated in Section 5.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Data Handling of KYC Documents:</strong> All KYC documents submitted to Xelpay are handled and stored in strict accordance with our Privacy Policy and are accessible only by Xelpay's authorized compliance personnel on a strict need-to-know basis.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="16. Reversed Transactions, MFS Clawbacks & Operator Disputes" icon={ShieldAlert} accent="red">
        <p>Xelpay's role is strictly limited to that of a technological verification intermediary. The platform confirms the receipt of a payment notification and fires the corresponding webhook; it does not guarantee the finality, permanence, or irrevocability of any underlying financial transaction.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Zero Liability — Reversals, Clawbacks & Operator Disputes</strong>
          In the event that any payment transaction previously verified by Xelpay's system is subsequently reversed, recalled, frozen, disputed, or clawed back by the originating customer/sender, the relevant MFS operator (e.g., bKash, Nagad, Rocket), or any competent financial or regulatory authority — for any reason whatsoever — <strong>Xelpay bears absolutely no legal, financial, or operational liability or responsibility</strong> for any goods delivered, services rendered, or financial loss suffered by the Merchant as a result.
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
          <li><strong className="text-slate-800 dark:text-slate-200">No Direct Relationship with End-Customers:</strong> Xelpay has no direct legal, contractual, commercial, or financial relationship with any end-customer, buyer, or third party who transacts through the Merchant's Xelpay-powered payment interface. End-customers are customers of the Merchant, not of Xelpay.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">No Support Obligation for End-Customers:</strong> Xelpay is under <strong>absolutely no legal or contractual obligation</strong> to respond to, investigate, or resolve any support inquiry, complaint, or claim submitted directly by a Merchant's end-customer.
            <div className="mt-3">
              <InfoBox type="info">
                <strong>Merchant Responsibility:</strong> It is the Merchant's sole and exclusive legal responsibility to provide adequate customer support, honor their own refund policies, and resolve all disputes with their end-customers directly. Xelpay's support channels are available exclusively to registered Merchants for platform-related technical issues and account management queries.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant Indemnification for End-Customer Claims:</strong> The Merchant explicitly agrees to fully indemnify, defend, and hold Xelpay harmless from and against any claim, lawsuit, regulatory complaint, or legal proceeding initiated by any of the Merchant's end-customers arising from the Merchant's commercial operations.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="18. Webhook Idempotency & Double-Crediting Prevention" icon={Zap} accent="purple">
        <p>Xelpay's webhook delivery system is engineered to dispatch payment confirmation payloads upon verified transaction events. However, in scenarios involving network timeouts or transient connectivity failures, Xelpay's system may automatically re-attempt the delivery of the same webhook payload one or more times.</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Merchant Responsibility — Idempotency Implementation</strong>
          It is the <strong>absolute, non-delegable, and sole technical and legal responsibility</strong> of the Merchant's development team to implement robust <strong>idempotency logic</strong> within their webhook receiver endpoint. Idempotency means that the Merchant's system must be architecturally designed to recognize and gracefully discard duplicate webhook deliveries carrying the same unique Transaction ID (TrxID) or Xelpay Order Reference, ensuring that any given verified transaction is credited or fulfilled only once, regardless of how many times the webhook notification is received. Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> for any instance of double-crediting, duplicate order fulfillment, or any other form of duplicate financial action taken by the Merchant's system as a result of the Merchant's failure to implement adequate idempotency safeguards.
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
          <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Transfer Actions:</strong> Merchants are expressly prohibited from selling, transferring, assigning, leasing, renting, sublicensing, gifting, pledging, or in any other manner conveying ownership, access, or control of their Xelpay merchant account, associated API keys, Webhook secrets, or any account credentials to any third party, whether for consideration or otherwise.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Business Succession:</strong> In the event of a legitimate business acquisition, merger, or change of beneficial ownership, the Merchant must notify Xelpay in writing prior to completing any such transaction. Xelpay reserves the right to review the proposed transaction and require updated KYC documentation for the new controlling entity.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Enforcement — Immediate Lifetime Ban:</strong> Any unauthorized transfer of a Xelpay merchant account will be treated as a critical, immediate security and AML compliance breach.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">AML Risk — Zero Tolerance</strong>
                The strict prohibition on account transfers is a core AML compliance control. Unauthorized account transfers obscure beneficial ownership, enable circumvention of KYC controls, and create unacceptable money laundering and fraud risks — all of which Xelpay is legally obligated to prevent under Bangladeshi law. No refunds will be issued upon account termination due to unauthorized transfer.
              </InfoBox>
            </div>
          </li>
        </ul>
      </SectionBlock>

      <SectionBlock title="22. Underlying MFS, Bank & Third-Party Transaction Fees" icon={CreditCard} accent="amber">
        <p>Xelpay's subscription fees exclusively cover access to and use of Xelpay's proprietary software infrastructure, payment verification engine, API services, dashboard, and associated technical support. These fees do <strong className="text-slate-800 dark:text-slate-200">NOT</strong> cover, include, absorb, or offset any third-party fees, charges, or costs associated with the underlying financial transactions conducted by the Merchant or their customers.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Sole Responsibility for Third-Party Fees:</strong> The Merchant is solely, exclusively, and entirely responsible for bearing all costs and fees imposed by third-party financial service providers in connection with their business transactions, including but not limited to: MFS cash-out charges; MFS P2P send money fees; bank-to-bank transfer fees and BEFTN/RTGS charges; international payment gateway processing fees; and all applicable taxes, levies, VAT, or duties payable to the Government of Bangladesh or any other tax authority.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Fee Structure Changes by Third Parties:</strong> Xelpay has no control over the fee structures, pricing policies, or terms of service of any MFS operator, bank, or payment gateway provider. Third-party fee changes are outside Xelpay's authority and will not constitute grounds for a reduction in Xelpay's subscription fees or any form of refund.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Obligation to Verify Fees:</strong> It is the Merchant's sole responsibility to independently verify and remain current with the fee schedules of all third-party financial service providers they use in conjunction with the Xelpay platform.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="23. Dashboard Log Retention Limits & Data Export Responsibility" icon={Database} accent="amber">
        <p>To maintain optimal server performance, Xelpay's merchant dashboard displays active transaction logs, order history, webhook delivery logs, and associated operational data on a <strong className="text-slate-800 dark:text-slate-200">limited rolling window basis</strong>. By default, the dashboard will display transactional and operational logs for the most recent <strong className="text-slate-800 dark:text-slate-200">ninety (90) calendar days</strong>. Xelpay reserves the right to adjust this rolling display window at its sole discretion, with reasonable notice provided to active Merchants via dashboard notification.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Data Export Responsibility:</strong> It is the Merchant's sole and absolute responsibility to regularly and proactively export their transaction data, order logs, and any other operational records they require for their own business accounting, reconciliation, tax compliance, auditing, or dispute resolution purposes.
            <div className="mt-3">
              <InfoBox type="warning">
                <strong>Recommendation:</strong> Xelpay strongly recommends that Merchants establish a routine data export schedule — at minimum, on a monthly basis — to maintain a complete and up-to-date archive of their transaction history. Failure to export data regularly may result in the permanent loss of dashboard-visible transaction records beyond the rolling retention window.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Backend AML Retention (Non-Dashboard):</strong> Notwithstanding the limited dashboard display window, Xelpay's backend systems separately retain encrypted, immutable transaction logs for a minimum period of <strong className="text-slate-800 dark:text-slate-200">Five (5) years</strong> following the transaction date, in strict compliance with AML regulatory requirements. These backend-retained records are not directly accessible via the Merchant dashboard but may be made available to competent regulatory or law enforcement authorities upon valid legal request.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Liability for Dashboard Data Loss:</strong> Xelpay bears absolutely no liability for any business losses, accounting discrepancies, tax compliance issues, or any other consequences arising from the Merchant's failure to export and maintain their own records within the dashboard display window.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="24. API Versioning, Updates & Deprecation Policy" icon={Zap} accent="purple">
        <p>Xelpay continuously invests in the improvement, security hardening, and capability expansion of its API infrastructure. Xelpay expressly reserves the right to release new versions of its API, introduce breaking or non-breaking changes to existing API endpoints, modify API request or response schemas, and deprecate or permanently retire older API versions at any time.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Deprecation Notice:</strong> Where operationally feasible and commercially reasonable, Xelpay will endeavor to provide advance notice of planned API version deprecations via dashboard notifications, email alerts, or API changelog updates. However, in cases involving critical security vulnerabilities or mandatory regulatory compliance changes, Xelpay reserves the right to implement changes with immediate effect and without prior notice.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Merchant's Absolute Maintenance Responsibility:</strong> It is the <strong>absolute, non-delegable, and sole technical responsibility</strong> of the Merchant and their development team to actively monitor Xelpay's API changelog, version release notes, and deprecation announcements; update their integration code in a timely manner to remain compatible with current and supported API versions; and test their integration thoroughly following any API update or version migration.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — Broken Integrations from Outdated Code</strong>
                Xelpay bears <strong>absolutely zero legal, financial, or operational liability</strong> for any broken integrations, failed payment verifications, missed webhook deliveries, API authentication failures, data parsing errors, or any other technical malfunction or business disruption experienced by the Merchant as a direct or indirect result of the Merchant's failure to update their integration code to remain compatible with Xelpay's current API version.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">No Refunds for Integration Failures:</strong> API version-related integration failures or service disruptions experienced by the Merchant due to outdated integration code do not constitute grounds for a refund of subscription fees or any other form of financial compensation from Xelpay.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="25. Support Policy, SLA & Zero-Tolerance for Staff Harassment" icon={ShieldAlert} accent="red">
        <p>Xelpay provides merchant support services through its designated official support channels as communicated within the merchant dashboard. Xelpay is committed to providing responsive and helpful support to all Merchants; however, the following terms govern the nature, scope, and conduct expectations of the support relationship.</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Best-Effort Support — No Guaranteed Response SLA:</strong> Unless the Merchant has entered into a separate, formally executed Enterprise Agreement with Xelpay that explicitly specifies binding response time Service Level Agreements (SLAs), all merchant support is provided strictly on a <strong>"best-effort" basis</strong>. Xelpay makes no binding guarantee regarding specific response times, resolution times, or the order in which support tickets are addressed.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Scope of Support:</strong> Xelpay's support services cover platform-related technical issues, API integration assistance, account configuration guidance, and billing inquiries. Support does not extend to general software development consulting, custom feature development, debugging of the Merchant's own proprietary codebase, or any support for the Merchant's end-customers.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Zero-Tolerance Policy Against Support Staff Harassment:</strong> Xelpay maintains an absolute and non-negotiable zero-tolerance policy against any form of abusive, threatening, harassing, intimidating, defamatory, or discriminatory conduct directed by a Merchant (or any person acting on their behalf) toward any Xelpay support staff member, employee, contractor, or representative, through any communication channel.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">Immediate Permanent Ban — Harassment of Support Staff</strong>
                Prohibited conduct includes, without limitation: the use of abusive, vulgar, profane, or threatening language; the issuance of threats of physical harm, legal action used as intimidation, or public defamation; repeated harassment, trolling, or deliberately bad-faith communications designed to obstruct support operations. Any single confirmed instance of harassment of Xelpay support staff will result in the <strong>immediate, permanent, and irrevocable termination</strong> of the Merchant's account and all associated API access, with no prior warning. <strong>No refunds of any pre-paid subscription fees or Add-On charges will be issued upon termination under this policy</strong>, consistent with our strict No-Refund Policy.
              </InfoBox>
            </div>
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
          <strong>কর্তৃপক্ষের অধিকার:</strong> Xelpay (Xenverse IT) যেকোনো সময়, সম্পূর্ণরূপে নিজেদের বিবেচনায়, এই সেবার শর্তাবলী বা গোপনীয়তা নীতির যেকোনো অংশ আপডেট, পরিবর্তন বা প্রতিস্থাপন করার একচেটিয়া এবং সম্পূর্ণ অধিকার সংরক্ষণ করে। বড় বা সংবেদনশীল নীতি পরিবর্তনের ক্ষেত্রে, আমরা ড্যাশবোর্ড সতর্কতা বা ইমেইলের মাধ্যমে সক্রিয় ব্যবহারকারীদের অবহিত করার চেষ্টা করব। তবে, এই পেজটি নিয়মিত পর্যালোচনা করা আপনার একান্ত আইনগত দায়িত্ব। আপডেটের পরে প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখা সংশোধিত শর্তাবলী গ্রহণের বাধ্যতামূলক প্রমাণ হিসেবে গণ্য হবে।
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
          <li>Xelpay-এ জমা দেওয়া মতামত, পরামর্শ বা ধারণা আমাদের সম্পত্তি হয়ে যায় এবং কোনো ক্ষতিপূরণ বা কৃতিত্ব ছাড়াই ব্যবহার করা যেতে পারে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৫. সাবস্ক্রিপশন, বিলিং, মূল্য নির্ধারণ, অ্যাড-অন সেবা ও কঠোর অফেরতযোগ্য নীতি" icon={CreditCard} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">ফ্রি/স্টার্টার টায়ার:</strong> Xelpay একটি কঠোর মাসিক লেনদেন কোটা সহ বিনামূল্যের টায়ার অফার করতে পারে। এই কোটা শেষ হলে, পরবর্তী বিলিং চক্র বা আপগ্রেড না করা পর্যন্ত অটোমেশন সেবা তাৎক্ষণিকভাবে বন্ধ হয়ে যাবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেইড সাবস্ক্রিপশন:</strong> প্রিমিয়াম সুবিধাগুলি — টিম মেম্বার, কাস্টম টেলিগ্রাম বট, ইন্টারন্যাশনাল গেটওয়ে এবং উচ্চতর লেনদেন সীমা সহ — একটি সক্রিয়, পুনরাবৃত্তিমূলক পেইড সাবস্ক্রিপশন প্রয়োজন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">মূল্য পরিবর্তন:</strong> Xelpay যেকোনো সময় সাবস্ক্রিপশনের মূল্য পরিবর্তন করার অধিকার সংরক্ষণ করে। সক্রিয় সাবস্ক্রাইবারদের তাদের অ্যাকাউন্টে কোনো মূল্য পরিবর্তন কার্যকর হওয়ার কমপক্ষে ৭ দিন আগে অবহিত করা হবে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">অ্যাড-অন সেবা ও ব্যবহার-ভিত্তিক বিলিং:</strong> বেস সাবস্ক্রিপশন প্ল্যানের পাশাপাশি, Xelpay নির্দিষ্ট "অ্যাড-অন" সেবার জন্য পৃথক, অতিরিক্ত ব্যবহার-ভিত্তিক ফি চার্জ করার অধিকার সংরক্ষণ করে। কোনো অ্যাড-অন সেবা সক্ষম করে ব্যবহার করে, আপনি স্পষ্টভাবে প্রযোজ্য ব্যবহার-ভিত্তিক ফি চার্জ করার অনুমতি Xelpay কে প্রদান করছেন।
            <div className="mt-3">
              <InfoBox type="warning">
                <strong>গুরুত্বপূর্ণ:</strong> কোনো অ্যাড-অন সেবা সক্ষম করা সংশ্লিষ্ট ব্যবহার-ভিত্তিক মূল্য নির্ধারণে আপনার বাধ্যতামূলক সম্মতি গঠন করে। ইতিমধ্যে ব্যয় করা এবং বিল করা অ্যাড-অন চার্জের জন্য কোনো ফেরত নেই।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">কঠোর অ-ফেরতযোগ্য নীতি:</strong> আমাদের পরিষেবার ডিজিটাল, API-ভিত্তিক এবং অবকাঠামোগত প্রকৃতির কারণে, একবার সক্রিয় হয়ে পেমেন্ট প্রক্রিয়া সম্পন্ন হলে সমস্ত সাবস্ক্রিপশন পেমেন্ট <strong className="text-red-600 dark:text-red-400">কঠোরভাবে অ-ফেরতযোগ্য</strong>। একমাত্র ব্যতিক্রম, Xelpay-এর একান্ত বিবেচনায়, হলো প্রমাণযোগ্য, বিপর্যয়কর এবং অসমাধানযোগ্য প্রযুক্তিগত ব্যর্থতা যা স্পষ্টভাবে Xelpay-এর নিজস্ব সার্ভার থেকে উদ্ভূত, পেমেন্টের তারিখের ৪৮ ঘণ্টার মধ্যে রিপোর্ট করা হয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">চার্জব্যাক ও পেমেন্ট বিরোধ:</strong> একটি বৈধ সাবস্ক্রিপশন চার্জের জন্য চার্জব্যাক বা পেমেন্ট বিরোধ শুরু করা এই শর্তাবলীর লঙ্ঘন গঠন করে এবং তাৎক্ষণিক স্থায়ী অ্যাকাউন্ট নিষিদ্ধকরণের ফলে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">কর:</strong> আপনার অধিক্ষেত্রে Xelpay সেবা ব্যবহারের ফলে উদ্ভূত সমস্ত প্রযোজ্য কর, ভ্যাট, শুল্ক বা চাঁদার জন্য আপনি সম্পূর্ণরূপে দায়ী।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৬. গ্রহণযোগ্য ব্যবহার নীতি (AUP) ও নিষিদ্ধ আচরণ" icon={AlertTriangle} accent="red">
        <p>Xelpay অপব্যবহারের বিরুদ্ধে <strong className="text-slate-800 dark:text-slate-200">শূন্য-সহনশীলতা নীতি</strong> বজায় রাখে। আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে নিম্নলিখিত নিষিদ্ধ কার্যক্রমের জন্য Xelpay ব্যবহার করবেন না:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
          <li>অবৈধ পণ্য, মাদকদ্রব্য, নিয়ন্ত্রিত পদার্থ, প্রাপ্তবয়স্ক/পর্নোগ্রাফিক বিষয়বস্তু, অ-লাইসেন্সপ্রাপ্ত ওষুধপত্র, অননুমোদিত জুয়া, বা বাংলাদেশের আইনের অধীনে নিষিদ্ধ যেকোনো কার্যক্রমের জন্য পেমেন্ট প্রক্রিয়া করা।</li>
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
          <li><strong className="text-slate-800 dark:text-slate-200">কাস্টম টেলিগ্রাম বট:</strong> Xelpay-এ একটি কাস্টম টেলিগ্রাম বট টোকেন সরবরাহ করে, আপনি আমাদের সিস্টেমকে আপনার বটের মাধ্যমে ওয়েবহুক পেলোড এবং অপারেশনাল বিজ্ঞপ্তি প্রেরণ করার স্পষ্ট অনুমতি দিচ্ছেন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">IMAP ব্যাংক ইমেইল সিঙ্ক্রোনাইজেশন:</strong> আমাদের ব্যাংক ট্রান্সফার যাচাইকরণ বৈশিষ্ট্য ব্যবহার করতে আপনার পেমেন্ট বিজ্ঞপ্তি ইমেইল ইনবক্সে IMAP রিড-অনলি অ্যাক্সেস প্রয়োজন।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS রিলে ও ডিভাইস অ্যাপ — ডিভাইস ও ইন্টারনেট নির্ভরতা:</strong> আমাদের অ্যান্ড্রয়েড রিলে অ্যাপ্লিকেশন স্বয়ংক্রিয় যাচাইকরণের জন্য আপনার ডিভাইসে পেমেন্ট SMS বার্তা পড়ে।
            <div className="mt-3">
              <InfoBox type="warning">
                <strong className="block mb-1">অত্যন্ত গুরুত্বপূর্ণ ডিভাইস ও কানেক্টিভিটির প্রয়োজনীয়তা:</strong>
                SMS রিলে যাচাইকরণ সিস্টেমের নিরবচ্ছিন্ন কার্যকারিতা সম্পূর্ণরূপে মার্চেন্টের একটি নিবেদিত অ্যান্ড্রয়েড ডিভাইস বজায় রাখার উপর নির্ভরশীল। Xelpay ডিভাইস পাওয়ার লস, মোবাইল নেটওয়ার্ক অস্থিতিশীলতা, আক্রমণাত্মক ব্যাটারি অপ্টিমাইজেশন, বা কোনো প্রস্তুতকারক-নির্দিষ্ট ব্যাকগ্রাউন্ড অ্যাপ বিধিনিষেধের কারণে কোনো মিসড বা ব্যর্থ পেমেন্ট যাচাইকরণের জন্য <strong>সম্পূর্ণরূপে শূন্য দায় বহন করে</strong>।
              </InfoBox>
            </div>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">MFS SMS ফরম্যাট পরিবর্তন ও যাচাইকরণ ব্যর্থতা:</strong> Xelpay-এর স্বয়ংক্রিয় পেমেন্ট যাচাইকরণ ইঞ্জিন পরিচিত SMS টেমপ্লেট ফরম্যাটের উপর ভিত্তি করে MFS অপারেটরদের কাছ থেকে আসা SMS বিজ্ঞপ্তি পার্স করে। MFS অপারেটররা তাদের SMS বিজ্ঞপ্তি টেমপ্লেট পরিবর্তন করতে পারে, যা সাময়িকভাবে Xelpay-এর পার্সিং ইঞ্জিনকে ট্রানজেকশন ডেটা সঠিকভাবে বের করতে অক্ষম করতে পারে। <strong className="text-slate-800 dark:text-slate-200">Xelpay এই সময়কালে কোনো অযাচাইকৃত বা মিসড পেমেন্ট লেনদেনের জন্য সম্পূর্ণরূপে শূন্য দায় বহন করে।</strong>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS স্পুফিং ও ফলস পজিটিভ যাচাইকরণ:</strong> Xelpay-এর যাচাইকরণ ইঞ্জিন সম্পূর্ণরূপে মার্চেন্টের নিবন্ধিত রিলে ডিভাইসে প্রাপ্ত SMS বিজ্ঞপ্তির উপর ভিত্তি করে পরিচালিত হয়।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় — SMS স্পুফিং ও ফলস পজিটিভ</strong>
                যদি কোনো ব্যক্তি একটি বৈধ MFS পেমেন্ট বিজ্ঞপ্তির অনুকরণকারী একটি জাল SMS বার্তা প্রেরণ করে এবং Xelpay-এর সিস্টেম সেই জাল SMS কে একটি বৈধ পেমেন্ট হিসেবে প্রক্রিয়া করে ("ফলস পজিটিভ"), তাহলে <strong>Xelpay কোনোভাবেই আইনগত, আর্থিক বা অপারেশনাল দায় বহন করে না।</strong> উচ্চ-মূল্যের লেনদেনের জন্য স্বাধীন যাচাই পদ্ধতি বাস্তবায়ন করা সম্পূর্ণরূপে মার্চেন্টের দায়িত্ব।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের সেবার প্রাপ্যতা:</strong> Xelpay সংযুক্ত তৃতীয় পক্ষের সেবার (Telegram, MFS প্রদানকারী, ব্যাংক ইত্যাদি) ক্রমাগত প্রাপ্যতার নিশ্চয়তা দেয় না। এই সেবাগুলির ডাউনটাইম আমাদের নিয়ন্ত্রণের বাইরে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ওয়েবহুক ডেলিভারি ও মার্চেন্ট সার্ভার আউটেজ:</strong> Xelpay আপনার কনফিগার করা এন্ডপয়েন্টে ওয়েবহুক পেলোড ডেলিভার করার সর্বোত্তম প্রচেষ্টা করে। মার্চেন্টের সার্ভার ডাউনটাইম বা ভুল কনফিগারেশনের কারণে স্থায়ীভাবে মিসড ওয়েবহুক ডেলিভারির ফলে যেকোনো ব্যবসায়িক ক্ষতির জন্য Xelpay কোনো দায় বহন করে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৮. সেবার স্তর, আপটাইম ও ডাউনটাইম" icon={Server} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">আপটাইম গ্যারান্টি নেই:</strong> Xelpay সর্বোচ্চ প্রাপ্যতার জন্য প্রচেষ্টা করলেও, আমরা কোনো আনুষ্ঠানিক SLA বা আপটাইম গ্যারান্টি প্রদান করি না। সেবাটি সর্বোত্তম প্রচেষ্টার ভিত্তিতে প্রদান করা হয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">নির্ধারিত রক্ষণাবেক্ষণ:</strong> Xelpay নির্ধারিত রক্ষণাবেক্ষণের জন্য প্ল্যাটফর্ম অফলাইন নিতে পারে। যেখানে যুক্তিসংগতভাবে সম্ভব, ড্যাশবোর্ড সতর্কতা বা ইমেইলের মাধ্যমে বিজ্ঞপ্তি দেওয়া হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ডাউনটাইমের জন্য কোনো দায় নেই:</strong> পরিকল্পিত বা অপরিকল্পিত সেবা বিঘ্নের ফলে রাজস্ব হারানো, ব্যবসায়িক সুযোগ হারানো বা ক্ষতির জন্য Xelpay দায়ী থাকবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৯. সমাপ্তি ও স্থগিতাদেশের অধিকার" icon={AlertCircle} accent="red">
        <p>Xelpay যেকোনো সময়, পূর্ব বিজ্ঞপ্তি সহ বা ছাড়াই, আপনার অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট API অ্যাক্সেস <strong className="text-slate-800 dark:text-slate-200">স্থগিত বা স্থায়ীভাবে বাতিল</strong> করার একতরফা অধিকার সংরক্ষণ করে, যদি আমরা:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li>এই শর্তাবলী বা আমাদের গ্রহণযোগ্য ব্যবহার নীতির কোনো লঙ্ঘনের সন্দেহ করি।</li>
          <li>আপনার অ্যাকাউন্টে অস্বাভাবিক, সন্দেহজনক বা সম্ভাব্য প্রতারণামূলক কার্যকলাপ সনাক্ত করি।</li>
          <li>প্রযোজ্য আইন, আদালতের আদেশ বা নিয়ন্ত্রক কর্তৃপক্ষ দ্বারা আমাদের তা করতে হয়।</li>
          <li>ধারা ১৫ অনুযায়ী মার্চেন্ট KYC/ব্যবসা যাচাইকরণ অনুরোধ মেনে নেননি বলে নির্ধারণ করি।</li>
        </ul>
        <p className="mt-3">সমাপ্তির পরে, প্ল্যাটফর্মে আপনার অ্যাক্সেসের অধিকার তাৎক্ষণিকভাবে বন্ধ হয়ে যায়। নীতি লঙ্ঘনের কারণে নিষিদ্ধ হলে কোনো অবশিষ্ট সাবস্ক্রিপশন সময়ের জন্য কোনো ফেরত ইস্যু করা হবে না।</p>
        <p className="mt-3">আপনি যেকোনো সময় আমাদের সাপোর্ট চ্যানেলের মাধ্যমে একটি আনুষ্ঠানিক অনুরোধ জমা দিয়ে স্বেচ্ছায় আপনার অ্যাকাউন্ট বন্ধ করতে পারেন। স্বেচ্ছায় সমাপ্তি আপনাকে কোনো প্রি-পেইড সাবস্ক্রিপশন পরিমাণের ফেরত পাওয়ার অধিকার দেয় না।</p>
      </SectionBlock>

      <SectionBlock title="১০. ফোর্স ম্যাজর, দায়ের সীমাবদ্ধতা ও ক্ষতিপূরণ" icon={Scale} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">ফোর্স ম্যাজর:</strong> আমাদের যুক্তিসংগত নিয়ন্ত্রণের বাইরের পরিস্থিতির কারণে কোনো ব্যর্থতা বা বিলম্বের জন্য Xelpay দায়ী থাকবে না, যার মধ্যে রয়েছে: প্রাকৃতিক দুর্যোগ, ইন্টারনেট শাটডাউন, জাতীয় টেলিকম বিভ্রাট, তৃতীয় পক্ষের সার্ভার ব্যর্থতা, সাইবার আক্রমণ, পাওয়ার আউটেজ, মহামারী, ধর্মঘট, বা সরকার-নির্দেশিত বিধিনিষেধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">MFS/ব্যাংক অ্যাকাউন্ট পদক্ষেপের দায়ের সীমাবদ্ধতা:</strong> কোনো আইনি কাঠামোর অধীনে Xelpay, এর প্রতিষ্ঠাতা, পরিচালক বা Xenverse IT কে আপনার ব্যক্তিগত বা ব্যবসায়িক MFS/ব্যাংক অ্যাকাউন্ট পতাকাঙ্কিত, সীমাবদ্ধ, হিমায়িত বা স্থগিত হওয়ার জন্য দায়ী করা যাবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সাধারণ দায়ের সীমা:</strong> কোনো পরিস্থিতিতেই সেবার সাথে সম্পর্কিত সমস্ত দাবির জন্য Xelpay-এর মোট দায় দাবির তারিখের ঠিক আগের এক (১) মাসে আপনার দেওয়া মোট পরিমাণের বেশি হবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পরিণামগত ক্ষতির বর্জন:</strong> Xelpay কোনো পরোক্ষ, আকস্মিক, বিশেষ, পরিণামগত বা শাস্তিমূলক ক্ষতির জন্য দায়ী থাকবে না — যার মধ্যে রয়েছে মুনাফা হারানো, ডেটা হারানো বা ব্যবসায়িক বিঘ্ন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ক্ষতিপূরণ:</strong> আপনি Xelpay, Xenverse IT এবং তাদের কর্মকর্তা, পরিচালক, কর্মচারী এবং এজেন্টদের রক্ষা করতে এবং ক্ষতিপূরণ দিতে সম্মত হচ্ছেন: (a) প্ল্যাটফর্মের আপনার ব্যবহার বা অপব্যবহার; (b) এই শর্তাবলীর আপনার লঙ্ঘন; (c) প্রযোজ্য আইনের আপনার লঙ্ঘন; (d) আপনার ব্যবসায়িক কার্যক্রম থেকে উদ্ভূত দাবির জন্য।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১১. বিরোধ নিষ্পত্তি, সালিশি ও শ্রেণী-অ্যাকশন ত্যাগ" icon={Gavel} accent="purple">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">প্রথমে অনানুষ্ঠানিক সমাধান:</strong> কোনো আনুষ্ঠানিক আইনি দাবি দায়ের করার আগে, আপনি লিখিত নোটিশের ৩০ দিনের মধ্যে সদিচ্ছার ভিত্তিতে বিরোধটি সৌহার্দ্যপূর্ণভাবে সমাধান করার একটি সত্যিকারের প্রচেষ্টা করতে সম্মত হচ্ছেন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">শ্রেণী-অ্যাকশন ত্যাগ:</strong> আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে Xelpay-এর বিরুদ্ধে যেকোনো বিরোধ বা দাবি শুধুমাত্র আপনার ব্যক্তিগত ক্ষমতায় আনতে হবে, কোনো শ্রেণী অ্যাকশন বা প্রতিনিধি কার্যক্রমে বাদী বা শ্রেণী সদস্য হিসেবে নয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক সালিশি (প্রযোজ্য ক্ষেত্রে):</strong> আন্তর্জাতিক ব্যবহারকারীদের জন্য, যেখানে স্থানীয় আইন দ্বারা অনুমোদিত, আপনি সম্মত হচ্ছেন যে অনানুষ্ঠানিকভাবে সমাধান না হওয়া বিরোধগুলি আদালতে নয়, বাধ্যতামূলক সালিশিতে জমা দেওয়া হবে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১২. প্রযোজ্য আইন, এখতিয়ার ও বিভাজ্যতা" icon={Building2} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">প্রযোজ্য আইন:</strong> এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন দ্বারা একচেটিয়াভাবে পরিচালিত হবে, যার মধ্যে চুক্তি আইন, ১৮৭২; তথ্য ও যোগাযোগ প্রযুক্তি আইন, ২০০৬; ডিজিটাল নিরাপত্তা আইন, ২০১৮; এবং সমস্ত প্রযোজ্য বাংলাদেশ ব্যাংকের বিধিমালা অন্তর্ভুক্ত।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">এখতিয়ার:</strong> এই শর্তাবলীর অধীনে উদ্ভূত যেকোনো বিরোধ বাংলাদেশের মধ্যে অবস্থিত উপযুক্ত কর্তৃপক্ষের আদালতের একচেটিয়া এখতিয়ারের অধীন হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বিভাজ্যতা:</strong> যদি এই শর্তাবলীর কোনো বিধান অপ্রয়োগযোগ্য বা অবৈধ পাওয়া যায়, তাহলে সেই নির্দিষ্ট বিধানটি সীমাবদ্ধ করা হবে এবং অবশিষ্ট বিধানগুলি সম্পূর্ণ কার্যকর থাকবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সম্পূর্ণ চুক্তি:</strong> এই শর্তাবলী, আমাদের গোপনীয়তা নীতির সাথে, প্ল্যাটফর্ম ব্যবহার সম্পর্কে আপনার এবং Xelpay-এর মধ্যে সম্পূর্ণ চুক্তি গঠন করে এবং সমস্ত পূর্ববর্তী চুক্তিকে প্রতিস্থাপন করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ছাড়:</strong> এই শর্তাবলীর কোনো অধিকার বা বিধান প্রয়োগ করতে Xelpay-এর ব্যর্থতা সেই অধিকার বা বিধানের ছাড় হিসেবে গণ্য হবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৩. অ্যাফিলিয়েট প্রোগ্রামের শর্তাবলী" icon={Users} accent="green">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">যোগ্যতা:</strong> Xelpay অ্যাফিলিয়েট প্রোগ্রামে অংশগ্রহণ সুস্থ অবস্থায় নিবন্ধিত মার্চেন্টদের জন্য উন্মুক্ত। Xelpay তার একান্ত বিবেচনায় অ্যাফিলিয়েট আবেদন অনুমোদন বা প্রত্যাখ্যান করার অধিকার সংরক্ষণ করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">কমিশন কাঠামো:</strong> অ্যাফিলিয়েট কমিশন প্রোগ্রামের বর্তমান রেট কাঠামোর উপর ভিত্তি করে গণনা করা হয়, যা Xelpay যুক্তিসংগত বিজ্ঞপ্তি সহ যেকোনো সময় পরিবর্তন করতে পারে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ প্রচার পদ্ধতি:</strong> অ্যাফিলিয়েটদের অবশ্যই রেফারেল তৈরি করতে বিভ্রান্তিকর বিজ্ঞাপন, স্প্যাম, জাল পর্যালোচনা, বা যেকোনো প্রতারণামূলক পদ্ধতিতে নিযুক্ত হওয়া উচিত নয়। লঙ্ঘনের ফলে তাৎক্ষণিক অযোগ্যতা এবং মুলতুবি কমিশন বাজেয়াপ্ত হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">স্ব-রেফারেল নিষিদ্ধ:</strong> ব্যক্তিগত লাভের জন্য গৌণ অ্যাকাউন্ট সাইন আপ করতে আপনার নিজের রেফারেল লিঙ্ক ব্যবহার করা কঠোরভাবে নিষিদ্ধ এবং প্রতারণা গঠন করে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">কমিশন বাজেয়াপ্তি:</strong> প্রতারণামূলক রেফারেল, চার্জব্যাক বা আমাদের AUP লঙ্ঘনকারী রেফার করা অ্যাকাউন্টের মাধ্যমে অর্জিত কমিশন বাজেয়াপ্ত করা হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট থ্রেশহোল্ড:</strong> অ্যাফিলিয়েট কমিশন অ্যাফিলিয়েট ড্যাশবোর্ডে বর্ণিত সর্বনিম্ন থ্রেশহোল্ডে পৌঁছানোর পরে বিতরণ করা হয় এবং প্রযোজ্য ট্যাক্স উইথহোল্ডিং সাপেক্ষে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৪. পেমেন্ট লিঙ্ক ও চেকআউট পেজ" icon={CreditCard} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের দায়িত্ব:</strong> Xelpay-এর মাধ্যমে তৈরি পেমেন্ট পেজে তালিকাভুক্ত সমস্ত পণ্য, সেবা, মূল্য এবং বিবরণের নির্ভুলতা, আইনসম্মততা এবং উপযুক্ততার জন্য আপনি সম্পূর্ণরূপে দায়ী। Xelpay শুধুমাত্র প্রযুক্তিগত অবকাঠামো; আমরা আপনার এবং আপনার গ্রাহকদের মধ্যে বাণিজ্যিক লেনদেনের পক্ষ নই।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">চেকআউট পেজে গ্রাহকের ডেটা:</strong> আপনার Xelpay-চালিত চেকআউট পেজে আপনার গ্রাহকরা যে ব্যক্তিগত ডেটা জমা দেন তা এই গোপনীয়তা নীতি অনুযায়ী প্রক্রিয়া করা হয়। আপনাকে অবশ্যই নিশ্চিত করতে হবে যে আপনার নিজের গ্রাহকরা তাদের ডেটা কীভাবে পরিচালনা করা হয় তা সম্পর্কে সচেতন।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট লিঙ্কে নিষিদ্ধ বিষয়বস্তু:</strong> পেমেন্ট লিঙ্কগুলি ধারা ৬ (AUP)-এ উল্লিখিত নিষিদ্ধ, অবৈধ বা প্রতারণামূলক উদ্দেশ্যে অর্থ সংগ্রহ করতে ব্যবহার করা যাবে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৫. KYC ও ব্যবসা যাচাইকরণ" icon={Fingerprint} accent="orange">
        <p>বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU) নির্দেশিকা, মানি লন্ডারিং বিরোধী (AML) বিধিমালা, মানি লন্ডারিং প্রতিরোধ আইন, ২০১২, এবং সন্ত্রাসবিরোধী আইন, ২০০৯ (বাংলাদেশ) সহ কঠোর মেনে চলার জন্য, Xelpay মার্চেন্ট অ্যাকাউন্টের যেকোনো পর্যায়ে KYC (গ্রাহককে জানুন) এবং ব্যবসা যাচাইকরণ প্রক্রিয়া পরিচালনার অধিকার সংরক্ষণ করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">অনুরোধকৃত দলিলপত্র:</strong> Xelpay আনুষ্ঠানিকভাবে অনুরোধ করতে পারে: বৈধ ট্রেড লাইসেন্স বা ব্যবসা নিবন্ধন সার্টিফিকেট, জাতীয় পরিচয়পত্র (NID), TIN সার্টিফিকেট, প্রাসঙ্গিক ব্যাংক অ্যাকাউন্টের বিবরণ, এবং/অথবা Xelpay-এর কমপ্লায়েন্স টিম দ্বারা যুক্তিসংগতভাবে প্রয়োজনীয় যেকোনো অন্যান্য সহায়ক দলিল।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক কমপ্লায়েন্স বাধ্যবাধকতা:</strong> মার্চেন্ট নির্দিষ্ট সময়সীমার মধ্যে (কমপক্ষে ৭২ ঘণ্টা) যেকোনো KYC যাচাইকরণ অনুরোধে সাড়া দিতে আইনগতভাবে বাধ্য। জাল বা প্রতারণামূলকভাবে প্রাপ্ত দলিল জমা দেওয়া বাংলাদেশের আইনে একটি গুরুতর ফৌজদারি অপরাধ গঠন করে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">অ-কমপ্লায়েন্সের পরিণতি:</strong> অনুরোধকৃত KYC দলিলপত্র প্রদানে ব্যর্থতা বা অস্বীকৃতি মার্চেন্টের অ্যাকাউন্ট এবং সমস্ত API অ্যাক্সেসের তাৎক্ষণিক স্থগিতাদেশের ফলে হবে।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">KYC-ট্রিগার্ড স্থগিতাদেশে কোনো ফেরত নেই</strong>
                KYC বা ব্যবসা যাচাইকরণ অনুরোধে অ-কমপ্লায়েন্স থেকে উদ্ভূত অ্যাকাউন্ট স্থগিতাদেশ বা সমাপ্তি মার্চেন্টকে প্রি-পেইড সাবস্ক্রিপশন ফি বা অ্যাড-অন চার্জের কোনো ফেরত পাওয়ার অধিকার দেয় না।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">KYC দলিলপত্রের ডেটা পরিচালনা:</strong> Xelpay-এ জমা দেওয়া সমস্ত KYC দলিলপত্র আমাদের গোপনীয়তা নীতি অনুযায়ী কঠোরভাবে পরিচালিত ও সংরক্ষিত হয় এবং শুধুমাত্র Xelpay-এর অনুমোদিত কমপ্লায়েন্স কর্মীদের দ্বারা সীমিত প্রয়োজনের ভিত্তিতে অ্যাক্সেস করা যায়।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৬. বিপরীত লেনদেন, MFS ক্ল্যাওব্যাক ও অপারেটর বিরোধ" icon={ShieldAlert} accent="red">
        <p>Xelpay-এর ভূমিকা কঠোরভাবে একটি প্রযুক্তিগত যাচাইকরণ মধ্যস্থতাকারীর মধ্যে সীমাবদ্ধ। প্ল্যাটফর্ম পেমেন্ট বিজ্ঞপ্তি প্রাপ্তি নিশ্চিত করে এবং সংশ্লিষ্ট ওয়েবহুক ফায়ার করে; এটি কোনো অন্তর্নিহিত আর্থিক লেনদেনের চূড়ান্ততা, স্থায়িত্ব বা অপরিবর্তনীয়তার নিশ্চয়তা দেয় না।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">নিরঙ্কুশ শূন্য দায় — বিপরীত লেনদেন, ক্ল্যাওব্যাক ও অপারেটর বিরোধ</strong>
          যদি Xelpay-এর সিস্টেম দ্বারা পূর্বে যাচাইকৃত কোনো পেমেন্ট লেনদেন পরবর্তীতে সংশ্লিষ্ট MFS অপারেটর (যেমন bKash, Nagad, Rocket), ব্যাংক বা কোনো যোগ্য আর্থিক বা নিয়ন্ত্রক কর্তৃপক্ষ দ্বারা বিপরীত, প্রত্যাহার, হিমায়িত, বিতর্কিত বা ক্ল্যাওব্যাক করা হয় — <strong>Xelpay মার্চেন্টের সরবরাহকৃত পণ্য, প্রদান করা সেবা বা ভোগান্তির কোনো আর্থিক ক্ষতির জন্য সম্পূর্ণরূপে শূন্য দায় বহন করে।</strong>
        </InfoBox>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের স্বাধীন ঝুঁকি বাধ্যবাধকতা:</strong> উচ্চ-মূল্যের পণ্য, সেবা বা অপরিবর্তনীয় ডিজিটাল ডেলিভারেবল মুক্ত করার আগে Xelpay-এর স্বয়ংক্রিয় যাচাইকরণের থেকে স্বাধীনভাবে নিজস্ব প্রতারণা প্রতিরোধ এবং ঝুঁকি ব্যবস্থাপনা নীতি বজায় রাখা মার্চেন্টের একান্ত দায়িত্ব।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্ট ও গ্রাহকের মধ্যে বিরোধ নিষ্পত্তি:</strong> মার্চেন্টের শেষ গ্রাহক কর্তৃক শুরু করা যেকোনো পেমেন্ট বিরোধ, ফেরতের অনুরোধ বা চার্জব্যাক সম্পূর্ণরূপে মার্চেন্ট এবং তাদের গ্রাহকের মধ্যে একটি বিষয়। Xelpay এই ধরনের বিরোধের পক্ষ নয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তদন্তে সহযোগিতা:</strong> উপরোক্ত দায়ের সীমাবদ্ধতা সত্ত্বেও, Xelpay আইনগতভাবে প্রয়োজন বা অপারেশনালভাবে সম্ভব হলে বিতর্কিত লেনদেন সম্পর্কিত অনুমোদিত নিয়ন্ত্রক এবং আইন প্রয়োগকারী তদন্তে সহযোগিতা করবে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৭. কঠোর B2B সেবা — কোনো শেষ গ্রাহক সহায়তার বাধ্যবাধকতা নেই" icon={Users} accent="purple">
        <p>Xelpay একটি একচেটিয়া <strong className="text-slate-800 dark:text-slate-200">ব্যবসা-থেকে-ব্যবসায় (B2B)</strong> প্রযুক্তি প্ল্যাটফর্ম। এই শর্তাবলী দ্বারা প্রতিষ্ঠিত চুক্তিগত সম্পর্ক সম্পূর্ণরূপে Xelpay (Xenverse IT) এবং নিবন্ধিত মার্চেন্ট সত্তার মধ্যে বিদ্যমান।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">শেষ গ্রাহকের সাথে কোনো সরাসরি সম্পর্ক নেই:</strong> Xelpay-এর মার্চেন্টের Xelpay-চালিত পেমেন্ট ইন্টারফেস বা চেকআউট পেজের মাধ্যমে লেনদেন করা যেকোনো শেষ গ্রাহক, ক্রেতা বা তৃতীয় পক্ষের সাথে কোনো সরাসরি আইনি, চুক্তিভিত্তিক, বাণিজ্যিক বা আর্থিক সম্পর্ক নেই।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">শেষ গ্রাহকদের জন্য কোনো সহায়তার বাধ্যবাধকতা নেই:</strong> Xelpay মার্চেন্টের শেষ গ্রাহক কর্তৃক সরাসরি জমা দেওয়া কোনো সহায়তা অনুরোধ, অভিযোগ বা দাবিতে সাড়া দিতে, তদন্ত করতে বা সমাধান করতে <strong>আইনগতভাবে বা চুক্তিগতভাবে মোটেও বাধ্য নয়।</strong>
            <div className="mt-3">
              <InfoBox type="info">
                <strong>মার্চেন্টের দায়িত্ব:</strong> পর্যাপ্ত গ্রাহক সহায়তা প্রদান করা, নিজের ফেরত নীতি সম্মান করা এবং শেষ গ্রাহকদের সাথে সরাসরি সমস্ত বিরোধ নিষ্পত্তি করা মার্চেন্টের একান্ত এবং একচেটিয়া আইনগত দায়িত্ব।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">শেষ গ্রাহকের দাবির জন্য মার্চেন্টের ক্ষতিপূরণ:</strong> মার্চেন্ট স্পষ্টভাবে তার বাণিজ্যিক কার্যক্রম থেকে উদ্ভূত মার্চেন্টের শেষ গ্রাহকদের যেকোনো দাবি, মামলা বা আইনি কার্যক্রম থেকে Xelpay কে রক্ষা করতে এবং ক্ষতিপূরণ দিতে সম্মত।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="১৮. ওয়েবহুক আইডেম্পোটেন্সি ও ডবল-ক্রেডিটিং প্রতিরোধ" icon={Zap} accent="purple">
        <p>Xelpay-এর ওয়েবহুক ডেলিভারি সিস্টেম যাচাইকৃত লেনদেনের ঘটনায় পেমেন্ট নিশ্চিতকরণ পেলোড প্রেরণ করতে ইঞ্জিনিয়ার করা হয়েছে। তবে, নেটওয়ার্ক টাইমআউট বা ক্ষণস্থায়ী কানেক্টিভিটি ব্যর্থতার পরিস্থিতিতে, Xelpay-এর সিস্টেম একটি বা একাধিক বার একই ওয়েবহুক পেলোড পুনরায় ডেলিভার করার চেষ্টা করতে পারে।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">নিরঙ্কুশ মার্চেন্টের দায়িত্ব — আইডেম্পোটেন্সি বাস্তবায়ন</strong>
          মার্চেন্টের ডেভেলপমেন্ট টিমের <strong>নিরঙ্কুশ, অ-প্রত্যায়নযোগ্য এবং একমাত্র প্রযুক্তিগত ও আইনগত দায়িত্ব</strong> হলো তাদের ওয়েবহুক রিসিভার এন্ডপয়েন্টের মধ্যে শক্তিশালী <strong>আইডেম্পোটেন্সি লজিক</strong> বাস্তবায়ন করা। আইডেম্পোটেন্সি মানে মার্চেন্টের সিস্টেমকে আর্কিটেকচারালভাবে ডুপ্লিকেট ওয়েবহুক ডেলিভারি চিনতে এবং বাদ দিতে ডিজাইন করতে হবে। মার্চেন্টের ব্যর্থতার ফলে যেকোনো ডবল-ক্রেডিটিং বা ডুপ্লিকেট অর্ডার পূরণের জন্য Xelpay <strong>সম্পূর্ণরূপে শূন্য আইনগত, আর্থিক বা অপারেশনাল দায় বহন করে।</strong>
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="১৯. নিয়ন্ত্রক শাটডাউন, সরকারি নির্দেশিকা ও সেবা বৈশিষ্ট্যে ফোর্স ম্যাজর" icon={Building2} accent="red">
        <p>Xelpay একটি নিয়ন্ত্রিত এবং দ্রুত বিকশিত প্রযুক্তিগত ও নিয়ন্ত্রক পরিবেশে পরিচালিত হয়। Xelpay-এর বেশ কয়েকটি মূল যাচাইকরণ ক্ষমতা — বিশেষ করে SMS-পাঠ স্বয়ংক্রিয়করণ, IMAP-ভিত্তিক ব্যাংক ইমেইল স্ক্র্যাপিং এবং পার্সিং — নিয়ন্ত্রক অনুমতির উপর নির্ভর করে।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় ও শূন্য ফেরত — নিয়ন্ত্রক শাটডাউন</strong>
          যেকোনো নিয়ন্ত্রক-নির্দেশিত স্থগিতাদেশ, পরিবর্তন বা যেকোনো সেবা বৈশিষ্ট্যের স্থায়ী বন্ধের সাথে সম্পর্কিত — Xelpay কোনো প্রকৃতির <strong>সম্পূর্ণরূপে শূন্য আইনগত বা আর্থিক দায় বহন করবে</strong> — এবং মার্চেন্টকে কোনো ফেরত, সেবা ক্রেডিট বা ক্ষতিপূরণ প্রদেয় হবে না। মার্চেন্ট স্পষ্টভাবে স্বীকার করে যে নিয়ন্ত্রক পরিবর্তনের ঝুঁকি এই শর্তাবলীর অধীনে ফোর্স ম্যাজর ঘটনা হিসেবে গণ্য করা হবে।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="২০. প্রচার ও বিপণন অধিকার" icon={Users} accent="green">
        <p>Xelpay মার্চেন্ট অ্যাকাউন্ট নিবন্ধন করে এবং সক্রিয়ভাবে Xelpay প্ল্যাটফর্ম ব্যবহার করে, আপনি Xelpay (Xenverse IT) কে একটি <strong className="text-slate-800 dark:text-slate-200">অ-একচেটিয়া, রয়্যালটি-মুক্ত, বিশ্বব্যাপী, স্থায়ী (অপ্ট-আউট পর্যন্ত), সাবলাইসেন্সযোগ্য লাইসেন্স</strong> প্রদান করছেন আপনার নিবন্ধিত ব্যবসার নাম, সম্পর্কিত ব্র্যান্ড নাম এবং অফিসিয়াল ব্যবসায়িক লোগো বিপণন উপকরণ, কেস স্টাডি, প্রচারমূলক ব্লগ পোস্ট, সোশ্যাল মিডিয়া কন্টেন্ট এবং বিক্রয় উপকরণে ব্যবহার, প্রদর্শন এবং পুনরুৎপাদন করার জন্য।</p>
        <InfoBox type="info">
          <strong>অপ্ট-আউটের অধিকার:</strong> যদি আপনি চান না যে আপনার ব্যবসার নাম, ব্র্যান্ড বা লোগো কোনো প্রচারমূলক প্রসঙ্গে ব্যবহার করা হোক, আপনি যেকোনো সময় আনুষ্ঠানিক লিখিত অপ্ট-আউট অনুরোধ জমা দিয়ে আপনার অপ্ট-আউটের অধিকার প্রয়োগ করতে পারেন। একটি বৈধ অপ্ট-আউট অনুরোধ প্রাপ্তি ও প্রক্রিয়াকরণের পরে, Xelpay বাণিজ্যিকভাবে যুক্তিসংগত সময়সীমার মধ্যে নতুন প্রচারমূলক উপকরণে আপনার ব্র্যান্ড সম্পদ ব্যবহার বন্ধ করবে।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="২১. অ্যাকাউন্ট অ-হস্তান্তরযোগ্যতা" icon={Lock} accent="red">
        <p>Xelpay মার্চেন্ট অ্যাকাউন্টগুলি নির্দিষ্ট নিবন্ধিত ব্যবসায়িক সত্তা বা ব্যক্তিগত একক মালিকের জন্য জারি করা হয় এবং তারই একচেটিয়া ব্যবহারের জন্য। Xelpay অ্যাকাউন্টগুলি সর্বদা <strong className="text-slate-800 dark:text-slate-200">কঠোরভাবে এবং নিরঙ্কুশভাবে অ-হস্তান্তরযোগ্য</strong>।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ হস্তান্তর কার্যক্রম:</strong> মার্চেন্টদের স্পষ্টভাবে বিক্রি করা, হস্তান্তর করা, অর্পণ করা, ইজারা দেওয়া, ভাড়া দেওয়া, সাবলাইসেন্স করা, উপহার দেওয়া বা যেকোনো উপায়ে তাদের Xelpay মার্চেন্ট অ্যাকাউন্ট, সংশ্লিষ্ট API কী, ওয়েবহুক সিক্রেট বা যেকোনো অ্যাকাউন্ট ক্রেডেনশিয়ালের মালিকানা, অ্যাক্সেস বা নিয়ন্ত্রণ যেকোনো তৃতীয় পক্ষের কাছে হস্তান্তর করা থেকে নিষিদ্ধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক উত্তরাধিকার:</strong> একটি বৈধ ব্যবসায়িক অধিগ্রহণ, একীভূতকরণ বা উপকারী মালিকানা পরিবর্তনের ক্ষেত্রে, মার্চেন্টকে অবশ্যই এই ধরনের লেনদেন সম্পন্ন করার আগে Xelpay কে লিখিতভাবে অবহিত করতে হবে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">প্রয়োগ — তাৎক্ষণিক আজীবন নিষিদ্ধ:</strong> একটি Xelpay মার্চেন্ট অ্যাকাউন্টের যেকোনো অননুমোদিত হস্তান্তর একটি গুরুতর, তাৎক্ষণিক নিরাপত্তা এবং AML কমপ্লায়েন্স লঙ্ঘন হিসেবে গণ্য হবে।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">AML ঝুঁকি — শূন্য সহনশীলতা</strong>
                অ্যাকাউন্ট হস্তান্তরের উপর কঠোর নিষেধাজ্ঞা একটি মূল AML কমপ্লায়েন্স নিয়ন্ত্রণ। অননুমোদিত অ্যাকাউন্ট হস্তান্তর উপকারী মালিকানা অস্পষ্ট করে এবং বাংলাদেশি আইনের অধীনে Xelpay আইনগতভাবে প্রতিরোধ করতে বাধ্য অগ্রহণযোগ্য মানি লন্ডারিং এবং প্রতারণার ঝুঁকি তৈরি করে। অননুমোদিত হস্তান্তরের কারণে অ্যাকাউন্ট বাতিলের পর কোনো ফেরত ইস্যু করা হবে না।
              </InfoBox>
            </div>
          </li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২২. অন্তর্নিহিত MFS, ব্যাংক ও তৃতীয় পক্ষের লেনদেন ফি" icon={CreditCard} accent="amber">
        <p>Xelpay-এর সাবস্ক্রিপশন ফি একচেটিয়াভাবে Xelpay-এর মালিকানাধীন সফটওয়্যার অবকাঠামো, পেমেন্ট যাচাইকরণ ইঞ্জিন, API সেবা, ড্যাশবোর্ড এবং সংশ্লিষ্ট প্রযুক্তিগত সহায়তার অ্যাক্সেস এবং ব্যবহার কভার করে। এই ফিগুলি মার্চেন্ট বা তাদের গ্রাহকদের দ্বারা পরিচালিত অন্তর্নিহিত আর্থিক লেনদেনের সাথে সম্পর্কিত কোনো তৃতীয় পক্ষের ফি, চার্জ বা খরচ কভার করে <strong className="text-slate-800 dark:text-slate-200">না</strong>।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের ফির জন্য মার্চেন্টের একক দায়িত্ব:</strong> মার্চেন্ট সম্পূর্ণরূপে এবং একচেটিয়াভাবে তৃতীয় পক্ষের আর্থিক সেবা প্রদানকারীদের দ্বারা আরোপিত সমস্ত খরচ এবং ফি বহন করার জন্য দায়ী, যার মধ্যে রয়েছে: MFS ক্যাশ-আউট চার্জ; MFS P2P পাঠানোর অর্থ ফি; ব্যাংক-থেকে-ব্যাংক ট্রান্সফার ফি এবং BEFTN/RTGS চার্জ; আন্তর্জাতিক পেমেন্ট গেটওয়ে প্রসেসিং ফি; এবং সমস্ত প্রযোজ্য কর, লেভি, VAT বা শুল্ক।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তৃতীয় পক্ষের দ্বারা ফি কাঠামো পরিবর্তন:</strong> যেকোনো MFS অপারেটর, ব্যাংক বা পেমেন্ট গেটওয়ে প্রদানকারীর ফি কাঠামো, মূল্য নীতি বা সেবার শর্তাবলীর উপর Xelpay-এর কোনো নিয়ন্ত্রণ নেই। তৃতীয় পক্ষের ফি পরিবর্তন Xelpay-এর কর্তৃত্বের বাইরে এবং Xelpay-এর সাবস্ক্রিপশন ফি হ্রাস বা কোনো ফেরতের ভিত্তি হবে না।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ফি যাচাই করার মার্চেন্টের বাধ্যবাধকতা:</strong> Xelpay প্ল্যাটফর্মের সাথে একযোগে ব্যবহৃত সমস্ত তৃতীয় পক্ষের আর্থিক সেবা প্রদানকারীদের ফি সময়সূচি স্বাধীনভাবে যাচাই করা এবং সর্বশেষ রাখা মার্চেন্টের একক দায়িত্ব।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৩. ড্যাশবোর্ড লগ সংরক্ষণের সীমা ও ডেটা রপ্তানির দায়িত্ব" icon={Database} accent="amber">
        <p>সর্বোত্তম সার্ভার পারফরম্যান্স বজায় রাখতে, Xelpay-এর মার্চেন্ট ড্যাশবোর্ড একটি <strong className="text-slate-800 dark:text-slate-200">সীমিত রোলিং উইন্ডো ভিত্তিতে</strong> সক্রিয় লেনদেন লগ, অর্ডার ইতিহাস এবং সংশ্লিষ্ট অপারেশনাল ডেটা প্রদর্শন করে। ডিফল্টরূপে, ড্যাশবোর্ড সবচেয়ে সাম্প্রতিক <strong className="text-slate-800 dark:text-slate-200">নব্বই (৯০) ক্যালেন্ডার দিনের</strong> জন্য লেনদেন এবং অপারেশনাল লগ প্রদর্শন করবে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের ডেটা রপ্তানির দায়িত্ব:</strong> মার্চেন্টের নিজস্ব ব্যবসায়িক অ্যাকাউন্টিং, সমঝোতা, কর সম্মতি, অডিটিং বা বিরোধ নিষ্পত্তির উদ্দেশ্যে তাদের প্রয়োজনীয় লেনদেন ডেটা, অর্ডার লগ এবং যেকোনো অন্যান্য অপারেশনাল রেকর্ড নিয়মিত এবং সক্রিয়ভাবে রপ্তানি করা মার্চেন্টের একান্ত এবং সম্পূর্ণ দায়িত্ব।
            <div className="mt-3">
              <InfoBox type="warning">
                <strong>সুপারিশ:</strong> Xelpay দৃঢ়ভাবে সুপারিশ করে যে মার্চেন্টরা একটি নিয়মিত ডেটা রপ্তানির সময়সূচি স্থাপন করুন — কমপক্ষে মাসিক ভিত্তিতে — তাদের নিজস্ব নিরাপদ স্টোরেজ সিস্টেমে তাদের লেনদেন ইতিহাসের একটি সম্পূর্ণ এবং আপ-টু-ডেট আর্কাইভ বজায় রাখতে।
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যাকএন্ড AML সংরক্ষণ (নন-ড্যাশবোর্ড):</strong> সীমিত ড্যাশবোর্ড ডিসপ্লে উইন্ডো সত্ত্বেও, Xelpay-এর ব্যাকএন্ড সিস্টেম AML নিয়ন্ত্রক প্রয়োজনীয়তার সাথে কঠোর সম্মতিতে লেনদেনের তারিখের পরে সর্বনিম্ন <strong className="text-slate-800 dark:text-slate-200">পাঁচ (৫) বছরের</strong> জন্য এনক্রিপ্টেড, অপরিবর্তনীয় লেনদেন লগ আলাদাভাবে ধরে রাখে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ড্যাশবোর্ড ডেটা হারানোর জন্য কোনো দায় নেই:</strong> মার্চেন্টের ড্যাশবোর্ড ডিসপ্লে উইন্ডোর মধ্যে নিজস্ব রেকর্ড রপ্তানি এবং বজায় রাখতে ব্যর্থতা থেকে উদ্ভূত যেকোনো ব্যবসায়িক ক্ষতি, অ্যাকাউন্টিং অসামঞ্জস্য, কর সম্মতি সমস্যা বা অন্য যেকোনো পরিণতির জন্য Xelpay কোনো দায় বহন করে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৪. API ভার্সনিং, আপডেট ও অবচয় নীতি" icon={Zap} accent="purple">
        <p>Xelpay তার API অবকাঠামোর উন্নতি, নিরাপত্তা শক্তিশালীকরণ এবং সক্ষমতা সম্প্রসারণে ক্রমাগত বিনিয়োগ করে। Xelpay স্পষ্টভাবে তার API-এর নতুন সংস্করণ প্রকাশ করার, বিদ্যমান API এন্ডপয়েন্টে পরিবর্তন আনার এবং যেকোনো সময় পুরানো API সংস্করণ বাতিল বা স্থায়ীভাবে অবসর দেওয়ার অধিকার সংরক্ষণ করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">অবচয় বিজ্ঞপ্তি:</strong> যেখানে অপারেশনালভাবে সম্ভব, Xelpay ড্যাশবোর্ড বিজ্ঞপ্তি, ইমেইল সতর্কতা বা API পরিবর্তন লগ আপডেটের মাধ্যমে পরিকল্পিত API সংস্করণ অবচয়ের আগাম বিজ্ঞপ্তি প্রদানের চেষ্টা করবে।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের নিরঙ্কুশ রক্ষণাবেক্ষণের দায়িত্ব:</strong> মার্চেন্ট এবং তাদের ডেভেলপমেন্ট টিমের <strong>নিরঙ্কুশ, অ-প্রত্যায়নযোগ্য এবং একমাত্র প্রযুক্তিগত দায়িত্ব</strong> হলো Xelpay-এর API পরিবর্তন লগ, সংস্করণ রিলিজ নোট এবং অবচয় ঘোষণা সক্রিয়ভাবে পর্যবেক্ষণ করা এবং সর্বশেষ সমর্থিত API সংস্করণগুলির সাথে সামঞ্জস্যপূর্ণ থাকতে সময়মতো তাদের ইন্টিগ্রেশন কোড আপডেট করা।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায় — পুরনো কোড থেকে ভাঙ্গা ইন্টিগ্রেশন</strong>
                মার্চেন্টের Xelpay-এর বর্তমান API সংস্করণের সাথে সামঞ্জস্যপূর্ণ থাকতে তাদের ইন্টিগ্রেশন কোড আপডেট করতে ব্যর্থতার সরাসরি বা পরোক্ষ ফলাফল হিসেবে মার্চেন্ট দ্বারা অনুভব করা যেকোনো ভাঙ্গা ইন্টিগ্রেশন, ব্যর্থ পেমেন্ট যাচাইকরণ, মিসড ওয়েবহুক ডেলিভারি বা অন্যান্য প্রযুক্তিগত ত্রুটির জন্য Xelpay <strong>সম্পূর্ণরূপে শূন্য আইনগত, আর্থিক বা অপারেশনাল দায় বহন করে।</strong>
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">ইন্টিগ্রেশন ব্যর্থতার জন্য কোনো ফেরত নেই:</strong> পুরানো ইন্টিগ্রেশন কোডের কারণে মার্চেন্ট দ্বারা অনুভব করা API সংস্করণ-সম্পর্কিত ইন্টিগ্রেশন ব্যর্থতা বা সেবা বিঘ্ন সাবস্ক্রিপশন ফি ফেরত বা Xelpay থেকে কোনো আকারের আর্থিক ক্ষতিপূরণের ভিত্তি গঠন করে না।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="২৫. সহায়তা নীতি, SLA ও স্টাফ হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা" icon={ShieldAlert} accent="red">
        <p>Xelpay মার্চেন্ট ড্যাশবোর্ডের মধ্যে যোগাযোগ করা নির্ধারিত অফিসিয়াল সহায়তা চ্যানেলের মাধ্যমে মার্চেন্ট সহায়তা সেবা প্রদান করে। Xelpay সমস্ত মার্চেন্টদের কাছে সাড়াদায়ী এবং সহায়ক সহায়তা প্রদান করতে প্রতিশ্রুতিবদ্ধ; তবে, নিম্নলিখিত শর্তাবলী সহায়তার সম্পর্কের প্রকৃতি, সুযোগ এবং আচরণের প্রত্যাশা পরিচালনা করে।</p>
        <ul className="list-disc pl-5 mt-3 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">সর্বোত্তম-প্রচেষ্টার সহায়তা — কোনো গ্যারান্টিকৃত রেসপন্স SLA নেই:</strong> যদি না মার্চেন্ট Xelpay-এর সাথে একটি পৃথক, আনুষ্ঠানিকভাবে কার্যকর এন্টারপ্রাইজ চুক্তিতে প্রবেশ করেছেন যা স্পষ্টভাবে বাধ্যতামূলক রেসপন্স টাইম SLA নির্দিষ্ট করে, সমস্ত মার্চেন্ট সহায়তা কঠোরভাবে একটি <strong>"সর্বোত্তম-প্রচেষ্টা" ভিত্তিতে</strong> প্রদান করা হয়।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">সহায়তার সুযোগ:</strong> Xelpay-এর সহায়তা সেবাগুলি প্ল্যাটফর্ম-সম্পর্কিত প্রযুক্তিগত সমস্যা, API ইন্টিগ্রেশন সহায়তা, অ্যাকাউন্ট কনফিগারেশন গাইডেন্স এবং বিলিং অনুসন্ধান কভার করে। সহায়তা সাধারণ সফটওয়্যার ডেভেলপমেন্ট পরামর্শ, কাস্টম ফিচার ডেভেলপমেন্ট বা মার্চেন্টের শেষ গ্রাহকদের যেকোনো সহায়তা পর্যন্ত বিস্তৃত নয়।</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">সহায়তা স্টাফ হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা নীতি:</strong> Xelpay যেকোনো যোগাযোগ চ্যানেলের মাধ্যমে যেকোনো Xelpay সহায়তা স্টাফ সদস্য, কর্মচারী, ঠিকাদার বা প্রতিনিধির দিকে নির্দেশিত মার্চেন্ট (বা তাদের পক্ষে কাজ করা যেকোনো ব্যক্তি) দ্বারা আপত্তিজনক, ভীতিকর, হয়রানিকর, ধমকদায়ী, মানহানিকর বা বৈষম্যমূলক আচরণের যেকোনো রূপের বিরুদ্ধে একটি নিরঙ্কুশ এবং অ-আলোচনাযোগ্য শূন্য-সহনশীলতা নীতি বজায় রাখে।
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">তাৎক্ষণিক স্থায়ী নিষিদ্ধ — সহায়তা স্টাফের হয়রানি</strong>
                নিষিদ্ধ আচরণের মধ্যে রয়েছে: লিখিত বা মৌখিক যোগাযোগে আপত্তিজনক, অশ্লীল, অভদ্র বা ভীতিকর ভাষার ব্যবহার; শারীরিক ক্ষতির হুমকি, ভয় দেখানোর জন্য আইনি ব্যবস্থার হুমকি বা প্রকাশ্য মানহানি; সহায়তা কার্যক্রম বাধাগ্রস্ত করতে ডিজাইন করা বারবার হয়রানি বা ইচ্ছাকৃতভাবে বদ-বিশ্বাসে যোগাযোগ। Xelpay সহায়তা স্টাফের হয়রানির যেকোনো একটি নিশ্চিত ঘটনা পূর্ববর্তী কোনো সতর্কতা ছাড়াই মার্চেন্টের অ্যাকাউন্ট এবং সমস্ত API অ্যাক্সেসের <strong>তাৎক্ষণিক, স্থায়ী এবং অপরিবর্তনীয় সমাপ্তির</strong> ফলে হবে। এই সমাপ্তি অ-আলোচনাযোগ্য এবং অপরিবর্তনীয়। <strong>এই নীতির অধীনে সমাপ্তির পর কোনো প্রি-পেইড সাবস্ক্রিপশন ফি বা অ্যাড-অন চার্জ ফেরত দেওয়া হবে না।</strong>
              </InfoBox>
            </div>
          </li>
        </ul>
      </SectionBlock>
    </div>
  );
}

export default function TermsContent({ lang }: { lang: 'en' | 'bn' }) {
  return lang === 'en' ? <EnglishTermsContent /> : <BanglaTermsContent />;
}
