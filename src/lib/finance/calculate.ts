import { FinanceTransaction, Deal, PipelineStage, FinanceSignal } from '@/types/aivio';
import { addDays, isBefore, parseISO } from 'date-fns';

export function calculateFinanceMetrics(transactions: FinanceTransaction[]) {
  const actualTransactions = transactions.filter(t => t.status === 'actual');
  
  const income = actualTransactions
    .filter(t => t.direction === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const expenses = actualTransactions
    .filter(t => t.direction === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const profit = income - expenses;
  const margin = income > 0 ? (profit / income) * 100 : 0;
  
  return { income, expenses, profit, margin: Number(margin.toFixed(1)) };
}

export function detectCashGap(transactions: FinanceTransaction[]): FinanceSignal | null {
  // basic runway detection in expected transactions
  const expected = transactions.filter(t => t.status === 'expected' || t.status === 'pending');
  const expIncome = expected.filter(t => t.direction === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expExpense = expected.filter(t => t.direction === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  if (expExpense > expIncome) {
    return {
      id: 'generated-gap',
      workspace_id: transactions[0]?.workspace_id || '',
      type: 'high',
      severity: 'high',
      title: 'Возможен кассовый разрыв',
      message: 'Ожидаемые расходы превышают доходы.',
      status: 'active',
      created_at: new Date().toISOString()
    };
  }
  return null;
}
