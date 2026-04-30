import { Deal, FinanceTransaction, PipelineStage } from '@/types/aivio';

export function calculateRevenueMetric(deals: Deal[], transactions: FinanceTransaction[]) {
  // Demo simplicity: just take all 'won' deals or actual income
  return transactions
    .filter(t => t.status === 'actual' && t.direction === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function calculateConversionRate(deals: Deal[]) {
  const closed = deals.filter(d => d.status === 'won' || d.status === 'lost');
  if (closed.length === 0) return 0;
  
  const won = closed.filter(d => d.status === 'won').length;
  return Number(((won / closed.length) * 100).toFixed(1));
}

export function buildPipelineOverview(deals: Deal[], stages: PipelineStage[]) {
  return stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage_id === stage.id);
    return {
      ...stage,
      deals_count: stageDeals.length,
      amount: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0)
    };
  });
}
