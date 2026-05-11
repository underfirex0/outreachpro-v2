'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, Send, Columns, BarChart2, Settings, LogOut, Zap, UserCog } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/send', label: 'Envoyer', icon: Send },
  { href: '/crm', label: 'CRM', icon: Columns },
  { href: '/ab', label: 'A/B Results', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/team', label: 'Team', icon: UserCog },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUser(session.user);
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><div className="text-gray-400 text-sm">Chargement...</div></div>;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <aside className="w-56 bg-[#1a1d27] border-r border-white/5 flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">OutreachPro</div>
              <div className="text-xs text-gray-500">WA Sales System</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === href ? 'bg-green-500/10 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="text-xs text-gray-500 px-3 mb-2 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-6">{children}</main>
    </div>
  );
}
