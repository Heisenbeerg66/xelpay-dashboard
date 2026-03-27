'use client';

import { useState, useEffect } from 'react';
import { Code, Terminal, Box, Copy, RefreshCw, Loader2, Building2, Download, ShieldCheck, Link as LinkIcon, Save, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ApiAndPlugins() {
  const [loading, setLoading] = useState(true);
  const [savingUrl, setSavingUrl] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Tabs for Sandbox
  const [activeTab, setActiveTab] = useState('create-order');
  const [langTab, setLangTab] = useState('nodejs'); 

  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingWh, setRegeneratingWh] = useState(false);
  
  const [keys, setKeys] = useState({
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    webhookUrl: ''
  });

  const fetchKeys = async (bizId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('public_key, secret_key, webhook_secret, webhook_url')
      .eq('id', bizId)
      .single();
      
    if (data) {
      setKeys({
        publicKey: data.public_key || '',
        secretKey: data.secret_key || '',
        webhookSecret: data.webhook_secret || '',
        webhookUrl: data.webhook_url || ''
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem('active_business_id');
      if (activeId) {
        setBusinessId(activeId);
        fetchKeys(activeId);
      } else {
        setLoading(false);
      }
    };
    loadData();
    window.addEventListener('businessChanged', loadData);
    return () => window.removeEventListener('businessChanged', loadData);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleSaveWebhookUrl = async () => {
    if (!businessId) return;
    setSavingUrl(true);
    const { error } = await supabase.from('businesses').update({ webhook_url: keys.webhookUrl }).eq('id', businessId);
    if (!error) toast.success("Webhook URL saved successfully!");
    else toast.error("Failed to save Webhook URL.");
    setSavingUrl(false);
  };

  const handleRegenerateKey = async () => {
    if (!confirm("WARNING: Regenerating the Secret Key will break any existing API integrations. Proceed?")) return;
    setRegenerating(true);
    const newKey = 'xp_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { error } = await supabase.from('businesses').update({ secret_key: newKey }).eq('id', businessId);
    if (!error) {
      setKeys({ ...keys, secretKey: newKey });
      toast.success("Secret Key regenerated successfully!");
    }
    setRegenerating(false);
  };

  const handleRegenerateWebhook = async () => {
    if (!confirm("WARNING: Regenerating the Webhook Secret will break your current webhook verification. Proceed?")) return;
    setRegeneratingWh(true);
    const newWh = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { error } = await supabase.from('businesses').update({ webhook_secret: newWh }).eq('id', businessId);
    if (!error) {
      setKeys({ ...keys, webhookSecret: newWh });
      toast.success("Webhook Secret regenerated successfully!");
    }
    setRegeneratingWh(false);
  };

  const maskedSecretKey = keys.secretKey ? `${keys.secretKey.substring(0, 8)}••••••••••••••••` : '';
  const maskedWebhookSecret = keys.webhookSecret ? `${keys.webhookSecret.substring(0, 8)}••••••••••••••••` : '';

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 p-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4"><Building2 size={32} /></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Workspace Selected</h2>
        <p className="text-slate-500 mt-2 font-medium text-sm">Please select a business to view its API settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Code size={26} className="text-blue-600 shrink-0" /> Developers & Plugins
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Everything you need to integrate XelPay securely into your custom app or CMS.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* 🔐 Left Side: Keys, Webhooks & Plugins */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            
            {/* API Credentials */}
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Terminal size={18} className="text-blue-600" /> API Credentials
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Public Key (Publishable)</label>
                  <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group">
                    <input type="text" readOnly value={keys.publicKey} className="w-full px-4 py-3.5 bg-transparent outline-none text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate" />
                    <button onClick={() => copyToClipboard(keys.publicKey, 'Public Key')} className="px-4 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l border-slate-200 dark:border-slate-800 active:bg-slate-200">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-center pl-1">
                    Secret Key (Hidden)
                    <button onClick={handleRegenerateKey} disabled={regenerating} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                      {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Roll
                    </button>
                  </label>
                  <div className="flex bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    <input type="text" readOnly value={maskedSecretKey} className="w-full pl-4 pr-2 py-3.5 bg-transparent outline-none text-xs font-mono font-bold text-slate-900 dark:text-white truncate" />
                    <button onClick={() => copyToClipboard(keys.secretKey, 'Secret Key')} className="px-4 text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border-l border-red-200 dark:border-red-900/30 active:bg-red-200">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔗 Webhook Configuration */}
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
              
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5 flex items-center gap-2 relative z-10">
                <LinkIcon size={18} className="text-purple-600" /> Webhook Settings
              </h3>
              <p className="text-[11px] md:text-xs text-slate-500 mb-5 relative z-10">We will send a POST request to this URL when a payment is successful.</p>

              <div className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Webhook URL</label>
                  <div className="flex bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
                    <input type="url" placeholder="https://yoursite.com/api/webhook" value={keys.webhookUrl} onChange={(e) => setKeys({...keys, webhookUrl: e.target.value})} className="w-full px-4 py-3.5 bg-transparent outline-none text-xs font-mono font-bold text-slate-900 dark:text-white" />
                    <button onClick={handleSaveWebhookUrl} disabled={savingUrl} className="px-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border-l border-slate-200 dark:border-slate-800 flex items-center gap-1.5 active:bg-purple-200 shrink-0">
                      {savingUrl ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest flex justify-between items-center pl-1">
                    Webhook Signing Secret
                    <button onClick={handleRegenerateWebhook} disabled={regeneratingWh} className="text-purple-500 hover:text-purple-600 flex items-center gap-1">
                      {regeneratingWh ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Roll
                    </button>
                  </label>
                  <div className="flex bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                    <input type="text" readOnly value={maskedWebhookSecret} className="w-full pl-4 pr-2 py-3.5 bg-transparent outline-none text-xs font-mono font-bold text-slate-900 dark:text-white truncate" />
                    <button onClick={() => copyToClipboard(keys.webhookSecret, 'Webhook Secret')} className="px-4 text-slate-400 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border-l border-purple-200 dark:border-purple-900/30 active:bg-purple-200">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🧩 CMS Plugins Box */}
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Box size={18} className="text-blue-600" /> CMS Plugins Setup
              </h3>
              <p className="text-[11px] md:text-xs text-slate-500 mb-5 leading-relaxed">No coding needed! Install the plugin, paste the <b>Public Key</b>, <b>Secret Key</b>, and <b>Webhook Secret</b> in the settings.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-colors group cursor-pointer bg-slate-50 dark:bg-[#0B1120] active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7F54B3] text-white flex items-center justify-center font-black text-lg shadow-inner shrink-0">W</div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">WooCommerce</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">Official Release • v2.1.0</p>
                    </div>
                  </div>
                  <button className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-10 h-10 flex items-center justify-center rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <Download size={18}/>
                  </button>
                </div>
              </div>
            </div>

          </div>{/* 💻 Right Side: Mac-Style Developer Terminal */}
          <div className="lg:col-span-7 bg-[#0D1117] rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden h-[600px] lg:h-auto">
            
            {/* 🍎 Mac Window Header */}
            <div className="px-4 py-3 border-b border-slate-800 bg-[#161B22] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              
              <div className="flex items-center gap-4">
                {/* Mac Dots */}
                <div className="flex gap-1.5 shrink-0 hidden sm:flex">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                {/* Swipeable Tabs */}
                <div className="flex bg-[#0D1117] border border-slate-800 rounded-lg p-1 w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {[
                    { id: 'create-order', label: 'Create Order' },
                    { id: 'verify-webhook', label: 'Verify Webhook' }
                  ].map(tab => (
                    <button 
                      key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-1.5 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Toggle */}
              <div className="flex bg-[#0D1117] border border-slate-800 rounded-lg p-1 shrink-0 self-end sm:self-auto">
                <button onClick={() => setLangTab('nodejs')} className={`px-4 py-1.5 rounded-md text-[10px] md:text-xs font-black uppercase transition-all ${langTab === 'nodejs' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Node.js</button>
                <button onClick={() => setLangTab('php')} className={`px-4 py-1.5 rounded-md text-[10px] md:text-xs font-black uppercase transition-all ${langTab === 'php' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>PHP</button>
              </div>
            </div>

            {/* ⌨️ Main Code Area (Scrollable independently) */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar relative group bg-[#0D1117]">
              <button onClick={() => copyToClipboard('Code copied', 'Snippet')} className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur text-slate-300 p-2.5 rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-blue-600 z-20 shadow-lg active:scale-95">
                <Copy size={18} />
              </button>

              {/* 🟢 TAB 1: CREATE ORDER */}
              {activeTab === 'create-order' && (
                <div className="animate-in fade-in duration-300">
                  {langTab === 'nodejs' ? (
                    <pre className="text-slate-300 font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto w-full block custom-scrollbar pb-4">
<span className="text-slate-500">// Initialize Payment Session via POST Request</span><br/>
<span className="text-purple-500">const</span> axios = <span className="text-blue-400">require</span>(<span className="text-green-400">'axios'</span>);<br/><br/>

<span className="text-purple-500">async function</span> <span className="text-blue-400">createPayment</span>() {'{'}<br/>
  <span className="text-purple-500">const</span> payload = {'{'}<br/>
    amount: <span className="text-orange-400">500.00</span>,<br/>
    order_id: <span className="text-green-400">'INV-12345'</span>,<br/>
    customer_name: <span className="text-green-400">'John Doe'</span>,<br/>
    customer_phone: <span className="text-green-400">'017XXXXXXXX'</span>,<br/>
    <br/>
    <span className="text-slate-500">// Optional Details</span><br/>
    product_name: <span className="text-green-400">'Premium Subscription'</span>,<br/>
    redirect_url: <span className="text-green-400">'https://yoursite.com/success'</span><br/>
  {'}'};<br/><br/>

  <span className="text-purple-500">const</span> response = <span className="text-pink-500">await</span> axios.post(<span className="text-green-400">'https://api.xelpay.com/api/create-order'</span>, payload, {'{'}<br/>
    headers: {'{'}<br/>
      <span className="text-green-400">'Authorization'</span>: <span className="text-green-400">`Bearer <span className="text-white bg-slate-800 px-1 rounded">YOUR_SECRET_KEY</span>`</span>,<br/>
      <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span><br/>
    {'}'}<br/>
  {'}'});<br/><br/>
  
  <span className="text-slate-500">// Redirect user to this link to complete payment</span><br/>
  <span className="text-blue-400">console</span>.log(response.data.payment_url);<br/>
{'}'}
                    </pre>
                  ) : (
                    <pre className="text-slate-300 font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto w-full block custom-scrollbar pb-4">
<span className="text-pink-500">&lt;?php</span><br/>
<span className="text-blue-400">$curl</span> = <span className="text-purple-500">curl_init</span>();<br/><br/>

<span className="text-purple-500">curl_setopt_array</span>(<span className="text-blue-400">$curl</span>, [<br/>
  CURLOPT_URL =&gt; <span className="text-green-400">'https://api.xelpay.com/api/create-order'</span>,<br/>
  CURLOPT_RETURNTRANSFER =&gt; <span className="text-orange-400">true</span>,<br/>
  CURLOPT_CUSTOMREQUEST =&gt; <span className="text-green-400">'POST'</span>,<br/>
  CURLOPT_POSTFIELDS =&gt; <span className="text-purple-500">json_encode</span>([<br/>
    <span className="text-green-400">'amount'</span> =&gt; <span className="text-orange-400">500.00</span>,<br/>
    <span className="text-green-400">'order_id'</span> =&gt; <span className="text-green-400">'INV-12345'</span>,<br/>
    <span className="text-green-400">'customer_name'</span> =&gt; <span className="text-green-400">'John Doe'</span>,<br/>
    <span className="text-green-400">'customer_phone'</span> =&gt; <span className="text-green-400">'017XXXXXXXX'</span><br/>
  ]),<br/>
  CURLOPT_HTTPHEADER =&gt; [<br/>
    <span className="text-green-400">'Authorization: Bearer YOUR_SECRET_KEY'</span>,<br/>
    <span className="text-green-400">'Content-Type: application/json'</span><br/>
  ],<br/>
]);<br/><br/>

<span className="text-blue-400">$response</span> = <span className="text-purple-500">curl_exec</span>(<span className="text-blue-400">$curl</span>);<br/>
<span className="text-blue-400">$data</span> = <span className="text-purple-500">json_decode</span>(<span className="text-blue-400">$response</span>);<br/><br/>

<span className="text-slate-500">// Redirect user to complete payment</span><br/>
<span className="text-purple-500">header</span>(<span className="text-green-400">"Location: "</span> . <span className="text-blue-400">$data</span>-&gt;payment_url);<br/>
                    </pre>
                  )}
                </div>
              )}

              {/* 🟢 TAB 2: VERIFY WEBHOOK */}
              {activeTab === 'verify-webhook' && (
                <div className="animate-in fade-in duration-300">
                  {langTab === 'nodejs' ? (
                    <pre className="text-slate-300 font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto w-full block custom-scrollbar pb-4">
<span className="text-slate-500">// Express.js Webhook Verification Example</span><br/>
<span className="text-purple-500">const</span> crypto = <span className="text-blue-400">require</span>(<span className="text-green-400">'crypto'</span>);<br/>
<span className="text-purple-500">const</span> express = <span className="text-blue-400">require</span>(<span className="text-green-400">'express'</span>);<br/>
<span className="text-purple-500">const</span> app = express();<br/><br/>

<span className="text-purple-500">const</span> WEBHOOK_SECRET = <span className="text-green-400">'<span className="text-white bg-slate-800 px-1 rounded">YOUR_WEBHOOK_SECRET</span>'</span>;<br/><br/>

<span className="text-slate-500">// Important: Use express.raw() to get the exact payload string for hashing</span><br/>
app.post(<span className="text-green-400">'/api/webhook'</span>, express.raw({'{'}<span className="text-blue-400">type</span>: <span className="text-green-400">'application/json'</span>{'}'}), (req, res) =&gt; {'{'}<br/>
  <span className="text-purple-500">const</span> signature = req.headers[<span className="text-green-400">'x-xelpay-signature'</span>];<br/>
  <br/>
  <span className="text-slate-500">// 1. Generate HMAC SHA256 Signature</span><br/>
  <span className="text-purple-500">const</span> expectedSignature = crypto<br/>
    .createHmac(<span className="text-green-400">'sha256'</span>, WEBHOOK_SECRET)<br/>
    .update(req.body)<br/>
    .digest(<span className="text-green-400">'hex'</span>);<br/><br/>

  <span className="text-slate-500">// 2. Verify safely</span><br/>
  <span className="text-purple-500">if</span> (signature !== expectedSignature) {'{'}<br/>
    <span className="text-blue-400">console</span>.error(<span className="text-red-400">"Invalid Webhook Signature Detected!"</span>);<br/>
    <span className="text-purple-500">return</span> res.status(<span className="text-orange-400">400</span>).send(<span className="text-green-400">'Invalid signature'</span>);<br/>
  {'}'}<br/><br/>

  <span className="text-slate-500">// 3. Process the order (Signature is 100% Valid)</span><br/>
  <span className="text-purple-500">const</span> event = <span className="text-blue-400">JSON</span>.parse(req.body);<br/>
  <span className="text-purple-500">if</span> (event.event === <span className="text-green-400">'payment.success'</span>) {'{'}<br/>
    <span className="text-blue-400">console</span>.log(<span className="text-green-400">"Order Paid: "</span>, event.order_id);<br/>
    <span className="text-blue-400">console</span>.log(<span className="text-green-400">"Method: "</span>, event.payment_method); <span className="text-slate-500">// e.g., Bkash</span><br/>
    <span className="text-slate-500">// Fulfill the order in your database</span><br/>
  {'}'}<br/>
  <br/>
  res.json({'{'}<span className="text-blue-400">received</span>: <span className="text-orange-400">true</span>{'}'});<br/>
{'}'});
                    </pre>
                  ) : (
                    <pre className="text-slate-300 font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto w-full block custom-scrollbar pb-4">
<span className="text-pink-500">&lt;?php</span><br/>
<span className="text-slate-500">// PHP Webhook Verification Example</span><br/>
<span className="text-blue-400">$webhook_secret</span> = <span className="text-green-400">'YOUR_WEBHOOK_SECRET'</span>;<br/><br/>

<span className="text-slate-500">// Get raw payload</span><br/>
<span className="text-blue-400">$payload</span> = <span className="text-purple-500">file_get_contents</span>(<span className="text-green-400">'php://input'</span>);<br/>
<span className="text-blue-400">$signature</span> = <span className="text-blue-400">$_SERVER</span>[<span className="text-green-400">'HTTP_X_XELPAY_SIGNATURE'</span>] ?? <span className="text-green-400">''</span>;<br/><br/>

<span className="text-slate-500">// Generate HMAC Signature</span><br/>
<span className="text-blue-400">$expected_signature</span> = <span className="text-purple-500">hash_hmac</span>(<span className="text-green-400">'sha256'</span>, <span className="text-blue-400">$payload</span>, <span className="text-blue-400">$webhook_secret</span>);<br/><br/>

<span className="text-slate-500">// Compare signatures securely</span><br/>
<span className="text-purple-500">if</span> (<span className="text-purple-500">hash_equals</span>(<span className="text-blue-400">$expected_signature</span>, <span className="text-blue-400">$signature</span>)) {'{'}<br/>
    <span className="text-blue-400">$event</span> = <span className="text-purple-500">json_decode</span>(<span className="text-blue-400">$payload</span>);<br/>
    <br/>
    <span className="text-purple-500">if</span> (<span className="text-blue-400">$event</span>-&gt;event === <span className="text-green-400">'payment.success'</span>) {'{'}<br/>
        <span className="text-blue-400">$method</span> = <span className="text-blue-400">$event</span>-&gt;payment_method; <span className="text-slate-500">// e.g. Bkash / Nagad</span><br/>
        <span className="text-slate-500">// Security passed! Deliver order based on $event-&gt;order_id</span><br/>
    {'}'}<br/>
    <span className="text-purple-500">http_response_code</span>(<span className="text-orange-400">200</span>);<br/>
{'}'} <span className="text-purple-500">else</span> {'{'}<br/>
    <span className="text-purple-500">http_response_code</span>(<span className="text-orange-400">400</span>);<br/>
    <span className="text-purple-500">die</span>(<span className="text-green-400">'Invalid Signature'</span>);<br/>
{'}'}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* 📋 Footer Documentation Panel */}
            <div className="bg-[#161B22] border-t border-slate-800 p-4 md:p-5 shrink-0 z-10 relative">
              {activeTab === 'create-order' && (
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1.5">Required Payload Fields</h4>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      <span className="bg-[#0D1117] border border-slate-700 text-slate-300 px-2 py-1 rounded">amount</span>
                      <span className="bg-[#0D1117] border border-slate-700 text-slate-300 px-2 py-1 rounded">order_id</span>
                      <span className="bg-[#0D1117] border border-slate-700 text-slate-300 px-2 py-1 rounded">customer_name</span>
                      <span className="bg-[#0D1117] border border-slate-700 text-slate-300 px-2 py-1 rounded">customer_phone</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'verify-webhook' && (
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1.5">Incoming Webhook Payload</h4>
                    <p className="text-[10px] md:text-xs text-slate-400 font-mono break-all leading-relaxed">
                      {`{ "event": "payment.success", "order_id": "INV-12345", "amount": 500, "trx_id": "BKASH123XYZ", "payment_method": "Bkash" }`}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}