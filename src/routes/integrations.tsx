import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Plug, Zap, MessagesSquare, Database, BarChart, ShoppingCart } from 'lucide-react';
import { useAivioIntegrations } from '@/hooks/aivio/useAivioIntegrations';
import { toast } from 'sonner';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { integrations, isLoading, toggleIntegration } = useAivioIntegrations();
  
  if (isLoading) return <div className="animate-pulse p-6">Загрузка интеграций...</div>;

  const categories = [
    { id: 'messengers', label: 'Мессенджеры', icon: MessagesSquare },
    { id: 'crm', label: 'CRM', icon: Database },
    { id: 'finance', label: 'Финансы', icon: BarChart },
    { id: 'automation', label: 'Автоматизация', icon: Zap },
    { id: 'marketplace', label: 'Маркетплейсы', icon: ShoppingCart },
  ];

  const handleConnect = (id: string, isConnected: boolean) => {
    toggleIntegration(id, !isConnected);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9]">Интеграции</h1>
        <p className="text-[#81C784] text-sm mt-1">Подключите любимые сервисы к Aivio</p>
      </div>

      <div className="space-y-10">
        {categories.map(c => {
          const items = integrations.filter(i => i.cat === c.id || (i.cat==='all' && c.id==='messengers'));
          if(items.length === 0) return null;
          return (
            <div key={c.id}>
              <h2 className="flex items-center gap-2 text-lg font-medium mb-4 text-[#81C784]">
                <c.icon className="w-5 h-5" />
                {c.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-[#0D2018] border border-[#00C853]/10 rounded-xl p-5 hover:border-[#00C853]/30 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      {/* Fake icon circle */}
                      <div className="w-10 h-10 rounded-lg bg-[#0A1A0F] border border-[#00C853]/20 flex items-center justify-center font-bold text-[#00C853]">
                        {item.name.substring(0,2)}
                      </div>
                      {item.status === 'connected' && <span className="text-[10px] uppercase font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/20">Подключено</span>}
                      {item.status === 'coming_soon' && <span className="text-[10px] uppercase font-bold text-[#FFB300] bg-[#FFB300]/10 px-2 py-0.5 rounded border border-[#FFB300]/20">Скоро</span>}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                    <p className="text-xs text-[#81C784] mb-5 flex-1">{item.desc}</p>
                    <button onClick={() => handleConnect(item.id, item.status === 'connected')} className="w-full py-2 text-xs font-semibold rounded-lg bg-[#050F0A] border border-[#00C853]/30 text-[#00E676] hover:bg-[#00C853]/10 transition-colors">
                      {item.status === 'connected' ? 'Отключить' : 'Подключить'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
