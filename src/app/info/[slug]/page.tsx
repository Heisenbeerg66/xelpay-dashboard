import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InfoPage({ params }: { params: { slug: string } }) {
  // ডাইনামিক স্লাগ অনুযায়ী পেইজের টাইটেল এবং কন্টেন্ট সেট করা
  const pageData: Record<string, { title: string; content: string }> = {
    'about': { title: 'About XelPay', content: 'XelPay is a robust payment automation gateway designed specifically for the modern businesses of Bangladesh. We empower merchants by bridging the gap between personal MFS accounts and professional business automation.' },
    'privacy': { title: 'Privacy Policy', content: 'We take your privacy seriously. Your data is encrypted and strictly used only to provide secure payment verification services. We do not sell your personal data to third parties.' },
    'terms': { title: 'Terms of Service', content: 'By using XelPay, you agree to our terms and conditions. Our services are provided "as is", and merchants are responsible for using the platform legally and ethically.' },
    'reseller': { title: 'Reseller Program', content: 'Join our reseller program and empower other businesses with XelPay technology while earning a sustainable recurring income.' },
    'docs': { title: 'Developer Guidance', content: 'Detailed integration documentation for Node.js, PHP, Python, and frontend frameworks will be available here soon.' },
    'api-reference': { title: 'API Reference', content: 'Get access to endpoints, payload structures, and HMAC signature generation guidelines for a secure server-to-server connection.' },
    'status': { title: 'System Status', content: 'All systems operational. Uptime: 99.99% across core webhook engines, verification services, and dashboard panels.' },
    'plugins': { title: 'CMS Plugins', content: 'We officially support plugins for WooCommerce, WordPress, and Shopify. Download links will be provided in your merchant dashboard.' },
    'ticket': { title: 'Help Center & Tickets', content: 'Submit a support ticket through your dashboard. Our technical team responds within 24 hours to resolve your queries.' },
    'affiliate': { title: 'Affiliate Program', content: 'Refer merchants to XelPay and earn 10% lifetime recurring commission on their subscription fees. Register from the dashboard to get your affiliate link.' }
  };

  const currentData = pageData[params.slug] || { title: 'Page Not Found', content: 'The information you are looking for does not exist or has been moved.' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-bold mb-10 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <div className="bg-white dark:bg-slate-800 p-10 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">{currentData.title}</h1>
          <div className="w-20 h-1 bg-blue-600 rounded-full mb-8"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {currentData.content}
          </p>
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-400 uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}