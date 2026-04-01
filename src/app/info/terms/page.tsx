'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ShieldCheck, FileText, AlertTriangle, Globe,
  ChevronDown, ChevronUp, Lock, Eye, Database, Server,
  CreditCard, Users, Bell, Scale, Gavel, HelpCircle,
  Smartphone, Mail, Cookie, Trash2, RefreshCw, UserCheck,
  AlertCircle, BookOpen, Building2, Zap, Fingerprint, ShieldAlert,
  Repeat, Ban, DollarSign, BarChart2, GitBranch, Headphones
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
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600',
  };
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-xl ${accentMap[accent] ?? accentMap['blue']}`}>
              <Icon size={18} />
            </div>
          )}
          <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      {open && <div className="p-5 md:p-6 space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

function InfoBox({ type, children }: { type: 'warning' | 'info' | 'danger' | 'success'; children: React.ReactNode }) {
  const styles = {
    warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-300',
    danger: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400',
    success: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300',
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
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={22} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Terms of Service</h2>
        </div>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Welcome to <strong className="text-slate-900 dark:text-white">Xelpay</strong> — a strictly B2B payment verification infrastructure operated by <strong className="text-slate-900 dark:text-white">Xenverse IT</strong>. By accessing or using the Xelpay platform, API, dashboard, or any associated services, you — the Merchant — unconditionally agree to every clause within this legally binding document. Please read it in its entirety before proceeding.
          </p>

          <SectionBlock title="1. Right to Modify Terms & Policies" icon={RefreshCw} accent="blue">
            <InfoBox type="info">
              <strong>Authority Rights:</strong> Xelpay (Xenverse IT) reserves the absolute and unilateral right to modify, amend, update, or replace any part of these Terms of Service, Privacy Policy, Acceptable Use Policy, or any associated pricing and feature documentation at any time, with or without prior notice. Continued use of the platform following any such modification constitutes your unconditional acceptance of the updated terms.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="2. Description of Service & Core Disclaimer" icon={Server} accent="blue">
            <p>Xelpay is a strictly technological infrastructure providing payment verification for Mobile Financial Services (MFS), bank transfers, and related digital payment methods in Bangladesh. Xelpay acts as a software intermediary — it reads, parses, and verifies incoming payment confirmation signals.</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Crucial Financial Disclaimer</strong>
              Xelpay is a software layer, <strong>NOT</strong> a bank, financial institution, digital wallet, payment aggregator, or money service business. Xelpay does not hold, move, send, receive, store, or settle any funds on behalf of any party under any circumstances whatsoever.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="3. Eligibility, Account Obligations, Age Restriction & Demo Mode" icon={UserCheck} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Age Restriction:</strong> You must be at least 18 years of age to register and use Xelpay. By creating an account, you represent and warrant that you meet this age requirement.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Business Eligibility:</strong> Xelpay is an exclusively B2B platform. You must be a validly registered business, sole proprietor, or authorized representative of a legal entity to use this service.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Accuracy of Information:</strong> You agree to provide complete, accurate, and truthful information during registration and to promptly update it as necessary.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Account Security:</strong> You are solely responsible for maintaining the confidentiality of your API keys, credentials, and dashboard access. You are liable for all activity conducted under your account.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">One Account Per Merchant:</strong> Each business entity is permitted to maintain only one active Xelpay merchant account. The creation of multiple accounts is a violation of these terms and may result in termination of all associated accounts.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Demo Mode Constraint:</strong> Xelpay may offer a demonstration or sandbox mode for integration testing purposes. Transactions processed in Demo Mode are entirely simulated and do not represent real financial activity. Using Demo Mode for live commercial transactions is strictly prohibited.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="4. Intellectual Property (IP) Rights" icon={BookOpen} accent="purple">
            <p>All source code, UI/UX designs, API architectures, algorithms, logos, trademarks, trade secrets, and all other intellectual property associated with Xelpay and Xenverse IT are exclusively owned by Xenverse IT and are protected under applicable intellectual property laws.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>You are granted a <strong>limited, non-exclusive, non-transferable, revocable license</strong> to use our API solely for your own legitimate business operations in accordance with our published documentation.</li>
              <li>You strictly agree <strong>NOT</strong> to copy, clone, scrape, reverse-engineer, decompile, resell, or create derivative works based on any part of our platform.</li>
              <li>Any unauthorized use of Xelpay's IP constitutes infringement and will be pursued through all available civil and criminal legal remedies.</li>
              <li>Feedback, suggestions, or ideas submitted to Xelpay become our property and may be used without obligation or compensation to you.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="5. Subscription, Billing, Pricing, Add-On Services & Strict No-Refund Policy" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Free/Starter Tier:</strong> Xelpay may offer a free or starter tier with limited features. Access to the free tier may be modified, restricted, or discontinued at any time without notice or compensation.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Paid Subscriptions:</strong> Access to premium features requires a paid subscription. Subscription fees are billed in advance on a recurring basis (monthly or annually, as selected).</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Pricing Changes:</strong> Xelpay reserves the right to modify subscription pricing at any time. Merchants on active paid plans will be notified of price changes with reasonable advance notice.</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Add-On Services & Usage-Based Billing:</strong> Certain features (e.g., high-volume SMS relay, extended log retention, priority support) are available as paid add-ons billed on a usage or flat-fee basis.
                <InfoBox type="warning">
                  <strong>Important:</strong> Enabling an Add-On service constitutes your binding agreement to the associated usage-based pricing. You are responsible for all charges accrued by your account.
                </InfoBox>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200 uppercase">Strict No-Refund Policy:</strong> ALL payments made to Xelpay — including subscription fees, add-on charges, setup fees, and any other associated costs — are STRICTLY AND ABSOLUTELY NON-REFUNDABLE. This policy applies universally, regardless of usage, account termination reason, service downtime, or any other circumstance.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Chargebacks & Payment Disputes:</strong> Initiating a chargeback or payment dispute with your bank or payment provider without first exhausting Xelpay's internal dispute resolution process constitutes a material breach of these Terms and may result in an immediate, permanent account ban and pursuit of the disputed amount through legal channels.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Taxes:</strong> You are solely responsible for all applicable taxes, duties, levies, and other governmental charges arising from your use of and subscription to Xelpay services.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="6. Acceptable Use Policy (AUP) & Prohibited Conduct" icon={AlertTriangle} accent="red">
            <p>Xelpay maintains a <strong className="text-slate-800 dark:text-slate-200">zero-tolerance policy</strong> against platform abuse. The following activities are categorically and strictly prohibited on the Xelpay platform:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Processing payments for illegal goods, narcotics, controlled substances, adult/pornographic content, unlicensed pharmaceuticals, unauthorized gambling services, or any other prohibited category under Bangladeshi law.</li>
              <li>Money laundering, terrorist financing, proliferation financing, or any attempt to violate the Money Laundering Prevention Act, 2012, and the Anti-Terrorism Act, 2009 (Bangladesh).</li>
              <li>Executing scams, Ponzi schemes, pyramid schemes, fraudulent investment plans, or any deceptive scheme targeting end-customers.</li>
              <li>Intentionally overwhelming, stress-testing beyond authorized limits, reverse-engineering, or conducting DDoS attacks against Xelpay's APIs, servers, or connected third-party systems.</li>
              <li>Unauthorized access or intrusion attempts against Xelpay's databases, administrative panels, or internal systems in violation of the Digital Security Act, 2018 (Bangladesh).</li>
              <li>Impersonating Xelpay, Xenverse IT, or any Xelpay employee, partner, or affiliate.</li>
              <li>Using Xelpay to facilitate human trafficking, child exploitation, or any crimes against persons.</li>
              <li>Operating any sanction-listed entity or individual as defined by OFAC, UN Security Council sanctions lists, or Bangladesh Bank directives.</li>
              <li>Using the platform to send unsolicited bulk communications (spam) to customers.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Enforcement</strong>
              Any violation of this AUP will trigger an immediate, irreversible, permanent ban of your merchant account, forfeiture of all subscription fees paid, immediate revocation of all API access, and referral to the appropriate Bangladeshi law enforcement and regulatory authorities.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="7. Third-Party Integrations (IMAP, Telegram, SMS & External APIs)" icon={Smartphone} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Custom Telegram Bots:</strong> Xelpay supports integration with Telegram for real-time payment alerts. You are solely responsible for the security and management of your Telegram bot tokens. Xelpay is not responsible for unauthorized access to your Telegram bot.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">IMAP Bank Email Sync:</strong> When you connect a bank email account via IMAP, you grant Xelpay read-only access to that mailbox solely for the purpose of parsing payment confirmation emails. Xelpay does not store, forward, or process any other email content.</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">SMS Relay & Device App — Critical Dependency:</strong>
                <div className="mt-3">
                  <InfoBox type="warning">
                    <strong className="block mb-1">Critical Device & Connectivity Requirement:</strong>
                    The uninterrupted and accurate functioning of the SMS Relay verification system is entirely contingent upon the Merchant maintaining a dedicated Android device with the Xelpay Relay App installed, continuously powered on, connected to a stable internet connection (minimum 5 Mbps), and with the corresponding SIM card active and functional at all times. Any failure of this device or connectivity is the Merchant's sole responsibility.
                  </InfoBox>
                </div>
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">MFS SMS Format Changes & Xelpay's Absolute Zero Liability:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>MFS operators may, at their own discretion and without prior notice to Xelpay or the Merchant, unilaterally alter the structure, content, sender ID, or format of their payment confirmation SMS messages.</li>
                  <li>Any such unilateral change to an MFS operator's SMS format will render Xelpay's parsing engine temporarily unable to verify payments from that operator until a software update is deployed.</li>
                  <li><strong className="text-slate-800 dark:text-slate-200">Xelpay bears absolutely zero financial, legal, or operational liability</strong> for failed or missed payment verifications resulting from such third-party MFS operator format changes.</li>
                </ul>
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">SMS Spoofing & False Positives — Zero Liability:</strong>
                <div className="mt-3">
                  <InfoBox type="danger">
                    <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — SMS Spoofing</strong>
                    In the event that any person — whether a customer, third party, or malicious actor — sends a fabricated, spoofed, or otherwise counterfeit SMS to the Merchant's relay device that mimics a legitimate MFS payment confirmation, and Xelpay's parsing engine mistakenly verifies such a fabricated message as a genuine payment, Xelpay bears absolutely zero financial, legal, or compensatory liability for the resulting erroneous verification or any financial loss suffered by the Merchant.
                  </InfoBox>
                </div>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">Third-Party Service Disruptions:</strong> Xelpay holds no liability for downtime, data loss, or service disruptions caused by third-party services including but not limited to Telegram, IMAP email providers, SMS gateway operators, or cloud infrastructure providers.</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Webhook Delivery & Merchant Server Responsibility:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Xelpay does <strong>not</strong> guarantee delivery if your endpoint is unreachable, returning persistent errors, timing out, or is misconfigured by the Merchant.</li>
                  <li>Failed webhook delivery attempts are logged in the Merchant dashboard for review and manual reconciliation.</li>
                  <li><strong className="text-slate-800 dark:text-slate-200">Xelpay holds absolutely no liability</strong> for missed webhooks resulting from Merchant server downtime, misconfiguration, or infrastructure failures.</li>
                </ul>
              </li>
            </ul>
          </SectionBlock>

          <SectionBlock title="8. Service Level, Uptime & Downtime" icon={Server} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">No Uptime Guarantee:</strong> Xelpay does not provide or guarantee any specific uptime Service Level Agreement (SLA) unless explicitly stipulated in a separately executed Enterprise Agreement. The platform is provided on an "as-is" and "as-available" basis.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Scheduled Maintenance:</strong> Xelpay reserves the right to perform scheduled or emergency maintenance at any time, which may result in temporary service interruptions.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">No Liability for Downtime:</strong> Xelpay expressly disclaims any and all liability for business losses, missed transactions, or damages of any kind arising from platform downtime, whether scheduled or unscheduled.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="9. Termination & Suspension Rights" icon={AlertCircle} accent="red">
            <p>Xelpay reserves the unilateral right to <strong className="text-slate-800 dark:text-slate-200">immediately suspend or permanently terminate</strong> your merchant account and all associated API access, with or without prior notice, if we:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Suspect any breach of these Terms of Service or our Acceptable Use Policy.</li>
              <li>Detect unusual, suspicious, or potentially fraudulent activity on your account.</li>
              <li>Are required to do so by applicable law, court order, or regulatory authority.</li>
              <li>Determine your usage poses a severe security, legal, or operational risk to Xelpay's infrastructure or other users.</li>
              <li>Receive a valid law enforcement request or regulatory directive.</li>
              <li>Determine that the Merchant has failed to comply with a KYC/Business Verification request as outlined in Section 15.</li>
            </ul>
            <p className="mt-3">Upon termination, your right to access the platform ceases immediately. All data associated with your account may be retained by Xelpay as required by applicable law and our AML obligations, as detailed in the Privacy Policy.</p>
            <p className="mt-3">You may terminate your account voluntarily at any time by submitting a formal written request to our support team. Voluntary termination does not entitle you to any refund of fees paid.</p>
          </SectionBlock>

          <SectionBlock title="10. Force Majeure, Limitation of Liability & Indemnification" icon={Scale} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Force Majeure:</strong> Xelpay is not liable for any failure or delay in performance resulting from circumstances beyond our reasonable control, including but not limited to natural disasters, acts of God, war, terrorism, government actions, power failures, internet service disruptions, cyberattacks on third-party infrastructure, or any other force majeure event.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Limitation of Liability — MFS/Bank Account Issues:</strong> Xelpay bears absolutely zero liability for any issues originating from an MFS operator's or bank's own systems, including but not limited to transaction reversals, account freezes, fund holds, or regulatory actions taken by those financial institutions.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">General Liability Cap:</strong> To the maximum extent permitted by applicable law, Xelpay's aggregate liability to you for any claims arising from your use of the platform shall not exceed the total subscription fees paid by you to Xelpay in the three (3) months immediately preceding the event giving rise to the claim.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Exclusion of Consequential Damages:</strong> Under no circumstances shall Xelpay be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, data, or business opportunities, even if advised of the possibility of such damages.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Indemnification:</strong> You agree to defend, indemnify, and hold harmless Xelpay, Xenverse IT, and all officers, directors, employees, contractors, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or relating to your use of the platform, your violation of these Terms, or your violation of any third-party rights.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="11. Dispute Resolution, Arbitration & Class-Action Waiver" icon={Gavel} accent="purple">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Informal Resolution First:</strong> Before initiating any formal legal proceeding, both parties agree to first attempt in good faith to resolve any dispute informally by contacting Xelpay's support team and allowing a period of thirty (30) days for resolution.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Class-Action Waiver:</strong> You expressly and irrevocably waive any right to participate in or initiate any class action, collective action, or representative proceeding against Xelpay. All disputes must be resolved on an individual basis only.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Binding Arbitration:</strong> Any unresolved dispute, controversy, or claim arising out of or relating to these Terms shall be submitted to and finally resolved by binding arbitration under the rules of the relevant Bangladeshi arbitration authority, with proceedings conducted in Dhaka, Bangladesh, in the Bengali or English language.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="12. Governing Law, Jurisdiction & Severability" icon={Building2} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Governing Law:</strong> These Terms of Service and all associated policies shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh, without regard to its conflict of law principles.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Jurisdiction:</strong> For any disputes not subject to arbitration, you consent to the exclusive jurisdiction of the courts of competent jurisdiction located in Dhaka, Bangladesh.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Severability:</strong> If any provision of these Terms is held by a court or arbitral tribunal of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Entire Agreement:</strong> These Terms, together with the Privacy Policy and all incorporated policies, constitute the entire and exclusive agreement between you and Xelpay concerning the subject matter herein and supersede all prior agreements.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Waiver:</strong> Xelpay's failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="13. Affiliate Program Terms" icon={Users} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Eligibility:</strong> Participation in the Xelpay Affiliate Program is open to verified, active Xelpay merchants in good standing. Xelpay reserves the right to accept or reject any affiliate application at its sole discretion.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Commission Structure:</strong> Commission rates, payout structures, and minimum thresholds are published in the Affiliate Program documentation and are subject to change at Xelpay's sole discretion with prior notice.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Promotion Methods:</strong> Affiliates are strictly prohibited from using spam, misleading advertising, pay-per-click bidding on Xelpay brand keywords, or any deceptive marketing practices to generate referrals.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Self-Referrals Prohibited:</strong> Creating duplicate accounts to refer yourself, or referring entities under your direct ownership or control, constitutes fraud and will result in immediate program termination and forfeiture of all earned commissions.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Commission Forfeiture:</strong> Commissions earned through fraudulent, deceptive, or policy-violating referrals will be forfeited in their entirety. Xelpay reserves the right to claw back previously paid commissions if a referral is subsequently found to be fraudulent.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Payment Threshold:</strong> Commission payouts are subject to a minimum earning threshold as published in the Affiliate Program documentation. Commissions below this threshold will roll over to the subsequent period.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="14. Payment Links & Checkout Pages" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant Responsibility:</strong> Merchants who utilize Xelpay-generated payment links and hosted checkout pages are solely and exclusively responsible for the accuracy of all product descriptions, prices, and terms of sale presented to end-customers through those pages.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Customer Data on Checkout Pages:</strong> Xelpay collects only the minimum information necessary to facilitate payment verification on checkout pages. Merchants must ensure their use of checkout pages complies with all applicable data privacy laws.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Content on Payment Links:</strong> Payment links and checkout pages must not be used to facilitate the sale of any prohibited goods or services as defined in Section 6 (AUP) of these Terms.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="15. KYC & Business Verification" icon={Fingerprint} accent="orange">
            <p>In strict compliance with the Bangladesh Financial Intelligence Unit (BFIU) directives, Anti-Money Laundering (AML) regulations, the Money Laundering Prevention Act, 2012, and the Anti-Terrorism Act, 2009, Xelpay reserves the right to request KYC (Know Your Customer) and business verification documentation from any Merchant at any time.</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Requested Documentation:</strong> This may include, but is not limited to, valid government-issued National ID (NID), Trade License, Certificate of Incorporation, TIN Certificate, VAT Registration, authorized signatory identification, and proof of business address.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Mandatory Compliance Obligation:</strong> Upon receiving a KYC or Business Verification request from Xelpay, the Merchant is obligated to provide all requested documentation within the specified timeframe. Failure to comply constitutes a material breach of these Terms.</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Consequences of Non-Compliance:</strong>
                <InfoBox type="danger">
                  <strong className="uppercase tracking-widest text-[11px] block mb-1">No Refund on KYC-Related Suspension</strong>
                  Account suspension or termination arising from non-compliance with a KYC or Business Verification request does not entitle the Merchant to any refund of subscription fees or any other amounts paid under Section 5's strict no-refund policy.
                </InfoBox>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">Data Handling of KYC Documents:</strong> All KYC and Business Verification documentation is handled with the highest level of security and retained strictly in accordance with Bangladesh Bank and BFIU regulatory mandates, as further detailed in the Privacy Policy.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="16. Reversed Transactions, MFS Clawbacks & Operator Disputes" icon={ShieldAlert} accent="red">
            <p>Xelpay's role is strictly limited to that of a technological verification intermediary. The platform verifies whether a payment confirmation signal was received; it does not hold, control, or guarantee any underlying funds.</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Zero Liability — Transaction Reversals</strong>
              In the event that any payment transaction that was previously verified and confirmed by Xelpay's system is subsequently reversed, recalled, clawed back, or disputed by the originating customer, sender, MFS operator, bank, or any other financial or regulatory authority, Xelpay bears absolutely zero financial, legal, or compensatory liability for such reversal or the resulting financial loss to the Merchant.
            </InfoBox>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Independent Risk Responsibility:</strong> The Merchant assumes full and independent financial risk for all commercial transactions conducted through their business, including the risk of customer-initiated chargebacks, MFS operator clawbacks, and regulatory fund freezes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Dispute Resolution Between Merchant & Customer:</strong> Any dispute between a Merchant and an end-customer regarding a payment, refund, or service delivery is exclusively the responsibility of the Merchant to resolve through their own customer service and refund processes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Cooperation in Investigations:</strong> While Xelpay bears no financial liability, we will reasonably cooperate with valid law enforcement or regulatory investigations by providing transaction log data as required by applicable Bangladeshi law.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="17. Strict B2B Service — No End-Customer Support Obligation" icon={Users} accent="blue">
            <p>Xelpay is an exclusively <strong className="text-slate-800 dark:text-slate-200">Business-to-Business (B2B)</strong> platform. Our contractual relationship, support obligations, and service commitments extend solely to the registered Merchant and not to any end-customer transacting through the Merchant's own platform or application.</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">No Direct Relationship with End-Customers:</strong> Xelpay has no direct legal, contractual, or service relationship with the end-customers of any Merchant. End-customers are the customers of the Merchant, not of Xelpay.</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">No Support Obligation for End-Customers:</strong> Xelpay is under no obligation whatsoever to provide customer support, process refunds, handle complaints, or address queries from any end-customer of any Merchant.
                <InfoBox type="info">
                  <strong>Merchant Responsibility:</strong> It is the Merchant's sole and exclusive responsibility to provide adequate customer support, maintain their own refund policies, and comply with all applicable consumer protection laws in their jurisdiction when operating their business using the Xelpay infrastructure.
                </InfoBox>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant Indemnification for End-Customer Claims:</strong> The Merchant agrees to fully indemnify, defend, and hold harmless Xelpay against any and all claims, legal proceedings, regulatory actions, or demands initiated by any end-customer arising from the Merchant's business operations, products, services, or failure to provide adequate customer support.</li>
            </ul>
          </SectionBlock>

          {/* ─── NEW CLAUSES 18–25 (mapped from requested 9–16) ─── */}

          <SectionBlock title="18. Webhook Idempotency & Double-Crediting Prevention" icon={Repeat} accent="teal">
            <p>Xelpay's webhook delivery system may, under certain network conditions such as request timeouts or transient connectivity failures, automatically retry the delivery of a webhook notification to a Merchant's configured endpoint. This is a standard and expected behavior of our resilient delivery architecture.</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Absolute Technical Responsibility — Merchant Developer Obligation</strong>
              It is the <strong>absolute and non-delegable technical responsibility</strong> of the Merchant's development team to implement strict <strong>Idempotency</strong> logic within their webhook receiver endpoint. This requires the Merchant's system to track each unique Xelpay transaction reference ID and explicitly reject or ignore any duplicate webhook payload referencing an already-processed transaction. Failure to implement idempotency is a Merchant-side technical deficiency, and Xelpay shall bear <strong>absolutely zero financial, legal, or operational liability</strong> in the event that a Merchant double-credits, double-fulfills, or otherwise erroneously processes an end-customer order or account due to receiving and processing duplicate webhook deliveries.
            </InfoBox>
            <p className="mt-2">Xelpay provides a unique, immutable transaction reference identifier within every webhook payload specifically to facilitate idempotent processing. Merchants are required to leverage this identifier as the basis of their idempotency key.</p>
          </SectionBlock>

          <SectionBlock title="19. Regulatory Shutdown & Compliance-Mandated Service Termination" icon={Ban} accent="red">
            <p>Xelpay operates in full compliance with all applicable laws and regulations of the People's Republic of Bangladesh. Certain core functionalities of the Xelpay platform — including but not limited to SMS-reading automation via the Relay App and IMAP-based bank email parsing — are dependent upon the continued legality and permissibility of such technical operations under Bangladeshi law and applicable regulatory frameworks.</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Regulatory Shutdown — Zero Liability & Zero Refund</strong>
              In the event that Bangladesh Bank, the Bangladesh Telecommunication Regulatory Commission (BTRC), the Bangladesh Financial Intelligence Unit (BFIU), or any other competent governmental or regulatory authority issues a directive, circular, order, or guideline that restricts, limits, prohibits, or otherwise renders impermissible the continued operation of SMS-reading automation, IMAP email scraping/parsing, or any other technical methodology upon which Xelpay's service delivery is dependent, <strong>Xelpay expressly reserves the unilateral and absolute right to immediately suspend, restrict, or permanently terminate the affected services or the entire platform, without any prior notice, and without any obligation to provide compensation, alternative services, or refunds of any kind</strong> to any Merchant or user.
            </InfoBox>
            <p className="mt-2">Merchants acknowledge and accept this inherent regulatory risk as a fundamental condition of using Xelpay's services. This provision shall also constitute a Force Majeure event under Section 10 of these Terms.</p>
          </SectionBlock>

          <SectionBlock title="20. Publicity & Marketing Rights" icon={Zap} accent="purple">
            <p>By completing registration and activating a Xelpay merchant account, and subject to the opt-out mechanism described below, the Merchant grants Xelpay and Xenverse IT a <strong>non-exclusive, royalty-free, worldwide, sub-licensable license</strong> to use the Merchant's trading name, registered business name, brand name, and associated logo(s) for the following limited marketing purposes:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Inclusion in "Trusted By," "Our Merchants," or "Powered By" sections displayed on Xelpay's official website and marketing collateral.</li>
              <li>Reference in case studies, press releases, or promotional materials as a client or integration partner of Xelpay, without disclosure of confidential business metrics.</li>
              <li>Display in presentations to investors, partners, or regulatory bodies for the purpose of demonstrating platform adoption.</li>
            </ul>
            <InfoBox type="info">
              <strong>Opt-Out Right:</strong> A Merchant may withdraw consent to this publicity license at any time by submitting a formal, written opt-out request to Xelpay's official support email address. Upon receipt and verification of the opt-out request, Xelpay will use commercially reasonable efforts to remove the Merchant's branding from new marketing materials within thirty (30) days. This opt-out does not apply retroactively to materials already published or distributed prior to the opt-out request.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="21. Account Non-Transferability & AML Risk" icon={Lock} accent="red">
            <p>A Xelpay merchant account is registered to, and intended exclusively for the use of, the specific legal entity or individual identified during the registration and KYC verification process. Xelpay accounts are <strong>strictly and absolutely non-transferable</strong>.</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Prohibited Transfer Actions:</strong> Merchants are expressly prohibited from selling, renting, leasing, lending, gifting, transferring ownership or control of, or otherwise alienating their Xelpay account, associated API keys, or access credentials to any third party, whether for consideration or gratuitously.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Business Restructuring:</strong> In the event of a legitimate corporate restructuring, merger, acquisition, or change of beneficial ownership, the Merchant must formally notify Xelpay in writing and submit to a full re-verification of KYC and business identity documentation before any change in account administration is permitted.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Immediate Lifetime Ban — Unauthorized Transfer</strong>
              Any unauthorized transfer, sale, rental, or change of effective control of a Xelpay account — detected through any means, including but not limited to device fingerprint changes, IP analysis, or third-party reports — will result in an <strong>immediate, permanent, and irrevocable lifetime ban</strong> of the account and all associated accounts, forfeiture of all data and subscription fees without refund, and referral to the Bangladesh Financial Intelligence Unit (BFIU) and relevant law enforcement authorities, given the serious Anti-Money Laundering (AML) and financial crime risks posed by unverified account transfers.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="22. Underlying MFS/Bank Fees — Merchant's Sole Responsibility" icon={DollarSign} accent="amber">
            <p>Xelpay's subscription and add-on fees are charged exclusively for access to and use of Xelpay's proprietary software infrastructure, API, dashboard, verification engine, and associated technical services. These fees do not include, cover, subsidize, or offset any fees, charges, or costs levied by third-party financial service providers or operators.</p>
            <InfoBox type="warning">
              <strong>Merchant's Sole Financial Responsibility for Third-Party Fees:</strong> The Merchant is solely and exclusively responsible for bearing, understanding, and complying with all underlying third-party costs associated with their business operations, including but not limited to: MFS cash-out charges imposed by operators such as bKash, Nagad, Rocket, and Upay; MFS Person-to-Person (P2P) send money fees; inter-bank or intra-bank transfer fees; payment gateway processing fees; and all applicable Value Added Tax (VAT), Supplementary Duty (SD), and other taxes levied by third-party financial service providers or the Government of Bangladesh on such transactions.
            </InfoBox>
            <p className="mt-2">Xelpay provides no representation, warranty, or guarantee regarding the fee structures of any third-party MFS operator or bank, which are subject to change at those operators' sole discretion.</p>
          </SectionBlock>

          <SectionBlock title="23. Dashboard Log Retention Limit & Data Export Responsibility" icon={BarChart2} accent="blue">
            <p>To maintain optimal server performance, system stability, and efficient database operation, transaction and activity logs displayed within the active Xelpay Merchant Dashboard are subject to a <strong>rolling retention window</strong> for active dashboard visibility. Logs older than the active rolling window (currently ninety (90) days, subject to change with notice) may no longer be actively displayed or directly queryable through the dashboard interface.</p>
            <InfoBox type="warning">
              <strong>Merchant's Data Export Obligation:</strong> It is the Merchant's own sole and absolute responsibility to regularly and proactively export their transaction data (available in CSV or other supported formats) from the Xelpay Dashboard to their own secure, independent systems before the rolling retention window expires for dashboard visibility. Xelpay accepts no responsibility for any operational, financial, tax compliance, or legal consequences arising from a Merchant's failure to export and independently retain their own business data.
            </InfoBox>
            <p className="mt-2">For regulatory compliance purposes, Xelpay separately retains encrypted, backend transaction log archives for a period of <strong>five (5) years</strong> in accordance with the Money Laundering Prevention Act, 2012, and BFIU directives. This backend retention is for regulatory purposes only and does not constitute a data backup service for the Merchant's operational benefit. Access to these archived logs by the Merchant is not guaranteed and may only be provided pursuant to a valid legal or regulatory process.</p>
          </SectionBlock>

          <SectionBlock title="24. API Versioning, Deprecation & Merchant Compatibility Obligation" icon={GitBranch} accent="teal">
            <p>Xelpay is a continuously evolving software platform. To improve security, performance, and functionality, Xelpay reserves the right to release new versions of its APIs and to update, modify, or deprecate older API versions.</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Deprecation Notice:</strong> Xelpay will use commercially reasonable efforts to provide advance notice of significant API deprecation events through the Merchant Dashboard, email communications, and/or official developer documentation updates. The notice period for deprecation will vary based on the scope of change, but Xelpay provides no guaranteed minimum notice period.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant's Absolute Compatibility Obligation:</strong> It is the Merchant's absolute and exclusive responsibility to ensure that their own application's codebase, integration logic, and technical infrastructure remain compatible with the current, supported version(s) of the Xelpay API at all times. This includes actively monitoring Xelpay's developer documentation and changelog for updates.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — Broken Integrations from Outdated Merchant Code</strong>
              Xelpay bears <strong>absolutely zero financial, legal, or operational liability</strong> for any service disruption, payment processing failure, missed transactions, business loss, or broken integration resulting from a Merchant's failure to update their code to maintain compatibility with current or updated Xelpay API versions. The obligation to maintain a current, compatible integration rests entirely with the Merchant's technical team.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="25. Support SLA, Best-Effort Basis & Zero-Tolerance for Staff Harassment" icon={Headphones} accent="rose">
            <p>Xelpay provides Merchant support services as a core component of our platform offering. However, except where explicitly and separately stipulated in a custom, individually negotiated Enterprise Service Agreement signed by an authorized representative of Xenverse IT, all support services are provided on a <strong>"best-effort" basis</strong> without any binding guarantee of specific response times, resolution times, or support channel availability.</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Best-Effort Support:</strong> Xelpay's support team strives to respond to and resolve Merchant inquiries as promptly as possible. Response times will vary based on inquiry volume, complexity, and priority level. Standard support does not guarantee any specific Service Level Agreement (SLA).</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Enterprise SLA:</strong> Merchants requiring guaranteed response times, dedicated account management, or enhanced support SLAs may inquire about Xelpay's Enterprise Agreement options.</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero-Tolerance Policy — Harassment of Support Staff</strong>
              Xelpay maintains an absolute and unconditional <strong>zero-tolerance policy</strong> towards any form of verbal abuse, written abuse, threats, intimidation, harassment, discriminatory language, or any other form of hostile conduct directed at any Xelpay support staff member, employee, or contractor, through any communication channel, whether via in-app chat, email, social media, phone, or any other medium. Any Merchant or user who violates this policy will face an <strong>immediate, permanent, and irrevocable account ban</strong>, without any refund of fees paid, and Xelpay reserves the right to pursue appropriate legal remedies where such conduct constitutes a criminal offense under applicable Bangladeshi law.
            </InfoBox>
          </SectionBlock>

        </div>
      </div>

      {/* ══════════ PART 2: PRIVACY POLICY ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><Lock size={22} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Privacy Policy</h2>
        </div>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Xelpay (Xenverse IT) is committed to protecting your privacy and handling your personal and business data with the highest standards of transparency, security, and legal compliance. This Privacy Policy explains, in detail, what data we collect, why we collect it, how we use it, and your rights regarding it.
          </p>

          <SectionBlock title="1. Comprehensive Information We Collect" icon={Database} accent="green">
            <p className="font-semibold text-slate-700 dark:text-slate-300">We collect structured data across the following categories:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Merchant Identification Data:</strong> Full legal name, business trading name, email address, phone number, business address, and other registration information.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Technical Integration Data:</strong> API keys (hashed), webhook endpoint URLs, configured MFS numbers, Telegram bot identifiers, and IMAP account metadata (not email content).</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Transaction & Payment Metadata:</strong> Transaction reference IDs, amounts, timestamps, MFS operator identifiers, verification status, and webhook delivery logs. We do not store actual payment credentials or PINs.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Device & App Metadata (Relay App):</strong> Device model, OS version, app version, and relay device connectivity status for SMS relay functionality.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Add-On Usage Data:</strong> Feature usage metrics for billing and system optimization purposes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">KYC & Business Verification Documentation:</strong> Government-issued identity documents, trade licenses, and other business verification materials as required by law.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Usage & Log Data:</strong> IP addresses, browser/client type, access timestamps, API request logs, and error logs for security and performance monitoring.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Communications:</strong> Support tickets, email correspondence, and feedback submitted through our channels.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Affiliate & Referral Data:</strong> Referral codes, conversion events, and commission calculation data for Affiliate Program participants.</li>
            </ul>
            <div className="mt-4">
              <InfoBox type="success">
                <strong className="block mb-1">What We NEVER Collect:</strong>
                Under absolutely no circumstances does Xelpay record, store, log, or intercept your bank account passwords, MFS app PIN codes, One-Time Passwords (OTPs), NID/Passport numbers (except during formal KYC verification), or the full content body of your bank emails beyond the parsed payment confirmation details.
              </InfoBox>
            </div>
          </SectionBlock>

          <SectionBlock title="2. Legal Basis for Processing Personal Data" icon={Scale} accent="green">
            <p>Xelpay processes your personal data under one or more of the following legal bases:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Contractual Necessity:</strong> Processing is required to fulfill our obligations under the Terms of Service you have agreed to.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legitimate Interests:</strong> For fraud prevention, platform security, and service improvement, where our interests do not override your fundamental rights.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legal Obligation:</strong> To comply with AML regulations, BFIU directives, Bangladesh Bank guidelines, and other applicable laws.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Consent:</strong> For marketing communications, where explicitly provided and revocable at any time.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="3. Purpose of Data Utilization" icon={Eye} accent="green">
            <p>Your data is used strictly for the following operational purposes:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>To reliably authenticate users and maintain robust workspace security and session integrity.</li>
              <li>To algorithmically verify incoming payments and fire real-time Webhook payloads to your configured endpoint.</li>
              <li>To dispatch instant payment success/failure alerts via Telegram to your configured bot.</li>
              <li>To identify transaction anomalies, proactively prevent platform abuse, spam, and financial fraud.</li>
              <li>To generate analytics, reports, and dashboard metrics for your own business performance review.</li>
              <li>To calculate, invoice, and collect usage-based fees for any activated Add-On services.</li>
              <li>To process, review, and retain KYC and Business Verification documentation in compliance with AML and BFIU regulatory obligations.</li>
              <li>To send transactional system emails, security alerts, and billing notices.</li>
              <li>To fulfill our legal obligations under AML and fraud prevention regulations.</li>
              <li>To improve our platform's features, fix bugs, and optimize system performance.</li>
            </ul>
            <InfoBox type="info">
              Xelpay does <strong>NOT</strong> use your data for third-party advertising, profiling, or sale to data brokers under any circumstances.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="4. Cookies & Tracking Technologies" icon={Cookie} accent="green">
            <p>Xelpay uses the following technologies on our platform:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Essential Session Cookies:</strong> Required for maintaining authenticated dashboard sessions. These are strictly necessary and cannot be disabled.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Preference Storage (LocalStorage):</strong> Used to store user interface preferences such as language selection and theme settings.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Security Tokens:</strong> CSRF and authentication tokens stored securely for session integrity.</li>
            </ul>
            <p className="mt-3">We do <strong>NOT</strong> deploy: third-party advertising cookies, cross-site tracking pixels, behavioral analytics scripts, or any third-party profiling technologies on our platform.</p>
          </SectionBlock>

          <SectionBlock title="5. Third-Party Data Sharing & Disclosure" icon={Users} accent="green">
            <p><strong className="text-slate-800 dark:text-slate-200">Xelpay does NOT monetize or sell your personal data.</strong> Data is disclosed to third parties only under the following strictly limited circumstances:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Infrastructure Providers:</strong> Cloud hosting and infrastructure partners (e.g., Vercel, Supabase) who process data solely on Xelpay's behalf under strict data processing agreements.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Legal & Regulatory Disclosure:</strong> When required by valid court order, law enforcement request, or regulatory directive under applicable Bangladeshi law.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Fraud Prevention:</strong> To competent fraud prevention agencies or financial intelligence units where legally required or permitted.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Business Transfer:</strong> In the event of a merger, acquisition, or sale of Xenverse IT's assets, data may be transferred to the acquiring entity, subject to equivalent privacy protections.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">With Your Explicit Consent:</strong> In any other circumstance where you have provided prior, explicit, and informed written consent.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="6. Data Security & Breach Notification Protocol" icon={Lock} accent="green">
            <p>Xelpay deploys multiple layers of security to protect your information:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Encryption at Rest:</strong> All sensitive data stored in our databases is encrypted using industry-standard AES-256 encryption.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Encryption in Transit:</strong> All data transmission between your systems and Xelpay's infrastructure occurs exclusively over TLS 1.2 or higher encrypted connections.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Access Controls:</strong> Strict role-based access controls limit internal employee access to sensitive data on a need-to-know basis, with comprehensive audit logging.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Security Monitoring:</strong> Continuous automated monitoring for anomalous access patterns, intrusion attempts, and potential security threats.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Breach Notification:</strong> In the event of a confirmed data breach affecting your personal data, Xelpay will notify affected Merchants within seventy-two (72) hours of becoming aware of the breach, as required by applicable law.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Limitation:</strong> Notwithstanding the above, no system is impenetrable. Xelpay cannot guarantee absolute security against all possible threats and disclaims liability for breaches resulting from sophisticated state-sponsored attacks or zero-day vulnerabilities beyond our reasonable control.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="7. Consent to Electronic Communications" icon={Bell} accent="green">
            <p>By registering a Xelpay account, you explicitly and freely consent to receive electronic communications from Xelpay to your registered contact details, including:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Transactional & Operational:</strong> Payment verification alerts, API status notifications, webhook delivery failure reports, and system security alerts. These are mandatory and cannot be opted out of while maintaining an active account.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">System Updates & Policy Changes:</strong> Notifications regarding updates to Terms of Service, Privacy Policy, API deprecation, and material platform changes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Promotional & Marketing:</strong> Newsletters, feature announcements, and promotional offers. You may opt out of marketing communications at any time via the unsubscribe link in any such email or by contacting support.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="8. Data Retention Policy" icon={Database} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">Active Account Data:</strong> Retained for the full duration of your active subscription and account status.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">KYC & Business Verification Documents:</strong> Retained for a minimum of five (5) years from the date of submission, or longer if required by BFIU or Bangladesh Bank directives.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Post-Termination AML Retention:</strong> Following account termination, transaction records and KYC documentation are retained for a minimum of five (5) years to comply with the Money Laundering Prevention Act, 2012.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Add-On Usage Records:</strong> Retained for a minimum of three (3) years for billing dispute resolution and audit purposes.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Log Data:</strong> System access logs and API request logs are retained for up to ninety (90) days for active dashboard display, and up to five (5) years in encrypted backend archives for AML compliance.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Support Communications:</strong> Retained for up to two (2) years for quality assurance and dispute resolution purposes.</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="9. Your Data Rights & Account Deletion" icon={Trash2} accent="green">
            <p>Subject to applicable law and our AML retention obligations, you possess the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Right of Access:</strong> Request a copy of the personal data Xelpay holds about you.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data, subject to our legal retention obligations under AML regulations.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Data Portability:</strong> Request your data in a structured, machine-readable format where technically feasible.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Object:</strong> Object to the processing of your data based on legitimate interests.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time, without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className="mt-3">To exercise any of the above rights, contact us at our official support email. We will respond to verified requests within thirty (30) days, subject to identity verification requirements.</p>
          </SectionBlock>

          <SectionBlock title="10. Children's Privacy" icon={UserCheck} accent="red">
            <InfoBox type="warning">
              Xelpay services are strictly intended for users who are 18 years of age or older. We do not knowingly collect personal data from individuals under the age of 18. If we become aware that we have inadvertently collected data from a minor, we will take immediate steps to delete such data. If you believe we may have collected data from a minor, please contact us immediately.
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="11. International Data Transfers" icon={Globe} accent="green">
            <p>Xelpay primarily operates from Bangladesh. However, due to our use of cloud infrastructure providers such as Vercel and Supabase, certain data may be processed on servers located in other countries, including but not limited to the United States and European Union member states.</p>
            <p className="mt-3">We ensure that any such international transfer of data is conducted in compliance with applicable data protection laws and is subject to appropriate safeguards, including data processing agreements with our infrastructure providers that incorporate standard data protection clauses.</p>
          </SectionBlock>

          <SectionBlock title="12. Contact & Data Protection Inquiries" icon={Mail} accent="green">
            <p>For all privacy-related concerns, data access requests, account deletion requests, or to report a suspected data breach, please contact Xelpay's Data Protection team via our official support email address published on our website.</p>
            <p className="mt-3">For legal notices or regulatory correspondence, include "LEGAL NOTICE" in the subject line of your communication to ensure proper routing and expedited handling by our compliance team.</p>
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
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={22} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">সেবার শর্তাবলী</h2>
        </div>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Xelpay</strong> — <strong className="text-slate-900 dark:text-white">Xenverse IT</strong> পরিচালিত একটি কঠোরভাবে B2B পেমেন্ট ভেরিফিকেশন অবকাঠামো-তে আপনাকে স্বাগতম। Xelpay প্ল্যাটফর্ম, API, ড্যাশবোর্ড বা যেকোনো সংশ্লিষ্ট পরিষেবা অ্যাক্সেস বা ব্যবহার করে, আপনি — মার্চেন্ট — এই আইনগতভাবে বাধ্যকর দলিলের প্রতিটি ধারায় নিঃশর্তভাবে সম্মত হচ্ছেন।
          </p>

          <SectionBlock title="১. শর্তাবলী পরিবর্তনের অধিকার" icon={RefreshCw} accent="blue">
            <InfoBox type="info">
              <strong>কর্তৃপক্ষের অধিকার:</strong> Xelpay (Xenverse IT) যেকোনো সময়, সম্পূর্ণরূপে নিজেদের বিবেচনায়, এই সেবার শর্তাবলী, গোপনীয়তা নীতি, গ্রহণযোগ্য ব্যবহার নীতি বা যেকোনো সংশ্লিষ্ট মূল্য নির্ধারণ ও ফিচার ডকুমেন্টেশনের যেকোনো অংশ পূর্ব নোটিশ সহ বা ছাড়াই পরিবর্তন, সংশোধন, আপডেট বা প্রতিস্থাপন করার একক ও পরম অধিকার সংরক্ষণ করে।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২. সেবার বিবরণ ও মূল দায়মুক্তি" icon={Server} accent="blue">
            <p>Xelpay হলো একটি সম্পূর্ণ প্রযুক্তিগত অবকাঠামো যা মোবাইল ফিনান্সিয়াল সার্ভিস (MFS), ব্যাংক ট্রান্সফার এবং বাংলাদেশে সংশ্লিষ্ট ডিজিটাল পেমেন্ট পদ্ধতির জন্য পেমেন্ট ভেরিফিকেশন প্রদান করে।</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">অত্যন্ত গুরুত্বপূর্ণ আর্থিক দায়মুক্তি</strong>
              Xelpay এক​টি সফটওয়্যার লেয়ার — এটি কোনো ব্যাংক, আর্থিক প্রতিষ্ঠান, ডিজিটাল ওয়ালেট, পেমেন্ট অ্যাগ্রিগেটর বা মানি সার্ভিস বিজনেস <strong>নয়</strong>।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৩. যোগ্যতা, অ্যাকাউন্টের দায়িত্ব ও বয়স সীমাবদ্ধতা" icon={UserCheck} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">বয়স সীমাবদ্ধতা:</strong> নিবন্ধন ও ব্যবহারের জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক যোগ্যতা:</strong> Xelpay একটি সম্পূর্ণ B2B প্ল্যাটফর্ম।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">তথ্যের নির্ভুলতা:</strong> নিবন্ধনের সময় সম্পূর্ণ, সঠিক ও সত্য তথ্য প্রদান করতে আপনি সম্মত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্টের নিরাপত্তা:</strong> আপনার API কী ও ড্যাশবোর্ড অ্যাক্সেসের গোপনীয়তা বজায় রাখা আপনার একক দায়িত্ব।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">একটি অ্যাকাউন্ট নীতি:</strong> প্রতিটি ব্যবসায়িক সত্তার জন্য শুধুমাত্র একটি সক্রিয় Xelpay মার্চেন্ট অ্যাকাউন্ট অনুমোদিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডেমো মোডের সীমাবদ্ধতা:</strong> ডেমো মোডে প্রক্রিয়াকৃত লেনদেন সম্পূর্ণরূপে সিমুলেটেড এবং লাইভ বাণিজ্যিক লেনদেনের জন্য এর ব্যবহার কঠোরভাবে নিষিদ্ধ।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৪. মেধা সম্পত্তি অধিকার (IP Rights)" icon={BookOpen} accent="purple">
            <p>Xelpay-এর সাথে সংযুক্ত সমস্ত সোর্স কোড, UI/UX ডিজাইন, API আর্কিটেকচার, অ্যালগরিদম, লোগো, ট্রেডমার্ক ও অন্যান্য মেধা সম্পত্তি Xenverse IT-এর একক মালিকানাধীন।</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>আপনাকে শুধুমাত্র আপনার নিজের বৈধ ব্যবসায়িক কার্যক্রমের জন্য আমাদের API ব্যবহার করার একটি <strong>সীমিত, অ-একচেটিয়া, হস্তান্তরযোগ্য নয় এমন, প্রত্যাহারযোগ্য লাইসেন্স</strong> প্রদান করা হয়।</li>
              <li>আমাদের প্ল্যাটফর্মের যেকোনো অংশ কপি, ক্লোন, স্ক্র্যাপ, রিভার্স-ইঞ্জিনিয়ার, ডিকম্পাইল, পুনরায় বিক্রি বা ডেরিভেটিভ কাজ তৈরি <strong>না করতে</strong> আপনি কঠোরভাবে সম্মত।</li>
              <li>Xelpay-এর IP-এর যেকোনো অননুমোদিত ব্যবহার লঙ্ঘন গঠন করে এবং দেওয়ানি ও ফৌজদারি আইনি প্রতিকারের মাধ্যমে বিচার করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৫. সাবস্ক্রিপশন, বিলিং, মূল্য নির্ধারণ, অ্যাড-অন সেবা ও কঠোর অ-ফেরতযোগ্য নীতি" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">ফ্রি/স্টার্টার টায়ার:</strong> Xelpay সীমিত বৈশিষ্ট্য সহ একটি বিনামূল্যের বা স্টার্টার টায়ার অফার করতে পারে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পেইড সাবস্ক্রিপশন:</strong> প্রিমিয়াম বৈশিষ্ট্যে অ্যাক্সেসের জন্য একটি পেইড সাবস্ক্রিপশন প্রয়োজন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মূল্য পরিবর্তন:</strong> Xelpay যেকোনো সময় সাবস্ক্রিপশন মূল্য পরিবর্তনের অধিকার সংরক্ষণ করে।</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">অ্যাড-অন সেবা ও ব্যবহার-ভিত্তিক বিলিং:</strong>
                <div className="mt-3">
                  <InfoBox type="warning">
                    <strong>গুরুত্বপূর্ণ:</strong> একটি অ্যাড-অন সেবা সক্ষম করা সংশ্লিষ্ট ব্যবহার-ভিত্তিক মূল্য নির্ধারণে আপনার বাধ্যকর সম্মতি গঠন করে।
                  </InfoBox>
                </div>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">কঠোর অ-ফেরতযোগ্য নীতি:</strong> Xelpay-কে করা সমস্ত পেমেন্ট সম্পূর্ণরূপে অ-ফেরতযোগ্য।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">চার্জব্যাক ও পেমেন্ট বিরোধ:</strong> অভ্যন্তরীণ বিরোধ নিষ্পত্তি প্রক্রিয়া শেষ না করে চার্জব্যাক শুরু করা এই শর্তের একটি বস্তুগত লঙ্ঘন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">কর:</strong> আপনার অ্যাকাউন্ট কার্যক্রম থেকে উদ্ভূত সমস্ত প্রযোজ্য করের জন্য আপনি একাই দায়ী।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৬. গ্রহণযোগ্য ব্যবহার নীতি (AUP) ও নিষিদ্ধ আচরণ" icon={AlertTriangle} accent="red">
            <p>Xelpay অপব্যবহারের বিরুদ্ধে <strong className="text-slate-800 dark:text-slate-200">শূন্য-সহনশীলতা নীতি</strong> বজায় রাখে।</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <li>অবৈধ পণ্য, মাদকদ্রব্য, নিয়ন্ত্রিত পদার্থ, প্রাপ্তবয়স্ক/পর্নোগ্রাফিক বিষয়বস্তু, অ-লাইসেন্সপ্রাপ্ত ওষুধপত্র, অননুমোদিত জুয়া পরিষেবার জন্য পেমেন্ট প্রক্রিয়াকরণ।</li>
              <li>মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ এবং সন্ত্রাসবিরোধী আইন, ২০০৯ (বাংলাদেশ) লঙ্ঘন করে অর্থ পাচার করা।</li>
              <li>স্ক্যাম, পন্জি স্কিম, পিরামিড স্কিম, প্রতারণামূলক বিনিয়োগ পরিকল্পনা পরিচালনা।</li>
              <li>ইচ্ছাকৃতভাবে Xelpay API, সার্ভার বা সংযুক্ত তৃতীয় পক্ষের সিস্টেমের বিরুদ্ধে DDoS আক্রমণ পরিচালনা করা।</li>
              <li>ডিজিটাল নিরাপত্তা আইন, ২০১৮ (বাংলাদেশ) লঙ্ঘন করে Xelpay-এর ডেটাবেস বা প্রশাসনিক প্যানেলে অননুমোদিত প্রবেশ।</li>
              <li>মানব পাচার, শিশু শোষণ, বা ব্যক্তিদের বিরুদ্ধে যেকোনো অপরাধ সহজতর করতে প্ল্যাটফর্ম ব্যবহার করা।</li>
              <li>OFAC, জাতিসংঘ নিরাপত্তা পরিষদের নিষেধাজ্ঞা তালিকা বা বাংলাদেশ ব্যাংকের নির্দেশ দ্বারা নিষিদ্ধ তালিকাভুক্ত কোনো সত্তা বা ব্যক্তির অ্যাকাউন্ট পরিচালনা করা।</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">প্রয়োগমূলক পদক্ষেপ</strong>
              এই AUP-এর যেকোনো লঙ্ঘন আপনার মার্চেন্ট অ্যাকাউন্টের তাৎক্ষণিক, অপরিবর্তনীয়, স্থায়ী নিষিদ্ধকরণ, সমস্ত API অ্যাক্সেস বাতিল এবং বাংলাদেশ আইন প্রয়োগকারী সংস্থার কাছে রেফারেল ঘটাবে।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৭. তৃতীয় পক্ষের ইন্টিগ্রেশন (IMAP, Telegram, SMS ও বাহ্যিক API)" icon={Smartphone} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">কাস্টম টেলিগ্রাম বট:</strong> আপনার Telegram বট টোকেনের নিরাপত্তা ও ব্যবস্থাপনার জন্য আপনি একাই দায়ী।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">IMAP ব্যাংক ইমেইল সিঙ্ক্রোনাইজেশন:</strong> Xelpay শুধুমাত্র পেমেন্ট নিশ্চিতকরণ ইমেইল পার্স করার উদ্দেশ্যে পঠন-কেবল অ্যাক্সেস ব্যবহার করে।</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">SMS রিলে ও ডিভাইস অ্যাপ — গুরুত্বপূর্ণ নির্ভরতা:</strong>
                <div className="mt-3">
                  <InfoBox type="warning">
                    <strong className="block mb-1">গুরুত্বপূর্ণ ডিভাইস ও সংযোগ প্রয়োজনীয়তা:</strong>
                    SMS রিলে যাচাই সিস্টেমের নিরবচ্ছিন্ন ও নির্ভুল কার্যকারিতা সম্পূর্ণরূপে নির্ভর করে মার্চেন্টের একটি ডেডিকেটেড অ্যান্ড্রয়েড ডিভাইসে Xelpay রিলে অ্যাপ ইনস্টল করে সর্বদা চালু ও স্থিতিশীল ইন্টারনেটে সংযুক্ত রাখার উপর।
                  </InfoBox>
                </div>
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">MFS SMS ফরম্যাট পরিবর্তন ও Xelpay-এর সম্পূর্ণ শূন্য দায়বদ্ধতা:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>MFS অপারেটররা তাদের নিজস্ব বিবেচনায় এবং Xelpay বা মার্চেন্টকে পূর্ববর্তী নোটিশ না দিয়ে তাদের SMS ফরম্যাট পরিবর্তন করতে পারে।</li>
                  <li><strong className="text-slate-800 dark:text-slate-200">Xelpay সম্পূর্ণরূপে কোনো আর্থিক, আইনি বা অপারেশনাল দায়বদ্ধতা বহন করে না</strong> এই ধরনের তৃতীয় পক্ষের পরিবর্তনের ফলে ব্যর্থ বা মিস করা পেমেন্ট ভেরিফিকেশনের জন্য।</li>
                </ul>
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">SMS স্পুফিং ও মিথ্যা ইতিবাচক — শূন্য দায়বদ্ধতা:</strong>
                <div className="mt-3">
                  <InfoBox type="danger">
                    <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায়বদ্ধতা — SMS স্পুফিং</strong>
                    যেকোনো ব্যক্তি — গ্রাহক, তৃতীয় পক্ষ বা দুর্ভাবনাপ্রসূত কারো মাধ্যমে — মার্চেন্টের রিলে ডিভাইসে কোনো জাল, স্পুফড বা নকল SMS পাঠিয়ে Xelpay-কে একটি ভুয়া পেমেন্ট নিশ্চিতকরণ প্রেরণ করলে, Xelpay সেই ভুল ভেরিফিকেশনের জন্য কোনো আর্থিক, আইনি বা ক্ষতিপূরণমূলক দায়বদ্ধতা বহন করে না।
                  </InfoBox>
                </div>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">ওয়েবহুক ডেলিভারি ও মার্চেন্ট সার্ভার দায়িত্ব:</strong> Xelpay মার্চেন্ট সার্ভার ডাউনটাইম বা ভুল কনফিগারেশনের কারণে মিস করা ওয়েবহুকের জন্য কোনো দায়বদ্ধতা বহন করে না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৮. সেবার স্তর, আপটাইম ও ডাউনটাইম" icon={Server} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">আপটাইমের কোনো গ্যারান্টি নেই:</strong> পৃথক এন্টারপ্রাইজ চুক্তিতে স্পষ্টভাবে উল্লেখ না থাকলে Xelpay কোনো নির্দিষ্ট SLA প্রদান বা গ্যারান্টি দেয় না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নির্ধারিত রক্ষণাবেক্ষণ:</strong> Xelpay যেকোনো সময় রক্ষণাবেক্ষণ পরিচালনার অধিকার সংরক্ষণ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডাউনটাইমের জন্য কোনো দায় নেই:</strong> প্ল্যাটফর্ম ডাউনটাইম থেকে উদ্ভূত ব্যবসায়িক ক্ষতির জন্য Xelpay কোনো দায়বদ্ধতা স্বীকার করে না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৯. অ্যাকাউন্ট বাতিল ও স্থগিতকরণের অধিকার" icon={AlertCircle} accent="red">
            <p>Xelpay যেকোনো সময়, পূর্ববর্তী নোটিশ সহ বা ছাড়াই আপনার অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট API অ্যাক্সেস অবিলম্বে স্থগিত বা স্থায়ীভাবে বাতিল করার একক অধিকার সংরক্ষণ করে।</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>আমরা এই শর্তাবলী বা AUP-এর যেকোনো লঙ্ঘন সন্দেহ করি।</li>
              <li>আমরা আপনার অ্যাকাউন্টে অস্বাভাবিক, সন্দেহজনক বা সম্ভাব্য প্রতারণামূলক কার্যক্রম সনাক্ত করি।</li>
              <li>প্রযোজ্য আইন, আদালতের আদেশ বা নিয়ন্ত্রক কর্তৃপক্ষ দ্বারা আমাদের তা করতে হয়।</li>
              <li>আমরা নির্ধারণ করি যে আপনার ব্যবহার আমাদের অবকাঠামো বা অন্যান্য ব্যবহারকারীদের জন্য গুরুতর নিরাপত্তা, আইনি বা অপারেশনাল ঝুঁকি তৈরি করে।</li>
              <li>মার্চেন্ট ধারা ১৫-তে বর্ণিত KYC/ব্যবসা যাচাই অনুরোধের সাথে সম্মতি করতে ব্যর্থ হয়েছে বলে আমরা নির্ধারণ করি।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১০. ফোর্স ম্যাজর, দায়ের সীমাবদ্ধতা ও ক্ষতিপূরণ" icon={Scale} accent="amber">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">ফোর্স ম্যাজর:</strong> আমাদের যুক্তিসঙ্গত নিয়ন্ত্রণের বাইরের পরিস্থিতি থেকে উদ্ভূত কোনো ব্যর্থতা বা বিলম্বের জন্য Xelpay দায়ী নয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">MFS/ব্যাংক অ্যাকাউন্ট সংক্রান্ত দায়ের সীমাবদ্ধতা:</strong> MFS অপারেটর বা ব্যাংকের নিজস্ব সিস্টেম থেকে উদ্ভূত যেকোনো সমস্যার জন্য Xelpay কোনো দায়বদ্ধতা বহন করে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সাধারণ দায়ের সীমা:</strong> Xelpay-এর সামগ্রিক দায়বদ্ধতা দাবির পূর্ববর্তী তিন (৩) মাসে আপনার প্রদত্ত মোট সাবস্ক্রিপশন ফি-এর বেশি হবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পরোক্ষ ক্ষতি বাদ:</strong> Xelpay কোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ বা পরিণতিমূলক ক্ষতির জন্য দায়ী থাকবে না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ক্ষতিপূরণ:</strong> আপনি Xelpay এবং Xenverse IT-কে আপনার ব্যবহার বা এই শর্তাবলীর লঙ্ঘন থেকে উদ্ভূত যেকোনো দাবি থেকে রক্ষা ও ক্ষতিপূরণ দিতে সম্মত।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১১. বিরোধ নিষ্পত্তি ও ক্লাস-অ্যাকশন পরিত্যাগ" icon={Gavel} accent="purple">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">প্রথমে অনানুষ্ঠানিক সমাধান:</strong> আনুষ্ঠানিক আইনি কার্যক্রম শুরুর আগে, উভয় পক্ষ Xelpay-এর সহায়তা দলের সাথে যোগাযোগ করে ৩০ দিনের মধ্যে সৎভাবে সমাধানের চেষ্টা করতে সম্মত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ক্লাস-অ্যাকশন পরিত্যাগ:</strong> আপনি Xelpay-এর বিরুদ্ধে যেকোনো ক্লাস অ্যাকশনে অংশগ্রহণের অধিকার স্পষ্টভাবে ও অপরিবর্তনীয়ভাবে পরিত্যাগ করেন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক সালিশি:</strong> যেকোনো অমীমাংসিত বিরোধ ঢাকা, বাংলাদেশে বাংলাদেশের প্রাসঙ্গিক সালিশি কর্তৃপক্ষের নিয়মের অধীনে বাধ্যতামূলক সালিশের মাধ্যমে সমাধান করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১২. প্রযোজ্য আইন, এখতিয়ার ও বিভাজ্যতা" icon={Building2} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">প্রযোজ্য আইন:</strong> এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন অনুযায়ী পরিচালিত ও ব্যাখ্যা করা হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">এখতিয়ার:</strong> এই শর্তাবলীর অধীনে উদ্ভূত বিষয়গুলির জন্য আপনি ঢাকা, বাংলাদেশের আদালতের একক এখতিয়ারে সম্মত হন।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বিভাজ্যতা:</strong> যদি কোনো ধারা অকার্যকর বা অপ্রয়োগযোগ্য বলে ঘোষণা করা হয়, বাকি ধারাগুলি পূর্ণ কার্যকারিতায় অব্যাহত থাকবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সম্পূর্ণ চুক্তি:</strong> এই দলিল আপনার এবং Xelpay-এর মধ্যে সম্পূর্ণ এবং একমাত্র চুক্তি গঠন করে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৩. অ্যাফিলিয়েট প্রোগ্রামের শর্তাবলী" icon={Users} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">যোগ্যতা:</strong> Xelpay অ্যাফিলিয়েট প্রোগ্রামে অংশগ্রহণ যাচাইকৃত, সক্রিয় Xelpay মার্চেন্টদের জন্য উন্মুক্ত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ প্রচার পদ্ধতি:</strong> অ্যাফিলিয়েটরা স্প্যাম, বিভ্রান্তিকর বিজ্ঞাপন বা যেকোনো প্রতারণামূলক বিপণন অনুশীলন ব্যবহার করতে কঠোরভাবে নিষিদ্ধ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">স্ব-রেফারেল নিষিদ্ধ:</strong> ডুপ্লিকেট অ্যাকাউন্ট তৈরি করে নিজেকে রেফার করা জালিয়াতি গঠন করে এবং প্রোগ্রাম থেকে তাৎক্ষণিক বহিষ্কারের ফলে হবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">কমিশন বাজেয়াপ্ত:</strong> প্রতারণামূলক রেফারেলের মাধ্যমে অর্জিত কমিশন সম্পূর্ণরূপে বাজেয়াপ্ত করা হবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৪. পেমেন্ট লিংক ও চেকআউট পেজ" icon={CreditCard} accent="blue">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের দায়িত্ব:</strong> মার্চেন্টরা Xelpay-জেনারেটেড পেমেন্ট লিংক ও হোস্টেড চেকআউট পেজের মাধ্যমে শেষ-গ্রাহকদের কাছে উপস্থাপিত সমস্ত পণ্যের বিবরণ, মূল্য ও বিক্রয়ের শর্তের সঠিকতার জন্য একাই দায়ী।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পেমেন্ট লিংকে নিষিদ্ধ বিষয়বস্তু:</strong> পেমেন্ট লিংক ও চেকআউট পেজ ধারা ৬ (AUP)-তে সংজ্ঞায়িত নিষিদ্ধ পণ্য বা পরিষেবা বিক্রির সুবিধার জন্য ব্যবহার করা যাবে না।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৫. KYC ও ব্যবসা যাচাইকরণ" icon={Fingerprint} accent="orange">
            <p>বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU) নির্দেশিকা, অ্যান্টি-মানি লন্ডারিং (AML) বিধিমালা, মানি লন্ডারিং প্রতিরোধ আইন, ২০১২, এবং সন্ত্রাসবিরোধী আইন, ২০০৯-এর কঠোর সম্মতিতে, Xelpay যেকোনো সময় যেকোনো মার্চেন্টের কাছ থেকে KYC এবং ব্যবসা যাচাই ডকুমেন্টেশন অনুরোধ করার অধিকার সংরক্ষণ করে।</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">অনুরোধকৃত ডকুমেন্টেশন:</strong> এতে বৈধ সরকার-প্রদত্ত জাতীয় পরিচয়পত্র (NID), ট্রেড লাইসেন্স, নিবন্ধন সনদ, TIN সার্টিফিকেট এবং ব্যবসায়িক ঠিকানার প্রমাণ অন্তর্ভুক্ত থাকতে পারে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বাধ্যতামূলক সম্মতির দায়িত্ব:</strong> KYC অনুরোধ পাওয়ার পর নির্দিষ্ট সময়সীমার মধ্যে সমস্ত অনুরোধকৃত ডকুমেন্টেশন প্রদান করা মার্চেন্টের বাধ্যবাধকতা।</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">অ-সম্মতির পরিণতি:</strong>
                <InfoBox type="danger">
                  <strong className="uppercase tracking-widest text-[11px] block mb-1">KYC-জনিত স্থগিতকরণে কোনো ফেরত নেই</strong>
                  KYC বা ব্যবসা যাচাই অনুরোধের অ-সম্মতির কারণে অ্যাকাউন্ট স্থগিতকরণ বা বন্ধকরণ মার্চেন্টকে ধারা ৫-এ উল্লিখিত কঠোর অ-ফেরতযোগ্য নীতির অধীনে কোনো ফেরত পাওয়ার অধিকার দেয় না।
                </InfoBox>
              </li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৬. বিপরীত লেনদেন, MFS ক্ল্যাওব্যাক ও অপারেটর বিরোধ" icon={ShieldAlert} accent="red">
            <p>Xelpay-এর ভূমিকা একটি প্রযুক্তিগত যাচাই মধ্যস্থতাকারীর মধ্যে কঠোরভাবে সীমাবদ্ধ।</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">সম্পূর্ণ শূন্য দায়বদ্ধতা — লেনদেন বিপরীতকরণ</strong>
              Xelpay-এর সিস্টেম দ্বারা পূর্বে যাচাই ও নিশ্চিত করা যেকোনো পেমেন্ট লেনদেন যদি পরবর্তীতে মূল গ্রাহক/প্রেরক, MFS অপারেটর, ব্যাংক বা যেকোনো আর্থিক বা নিয়ন্ত্রক কর্তৃপক্ষ দ্বারা বিপরীত, প্রত্যাহার বা বিতর্কিত হয়, Xelpay সেই বিপরীতকরণ বা মার্চেন্টের ফলস্বরূপ আর্থিক ক্ষতির জন্য কোনো আর্থিক, আইনি বা ক্ষতিপূরণমূলক দায়বদ্ধতা বহন করে না।
            </InfoBox>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের স্বাধীন ঝুঁকি দায়িত্ব:</strong> মার্চেন্ট তাদের ব্যবসার মাধ্যমে পরিচালিত সমস্ত বাণিজ্যিক লেনদেনের জন্য পূর্ণ এবং স্বাধীন আর্থিক ঝুঁকি গ্রহণ করে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্ট ও গ্রাহকের মধ্যে বিরোধ নিষ্পত্তি:</strong> মার্চেন্ট ও শেষ-গ্রাহকের মধ্যে পেমেন্ট, ফেরত বা সেবা প্রদান সংক্রান্ত যেকোনো বিরোধ নিষ্পত্তি করা একান্তভাবে মার্চেন্টের দায়িত্ব।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="১৭. কঠোর B2B সেবা — শেষ-গ্রাহক সহায়তার কোনো বাধ্যবাধকতা নেই" icon={Users} accent="blue">
            <p>Xelpay একটি একচেটিয়া <strong className="text-slate-800 dark:text-slate-200">বিজনেস-টু-বিজনেস (B2B)</strong> প্ল্যাটফর্ম।</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহকদের সাথে কোনো সম্পর্ক নেই:</strong> Xelpay-এর যেকোনো মার্চেন্টের শেষ-গ্রাহকদের সাথে কোনো সরাসরি আইনি, চুক্তিগত বা পরিষেবা সম্পর্ক নেই।</li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহকদের জন্য কোনো সহায়তা বাধ্যবাধকতা নেই:</strong>
                <InfoBox type="info">
                  <strong>মার্চেন্টের দায়িত্ব:</strong> পর্যাপ্ত গ্রাহক সহায়তা প্রদান করা, নিজস্ব ফেরতের নীতি মেনে চলা এবং সমস্ত প্রযোজ্য ভোক্তা সুরক্ষা আইন মেনে চলা একান্তভাবে মার্চেন্টের দায়িত্ব।
                </InfoBox>
              </li>
              <li><strong className="text-slate-800 dark:text-slate-200">শেষ-গ্রাহক দাবির জন্য মার্চেন্টের ক্ষতিপূরণ দায়িত্ব:</strong> মার্চেন্ট যেকোনো শেষ-গ্রাহকের দ্বারা উত্থাপিত যেকোনো দাবি থেকে Xelpay-কে সম্পূর্ণ ক্ষতিপূরণ দিতে এবং রক্ষা করতে সম্মত।</li>
            </ul>
          </SectionBlock>

          {/* ─── নতুন ধারাসমূহ ১৮–২৫ ─── */}

          <SectionBlock title="১৮. ওয়েবহুক আইডেম্পোটেন্সি ও দ্বি-ক্রেডিটিং প্রতিরোধ" icon={Repeat} accent="teal">
            <p>Xelpay-এর ওয়েবহুক ডেলিভারি সিস্টেম নেটওয়ার্ক টাইমআউট বা ক্ষণস্থায়ী সংযোগ ব্যর্থতার ক্ষেত্রে মার্চেন্টের কনফিগার করা এন্ডপয়েন্টে ওয়েবহুক নোটিফিকেশন পুনরায় ডেলিভারি করার চেষ্টা করতে পারে।</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">পরম প্রযুক্তিগত দায়িত্ব — মার্চেন্ট ডেভেলপারের বাধ্যবাধকতা</strong>
              মার্চেন্টের ডেভেলপমেন্ট টিমের <strong>পরম ও অ-প্রতিনিধিযোগ্য প্রযুক্তিগত দায়িত্ব</strong> হলো তাদের ওয়েবহুক রিসিভার এন্ডপয়েন্টে কঠোর <strong>আইডেম্পোটেন্সি (Idempotency)</strong> লজিক বাস্তবায়ন করা। প্রতিটি অনন্য Xelpay লেনদেন রেফারেন্স আইডি ট্র্যাক করতে হবে এবং ইতিমধ্যে প্রক্রিয়া করা লেনদেনের রেফারেন্স করা যেকোনো ডুপ্লিকেট ওয়েবহুক পেলোড স্পষ্টভাবে প্রত্যাখ্যান বা উপেক্ষা করতে হবে। আইডেম্পোটেন্সি বাস্তবায়নে ব্যর্থতা মার্চেন্ট-পক্ষের একটি প্রযুক্তিগত ত্রুটি, এবং Xelpay একজন শেষ-গ্রাহককে ডুপ্লিকেট ওয়েবহুক ডেলিভারি প্রক্রিয়াকরণের কারণে দ্বি-ক্রেডিটিং, দ্বি-পূরণ বা অন্যথায় ভুলভাবে প্রক্রিয়াকরণের ক্ষেত্রে <strong>কোনো আর্থিক, আইনি বা অপারেশনাল দায়বদ্ধতা বহন করবে না</strong>।
            </InfoBox>
            <p className="mt-2">Xelpay প্রতিটি ওয়েবহুক পেলোডে একটি অনন্য, অপরিবর্তনীয় লেনদেন রেফারেন্স আইডেন্টিফায়ার প্রদান করে। মার্চেন্টদের এই আইডেন্টিফায়ারকে তাদের আইডেম্পোটেন্সি কীর ভিত্তি হিসেবে ব্যবহার করতে হবে।</p>
          </SectionBlock>

          <SectionBlock title="১৯. নিয়ন্ত্রক বন্ধ ও সম্মতি-বাধ্যতামূলক পরিষেবা বাতিল" icon={Ban} accent="red">
            <p>Xelpay গণপ্রজাতন্ত্রী বাংলাদেশের সমস্ত প্রযোজ্য আইন ও বিধিমালার সম্পূর্ণ সম্মতিতে পরিচালিত হয়। Xelpay প্ল্যাটফর্মের কিছু মূল কার্যকারিতা — বিশেষত রিলে অ্যাপের মাধ্যমে SMS-পঠন অটোমেশন এবং IMAP-ভিত্তিক ব্যাংক ইমেইল পার্সিং — বাংলাদেশ আইন ও নিয়ন্ত্রক কাঠামোর অধীনে এই ধরনের প্রযুক্তিগত কার্যক্রমের অব্যাহত বৈধতার উপর নির্ভরশীল।</p>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">নিয়ন্ত্রক বন্ধ — শূন্য দায় ও শূন্য ফেরত</strong>
              বাংলাদেশ ব্যাংক, বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC), বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU), বা অন্য যেকোনো সক্ষম সরকারি বা নিয়ন্ত্রক কর্তৃপক্ষ SMS-পঠন অটোমেশন, IMAP ইমেইল পার্সিং বা Xelpay-এর পরিষেবা প্রদানের উপর নির্ভরশীল অন্য যেকোনো প্রযুক্তিগত পদ্ধতি সীমাবদ্ধ, সীমিত, নিষিদ্ধ বা অনুমোদন অযোগ্য ঘোষণা করে এমন কোনো নির্দেশিকা, সার্কুলার, আদেশ বা নির্দেশনা জারি করলে, <strong>Xelpay স্পষ্টভাবে পূর্ব নোটিশ ছাড়াই, কোনো ক্ষতিপূরণ, বিকল্প পরিষেবা বা যেকোনো ধরনের অর্থ ফেরত প্রদানের বাধ্যবাধকতা ছাড়াই প্রভাবিত পরিষেবা বা সম্পূর্ণ প্ল্যাটফর্ম তাৎক্ষণিকভাবে স্থগিত, সীমাবদ্ধ বা স্থায়ীভাবে বাতিল করার একক ও পরম অধিকার সংরক্ষণ করে</strong>।
            </InfoBox>
            <p className="mt-2">মার্চেন্টরা Xelpay পরিষেবা ব্যবহারের একটি মৌলিক শর্ত হিসেবে এই অন্তর্নিহিত নিয়ন্ত্রক ঝুঁকি স্বীকার করে এবং গ্রহণ করে। এই বিধানটি এই শর্তাবলীর ধারা ১০-এর অধীনে একটি ফোর্স ম্যাজর ঘটনা হিসেবেও গণ্য হবে।</p>
          </SectionBlock>

          <SectionBlock title="২০. প্রচার ও বিপণন অধিকার" icon={Zap} accent="purple">
            <p>নিবন্ধন সম্পন্ন করে এবং একটি Xelpay মার্চেন্ট অ্যাকাউন্ট সক্রিয় করে, এবং নিচে বর্ণিত অপ্ট-আউট প্রক্রিয়ার শর্তাধীনে, মার্চেন্ট Xelpay এবং Xenverse IT-কে নিম্নলিখিত সীমিত বিপণন উদ্দেশ্যে মার্চেন্টের ব্যবসায়িক নাম, ব্র্যান্ড নাম এবং সংশ্লিষ্ট লোগো ব্যবহার করার একটি <strong>অ-একচেটিয়া, রয়্যালটি-মুক্ত লাইসেন্স</strong> প্রদান করে:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Xelpay-এর অফিসিয়াল ওয়েবসাইটের "আমাদের বিশ্বস্ত মার্চেন্ট" বা "পাওয়ার্ড বাই" বিভাগে অন্তর্ভুক্তি।</li>
              <li>গোপনীয় ব্যবসায়িক মেট্রিক্স প্রকাশ না করে কেস স্টাডি, প্রেস রিলিজ বা প্রচারমূলক সামগ্রীতে ক্লায়েন্ট বা ইন্টিগ্রেশন পার্টনার হিসেবে উল্লেখ।</li>
              <li>প্ল্যাটফর্ম গ্রহণ প্রদর্শনের উদ্দেশ্যে বিনিয়োগকারী, অংশীদার বা নিয়ন্ত্রক সংস্থার কাছে উপস্থাপনায় প্রদর্শন।</li>
            </ul>
            <InfoBox type="info">
              <strong>অপ্ট-আউট অধিকার:</strong> একজন মার্চেন্ট যেকোনো সময় Xelpay-এর অফিসিয়াল সহায়তা ইমেইলে একটি আনুষ্ঠানিক, লিখিত অপ্ট-আউট অনুরোধ জমা দিয়ে এই প্রচার লাইসেন্স থেকে সম্মতি প্রত্যাহার করতে পারেন। অপ্ট-আউট অনুরোধ প্রাপ্তি ও যাচাই করার পর, Xelpay ৩০ দিনের মধ্যে নতুন বিপণন সামগ্রী থেকে মার্চেন্টের ব্র্যান্ডিং অপসারণ করতে বাণিজ্যিকভাবে যুক্তিসঙ্গত প্রচেষ্টা ব্যবহার করবে।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২১. অ্যাকাউন্ট অহস্তান্তরযোগ্যতা ও AML ঝুঁকি" icon={Lock} accent="red">
            <p>একটি Xelpay মার্চেন্ট অ্যাকাউন্ট নিবন্ধন ও KYC যাচাইকরণ প্রক্রিয়ার সময় শনাক্ত নির্দিষ্ট আইনি সত্তা বা ব্যক্তির নিবন্ধিত এবং একচেটিয়া ব্যবহারের উদ্দেশ্যে। Xelpay অ্যাকাউন্ট <strong>কঠোরভাবে ও সম্পূর্ণরূপে অহস্তান্তরযোগ্য</strong>।</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">নিষিদ্ধ হস্তান্তর কার্যক্রম:</strong> মার্চেন্টরা তাদের Xelpay অ্যাকাউন্ট, সংশ্লিষ্ট API কী বা অ্যাক্সেস ক্রেডেনশিয়াল কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া দেওয়া, লিজ দেওয়া, ধার দেওয়া, উপহার দেওয়া, মালিকানা বা নিয়ন্ত্রণ হস্তান্তর বা অন্যথায় অপসারণ করতে স্পষ্টভাবে নিষিদ্ধ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক পুনর্গঠন:</strong> বৈধ কর্পোরেট পুনর্গঠনের ক্ষেত্রে মার্চেন্টকে Xelpay-কে আনুষ্ঠানিকভাবে অবহিত করতে হবে এবং সম্পূর্ণ পুনরায় KYC যাচাইকরণে জমা দিতে হবে।</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">তাৎক্ষণিক আজীবন নিষেধাজ্ঞা — অননুমোদিত হস্তান্তর</strong>
              একটি Xelpay অ্যাকাউন্টের যেকোনো অননুমোদিত হস্তান্তর, বিক্রয়, ভাড়া বা কার্যকর নিয়ন্ত্রণ পরিবর্তন — যেকোনো উপায়ে সনাক্ত করা হলে — <strong>অ্যাকাউন্টের তাৎক্ষণিক, স্থায়ী ও অপরিবর্তনীয় আজীবন নিষেধাজ্ঞা</strong>, কোনো ফেরত ছাড়াই সমস্ত ডেটা ও সাবস্ক্রিপশন ফি বাজেয়াপ্তি এবং বাংলাদেশ ফিনান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU) ও প্রাসঙ্গিক আইন প্রয়োগকারী সংস্থার কাছে রেফারেলের ফলে হবে।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২২. অন্তর্নিহিত MFS/ব্যাংক ফি — মার্চেন্টের একক দায়িত্ব" icon={DollarSign} accent="amber">
            <p>Xelpay-এর সাবস্ক্রিপশন ও অ্যাড-অন ফি একচেটিয়াভাবে Xelpay-এর মালিকানাধীন সফটওয়্যার অবকাঠামো, API, ড্যাশবোর্ড, ভেরিফিকেশন ইঞ্জিন এবং সংশ্লিষ্ট প্রযুক্তিগত পরিষেবাগুলিতে অ্যাক্সেস ও ব্যবহারের জন্য চার্জ করা হয়।</p>
            <InfoBox type="warning">
              <strong>তৃতীয় পক্ষের ফি-এর জন্য মার্চেন্টের একক আর্থিক দায়িত্ব:</strong> তৃতীয় পক্ষের আর্থিক পরিষেবা প্রদানকারীদের সাথে সংশ্লিষ্ট সমস্ত অন্তর্নিহিত তৃতীয় পক্ষের খরচ বহন করা মার্চেন্টের একক ও একচেটিয়া দায়িত্ব। এর মধ্যে অন্তর্ভুক্ত রয়েছে: bKash, Nagad, Rocket, Upay-এর মতো অপারেটরদের MFS ক্যাশ-আউট চার্জ; MFS পার্সন-টু-পার্সন (P2P) সেন্ড মানি ফি; আন্তঃব্যাংক বা ইন্ট্রা-ব্যাংক ট্রান্সফার ফি; এবং বাংলাদেশ সরকার কর্তৃক আরোপিত মূল্য সংযোজন কর (ভ্যাট), সম্পূরক শুল্ক (SD) এবং অন্যান্য কর।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২৩. ড্যাশবোর্ড লগ রিটেনশন সীমা ও ডেটা এক্সপোর্ট দায়িত্ব" icon={BarChart2} accent="blue">
            <p>সর্বোত্তম সার্ভার কার্যক্ষমতা, সিস্টেম স্থিতিশীলতা এবং দক্ষ ডেটাবেস অপারেশন বজায় রাখতে, সক্রিয় Xelpay মার্চেন্ট ড্যাশবোর্ডে প্রদর্শিত লেনদেন ও কার্যকলাপ লগসমূহ সক্রিয় ড্যাশবোর্ড দৃশ্যমানতার জন্য একটি <strong>রোলিং রিটেনশন উইন্ডো</strong>-র সাপেক্ষে। সক্রিয় রোলিং উইন্ডোর (বর্তমানে নব্বই (৯০) দিন, নোটিশ সহ পরিবর্তন সাপেক্ষে) চেয়ে পুরনো লগগুলি ড্যাশবোর্ড ইন্টারফেসে সক্রিয়ভাবে প্রদর্শিত বা সরাসরি কোয়েরি করা নাও যেতে পারে।</p>
            <InfoBox type="warning">
              <strong>মার্চেন্টের ডেটা এক্সপোর্ট বাধ্যবাধকতা:</strong> Xelpay ড্যাশবোর্ড থেকে নিয়মিত ও সক্রিয়ভাবে তাদের লেনদেন ডেটা (CSV বা অন্যান্য সমর্থিত ফরম্যাটে উপলব্ধ) তাদের নিজস্ব নিরাপদ, স্বাধীন সিস্টেমে রোলিং রিটেনশন উইন্ডো শেষ হওয়ার আগে এক্সপোর্ট করা মার্চেন্টের নিজের একক ও পরম দায়িত্ব।
            </InfoBox>
            <p className="mt-2">নিয়ন্ত্রক সম্মতির উদ্দেশ্যে, Xelpay আলাদাভাবে মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ এবং BFIU নির্দেশিকা অনুসারে <strong>পাঁচ (৫) বছর</strong> মেয়াদের জন্য এনক্রিপ্টেড, ব্যাকএন্ড লেনদেন লগ আর্কাইভ সংরক্ষণ করে। এই ব্যাকএন্ড রিটেনশন শুধুমাত্র নিয়ন্ত্রক উদ্দেশ্যে এবং মার্চেন্টের অপারেশনাল সুবিধার জন্য ডেটা ব্যাকআপ সেবা গঠন করে না।</p>
          </SectionBlock>

          <SectionBlock title="২৪. API ভার্সনিং, অবচয় ও মার্চেন্ট সামঞ্জস্য বাধ্যবাধকতা" icon={GitBranch} accent="teal">
            <p>Xelpay একটি ক্রমাগত বিকশিত সফটওয়্যার প্ল্যাটফর্ম। নিরাপত্তা, কার্যক্ষমতা এবং কার্যকারিতা উন্নত করতে, Xelpay তার API-এর নতুন সংস্করণ প্রকাশ করার এবং পুরনো API সংস্করণগুলি আপডেট, পরিবর্তন বা অবচয় করার অধিকার সংরক্ষণ করে।</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">অবচয় নোটিশ:</strong> Xelpay মার্চেন্ট ড্যাশবোর্ড, ইমেইল যোগাযোগ এবং অফিসিয়াল ডেভেলপার ডকুমেন্টেশন আপডেটের মাধ্যমে উল্লেখযোগ্য API অবচয় ঘটনার আগাম নোটিশ প্রদানের জন্য বাণিজ্যিকভাবে যুক্তিসঙ্গত প্রচেষ্টা ব্যবহার করবে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্টের পরম সামঞ্জস্য বাধ্যবাধকতা:</strong> মার্চেন্টের নিজস্ব অ্যাপ্লিকেশনের কোডবেস, ইন্টিগ্রেশন লজিক এবং প্রযুক্তিগত অবকাঠামো সর্বদা Xelpay API-এর বর্তমান, সমর্থিত সংস্করণের সাথে সামঞ্জস্যপূর্ণ রাখা মার্চেন্টের পরম ও একচেটিয়া দায়িত্ব।</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য দায়বদ্ধতা — মার্চেন্টের পুরনো কোড থেকে ভাঙা ইন্টিগ্রেশন</strong>
              বর্তমান বা আপডেট করা Xelpay API সংস্করণের সাথে সামঞ্জস্য বজায় রাখতে তাদের কোড আপডেট করতে মার্চেন্টের ব্যর্থতার ফলে উদ্ভূত যেকোনো সেবা বিঘ্ন, পেমেন্ট প্রক্রিয়াকরণ ব্যর্থতা, মিস করা লেনদেন, ব্যবসায়িক ক্ষতি বা ভাঙা ইন্টিগ্রেশনের জন্য Xelpay <strong>কোনো আর্থিক, আইনি বা অপারেশনাল দায়বদ্ধতা বহন করে না</strong>।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="২৫. সহায়তা SLA, সর্বোত্তম-প্রচেষ্টা ভিত্তি ও কর্মীদের হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা" icon={Headphones} accent="rose">
            <p>Xelpay আমাদের প্ল্যাটফর্ম অফারিংয়ের একটি মূল উপাদান হিসেবে মার্চেন্ট সহায়তা পরিষেবা প্রদান করে। তবে, একটি কাস্টম, পৃথকভাবে আলোচিত এন্টারপ্রাইজ সার্ভিস চুক্তিতে স্পষ্টভাবে উল্লেখ না থাকলে, সমস্ত সহায়তা পরিষেবা নির্দিষ্ট প্রতিক্রিয়া সময়ের কোনো বাধ্যকর গ্যারান্টি ছাড়াই <strong>"সর্বোত্তম-প্রচেষ্টা" ভিত্তিতে</strong> প্রদান করা হয়।</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">সর্বোত্তম-প্রচেষ্টা সহায়তা:</strong> Xelpay-এর সহায়তা দল যত দ্রুত সম্ভব মার্চেন্ট অনুসন্ধানে সাড়া দেওয়ার এবং সমাধান করার চেষ্টা করে। সাধারণ সহায়তা কোনো নির্দিষ্ট SLA গ্যারান্টি দেয় না।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">এন্টারপ্রাইজ SLA:</strong> গ্যারান্টিযুক্ত প্রতিক্রিয়া সময় বা উন্নত সহায়তা SLA প্রয়োজন মার্চেন্টরা Xelpay-এর এন্টারপ্রাইজ চুক্তির বিকল্পগুলি সম্পর্কে অনুসন্ধান করতে পারেন।</li>
            </ul>
            <InfoBox type="danger">
              <strong className="uppercase tracking-widest text-[11px] block mb-1">শূন্য-সহনশীলতা নীতি — সহায়তা কর্মীদের হয়রানি</strong>
              Xelpay যেকোনো যোগাযোগ চ্যানেলের মাধ্যমে যেকোনো Xelpay সহায়তা কর্মী, কর্মচারী বা ঠিকাদারের প্রতি যেকোনো ধরনের মৌখিক অপব্যবহার, লিখিত অপব্যবহার, হুমকি, ভয় দেখানো, হয়রানি, বৈষম্যমূলক ভাষা বা অন্যান্য বৈরী আচরণের বিরুদ্ধে একটি পরম ও নিঃশর্ত <strong>শূন্য-সহনশীলতা নীতি</strong> বজায় রাখে। এই নীতি লঙ্ঘনকারী যেকোনো মার্চেন্ট বা ব্যবহারকারী প্রদত্ত ফি ফেরত ছাড়াই <strong>তাৎক্ষণিক, স্থায়ী ও অপরিবর্তনীয় অ্যাকাউন্ট নিষেধাজ্ঞার</strong> মুখোমুখি হবেন, এবং এই ধরনের আচরণ বাংলাদেশের প্রযোজ্য আইনের অধীনে ফৌজদারি অপরাধ গঠন করলে Xelpay উপযুক্ত আইনি প্রতিকার অনুসরণ করার অধিকার সংরক্ষণ করে।
            </InfoBox>
          </SectionBlock>

        </div>
      </div>

      {/* ══════════ পার্ট ২: গোপনীয়তা নীতি ══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><Lock size={22} /></div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">গোপনীয়তা নীতি</h2>
        </div>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Xelpay (Xenverse IT) <strong className="text-slate-900 dark:text-white">ডিজিটাল নিরাপত্তা আইন, ২০১৮</strong> এবং বাংলাদেশের প্রযোজ্য ডেটা সুরক্ষা বিধিমালা মেনে আপনার গোপনীয়তা রক্ষা এবং সর্বোচ্চ স্বচ্ছতা, নিরাপত্তা ও আইনগত সম্মতির সাথে আপনার ব্যক্তিগত ও ব্যবসায়িক ডেটা পরিচালনা করতে প্রতিশ্রুতিবদ্ধ।
          </p>

          <SectionBlock title="১. আমরা কী কী তথ্য সংগ্রহ করি" icon={Database} accent="green">
            <p className="font-semibold text-slate-700 dark:text-slate-300">আমরা নিম্নলিখিত বিভাগে কাঠামোগত ডেটা সংগ্রহ করি:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">মার্চেন্ট পরিচয় ডেটা:</strong> পূর্ণ আইনি নাম, ব্যবসায়িক ট্রেডিং নাম, ইমেইল ঠিকানা, ফোন নম্বর, ব্যবসায়িক ঠিকানা এবং অন্যান্য নিবন্ধন তথ্য।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">প্রযুক্তিগত ইন্টিগ্রেশন ডেটা:</strong> API কী (হ্যাশড), ওয়েবহুক এন্ডপয়েন্ট URL, কনফিগার করা MFS নম্বর, Telegram বট আইডেন্টিফায়ার এবং IMAP অ্যাকাউন্ট মেটাডেটা।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লেনদেন ও পেমেন্ট মেটাডেটা:</strong> লেনদেন রেফারেন্স আইডি, পরিমাণ, টাইমস্ট্যাম্প, MFS অপারেটর আইডেন্টিফায়ার, যাচাই স্থিতি এবং ওয়েবহুক ডেলিভারি লগ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ডিভাইস ও অ্যাপ মেটাডেটা (রিলে অ্যাপ):</strong> SMS রিলে কার্যকারিতার জন্য ডিভাইস মডেল, OS সংস্করণ, অ্যাপ সংস্করণ এবং রিলে ডিভাইস সংযোগ স্থিতি।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাড-অন ব্যবহারের ডেটা:</strong> বিলিং এবং সিস্টেম অপ্টিমাইজেশন উদ্দেশ্যে ফিচার ব্যবহার মেট্রিক্স।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">KYC ও ব্যবসা যাচাই দলিল:</strong> সরকার-প্রদত্ত পরিচয় দলিল, ট্রেড লাইসেন্স এবং আইন দ্বারা প্রয়োজনীয় অন্যান্য ব্যবসায়িক যাচাই উপকরণ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ব্যবহার ও লগ ডেটা:</strong> IP ঠিকানা, ব্রাউজার/ক্লায়েন্ট ধরন, অ্যাক্সেস টাইমস্ট্যাম্প, API অনুরোধ লগ এবং ত্রুটি লগ।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">যোগাযোগ:</strong> আমাদের চ্যানেলের মাধ্যমে জমা দেওয়া সহায়তা টিকেট, ইমেইল চিঠিপত্র এবং প্রতিক্রিয়া।</li>
            </ul>
            <div className="mt-4">
              <InfoBox type="success">
                <strong className="block mb-1">আমরা যা কখনও সংগ্রহ করি না:</strong>
                Xelpay কখনোই আপনার ব্যাংক অ্যাকাউন্টের পাসওয়ার্ড, MFS অ্যাপ PIN কোড, OTP, NID/পাসপোর্ট নম্বর (আনুষ্ঠানিক KYC যাচাইকরণ ছাড়া) বা পার্স করা পেমেন্ট নিশ্চিতকরণ বিবরণের বাইরে আপনার ব্যাংক ইমেইলের পূর্ণ বিষয়বস্তু রেকর্ড, সংরক্ষণ, লগ বা আটকায় না।
              </InfoBox>
            </div>
          </SectionBlock>

          <SectionBlock title="২. ব্যক্তিগত ডেটা প্রক্রিয়াকরণের আইনগত ভিত্তি" icon={Scale} accent="green">
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">চুক্তিগত প্রয়োজনীয়তা:</strong> আপনার সম্মত সেবার শর্তাবলীর অধীনে আমাদের বাধ্যবাধকতা পূরণের জন্য প্রক্রিয়াকরণ প্রয়োজনীয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">বৈধ স্বার্থ:</strong> জালিয়াতি প্রতিরোধ, প্ল্যাটফর্ম নিরাপত্তা এবং পরিষেবা উন্নতির জন্য।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">আইনগত বাধ্যবাধকতা:</strong> AML বিধিমালা, BFIU নির্দেশিকা এবং বাংলাদেশ ব্যাংক নির্দেশনা মেনে চলতে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সম্মতি:</strong> বিপণন যোগাযোগের জন্য, যেখানে স্পষ্টভাবে প্রদত্ত এবং যেকোনো সময় প্রত্যাহারযোগ্য।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৩. ডেটা ব্যবহারের উদ্দেশ্য" icon={Eye} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li>ব্যবহারকারীদের নির্ভরযোগ্যভাবে প্রমাণীকরণ এবং শক্তিশালী ওয়ার্কস্পেস নিরাপত্তা বজায় রাখা।</li>
              <li>আগত পেমেন্ট অ্যালগরিদমিকভাবে যাচাই করা এবং রিয়েল-টাইম ওয়েবহুক পেলোড পাঠানো।</li>
              <li>আপনার সংযুক্ত টেলিগ্রামে তাৎক্ষণিক পেমেন্ট সফল/ব্যর্থতার সতর্কতা পাঠানো।</li>
              <li>লেনদেনের অসঙ্গতি সনাক্ত করা এবং আর্থিক জালিয়াতি প্রতিরোধ করা।</li>
              <li>আপনার ব্যবসায়িক কর্মক্ষমতা পর্যালোচনার জন্য বিশ্লেষণ, রিপোর্ট এবং ড্যাশবোর্ড মেট্রিক তৈরি করা।</li>
              <li>যেকোনো সক্রিয় অ্যাড-অন সেবার জন্য ব্যবহার-ভিত্তিক ফি গণনা, চালান প্রদান এবং সংগ্রহ করা।</li>
              <li>AML এবং BFIU নিয়ন্ত্রক বাধ্যবাধকতার সাথে সম্মতিতে KYC এবং ব্যবসা যাচাই ডকুমেন্টেশন প্রক্রিয়া, পর্যালোচনা এবং সংরক্ষণ করা।</li>
              <li>AML এবং জালিয়াতি প্রতিরোধ বিধিমালার অধীনে আমাদের আইনগত বাধ্যবাধকতা পূরণ করা।</li>
            </ul>
            <InfoBox type="info">
              Xelpay তৃতীয় পক্ষের বিজ্ঞাপন, প্রোফাইলিং বা ডেটা ব্রোকারের কাছে বিক্রির জন্য আপনার ডেটা <strong>ব্যবহার করে না</strong>।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="৪. কুকিজ ও ট্র্যাকিং প্রযুক্তি" icon={Cookie} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">অপরিহার্য সেশন কুকিজ:</strong> প্রমাণীকৃত ড্যাশবোর্ড সেশন বজায় রাখার জন্য প্রয়োজনীয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">পছন্দ স্টোরেজ (Local Storage):</strong> ভাষা নির্বাচন এবং থিম সেটিংস সংরক্ষণের জন্য।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">নিরাপত্তা টোকেন:</strong> সেশন অখণ্ডতার জন্য CSRF এবং প্রমাণীকরণ টোকেন।</li>
            </ul>
            <p className="mt-3">আমরা তৃতীয় পক্ষের বিজ্ঞাপন কুকিজ বা ক্রস-সাইট ট্র্যাকিং পিক্সেল <strong>ব্যবহার করি না</strong>।</p>
          </SectionBlock>

          <SectionBlock title="৫. তৃতীয় পক্ষের সাথে ডেটা শেয়ারিং ও প্রকাশ" icon={Users} accent="green">
            <p><strong className="text-slate-800 dark:text-slate-200">Xelpay আপনার ব্যক্তিগত ডেটা নগদীকরণ বা বিক্রি করে না।</strong> ডেটা শুধুমাত্র নিম্নলিখিত কঠোরভাবে সীমিত পরিস্থিতিতে তৃতীয় পক্ষের কাছে প্রকাশ করা হয়: অবকাঠামো প্রদানকারী (Vercel, Supabase), বৈধ আইনি ও নিয়ন্ত্রক প্রকাশ, জালিয়াতি প্রতিরোধ, ব্যবসায়িক হস্তান্তর এবং আপনার স্পষ্ট সম্মতির সাথে।</p>
          </SectionBlock>

          <SectionBlock title="৬. ডেটা নিরাপত্তা ও লঙ্ঘন বিজ্ঞপ্তি প্রোটোকল" icon={Lock} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">বিশ্রামে এনক্রিপশন:</strong> AES-256 এনক্রিপশন ব্যবহার করে সমস্ত সংবেদনশীল ডেটা এনক্রিপ্ট করা হয়।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">ট্রান্সিটে এনক্রিপশন:</strong> সমস্ত ডেটা ট্রান্সমিশন TLS 1.2 বা উচ্চতর এনক্রিপ্টেড সংযোগের মাধ্যমে।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাক্সেস নিয়ন্ত্রণ:</strong> কঠোর ভূমিকা-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ এবং ব্যাপক অডিট লগিং।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লঙ্ঘন বিজ্ঞপ্তি:</strong> একটি নিশ্চিত ডেটা লঙ্ঘনের ক্ষেত্রে, Xelpay প্রভাবিত মার্চেন্টদের সত্তর দুই (৭২) ঘণ্টার মধ্যে অবহিত করবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৭. ইলেকট্রনিক যোগাযোগে সম্মতি" icon={Bell} accent="green">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">লেনদেনগত ও অপারেশনাল:</strong> পেমেন্ট যাচাই সতর্কতা, API স্থিতি বিজ্ঞপ্তি এবং সিস্টেম নিরাপত্তা সতর্কতা।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সিস্টেম আপডেট ও নীতি পরিবর্তন:</strong> সেবার শর্তাবলী এবং API অবচয়ের আপডেট সম্পর্কিত বিজ্ঞপ্তি।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">প্রচারমূলক ও মার্কেটিং:</strong> নিউজলেটার এবং ফিচার ঘোষণা। যেকোনো সময় অপ্ট-আউট করা যাবে।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৮. ডেটা সংরক্ষণ নীতি" icon={Database} accent="green">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-800 dark:text-slate-200">সক্রিয় অ্যাকাউন্ট ডেটা:</strong> আপনার সক্রিয় সাবস্ক্রিপশন এবং অ্যাকাউন্ট স্থিতির সম্পূর্ণ সময়কালের জন্য সংরক্ষিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">KYC ও ব্যবসা যাচাই দলিল:</strong> জমা দেওয়ার তারিখ থেকে ন্যূনতম পাঁচ (৫) বছর সংরক্ষিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্ট বন্ধের পরে AML সংরক্ষণ:</strong> অ্যাকাউন্ট বাতিলের পর মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ মেনে চলতে লেনদেন রেকর্ড ন্যূনতম পাঁচ (৫) বছর সংরক্ষিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">অ্যাড-অন ব্যবহারের রেকর্ড:</strong> বিলিং বিরোধ নিষ্পত্তি এবং নিরীক্ষার উদ্দেশ্যে ন্যূনতম তিন (৩) বছর সংরক্ষিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">লগ ডেটা:</strong> সিস্টেম অ্যাক্সেস লগ সক্রিয় ড্যাশবোর্ড প্রদর্শনের জন্য ৯০ দিন এবং AML সম্মতির জন্য এনক্রিপ্টেড ব্যাকএন্ড আর্কাইভে ৫ বছর সংরক্ষিত।</li>
              <li><strong className="text-slate-800 dark:text-slate-200">সহায়তা যোগাযোগ:</strong> মান নিশ্চিতকরণ এবং বিরোধ নিষ্পত্তির উদ্দেশ্যে সর্বোচ্চ দুই (২) বছর সংরক্ষিত।</li>
            </ul>
          </SectionBlock>

          <SectionBlock title="৯. আপনার ডেটার অধিকার ও অ্যাকাউন্ট মুছে ফেলা" icon={Trash2} accent="green">
            <p>প্রযোজ্য আইন এবং আমাদের AML সংরক্ষণ বাধ্যবাধকতার সাপেক্ষে, আপনার ব্যক্তিগত ডেটা সংক্রান্ত নিম্নলিখিত অধিকার রয়েছে: অ্যাক্সেসের অধিকার, সংশোধনের অধিকার, মুছে ফেলার অধিকার ("ভুলে যাওয়ার অধিকার"), ডেটা পোর্টেবিলিটির অধিকার, আপত্তির অধিকার এবং সম্মতি প্রত্যাহারের অধিকার। এই অধিকারগুলি প্রয়োগ করতে আমাদের অফিসিয়াল সহায়তা ইমেইলে যোগাযোগ করুন।</p>
          </SectionBlock>

          <SectionBlock title="১০. শিশুদের গোপনীয়তা" icon={UserCheck} accent="red">
            <InfoBox type="warning">
              Xelpay সেবাগুলি কঠোরভাবে ১৮ বছর বা তার বেশি বয়সী ব্যবহারকারীদের জন্য। আমরা ১৮ বছরের কম বয়সীদের কাছ থেকে জ্ঞাতসারে ব্যক্তিগত ডেটা সংগ্রহ করি না।
            </InfoBox>
          </SectionBlock>

          <SectionBlock title="১১. আন্তর্জাতিক ডেটা স্থানান্তর" icon={Globe} accent="green">
            <p>Xelpay প্রাথমিকভাবে বাংলাদেশ থেকে পরিচালিত হয়। তবে, Vercel এবং Supabase-এর মতো ক্লাউড অবকাঠামো প্রদানকারীদের ব্যবহারের কারণে নির্দিষ্ট ডেটা অন্য দেশের সার্ভারে প্রক্রিয়া করা হতে পারে। আমরা নিশ্চিত করি যে এই ধরনের আন্তর্জাতিক ডেটা স্থানান্তর প্রযোজ্য ডেটা সুরক্ষা আইন মেনে পরিচালিত হয়।</p>
          </SectionBlock>

          <SectionBlock title="১২. যোগাযোগ ও ডেটা সুরক্ষা অনুসন্ধান" icon={Mail} accent="green">
            <p>সমস্ত গোপনীয়তা-সংশ্লিষ্ট উদ্বেগ, ডেটা অ্যাক্সেসের অনুরোধ, অ্যাকাউন্ট মুছে ফেলার অনুরোধ, বা সন্দেহজনক ডেটা লঙ্ঘন রিপোর্ট করতে আমাদের ওয়েবসাইটে প্রকাশিত Xelpay-এর ডেটা সুরক্ষা দলের অফিসিয়াল সহায়তা ইমেইল ঠিকানায় যোগাযোগ করুন।</p>
            <p className="mt-3">আইনি নোটিশ বা নিয়ন্ত্রক চিঠিপত্রের জন্য, আমাদের সম্মতি দলের দ্বারা যথাযথ রাউটিং ও ত্বরান্বিত পরিচালনা নিশ্চিত করতে আপনার যোগাযোগের বিষয় লাইনে "LEGAL NOTICE" অন্তর্ভুক্ত করুন।</p>
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
    <div className="min-h-[100dvh] bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] rounded-none md:rounded-3xl md:my-8 p-6 md:p-12 shadow-none md:shadow-2xl">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-8 group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'en' ? 'Terms & Privacy' : 'শর্তাবলী ও গোপনীয়তা'}
          </h1>
          {/* Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Globe size={16} className="text-slate-400" />
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 transition-colors uppercase tracking-widest text-xs font-black ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-4 py-2 transition-colors text-xs font-black ${lang === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">
          {lang === 'en' ? 'Last Updated: April 01, 2026 · Effective Immediately' : 'সর্বশেষ আপডেট: ১ এপ্রিল, ২০২৬ · তাৎক্ষণিকভাবে কার্যকর'}
        </p>

        {/* Table of Contents */}
        <div className="mb-10 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <HelpCircle size={14} />
            {lang === 'en' ? 'Quick Navigation' : 'দ্রুত নেভিগেশন'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'en' ? (
              <>
                <span>Part 1: Terms of Service (25 sections)</span>
                <span>Part 2: Privacy Policy (12 sections)</span>
                <span>· Eligibility & Age Restrictions (§3)</span>
                <span>· Data We Collect & Legal Basis (PP §1–2)</span>
                <span>· Billing, Add-On Services & No-Refund Policy (§5)</span>
                <span>· Third-Party Sharing Rules (PP §5)</span>
                <span>· Acceptable Use & AUP (§6)</span>
                <span>· Your Data Rights (PP §9)</span>
                <span>· Device & Internet Dependency — Relay App (§7)</span>
                <span>· AML Retention Policy — 5 Years (PP §8)</span>
                <span>· MFS SMS Format Changes & Liability (§7)</span>
                <span>· Security & Breach Notification (PP §6)</span>
                <span>· SMS Spoofing & False Positives (§7)</span>
                <span>· Add-On Usage Data Retention — 3 Years (PP §8)</span>
                <span>· Webhook & Merchant Server Outages (§7)</span>
                <span>· KYC Document Collection & Retention (§15, PP §8)</span>
                <span>· KYC & Business Verification (§15)</span>
                <span>· Reversed Transactions & Clawbacks (§16)</span>
                <span>· No End-Customer Support Obligation (§17)</span>
                <span>· Webhook Idempotency & Double-Crediting (§18)</span>
                <span>· Regulatory Shutdown & Force Majeure (§19)</span>
                <span>· Publicity & Marketing Rights — Opt-Out (§20)</span>
                <span>· Account Non-Transferability & AML Risk (§21)</span>
                <span>· Underlying MFS/Bank Fees (§22)</span>
                <span>· Dashboard Log Retention — 90 Days Active (§23)</span>
                <span>· API Versioning & Deprecation (§24)</span>
                <span>· Support SLA & Zero-Tolerance for Harassment (§25)</span>
                <span>· Limitation of Liability (§10)</span>
                <span>· Governing Law — Bangladesh (§12)</span>
              </>
            ) : (
              <>
                <span>পার্ট ১: সেবার শর্তাবলী (২৫টি অনুচ্ছেদ)</span>
                <span>পার্ট ২: গোপনীয়তা নীতি (১২টি অনুচ্ছেদ)</span>
                <span>· যোগ্যতা ও বয়স সীমাবদ্ধতা (ধারা ৩)</span>
                <span>· ডেটা সংগ্রহ ও আইনগত ভিত্তি (নীতি ধারা ১–২)</span>
                <span>· বিলিং, অ্যাড-অন সেবা ও অ-ফেরতযোগ্য নীতি (ধারা ৫)</span>
                <span>· তৃতীয় পক্ষের শেয়ারিং নিয়ম (নীতি ধারা ৫)</span>
                <span>· গ্রহণযোগ্য ব্যবহার নীতি (ধারা ৬)</span>
                <span>· আপনার ডেটার অধিকার (নীতি ধারা ৯)</span>
                <span>· ডিভাইস ও ইন্টারনেট নির্ভরতা — রিলে অ্যাপ (ধারা ৭)</span>
                <span>· AML সংরক্ষণ নীতি — ৫ বছর (নীতি ধারা ৮)</span>
                <span>· MFS SMS ফরম্যাট পরিবর্তন ও দায় (ধারা ৭)</span>
                <span>· নিরাপত্তা ও লঙ্ঘন বিজ্ঞপ্তি (নীতি ধারা ৬)</span>
                <span>· SMS স্পুফিং ও মিথ্যা ইতিবাচক (ধারা ৭)</span>
                <span>· অ্যাড-অন ডেটা সংরক্ষণ — ৩ বছর (নীতি ধারা ৮)</span>
                <span>· ওয়েবহুক ও মার্চেন্ট সার্ভার আউটেজ (ধারা ৭)</span>
                <span>· KYC দলিল সংগ্রহ ও সংরক্ষণ (ধারা ১৫, নীতি ধারা ৮)</span>
                <span>· KYC ও ব্যবসা যাচাইকরণ (ধারা ১৫)</span>
                <span>· বিপরীত লেনদেন ও ক্ল্যাওব্যাক (ধারা ১৬)</span>
                <span>· শেষ-গ্রাহক সহায়তার কোনো বাধ্যবাধকতা নেই (ধারা ১৭)</span>
                <span>· ওয়েবহুক আইডেম্পোটেন্সি ও দ্বি-ক্রেডিটিং (ধারা ১৮)</span>
                <span>· নিয়ন্ত্রক বন্ধ ও ফোর্স ম্যাজর (ধারা ১৯)</span>
                <span>· প্রচার ও বিপণন অধিকার — অপ্ট-আউট (ধারা ২০)</span>
                <span>· অ্যাকাউন্ট অহস্তান্তরযোগ্যতা ও AML ঝুঁকি (ধারা ২১)</span>
                <span>· অন্তর্নিহিত MFS/ব্যাংক ফি (ধারা ২২)</span>
                <span>· ড্যাশবোর্ড লগ রিটেনশন — ৯০ দিন সক্রিয় (ধারা ২৩)</span>
                <span>· API ভার্সনিং ও অবচয় (ধারা ২৪)</span>
                <span>· সহায়তা SLA ও হয়রানির বিরুদ্ধে শূন্য-সহনশীলতা (ধারা ২৫)</span>
                <span>· দায়ের সীমাবদ্ধতা (ধারা ১০)</span>
                <span>· প্রযোজ্য আইন — বাংলাদেশ (ধারা ১২)</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm">
          {lang === 'en' ? <EnglishContent /> : <BanglaContent />}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest">
            {lang === 'en'
              ? 'By checking the agreement box during registration or by utilizing our APIs, you confirm that you have read, understood, and unconditionally agree to this entire document.'
              : 'নিবন্ধনের সময় চুক্তির বাক্সে চেক করে বা আমাদের API ব্যবহার করে, আপনি নিশ্চিত করছেন যে আপনি এই দলিলের সম্পূর্ণতার সাথে পড়েছেন, বুঝেছেন এবং নিঃশর্তভাবে সম্মত।'}
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
