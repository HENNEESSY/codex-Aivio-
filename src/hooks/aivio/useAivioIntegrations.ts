import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAivioIntegrations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      // Predefined integration data matching the UI
      return [
        { id: 'tg', cat: 'messengers', name: 'Telegram', status: 'connected', desc: 'Подключите бота для получения сообщений' },
        { id: 'wa', cat: 'messengers', name: 'WhatsApp', status: 'available', desc: 'Business API интеграция' },
        { id: 'ig', cat: 'messengers', name: 'Instagram', status: 'available', desc: 'Ответы в Direct' },
        { id: 'b24', cat: 'crm', name: 'Битрикс24', status: 'available', desc: 'Двусторонняя синхронизация сделок' },
        { id: 'amo', cat: 'crm', name: 'AmoCRM', status: 'available', desc: 'Импорт контактов и воронок' },
        { id: 'n8n', cat: 'automation', name: 'n8n', status: 'connected', desc: 'Webhook для сложной логики' },
        { id: 'yoo', cat: 'finance', name: 'ЮKassa', status: 'available', desc: 'Генерация ссылок на оплату' },
        { id: 'max', cat: 'all', name: 'MAX', status: 'coming_soon', desc: 'Умный ассистент от Сбера' },
      ];
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string, enabled: boolean }) => {
      // Fake delay
      await new Promise(r => setTimeout(r, 600));
      return { id, enabled };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['integrations'], (oldData: any[]) => 
        oldData?.map(item => item.id === data.id ? { ...item, status: data.enabled ? 'connected' : 'available' } : item)
      );
      toast.success(data.enabled ? 'Интеграция подключена' : 'Интеграция отключена');
    },
    onError: () => toast.error('Не удалось изменить статус интеграции'),
  });

  return {
    integrations: query.data || [],
    isLoading: query.isLoading,
    toggleIntegration: (id: string, enabled: boolean) => toggleIntegrationMutation.mutate({ id, enabled }),
  };
}
