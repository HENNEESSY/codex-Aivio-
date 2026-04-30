import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, FileText, CheckCircle, Zap, TrendingUp, Settings, Users, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAivioClients } from '@/hooks/aivio/useAivioClients';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const actions = [
    { id: '1', title: 'Перейти в Центр управления', icon: TrendingUp, action: () => navigate({ to: '/' }) },
    { id: '2', title: 'Клиенты и Сделки', icon: Users, action: () => navigate({ to: '/clients' }) },
    { id: '3', title: 'Открыть Inbox', icon: Inbox, action: () => navigate({ to: '/inbox' }) },
    { id: '4', title: 'AI-сотрудники', icon: Zap, action: () => navigate({ to: '/agents' }) },
    { id: '5', title: 'Финансовый радар', icon: TrendingUp, action: () => navigate({ to: '/finance' }) },
    { id: '6', title: 'Настройки', icon: Settings, action: () => navigate({ to: '/settings' }) },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-[#050F0A]/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="bg-[#0D2018] border border-[#00C853]/30 shadow-[0_0_40px_rgba(0,200,83,0.15)] rounded-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center px-4 border-b border-[#00C853]/15">
          <Search className="w-5 h-5 text-[#81C784]" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск команд или разделов..."
            className="flex-1 bg-transparent border-none py-4 px-4 text-[#E8F5E9] placeholder:text-[#81C784]/50 focus:outline-none"
          />
          <div className="text-[10px] text-[#81C784]/50 border border-[#00C853]/15 rounded px-1.5 py-0.5">ESC</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#81C784]">Ничего не найдено.</div>
          ) : (
            <div className="flex flex-col space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-[#81C784]/60 uppercase tracking-wider">Навигация</div>
              {filtered.map(action => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-[#00C853]/10 text-[#E8F5E9] group transition-colors text-left"
                >
                  <action.icon className="w-4 h-4 mr-3 text-[#81C784] group-hover:text-[#00C853]" />
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />
    </div>
  );
}
