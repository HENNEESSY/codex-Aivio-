import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useAivioInbox } from '@/hooks/aivio/useAivioInbox';
import { cn } from '@/lib/utils';
import { Search, Send, Paperclip, Phone, MoreVertical, Bot, TrendingUp, AlertTriangle, Inbox as InboxIcon } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
});

function InboxPage() {
  const { conversations, selectedConversationId, messages, selectConversation, sendMessage, isLoading } = useAivioInbox();

  const [inputText, setInputText] = useState('');
  
  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-pulse flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00C853]"></div>Загрузка...</div></div>;
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  // Default mock analysis for demo feel if no real one is attached
  const mockAnalysis = {
    intent: 'Интерес к автоматизации',
    urgency: 'high',
    temperature: 'hot',
    budget: '~200 000 ₽',
    sentiment: 'positive',
    next_action: 'Подготовить КП',
    suggested_reply: 'Да, мы можем уложиться в 200 тысяч. Давайте встретимся для обсуждения ТЗ.',
    risk_flags: ['Сжатые сроки на старте']
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="absolute inset-0 flex h-full p-4 overflow-hidden gap-4">
      
      {/* Panel 1: List */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#0D2018] border border-[#00C853]/15 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="p-3 border-b border-[#00C853]/15">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#81C784]" />
             <input 
               type="text" 
               placeholder="Поиск диалогов..." 
               className="w-full bg-[#081509] border border-[#00C853]/20 rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8F5E9] focus:outline-none focus:border-[#00C853]"
             />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {['Все', 'Telegram', 'WhatsApp'].map((tab, i) => (
              <button key={tab} className={cn("text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors", i===0 ? "bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]" : "border-[#00C853]/10 text-[#81C784] hover:bg-[#112A1C]")}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-[#81C784] text-sm">Нет активных диалогов</div>
          ) : conversations.map(conv => {
             const contact = conv.contacts;
             const isSel = conv.id === selectedConversationId;
             return (
               <div 
                 key={conv.id} 
                 onClick={() => selectConversation(conv.id)}
                 className={cn(
                   "p-4 cursor-pointer border-b border-[#00C853]/5 hover:bg-[#112A1C] transition-colors relative",
                   isSel ? "bg-[#00C853]/10 border-l-2 border-l-[#00C853]" : ""
                 )}
               >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-[#E8F5E9]">{contact?.name || 'Неизвестный'}</span>
                    <span className="text-[10px] text-[#81C784]">{format(new Date(conv.last_message_at), 'HH:mm')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#81C784] line-clamp-1 mr-2">{contact?.company}</span>
                    {conv.unread_count > 0 && <span className="bg-[#00C853] text-[#050F0A] text-[10px] font-bold px-1.5 rounded-full">{conv.unread_count}</span>}
                  </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* Panel 2: Chat */}
      <div className="flex-1 flex flex-col bg-[#0D2018] border border-[#00C853]/15 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        {!selectedConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#81C784]">
            <InboxIcon className="w-12 h-12 mb-4 text-[#81C784]/30" />
            <p>Выберите диалог для ответа</p>
          </div>
        ) : (
          <>
            <div className="h-[64px] px-6 border-b border-[#00C853]/15 flex items-center justify-between bg-[#0A1A0F]">
               <div>
                 <h2 className="font-semibold text-[#E8F5E9]">{selectedConversation?.contacts?.name}</h2>
                 <p className="text-xs text-[#81C784]">{selectedConversation?.channel}</p>
               </div>
               <div className="flex items-center gap-3">
                 <button className="p-2 border border-[#00C853]/20 rounded-lg text-[#81C784] hover:text-[#00C853] hover:bg-[#00C853]/10 transition-colors">
                   <Phone className="w-4 h-4" />
                 </button>
                 <button className="px-3 py-1.5 text-sm bg-[#00C853]/10 border border-[#00C853]/30 text-[#00E676] rounded-lg hover:bg-[#00C853]/20 transition-colors">
                   Создать сделку
                 </button>
                 <button className="p-2 text-[#81C784] hover:text-[#E8F5E9]"><MoreVertical className="w-4 h-4" /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.map(m => {
                 const isClient = m.sender_type === 'client';
                 return (
                   <div key={m.id} className={cn("flex flex-col max-w-[80%]", isClient ? "self-start items-start" : "self-end items-end")}>
                      <span className="text-[10px] text-[#81C784]/60 mb-1 mx-1">{isClient ? selectedConversation?.contacts?.name : 'Вы'}</span>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm shadow-sm",
                        isClient ? "bg-[#112A1C] text-[#E8F5E9] rounded-tl-sm border border-[#00C853]/10" : "bg-[#00C853] text-[#050F0A] font-medium rounded-tr-sm"
                      )}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-[#81C784]/40 mt-1 mx-1">{format(new Date(m.created_at), 'HH:mm')}</span>
                   </div>
                 )
               })}
            </div>

            {/* AI Suggestion */}
            <div className="bg-[#050F0A] p-4 border-t border-[#00C853]/15">
              <div className="mb-3 p-3 bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-[#00C853] text-xs font-semibold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI предлагает:</span>
                </div>
                <p className="text-sm text-[#E8F5E9]">{mockAnalysis.suggested_reply}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setInputText(mockAnalysis.suggested_reply)} className="text-xs px-3 py-1 bg-[#00C853] text-[#050F0A] font-semibold rounded hover:bg-[#00E676] transition-colors">Использовать</button>
                  <button className="text-xs px-3 py-1 border border-[#00C853]/30 text-[#81C784] rounded hover:bg-[#0A1A0F] transition-colors">Пропустить</button>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button className="p-3 text-[#81C784] hover:text-[#E8F5E9] rounded-xl hover:bg-[#112A1C] transition-colors"><Paperclip className="w-5 h-5"/></button>
                <textarea 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Написать ответ..."
                  className="flex-1 bg-[#0A1A0F] border border-[#00C853]/20 text-[#E8F5E9] text-sm rounded-xl p-3 resize-none focus:outline-none focus:border-[#00C853]"
                  rows={2}
                  onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }}}
                />
                <button onClick={handleSend} className="p-3 bg-[#00C853] hover:bg-[#00E676] text-[#050F0A] rounded-xl transition-colors shadow-[0_0_16px_rgba(0,200,83,0.3)]">
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Panel 3: AI Sidebar */}
      {selectedConversationId && (
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto hidden xl:flex">
          <div className="bg-[#0D2018] border border-[#00C853]/15 rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 text-[#E8F5E9]">
              <Bot className="w-4 h-4 text-[#00C853]" />
              AI Анализ
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#81C784] uppercase">Намерение</span>
                <p className="text-sm font-medium">{mockAnalysis.intent}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-[#81C784] uppercase">Температура</span>
                  <div className="mt-1 inline-block px-2 py-0.5 bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] rounded text-xs">HOT</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#81C784] uppercase">Бюджет</span>
                  <p className="text-sm font-medium mt-1 tabular-nums">{mockAnalysis.budget}</p>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] text-[#81C784] uppercase">Следующее действие</span>
                <p className="text-sm font-medium mt-1">{mockAnalysis.next_action}</p>
                <button className="mt-2 w-full text-xs py-1.5 bg-[#0A1A0F] border border-[#00C853]/30 text-[#00C853] rounded hover:bg-[#00C853]/10 transition-colors">
                  Создать задачу
                </button>
              </div>

              {mockAnalysis.risk_flags.length > 0 && (
                <div className="p-3 bg-[#FFB300]/5 border border-[#FFB300]/20 rounded-lg">
                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#FFB300] mb-1">
                     <AlertTriangle className="w-3.5 h-3.5" /> Риски
                   </span>
                   <p className="text-xs text-[#FFB300]/80">{mockAnalysis.risk_flags[0]}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0D2018] border border-[#00C853]/15 rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
             <h3 className="text-sm font-semibold mb-3 text-[#E8F5E9]">Контакт</h3>
             <div className="space-y-2">
                <div className="text-sm"><span className="text-[#81C784]">Имя:</span> {selectedConversation?.contacts?.name}</div>
                <div className="text-sm"><span className="text-[#81C784]">Компания:</span> {selectedConversation?.contacts?.company || 'Не указана'}</div>
                <div className="text-sm"><span className="text-[#81C784]">Канал:</span> {selectedConversation?.channel}</div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
