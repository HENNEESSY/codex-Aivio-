import {
  Contact, Conversation, Message, Deal, Task, FinanceTransaction, FinanceSignal, AIAgent,
  Activity, PipelineStage, WorkspaceSettings, WorkspaceSubscription, Integration, WorkspaceMember,
  AuditLog, OutboundMessage, ApprovalRequest, AutomationRule, NotificationEvent, AIRun
} from '@/types/aivio';
import {
  demoActivities, demoAgents, demoContacts, demoConversations, demoDeals, demoFinanceSignals,
  demoMessages, demoPipelineStages, demoTasks, demoTransactions, demoMembers, demoSettings,
  demoSubscription, demoAutomations, demoNotifications, demoAuditLogs, demoOutboundMessages,
  demoApprovalRequests, DEMO_WORKSPACE_ID
} from './demo-data';

const RUNTIME_KEY = 'aivio_demo_runtime_v2';
const AI_EMPLOYEES_KEY = 'aivio_demo_ai_employees';

export interface DemoRuntimeState {
  workspaceId: string;
  members: WorkspaceMember[];
  contacts: Contact[];
  pipelineStages: PipelineStage[];
  deals: Deal[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  financeTransactions: FinanceTransaction[];
  financeSignals: FinanceSignal[];
  activities: Activity[];
  aiAgents: AIAgent[];
  aiRuns: AIRun[];
  auditLogs: AuditLog[];
  outboundMessages: OutboundMessage[];
  approvalRequests: ApprovalRequest[];
  automationRules: AutomationRule[];
  notifications: NotificationEvent[];
  settings: WorkspaceSettings;
  subscription: WorkspaceSubscription;
  integrations: Integration[];
  initializedAt: string;
  updatedAt: string;
}

export function getDemoRuntime(): DemoRuntimeState {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY);
    if (raw) {
      const state = JSON.parse(raw) as DemoRuntimeState;
      // Backward compatibility with older demo state
      if (!state.settings) {
         state.settings = demoSettings;
         state.subscription = demoSubscription;
         state.members = demoMembers;
         state.auditLogs = demoAuditLogs;
         state.outboundMessages = demoOutboundMessages;
         state.approvalRequests = demoApprovalRequests;
         state.automationRules = demoAutomations;
         state.notifications = demoNotifications;
         state.aiRuns = [];
         state.integrations = [];
      }
      return state;
    }
  } catch (e) {
    console.warn('Failed to parse demo runtime state', e);
  }

  // Load old AI agents if available
  let agents = demoAgents;
  try {
    const oldAgentsObj = localStorage.getItem(AI_EMPLOYEES_KEY);
    if (oldAgentsObj) {
      agents = JSON.parse(oldAgentsObj);
    }
  } catch(e) {}

  const defaultState: DemoRuntimeState = {
    workspaceId: DEMO_WORKSPACE_ID,
    members: demoMembers,
    contacts: demoContacts,
    pipelineStages: demoPipelineStages,
    deals: demoDeals,
    conversations: demoConversations,
    messages: demoMessages,
    tasks: demoTasks,
    financeTransactions: demoTransactions,
    financeSignals: demoFinanceSignals,
    activities: demoActivities,
    aiAgents: agents,
    aiRuns: [],
    auditLogs: demoAuditLogs,
    outboundMessages: demoOutboundMessages,
    approvalRequests: demoApprovalRequests,
    automationRules: demoAutomations,
    notifications: demoNotifications,
    settings: demoSettings,
    subscription: demoSubscription,
    integrations: [],
    initializedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveDemoRuntime(defaultState);
  return defaultState;
}

export function saveDemoRuntime(state: DemoRuntimeState) {
  try {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(state));
    // backward compatibility
    localStorage.setItem(AI_EMPLOYEES_KEY, JSON.stringify(state.aiAgents));
  } catch (e) {
    console.warn('Failed to stringify demo runtime state', e);
  }
}

export function patchDemoRuntime(mutator: (state: DemoRuntimeState) => Partial<DemoRuntimeState>) {
  const current = getDemoRuntime();
  const patch = mutator(current);
  const next = { ...current, ...patch };
  saveDemoRuntime(next);
  return next;
}

export function getDemoWorkspaceId() {
  return DEMO_WORKSPACE_ID;
}

export function generateDemoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Kept for backward compatibility mapping in earlier code
export function getDemoState() {
  return getDemoRuntime();
}

export function updateDemoState(updater: (state: any) => any) {
  patchDemoRuntime(updater);
}

export function getDemoAIAgents() {
  return getDemoRuntime().aiAgents;
}

export function saveDemoAIAgents(agents: AIAgent[]) {
  patchDemoRuntime(() => ({ aiAgents: agents }));
}
