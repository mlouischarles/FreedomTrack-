
export interface User {
  id: string;
  username: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring?: boolean;
  frequency?: 'Weekly' | 'Monthly' | 'Yearly';
}

export interface Budget {
  amount: number;
  income: number;
  month: string;
  rolloverEnabled: boolean;
}

export interface SavingsGoal {
  title: string;
  targetAmount: number;
  deadline: string;
}

export interface SavingsTip {
  text: string;
  links: { title: string; uri: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WealthScore {
  score: number;
  label: string;
  color: string;
  advice: string;
}

export interface AppState {
  user: User | null;
  budget: Budget;
  expenses: Expense[];
  aiInsight: string | null;
  isLoadingInsight: boolean;
}
