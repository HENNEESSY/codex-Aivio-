import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { User, Building, CreditCard, BellRing, Shield, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAivioSettings } from '@/hooks/aivio/useAivioSettings';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Профиль');
  const { settings, isLoading, updateProfile } = useAivioSettings();

  const tabs = [
    { name: 'Профиль', icon: User },
    { name: 'Компания', icon: Building },
    { name: 'Память бизнеса', icon: Sparkles },
    { name: 'Подписка', icon: CreditCard },
    { name: 'Уведомления', icon: BellRing },
    { name: 'Безопасность', icon: Shield },
    { name: 'API', icon: Code },
  ];

  if (isLoading || !settings) return <div className="animate-pulse p-6">Загрузка настроек...</div>;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({});
  };

  return (
    <div className="max-w-7xl mx-auto flex gap-8 pb-10">
      
      {/* Settings Sidebar */}
      <div className="w-[240px] flex-shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8F5E9] mb-6">Настройки</h1>
        <div className="space-y-1">
          {tabs.map(t => (
            <button
              key={t.name}
              onClick={() => setActiveTab(t.name)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === t.name ? "bg-[#00C853]/10 text-[#00C853]" : "text-[#81C784] hover:bg-[#112A1C] hover:text-[#E8F5E9]"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-[#0D2018] border border-[#00C853]/15 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {activeTab === 'Профиль' && (
          <div className="p-8">
             <h2 className="text-xl font-semibold mb-6">Профиль пользователя</h2>
             <form onSubmit={handleSave} className="space-y-6 max-w-md">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C853] to-[#0A1A0F] border border-[#00C853]/30 flex items-center justify-center font-semibold text-2xl">
                   A
                 </div>
                 <button type="button" className="text-sm font-medium px-4 py-2 bg-[#112A1C] border border-[#00C853]/20 rounded-lg hover:bg-[#00C853]/10 transition-colors">
                   Загрузить фото
                 </button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-[#81C784] mb-1.5">Имя</label>
                   <input type="text" defaultValue={settings.profile?.name} className="w-full bg-[#081509] border border-[#00C853]/20 rounded-lg px-3 py-2 text-[#E8F5E9] focus:outline-none focus:border-[#00C853]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-[#81C784] mb-1.5">Email</label>
                   <input type="email" defaultValue={settings.profile?.email} className="w-full bg-[#081509] border border-[#00C853]/20 rounded-lg px-3 py-2 text-[#E8F5E9] focus:outline-none focus:border-[#00C853]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-[#81C784] mb-1.5">Роль</label>
                   <input type="text" defaultValue="Владелец" disabled className="w-full bg-[#050F0A] opacity-50 border border-[#00C853]/10 rounded-lg px-3 py-2 text-[#81C784] cursor-not-allowed" />
                 </div>
               </div>

               <button type="submit" className="px-6 py-2 bg-[#00C853] text-[#050F0A] font-semibold rounded-lg hover:bg-[#00E676] shadow-[0_0_16px_rgba(0,200,83,0.3)] transition-all">
                 Сохранить изменения
               </button>
             </form>
          </div>
        )}

        {activeTab === 'Подписка' && (
          <div className="p-8">
             <h2 className="text-xl font-semibold mb-6">Управление подпиской</h2>
             
             {/* Current Plan */}
             <div className="bg-[#0A1A0F] border border-[#00C853]/30 rounded-xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C853]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 align-top">
                  <div>
                    <h3 className="text-lg font-bold text-[#E8F5E9] flex items-center gap-2">Aivio Pro <span className="text-[10px] bg-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#00C853]/30">Активно</span></h3>
                    <p className="text-sm text-[#81C784] mt-1">Осталось 12 дней (До 12 Май 2026)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold tabular-nums">4 900 ₽</span>
                    <span className="text-sm text-[#81C784]"> / мес</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Usage bar 1 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#81C784]">AI-запросы</span>
                      <span>8 400 <span className="text-[#81C784]/60">/ 10 000</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0D2018] rounded-full overflow-hidden border border-[#00C853]/10">
                      <div className="h-full bg-[#00C853] w-[84%]" />
                    </div>
                  </div>
                  {/* Usage bar 2 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#81C784]">AI-сотрудники</span>
                      <span>3 <span className="text-[#81C784]/60">/ 5</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0D2018] rounded-full overflow-hidden border border-[#00C853]/10">
                      <div className="h-full bg-[#00C853] w-[60%]" />
                    </div>
                  </div>
                </div>
             </div>

             {/* MAX Integration banner */}
             <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-emerald-900/40 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden flex justify-between items-center group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                <div className="relative z-10 w-2/3">
                   <div className="flex items-center gap-2 mb-2">
                     <Sparkles className="w-5 h-5 text-emerald-400" />
                     <h3 className="font-bold text-lg text-emerald-100">Интеграция с GigaChat MAX</h3>
                     <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider font-bold">Скоро</span>
                   </div>
                   <p className="text-sm text-emerald-100/70">Умный корпоративный ассистент от Сбера прямо в вашей ОС. Поддерживает сложные бухгалтерские и юридические запросы.</p>
                </div>
                <button disabled className="relative w-[150px] z-10 px-4 py-2 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/20 transition-all opacity-50 cursor-not-allowed">
                  Подключить
                </button>
             </div>
          </div>
        )}

        {activeTab === 'Память бизнеса' && (
          <div className="p-8">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 flex items-center justify-center border border-[#00C853]/20">
                 <Sparkles className="w-5 h-5 text-[#00C853]" />
               </div>
               <div>
                 <h2 className="text-xl font-semibold text-[#E8F5E9]">Память бизнеса</h2>
                 <p className="text-sm text-[#81C784]">Контекст и правила для всех AI-сотрудников</p>
               </div>
             </div>
             
             <div className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#81C784] mb-2">Продукты и услуги</label>
                  <textarea 
                    defaultValue="Основной продукт: Aivio OS. Целевая аудитория: малый бизнес. Средний чек: 45 000 руб." 
                    rows={4} 
                    className="w-full bg-[#081509] border border-[#00C853]/15 rounded-xl p-4 text-[#E8F5E9] focus:outline-none focus:border-[#00C853] resize-none font-mono text-sm leading-relaxed" 
                    placeholder="Опишите, что вы продаете..."
                  />
                  <p className="text-xs text-[#81C784]/60 mt-1">Эти данные будут доступны AI-менеджерам для формирования предложений.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#81C784] mb-2">Стиль общения (Tone of Voice)</label>
                  <textarea 
                    defaultValue="Общаемся вежливо, но без лишнего официоза. На 'вы'. Используем эмодзи умеренно." 
                    rows={2} 
                    className="w-full bg-[#081509] border border-[#00C853]/15 rounded-xl p-4 text-[#E8F5E9] focus:outline-none focus:border-[#00C853] resize-none font-mono text-sm leading-relaxed" 
                    placeholder="Например: дружелюбно, на 'ты', с юмором..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#81C784] mb-2">Ограничения и правила (Stop-слова)</label>
                  <textarea 
                    defaultValue="Никогда не обещать скидку больше 10%. Не называть точных сроков разработки без согласования." 
                    rows={3} 
                    className="w-full bg-[#081509] border border-[#FF5252]/15 rounded-xl p-4 text-[#E8F5E9] focus:outline-none focus:border-[#FF5252]/50 resize-none font-mono text-sm leading-relaxed" 
                    placeholder="Что AI-сотрудникам строго запрещено делать?"
                  />
                </div>

                <div className="pt-6 border-t border-[#00C853]/10">
                  <button className="px-6 py-2.5 bg-[#00C853] text-[#050F0A] font-semibold rounded-lg hover:bg-[#00E676] shadow-[0_0_16px_rgba(0,200,83,0.3)] transition-all">
                    Обновить память
                  </button>
                </div>
             </div>
          </div>
        )}

        {(activeTab !== 'Профиль' && activeTab !== 'Подписка' && activeTab !== 'Память бизнеса') && (
           <div className="flex p-12 items-center justify-center text-[#81C784]">
             Настройки раздела {activeTab} находятся в разработке.
           </div>
        )}

      </div>
    </div>
  );
}
