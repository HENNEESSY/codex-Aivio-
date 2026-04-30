import { isSupabaseConfigured, getSupabaseBrowserClient } from '../supabase/client';
import { getDemoRuntime, patchDemoRuntime } from '../demo/runtime';
import { DEMO_WORKSPACE_ID, demoTemplates } from '../demo/demo-data';
import {
  AIAgent, Conversation, Message, Contact, Deal, Task, PipelineStage, UUID,
  Activity, FinanceTransaction, FinanceSignal, Template, WorkspaceMember, AuditLog,
  ApprovalRequest, AutomationRule, NotificationEvent, OutboundMessage, WorkspaceSettings,
  WorkspaceSubscription, Integration, AIRun, AivioAIAnalysis, DealStatus
} from '@/types/aivio';

// --- UTILS ---
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createAuditLog(input: Partial<AuditLog>): Promise<void> {
  const newLog = {
    ...input,
    id: `al-${Date.now()}`,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString()
  } as AuditLog;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('audit_logs').insert([newLog]);
      return;
    } catch (e) {
      console.warn("Fallback to demo createAuditLog:", e);
    }
  }
  patchDemoRuntime(s => ({ auditLogs: [newLog, ...s.auditLogs] }));
}

export async function createActivity(input: Partial<Activity>) {
  const newAct = {
    ...input,
    id: `act-${Date.now()}`,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString()
  } as Activity;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('activities').insert([newAct]).select().single();
      return data as Activity;
    } catch(e) {
      console.warn("Fallback createActivity", e);
    }
  }
  patchDemoRuntime(s => ({ activities: [newAct, ...s.activities] }));
  return newAct;
}

export async function getActivities(workspaceId?: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('activities').select('*').eq('workspace_id', workspaceId || DEMO_WORKSPACE_ID).order('created_at', { ascending: false }).limit(30);
      return (data || []) as Activity[];
    } catch(e) {}
  }
  await delay(200);
  return getDemoRuntime().activities.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// --- WORKSPACE & SETTINGS & MEMBERS ---
export async function getWorkspaceMembers(workspaceId: UUID): Promise<WorkspaceMember[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('workspace_members').select('*').eq('workspace_id', workspaceId);
      if (data) return data as WorkspaceMember[];
    } catch(e) {}
  }
  await delay(200);
  return getDemoRuntime().members;
}

export async function getWorkspaceSettings(workspaceId: UUID): Promise<WorkspaceSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('workspace_settings').select('*').eq('workspace_id', workspaceId).single();
      if (data) return data as WorkspaceSettings;
    } catch(e) {}
  }
  return getDemoRuntime().settings;
}

export async function updateWorkspaceSettings(workspaceId: UUID, patch: Partial<WorkspaceSettings>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('workspace_settings').update(patch).eq('workspace_id', workspaceId);
      await createAuditLog({ workspace_id: workspaceId, actor_type: 'user', actor_id: 'current', entity_type: 'settings', entity_id: workspaceId, action: 'update', after: patch });
      return;
    } catch(e) {}
  }
  patchDemoRuntime(s => ({ settings: { ...s.settings, ...patch } }));
}

export async function getSubscription(workspaceId: UUID): Promise<WorkspaceSubscription> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('workspace_subscriptions').select('*').eq('workspace_id', workspaceId).single();
      if (data) return data as WorkspaceSubscription;
    } catch(e) {}
  }
  return getDemoRuntime().subscription;
}

// --- AI AGENTS ---
export async function getAIAgents(workspaceId?: string): Promise<AIAgent[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('ai_agents').select('*').is('deleted_at', null).eq('workspace_id', workspaceId || DEMO_WORKSPACE_ID);
      return (data || []) as AIAgent[];
    } catch (e) {}
  }
  await delay(300);
  return getDemoRuntime().aiAgents.filter(a => !a.deleted_at);
}

