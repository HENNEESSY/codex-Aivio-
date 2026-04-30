import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioCommandCenter } from '@/hooks/aivio/useAivioCommandCenter';
import { Wallet, TrendingUp, Percent, BarChart3, AlertCircle, HeartPulse, ShieldAlert, CheckCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CommandCenter,
});

function CommandCenter() {
  const { metrics, activities, pipeline, diagnosis, ownerDecisions, missedMoneySignals, recoveryCampaigns, isLoading } = useAivioCommandCenter();

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[#0D2018] rounded-xl border border-[#00C853]/10" />)}
      </div>
      <div className="h-[200px] bg-[#0D2018] rounded-xl border border-[#00C853]/10" />
    </div>;
  }

  const formatMoney = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  const statCards = [
    { title: 'Выручка', value: formatMoney(metrics.revenue || 842000), trend: '+12%', icon: Wallet },
    { title: 'Активные сделки', value: metrics.activeDeals || 18, trend: '+2', icon: TrendingUp },
    { title: 'Конверсия', value: '4.7%', trend: '+0.8%', icon: Percent },
    { title: 'Средний чек', value: formatMoney(metrics.avgCheck || 65000), trend: '+5%', icon: BarChart3 },
  ];

  const handleAction = (cta: string) => {
    toast.success(`Действие выполнено: ${cta}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(0,200,83,0.08)] hover:border-[#00C853]/30 hover:-translate-y-[1px] hover:shadow-[0_0_24px_rgba(0,200,83,0.18)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#00C853]/10 rounded-lg border border-[#00C853]/20">
                <stat.icon className="w-5 h-5 text-[#00C853]" />
              </div>
              <span className="text-xs font-semibold text-[#00C853] bg-[#00C853]/10 px-2 py-1 rounded-full border border-[#00C853]/20">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-[#81C784] text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-xl xl:text-2xl font-bold text-[#E8F5E9] tabular-nums tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Second Row: AI Doctor and Owner Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Business Doctor */}
        <div className="lg:col-span-2 bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#00C853]/10 rounded-lg border border-[#00C853]/20">
              <HeartPulse className="w-6 h-6 text-[#00C853]" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Business Doctor</h2>
              <p className="text-[#81C784] text-sm">Ежедневный диагноз бизнеса</p>
            </div>
          </div>
          
          <div className="bg-[#050F0A] border border-[#FF5252]/30 rounded-xl p-6 mb-6">
            <h3 className="text-[#FF5252] text-lg font-semibold mb-2">
              ⚠️ Сегодня бизнес может потерять {formatMoney(diagnosis?.revenue_at_risk || 0)}
            </h3>
            <div className="space-y-2 mt-4">
              {diagnosis?.reasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2 text-[#E8F5E9] text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFB300]" />
                  {reason}
                 </div>
              ))}
              {(!diagnosis?.reasons || diagnosis.reasons.length === 0) && (
                <div className="flex items-center gap-2 text-[#00E676] text-sm">
                  <CheckCircle className="w-4 h-4" /> Показатели в норме
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="text-sm text-[#81C784] font-medium self-center mr-2">Рекомендуемые действия:</span>
            {diagnosis?.recommended_actions.map((act, i) => (
              <button 
                key={i} 
                onClick={() => handleAction(act.cta)}
                className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-[#050F0A] font-semibold text-sm rounded-lg transition-colors shadow-[0_0_12px_rgba(0,200,83,0.3)]"
              >
                [{act.title}]
              </button>
            ))}
          </div>
        </div>

        {/* Owner Mode */}
        <div className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#00C853]/10">
            <ShieldAlert className="w-5 h-5 text-[#00C853]" />
            <h2 className="text-lg font-semibold tracking-tight">Режим собственника</h2>
          </div>
          <div className="mb-4">
             <span className="text-[#E8F5E9] font-medium">Сегодня нужно принять {ownerDecisions?.length || 0} решения</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {ownerDecisions?.map((dec) => (
              <div key={dec.id} className="bg-[#050F0A] rounded-lg p-4 border border-[#00C853]/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-[#E8F5E9]">{dec.title}</h4>
                  {dec.urgency === 'high' && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#FF5252] mt-1.5" />}
                </div>
                <p className="text-xs text-[#81C784] mb-3">{dec.description}</p>
                {dec.impact_amount && (
                  <p className="text-xs font-semibold text-[#FFB300] mb-3">Влияние: ~{formatMoney(dec.impact_amount)}</p>
                )}
                <button onClick={() => handleAction(dec.cta)} className="w-full text-xs font-semibold py-2 rounded-md border border-[#00C853]/30 text-[#00E676] hover:bg-[#00C853]/10 transition-colors">
                  {dec.cta}
                </button>
              </div>
            ))}
            {(!ownerDecisions || ownerDecisions.length === 0) && (
              <p className="text-sm text-[#81C784]">Все решения приняты, можете отдыхать.</p>
            )}
          </div>
        </div>
      </div>

      {/* Third row: Missed Money, Recovery & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-semibold tracking-tight">События</h2>
           </div>
           <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#00C853]/10">
             {activities.length === 0 ? (
               <p className="text-[#81C784] text-sm py-4 pl-8">Событий пока нет</p>
             ) : activities.slice(0, 4).map((act) => (
               <div key={act.id} className="relative flex gap-4 items-start z-10">
                 <div className="w-6 h-6 rounded-full bg-[#0D2018] border-2 border-[#00C853] flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(0,200,83,0.4)]" />
                 <div className="flex-1 bg-[#0A1A0F] border border-[#00C853]/10 rounded-lg p-3">
                   <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-[15px]">{act.title}</span>
                      <span className="text-xs text-[#81C784]/60">
                        {format(new Date(act.created_at), 'HH:mm', { locale: ru })}
                      </span>
                   </div>
                   {act.body && <p className="text-sm text-[#81C784]">{act.body}</p>}
                 </div>
               </div>
             ))}
           </div>
        </div>
        
        {/* Missed Money Radar */}
        <div className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#FFB300]" />
            <h2 className="text-lg font-semibold tracking-tight">Missed Money Radar</h2>
          </div>
          <div className="space-y-4 flex-1">
             {missedMoneySignals?.map((sig) => (
                <div key={sig.id} className={cn(
                  "relative bg-[#0A1A0F] rounded-lg p-4 border border-[#00C853]/10 overflow-hidden",
                  sig.severity === 'critical' ? "border-l-4 border-l-[#FF5252]" : 
                  sig.severity === 'high' ? "border-l-4 border-l-[#FFB300]" : "border-l-4 border-l-[#00C853]"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-[#E8F5E9]">{sig.title}</span>
                    <span className="font-bold text-[#FF5252] text-sm">{formatMoney(sig.lost_amount_estimate)}</span>
                  </div>
                  <p className="text-xs text-[#81C784] mb-4">{sig.reason}</p>
                  <button onClick={() => handleAction(sig.cta)} className="text-xs font-semibold px-4 py-2 bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00E676] border border-[#00C853]/30 rounded-md transition-colors">
                    {sig.cta}
                  </button>
                </div>
             ))}
             {(!missedMoneySignals || missedMoneySignals.length === 0) && (
               <p className="text-sm text-[#81C784]">Упущенной выгоды не найдено.</p>
             )}
          </div>
        </div>

        {/* Recovery Campaigns */}
        <div className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-5 h-5 text-[#42A5F5]" />
            <h2 className="text-lg font-semibold tracking-tight">AI Реактивация</h2>
          </div>
          <p className="text-sm text-[#81C784] mb-4">Предложения для текущей базы клиентов.</p>
          <div className="space-y-4 flex-1">
             {recoveryCampaigns && recoveryCampaigns.length > 0 ? recoveryCampaigns.map((camp, index) => (
                <div key={camp.id} className="relative bg-[#0A1A0F] rounded-lg p-4 border border-[#00C853]/10 overflow-hidden border-l-4 border-l-[#42A5F5]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-[#E8F5E9] leading-tight pr-4">Кампания #{index + 1}</span>
                    <div className="bg-[#42A5F5]/10 text-[#42A5F5] text-xs font-bold px-2 py-0.5 rounded border border-[#42A5F5]/30 flex-shrink-0">
                      {camp.clients_count} чел.
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-[#42A5F5] mb-2 uppercase tracking-wide">
                    Потенциал: {formatMoney(camp.potential_revenue)}
                  </p>
                  <p className="text-xs text-[#81C784] mb-4">{camp.description}</p>
                  <button onClick={() => handleAction('Запустить кампанию: ' + camp.id)} className="w-full text-xs font-semibold px-4 py-2 bg-[#42A5F5]/10 hover:bg-[#42A5F5]/20 text-[#42A5F5] border border-[#42A5F5]/30 rounded-md transition-colors">
                    Запустить AI-агента
                  </button>
                </div>
             )) : (
               <p className="text-sm text-[#81C784]">Пока нет новых кампаний для запуска.</p>
             )}
          </div>
        </div>
      </div>

      {/* Fourth row: Pipeline Overview */}
      <div className="bg-[#0D2018] border border-[#00C853]/12 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <h2 className="text-lg font-semibold tracking-tight mb-6">Воронка продаж</h2>
        <div className="flex gap-2 relative overflow-x-auto pb-4">
           {pipeline?.map((stage, i) => {
             const isLast = i === pipeline.length - 1;
             const maxCount = Math.max(...pipeline.map(s => s.deals_count)) || 1;
             const percentage = (stage.deals_count / maxCount) * 100;
             return (
               <div key={stage.id} className="min-w-[120px] flex-1 flex flex-col items-center group">
                 <div className="text-sm font-medium text-[#E8F5E9] mb-1">{stage.name}</div>
                 <div className="text-xs text-[#81C784] mb-4 text-center">{stage.deals_count} сделок / <br/>{formatMoney(stage.amount)}</div>
                 
                 <div className="w-full flex items-center h-12 relative group-hover:scale-y-110 transition-transform">
                    <div 
                      className="w-full bg-[#050F0A] rounded-sm relative border border-[#00C853]/20 overflow-hidden" 
                      style={{ height: '32px' }}
                    >
                       <div 
                         className="absolute bottom-0 left-0 top-0 bg-[#00C853]/80 border-r border-[#00C853] transition-all" 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                    {!isLast && <div className="absolute -right-2 z-10 w-4 h-4 text-[#81C784] translate-y-[-1px] rotate-45 border-t-2 border-r-2 border-[#00C853]/30 bg-[#0D2018]" />}
                 </div>
               </div>
             );
           })}
        </div>
      </div>

    </div>
  );
}
