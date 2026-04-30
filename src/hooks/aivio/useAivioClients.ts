import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientsBootstrap, createDeal, moveDealToStage } from '@/lib/api/aivio';
import { useWorkspace } from '@/lib/workspace/workspace-context';
import { toast } from 'sonner';
import { UUID, Deal, PipelineStage } from '@/types/aivio';

export function useAivioClients() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients', activeWorkspaceId],
    queryFn: () => getClientsBootstrap(activeWorkspaceId || undefined),
    enabled: !!activeWorkspaceId
  });

  const createDealMutation = useMutation({
    mutationFn: (input: Partial<Deal>) => createDeal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['commandCenter', activeWorkspaceId] });
      toast.success('Сделка успешно создана');
    },
    onError: () => {
      toast.error('Не удалось создать сделку. Попробуйте снова.');
    }
  });

  const moveDealMutation = useMutation({
    mutationFn: ({ dealId, stageId, stage }: { dealId: UUID, stageId: UUID, stage: PipelineStage }) => moveDealToStage(dealId, stageId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['commandCenter', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      toast.success('Сделка переведена');
    },
    onError: () => {
      toast.error('Не удалось перевести сделку.');
    }
  });

  // Derived helper for components that don't pass full stage object easily
  const advanceDeal = (dealId: UUID) => {
    const deals = clientsQuery.data?.deals || [];
    const stages = clientsQuery.data?.pipelineStages || [];
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const currentStageIndex = stages.findIndex(s => s.id === deal.stage_id);
    if (currentStageIndex >= 0 && currentStageIndex < stages.length - 1) {
       const nextStage = stages[currentStageIndex + 1];
       if (nextStage.is_lost) return; // Prevent advancing into internal "Lost" stage via quick button
       moveDealMutation.mutate({ dealId, stageId: nextStage.id, stage: nextStage });
    }
  };

  return {
    pipelineStages: clientsQuery.data?.pipelineStages || [],
    deals: clientsQuery.data?.deals || [],
    contacts: clientsQuery.data?.contacts || [],
    isLoading: clientsQuery.isLoading,
    createDeal: (input: Partial<Deal>) => createDealMutation.mutate(input),
    moveDeal: (dealId: UUID, stageId: UUID, stage: PipelineStage) => moveDealMutation.mutate({ dealId, stageId, stage }),
    advanceDeal
  };
}
