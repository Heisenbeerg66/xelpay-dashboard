'use client';

import { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Lock, Server,
  CreditCard, Users, Scale, Gavel, Smartphone, Database, RefreshCw, 
  UserCheck, AlertCircle, BookOpen, Building2, Zap, Fingerprint, ShieldAlert
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
            <strong className="text-slate-800 dark:text-slate-200">Add-On Services & Usage-Based Billing:</strong> In addition to the base subscription plan, Xelpay reserves the right to charge separate, additional usage-based fees for specific "Add-On" services consumed beyond the base plan's included allowances. Usage-based fees will be calculated based on actual consumption during the applicable billing period and will be clearly itemized on your invoice. By enabling and utilizing any Add-On service, you explicitly authorize Xelpay to charge the applicable usage-based fees to your registered payment method.
            <InfoBox type="warning">
              <strong>Important:</strong> Enabling an Add-On service constitutes your binding agreement to the associated usage-based pricing. There are no refunds for Add-On charges already incurred and billed, consistent with our strict No-Refund Policy below.
            </InfoBox>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200 uppercase">Strict No-Refund Policy:</strong> Due to the digital, API-based, and infrastructural nature of our services, all subscription payments are <strong className="text-red-600 dark:text-red-400">strictly non-refundable</strong> once activated and payment is processed. Refunds are NOT issued for: change of mind, partial usage, unused transaction quotas, feature misunderstandings, or accounts suspended/banned due to policy violations.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Chargebacks & Payment Disputes:</strong> Initiating a chargeback or payment dispute for a legitimate subscription charge constitutes a breach of these Terms, will result in immediate permanent account ban, and may be subject to a penalty recovery charge.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Taxes:</strong> You are solely responsible for all applicable taxes, VAT, duties, or levies arising from your use of Xelpay services in your jurisdiction.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="6. Acceptable Use Policy (AUP) & Prohibited Conduct" icon={AlertTriangle} accent="red">
        <p>Xelpay maintains a <strong className="text-slate-800 dark:text-slate-200">zero-tolerance policy</strong> for abuse. You explicitly agree <strong>NOT</strong> to utilize Xelpay for any of the following prohibited activities:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
          <li>Processing payments for illegal goods, narcotics, controlled substances, adult/pornographic content, unlicensed pharmaceuticals, unauthorized gambling, or any other activity prohibited under Bangladeshi law.</li>
          <li>Money laundering, terrorist financing, proliferation financing, or any attempt to obscure, disguise, or legitimize the origin of illegal funds.</li>
          <li>Executing scams, Ponzi schemes, pyramid schemes, fraudulent investment plans, multi-level marketing fraud, or any deceptive scheme targeting end-consumers.</li>
          <li>Intentionally overwhelming, stress-testing beyond authorized limits, reverse-engineering, or deploying DDoS attacks against Xelpay APIs or servers.</li>
          <li>Impersonating Xelpay, Xenverse IT, or any Xelpay employee, partner, or affiliated entity.</li>
          <li>Using the platform to send unsolicited bulk communications (spam) to customers or any third party.</li>
        </ul>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">Enforcement Action</strong>
          Any violation of this AUP will trigger an immediate, irreversible, permanent ban of your merchant account, immediate revocation of all API keys, and automatic disclosure of your data to local law enforcement.
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="7. Third-Party Integrations (IMAP, Telegram, SMS & External APIs)" icon={Smartphone} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Custom Telegram Bots:</strong> By supplying a Custom Telegram Bot Token to Xelpay, you grant our system explicit permission to dispatch webhook payloads through your bot.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">IMAP Bank Email Synchronization:</strong> Utilizing our Bank Transfer verification feature requires IMAP read-only access to your payment notification email inbox.</li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS Relay & Device App:</strong> Our Android Relay application reads payment SMS messages on your device for automated verification.
            <div className="mt-3">
              <InfoBox type="warning">
                <strong className="block mb-1">Critical Device Requirement:</strong>
                The functioning of the SMS Relay system is entirely contingent upon the Merchant maintaining a dedicated Android device with continuous internet connection. Xelpay holds absolutely zero liability for any missed or failed verifications caused by device shutdown or internet drop.
              </InfoBox>
            </div>
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">SMS Spoofing & False Positive Verifications:</strong> Xelpay's engine operates based on SMS received on your relay device.
            <div className="mt-3">
              <InfoBox type="danger">
                <strong className="uppercase tracking-widest text-[11px] block mb-1">Zero Liability — SMS Spoofing</strong>
                If any person transmits a spoofed SMS that mimics a legitimate payment, Xelpay bears no financial or operational liability. The Merchant is responsible for manual cross-checking of high-value transactions.
              </InfoBox>
            </div>
          </li>
          <li><strong className="text-slate-800 dark:text-slate-200">Webhook Delivery:</strong> Xelpay holds no liability for business loss resulting from permanently missed webhook deliveries caused by the Merchant's server downtime or misconfiguration.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="8-12. Liability, Dispute Resolution & Governing Law" icon={Scale} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">No Uptime Guarantee:</strong> The service is provided on a best-efforts basis.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Termination Rights:</strong> Xelpay reserves the right to suspend or permanently terminate your account at any time for policy breaches.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">General Liability Cap:</strong> In no event shall Xelpay's total liability exceed the amount paid by you during the ONE (1) month immediately preceding the claim.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Governing Law:</strong> These Terms shall be exclusively governed by the laws of the People's Republic of Bangladesh.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="13-17. Affiliates, KYC & MFS Disputes" icon={Fingerprint} accent="orange">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">KYC & Business Verification:</strong> Xelpay expressly reserves the right to conduct KYC procedures at any point. Failure to comply will result in account suspension.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Reversals & Clawbacks:</strong> In the event that a verified payment is reversed or clawed back by the MFS operator or bank, Xelpay bears absolutely no liability for any resulting loss suffered by the Merchant.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Strict B2B Service:</strong> Xelpay is a Business-to-Business platform and has no direct relationship with the Merchant's end-customers. We do not provide customer support for your buyers.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="18-25. Technical Obligations & Data Logs" icon={Database} accent="purple">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">Webhook Idempotency:</strong> It is the Merchant's absolute responsibility to implement idempotency logic to discard duplicate webhook deliveries.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Account Non-Transferability:</strong> Accounts are strictly non-transferable. Unauthorized transfers will result in an immediate lifetime ban.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">Data Export Responsibility:</strong> Dashboard logs are kept on a rolling 90-day basis. Merchants must export their own data for tax and auditing purposes.</li>
          <li><strong className="text-slate-800 dark:text-slate-200">API Updates:</strong> Xelpay reserves the right to release new API versions. Merchants must update their code to remain compatible.</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function BanglaTermsContent() {
  return (
    <div className="space-y-4" style={{ fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}>
      <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
        <strong className="text-slate-900 dark:text-white">Xelpay</strong> — <strong className="text-slate-900 dark:text-white">Xenverse IT</strong>-এর একটি পণ্য — এ আপনাকে স্বাগত জানাই। অ্যাকাউন্ট তৈরি করে, ড্যাশবোর্ড ব্যবহার করে, আমাদের API ব্যবহার করে, বা Xelpay-এর যেকোনো সেবা গ্রহণ করে আপনি ("মার্চেন্ট", "ব্যবহারকারী", বা "ক্লায়েন্ট") এই সেবার শর্তাবলীতে আইনগতভাবে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে দ্বিমত পোষণ করেন, তাহলে আপনাকে অবিলম্বে প্ল্যাটফর্ম ব্যবহার বন্ধ করতে হবে।
      </p>

      <SectionBlock title="১. শর্তাবলী পরিবর্তনের অধিকার" icon={RefreshCw} accent="blue">
        <InfoBox type="info">
          <strong>কর্তৃপক্ষের অধিকার:</strong> Xelpay (Xenverse IT) যেকোনো সময়, সম্পূর্ণরূপে নিজেদের বিবেচনায়, এই সেবার শর্তাবলী বা গোপনীয়তা নীতির যেকোনো অংশ আপডেট, পরিবর্তন বা প্রতিস্থাপন করার একচেটিয়া এবং সম্পূর্ণ অধিকার সংরক্ষণ করে। তবে, এই পেজটি নিয়মিত পর্যালোচনা করা আপনার একান্ত আইনগত দায়িত্ব।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="২. সেবার বিবরণ ও মূল দায়মুক্তি" icon={Server} accent="blue">
        <p>Xelpay হলো একটি সম্পূর্ণ প্রযুক্তিগত অবকাঠামো যা মোবাইল ফিনান্সিয়াল সার্ভিস (MFS), ব্যাংক ট্রান্সফার এবং আন্তর্জাতিক পেমেন্ট গেটওয়ের জন্য পেমেন্ট যাচাইকরণ সফটওয়্যার, API ব্রিজিং এবং অটোমেশন সরঞ্জাম সরবরাহ করে। Xelpay একটি সফটওয়্যার মিডলওয়্যার লেয়ার হিসেবে কাজ করে।</p>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">অত্যন্ত গুরুত্বপূর্ণ আর্থিক দায়মুক্তি বিবৃতি</strong>
          Xelpay একটি সফটওয়্যার লেয়ার — এটি কোনো ব্যাংক, আর্থিক প্রতিষ্ঠান, ডিজিটাল ওয়ালেট, বা পেমেন্ট অ্যাগ্রিগেটর <strong>নয়</strong>। আমরা আপনার প্রকৃত অর্থ ধারণ বা কাস্টোডিয়ান হিসেবে কাজ করি না। সমস্ত লেনদেন সরাসরি আপনার MFS/ব্যাংক অ্যাকাউন্টে নিষ্পত্তি হয়।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="৩. যোগ্যতা ও অ্যাকাউন্টের দায়িত্ব" icon={UserCheck} accent="blue">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">বয়স সীমাবদ্ধতা:</strong> Xelpay ব্যবহার করে ব্যবসা পরিচালনা করতে আপনার বয়স অবশ্যই কমপক্ষে ১৮ বছর হতে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">ব্যবসায়িক যোগ্যতা:</strong> আপনাকে অবশ্যই আইনগতভাবে নিবন্ধিত ব্যবসার মালিক হতে হবে।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">তথ্যের নির্ভুলতা:</strong> মিথ্যা বা প্রতারণামূলক তথ্য প্রদান কঠোরভাবে নিষিদ্ধ।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">অ্যাকাউন্টের নিরাপত্তা:</strong> আপনার লগইন এবং API কী এর সম্পূর্ণ গোপনীয়তা বজায় রাখা সম্পূর্ণরূপে আপনার দায়িত্ব।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৪. সাবস্ক্রিপশন ও কঠোর অফেরতযোগ্য নীতি" icon={CreditCard} accent="amber">
        <ul className="list-disc pl-5 space-y-3">
          <li><strong className="text-slate-800 dark:text-slate-200">কঠোর অ-ফেরতযোগ্য নীতি:</strong> আমাদের পরিষেবার ডিজিটাল এবং API-ভিত্তিক প্রকৃতির কারণে, একবার সক্রিয় হয়ে পেমেন্ট প্রক্রিয়া সম্পন্ন হলে সমস্ত সাবস্ক্রিপশন পেমেন্ট <strong className="text-red-600 dark:text-red-400">কঠোরভাবে অ-ফেরতযোগ্য</strong>।</li>
          <li><strong className="text-slate-800 dark:text-slate-200">চার্জব্যাক ও বিরোধ:</strong> বৈধ সাবস্ক্রিপশন চার্জের জন্য চার্জব্যাক শুরু করা শর্তাবলীর লঙ্ঘন এবং এর ফলে অ্যাকাউন্ট বাতিল হবে।</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="৫. গ্রহণযোগ্য ব্যবহার নীতি (AUP) ও নিষিদ্ধ আচরণ" icon={AlertTriangle} accent="red">
        <p>আপনি স্পষ্টভাবে সম্মত হচ্ছেন যে নিম্নলিখিত নিষিদ্ধ কার্যক্রমের জন্য Xelpay ব্যবহার করবেন না:</p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
          <li>অবৈধ পণ্য, মাদকদ্রব্য, জুয়া, বা পর্নোগ্রাফিক বিষয়বস্তুর জন্য পেমেন্ট গ্রহণ করা।</li>
          <li>মানি লন্ডারিং, সন্ত্রাসী অর্থায়ন বা কোনো প্রতারণামূলক স্কিম (যেমন পঞ্জি স্কিম) পরিচালনা করা।</li>
        </ul>
        <InfoBox type="danger">
          <strong className="uppercase tracking-widest text-[11px] block mb-1">প্রয়োগমূলক পদক্ষেপ</strong>
          এই নীতির লঙ্ঘন আপনার অ্যাকাউন্টের তাৎক্ষণিক, স্থায়ী নিষিদ্ধকরণ এবং আইন প্রয়োগকারী সংস্থার কাছে ডেটা প্রকাশের কারণ হবে।
        </InfoBox>
      </SectionBlock>

      <SectionBlock title="৬-২৫. অন্যান্য বিস্তারিত শর্তাবলী" icon={BookOpen} accent="purple">
        <InfoBox type="info">
          <strong>বিঃদ্রঃ:</strong> সম্পূর্ণ আইনি শর্তাবলী ইংরেজি সংস্করণে দেওয়া আছে। ইংরেজি সংস্করণটিই আইনগতভাবে প্রযোজ্য। আপনার ব্যবসায়িক কার্যক্রম পরিচালনার ক্ষেত্রে MFS ফি, API ইন্টিগ্রেশন, ওয়েবহুক ম্যানেজমেন্ট এবং KYC সংক্রান্ত বাধ্যবাধকতা সম্পর্কে জানতে ইংরেজি কন্টেন্টটি ভালোভাবে পড়ে নিন।
        </InfoBox>
      </SectionBlock>
    </div>
  );
}

export default function TermsContent({ lang }: { lang: 'en' | 'bn' }) {
  return lang === 'en' ? <EnglishTermsContent /> : <BanglaTermsContent />;
}