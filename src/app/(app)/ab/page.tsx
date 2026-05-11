'use client';
import { useEffect, useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

export default function ABPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="text-gray-400 text-sm">Chargement...</div>;

  const aRate = stats.a_sent > 0 ? ((stats.a_interested / stats.a_sent) * 100).toFixed(1) : '0.0';
  const bRate = stats.b_sent > 0 ? ((stats.b_interested / stats.b_sent) * 100).toFixed(1) : '0.0';
  const winner = parseFloat(aRate) > parseFloat(bRate) ? 'A' : parseFloat(bRate) > parseFloat(aRate) ? 'B' : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Résultats A/B</h1>
        <p className="text-sm text-gray-400">Comparaison des performances des messages</p>
      </div>

      {winner && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${winner === 'A' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
          <Trophy size={20} className={winner === 'A' ? 'text-blue-400' : 'text-purple-400'} />
          <div>
            <div className="text-sm font-medium text-white">🏆 Message {winner} gagne avec {winner === 'A' ? aRate : bRate}% de conversion</div>
            <div className="text-xs text-gray-400">Différence: {Math.abs(parseFloat(aRate) - parseFloat(bRate)).toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Message A', key: 'a', sent: stats.a_sent, interested: stats.a_interested, rate: aRate, color: 'blue', isWinner: winner === 'A' },
          { label: 'Message B', key: 'b', sent: stats.b_sent, interested: stats.b_interested, rate: bRate, color: 'purple', isWinner: winner === 'B' },
        ].map(g => (
          <div key={g.key} className={`bg-[#1a1d27] border rounded-xl p-5 ${g.isWinner ? `border-${g.color}-500/40` : 'border-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-white">{g.label}</h3>
              {g.isWinner && <span className={`text-xs px-2 py-0.5 rounded-full bg-${g.color}-500/20 text-${g.color}-400`}>Gagnant</span>}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Envoyés', value: g.sent },
                { label: 'Intéressés', value: g.interested },
                { label: 'Taux', value: `${g.rate}%` },
              ].map(s => (
                <div key={s.label} className="bg-[#0f1117] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Taux de conversion</span>
                <span className="text-white">{g.rate}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-${g.color}-500 rounded-full transition-all`} style={{ width: `${Math.min(parseFloat(g.rate), 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Comparaison détaillée</h3>
        <div className="space-y-3">
          {[
            { label: 'Leads assignés', a: stats.group_a, b: stats.group_b },
            { label: 'Messages envoyés', a: stats.a_sent, b: stats.b_sent },
            { label: 'Intéressés', a: stats.a_interested, b: stats.b_interested },
            { label: 'Taux conversion', a: `${aRate}%`, b: `${bRate}%` },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-3 gap-4 py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-gray-400">{row.label}</span>
              <span className={`text-sm text-center font-medium ${winner === 'A' && row.label === 'Taux conversion' ? 'text-blue-400' : 'text-white'}`}>{row.a}</span>
              <span className={`text-sm text-center font-medium ${winner === 'B' && row.label === 'Taux conversion' ? 'text-purple-400' : 'text-white'}`}>{row.b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
