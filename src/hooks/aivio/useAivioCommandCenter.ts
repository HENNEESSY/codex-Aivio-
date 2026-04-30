import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommandCenterBootstrap, getActivities, completeTask } from '@/lib/api/aivio';
import { calculateRevenueMetric, buildPipelineOverview, calculateConversionRate } from '@/lib/analytics/command-center';
import { calculateBusinessDiagnosis, findMissedMoneySignals, generateOwnerDecisions, generateRecoveryCampaigns } from '@/lib/analytics';
import { useWorkspace } from '@/lib/workspace/workspace-context';
import { toast } from 'sonner';
import { UUID, Contact } from '@/types/aivio';

export function useAivioCommandCenter() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  const bsQuery = useQuery({
    queryKey: ['commandCenter', activeWorkspaceId],
    queryFn: () => getCommandCenterBootstrap(activeWorkspaceId || undefined),
    enabled: !!activeWorkspaceId
  });

  const actsQuery = useQuery({
    queryKey: ['activities', activeWorkspaceId],
    queryFn: () => getActivities(activeWorkspaceId || undefined),
    refetchInterval: 15000, 
    enabled: !!activeWorkspaceId
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: UUID) => completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandCenter', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      toast.success('Задача выполнена');
    }
  });
  
  const deals = bsQuery.data?.deals || [];
  const stages = bsQuery.data?.stages || [];
  const tasks = bsQuery.data?.tasks || [];
  const conversations = bsQuery.data?.conversations || [];
  const financeSignals = bsQuery.data?.financeSignals || [];
  const contacts: Contact[] = []; // If we need contacts, we can add them to bootstrap. For now pass empty.

  const metrics = {
    revenue: calculateRevenueMetric(deals, []),
    activeDeals: deals.filter(d => d.status === 'active').length,
    conversion: calculateConversionRate(deals),
    avgCheck: deals.filter(d => d.status === 'won').length > 0 ? Math.floor(calculateRevenueMetric(deals, []) / deals.filter(d => d.status === 'won').length) : 0
  };

  const pipeline = buildPipelineOverview(deals, stages);

  const diagnosis = calculateBusinessDiagnosis(deals, conversations, tasks, financeSignals);
  const ownerDecisions = generateOwnerDecisions(diagnosis);
  const missedMoneySignals = findMissedMoneySignals(deals, conversations);
  const recoveryCampaigns = generateRecoveryCampaigns(contacts, deals);

  return {
    deals,
    stages,
    pipeline,
    tasks,
    activities: actsQuery.data || [],
    isLoading: bsQuery.isLoading || actsQuery.isLoading,
    metrics,
    diagnosis,
    ownerDecisions,
    missedMoneySignals,
    recoveryCampaigns,
    markTaskComplete: (id: UUID) => completeTaskMutation.mutate(id),
  };
}
