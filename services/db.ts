
import { User, Budget, Expense } from '../types';

const STORAGE_KEYS = {
  USER: 'ft_user',
  BUDGET: 'ft_budget',
  EXPENSES: 'ft_expenses'
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
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return stored ? JSON.parse(stored) : { 
      amount: 0, 
      income: 0, 
      month: new Date().toISOString().slice(0, 7) 
    };
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
