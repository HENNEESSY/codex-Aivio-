import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinanceBootstrap, dismissFinanceSignal } from '@/lib/api/aivio';
import { toast } from 'sonner';
import { UUID } from '@/types/aivio';

export function useAivioFinance(workspaceId?: string) {
  const queryClient = useQueryClient();

  const financeQuery = useQuery({
    queryKey: ['finance', workspaceId],
    queryFn: () => getFinanceBootstrap(workspaceId),
  });

  const dismissSignalMutation = useMutation({
    mutationFn: (id: UUID) => dismissFinanceSignal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', workspaceId] });
      toast.success('Сигнал устранён');
    },
    onError: () => {
      toast.error('Не удалось устранить сигнал');
    }
  });

  return {
    transactions: financeQuery.data?.transactions || [],
    signals: financeQuery.data?.signals || [],
    isLoading: financeQuery.isLoading,
    dismissSignal: (id: UUID) => dismissSignalMutation.mutate(id),
  };
}
