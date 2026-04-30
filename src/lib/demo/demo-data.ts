import {
  UUID,
  Workspace,
  Contact,
  Conversation,
  Message,
  Deal,
  Task,
  FinanceTransaction,
  FinanceSignal,
  AIAgent,
  Activity,
  PipelineStage,
  WorkspaceSettings,
  WorkspaceSubscription,
  Integration,
  Template,
  WorkspaceMember,
  AuditLog,
  OutboundMessage,
  ApprovalRequest,
  AutomationRule,
  NotificationEvent
} from '@/types/aivio';
import { subDays, subHours, subMinutes, addDays } from 'date-fns';

export const DEMO_WORKSPACE_ID: UUID = 'demo-workspace-001';

const now = new Date();

export const demoWorkspace: Workspace = {
  id: DEMO_WORKSPACE_ID,
  name: 'Aivio Demo',
  created_at: subDays(now, 30).toISOString(),
};

export const demoMembers: WorkspaceMember[] = [
  { id: 'usr-001', workspace_id: DEMO_WORKSPACE_ID, user_id: 'u-1', email: 'owner@aivio.ru', name: 'Алексей Иванов', role: 'owner', status: 'active', created_at: subDays(now, 30).toISOString() },
  { id: 'usr-002', workspace_id: DEMO_WORKSPACE_ID, user_id: 'u-2', email: 'admin@aivio.ru', name: 'Мария Смирнова', role: 'admin', status: 'active', created_at: subDays(now, 29).toISOString() },
  { id: 'usr-003', workspace_id: DEMO_WORKSPACE_ID, user_id: 'u-3', email: 'manager@aivio.ru', name: 'Игорь Кузнецов', role: 'manager', status: 'active', created_at: subDays(now, 15).toISOString() },
  { id: 'usr-004', workspace_id: DEMO_WORKSPACE_ID, user_id: 'u-4', email: 'viewer@aivio.ru', name: 'Ольга Павлова', role: 'viewer', status: 'active', created_at: subDays(now, 10).toISOString() },
]

export const demoContacts: Contact[] = [
  { id: 'contact-001', workspace_id: DEMO_WORKSPACE_ID, name: 'Анна Мельникова', company: 'Lime Beauty', source: 'telegram', ai_score: 92, created_at: subDays(now, 10).toISOString(), updated_at: subHours(now, 2).toISOString() },
  { id: 'contact-002', workspace_id: DEMO_WORKSPACE_ID, name: 'Марина Лаврова', company: 'Студия красоты', source: 'whatsapp', ai_score: 67, created_at: subDays(now, 5).toISOString(), updated_at: subDays(now, 2).toISOString() },
  { id: 'contact-003', workspace_id: DEMO_WORKSPACE_ID, name: 'Иван Петров', company: 'Ремонт квартир', source: 'site', ai_score: 71, created_at: subDays(now, 20).toISOString(), updated_at: subDays(now, 15).toISOString() },
  { id: 'contact-004', workspace_id: DEMO_WORKSPACE_ID, name: 'Сергей Орлов', company: 'Орлов Консалт', source: 'email', ai_score: 58, created_at: subDays(now, 10).toISOString(), updated_at: subDays(now, 3).toISOString() },
  { id: 'contact-005', workspace_id: DEMO_WORKSPACE_ID, name: 'Наталья Козлова', company: 'TechNova', source: 'telegram', ai_score: 88, created_at: subDays(now, 7).toISOString(), updated_at: subHours(now, 1).toISOString() },
  { id: 'contact-006', workspace_id: DEMO_WORKSPACE_ID, name: 'Алексей Смирнов', company: 'Build&Co', source: 'whatsapp', ai_score: 34, created_at: subHours(now, 5).toISOString(), updated_at: subHours(now, 5).toISOString() },
  { id: 'contact-007', workspace_id: DEMO_WORKSPACE_ID, name: 'Елена Захарова', company: 'FlowNext', source: 'instagram', ai_score: 75, created_at: subDays(now, 4).toISOString(), updated_at: subDays(now, 1).toISOString() },
  { id: 'contact-008', workspace_id: DEMO_WORKSPACE_ID, name: 'Дмитрий Волков', company: 'EcoTrade', source: 'site', ai_score: 41, created_at: subHours(now, 12).toISOString(), updated_at: subHours(now, 12).toISOString() },
];

