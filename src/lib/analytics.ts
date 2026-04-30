import { Deal, Contact, Task, Conversation, FinanceSignal, PipelineStage, DealRoomAnalysis, MissedMoneySignal, BusinessDiagnosis, RevenueRecoveryCampaign, DecisionCard } from '@/types/aivio';

// AI Business Doctor Diagnosis
export function calculateBusinessDiagnosis(
  deals: Deal[],
  conversations: Conversation[],
  tasks: Task[],
  financeSignals: FinanceSignal[]
): BusinessDiagnosis {
  const stalledDeals = deals.filter(d => ['temperature', 'warm', 'hot'].includes(d.temperature) && d.status === 'active');
  const revenueAtRisk = stalledDeals.reduce((sum, d) => sum + (d.amount || 0), 0) * 0.4; // rough estimate
  
  const waitingConversations = conversations.filter(c => c.unread_count > 0);
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.is_completed);
  const highRiskSignals = financeSignals.filter(s => s.severity === 'critical' || s.severity === 'high');

  const reasons = [];
  if (stalledDeals.length > 0) reasons.push(`${stalledDeals.length} горячих сделок без движения`);
  if (waitingConversations.length > 0) reasons.push(`${waitingConversations.length} клиентов ждут ответа`);
  if (overdueTasks.length > 0) reasons.push(`${overdueTasks.length} важных задач просрочено`);

  const recommendations = [];
  if (waitingConversations.length > 0) recommendations.push({ title: 'Ответить клиентам', cta: 'Перейти в Inbox', action_type: 'go_inbox' });
  if (stalledDeals.length > 0) recommendations.push({ title: 'Пропушить сделки', cta: 'Открыть Kanban', action_type: 'go_clients' });
  if (overdueTasks.length > 0) recommendations.push({ title: 'Разобрать задачи', cta: 'Посмотреть задачи', action_type: 'go_tasks' });

  return {
    revenue_at_risk: revenueAtRisk,
    stalled_deals_count: stalledDeals.length,
    waiting_clients_count: waitingConversations.length,
    overdue_tasks_count: overdueTasks.length,
    finance_risks_count: highRiskSignals.length,
    reasons,
    recommended_actions: recommendations,
  };
}

// Missed Money Radar
export function findMissedMoneySignals(deals: Deal[], conversations: Conversation[]): MissedMoneySignal[] {
  const signals: MissedMoneySignal[] = [];
  
  const stalled = deals.filter(d => d.status === 'active' && d.temperature === 'hot' && d.amount && d.amount > 100000); // Demo logic
  stalled.slice(0, 3).forEach((d) => {
    signals.push({
      id: `signal_${d.id}`,
      workspace_id: d.workspace_id,
      title: 'Сделка без движения',
      lost_amount_estimate: d.amount || 0,
      reason: `${d.title} стоит без движения более 4 дней.`,
      recommended_action: 'Сгенерировать follow-up',
      severity: 'high',
      cta: 'Создать follow-up',
      deal_id: d.id,
      contact_id: d.contact_id,
      created_at: new Date().toISOString()
    });
  });

  return signals;
}

// AI Deal Room Analysis
export function analyzeDealRoom(deal: Deal, stage: PipelineStage | undefined, contact?: Contact): DealRoomAnalysis {
  let baseProb = stage?.probability || 10;
  if (deal.temperature === 'hot') baseProb += 20;
  if (deal.temperature === 'warm') baseProb += 10;
  if (contact?.ai_score && contact.ai_score > 80) baseProb += 15;

  const closureProb = Math.min(Math.max(baseProb, 5), 95);

  const risks = [];
  if (closureProb < 40) risks.push('Низкая вовлеченность');
  if (!deal.amount || deal.amount === 0) risks.push('Не определен бюджет');

  return {
    closure_probability: closureProb,
    risks: risks.length > 0 ? risks : ['Нет очевидных рисков'],
    blockers: ['Ждет коммерческое предложение'],
    next_best_action: 'Подготовить расчет стоимости',
    suggested_message: 'Здравствуйте! Я подготовил для вас предварительный расчет...',
    suggested_task: 'Отправить КП'
  };
}

// Revenue Recovery Campaigns
export function generateRecoveryCampaigns(contacts: Contact[], deals: Deal[]): RevenueRecoveryCampaign[] {
  const wonDeals = deals.filter(d => d.status === 'won');
  const pastClientsCount = wonDeals.length;
  const avgAmount = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / (pastClientsCount || 1);

  if (pastClientsCount > 0) {
    return [{
      id: 'campaign_1',
      clients_count: pastClientsCount * 3, // demo multiplier
      potential_revenue: avgAmount * pastClientsCount * 1.5,
      description: 'Апселл для текущих клиентов'
    }];
  }
  return [];
}

// Owner Mode Decisions
export function generateOwnerDecisions(diagnosis: BusinessDiagnosis): DecisionCard[] {
  const decisions: DecisionCard[] = [];
  if (diagnosis.finance_risks_count > 0) {
    decisions.push({
      id: 'dec_1',
      title: 'Устранить риск кассового разрыва',
      description: 'Найдены крупные неоплаченные счета на этой неделе.',
      urgency: 'high',
      cta: 'Детальный отчет',
      action_type: 'view_finance'
    });
  }
  if (diagnosis.stalled_deals_count > 0) {
    decisions.push({
      id: 'dec_2',
      title: 'Вмешательство в крупные переговоры',
      description: `${diagnosis.stalled_deals_count} сделок зависли на этапе "Предложение".`,
      urgency: 'medium',
      impact_amount: diagnosis.revenue_at_risk,
      cta: 'Посмотреть сделки',
      action_type: 'view_deals'
    });
  }
  return decisions;
}
