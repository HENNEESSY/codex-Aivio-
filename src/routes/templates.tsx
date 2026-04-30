import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioTemplates } from '@/hooks/aivio/useAivioTemplates';
import { Search, Briefcase, ChevronRight } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: TemplatesPage,
});

function TemplatesPage() {
  const { templates, isLoading, applyTemplate, isApplying } = useAivioTemplates();

  if (isLoading) return <div className="animate-pulse p-6">Загрузка шаблонов...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9]">Шаблоны</h1>
          <p className="text-[#81C784] text-sm mt-1">Готовые сценарии для вашей отрасли</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#81C784]" />
          <input 
            type="text" 
            placeholder="Поиск по отрасли..." 
            className="bg-[#081509] border border-[#00C853]/20 rounded-lg pl-9 pr-3 py-2 text-sm w-64 focus:border-[#00C853] outline-none text-[#E8F5E9]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-[#0D2018] border border-[#00C853]/15 rounded-2xl p-6 hover:border-[#00C853]/40 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-[#0A1A0F] border border-[#00C853]/20 rounded-xl">
                 <Briefcase className="w-6 h-6 text-[#00C853]" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#81C784] border border-[#00C853]/20 bg-[#00C853]/5 px-2 py-0.5 rounded-full">
                {tpl.industry}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{tpl.name}</h3>
            <p className="text-sm text-[#81C784] mb-6 flex-1 min-h-[40px]">{tpl.description}</p>
            
            <div className="flex gap-4 mb-6">
              <div className="flex flex-col">
                 <span className="text-lg font-bold text-[#E8F5E9]">{tpl.tags.stages_count}</span>
                 <span className="text-[10px] text-[#81C784]">Этапов</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-lg font-bold text-[#E8F5E9]">{tpl.tags.ai_employees_count}</span>
                 <span className="text-[10px] text-[#81C784]">Агентов</span>
              </div>
            </div>

            <button 
              onClick={() => applyTemplate(tpl.id)}
              disabled={isApplying}
              className="w-full flex justify-between items-center px-4 py-2 bg-[#00C853]/10 border border-[#00C853]/30 text-[#00E676] font-medium rounded-lg hover:bg-[#00C853]/20 transition-colors disabled:opacity-50"
            >
              Применить шаблон
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
