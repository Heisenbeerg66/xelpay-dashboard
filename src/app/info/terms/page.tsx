import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Terms of Service</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">Last Updated: April 01, 2026</p>

        <div className="space-y-8 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          
          <section>
            <p>Welcome to Xelpay ("we," "our," or "us"). By registering for an account, accessing our dashboard, or integrating our API, you ("Merchant," "User," or "Client") agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">1. Description of Service</h2>
            <p>Xelpay provides payment verification software and automation APIs. We allow merchants to automate the tracking of Mobile Financial Services (MFS), Bank Transfers, and Crypto Gateways.</p>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <strong className="text-red-600 dark:text-red-400 uppercase tracking-wide text-xs">Crucial Disclaimer</strong>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">Xelpay is a technology provider, <strong>NOT a bank, financial institution, wallet, or payment aggregator.</strong> We do not hold, touch, or process your actual money. All funds are settled directly into your own personal or business accounts.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">2. Account Rules & Demo Mode</h2>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>You must provide accurate business and personal information during registration.</li>
              <li>You are responsible for the security of your account, API keys, and assigned team members.</li>
              <li><strong>Demo Mode:</strong> Our platform includes a Demo Mode for testing integrations. You must not process real customer data or real financial transactions using demo credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">3. Subscription & Billing</h2>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Free Plan:</strong> We offer a starter plan with strict monthly transaction limits (e.g., 100 transactions). Once the limit is reached, automation will automatically pause until upgraded.</li>
              <li><strong>Paid Plans:</strong> Premium features (Custom Telegram Bots, Team Members, International Gateways) require a paid monthly subscription.</li>
              <li><strong>Refunds:</strong> Due to the digital nature of our API infrastructure, subscription fees are generally non-refundable unless required by law or resulting from a critical system failure on our end.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">4. Acceptable Use Policy (Strictly Enforced)</h2>
            <p>You agree <strong>NOT</strong> to use Xelpay for any of the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Illegal activities, money laundering, funding terrorism, or selling restricted/illegal goods.</li>
              <li>Scams, fraudulent transactions, or deceiving customers.</li>
              <li>Using our APIs to spam or overwhelm third-party services.</li>
            </ul>
            <p className="mt-2 font-bold text-slate-800 dark:text-slate-200">Violation of this policy will result in immediate account suspension, permanent ban, and potential reporting to local law enforcement.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">5. Limitation of Liability</h2>
            <p>Xelpay provides its software "as is." We are not liable for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Downtimes or technical failures caused by third-party MFS providers (e.g., bKash, Nagad), Banks, or Telegram.</li>
              <li>Your MFS or Bank accounts getting restricted or blocked by the respective authorities due to volume limits or TOS violations.</li>
              <li>Any indirect financial losses, lost sales, or damages resulting from the use or inability to use our platform.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}

