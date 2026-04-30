import { AutonomyLevel, AIAction, AIActionSafetyLevel } from '@/types/aivio';

export const SAFE_ACTIONS = [
  'create_activity',
  'create_ai_summary',
  'create_low_priority_task',
  'create_draft_reply',
  'create_finance_signal',
  'enrich_contact'
];

export const UNSAFE_ACTIONS = [
  'send_message',
  'delete_entity',
  'mark_deal_won',
  'create_invoice',
  'charge_payment',
  'change_subscription',
  'connect_integration',
  'export_finance'
];

export function determineActionSafety(actionType: string): AIActionSafetyLevel {
  if (SAFE_ACTIONS.includes(actionType)) return 'safe';
  if (UNSAFE_ACTIONS.includes(actionType)) return 'unsafe';
  return 'needs_approval';
}

export function canExecuteAutomatically(actionType: string, autonomy: AutonomyLevel): boolean {
  const safety = determineActionSafety(actionType);
  
  if (autonomy === 'advice_only') return false;
  if (autonomy === 'drafts') return false; // never execute, only draft
  
  if (autonomy === 'with_confirmation') {
     return false; // must be confirmed
  }

  if (autonomy === 'autopilot') {
    return safety === 'safe'; // even autopilot cannot execute unsafe actions without human
  }

  return false;
}
