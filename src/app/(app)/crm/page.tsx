'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const COLUMNS = [
  { id: 'sent', label: 'Pas de réponse', color: 'text-blue-400', bg: 'border-blue-500/20' },
  { id: 'not-sure', label: 'Pas sûr', color: 'text-orange-400', bg: 'border-orange-500/20' },
  { id: 'interested', label: 'Intéressé 🔥', color: 'text-green-400', bg: 'border-green-500/20' },
  { id: 'not-interested', label: 'Pas intéressé', color: 'text-red-400', bg: 'border-red-500/20' },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data.filter((l: any) => ['sent','not-sure','interested','not-interested'].includes(l.status)));
    setLoading(false);
  }

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);

  async function moveCard(leadId: string, newStatus: string) {
    await fetch(`/api/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  }

  function timeAgo(date: string) {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">CRM Pipeline</h1>
          <p className="text-sm text-gray-400">{leads.length} leads contactés</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);
          return (
            <div key={col.id} className={`bg-[#1a1d27] border ${col.bg} rounded-xl overflow-hidden`}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <h3 className={`text-sm font-medium ${col.color}`}>{col.label}</h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{colLeads.length}</span>
              </div>
              <div className="p-3 space-y-2 min-h-32 max-h-[calc(100vh-280px)] overflow-y-auto">
                {colLeads.length === 0 && <div className="text-xs text-gray-600 text-center py-4">Vide</div>}
                {colLeads.map(lead => (
                  <div key={lead.id} className="bg-[#0f1117] border border-white/5 rounded-lg p-3 group hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-sm text-white font-medium leading-tight">{lead.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${lead.group === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{lead.group}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{lead.phone}</div>
                    {lead.site && (
                      <a href={lead.site} target="_blank" className="flex items-center gap-1 text-xs text-blue-400 hover:underline mb-2 truncate">
                        <ExternalLink size={10} /> {lead.site.replace('https://','').slice(0,30)}
                      </a>
                    )}
                    <div className="text-xs text-gray-600">{timeAgo(lead.replied_at || lead.sent_at)}</div>
                    <div className="mt-2 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <button key={c.id} onClick={() => moveCard(lead.id, c.id)}
                          className={`text-xs px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 ${c.color} transition-colors`}>
                          → {c.label.replace(' 🔥','')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
