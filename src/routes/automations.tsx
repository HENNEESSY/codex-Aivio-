import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Zap, Play, Square, MoreHorizontal } from 'lucide-react';
import { useAivioAutomations } from '@/hooks/aivio/useAivioAutomations';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automations',
  component: AutomationsPage,
});

function AutomationsPage() {
  const { automations, isLoading, toggleAutomation, deleteAutomation } = useAivioAutomations();

  if (isLoading) {
    return <div className="animate-pulse p-6">Загрузка автоматизаций...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9]">Автоматизации</h1>
          <p className="text-[#81C784] text-sm mt-1">Настройте триггеры и действия для рутины</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00C853] text-[#050F0A] rounded-lg font-semibold hover:bg-[#00E676] shadow-[0_0_16px_rgba(0,200,83,0.3)] transition-all">
          <Zap className="w-4 h-4" /> Создать автоматизацию
        </button>
      </div>

      <div className="flex gap-2 border-b border-[#00C853]/10 pb-4">
        {['Все', 'Активные', 'Остановленные'].map((tab, i) => (
          <button key={tab} className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${i===0 ? "bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]" : "border-[#00C853]/10 text-[#81C784] hover:bg-[#112A1C]"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {automations.map(auto => (
          <div key={auto.id} className="bg-[#0D2018] border border-[#00C853]/15 rounded-xl p-5 hover:border-[#00C853]/30 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${auto.status === 'active' ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]' : 'bg-[#050F0A] border-[#81C784]/20 text-[#81C784]/50'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-[#E8F5E9]">{auto.name}</h3>
                     <p className="text-xs text-[#81C784]">Тип: {auto.triggerType === 'event' ? 'Событие' : 'По расписанию'}</p>
                  </div>
               </div>
               <button onClick={() => deleteAutomation(auto.id)} className="text-[#81C784] hover:text-[#FF5252] font-semibold text-xs transition-colors p-1 relative top-1">
                 УДАЛИТЬ
               </button>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#00C853]/10">
               <div className="text-sm font-medium text-[#81C784]">
                 Запусков: <span className="tabular-nums text-[#E8F5E9]">{auto.runsCount}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase ${auto.status === 'active' ? 'text-[#00C853]' : 'text-[#81C784]/60'}`}>
                    {auto.status === 'active' ? 'Работает' : 'Остановлено'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" className="sr-only peer" checked={auto.status === 'active'} onChange={() => toggleAutomation(auto.id, auto.status === 'active' ? 'stopped' : 'active')} />
                   <div className="w-11 h-6 bg-[#050F0A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#050F0A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C853] border border-[#00C853]/30"></div>
                 </label>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
