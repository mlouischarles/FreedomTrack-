
import { User, Budget, Expense, SavingsGoal } from '../types';

const STORAGE_KEYS = {
  USER: 'ft_user',
  BUDGET: 'ft_budget',
  EXPENSES: 'ft_expenses',
  GOAL: 'ft_goal'
};

export const db = {
  // Authentication
  register: (username: string): User => {
    const user = { id: Math.random().toString(36).substr(2, 9), username };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Budget & Income
  saveBudget: (budget: Budget) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  },

  getBudget: (): Budget => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
    
    if (!stored) {
      const defaultBudget: Budget = { 
        amount: 0, 
        income: 0, 
        month: nowMonth,
        rolloverEnabled: false
      };
      return defaultBudget;
    }

    const budget: Budget = JSON.parse(stored);

    // Month Transition Logic
    if (budget.month !== nowMonth) {
      // Archive happens naturally as Dashboard filters by budget.month
      // We update the budget context to the new month but keep user settings (income, limit, rollover toggle)
      const transitionedBudget = {
        ...budget,
        month: nowMonth
      };
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(transitionedBudget));
      return transitionedBudget;
    }

    return budget;
  },

  // Rollover Calculation
  getRolloverAmount: (currentMonth: string): number => {
    const expenses = db.getExpenses();
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!stored) return 0;
    
    const budget: Budget = JSON.parse(stored);
    if (!budget.rolloverEnabled) return 0;

    // Determine previous month string (YYYY-MM)
    const [year, month] = currentMonth.split('-').map(Number);
    // JS Date month is 0-indexed. 
    // If currentMonth is 2024-06 (June), month is 6. 
    // Previous month (May) is index 4.
    // Date(2024, 6 - 2, 1) -> Date(2024, 4, 1) -> May 1st.
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = prevDate.toISOString().slice(0, 7);

    const prevMonthExpenses = expenses.filter(e => e.date.startsWith(prevMonthStr));
    const prevSpent = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // As per user requirement: assume same budget limit applied last month if not found.
    const surplus = budget.amount - prevSpent;
    return surplus > 0 ? surplus : 0;
  },

  // Savings Goal
  saveGoal: (goal: SavingsGoal) => {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  },

  getGoal: (): SavingsGoal | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.GOAL);
    return stored ? JSON.parse(stored) : null;
  },

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>): Expense => {
    const newExpense = { ...expense, id: Math.random().toString(36).substr(2, 9) };
    const expenses = db.getExpenses();
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExpense;
  },

  getExpenses: (): Expense[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return stored ? JSON.parse(stored) : [];
  },

  deleteExpense: (id: string) => {
    const expenses = db.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }
};
