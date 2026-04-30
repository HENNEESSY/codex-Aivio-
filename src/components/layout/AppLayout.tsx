import React, { useState, useEffect } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  Inbox,
  Bot,
  Zap,
  TrendingUp,
  Plug,
  FileText,
  Settings,
  Search,
  Bell,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useAivioTemplates } from '@/hooks/aivio/useAivioTemplates';

const navigation = [
  { name: 'Центр управления', to: '/', icon: LayoutDashboard },
  { name: 'Клиенты', to: '/clients', icon: Users },
  { name: 'Inbox', to: '/inbox', icon: Inbox },
  { name: 'AI-сотрудники', to: '/agents', icon: Bot },
  { name: 'Автоматизации', to: '/automations', icon: Zap },
  { name: 'Финансовый радар', to: '/finance', icon: TrendingUp },
  { name: 'Интеграции', to: '/integrations', icon: Plug },
  { name: 'Шаблоны', to: '/templates', icon: FileText },
  { name: 'Настройки', to: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isDemo = !isSupabaseConfigured();
  const navigate = useNavigate();

  const { templates, applyTemplate, isApplying } = useAivioTemplates();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('aivio_demo_onboarding_completed');
    if (!isCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleApplyTemplate = async (id: string) => {
    await applyTemplate(id);
    localStorage.setItem('aivio_demo_onboarding_completed', 'true');
    setShowOnboarding(false);
    navigate({ to: '/' });
  };

  return (
    <div className="flex h-screen w-full bg-[#050F0A] text-[#E8F5E9] font-sans overflow-hidden relative">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="absolute inset-0 z-50 bg-[#050F0A]/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-[#0D2018] border border-[#00C853]/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(0,200,83,0.15)] animate-in zoom-in-95">
             <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-[#E8F5E9] mb-2 tracking-tight">Добро пожаловать в Aivio</h2>
               <p className="text-[#81C784]">Выберите отрасль вашего бизнеса, чтобы мы настроили AI и воронку продаж специально для вас.</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
               {templates.map(tpl => (
                 <button 
                   key={tpl.id}
                   onClick={() => handleApplyTemplate(tpl.id)}
                   disabled={isApplying}
                   className="text-left bg-[#050F0A] border border-[#00C853]/15 rounded-xl p-5 hover:border-[#00C853]/50 hover:bg-[#112A1C] transition-all group disabled:opacity-50"
                 >
                   <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Briefcase className="w-5 h-5 text-[#00E676]" />
                   </div>
                   <h3 className="font-semibold text-lg text-[#E8F5E9] mb-1">{tpl.name}</h3>
                   <p className="text-sm text-[#81C784] line-clamp-2">{tpl.description}</p>
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-[#050F0A] border-r border-[#00C853]/10 flex flex-col">
        {/* Logo area */}
        <div className="h-[60px] flex items-center px-6 border-b border-[#00C853]/10">
          <div className="w-2 h-2 rounded-full bg-[#00C853] mr-3 shadow-[0_0_8px_rgba(0,200,83,0.8)]" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight tracking-tight text-white">Aivio</span>
            <span className="text-[10px] uppercase font-bold text-[#81C784]/60 tracking-wider">ОС Бизнеса</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-[#81C784]/40 uppercase tracking-wider">ОПЕРАЦИОННАЯ СИСТЕМА</span>
          </div>
          {navigation.map((item) => {
            const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
            return (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 border-l-2",
                  isActive 
                    ? "bg-[#00C853]/10 text-[#00C853] border-[#00C853]" 
                    : "text-[#81C784] border-transparent hover:bg-[#112A1C] hover:text-[#E8F5E9]"
                )}
              >
                <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-[#00C853]" : "text-[#81C784]/70")} />
                {item.name}
                {item.name === 'Inbox' && (
                  <span className="ml-auto bg-[#00C853] text-[#050F0A] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    2
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Subscription Area */}
        <div className="p-4 border-t border-[#00C853]/10">
          <div className="bg-[#0D2018] border border-[#00C853]/20 rounded-xl p-3 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">Aivio Pro</span>
              <span className="text-xs text-[#81C784]">12 дней</span>
            </div>
            <div className="w-full h-1.5 bg-[#00C853]/10 rounded-full mt-2 mb-3 overflow-hidden">
              <div className="h-full bg-[#00C853] w-[70%]" />
            </div>
            <button className="w-full text-xs py-1.5 rounded-md border border-[#00C853]/30 text-[#81C784] hover:bg-[#00C853]/10 transition-colors">
              Управление подпиской
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[60px] flex-shrink-0 border-b border-[#00C853]/10 flex items-center justify-between px-6 bg-[#050F0A]/90 backdrop-blur-sm z-10">
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-semibold capitalize">
              {navigation.find(n => n.to === currentPath)?.name || 'Aivio'}
            </h1>
            {isDemo && (
              <span className="ml-4 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                Демо-режим
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group cursor-text">
              <Search className="w-4 h-4 text-[#81C784] absolute left-3 top-1/2 -translate-y-1/2" />
              <div className="pl-9 pr-3 py-1.5 bg-[#081509] border border-[#00C853]/15 rounded-lg text-sm text-[#81C784] w-64 flex justify-between items-center group-hover:border-[#00C853]/30 transition-colors">
                <span>Поиск...</span>
                <span className="text-[10px] border border-[#00C853]/20 px-1.5 py-0.5 rounded text-[#81C784]/60">⌘K</span>
              </div>
            </div>
            <button className="relative text-[#81C784] hover:text-[#E8F5E9] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF5252] rounded-full border border-[#050F0A]" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#112A1C] p-1.5 rounded-lg transition-colors border border-transparent hover:border-[#00C853]/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C853] to-[#0A1A0F] border border-[#00C853]/30 flex items-center justify-center font-semibold text-sm">
                A
              </div>
              <span className="text-sm font-medium text-[#E8F5E9] hidden md:block">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
