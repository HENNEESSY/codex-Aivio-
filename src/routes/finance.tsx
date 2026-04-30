import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioFinance } from '@/hooks/aivio/useAivioFinance';
import { useAivioCommandCenter } from '@/hooks/aivio/useAivioCommandCenter';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowUpRight, ArrowDownRight, Activity, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance',
  component: FinancePage,
});

function FinancePage() {
  const { transactions, signals, isLoading, dismissSignal } = useAivioFinance();
  const { missedMoneySignals } = useAivioCommandCenter();
  const [activeTab, setActiveTab] = useState('Обзор');

  if (isLoading) {
    return <div className="animate-pulse p-6">Загрузка финансов...</div>;
  }

  const formatMoney = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  
  const getSeverityStyle = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-l-[#FF5252] border-[#FF5252]/20 bg-[#FF5252]/5';
      case 'high': return 'border-l-[#FFB300] border-[#FFB300]/20 bg-[#FFB300]/5';
      default: return 'border-l-[#00C853] border-[#00C853]/20 bg-[#00C853]/5';
    }
  }

  const handleAction = (cta: string) => {
    toast.success(`Действие выполнено: ${cta}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9]">Финансовый радар</h1>
          <p className="text-[#81C784] text-sm mt-1">Контроль кэшфлоу и выявление рисков</p>
        </div>
        <select className="bg-[#0D2018] border border-[#00C853]/20 text-[#E8F5E9] text-sm rounded-lg px-3 py-1.5 outline-none">
          <option>30 дней</option>
          <option>7 дней</option>
          <option>14 дней</option>
          <option>90 дней</option>
        </select>
      </div>

      <div className="flex gap-2 border-b border-[#00C853]/10 pb-px">
        {['Обзор', 'Движение средств', 'Прогнозы', 'Отчёты'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={cn("text-sm px-4 py-2 font-medium transition-colors border-b-2", activeTab === tab ? "border-[#00C853] text-[#00C853]" : "border-transparent text-[#81C784] hover:text-[#E8F5E9]")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Доходы', value: formatMoney(1245000), trend: '+15%', color: 'text-[#00C853]', icon: ArrowUpRight },
          { label: 'Расходы', value: formatMoney(890000), trend: '-5%', color: 'text-[#FF5252]', icon: ArrowDownRight },
          { label: 'Прибыль', value: formatMoney(355000), trend: '+25%', color: 'text-[#00E676]', icon: Activity },
          { label: 'Рентабельность', value: '28%', trend: '+8%', color: 'text-[#E8F5E9]', icon: null },
        ].map((m, i) => (
           <div key={i} className="bg-[#0D2018] border border-[#00C853]/10 rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
             <div className="text-sm text-[#81C784] mb-2 font-medium">{m.label}</div>
             <div className="text-2xl font-bold text-[#E8F5E9] tabular-nums tracking-tight mb-2">{m.value}</div>
             <div className="flex items-center gap-1">
               {m.icon && <m.icon className={cn("w-4 h-4", m.color)}/>}
               <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", m.trend.startsWith('+') ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#FF5252]/10 text-[#FF5252]")}>{m.trend}</span>
             </div>
           </div>
        ))}
      </div>

      {/* Missed Money Radar Row */}
      {missedMoneySignals && missedMoneySignals.length > 0 && (
        <div className="bg-[#0D2018] border border-[#00C853]/10 rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#FFB300]" />
            <h2 className="text-lg font-semibold tracking-tight text-[#E8F5E9]">Missed Money Radar</h2>
            <p className="text-sm text-[#81C784] ml-2">Упущенная выгода и точки роста</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {missedMoneySignals.map((sig) => (
                <div key={sig.id} className={cn(
                  "relative bg-[#0A1A0F] rounded-lg p-4 border border-[#00C853]/10 overflow-hidden",
                  sig.severity === 'critical' ? "border-l-4 border-l-[#FF5252]" : 
                  sig.severity === 'high' ? "border-l-4 border-l-[#FFB300]" : "border-l-4 border-l-[#00C853]"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-[#E8F5E9]">{sig.title}</span>
                    <span className="font-bold text-[#FF5252] text-sm whitespace-nowrap ml-2">{formatMoney(sig.lost_amount_estimate)}</span>
                  </div>
                  <p className="text-xs text-[#81C784] mb-4">{sig.reason}</p>
                  <button onClick={() => handleAction(sig.cta)} className="text-xs font-semibold px-4 py-2 bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00E676] border border-[#00C853]/30 rounded-md transition-colors w-full text-center">
                    {sig.cta}
                  </button>
                </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="xl:col-span-2 bg-[#0D2018] border border-[#00C853]/10 rounded-xl p-6 min-h-[400px] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            {/* Chart placeholder */}
            <h3 className="text-lg font-semibold mb-6">Динамика выручки</h3>
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-[#00C853]/10 rounded-lg text-[#81C784] flex-col gap-2">
              <Activity className="w-8 h-8 text-[#00C853]/50" />
              График загружается...
            </div>
         </div>

         <div className="flex flex-col gap-4">
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <AlertCircle className="w-5 h-5 text-[#FFB300]" />
             Финансовые сигналы
           </h3>
           
           <div className="space-y-4">
             {signals.length === 0 ? (
               <p className="text-sm text-[#81C784]">Сигналов нет. Всё чисто.</p>
             ) : signals.map(s => (
               <div key={s.id} className={cn("rounded-xl p-4 border-l-4 group relative", getSeverityStyle(s.severity))}>
                 <button onClick={() => dismissSignal(s.id)} className="absolute top-2 right-2 p-1 text-[#81C784] hover:text-[#E8F5E9] opacity-0 group-hover:opacity-100 transition-opacity">
                   <X className="w-4 h-4" />
                 </button>
                 <h4 className="font-semibold text-[15px] mb-1 pr-6 leading-tight text-[#E8F5E9]">{s.title}</h4>
                 <p className="text-xs text-[#81C784] mb-3 leading-relaxed">{s.message}</p>
                 {s.amount && <div className="text-sm font-bold tabular-nums mb-3 text-[#E8F5E9]">{formatMoney(s.amount)}</div>}
                 <button onClick={() => handleAction('Устранить сигнал')} className="text-xs bg-[#050F0A]/50 hover:bg-[#050F0A] border border-current text-current font-semibold px-4 py-1.5 rounded transition-colors uppercase tracking-wider">
                   Устранить
                 </button>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
