'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus, Copy, ExternalLink, Trash2, Loader2, Globe, Tag, Edit3, Building2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PaymentLinks() {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessSlug, setBusinessSlug] = useState<string>('business');
  
  // Modal & Animation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [newLink, setNewLink] = useState({
    title: '',
    link_id: '',
    amount: '',
    currency: 'BDT',
    discount: '',
    discount_type: 'flat',
    description: ''
  });

  const fetchLinksAndBusiness = async (bizId: string) => {
    setLoading(true);
    const { data: bizData } = await supabase.from('businesses').select('slug').eq('id', bizId).single();
    if (bizData?.slug) setBusinessSlug(bizData.slug);

    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });
      
    if (data) setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchLinksAndBusiness(activeId);
      } else {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const link_id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setNewLink({ ...newLink, title, link_id });
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 🛡️ Data Type Formatting for Database Safety
    const insertData = {
      merchant_id: user?.id,
      business_id: businessId,
      title: newLink.title,
      link_id: newLink.link_id || Math.random().toString(36).substring(7),
      amount: newLink.amount && newLink.amount !== '' ? parseFloat(newLink.amount) : null,
      currency: newLink.currency,
      discount: newLink.discount && newLink.discount !== '' ? parseFloat(newLink.discount) : 0,
      discount_type: newLink.discount_type,
      description: newLink.description || '',
      status: 'active'
    };

    const { error } = await supabase.from('payment_links').insert(insertData);

    if (error) {
      console.error("Supabase Error Details: ", error); 
      const errMsg = error?.message || JSON.stringify(error);
      
      if (errMsg.includes('unique')) {
        toast.error('This Link ID is already taken. Please try another.');
      } else {
        toast.error(`Database Error: Check console for details.`);
      }
      setSaving(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        toast.success('Payment link created successfully!');
        setIsModalOpen(false);
        setIsSuccess(false); 
        setSaving(false);
        setNewLink({ title: '', link_id: '', amount: '', currency: 'BDT', discount: '', discount_type: 'flat', description: '' });
        fetchLinksAndBusiness(businessId);
      }, 1500);
    }
  };

  const copyToClipboard = (link_id: string) => {
    const url = `${window.location.origin}/${businessSlug}/${link_id}`;
    navigator.clipboard.writeText(url);
    toast.success('Payment link copied to clipboard!');
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    const { error } = await supabase.from('payment_links').delete().eq('id', id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
      toast.success("Link deleted successfully!");
    }
  };

  const calculateFinalPrice = (amount: number, discount: number, type: string) => {
    if (!amount) return 0;
    if (type === 'percentage') {
      return amount - (amount * (discount / 100));
    }
    return amount - discount;
  };

  const currencySymbol = newLink.currency === 'USD' ? '$' : '৳';

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium">Please select a business to manage payment links.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LinkIcon size={28} className="text-blue-600" /> Payment Links
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Create dynamic links with discounts to accept payments instantly.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/30">
          <Plus size={18} /> Create New Link
        </button>
      </div>{/* 🧾 Links Table View */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : links.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><LinkIcon size={24} /></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">No Links Created Yet</h3>
            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto mb-6">Create your first payment link to start receiving payments directly.</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all">Create Payment Link</button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#0B1120]/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/50">
                  <th className="p-4 md:px-6 md:py-5 w-16 text-center">No.</th>
                  <th className="p-4 md:px-6 md:py-5">Product Info & URL</th>
                  <th className="p-4 md:px-6 md:py-5">Price & Discount</th>
                  <th className="p-4 md:px-6 md:py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-slate-100 dark:divide-slate-800/50">
                {links.map((link, index) => {
                  const finalPrice = calculateFinalPrice(link.amount, link.discount, link.discount_type);
                  const symbol = link.currency === 'USD' ? '$' : '৳';
                  const fullUrl = `xelpay.com/${businessSlug}/${link.link_id}`;

                  return (
                    <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="p-4 md:px-6 md:py-4 text-center text-slate-400 font-bold">{index + 1}</td>
                      
                      <td className="p-4 md:px-6 md:py-4">
                        <p className="font-black text-slate-900 dark:text-white text-base mb-1">{link.title}</p>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1 rounded-md w-fit">
                          <Globe size={12} /> {fullUrl}
                        </div>
                      </td>

                      <td className="p-4 md:px-6 md:py-4">
                        {link.amount ? (
                          <div className="flex flex-col">
                            {link.discount > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 line-through decoration-red-500/50 font-bold">{symbol}{link.amount}</span>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                  -{link.discount}{link.discount_type === 'percentage' ? '%' : symbol} Off
                                </span>
                              </div>
                            ) : null}
                            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{symbol}{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest">Custom Amount</span>
                        )}
                      </td>

                      <td className="p-4 md:px-6 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => copyToClipboard(link.link_id)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition-colors tooltip" title="Copy Link">
                            <Copy size={16} />
                          </button>
                          <a href={`http://${fullUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                            <ExternalLink size={16} />
                          </a>
                          <button onClick={() => deleteLink(link.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 Create Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            {/* 🟢 Success Overlay Animation */}
            {isSuccess && (
              <div className="absolute inset-0 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[2.5rem] animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl scale-up-animation">
                  <CheckCircle size={48} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Link Saved!</h3>
                <p className="text-sm font-bold text-slate-500 mt-2">Generating your checkout page...</p>
              </div>
            )}

            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              Create Payment Link
            </h3>
            
            <form onSubmit={handleCreateLink} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Product / Title Name</label>
                <input required type="text" placeholder="e.g. Premium Smartwatch" value={newLink.title} onChange={handleTitleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 text-base font-bold text-slate-900 dark:text-white transition-all" />
              </div>

              {/* URL Customizer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1.5"><Edit3 size={12}/> Customize URL (Link ID)</label>
                <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                   <span className="pl-4 pr-1 py-4 text-slate-400 text-sm font-mono flex items-center hidden sm:flex">xelpay.com/<span className="text-blue-500 font-bold ml-1">{businessSlug}</span>/</span>
                   <input required type="text" value={newLink.link_id} onChange={(e) => setNewLink({...newLink, link_id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-4 py-4 bg-transparent outline-none text-sm font-mono font-bold text-slate-900 dark:text-white" />
                </div>
              </div>

              {/* Price & Currency Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Currency</label>
                  <div className="flex bg-white dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {['BDT', 'USD'].map(curr => (
                      <button 
                        key={curr} type="button" 
                        onClick={() => setNewLink({...newLink, currency: curr})}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${newLink.currency === curr ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Base Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">{currencySymbol}</span>
                    <input type="number" step="any" placeholder="0.00" value={newLink.amount} onChange={(e) => setNewLink({...newLink, amount: e.target.value})} className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-black text-slate-900 dark:text-white transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1.5"><Tag size={12}/> Discount Applied</label>
                  <div className="flex bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors relative">
                     <select value={newLink.discount_type} onChange={(e) => setNewLink({...newLink, discount_type: e.target.value})} className="bg-slate-100 dark:bg-slate-800 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700 cursor-pointer appearance-none">
                       <option value="flat">Flat ({currencySymbol})</option>
                       <option value="percentage">Percent (%)</option>
                     </select>
                     <input type="number" step="any" placeholder="0.00" value={newLink.discount} onChange={(e) => setNewLink({...newLink, discount: e.target.value})} className="w-full px-4 py-3.5 bg-transparent outline-none text-sm font-black text-slate-900 dark:text-white" />
                  </div>
                </div>

              </div>

              {/* Preview Box */}
              {newLink.amount && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">Customer Will Pay:</span>
                  <span className="text-xl font-black text-blue-600">
                    {currencySymbol}{calculateFinalPrice(parseFloat(newLink.amount), parseFloat(newLink.discount || '0'), newLink.discount_type).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Description (Optional)</label>
                <textarea rows={2} placeholder="Brief product description..." value={newLink.description} onChange={(e) => setNewLink({...newLink, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all resize-none"></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 uppercase tracking-widest transition-colors">Cancel</button>
                <button disabled={saving || isSuccess} type="submit" className="flex-1 py-4 rounded-xl font-black text-sm text-white bg-blue-600 disabled:bg-slate-400 hover:bg-blue-700 uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 relative overflow-hidden">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}