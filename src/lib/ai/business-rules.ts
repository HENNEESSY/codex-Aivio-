import { AivioAIAnalysis, Contact, Urgency, Temperature } from '@/types/aivio';

export function normalizeAIAnalysis(raw: any, contact?: Contact): AivioAIAnalysis {
  return {
    client_name: raw.client_name || contact?.name || null,
    company: raw.company || contact?.company || null,
    intent: typeof raw.intent === 'string' ? raw.intent : 'Неизвестное намерение',
    budget: typeof raw.budget === 'string' ? raw.budget : null,
    urgency: validateUrgency(raw.urgency),
    temperature: validateTemperature(raw.temperature),
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    next_action: typeof raw.next_action === 'string' ? raw.next_action : 'Связаться с клиентом',
    suggested_reply: typeof raw.suggested_reply === 'string' ? raw.suggested_reply : 'Спасибо за ваше обращение! Скоро свяжемся.',
    should_create_deal: !!raw.should_create_deal,
    deal_title: raw.deal_title || (raw.should_create_deal ? `Заявка от ${raw.client_name || 'клиента'}` : null),
    estimated_amount: typeof raw.estimated_amount === 'number' && raw.estimated_amount >= 0 ? raw.estimated_amount : null,
    risk_flags: Array.isArray(raw.risk_flags) ? raw.risk_flags.filter((r: any) => typeof r === 'string') : [],
    sentiment: validateSentiment(raw.sentiment)
  };
}

function validateUrgency(val: any): Urgency {
  return ['low', 'medium', 'high'].includes(val) ? val : 'medium';
}

function validateTemperature(val: any): Temperature {
  return ['cold', 'warm', 'hot'].includes(val) ? val : 'warm';
}

function validateSentiment(val: any): "positive" | "neutral" | "negative" {
  return ['positive', 'neutral', 'negative'].includes(val) ? val : 'neutral';
}

export function calculateAIScore(analysis: AivioAIAnalysis): number {
  let score = 50; // base score
  
  if (analysis.temperature === 'hot') score += 25;
  if (analysis.temperature === 'warm') score += 10;
  if (analysis.temperature === 'cold') score -= 15;
  
  if (analysis.urgency === 'high') score += 15;
  if (analysis.urgency === 'low') score -= 10;
  
  if (analysis.estimated_amount && analysis.estimated_amount > 0) score += 10;
  if (analysis.budget) score += 5;
  
  if (analysis.sentiment === 'positive') score += 5;
  if (analysis.sentiment === 'negative') score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

export function mapUrgencyToTaskPriority(urgency: Urgency): Urgency {
  return urgency;
}