export const demoPipelineStages: PipelineStage[] = [
  { id: 'stage-1', workspace_id: DEMO_WORKSPACE_ID, name: 'Новый лид', color: '#00B0FF', position: 0, probability: 10, is_won: false, is_lost: false },
  { id: 'stage-2', workspace_id: DEMO_WORKSPACE_ID, name: 'Контакт', color: '#00E5FF', position: 1, probability: 20, is_won: false, is_lost: false },
  { id: 'stage-3', workspace_id: DEMO_WORKSPACE_ID, name: 'Квалификация', color: '#FFEA00', position: 2, probability: 40, is_won: false, is_lost: false },
  { id: 'stage-4', workspace_id: DEMO_WORKSPACE_ID, name: 'Предложение', color: '#FF9100', position: 3, probability: 60, is_won: false, is_lost: false },
  { id: 'stage-5', workspace_id: DEMO_WORKSPACE_ID, name: 'Переговоры', color: '#FF3D00', position: 4, probability: 80, is_won: false, is_lost: false },
  { id: 'stage-6', workspace_id: DEMO_WORKSPACE_ID, name: 'Выиграно', color: '#00E676', position: 5, probability: 100, is_won: true, is_lost: false },
  { id: 'stage-7', workspace_id: DEMO_WORKSPACE_ID, name: 'Проиграно', color: '#FF1744', position: 6, probability: 0, is_won: false, is_lost: true },
];

