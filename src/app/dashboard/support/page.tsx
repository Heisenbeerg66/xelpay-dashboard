'use client';

import { useState } from 'react';
import { LifeBuoy, MessageSquare, Mail, Phone, Ticket, Send, Loader2, ArrowRight, ExternalLink, BookOpen, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'payment_issue',
    priority: 'normal',
    message: ''
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Call for creating a ticket
    setTimeout(() => {
      toast.success("Support ticket created! We will get back to you soon.");
      setTicketData({ subject: '', category: 'payment_issue', priority: 'normal', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center"><LifeBuoy size={20} /></div>
            Help & Support
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Need help with your XelPay account? Our technical team is here for you 24/7.
          </p>
        </div>
        
        <a href="https://docs.xelpay.com" target="_blank" rel="noopener noreferrer" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
          <BookOpen size={18} /> API Documentation
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* 📝 Left Side: Submit a Ticket */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Ticket size={20} className="text-blue-600" /> Open a Support Ticket
            </h3>

            <form onSubmit={handleSubmitTicket} className="space-y-5 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Category</label>
                  <div className="relative">
                    <select value={ticketData.category} onChange={(e) => setTicketData({...ticketData, category: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                      <option value="payment_issue">Payment / Transaction Issue</option>
                      <option value="api_integration">API & Integration Help</option>
                      <option value="billing">Billing & Subscription</option>
                      <option value="bug_report">Report a Bug</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Priority</label>
                  <div className="relative">
                    <select value={ticketData.priority} onChange={(e) => setTicketData({...ticketData, priority: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                      <option value="low">Low (General Question)</option>
                      <option value="normal">Normal (Standard Issue)</option>
                      <option value="urgent">Urgent (System Down / High Impact)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Subject</label>
                <input required type="text" placeholder="Briefly describe the issue..." value={ticketData.subject} onChange={(e) => setTicketData({...ticketData, subject: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Message Details</label>
                <textarea required rows={5} placeholder="Provide as much detail as possible. Include Order IDs, TrxIDs, or API error logs if applicable..." value={ticketData.message} onChange={(e) => setTicketData({...ticketData, message: e.target.value})} className="w-full px-4 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all resize-none leading-relaxed"></textarea>
              </div>

              <div className="pt-2">
                <button disabled={loading} type="submit" className="w-full md:w-auto px-8 py-4 rounded-xl font-black text-sm text-white bg-blue-600 disabled:bg-slate-400 hover:bg-blue-700 hover:-translate-y-0.5 uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 📞 Right Side: Quick Contact */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><LifeBuoy size={100} /></div>
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-green-400">All Systems Operational</span>
            </div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Average Response Time</h3>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm"><Clock size={24} className="text-blue-400" /></div>
              <div>
                <p className="text-2xl font-black">{'<'} 15 Mins</p>
                <p className="text-xs text-slate-400 font-medium">During business hours</p>
              </div>
            </div>
          </div>

          {/* Direct Contact Options */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Direct Contact</h3>

            <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 hover:border-green-500/50 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><MessageSquare size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Chat</h4>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Instant live support</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="mailto:support@xelpay.com" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><Mail size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Us</h4>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">support@xelpay.com</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="tel:+8801700000000" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center"><Phone size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Call Center</h4>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">+880 17XX XXXXXX</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}