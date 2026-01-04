
import { User, Budget, Expense, SavingsGoal, SavingsQuest, SpendingPersona } from '../types';

const STORAGE_KEYS = {
  USER: 'ft_user',
  BUDGET: 'ft_budget',
  EXPENSES: 'ft_expenses',
  GOAL: 'ft_goal',
  QUEST: 'ft_active_quest',
  PERSONA: 'ft_persona'
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

  // Budget
  saveBudget: (budget: Budget) => localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget)),
  getBudget: (): Budget => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!stored) return { amount: 0, income: 0, month: nowMonth, rolloverEnabled: false };
    const budget: Budget = JSON.parse(stored);
    if (budget.month !== nowMonth) {
      const transitioned = { ...budget, month: nowMonth };
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(transitioned));
      return transitioned;
    }
    return budget;
  },

  // Rollover
  getRolloverAmount: (currentMonth: string): number => {
    const expenses = db.getExpenses();
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!stored) return 0;
    const budget: Budget = JSON.parse(stored);
    if (!budget.rolloverEnabled) return 0;
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = prevDate.toISOString().slice(0, 7);
    const prevSpent = expenses.filter(e => e.date.startsWith(prevMonthStr)).reduce((sum, e) => sum + e.amount, 0);
    const surplus = budget.amount - prevSpent;
    return surplus > 0 ? surplus : 0;
  },

  // Savings Goal
  saveGoal: (goal: SavingsGoal) => localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal)),
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
  },

  // Quests & Persona
  saveActiveQuest: (quest: SavingsQuest | null) => {
    if (quest) localStorage.setItem(STORAGE_KEYS.QUEST, JSON.stringify(quest));
    else localStorage.removeItem(STORAGE_KEYS.QUEST);
  },
  getActiveQuest: (): SavingsQuest | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUEST);
    return stored ? JSON.parse(stored) : null;
  },
  savePersona: (persona: SpendingPersona) => localStorage.setItem(STORAGE_KEYS.PERSONA, JSON.stringify(persona)),
  getPersona: (): SpendingPersona | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.PERSONA);
    return stored ? JSON.parse(stored) : null;
  }
};