export const demoDeals: Deal[] = [
  { id: 'deal-001', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-001', title: 'Автоматизация продаж Lime Beauty', amount: 180000, stage_id: 'stage-4', temperature: 'hot', status: 'active', created_at: subDays(now, 10).toISOString(), updated_at: subHours(now, 2).toISOString() },
  { id: 'deal-002', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-002', title: 'CRM для Студии красоты', amount: 45000, stage_id: 'stage-2', temperature: 'warm', status: 'active', created_at: subDays(now, 5).toISOString(), updated_at: subDays(now, 2).toISOString() },
  { id: 'deal-003', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-003', title: 'Интеграция 1С для Ремонт квартир', amount: 85000, stage_id: 'stage-3', temperature: 'warm', status: 'active', created_at: subDays(now, 20).toISOString(), updated_at: subDays(now, 15).toISOString() },
  { id: 'deal-004', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-004', title: 'Консалтинговый пакет', amount: 220000, stage_id: 'stage-5', temperature: 'warm', status: 'active', created_at: subDays(now, 10).toISOString(), updated_at: subDays(now, 3).toISOString() },
  { id: 'deal-005', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-005', title: 'TechNova - Enterprise план', amount: 450000, stage_id: 'stage-4', temperature: 'hot', status: 'active', created_at: subDays(now, 7).toISOString(), updated_at: subHours(now, 1).toISOString() },
  { id: 'deal-006', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-006', title: 'Build&Co - базовая настройка', amount: 35000, stage_id: 'stage-1', temperature: 'cold', status: 'active', created_at: subHours(now, 5).toISOString(), updated_at: subHours(now, 5).toISOString() },
  { id: 'deal-007', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-007', title: 'FlowNext - полная автоматизация', amount: 320000, stage_id: 'stage-5', temperature: 'warm', status: 'active', created_at: subDays(now, 4).toISOString(), updated_at: subDays(now, 1).toISOString() },
  { id: 'deal-008', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-008', title: 'EcoTrade - стартовый пакет', amount: 28000, stage_id: 'stage-1', temperature: 'cold', status: 'active', created_at: subHours(now, 12).toISOString(), updated_at: subHours(now, 12).toISOString() },
];

export const demoConversations: Conversation[] = [
  { id: 'conv-001', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-001', channel: 'telegram', external_chat_id: 'tg_123', status: 'active', unread_count: 2, last_message_at: subMinutes(now, 15).toISOString(), created_at: subDays(now, 10).toISOString(), updated_at: subMinutes(now, 15).toISOString() },
  { id: 'conv-005', workspace_id: DEMO_WORKSPACE_ID, contact_id: 'contact-005', channel: 'telegram', external_chat_id: 'tg_456', status: 'active', unread_count: 0, last_message_at: subHours(now, 1).toISOString(), created_at: subDays(now, 7).toISOString(), updated_at: subHours(now, 1).toISOString() },
];

export const demoMessages: Message[] = [
  { id: 'msg-001', conversation_id: 'conv-001', workspace_id: DEMO_WORKSPACE_ID, sender_type: 'client', content: 'Здравствуйте! Нас интересует автоматизация продаж.', created_at: subDays(now, 1).toISOString() },
  { id: 'msg-002', conversation_id: 'conv-001', workspace_id: DEMO_WORKSPACE_ID, sender_type: 'manager', content: 'Добрый день, Анна! Готов обсудить детали. Какой у вас примерный бюджет?', created_at: subHours(now, 20).toISOString() },
  { id: 'msg-003', conversation_id: 'conv-001', workspace_id: DEMO_WORKSPACE_ID, sender_type: 'client', content: 'Планируем уложиться в 200 тысяч. Высылаю ТЗ.', created_at: subMinutes(now, 30).toISOString() },
  { id: 'msg-004', conversation_id: 'conv-001', workspace_id: DEMO_WORKSPACE_ID, sender_type: 'client', content: 'Подскажите, когда сможете посмотреть?', created_at: subMinutes(now, 15).toISOString() },
];

export const demoTasks: Task[] = [
  { id: 'task-001', workspace_id: DEMO_WORKSPACE_ID, title: 'Позвонить Анне Мельниковой', contact_id: 'contact-001', urgency: 'high', due_date: new Date(now.setHours(15, 0, 0, 0)).toISOString(), is_completed: false, created_at: subDays(now, 1).toISOString(), updated_at: subDays(now, 1).toISOString() },
  { id: 'task-002', workspace_id: DEMO_WORKSPACE_ID, title: 'Подготовить КП для TechNova', contact_id: 'contact-005', deal_id: 'deal-005', urgency: 'high', due_date: addDays(new Date(now.setHours(11, 0, 0, 0)), 1).toISOString(), is_completed: false, created_at: subHours(now, 5).toISOString(), updated_at: subHours(now, 5).toISOString(), source: 'ai' },
  { id: 'task-003', workspace_id: DEMO_WORKSPACE_ID, title: 'Встреча с Орловым', contact_id: 'contact-004', urgency: 'medium', due_date: addDays(new Date(now.setHours(14, 0, 0, 0)), 2).toISOString(), is_completed: false, created_at: subDays(now, 2).toISOString(), updated_at: subDays(now, 2).toISOString() },
];

export const demoAgents: AIAgent[] = [
  { id: 'agent-001', workspace_id: DEMO_WORKSPACE_ID, name: 'AI-квалификатор', type: 'qualification', role: 'Квалификация лидов', description: 'Отвечает на входящие, квалифицирует лиды', status: 'active', system_prompt: 'Ты бизнес-ассистент, твоя цель...', model: 'claude-3-5-sonnet', autonomy_level: 'drafts', channels: ['telegram', 'whatsapp'], stats: { messages_processed: 847, tasks_created: 142, deals_found: 89 }, created_at: subDays(now, 30).toISOString(), updated_at: subDays(now, 2).toISOString() },
  { id: 'agent-002', workspace_id: DEMO_WORKSPACE_ID, name: 'AI-аналитик', type: 'analytics', role: 'Анализ сообщений', description: 'Анализирует сообщения и данные', status: 'active', system_prompt: 'Твоя задача искать инсайты...', model: 'gpt-4o', autonomy_level: 'advice_only', channels: [], stats: { messages_processed: 234, tasks_created: 34, deals_found: 12 }, created_at: subDays(now, 28).toISOString(), updated_at: subDays(now, 5).toISOString() },
  { id: 'agent-003', workspace_id: DEMO_WORKSPACE_ID, name: 'AI-финансист', type: 'finance', role: 'Контроль рисков', description: 'Следит за финансовыми рисками', status: 'active', system_prompt: 'Следи за показателями...', model: 'claude-3-5-sonnet', autonomy_level: 'autopilot', channels: [], stats: { messages_processed: 0, tasks_created: 56, deals_found: 0 }, created_at: subDays(now, 15).toISOString(), updated_at: subDays(now, 1).toISOString() },
];

export const demoActivities: Activity[] = [
  { id: 'act-001', workspace_id: DEMO_WORKSPACE_ID, title: 'Изменение стадии: TechNova', body: 'Сделка переведена на стадию "Предложение"', deal_id: 'deal-005', type: 'deal_moved', created_at: subHours(now, 1).toISOString() },
  { id: 'act-003', workspace_id: DEMO_WORKSPACE_ID, title: 'AI Анализ: Высокая вероятность сделки', body: 'AI-аналитик присвоил Temperature = Hot для клиента Анна Мельникова', agent_id: 'agent-002', contact_id: 'contact-001', type: 'ai_analysis', created_at: subMinutes(now, 29).toISOString() },
];

export const demoFinanceSignals: FinanceSignal[] = [
  { id: 'fs-001', workspace_id: DEMO_WORKSPACE_ID, deal_id: 'deal-004', type: 'critical', severity: 'critical', title: 'Сделка с Орловым без ответа 3 дня — риск срыва', message: 'Клиент не отвечает 3 дня, возможна потеря.', amount: 220000, status: 'active', created_at: subDays(now, 1).toISOString() },
  { id: 'fs-002', workspace_id: DEMO_WORKSPACE_ID, type: 'high', severity: 'high', title: 'Кассовый разрыв вероятен через 18 дней', message: 'Расходная часть превышает ожидаемые поступления.', status: 'active', created_at: subDays(now, 2).toISOString() },
];

export const demoTransactions: FinanceTransaction[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `trans-${i}`, workspace_id: DEMO_WORKSPACE_ID, type: i % 3 === 0 ? 'expense' : 'income', amount: i % 3 === 0 ? Math.floor(Math.random() * 100000) : Math.floor(Math.random() * 200000), category: i % 3 === 0 ? 'Сервисы' : 'Оплата счетов', date: subDays(now, i * 2).toISOString(), description: i % 3 === 0 ? 'Оплата серверов' : 'Входящий платеж',
  status: 'actual', source_type: 'manual', direction: i % 3 === 0 ? 'expense' : 'income', currency: 'RUB'
}));

export const demoTemplates: Template[] = [
  { id: 'tpl-1', industry: 'IT-аутсорсинг', name: 'IT Agency', description: 'Полный цикл работы с IT клиентами.', tags: { stages_count: 6, ai_employees_count: 2, integrations_count: 3 } },
];

export const demoSettings: WorkspaceSettings = {
  id: 'set-001', workspace_id: DEMO_WORKSPACE_ID, company_name: 'Aivio Demo', timezone: 'Europe/Moscow', currency: 'RUB', language: 'ru', working_hours: '09:00-18:00', default_ai_model: 'claude-3-5-sonnet', auto_create_deals: true, auto_create_tasks: true, require_approval_for_replies: true,
  business_memory: {
    description: 'Мы консалтинговое IT агентство. Занимаемся внедрением AI и CRM систем.',
    services: ['Интеграция CRM (от 50к)', 'AI-ассистенты (от 80к)', 'Технический аудит (30к)'],
    prices: 'Средний чек 150 000 руб.',
    min_check: 'Минимум 30 000 руб.',
    tone_of_voice: 'Профессиональный, дружелюбный, на Вы.',
    faq: 'Сроки - от 2 недель. Гарантии - 1 год поддержки.',
    limits: 'Не занимаемся дизайном.',
    objections: 'Дорого -> показываем ROI. Долго -> разбиваем на этапы.',
    best_answers: 'Всегда предлагать созвон в первую очередь.',
    forbidden_promises: 'Никогда не обещать 100% конверсию или точные сроки без аудита.'
  },
  notifications: { new_lead: true, hot_client: true, overdue_task: true, ai_recommendation: true, finance_risk: true, channels: { email: true, telegram: true } }
};

export const demoSubscription: WorkspaceSubscription = {
  workspace_id: DEMO_WORKSPACE_ID, plan: 'pro', status: 'active', period_end: addDays(now, 12).toISOString(),
  usage: { ai_requests: 8400, messages: 1520, ai_agents: 3, integrations: 2 },
  limits: { ai_requests: 10000, messages: 5000, ai_agents: 10, integrations: 999 }
};

export const demoAutomations: AutomationRule[] = [
  { id: 'auto-1', workspace_id: DEMO_WORKSPACE_ID, name: 'Новый лид → Уведомление', description: 'Отправлять уведомление о новом лиде', trigger_type: 'new_message', trigger_config: {}, action_type: 'send_notification', action_config: {}, status: 'active', runs_count: 124, created_at: subDays(now, 30).toISOString(), updated_at: subDays(now, 30).toISOString() },
  { id: 'auto-2', workspace_id: DEMO_WORKSPACE_ID, name: 'Горячий клиент → Задача менеджеру', description: 'Если AI ставит Hot', trigger_type: 'new_hot_lead', trigger_config: {}, action_type: 'create_task', action_config: {}, status: 'active', runs_count: 58, created_at: subDays(now, 29).toISOString(), updated_at: subDays(now, 29).toISOString() },
];

export const demoNotifications: NotificationEvent[] = [
  { id: 'notif-1', workspace_id: DEMO_WORKSPACE_ID, user_id: 'usr-001', type: 'finance_risk', title: 'Кассовый разрыв вероятен', body: 'Расходная часть превышает поступления через 18 дней', status: 'unread', priority: 'high', created_at: subDays(now, 2).toISOString() },
  { id: 'notif-2', workspace_id: DEMO_WORKSPACE_ID, user_id: 'usr-001', type: 'hot_lead', title: 'Новый горячий лид', body: 'TechNova интересуется Enterprise планом', status: 'read', priority: 'high', created_at: subDays(now, 7).toISOString(), read_at: subDays(now, 6).toISOString() },
];

export const demoAuditLogs: AuditLog[] = [
  { id: 'al-1', workspace_id: DEMO_WORKSPACE_ID, actor_type: 'user', actor_id: 'usr-001', entity_type: 'deal', entity_id: 'deal-005', action: 'update_stage', created_at: subHours(now, 1).toISOString() }
];

export const demoOutboundMessages: OutboundMessage[] = [];
export const demoApprovalRequests: ApprovalRequest[] = [
  { id: 'ar-1', workspace_id: DEMO_WORKSPACE_ID, agent_id: 'agent-001', contact_id: 'contact-001', deal_id: 'deal-001', type: 'reply', title: 'Одобрить ответ', description: 'AI хочет отправить предложение по бюджету', payload: { action_type: 'send_message', content: 'Да, мы можем уложиться в 200 тысяч.' }, status: 'pending', created_at: subMinutes(now, 20).toISOString() }
];
