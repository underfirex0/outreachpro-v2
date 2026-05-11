'use client';
import { useEffect, useState, useRef } from 'react';
import { Send, Pause, Play, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SendPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [log, setLog] = useState<{ name: string; status: 'success' | 'failed'; msg: string }[]>([]);
  const [group, setGroup] = useState<'A' | 'B' | 'all'>('all');
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  useEffect(() => {
    fetch('/api/leads?status=unsent').then(r => r.json()).then(setLeads);
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  const filteredLeads = group === 'all' ? leads : leads.filter(l => l.group === group);

  async function startSending() {
    if (filteredLeads.length === 0) { toast.error('Aucun lead à envoyer'); return; }
    setSending(true);
    pauseRef.current = false;
    stopRef.current = false;
    setLog([]);
    setProgress({ current: 0, total: filteredLeads.length, success: 0, failed: 0 });

    let success = 0, failed = 0;
    for (let i = 0; i < filteredLeads.length; i++) {
      if (stopRef.current) break;
      while (pauseRef.current) await new Promise(r => setTimeout(r, 500));

      const lead = filteredLeads[i];
      setProgress(p => ({ ...p, current: i + 1 }));

      try {
        const res = await fetch('/api/send-one', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id, group: lead.group }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          success++;
          setLog(l => [{ name: lead.name, status: 'success', msg: 'Envoyé' }, ...l.slice(0, 49)]);
        } else {
          failed++;
          setLog(l => [{ name: lead.name, status: 'failed', msg: data.error || 'Erreur' }, ...l.slice(0, 49)]);
        }
      } catch (err: any) {
        failed++;
        setLog(l => [{ name: lead.name, status: 'failed', msg: err.message }, ...l.slice(0, 49)]);
      }

      setProgress(p => ({ ...p, success, failed }));

      const delay = (settings?.send_delay || 3) * 1000;
      if (i < filteredLeads.length - 1) await new Promise(r => setTimeout(r, delay));
    }

    setSending(false);
    toast.success(`Terminé: ${success} envoyés, ${failed} échoués`);
    fetch('/api/leads?status=unsent').then(r => r.json()).then(setLeads);
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Envoyer les messages</h1>
        <p className="text-sm text-gray-400">Envoi bulk WhatsApp avec test A/B</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-4">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Message A — Court & direct</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{settings?.msg_a || '...'}</pre>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-4">
          <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Message B — Détaillé</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{settings?.msg_b || '...'}</pre>
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Groupe à envoyer</div>
              <select value={group} onChange={e => setGroup(e.target.value as any)} disabled={sending}
                className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option value="all">Tous ({leads.length} non envoyés)</option>
                <option value="A">Groupe A ({leads.filter(l => l.group === 'A').length} non envoyés)</option>
                <option value="B">Groupe B ({leads.filter(l => l.group === 'B').length} non envoyés)</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Délai entre envois</div>
              <div className="text-sm text-white">{settings?.send_delay || 3}s</div>
            </div>
          </div>
          <div className="flex gap-2">
            {sending && (
              <button onClick={() => { pauseRef.current = !pauseRef.current; setPaused(!paused); }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-400 transition-colors">
                {paused ? <Play size={14} /> : <Pause size={14} />}
                {paused ? 'Reprendre' : 'Pause'}
              </button>
            )}
            {sending && (
              <button onClick={() => { stopRef.current = true; setSending(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors">
                <XCircle size={14} /> Arrêter
              </button>
            )}
            {!sending && (
              <button onClick={startSending}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors">
                <Send size={14} /> Envoyer ({filteredLeads.length})
              </button>
            )}
          </div>
        </div>

        {(sending || progress.current > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{progress.current}/{progress.total}</span>
              <span className="text-green-400">{progress.success} ✓</span>
              <span className="text-red-400">{progress.failed} ✗</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {log.length > 0 && (
        <div className="bg-[#1a1d27] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-medium text-white">Journal d'envoi</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0">
                {entry.status === 'success' ? <CheckCircle size={14} className="text-green-400 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                <span className="text-sm text-white flex-1">{entry.name}</span>
                <span className={`text-xs ${entry.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
