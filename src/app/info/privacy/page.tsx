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
                <p>Welcome to Xelpay ("we," "our," or "us"). By registering an account, accessing our dashboard, utilizing our APIs, or interacting with any Xelpay services, you ("Merchant," "User," or "Client") agree to be strictly bound by these comprehensive Terms of Service. If you do not agree to every clause, you must immediately cease utilizing our platform.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">1. Right to Modify Terms & Policies</h3>
                <p className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <strong className="text-slate-900 dark:text-white">Authority Rights:</strong> Xelpay (Xenverse IT) reserves the absolute and exclusive right to update, modify, or replace any part of these Terms of Service or Privacy Policy at any time at our sole discretion. Furthermore, we reserve the right to modify, suspend, or permanently discontinue any feature within the platform without prior notice. Continued use of the platform after updates constitutes binding acceptance of the revised terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">2. Core Disclaimer & "AS-IS" Warranty</h3>
                <p>Xelpay is a strictly technological infrastructure providing payment verification software, API bridging, and automation tools. Our services are provided on an <strong>"AS-IS" and "AS-AVAILABLE"</strong> basis without explicit or implied warranties of absolute continuous functionality.</p>
                <div className="mt-4 p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl flex gap-4 items-start">
                  <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
                  <div>
                    <strong className="text-red-700 dark:text-red-400 uppercase tracking-widest text-[11px] block mb-1">Crucial Financial Disclaimer</strong>
                    <p className="text-red-600 dark:text-red-400 text-sm font-bold">Xelpay is a software layer, NOT a bank, financial institution, digital wallet, or payment aggregator. We do not hold, process, touch, or act as a custodian for your actual monetary funds. All transactions are peer-to-peer and settle directly into your own accounts. We bear zero liability for missing funds, unverified transactions, failed transfers, or disputes between you and your customers.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">3. Account Obligations, Age Restriction & Demo Mode</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Age Restriction:</strong> You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to create an account and operate a business using our services.</li>
                  <li><strong className="text-slate-900 dark:text-white">Accuracy of Information:</strong> You must provide truthful, current, and complete business information. Pseudonyms are strictly prohibited.</li>
                  <li><strong className="text-slate-900 dark:text-white">Account Security:</strong> You are solely responsible for maintaining the absolute confidentiality of your login credentials and API keys.</li>
                  <li><strong className="text-slate-900 dark:text-white">Demo Mode Constraints:</strong> You must NEVER process real customer data, real phone numbers, or execute genuine financial transactions using Demo Mode credentials.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">4. Intellectual Property (IP) Rights</h3>
                <p>All source code, Relay App APKs, UI/UX designs, API architectures, logos, and trademarks associated with Xelpay are the exclusive intellectual property of Xenverse IT. You strictly agree not to copy, clone, reverse-engineer, decompile, or resell any part of our platform.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">5. Subscription, Billing & Strict Refund Policy</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Free/Starter Tier:</strong> Xelpay offers a free tier equipped with a strict monthly transaction quota. Automation services will instantly halt upon quota exhaustion.</li>
                  <li><strong className="text-slate-900 dark:text-white">Paid Subscriptions:</strong> Premium capabilities (including extended limits, Team Members, Custom Telegram Bots, and International Gateways) mandate an active, recurring paid subscription. If a subscription expires, your account limits will immediately downgrade to the free tier limitations.</li>
                  <li><strong className="text-slate-900 dark:text-white">Strict No-Refund Policy:</strong> Due to the digital and infrastructural nature of our APIs, all subscription payments are <strong>strictly non-refundable</strong> once activated. Refunds are not issued for change of mind, unused quotas, or accounts banned due to policy violations. Exceptions are solely at our discretion for unresolvable technical failures originating explicitly from Xelpay's servers within the first 48 hours.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">6. Acceptable Use Policy (AUP) & Prohibited Conduct</h3>
                <p>You explicitly agree <strong>NOT</strong> to utilize Xelpay for any of the following:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong className="text-slate-900 dark:text-white">Illegal Goods:</strong> Processing payments for narcotics, adult content, unlicensed pharmaceuticals, or unauthorized gambling.</li>
                  <li><strong className="text-slate-900 dark:text-white">Financial Crimes:</strong> Money laundering, terrorist financing, scams, Ponzi schemes, or deceiving end-consumers.</li>
                  <li><strong className="text-slate-900 dark:text-white">System Abuse:</strong> Intentionally overwhelming or deploying DDoS attacks against Xelpay APIs.</li>
                </ul>
                <p className="mt-4 font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  ENFORCEMENT: Any violation will trigger an immediate, irreversible permanent ban of your merchant account and automatic disclosure of your data to local law enforcement and BFIU (Bangladesh Financial Intelligence Unit).
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">7. MFS Provider Liability & Taxation</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Zero Operator Liability:</strong> Utilizing Personal or Agent MFS accounts for high-volume transactions may violate MFS guidelines. We hold zero liability if your MFS/Bank accounts are flagged, restricted, or permanently terminated by the operators or regulatory authorities.</li>
                  <li><strong className="text-slate-900 dark:text-white">Taxation (NBR):</strong> You are solely responsible for calculating, collecting, and remitting all applicable Value Added Tax (VAT) and Income Tax to the National Board of Revenue (NBR).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">8. Force Majeure, Infrastructure Outages & Liability Cap</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Force Majeure & Network Disruptions:</strong> Xelpay shall NOT be liable for any transaction disruptions, unverified payments, or financial losses caused by internet service provider (ISP) outages, local or national electricity/power grid failures, cloud hosting downtimes (e.g., Vercel, Supabase), telecom failures, or backend server crashes of third-party MFS operators.</li>
                  <li><strong className="text-slate-900 dark:text-white">Strict Indemnification:</strong> You explicitly agree to indemnify and hold Xelpay harmless from any claims or demands filed by your end-customers arising from unfulfilled orders due to transaction delays or network failures.</li>
                  <li><strong className="text-slate-900 dark:text-white">Liability Cap:</strong> In no event shall Xelpay's aggregate liability for all claims related to the service exceed the total amount paid by you to Xelpay for the specific subscription during the ONE (1) month immediately preceding the claim.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">9. Dispute Resolution & Governing Law</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Mandatory Mediation:</strong> Before filing any formal legal claim, you are legally bound to allow a mandatory period of thirty (30) days for informal mediation via our support channels.</li>
                  <li><strong className="text-slate-900 dark:text-white">Class-Action Waiver:</strong> You explicitly agree that any disputes against Xelpay must be brought in your individual capacity, NOT as a plaintiff in a class-action lawsuit.</li>
                  <li><strong className="text-slate-900 dark:text-white">Governing Law:</strong> These Terms shall be governed by the laws of the People's Republic of Bangladesh. Exclusive jurisdiction resides in the competent courts of Dhaka, Bangladesh.</li>
                </ul>
              </div>
            </section>
          </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-8"></div>

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
                  <li><strong className="text-slate-900 dark:text-white">Merchant Identification Data:</strong> Full name, verified email address, mobile number, and business location provided during onboarding.</li>
                  <li><strong className="text-slate-900 dark:text-white">Technical Integration Data:</strong> API keys generated by our system, Webhook endpoint URLs designated by you, Telegram Bot Tokens, and associated Chat IDs.</li>
                  <li><strong className="text-slate-900 dark:text-white">Transaction & Device Metadata (Relay Apps):</strong> To cross-reference and approve orders, our automated systems process Transaction IDs (TrxID), exact amounts, timestamps, and the sender’s phone numbers. Furthermore, if you utilize our Relay or SMS Reader applications, we explicitly collect and store device-specific information (including Device Model, OS Version, App Version, and Connectivity Status) alongside the SMS data. This is strictly required to maintain sync reliability.</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <strong className="text-blue-700 dark:text-blue-400 font-black text-sm block mb-1">What We NEVER Collect:</strong>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">Under absolutely no circumstances does Xelpay record, store, or intercept your Bank Account Passwords, MFS App PIN Codes, OTPs (One Time Passwords), or raw Credit Card details.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">2. Purpose of Data Utilization</h3>
                <p>Your data is harnessed strictly for operational execution:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li><strong className="text-slate-900 dark:text-white">Authentication:</strong> To reliably authenticate users and maintain robust workspace security.</li>
                  <li><strong className="text-slate-900 dark:text-white">Verification:</strong> To algorithmically verify incoming payments and fire real-time Webhook payloads to your servers.</li>
                  <li><strong className="text-slate-900 dark:text-white">Notifications:</strong> To dispatch instant success/failure alerts via Telegram to your connected personal DM or Team Groups.</li>
                  <li><strong className="text-slate-900 dark:text-white">Security:</strong> To identify anomalies and proactively prevent platform abuse, spam, and financial fraud.</li>
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
                  <li><strong className="text-slate-900 dark:text-white">Infrastructure Providers:</strong> We share encrypted operational data with secure, industry-leading infrastructure partners (e.g., Vercel, Supabase) strictly to host and maintain the software.</li>
                  <li><strong className="text-slate-900 dark:text-white">Legal Directives:</strong> If served with a legally binding subpoena, court order, or formal request from cybercrime units and financial intelligence agencies, we will fully comply and release relevant merchant logs to assist in lawful investigations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">5. International Data Transfers & Security</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Global Servers:</strong> As we utilize global cloud infrastructure networks, your personal information and transaction logs may be transferred to, processed, and maintained on servers located outside of Bangladesh.</li>
                  <li><strong className="text-slate-900 dark:text-white">Data Breach Notification:</strong> We deploy modern cryptography to shield your information. In the highly unlikely event of a confirmed data breach that exposes your personal or API data, Xelpay commits to notifying affected merchants within 72 hours of verification.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-tight">6. Data Retention, Dormant Accounts & AML Compliance</h3>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong className="text-slate-900 dark:text-white">Dormant Account Policy:</strong> To maintain database integrity and reduce operational costs, Xelpay reserves the right to permanently delete merchant accounts (including all associated data and APIs) that have remained completely inactive for a continuous period of Six (6) months.</li>
                  <li><strong className="text-slate-900 dark:text-white">Data Deletion Rights:</strong> As the legal owner of your data, you possess the right to rectify, update, or completely purge your merchant profile by submitting a formal deletion request via our support channels.</li>
                  <li><strong className="text-slate-900 dark:text-white">AML Compliance Notice:</strong> To strictly comply with the Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) guidelines mandated by the Bangladesh Financial Intelligence Unit (BFIU), Xelpay reserves the legally mandated right to retain basic transaction logs, IP history, and identification metadata for a period of up to Five (5) years post-account termination before executing a complete data purge, irrespective of user deletion requests.</li>
                </ul>
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
