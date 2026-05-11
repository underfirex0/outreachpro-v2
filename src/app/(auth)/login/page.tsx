'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    window.location.href = '/dashboard';
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">OutreachPro</span>
        </div>
        <p className="text-gray-400 text-sm">WA Sales System</p>
      </div>
      <form onSubmit={handleLogin} className="bg-[#1a1d27] rounded-xl p-6 border border-white/5 space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
