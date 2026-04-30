export type UUID = string;

export type Channel = 'telegram' | 'whatsapp' | 'instagram' | 'vk' | 'email' | 'site';
export type Urgency = 'low' | 'medium' | 'high';
export type Temperature = 'cold' | 'warm' | 'hot';
export type DealStageId = string;
export type AgentType = 'qualification' | 'analytics' | 'legal' | 'hr' | 'finance' | 'sales' | 'support' | 'custom';
export type AutonomyLevel = 'advice_only' | 'drafts' | 'with_confirmation' | 'autopilot';
export type MessageSenderType = 'client' | 'manager' | 'ai';
export type DealStatus = 'active' | 'won' | 'lost';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'viewer';

export interface AivioError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  userMessage: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: AivioError;
  source: 'supabase' | 'demo' | 'cache';
}

export interface Workspace {
  id: UUID;
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  email: string;
  name: string;
  role: WorkspaceRole;
  status: 'active' | 'invited' | 'suspended';
  invited_by?: UUID | null;
  created_at: string;
}

export interface Contact {
  id: UUID;
  workspace_id: UUID;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  ai_score?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface Conversation {
  id: UUID;
  workspace_id: UUID;
  contact_id: UUID;
  channel: Channel;
  external_chat_id: string;
  status: 'active' | 'closed';
  unread_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  workspace_id: UUID;
  sender_type: MessageSenderType;
  sender_id?: UUID | null; 
  content: string;
  external_message_id?: string | null;
  idempotency_key?: string | null;
  delivery_status?: 'received' | 'processed' | 'failed';
  created_at: string;
}

export interface OutboundMessage {
  id: UUID;
  workspace_id: UUID;
  conversation_id: UUID;
  message_id: UUID;
  channel: Channel;
  provider: string;
  status: 'queued' | 'sent' | 'failed' | 'cancelled';
  payload?: Record<string, unknown> | null;
  provider_response?: Record<string, unknown> | null;
  error_message?: string | null;
  attempts: number;
  sent_at?: string | null;
  created_at: string;
}

export interface Deal {
  id: UUID;
  workspace_id: UUID;
  contact_id: UUID;
  title: string;
  amount: number | null;
  stage_id: DealStageId;
  temperature: Temperature;
  status: DealStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface PipelineStage {
  id: DealStageId;
  workspace_id: UUID;
  name: string;
  color: string;
  position: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
}

export interface Task {
  id: UUID;
  workspace_id: UUID;
  contact_id?: UUID | null;
  deal_id?: UUID | null;
  title: string;
  description?: string | null;
  urgency: Urgency;
  due_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by?: UUID | null;
  source?: 'manual' | 'ai' | 'automation' | 'system';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface AIAgent {
  id: UUID;
  workspace_id: UUID;
  name: string;
  type: AgentType;
  role?: string | null;
  description?: string | null;
  status: 'active' | 'draft' | 'disabled';
  system_prompt: string;
  model: string;
  autonomy_level: AutonomyLevel;
  channels: Channel[];
  stats: {
    messages_processed: number;
    tasks_created: number;
    deals_found: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface AivioAIAnalysis {
  client_name: string | null;
  company: string | null;
  intent: string;
  budget: string | null;
  urgency: Urgency;
  temperature: Temperature;
  summary: string;
  next_action: string;
  suggested_reply: string;
  should_create_deal: boolean;
  deal_title: string | null;
  estimated_amount: number | null;
  risk_flags: string[];
  sentiment: Sentiment;
}

export interface AIRun {
  id: UUID;
  workspace_id: UUID;
  agent_id?: UUID | null;
  message_id?: UUID | null;
  analysis_result: AivioAIAnalysis | null;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  error_message?: string | null;
  tokens_input?: number;
  tokens_output?: number;
  cost_estimate?: number;
  latency_ms?: number;
  created_at: string;
}

export type AIActionSafetyLevel = 'safe' | 'needs_approval' | 'unsafe';

export interface AIAction {
  type: string;
  payload: Record<string, unknown>;
  safety_level?: AIActionSafetyLevel;
}

export interface AIOrchestrationInput {
  workspace_id: string;
  message_content: string;
  channel: string;
  sender_name?: string;
  business_memory?: BusinessMemory;
}

export interface AIOrchestrationResult {
  analysis: AivioAIAnalysis;
  actions: AIAction[];
}


export interface Activity {
  id: UUID;
  workspace_id: UUID;
  contact_id?: UUID | null;
  deal_id?: UUID | null;
  agent_id?: UUID | null;
  type: 'message_received' | 'message_sent' | 'deal_created' | 'deal_moved' | 'task_created' | 'task_completed' | 'ai_analysis' | 'finance_signal_resolved' | 'approval_approved' | 'approval_rejected' | string;
  title: string;
  body?: string | null;
  channel?: Channel | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface FinanceTransaction {
  id: UUID;
  workspace_id: UUID;
  type: 'income' | 'expense';
  status: 'actual' | 'expected' | 'pending' | 'cancelled';
  source_type: 'deal' | 'manual' | 'integration' | 'system';
  source_id?: string | null;
  direction: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  date: string;
  description?: string | null;
  deal_id?: UUID | null;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface FinanceSignal {
  id: UUID;
  workspace_id: UUID;
  deal_id?: UUID | null;
  type: 'critical' | 'high' | 'medium' | 'low';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  amount?: number | null;
  status: 'active' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface WorkspaceSettings {
  id: UUID;
  workspace_id: UUID;
  company_name: string;
  timezone: string;
  currency: string;
  language: string;
  working_hours: string;
  default_ai_model: string;
  auto_create_deals: boolean;
  auto_create_tasks: boolean;
  require_approval_for_replies: boolean;
  business_memory?: BusinessMemory | null;
  notifications: {
    new_lead: boolean;
    hot_client: boolean;
    overdue_task: boolean;
    ai_recommendation: boolean;
    finance_risk: boolean;
    channels: {
      email: boolean;
      telegram: boolean;
    };
  };
}

export interface WorkspaceSubscription {
  workspace_id: UUID;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'past_due' | 'canceled';
  period_end: string;
  usage: {
    ai_requests: number;
    messages: number;
    ai_agents: number;
    integrations: number;
  };
  limits: {
    ai_requests: number;
    messages: number;
    ai_agents: number;
    integrations: number;
  };
}

export interface Integration {
  id: string; 
  workspace_id: UUID;
  category: 'messenger' | 'crm' | 'finance' | 'marketplace' | 'automation' | 'analytics';
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  coming_soon?: boolean;
}

export interface Template {
  id: string;
  industry: string;
  name: string;
  description: string;
  tags: {
    stages_count: number;
    ai_employees_count: number;
    integrations_count: number;
  };
}

export interface AuditLog {
  id: UUID;
  workspace_id: UUID;
  actor_type: 'user' | 'ai' | 'system' | 'integration';
  actor_id: UUID | string;
  entity_type: string;
  entity_id: string;
  action: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface ApprovalRequest {
  id: UUID;
  workspace_id: UUID;
  agent_id?: UUID | null;
  contact_id?: UUID | null;
  deal_id?: UUID | null;
  type: 'reply' | 'task' | 'deal' | 'email' | 'invoice' | 'document' | 'stage_change' | 'integration_action';
  title: string;
  description?: string | null;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expires_at?: string | null;
  created_at: string;
}

export interface AutomationRule {
  id: UUID;
  workspace_id: UUID;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  status: 'active' | 'paused' | 'error';
  runs_count: number;
  last_run_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: UUID | null;
}

export interface BusinessMemory {
  description: string;
  services: string[];
  prices: string;
  min_check: string;
  tone_of_voice: string;
  faq: string;
  limits: string;
  objections: string;
  best_answers: string;
  forbidden_promises: string;
}

export interface BusinessDiagnosis {
  revenue_at_risk: number;
  stalled_deals_count: number;
  waiting_clients_count: number;
  overdue_tasks_count: number;
  finance_risks_count: number;
  reasons: string[];
  recommended_actions: { title: string; cta: string; action_type: string }[];
}

export interface MissedMoneySignal {
  id: string;
  workspace_id: UUID;
  title: string;
  lost_amount_estimate: number;
  reason: string;
  recommended_action: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cta: string;
  deal_id?: UUID | null;
  contact_id?: UUID | null;
  created_at: string;
}

export interface DealRoomAnalysis {
  closure_probability: number;
  risks: string[];
  blockers: string[];
  next_best_action: string;
  suggested_message?: string;
  suggested_task?: string;
}

export interface RevenueRecoveryCampaign {
  id: string;
  clients_count: number;
  potential_revenue: number;
  description: string;
}

export interface DecisionCard {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  impact_amount?: number;
  cta: string;
  action_type: string;
}

export interface NotificationEvent {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  type: string;
  title: string;
  body?: string | null;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high';
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
  read_at?: string | null;
}