export async function createAIAgent(input: Partial<AIAgent>, actorId: string = 'current_user'): Promise<AIAgent> {
  const newAgent = {
    ...input,
    id: `agent-${Date.now()}`,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stats: { messages_processed: 0, tasks_created: 0, deals_found: 0 },
  } as AIAgent;

  let savedAgent = newAgent;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('ai_agents').insert([newAgent]).select().single();
      if (data) savedAgent = data as AIAgent;
    } catch (e) {}
  } else {
    await delay(300);
    patchDemoRuntime(s => ({ aiAgents: [...s.aiAgents, newAgent] }));
  }

  await createAuditLog({ workspace_id: savedAgent.workspace_id, actor_type: 'user', actor_id: actorId, entity_type: 'ai_agent', entity_id: savedAgent.id, action: 'create', after: savedAgent as any });
  return savedAgent;
}

export async function updateAIAgent(id: UUID, patch: Partial<AIAgent>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('ai_agents').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
      await createAuditLog({ workspace_id: patch.workspace_id || DEMO_WORKSPACE_ID, actor_type: 'user', actor_id: 'current', entity_type: 'ai_agent', entity_id: id, action: 'update', after: patch as any });
      return;
    } catch (e) {}
  }
  await delay(200);
  patchDemoRuntime(s => ({
    aiAgents: s.aiAgents.map(a => a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a)
  }));
}

export async function deleteAIAgent(id: UUID): Promise<void> {
  const deletedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('ai_agents').update({ deleted_at: deletedAt, deleted_by: 'current_user', updated_at: deletedAt }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    aiAgents: s.aiAgents.map(a => a.id === id ? { ...a, deleted_at: deletedAt, deleted_by: 'current_user', status: 'disabled' } : a)
  }));
}

export async function toggleAIAgentStatus(id: UUID, status: 'active' | 'draft' | 'disabled'): Promise<void> {
  await updateAIAgent(id, { status });
}

// --- INBOX ---
export async function getInboxBootstrap(workspaceId?: string) {
  const wId = workspaceId || DEMO_WORKSPACE_ID;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const [convs, msgs, runs] = await Promise.all([
        supabase.from('conversations').select(`*, contacts(*)`).is('deleted_at', null).eq('workspace_id', wId).order('last_message_at', { ascending: false }),
        supabase.from('messages').select('*').eq('workspace_id', wId).order('created_at', { ascending: true }),
        supabase.from('ai_runs').select('*').eq('workspace_id', wId).order('created_at', { ascending: false })
      ]);
      return { conversations: convs.data || [], messages: msgs.data || [], aiRuns: runs.data || [] };
    } catch (e) {}
  }
  await delay(300);
  const state = getDemoRuntime();
  const enhancedConvs = state.conversations.filter(c => !c.deleted_at).map(c => ({
    ...c,
    contacts: state.contacts.find(ct => ct.id === c.contact_id)
  }));
  return { conversations: enhancedConvs, messages: state.messages, aiRuns: state.aiRuns };
}

export async function sendManagerReply(conversationId: UUID, content: string): Promise<Message> {
  const newMsg = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    workspace_id: DEMO_WORKSPACE_ID,
    sender_type: 'manager' as const,
    content,
    delivery_status: 'processed' as const,
    created_at: new Date().toISOString()
  };

  const outbound = {
    id: `out-${Date.now()}`,
    workspace_id: DEMO_WORKSPACE_ID,
    conversation_id: conversationId,
    message_id: newMsg.id,
    channel: 'telegram' as any, // resolved later
    provider: 'telegram',
    status: 'sent' as const,
    attempts: 1,
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('messages').insert([newMsg]).select().single();
      await supabase.from('outbound_messages').insert([outbound]);
      return data as Message;
    } catch (e) {}
  }

  await delay(300);
  patchDemoRuntime(s => ({
    messages: [...s.messages, newMsg as Message],
    outboundMessages: [...s.outboundMessages, outbound as OutboundMessage],
    conversations: s.conversations.map(c => c.id === conversationId ? { ...c, last_message_at: newMsg.created_at } : c)
  }));
  await createActivity({ title: 'Менеджер ответил', type: 'message_sent', channel: 'telegram', metadata: { conversation_id: conversationId } });
  return newMsg as Message;
}

