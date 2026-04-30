import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioAgents } from '@/hooks/aivio/useAivioAgents';
import { useAivioApprovals } from '@/hooks/aivio/useAivioApprovals';
import { Bot, Plus, Settings2, MoreVertical, ShieldAlert, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgentType, AutonomyLevel } from '@/types/aivio';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents',
  component: AgentsPage,
});

const agentSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  role: z.string().min(2, "Роль обязательна"),
  description: z.string().optional(),
  model: z.string().default('claude-3-5-sonnet'),
  type: z.enum(['qualification', 'analytics', 'legal', 'hr', 'finance', 'sales', 'support', 'custom']),
  autonomy_level: z.enum(['advice_only', 'drafts', 'with_confirmation', 'autopilot']),
  system_prompt: z.string().min(10, "Промпт должен быть не менее 10 символов"),
});

type AgentFormValues = z.infer<typeof agentSchema>;

function AgentsPage() {
  const { agents, isLoading, toggleStatus, addAgent } = useAivioAgents();
  const { requests, approve, reject } = useAivioApprovals();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      type: 'custom',
      autonomy_level: 'advice_only',
      model: 'claude-3-5-sonnet'
    }
  });

  const onSubmit = async (data: AgentFormValues) => {
    try {
      await addAgent({ ...data, status: 'draft', channels: [] });
      setIsModalOpen(false);
      reset();
      toast.success('AI-сотрудник успешно создан');
    } catch (e) {
      toast.error('Не удалось создать сотрудника');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse p-6">Загрузка AI-сотрудников...</div>;
  }


  const getTypeIconColor = (type: string) => {
    switch(type) {
      case 'qualification': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'analytics': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'finance': return 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20';
      case 'legal': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-[#81C784] bg-[#81C784]/10 border-[#81C784]/20';
    }
  }

  const getAutonomyLabel = (level: string = 'advice_only') => {
    switch(level) {
      case 'advice_only': return { label: 'Только советы', color: 'text-[#81C784] border-[#81C784]/30' };
      case 'drafts': return { label: 'Черновики', color: 'text-blue-400 border-blue-400/30' };
      case 'requires_approval': return { label: 'С подтверждением', color: 'text-amber-400 border-amber-400/30' };
      case 'autopilot': return { label: 'Автопилот', color: 'text-[#FF5252] border-[#FF5252]/50 bg-[#FF5252]/10' };
      default: return { label: 'Неизвестно', color: 'text-[#81C784] border-[#81C784]/30' };
    }
  }

  const handleAction = (msg: string) => toast.success(msg);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9]">AI-сотрудники</h1>
          <p className="text-[#81C784] text-sm mt-1">Ваша AI-команда, работающая 24/7</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00C853] text-[#050F0A] rounded-lg font-semibold hover:bg-[#00E676] shadow-[0_0_16px_rgba(0,200,83,0.3)] transition-all">
          <Plus className="w-4 h-4" /> Добавить AI-сотрудника
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#050F0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2018] border border-[#00C853]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,200,83,0.15)] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-[#00C853]/10 sticky top-0 bg-[#0D2018] z-10">
               <h2 className="text-xl font-semibold text-[#E8F5E9]">Создать AI-сотрудника</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-[#81C784] hover:text-[#E8F5E9]"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-[#81C784] mb-1">Имя</label>
                 <input {...register('name')} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none" />
                 {errors.name && <p className="text-[#FF5252] text-xs mt-1">{errors.name.message}</p>}
               </div>
               <div>
                 <label className="block text-sm font-medium text-[#81C784] mb-1">Роль</label>
                 <input {...register('role')} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none" />
                 {errors.role && <p className="text-[#FF5252] text-xs mt-1">{errors.role.message}</p>}
               </div>
               <div>
                 <label className="block text-sm font-medium text-[#81C784] mb-1">Описание</label>
                 <textarea {...register('description')} rows={2} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none resize-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-[#81C784] mb-1">Тип агента</label>
                   <select {...register('type')} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none">
                     <option value="qualification">Квалификация</option>
                     <option value="analytics">Аналитик</option>
                     <option value="legal">Юрист</option>
                     <option value="hr">HR</option>
                     <option value="finance">Финансист</option>
                     <option value="support">Поддержка</option>
                     <option value="custom">Универсальный</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-[#81C784] mb-1">Автономность</label>
                   <select {...register('autonomy_level')} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none">
                     <option value="advice_only">Только советы</option>
                     <option value="drafts">Черновики действий</option>
                     <option value="with_confirmation">С подтверждением</option>
                     <option value="autopilot">Автопилот (Осторожно)</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-[#81C784] mb-1">Системный промпт (Инструкции)</label>
                 <textarea {...register('system_prompt')} rows={5} className="w-full bg-[#081509] border border-[#00C853]/15 rounded-lg px-4 py-2 text-[#E8F5E9] focus:border-[#00C853] outline-none resize-none font-mono text-sm" placeholder="Ты — эксперт по продажам..." />
                 {errors.system_prompt && <p className="text-[#FF5252] text-xs mt-1">{errors.system_prompt.message}</p>}
               </div>
               <div className="pt-4 border-t border-[#00C853]/10 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[#00C853]/30 text-[#81C784] hover:bg-[#112A1C] rounded-lg text-sm font-medium transition-colors">Отмена</button>
                 <button type="submit" className="px-4 py-2 bg-[#00C853] text-[#050F0A] hover:bg-[#00E676] rounded-lg text-sm font-bold transition-colors shadow-[0_0_12px_rgba(0,200,83,0.3)]">Создать AI-сотрудника</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Center Widget */}
      {requests.length > 0 && (
      <div className="bg-[#0D2018] border border-[#FFB300]/30 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-2 mb-4 border-b border-[#00C853]/10 pb-4">
            <ShieldAlert className="w-5 h-5 text-[#FFB300]" />
            <h2 className="text-lg font-semibold text-[#E8F5E9]">Требует вашего подтверждения</h2>
            <span className="bg-[#FFB300]/20 text-[#FFB300] text-xs px-2 py-0.5 rounded-full ml-auto font-medium">{requests.length} задачи</span>
         </div>
         <div className="space-y-3">
            {requests.map(req => {
               const agent = agents.find(a => a.id === req.agent_id);
               return (
               <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#050F0A] p-4 rounded-lg border border-[#00C853]/10">
                 <div className="mb-3 md:mb-0">
                    <p className="text-sm font-medium text-[#E8F5E9] mb-1">{req.title}</p>
                    <div className="flex gap-2 items-center text-xs text-[#81C784]">
                       <span className="flex items-center gap-1"><Bot className="w-3 h-3"/> {agent ? agent.name : 'AI Системный'}</span>
                       <span>•</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Ожидает действия</span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => reject(req.id)} className="px-3 py-1.5 border border-[#FF5252]/30 text-[#FF5252] hover:bg-[#FF5252]/10 rounded text-xs font-semibold uppercase tracking-wider transition-colors">Отклонить</button>
                    <button onClick={() => approve(req.id)} className="px-3 py-1.5 bg-[#00C853] text-[#050F0A] hover:bg-[#00E676] rounded text-xs font-bold uppercase tracking-wider transition-colors">Подтвердить</button>
                 </div>
               </div>
               )
            })}
         </div>
      </div>
      )}

      <div className="flex gap-2">
        {['Все', 'Активные', 'Черновики', 'Отключённые'].map((tab, i) => (
          <button key={tab} className={cn("text-sm px-4 py-1.5 rounded-full border transition-colors", i===0 ? "bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]" : "border-[#00C853]/10 text-[#81C784] hover:bg-[#112A1C]")}>
            {tab}
          </button>
        ))}
      </div>

      {agents.length === 0 ? (
        <div className="border-2 border-dashed border-[#00C853]/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Bot className="w-16 h-16 text-[#81C784]/30 mb-4" />
          <h3 className="text-lg font-semibold text-[#E8F5E9] mb-2">Соберите команду AI-сотрудников</h3>
          <p className="text-[#81C784] max-w-sm mb-6">Создавайте агентов, чтобы автоматизировать рутину, анализировать данные и общаться с клиентами.</p>
          <button className="bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30 px-6 py-2 rounded-lg font-medium hover:bg-[#00C853]/20 transition-colors">
            Добавить первого AI-сотрудника
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map(agent => {
            const autonomy = getAutonomyLabel(agent.autonomy_level);
            return (
              <div key={agent.id} className="bg-[#0D2018] border border-[#00C853]/15 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00C853]/30 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
                {/* Status Glow */}
                {agent.status === 'active' && <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-full blur-3xl -mr-10 -mt-10" />}
                
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#050F0A] border border-[#00C853]/20 flex items-center justify-center relative shadow-inner">
                      <Bot className="w-7 h-7 text-[#00C853]" />
                      {agent.status === 'active' && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00C853] rounded-full border-2 border-[#0D2018]" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-[#E8F5E9]">{agent.name}</h3>
                      <span className="text-xs text-[#81C784]">{agent.role}</span>
                    </div>
                  </div>
                  <button className="text-[#81C784] hover:text-[#E8F5E9] p-1"><MoreVertical className="w-4 h-4"/></button>
                </div>

                <div className="mb-5 relative z-10">
                  <p className="text-sm text-[#81C784]/90 line-clamp-2">{agent.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                   <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase rounded border", getTypeIconColor(agent.type))}>
                     {agent.type}
                   </span>
                   <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase rounded border", autonomy.color)}>
                     {autonomy.label}
                   </span>
                </div>

                {agent.status === 'active' ? (
                  <div className="bg-[#050F0A] rounded-xl p-4 mb-5 border border-[#00C853]/10 flex divide-x divide-[#00C853]/10 relative z-10">
                    <div className="flex-1 px-2 flex flex-col items-center">
                       <span className="text-lg font-bold tabular-nums text-[#E8F5E9]">{agent.stats?.messages_processed || 0}</span>
                       <span className="text-[10px] text-[#81C784] text-center mt-1">Обработано</span>
                    </div>
                    <div className="flex-1 px-2 flex flex-col items-center">
                       <span className="text-lg font-bold tabular-nums text-[#E8F5E9]">{agent.stats?.tasks_created || 0}</span>
                       <span className="text-[10px] text-[#81C784] text-center mt-1">Задач</span>
                    </div>
                    <div className="flex-1 px-2 flex flex-col items-center">
                       <span className="text-lg font-bold tabular-nums text-[#E8F5E9]">{agent.stats?.deals_found || 0}</span>
                       <span className="text-[10px] text-[#81C784] text-center mt-1">Сделок</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#050F0A] rounded-xl p-4 mb-5 border border-[#00C853]/10 flex items-center justify-center text-sm text-[#81C784]/60 relative z-10">
                    Агент не активен
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 relative z-10">
                   <button className="flex items-center gap-1.5 text-sm text-[#00C853] hover:text-[#00E676] font-medium transition-colors">
                     <Settings2 className="w-4 h-4"/> Настроить
                   </button>
                   
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={agent.status === 'active'} onChange={() => toggleStatus(agent.id, agent.status === 'active' ? 'disabled' : 'active')} />
                     <div className="w-11 h-6 bg-[#050F0A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#050F0A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C853] border border-[#00C853]/30"></div>
                   </label>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
