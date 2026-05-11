'use client';
import { useEffect, useState } from 'react';
import { Users, Send, MessageSquare, TrendingUp, Target, XCircle, HelpCircle, Clock } from 'lucide-react';

interface Stats {
  total: number; unsent: number; sent: number; replied: number;
  interested: number; not_interested: number; not_sure: number;
  group_a: number; group_b: number;
  a_sent: number; b_sent: number; a_interested: number; b_interested: number;
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  useEffect(() => { loadStats(); const i = setInterval(loadStats, 30000); return () => clearInterval(i); }, []);

  if (loading) return <div className="text-gray-400 text-sm">Chargement...</div>;
  if (!stats) return null;

  const conversionRate = stats.a_sent > 0 ? Math.round((stats.a_interested / stats.a_sent) * 100) : 0;
  const aRate = stats.a_sent > 0 ? Math.round((stats.a_interested / stats.a_sent) * 100) : 0;
  const bRate = stats.b_sent > 0 ? Math.round((stats.b_interested / stats.b_sent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">Vue d'ensemble de votre pipeline</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.total} icon={Users} color="bg-blue-500/20" />
        <StatCard label="Envoyés" value={stats.sent} icon={Send} color="bg-green-500/20" />
        <StatCard label="Intéressés" value={stats.interested} icon={TrendingUp} color="bg-yellow-500/20" />
        <StatCard label="Taux conversion" value={`${conversionRate}%`} icon={Target} color="bg-purple-500/20" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pas encore envoyé" value={stats.unsent} icon={Clock} color="bg-gray-500/20" />
        <StatCard label="Répondu" value={stats.replied} icon={MessageSquare} color="bg-cyan-500/20" />
        <StatCard label="Pas intéressé" value={stats.not_interested} icon={XCircle} color="bg-red-500/20" />
        <StatCard label="Pas sûr" value={stats.not_sure} icon={HelpCircle} color="bg-orange-500/20" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Groupe A vs Groupe B</h3>
          <div className="space-y-3">
            {[
              { label: 'Groupe A', sent: stats.a_sent, interested: stats.a_interested, rate: aRate, color: 'bg-blue-500' },
              { label: 'Groupe B', sent: stats.b_sent, interested: stats.b_interested, rate: bRate, color: 'bg-purple-500' },
            ].map(g => (
              <div key={g.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{g.label} — {g.sent} envoyés, {g.interested} intéressés</span>
                  <span className="text-white font-medium">{g.rate}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${g.color} rounded-full transition-all`} style={{ width: `${g.rate}%` }} />
                </div>
              </div>
            ))}
            {aRate !== bRate && (
              <div className={`text-xs font-medium mt-2 ${aRate > bRate ? 'text-blue-400' : 'text-purple-400'}`}>
                🏆 {aRate > bRate ? 'Groupe A' : 'Groupe B'} gagne avec {Math.abs(aRate - bRate)}% de plus
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Répartition des statuts</h3>
          <div className="space-y-2">
            {[
              { label: 'Non envoyé', value: stats.unsent, color: 'bg-gray-500' },
              { label: 'Envoyé', value: stats.sent, color: 'bg-blue-500' },
              { label: 'Répondu', value: stats.replied, color: 'bg-cyan-500' },
              { label: 'Intéressé', value: stats.interested, color: 'bg-green-500' },
              { label: 'Pas intéressé', value: stats.not_interested, color: 'bg-red-500' },
              { label: 'Pas sûr', value: stats.not_sure, color: 'bg-orange-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-xs text-gray-400 flex-1">{s.label}</span>
                <span className="text-xs text-white font-medium">{s.value}</span>
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: stats.total > 0 ? `${(s.value / stats.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
