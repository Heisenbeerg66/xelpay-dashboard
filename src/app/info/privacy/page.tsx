import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0B1120] md:bg-slate-50 md:dark:bg-[#0B1120] md:py-12 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0B1120] md:dark:bg-[#111827] rounded-none md:rounded-[2.5rem] shadow-none md:shadow-2xl border-0 md:border border-slate-200 dark:border-slate-800 p-6 md:p-12 min-h-[100dvh] md:min-h-0">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Terms & Privacy</h1>
        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
          Last Updated: April 01, 2026
        </p>

        <div className="space-y-12 text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base">
          
          {/* ================= TERMS OF SERVICE ================= */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><FileText size={24} /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 1: Terms of Service</h2>
            </div>
            
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">1. Description of Service</h3>
                <p>Xelpay provides payment verification software and automation APIs. We allow merchants to automate the tracking of Mobile Financial Services (MFS), Bank Transfers, and International Gateways.</p>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                  <strong className="text-red-600 dark:text-red-400 uppercase tracking-widest text-[10px] block mb-1">Crucial Disclaimer</strong>
                  <p className="text-red-600 dark:text-red-400 text-sm">Xelpay is a technology provider, <strong>NOT a bank, financial institution, wallet, or payment aggregator.</strong> We do not hold, touch, or process your actual money. All funds are settled directly into your own personal or business accounts.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">2. Account Rules & Demo Mode</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You must provide accurate business and personal information during registration.</li>
                  <li>You are responsible for the security of your account, API keys, and assigned team members.</li>
                  <li><strong>Demo Mode:</strong> Our platform includes a Demo Mode for testing integrations. You must not process real customer data or real financial transactions using demo credentials.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">3. Acceptable Use Policy</h3>
                <p>You agree <strong>NOT</strong> to use Xelpay for any of the following:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Illegal activities, money laundering, funding terrorism, or selling restricted/illegal goods.</li>
                  <li>Scams, fraudulent transactions, or deceiving customers.</li>
                </ul>
                <p className="mt-2 font-bold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs md:text-sm">Violation of this policy will result in immediate account suspension, permanent ban, and potential reporting to local law enforcement.</p>
              </div>
            </section>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full my-4"></div>

          {/* ================= PRIVACY POLICY ================= */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><ShieldCheck size={24} /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Part 2: Privacy Policy</h2>
            </div>

            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and business details.</li>
                  <li><strong>Technical Data:</strong> API keys, Webhook URLs, Telegram Bot Tokens, and IP addresses.</li>
                  <li><strong>Transaction Metadata:</strong> We process transaction IDs, amounts, and sender phone numbers strictly for verification. <br/><span className="text-blue-600 font-bold text-xs md:text-sm">We NEVER collect or store sensitive banking passwords, MFS PIN codes, or credit card details.</span></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">2. How We Use Your Information</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To authenticate your login and secure your merchant workspace.</li>
                  <li>To process, verify, and log transactions automatically via Webhooks and Telegram.</li>
                  <li>To prevent fraudulent or suspicious activities.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-tight">3. Data Sharing & Security</h3>
                <p><strong>We do not sell, rent, or trade your personal data.</strong> We use industry-standard encryption, secure databases, and protected API endpoints to keep your data safe. We may only share information with legal authorities if strictly required by law to investigate fraud.</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               By using Xelpay, you acknowledge that you have read and agree to these terms.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
