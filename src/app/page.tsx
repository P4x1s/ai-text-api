'use client';

import { useState } from 'react';

const PLANS = [
  { id: 'trial', name: 'Trial', price: 1, credits: 500, features: ['500 API calls', 'Basic text processing', 'Email support'] },
  { id: 'starter', name: 'Starter', price: 5, credits: 10000, features: ['10,000 API calls', 'Basic text processing', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 20, credits: 200000, features: ['200,000 API calls', 'Advanced AI models', 'Priority support', 'Custom modes'] },
  { id: 'enterprise', name: 'Enterprise', price: 100, credits: -1, features: ['Unlimited API calls', 'Custom AI models', 'Dedicated support', 'SLA guarantee'] },
];

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    address: string;
    amount: number;
    currency: string;
    network: string;
    plan: string;
    planName: string;
    credits: number;
  } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testText, setTestText] = useState('');
  const [testMode, setTestMode] = useState('paraphrase');
  const [testResult, setTestResult] = useState('');
  const [demoKey, setDemoKey] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handlePurchase = async (plan: string) => {
    setLoading(true);
    setSelectedPlan(plan);
    
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      setPaymentInfo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!paymentInfo) return;
    if (!senderAddress) {
      setVerifyError('Please enter your TRON wallet address');
      return;
    }
    setLoading(true);
    setVerifyError('');
    
    try {
      const res = await fetch(`/api/payment/verify?senderAddress=${senderAddress}&plan=${paymentInfo.plan}`);
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        setDemoKey(data.apiKey);
        
        // Send email with API key
        if (email) {
          try {
            await fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                apiKey: data.apiKey,
                plan: data.planName,
                credits: data.credits,
              }),
            });
            setEmailSent(true);
          } catch {
            console.error('Failed to send email');
          }
        }
      } else if (data.error) {
        setVerifyError(data.error);
      } else if (data.message) {
        setVerifyError(data.message);
      }
    } catch (err) {
      console.error(err);
      setVerifyError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!demoKey || !testText) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/process/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': demoKey,
        },
        body: JSON.stringify({ text: testText, mode: testMode }),
      });
      const data = await res.json();
      setTestResult(data.result || data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <span className="text-xl font-bold">AI CFSSR</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#api" className="hover:text-white transition">API</a>
            <a href="#docs" className="hover:text-white transition">Docs</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
          Pay with Crypto, Get Instant API Access
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI CFSSR - Text Processing API
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Paraphrase, summarize, grammar check, expand, and simplify text with a single API call.
          Pay once with USDT, get API credits forever.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#pricing" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
            Get API Key
          </a>
          <a href="#api" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition border border-gray-700">
            View Docs
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Choose Plan', desc: 'Select Trial, Starter, Pro, or Enterprise' },
            { step: '2', title: 'Pay USDT', desc: 'Send crypto to the generated address' },
            { step: '3', title: 'Get API Key', desc: 'Instant access, start building' },
          ].map((item) => (
            <div key={item.step} className="text-center p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Pricing</h2>
        <p className="text-gray-400 text-center mb-12">One-time payment. No subscriptions. Pay with USDT (TRC20).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-8 rounded-xl border ${
                selectedPlan === plan.id && !apiKey
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-gray-800 bg-gray-900'
              } transition`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4">
                ${plan.price}
                <span className="text-lg text-gray-500 font-normal"> USDT</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loading && selectedPlan === plan.id}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium transition"
              >
                {loading && selectedPlan === plan.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Modal */}
      {paymentInfo && !apiKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <h3 className="text-2xl font-bold mb-6">Complete Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Send exactly</label>
                <div className="text-2xl font-bold text-green-400">
                  {paymentInfo.amount} {paymentInfo.currency}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">To this TRC20 address</label>
                <div className="p-3 bg-gray-800 rounded-lg font-mono text-sm break-all mt-1">
                  {paymentInfo.address}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Network: {paymentInfo.network}
              </div>
              <div>
                <label className="text-sm text-gray-400">Your TRON wallet address (for verification)</label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="T..."
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email (to receive API key)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm mt-1"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg font-medium transition mt-4"
              >
                {loading ? 'Verifying...' : 'I\'ve Paid - Verify'}
              </button>
              {verifyError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {verifyError}
                </div>
              )}
              <button
                onClick={() => setPaymentInfo(null)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Display */}
      {apiKey && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">API Key Ready!</h3>
            <div className="p-3 bg-gray-800 rounded-lg font-mono text-sm break-all">
              {apiKey}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Keep this key secure. Use it in the x-api-key header for all API calls.
            </p>
            {emailSent && (
              <p className="text-sm text-green-400 mt-2">
                ✓ API key has been sent to {email}
              </p>
            )}
          </div>
        </div>
      )}

      {/* API Docs */}
      <section id="api" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">API Reference</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Endpoint 1 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
              <code className="text-sm">/api/process/text</code>
            </div>
            <p className="text-gray-400 text-sm mb-4">Process text with AI models</p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`curl -X POST https://your-domain.com/api/process/text \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: aitx_your_key_here" \\
  -d '{
    "text": "Your text here",
    "mode": "paraphrase"
  }'`}</pre>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
              <code className="text-sm">/api/key/verify</code>
            </div>
            <p className="text-gray-400 text-sm mb-4">Verify API key and check credits</p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`curl "https://your-domain.com/api/key/verify?key=aitx_your_key_here"`}</pre>
            </div>
          </div>

          {/* Endpoint 3 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">POST</span>
              <code className="text-sm">/api/payment/create</code>
            </div>
            <p className="text-gray-400 text-sm mb-4">Create a new payment</p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`curl -X POST https://your-domain.com/api/payment/create \\
  -H "Content-Type: application/json" \\
  -d '{"plan": "starter"}'`}</pre>
            </div>
          </div>

          {/* Endpoint 4 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
              <code className="text-sm">/api/payment/verify</code>
            </div>
            <p className="text-gray-400 text-sm mb-4">Verify payment and get API key</p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">{`curl "https://your-domain.com/api/payment/verify?paymentId=xxx"`}</pre>
            </div>
          </div>
        </div>

        {/* Modes */}
        <div className="mt-12 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4">Processing Modes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['paraphrase', 'summarize', 'grammar', 'expand', 'simplify'].map((mode) => (
              <div key={mode} className="p-4 bg-gray-800 rounded-lg text-center">
                <code className="text-blue-400">{mode}</code>
                <p className="text-xs text-gray-500 mt-1">
                  {mode === 'paraphrase' && 'Rewrite text in different words'}
                  {mode === 'summarize' && 'Condense to key points'}
                  {mode === 'grammar' && 'Fix grammar and spelling'}
                  {mode === 'expand' && 'Add detail and depth'}
                  {mode === 'simplify' && 'Make text easier to read'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Test */}
      <section id="docs" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Try It Live</h2>
        <p className="text-gray-400 text-center mb-8">Test the API with your own text</p>
        
        <div className="max-w-2xl mx-auto bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Your API Key</label>
            <input
              type="text"
              value={demoKey}
              onChange={(e) => setDemoKey(e.target.value)}
              placeholder="aitx_..."
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Mode</label>
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="paraphrase">Paraphrase</option>
              <option value="summarize">Summarize</option>
              <option value="grammar">Grammar</option>
              <option value="expand">Expand</option>
              <option value="simplify">Simplify</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Text</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to process..."
              rows={4}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={handleTest}
            disabled={loading || !demoKey || !testText}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition"
          >
            {loading ? 'Processing...' : 'Process Text'}
          </button>
          {testResult && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <label className="block text-sm text-gray-400 mb-2">Result</label>
              <p className="text-gray-200">{testResult}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            2026 AI CFSSR. Accepts USDT (TRC20) payments.
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Powered by Next.js + Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
