'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('manager');

  async function load() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load(); }, []);

  async function addUser() {
    if (!newEmail) { toast.error('Email requis'); return; }
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, role: newRole }) });
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    toast.success('Utilisateur ajouté');
    setNewEmail('');
    load();
  }

  async function removeUser(id: string) {
    if (!confirm('Supprimer cet utilisateur?')) return;
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    toast.success('Supprimé');
    load();
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400',
    manager: 'bg-blue-500/20 text-blue-400',
    agent_b: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Équipe</h1>
        <p className="text-sm text-gray-400">Gérer les accès et rôles</p>
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Ajouter un membre</h3>
        <div className="flex gap-2">
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com"
            className="flex-1 bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
          <select value={newRole} onChange={e => setNewRole(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="agent_b">Agent B</option>
          </select>
          <button onClick={addUser} className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-400">Email</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400">Rôle</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-6 text-gray-500 text-sm">Aucun membre</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-white">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${ROLE_COLORS[u.role] || 'bg-gray-500/20 text-gray-400'}`}>{u.role}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => removeUser(u.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
