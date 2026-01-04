
export interface User {
  id: string;
  username: string;
}

export type ExpenseSentiment = 'Essential' | 'Joyful' | 'Regret' | 'Neutral';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring?: boolean;
  frequency?: 'Weekly' | 'Monthly' | 'Yearly';
  sentiment?: ExpenseSentiment;
  notes?: string;
}

export interface SavingsQuest {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Available' | 'Active' | 'Completed';
}

export interface SpendingPersona {
  name: string;
  trait: string;
  description: string;
  advice: string;
  icon: string;
}

export interface Budget {
  amount: number;
  income: number;
  month: string;
  rolloverEnabled: boolean;
  categoryLimits?: Record<string, number>;
}

export interface SavingsGoal {
  title: string;
  targetAmount: number;
  deadline: string;
}

export interface FreedomMilestone {
  label: string;
  etaMonths: number;
  confidence: string;
  actionItem: string;
}

export interface FreedomProjection {
  milestones: FreedomMilestone[];
  yearlyGrowth: number;
  freedomDate: string;
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

export interface SpendingAlert {
  category: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
}

export interface CategoryOptimization {
  suggestedLimits: Record<string, number>;
  reasoning: string;
}

export interface AppState {
  user: User | null;
  budget: Budget;
  expenses: Expense[];
  aiInsight: string | null;
  isLoadingInsight: boolean;
}
