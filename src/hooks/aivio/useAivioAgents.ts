import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAIAgents, createAIAgent, toggleAIAgentStatus } from '@/lib/api/aivio';
import { toast } from 'sonner';
import { AIAgent, UUID } from '@/types/aivio';

export function useAivioAgents(workspaceId?: string) {
  const queryClient = useQueryClient();

  const agentsQuery = useQuery({
    queryKey: ['agents', workspaceId],
    queryFn: () => getAIAgents(workspaceId),
  });

  const createAgentMutation = useMutation({
    mutationFn: (input: Partial<AIAgent>) => createAIAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
      toast.success('AI-сотрудник успешно создан');
    },
    onError: () => {
      toast.error('Не удалось создать AI-сотрудника. Попробуйте снова.');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: UUID, status: 'active' | 'draft' | 'disabled' }) => toggleAIAgentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
      toast.success('Статус изменён');
    },
    onError: () => {
      toast.error('Не удалось изменить статус');
    }
  });

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    addAgent: (input: Partial<AIAgent>) => createAgentMutation.mutate(input),
    toggleStatus: (id: UUID, status: 'active' | 'draft' | 'disabled') => toggleStatusMutation.mutate({ id, status }),
  };
}
