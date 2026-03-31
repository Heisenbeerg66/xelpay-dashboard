import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] md:py-12 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl border-0 md:border border-slate-200 dark:border-slate-800 p-6 md:p-14 min-h-[100dvh] md:min-h-0">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Terms & Privacy</h1>
        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
          Last Updated: April 01, 2026
        </p>

        <div className="space-y-14 text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
          
          {/* ============================== PART 1: TERMS OF SERVICE ============================== */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={28} /></div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 1: Terms of Service</h2>
            </div>
            
            <section className="space-y-8">
              <div>
                <p>Welcome to Xelpay ("we," "our," or "us"). By registering an account, accessing our dashboard, utilizing our APIs, or interacting with any Xelpay services (including Relay/SMS applications), you ("Merchant," "User," or "Client") agree to be strictly bound by these comprehensive Terms of Service. If you do not agree to every clause, you must immediately cease utilizing our platform.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">1. Right to Modify Terms & Policies</h3>
                <p className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <strong className="text-slate-900 dark:text-white">Authority Rights:</strong> Xelpay (Xenverse IT) reserves the absolute and exclusive right to update, modify, or replace any part of these Terms of Service or Privacy Policy at any time at our sole discretion. In the event of major or sensitive policy changes, we will make reasonable efforts to notify active users via dashboard alerts or email. However, it remains your legal responsibility to review this page periodically. Continued use of the platform after updates constitutes binding acceptance of the revised terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">2. Core Disclaimer & "AS-IS" Warranty</h3>
                <p>Xelpay is a strictly technological infrastructure providing payment verification software, API bridging, and SMS/IMAP automation tools. Our services are provided on an <strong>"AS-IS" and "AS-AVAILABLE"</strong> basis without explicit or implied warranties of absolute continuous functionality, given the reliance on third-party device capabilities, battery optimizations, and email server uptimes.</p>
                <div className="mt-4 p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl flex gap-4 items-start">
                  <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
                  <div>
                    <strong className="text-red-700 dark:text-red-400 uppercase tracking-widest text-[11px] block mb-1">Crucial Financial Disclaimer</strong>
                    <p className="text-red-600 dark:text-red-400 text-sm font-bold">Xelpay is a software layer, NOT a bank, financial institution, digital wallet, or payment aggregator. We do not hold, process, touch, or act as a custodian for your actual monetary funds. All transactions are peer-to-peer and settle directly into your own personal or corporate MFS/Bank accounts. We bear zero liability for missing funds, failed transfers, or disputes between you and your customers.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">3. MFS Provider & Bangladesh Bank Compliance</h3>
                <p>By using our SMS reading (Relay App) or IMAP bridging automation, you explicitly acknowledge that:</p>
                <ul className="list-disc pl-5 mt-2 space-y-3">
                  <li><strong>Account Status:</strong> Utilizing Personal or Agent MFS accounts (e.g., bKash, Nagad, Rocket) for high-volume commercial transactions may violate the direct Terms of Service of the respective MFS operators or the regulatory guidelines set by Bangladesh Bank.</li>
                  <li><strong>Zero Operator Liability:</strong> Xelpay acts strictly as an automated notification reader. We hold zero liability and offer no indemnity if your MFS or Bank accounts are flagged, restricted, frozen, or permanently terminated by the operators or regulatory authorities due to suspicious activity, transaction velocity, or commercial use of personal accounts.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">4. Taxation & NBR Liability</h3>
                <p>As Xelpay does not aggregate funds, you are operating as an independent business entity. You are <strong>solely responsible</strong> for calculating, collecting, and remitting all applicable Value Added Tax (VAT), Advance Income Tax (AIT), and any other corporate taxes to the National Board of Revenue (NBR), Bangladesh. Xelpay assumes zero legal or financial liability for your tax reporting or evasion.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">5. Subscription, Billing & Strict Refund Policy</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>Free/Starter Tier:</strong> Xelpay may offer a free tier equipped with a strict monthly transaction quota. Upon exhaustion, automation services will instantly halt until the next billing cycle or an upgrade is initiated.</li>
                  <li><strong className="text-slate-900 dark:text-white">Strict No-Refund Policy:</strong> Due to the digital, infrastructural nature of our APIs, all subscription payments are <strong>strictly non-refundable</strong> once activated. Refunds are not issued for change of mind, unused quotas, or accounts banned due to policy violations. Exceptions are solely at our discretion, typically reserved only for catastrophic, unresolvable technical failures originating explicitly from Xelpay's servers within the first 48 hours of payment.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">6. Acceptable Use Policy (AUP) & Prohibited Conduct</h3>
                <p>Xelpay maintains a zero-tolerance policy for abuse. You explicitly agree <strong>NOT</strong> to utilize Xelpay for any of the following:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Processing payments for illegal goods, narcotics, adult content, unlicensed pharmaceuticals, or unauthorized gambling operations.</li>
                  <li>Money laundering, terrorist financing, scams, Ponzi schemes, or deceiving end-consumers.</li>
                  <li>Intentionally overwhelming, reverse-engineering, or deploying DDoS attacks against Xelpay APIs.</li>
                </ul>
                <p className="mt-4 font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  ENFORCEMENT: Any violation of this AUP will trigger an immediate, irreversible permanent ban of your merchant account, immediate revocation of API keys, and automatic disclosure of your data to local law enforcement, BFIU (Bangladesh Financial Intelligence Unit), and relevant banking authorities.
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">7. Intellectual Property & Termination Rights</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>IP Rights:</strong> All source code, Relay App APKs, UI/UX designs, API architectures, and trademarks associated with Xelpay are the exclusive intellectual property of Xenverse IT. You strictly agree not to copy, clone, reverse-engineer, or resell any part of our platform.</li>
                  <li><strong>Termination:</strong> Xelpay reserves the right to suspend or permanently terminate your account and API access at any time, with or without prior notice, if your usage poses a severe security, legal, or operational risk to our infrastructure.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">8. Force Majeure & Limitation of Liability</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>Force Majeure:</strong> Xelpay shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, internet shutdowns, telecom failures, or government restrictions.</li>
                  <li><strong className="text-slate-900 dark:text-white">Liability Cap:</strong> In no event shall Xelpay's aggregate liability for all claims related to the service exceed the total amount paid by you to Xelpay for the specific subscription during the ONE (1) month immediately preceding the claim.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">9. Dispute Resolution & Class-Action Waiver</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>Mandatory 30-Day Mediation:</strong> Before filing any formal legal claim or lawsuit against Xelpay or Xenverse IT, you are legally bound to submit your grievance in writing to our support email. You must allow a mandatory period of thirty (30) days for informal mediation and resolution.</li>
                  <li><strong>Class-Action Waiver:</strong> You explicitly agree that any disputes or claims against Xelpay must be brought in your individual capacity, and NOT as a plaintiff or class member in any purported class or representative proceeding.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">10. Governing Law & Jurisdiction</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Following the mandatory mediation period, any unresolved disputes shall be subject to the exclusive jurisdiction of the competent courts located in Dhaka, Bangladesh.</p>
              </div>
            </section>
          </div>          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-8"></div>

          {/* ============================== PART 2: PRIVACY POLICY ============================== */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><ShieldCheck size={28} /></div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 2: Privacy Policy</h2>
            </div>

            <section className="space-y-8">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">1. Comprehensive Information We Collect</h3>
                <p>To deliver flawless automation, Xelpay collects structured data categorized as follows:</p>
                <ul className="list-disc pl-5 mt-3 space-y-3">
                  <li><strong>Merchant Identification Data:</strong> Full name, verified email address, mobile number, and business location provided during onboarding.</li>
                  <li><strong>Technical Integration Data:</strong> API keys generated by our system, Webhook endpoint URLs designated by you, Telegram Bot Tokens, and associated Chat IDs.</li>
                  <li><strong>Transaction & Device Metadata (Relay Apps):</strong> To cross-reference and approve orders, our automated systems process Transaction IDs (TrxID), exact amounts, timestamps, and the sender’s phone numbers. Furthermore, if you utilize our Relay or SMS Reader applications, we explicitly collect and store device-specific information (including Device Model, OS Version, App Version, and Connectivity Status) alongside the SMS data. This is strictly required to maintain sync reliability and monitor device health.</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <strong className="text-blue-700 dark:text-blue-400 font-black text-sm block mb-1">What We NEVER Collect:</strong>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">Under absolutely no circumstances does Xelpay record, store, or intercept your Bank Account Passwords, MFS App PIN Codes, OTPs (One Time Passwords), or raw Credit Card details. Our system relies entirely on post-transaction notification reading.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">2. Purpose of Data Utilization</h3>
                <p>Your data is harnessed strictly for operational execution:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li>To reliably authenticate users and maintain robust workspace security.</li>
                  <li>To algorithmically verify incoming payments and fire real-time Webhook payloads to your servers.</li>
                  <li>To dispatch instant success/failure alerts via Telegram to your connected personal DM or Team Groups.</li>
                  <li>To identify anomalies and proactively prevent platform abuse, spam, and financial fraud.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">3. Cookies & Tracking Technologies</h3>
                <p>Xelpay uses local storage and essential session cookies exclusively to maintain your secure login state, remember UI preferences (like Dark/Light Mode), and ensure platform security. We do not deploy intrusive cross-site tracking cookies for third-party advertising purposes.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">4. Third-Party Data Sharing & Disclosure</h3>
                <p><strong>Xelpay does NOT monetize, sell, or arbitrarily share your data.</strong> Data is only disclosed under the following rigid parameters:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li><strong>Infrastructure Providers:</strong> We share encrypted operational data with secure, industry-leading infrastructure partners (e.g., Vercel, Supabase) strictly to host and maintain the software.</li>
                  <li><strong>Legal Directives:</strong> If served with a legally binding subpoena, court order, or formal request from cybercrime units and financial intelligence agencies, we will fully comply and release relevant merchant logs to assist in lawful investigations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">5. International Data Transfers</h3>
                <p>As we utilize global cloud infrastructure networks (such as Vercel and Supabase), your personal information and transaction logs may be transferred to, processed, and maintained on servers located outside of Bangladesh. We ensure that our infrastructure partners adhere to strict, internationally recognized data security standards.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">6. Consent to Electronic Communications</h3>
                <p>By registering an account, you explicitly consent to receive transactional and operational communications from us electronically via email or Telegram. These include system updates, security alerts, and billing notices. You may also receive promotional content, from which you possess the right to opt-out at any time.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">7. Data Retention, AML Compliance & Account Deletion</h3>
                <p>As the legal owner of your data, you possess the right to rectify, update, or completely purge your merchant profile. Should you decide to terminate your operations with Xelpay, you may submit a formal deletion request via our support channels.</p>
                <p className="mt-3 font-bold text-slate-700 dark:text-slate-300">AML Compliance Notice:</p>
                <p>To strictly comply with the Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) guidelines mandated by the Bangladesh Financial Intelligence Unit (BFIU), Xelpay reserves the legally mandated right to retain basic transaction logs, IP history, and identification metadata for a period of up to Five (5) years post-account termination before executing a complete data purge.</p>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
             <p className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest">
               By checking the agreement box during registration or by utilizing our APIs/Relay Apps, you legally bind yourself to the entirety of this document.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