export async function markConversationRead(id: UUID) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient();
    await supabase.from('conversations').update({ unread_count: 0 }).eq('id', id);
    return;
  }
  patchDemoRuntime(s => ({
    conversations: s.conversations.map(c => c.id === id ? { ...c, unread_count: 0 } : c)
  }));
}

// --- CLIENTS & DEALS ---
export async function getClientsBootstrap(workspaceId?: string) {
  const wId = workspaceId || DEMO_WORKSPACE_ID;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const [stages, deals, contacts] = await Promise.all([
        supabase.from('pipeline_stages').select('*').eq('workspace_id', wId).order('position', { ascending: true }),
        supabase.from('deals').select('*, contacts(*)').is('deleted_at', null).eq('workspace_id', wId).order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').is('deleted_at', null).eq('workspace_id', wId).order('created_at', { ascending: false })
      ]);
      return { pipelineStages: stages.data || [], deals: deals.data || [], contacts: contacts.data || [] };
    } catch (e) {}
  }
  await delay(300);
  const state = getDemoRuntime();
  const enhancedDeals = state.deals.filter(d => !d.deleted_at).map(d => ({
    ...d,
    contacts: state.contacts.find(c => c.id === d.contact_id)
  }));
  return { pipelineStages: state.pipelineStages, deals: enhancedDeals, contacts: state.contacts.filter(c => !c.deleted_at) };
}

export async function createDeal(input: Partial<Deal>, isAI: boolean = false): Promise<Deal> {
  const newDeal = {
    ...input,
    id: `deal-${Date.now()}`,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active'
  } as Deal;

  let saved = newDeal;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('deals').insert([newDeal]).select().single();
      saved = data as Deal;
    } catch(e) {}
  } else {
    await delay(300);
    patchDemoRuntime(s => ({ deals: [newDeal, ...s.deals] }));
  }

  await createActivity({ title: `Новая сделка: ${newDeal.title}`, type: 'deal_created', deal_id: saved.id, metadata: { ai_generated: isAI } });
  await createAuditLog({ workspace_id: saved.workspace_id, actor_type: isAI ? 'ai' : 'user', actor_id: isAI ? 'system' : 'current_user', entity_type: 'deal', entity_id: saved.id, action: 'create' });
  return saved;
}

export async function updateDeal(id: UUID, patch: Partial<Deal>) {
  const updatePayload = { ...patch, updated_at: new Date().toISOString() };
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('deals').update(updatePayload).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    deals: s.deals.map(d => d.id === id ? { ...d, ...updatePayload } : d)
  }));
}

export async function moveDealToStage(dealId: UUID, stageId: string, stage: PipelineStage) {
  const status: DealStatus = stage.is_won ? 'won' : stage.is_lost ? 'lost' : 'active';
  await updateDeal(dealId, { stage_id: stageId, status });
  await createActivity({ title: `Сделка переведена этап: ${stage.name}`, type: 'deal_moved', deal_id: dealId });
  await createAuditLog({ workspace_id: stage.workspace_id, actor_type: 'user', actor_id: 'current_user', entity_type: 'deal', entity_id: dealId, action: 'move_stage', after: { stage_id: stageId, status } });
}

// --- TASKS ---
export async function getTasks(workspaceId: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('tasks').select('*').is('deleted_at', null).eq('workspace_id', workspaceId);
      return (data || []) as Task[];
    } catch (e) {}
  }
  await delay(200);
  return getDemoRuntime().tasks.filter(t => !t.deleted_at);
}

export async function createTask(input: Partial<Task>, source: 'manual' | 'ai' | 'automation' | 'system' = 'manual'): Promise<Task> {
  const newTask = {
    ...input,
    id: `task-${Date.now()}`,
    source,
    is_completed: false,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Task;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('tasks').insert([newTask]).select().single();
      return data as Task;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({ tasks: [newTask, ...s.tasks] }));
  await createActivity({ title: `Новая задача: ${newTask.title}`, type: 'task_created', deal_id: newTask.deal_id });
  return newTask;
}

