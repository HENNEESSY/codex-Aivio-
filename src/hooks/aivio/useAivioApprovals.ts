import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApprovalRequests, approveRequest, rejectRequest } from '@/lib/api/aivio';
import { toast } from 'sonner';

export function useAivioApprovals(workspaceId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['approvals', workspaceId],
    queryFn: () => getApprovalRequests(workspaceId),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', workspaceId] });
      toast.success('Действие подтверждено');
    },
    onError: () => toast.error('Ошибка подтверждения')
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', workspaceId] });
      toast.success('Действие отклонено');
    },
    onError: () => toast.error('Ошибка отклонения')
  });

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    approve: (id: string) => approveMutation.mutate(id),
    reject: (id: string) => rejectMutation.mutate(id),
  };
}
