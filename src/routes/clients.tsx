import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioClients } from '@/hooks/aivio/useAivioClients';
import { cn } from '@/lib/utils';
import { Search, Plus, Upload, MoreHorizontal, X, MessageSquare, Bot, AlertTriangle, ShieldCheck, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import { UUID } from '@/types/aivio';
import { analyzeDealRoom } from '@/lib/analytics';
import { toast } from 'sonner';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsPage,
});

function ClientsPage() {
  const { pipelineStages, deals, contacts, isLoading, advanceDeal } = useAivioClients();
  const [selectedDealId, setSelectedDealId] = useState<UUID | null>(null);

  if (isLoading) {
    return <div className="animate-pulse flex gap-6 h-full p-6">
      {[1,2,3,4].map(i => <div key={i} className="flex-1 bg-[#0D2018] rounded-xl border border-[#00C853]/10 h-full" />)}
    </div>;
  }

  const formatMoney = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  
  const selectedDeal = selectedDealId ? deals.find(d => d.id === selectedDealId) : null;
  const selectedStage = selectedDeal ? pipelineStages.find(s => s.id === selectedDeal.stage_id) : undefined;
  const selectedContact = selectedDeal?.contact_id ? contacts.find(c => c.id === selectedDeal.contact_id) : undefined;
  
  const dealRoom = selectedDeal ? analyzeDealRoom(selectedDeal, selectedStage, selectedContact) : null;

  return (
    <div className="flex flex-col h-full absolute inset-0 overflow-hidden">
      <div className="flex-shrink-0 p-6 flex justify-between items-center border-b border-[#00C853]/10">
        <div className="flex gap-2">
          <button className="bg-[#00C853]/10 text-[#00C853] px-4 py-1.5 rounded-lg border border-[#00C853]/30 text-sm font-medium">Kanban</button>
          <button className="text-[#81C784] hover:text-[#E8F5E9] px-4 py-1.5 text-sm font-medium">Таблица</button>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#81C784]" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              className="bg-[#081509] border border-[#00C853]/20 rounded-lg pl-9 pr-3 py-1.5 text-sm w-48 focus:border-[#00C853] outline-none text-[#E8F5E9]" 
            />
          </div>
          <button className="p-2 border border-[#00C853]/20 rounded-lg text-[#81C784] hover:bg-[#112A1C]">
            <Upload className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C853] text-[#050F0A] rounded-lg font-semibold text-sm hover:bg-[#00E676] shadow-[0_0_16px_rgba(0,200,83,0.3)] transition-all">
            <Plus className="w-4 h-4" /> Добавить сделку
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 pb-8">
          {pipelineStages.map(stage => {
            const stageDeals = deals.filter(d => d.stage_id === stage.id);
            const stageAmount = stageDeals.reduce((acc, d) => acc + (d.amount || 0), 0);
            
            return (
              <div key={stage.id} className="w-[300px] flex-shrink-0 flex flex-col h-full bg-[#050F0A]">
                <div className="flex justify-between items-center mb-3 group">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                     <h3 className="font-semibold text-[15px]">{stage.name}</h3>
                     <span className="text-xs text-[#81C784] bg-[#112A1C] px-1.5 rounded">{stageDeals.length}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-[#81C784] hover:text-[#00C853] transition-opacity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-[#81C784]/60 mb-4 font-mono tabular-nums">{formatMoney(stageAmount)}</div>
                
                <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-4">
                  {stageDeals.length === 0 ? (
                    <div className="border-2 border-dashed border-[#00C853]/10 h-24 rounded-lg flex items-center justify-center text-xs text-[#81C784]/50">
                      Перетащите сделки сюда
                    </div>
                  ) : stageDeals.map(deal => (
                    <div 
                      key={deal.id} 
                      onClick={() => setSelectedDealId(deal.id)}
                      className={cn(
                        "bg-[#0D2018] border rounded-xl p-4 cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,200,83,0.1)] transition-all group relative",
                        selectedDealId === deal.id ? "border-[#00C853] shadow-[0_0_12px_rgba(0,200,83,0.2)]" : "border-[#00C853]/15 hover:border-[#00C853]/40"
                      )}
                    >
                      <button onClick={(e) => { e.stopPropagation(); advanceDeal(deal.id); }} title="Переместить дальше" className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-[#81C784] hover:text-[#00C853]"><MoreHorizontal className="w-4 h-4"/></button>
                      
                      <div className="flex justify-between items-start mb-2 pr-4">
                        <span className="text-[11px] font-medium text-[#81C784] truncate">{deal.contacts?.name || 'Без контакта'}</span>
                      </div>
                      <h4 className="font-medium text-[14px] text-[#E8F5E9] mb-3 leading-snug">{deal.title}</h4>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#00C853]/10">
                         <span className="text-sm font-bold tabular-nums text-[#E8F5E9]">{formatMoney(deal.amount || 0)}</span>
                         <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-1.5 py-[1px] text-[10px] font-bold uppercase rounded border",
                              deal.temperature === 'hot' ? "bg-[#FF5252]/10 border-[#FF5252]/30 text-[#FF5252]" :
                              deal.temperature === 'warm' ? "bg-[#FFB300]/10 border-[#FFB300]/30 text-[#FFB300]" :
                              "bg-[#42A5F5]/10 border-[#42A5F5]/30 text-[#42A5F5]"
                            )}>{deal.temperature}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Deal Room Slide-in */}
        {selectedDeal && dealRoom && (
          <div className="w-[420px] flex-shrink-0 bg-[#0A1A0F] border-l border-[#00C853]/20 flex flex-col overflow-y-auto animate-in slide-in-from-right h-full">
             <div className="p-6 border-b border-[#00C853]/10 sticky top-0 bg-[#0A1A0F]/95 backdrop-blur-sm z-10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#E8F5E9] mb-1">{selectedDeal.title}</h2>
                  <p className="text-sm text-[#81C784]">{selectedDeal.contacts?.name || 'Без контакта'}</p>
                </div>
                <button onClick={() => setSelectedDealId(null)} className="p-1 rounded-full hover:bg-[#0D2018] text-[#81C784]">
                  <X className="w-5 h-5"/>
                </button>
             </div>
             
             <div className="p-6 space-y-6">
               {/* AI Score Card */}
               <div className="bg-[#0D2018] rounded-xl border border-[#00C853]/20 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                 <div className="flex items-center gap-2 mb-4">
                   <Bot className="w-5 h-5 text-[#00C853]" />
                   <h3 className="font-semibold text-[#E8F5E9]">AI Deal Room Analysis</h3>
                 </div>
                 
                 <div className="flex items-end gap-3 mb-5">
                   <div className="text-4xl font-bold tabular-nums text-[#00C853] leading-none">{dealRoom.closure_probability}%</div>
                   <div className="text-sm text-[#81C784] mb-1 font-medium">Вероятность<br/>закрытия</div>
                 </div>

                 <div className="w-full bg-[#050F0A] rounded-full h-2 mb-6 border border-[#00C853]/10">
                   <div className="bg-[#00C853] h-full rounded-full transition-all duration-1000" style={{ width: `${dealRoom.closure_probability}%` }} />
                 </div>

                 {/* Risks */}
                 {dealRoom.risks.length > 0 && (
                   <div className="mb-4">
                     <p className="text-xs font-semibold text-[#FFB300] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                       <AlertTriangle className="w-3 h-3" /> Риски
                     </p>
                     <ul className="space-y-1.5">
                       {dealRoom.risks.map((risk, i) => (
                         <li key={i} className="text-sm text-[#E8F5E9] flex items-start gap-2">
                           <span className="text-[#FFB300] mt-1">•</span>{risk}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {/* Blockers */}
                 {dealRoom.blockers.length > 0 && (
                   <div className="mb-5">
                     <p className="text-xs font-semibold text-[#FF5252] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                       <ShieldCheck className="w-3 h-3" /> Блокеры
                     </p>
                     <ul className="space-y-1.5">
                       {dealRoom.blockers.map((blocker, i) => (
                         <li key={i} className="text-sm text-[#E8F5E9] flex items-start gap-2">
                           <span className="text-[#FF5252] mt-1">•</span>{blocker}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {/* Next Action */}
                 <div className="bg-[#050F0A] rounded-lg p-4 border border-[#00C853]/20">
                   <p className="text-xs font-semibold text-[#00E676] mb-1">Следующий шаг:</p>
                   <p className="text-sm font-medium text-[#E8F5E9] mb-3">{dealRoom.next_best_action}</p>
                   <button 
                     onClick={() => toast.success('Задача создана: ' + dealRoom.suggested_task)}
                     className="w-full py-2 bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00E676] text-xs font-bold rounded border border-[#00C853]/30 uppercase tracking-wide transition-colors"
                   >
                     Создать задачу
                   </button>
                 </div>
               </div>

               {/* Smart Output */}
               {dealRoom.suggested_message && (
                 <div className="bg-[#0D2018] rounded-xl border border-[#00C853]/10 p-5">
                   <div className="flex items-center gap-2 mb-3">
                     <MessageSquare className="w-4 h-4 text-[#81C784]" />
                     <h4 className="font-medium text-sm text-[#E8F5E9]">Черновик ответа</h4>
                   </div>
                   <p className="text-sm text-[#81C784] italic mb-4">"{dealRoom.suggested_message}"</p>
                   <button 
                     onClick={() => toast.success('Сообщение скопировано или отправлено!')}
                     className="flex items-center justify-center gap-2 w-full py-2 bg-transparent hover:bg-[#050F0A] text-[#81C784] hover:text-[#00C853] text-xs font-bold rounded border border-[#00C853]/30 uppercase tracking-wide transition-colors"
                   >
                     <PlayCircle className="w-4 h-4" /> Применить действие
                   </button>
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
