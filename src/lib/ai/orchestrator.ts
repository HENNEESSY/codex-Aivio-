import { AivioAIAnalysis, AIRun, Message, Contact, Conversation, UUID } from '@/types/aivio';
import { getDemoRuntime, patchDemoRuntime } from '../demo/runtime';
import { normalizeAIAnalysis } from './business-rules';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '../supabase/client';

export interface AIOrchestrationInput {
  workspace_id: UUID;
  channel: string;
  external_chat_id: string;
  sender_name: string;
  message_text: string;
}

export async function aiAnalyzeMessageDemo(input: AIOrchestrationInput): Promise<AIRun> {
  // Demo simulation of calling AI
  const analysis: AivioAIAnalysis = normalizeAIAnalysis({
    client_name: input.sender_name,
    intent: 'Запрос на консультацию',
    urgency: 'high',
    temperature: 'hot',
    should_create_deal: true,
    estimated_amount: 150000,
    next_action: 'Связаться с клиентом для уточнения деталей',
    suggested_reply: `Здравствуйте, ${input.sender_name}! Спасибо за обращение. Подскажите, когда вам будет удобно обсудить ваш проект детальнее?`
  });

  const run: AIRun = {
    id: `run-${Date.now()}`,
    workspace_id: input.workspace_id,
    analysis_result: analysis,
    status: 'succeeded',
    tokens_input: 450,
    tokens_output: 120,
    cost_estimate: 0.005,
    latency_ms: 1200,
    created_at: new Date().toISOString()
  };

  patchDemoRuntime(s => ({ aiRuns: [run, ...s.aiRuns] }));
  return run;
}
