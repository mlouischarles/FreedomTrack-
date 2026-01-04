
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
}

export interface Budget {
  amount: number;
  income: number;
  month: string;
}

export interface SavingsTip {
  text: string;
  links: { title: string; uri: string }[];
}

export interface AppState {
  user: User | null;
  budget: Budget;
  expenses: Expense[];
  aiInsight: string | null;
  isLoadingInsight: boolean;
}
