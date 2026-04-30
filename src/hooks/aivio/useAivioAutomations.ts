import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAivioAutomations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      return [
        { id: '1', name: 'Новый лид → Уведомление', triggerType: 'event', actionType: 'notify', status: 'active', runsCount: 42 },
        { id: '2', name: 'Горячий клиент → Задача менеджеру', triggerType: 'event', actionType: 'task', status: 'active', runsCount: 15 },
        { id: '3', name: 'Сделка без ответа 2 дня → Напоминание', triggerType: 'schedule', actionType: 'notify', status: 'stopped', runsCount: 0 },
        { id: '4', name: 'Входящий → AI-анализ', triggerType: 'event', actionType: 'ai', status: 'active', runsCount: 128 },
      ];
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await new Promise(r => setTimeout(r, 500));
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['automations'], (oldData: any[]) => 
        oldData?.map(item => item.id === data.id ? { ...item, status: data.status } : item)
      );
      toast.success(data.status === 'active' ? 'Автоматизация включена' : 'Автоматизация остановлена');
    },
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 500));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['automations'], (oldData: any[]) => 
        oldData?.filter(item => item.id !== id)
      );
      toast.success('Автоматизация удалена');
    },
  });

  return {
    automations: query.data || [],
    isLoading: query.isLoading,
    toggleAutomation: (id: string, status: string) => toggleAutomationMutation.mutate({ id, status }),
    deleteAutomation: (id: string) => deleteAutomationMutation.mutate(id),
  };
}
