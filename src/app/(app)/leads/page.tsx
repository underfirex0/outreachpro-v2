'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Upload, Trash2, Edit2, Check, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const STATUSES = ['unsent','sent','replied','interested','not-interested','not-sure'];
const STATUS_COLORS: Record<string, string> = {
  unsent: 'bg-gray-500/20 text-gray-400',
  sent: 'bg-blue-500/20 text-blue-400',
  replied: 'bg-cyan-500/20 text-cyan-400',
  interested: 'bg-green-500/20 text-green-400',
  'not-interested': 'bg-red-500/20 text-red-400',
  'not-sure': 'bg-orange-500/20 text-orange-400',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', site: '', group: 'A' });
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadLeads() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (groupFilter) params.set('group', groupFilter);
    const res = await fetch('/api/leads?' + params.toString());
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => { loadLeads(); }, [search, statusFilter, groupFilter]);

  async function deleteLead(id: string) {
    if (!confirm('Supprimer ce lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    toast.success('Lead supprimé');
    loadLeads();
  }

  async function saveEdit(id: string) {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) });
    toast.success('Lead mis à jour');
    setEditId(null);
    loadLeads();
  }

  async function addLead() {
    if (!newLead.name || !newLead.phone) { toast.error('Nom et téléphone requis'); return; }
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newLead, status: 'unsent' }) });
    toast.success('Lead ajouté');
    setShowAdd(false);
    setNewLead({ name: '', phone: '', site: '', group: 'A' });
    loadLeads();
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const res = await fetch('/api/leads/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leads: results.data }) });
        const data = await res.json();
        if (data.error) { toast.error(data.error); return; }
        toast.success(`${data.inserted} leads importés`);
        loadLeads();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Leads</h1>
          <p className="text-sm text-gray-400">{leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">
            <Upload size={14} /> Import CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full bg-[#1a1d27] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#1a1d27] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
          <option value="">Tous les statuts</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          className="bg-[#1a1d27] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
          <option value="">Tous les groupes</option>
          <option value="A">Groupe A</option>
          <option value="B">Groupe B</option>
        </select>
      </div>

      {showAdd && (
        <div className="bg-[#1a1d27] border border-green-500/30 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Nouveau lead</h3>
          <div className="grid grid-cols-4 gap-3">
            {['name','phone','site'].map(f => (
              <input key={f} placeholder={f} value={(newLead as any)[f]} onChange={e => setNewLead(p => ({ ...p, [f]: e.target.value }))}
                className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
            ))}
            <select value={newLead.group} onChange={e => setNewLead(p => ({ ...p, group: e.target.value }))}
              className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              <option value="A">Groupe A</option>
              <option value="B">Groupe B</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addLead} className="px-4 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors">Ajouter</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Nom','Téléphone','Site','Groupe','Statut','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500 text-sm">Chargement...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500 text-sm">Aucun lead</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  {editId === lead.id ? (
                    <input value={editData.name || ''} onChange={e => setEditData((p: any) => ({ ...p, name: e.target.value }))}
                      className="bg-[#0f1117] border border-white/10 rounded px-2 py-1 text-xs text-white w-full focus:outline-none" />
                  ) : <span className="text-white font-medium">{lead.name}</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{lead.phone}</td>
                <td className="px-4 py-3">
                  {lead.site ? <a href={lead.site} target="_blank" className="text-blue-400 hover:underline text-xs truncate max-w-32 block">{lead.site}</a> : <span className="text-gray-600 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${lead.group === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{lead.group}</span>
                </td>
                <td className="px-4 py-3">
                  {editId === lead.id ? (
                    <select value={editData.status || lead.status} onChange={e => setEditData((p: any) => ({ ...p, status: e.target.value }))}
                      className="bg-[#0f1117] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>{lead.status}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {editId === lead.id ? (
                      <>
                        <button onClick={() => saveEdit(lead.id)} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-300"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(lead.id); setEditData({ name: lead.name, status: lead.status }); }} className="text-gray-400 hover:text-blue-400"><Edit2 size={14} /></button>
                        <button onClick={() => deleteLead(lead.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
