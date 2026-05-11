'use client';
import { useEffect, useState } from 'react';
import { Save, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [waStatus, setWaStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
    fetch('/api/wa-status').then(r => r.json()).then(setWaStatus);
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    const data = await res.json();
    if (data.error) { toast.error(data.error); } else { toast.success('Sauvegardé'); setSettings(data); }
    setSaving(false);
  }

  if (!settings) return <div className="text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-gray-400">Configuration des messages et de l'API</p>
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Statut WhatsApp (Meta API)</h3>
          {waStatus?.connected ? (
            <div className="flex items-center gap-2 text-green-400 text-xs"><Wifi size={14} /> Connecté — {waStatus.phone}</div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 text-xs"><WifiOff size={14} /> Déconnecté</div>
          )}
        </div>
        <p className="text-xs text-gray-500">Configurez META_ACCESS_TOKEN et META_PHONE_NUMBER_ID dans les variables d'environnement Vercel.</p>
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-white">Message A — Court & direct</h3>
        <p className="text-xs text-gray-500">Variables: {'{name}'} {'{link}'}</p>
        <textarea value={settings.msg_a || ''} onChange={e => setSettings((p: any) => ({ ...p, msg_a: e.target.value }))} rows={8}
          className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none font-mono" />
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-white">Message B — Détaillé</h3>
        <p className="text-xs text-gray-500">Variables: {'{name}'} {'{link}'}</p>
        <textarea value={settings.msg_b || ''} onChange={e => setSettings((p: any) => ({ ...p, msg_b: e.target.value }))} rows={12}
          className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none font-mono" />
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-3">Délai entre envois</h3>
        <div className="flex items-center gap-3">
          <input type="number" min={1} max={60} value={settings.send_delay || 3} onChange={e => setSettings((p: any) => ({ ...p, send_delay: parseInt(e.target.value) }))}
            className="w-24 bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
          <span className="text-sm text-gray-400">secondes entre chaque message</span>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors disabled:opacity-50">
        <Save size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}
