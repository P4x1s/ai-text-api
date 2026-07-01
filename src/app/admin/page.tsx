'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keys, setKeys] = useState<Array<{ id: string; key: string; plan: string; credits: number; created_at: string }>>([]);
  const [stats, setStats] = useState<{ total: number; byPlan: Record<string, number>; totalCredits: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Create key form
  const [newKey, setNewKey] = useState('');
  const [newPlan, setNewPlan] = useState('starter');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?token=${token}&action=stats`);
      if (res.ok) {
        setIsLoggedIn(true);
        loadData();
      } else {
        setMessage('Invalid token');
      }
    } catch {
      setMessage('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysRes, statsRes] = await Promise.all([
        fetch(`/api/admin?token=${token}&action=list`),
        fetch(`/api/admin?token=${token}&action=stats`),
      ]);
      
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeys(keysData.keys || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    setLoading(true);
    try {
      const credits = newPlan === 'trial' ? 500 : newPlan === 'starter' ? 10000 : newPlan === 'pro' ? 200000 : -1;
      const key = newKey || `aitx_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
      
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'create', key, plan: newPlan, credits }),
      });

      if (res.ok) {
        setMessage('Key created successfully');
        setNewKey('');
        loadData();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create key');
      }
    } catch {
      setMessage('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(`Delete key ${key}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'delete', key }),
      });

      if (res.ok) {
        setMessage('Key deleted');
        loadData();
      }
    } catch {
      setMessage('Failed to delete key');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 mb-4"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          {message && <p className="text-red-400 text-sm mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI CFSSR Admin</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm">Total Keys</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            {Object.entries(stats.byPlan).map(([plan, count]) => (
              <div key={plan} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm">{plan}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Key */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-xl font-bold mb-4">Create API Key</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Custom key (optional)"
              className="flex-1 p-3 bg-gray-800 rounded-lg border border-gray-700"
            />
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              className="p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <option value="trial">Trial ($1)</option>
              <option value="starter">Starter ($5)</option>
              <option value="pro">Pro ($20)</option>
              <option value="enterprise">Enterprise ($100)</option>
            </select>
            <button
              onClick={handleCreateKey}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              Create
            </button>
          </div>
        </div>

        {/* Keys List */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">API Keys</h2>
            <button onClick={loadData} className="text-blue-400 hover:text-blue-300">
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-left text-gray-400">Key</th>
                  <th className="p-4 text-left text-gray-400">Plan</th>
                  <th className="p-4 text-left text-gray-400">Credits</th>
                  <th className="p-4 text-left text-gray-400">Created</th>
                  <th className="p-4 text-left text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-800">
                    <td className="p-4 font-mono text-sm">{k.key.slice(0, 20)}...</td>
                    <td className="p-4">{k.plan}</td>
                    <td className="p-4">{k.credits === -1 ? '∞' : k.credits}</td>
                    <td className="p-4 text-gray-400">{new Date(k.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteKey(k.key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