export async function completeTask(taskId: UUID) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('tasks').update({ is_completed: true, completed_at: new Date().toISOString(), completed_by: 'current_user', updated_at: new Date().toISOString() }).eq('id', taskId);
    } catch (e) {}
  } else {
    patchDemoRuntime(s => ({
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, is_completed: true, completed_at: new Date().toISOString(), completed_by: 'current_user' } : t)
    }));
  }
  await createActivity({ title: 'Задача выполнена', type: 'task_completed', metadata: { task_id: taskId } });
}

// --- FINANCE ---
export async function getFinanceBootstrap(workspaceId?: string) {
  const wId = workspaceId || DEMO_WORKSPACE_ID;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const [tRes, sRes] = await Promise.all([
        supabase.from('finance_transactions').select('*').is('deleted_at', null).eq('workspace_id', wId),
        supabase.from('finance_signals').select('*').eq('workspace_id', wId)
      ]);
      return { transactions: (tRes.data || []) as FinanceTransaction[], signals: (sRes.data || []) as FinanceSignal[] };
    } catch (e) {}
  }
  await delay(300);
  const s = getDemoRuntime();
  return { transactions: s.financeTransactions.filter(t => !t.deleted_at), signals: s.financeSignals };
}

export async function dismissFinanceSignal(id: UUID) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('finance_signals').update({ status: 'dismissed' }).eq('id', id);
      return;
    } catch(e) {}
  }
  patchDemoRuntime(s => ({
    financeSignals: s.financeSignals.map(si => si.id === id ? { ...si, status: 'dismissed' } : si)
  }));
}

// --- COMMAND CENTER ---
export async function getCommandCenterBootstrap(workspaceId?: string) {
  const wId = workspaceId || DEMO_WORKSPACE_ID;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const [dealsRes, pipelineRes, tasksRes, convRes, financeRes] = await Promise.all([
        supabase.from('deals').select('*').is('deleted_at', null).eq('workspace_id', wId),
        supabase.from('pipeline_stages').select('*').eq('workspace_id', wId).order('position', {ascending: true}),
        supabase.from('tasks').select('*').is('deleted_at', null).eq('is_completed', false).eq('workspace_id', wId),
        supabase.from('conversations').select('*').is('deleted_at', null).eq('workspace_id', wId),
        supabase.from('finance_signals').select('*').eq('workspace_id', wId).in('status', ['active'])
      ]);
      return { 
        deals: dealsRes.data || [], 
        stages: pipelineRes.data || [], 
        tasks: tasksRes.data || [],
        conversations: convRes.data || [],
        financeSignals: financeRes.data || []
      };
    } catch (e) {}
  }
  await delay(200);
  const s = getDemoRuntime();
  return { 
    deals: s.deals.filter(d => !d.deleted_at), 
    stages: s.pipelineStages, 
    tasks: s.tasks.filter(t => !t.deleted_at && !t.is_completed),
    conversations: s.conversations.filter(c => !c.deleted_at),
    financeSignals: s.financeSignals.filter(s => s.status === 'active')
  };
}

// --- AUTOMATIONS & INTEGRATIONS & APPROVALS ---
export async function getIntegrations(workspaceId?: string): Promise<Integration[]> {
  await delay(200);
  return getDemoRuntime().integrations;
}

export async function toggleIntegration(id: string, enabled: boolean) {
  patchDemoRuntime(s => {
    let existing = s.integrations.find(i => i.id === id);
    if (!existing) {
      existing = { id, workspace_id: DEMO_WORKSPACE_ID, category: 'messenger', name: id, description: '', status: enabled ? 'connected' : 'disconnected' };
      return { integrations: [...s.integrations, existing] };
    }
    return {
      integrations: s.integrations.map(i => i.id === id ? { ...i, status: enabled ? 'connected' : 'disconnected' } : i)
    };
  });
  await createActivity({ title: enabled ? `Интеграция подключена: ${id}` : `Интеграция отключена: ${id}`, type: 'system' });
}

export async function getAutomations(workspaceId?: string): Promise<AutomationRule[]> {
  await delay(200);
  return getDemoRuntime().automationRules;
}

export async function getTemplates() {
  await delay(200);
  return demoTemplates;
}

export async function applyTemplate(id: string) {
  await delay(400);
  const template = demoTemplates.find(t => t.id === id);
  
  if (template) {
    patchDemoRuntime((s: any) => {
      // Very basic simulation: we rename the first few stages if we want, or just set business memory
      const newSettings = { ...s.settings };
      if (!newSettings.business_memory) {
         newSettings.business_memory = { industry: template.industry, services: [], tone_of_voice: 'professional', common_objections: [] };
      } else {
         newSettings.business_memory.industry = template.industry;
      }
      return { settings: newSettings };
    });
  }


  await createActivity({ title: `Шаблон применён: ${template?.name || id}`, type: 'system' });
}

// --- MISSING REST OF API ---

export async function createContact(input: Partial<Contact>): Promise<Contact> {
  const newContact = {
    ...input,
    id: `contact-${Date.now()}`,
    workspace_id: input.workspace_id || DEMO_WORKSPACE_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Contact;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('contacts').insert([newContact]).select().single();
      return data as Contact;
    } catch(e) {}
  }
  await delay(200);
  patchDemoRuntime(s => ({ contacts: [newContact, ...s.contacts] }));
  await createAuditLog({ workspace_id: newContact.workspace_id, actor_type: 'user', actor_id: 'current', entity_type: 'contact', entity_id: newContact.id, action: 'create' });
  return newContact;
}

export async function updateContact(id: UUID, patch: Partial<Contact>): Promise<void> {
  const updatePayload = { ...patch, updated_at: new Date().toISOString() };
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('contacts').update(updatePayload).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    contacts: s.contacts.map(c => c.id === id ? { ...c, ...updatePayload } : c)
  }));
}

export async function deleteContact(id: UUID): Promise<void> {
  const deletedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('contacts').update({ deleted_at: deletedAt, deleted_by: 'current_user' }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    contacts: s.contacts.map(c => c.id === id ? { ...c, deleted_at: deletedAt, deleted_by: 'current_user' } : c)
  }));
}

export async function deleteDeal(id: UUID): Promise<void> {
  const deletedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('deals').update({ deleted_at: deletedAt, deleted_by: 'current_user' }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    deals: s.deals.map(c => c.id === id ? { ...c, deleted_at: deletedAt, deleted_by: 'current_user' } : c)
  }));
}

export async function deleteTask(id: UUID): Promise<void> {
  const deletedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('tasks').update({ deleted_at: deletedAt, deleted_by: 'current_user' }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    tasks: s.tasks.map(c => c.id === id ? { ...c, deleted_at: deletedAt, deleted_by: 'current_user' } : c)
  }));
}

export async function getApprovalRequests(workspaceId?: string): Promise<ApprovalRequest[]> {
  const wId = workspaceId || DEMO_WORKSPACE_ID;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('approval_requests').select('*').eq('workspace_id', wId).order('created_at', { ascending: false });
      return (data || []) as ApprovalRequest[];
    } catch (e) {}
  }
  await delay(200);
  return getDemoRuntime().approvalRequests;
}

export async function approveRequest(id: UUID): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('approval_requests').update({ status: 'approved' }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    approvalRequests: s.approvalRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r)
  }));
  await createActivity({ title: 'Задача/Действие подтверждено', type: 'approval_approved' });
}

export async function rejectRequest(id: UUID): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from('approval_requests').update({ status: 'rejected' }).eq('id', id);
      return;
    } catch (e) {}
  }
  patchDemoRuntime(s => ({
    approvalRequests: s.approvalRequests.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
  }));
  await createActivity({ title: 'Действие отклонено', type: 'approval_rejected' });
}

export async function expireApprovalRequests(workspaceId?: string): Promise<void> {
  // Mock function for simulating background expiry
}
