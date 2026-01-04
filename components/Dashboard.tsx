
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/db';
import { getFinancialInsight, getGoalStrategy, analyzeSubscriptions, getSpendingForecast, calculateWealthScore, detectAnomalies, getFreedomHorizon, getValueAudit, generateSavingsQuest, getSpendingPersona } from '../services/gemini';
import { User, Budget, Expense, SavingsGoal, WealthScore, SpendingAlert, FreedomProjection, SavingsQuest, SpendingPersona } from '../types';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import IncomeForm from './IncomeForm';
import SavingsGoalForm from './SavingsGoalForm';
import GoalProgress from './GoalProgress';
import SubscriptionManager from './SubscriptionManager';
import RolloverSettings from './RolloverSettings';
import ChatAssistant from './ChatAssistant';
import CategoryBudgetManager from './CategoryBudgetManager';
import FreedomHorizon from './FreedomHorizon';
import SavingsQuests from './SavingsQuests';
import SpendingPersonaCard from './SpendingPersonaCard';
import { 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface DashboardProps { user: User; }
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [budget, setBudget] = useState<Budget>(db.getBudget());
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [goal, setGoal] = useState<SavingsGoal | null>(db.getGoal());
  const [insight, setInsight] = useState<string | null>(null);
  const [forecast, setForecast] = useState<string | null>(null);
  const [goalStrategy, setGoalStrategy] = useState<string | null>(null);
  const [subAudit, setSubAudit] = useState<string | null>(null);
  const [wealthScore, setWealthScore] = useState<WealthScore | null>(null);
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [freedomProjection, setFreedomProjection] = useState<FreedomProjection | null>(null);
  const [valueAudit, setValueAudit] = useState<string | null>(null);
  const [quest, setQuest] = useState<SavingsQuest | null>(db.getActiveQuest());
  const [persona, setPersona] = useState<SpendingPersona | null>(db.getPersona());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMonthExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(budget.month)), [expenses, budget.month]);
  const filteredExpenses = useMemo(() => currentMonthExpenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase())), [currentMonthExpenses, searchTerm]);
  const totalSpent = useMemo(() => currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0), [currentMonthExpenses]);
  const rolloverAmount = useMemo(() => db.getRolloverAmount(budget.month), [budget.month, budget.rolloverEnabled, expenses]);
  const totalAvailableBudget = budget.amount + (budget.rolloverEnabled ? rolloverAmount : 0);
  const currentNetSavings = budget.income - totalSpent;

  const historicalData = useMemo(() => {
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7);
      const mLabel = d.toLocaleString('default', { month: 'short' });
      const mSpent = expenses.filter(e => e.date.startsWith(mStr)).reduce((sum, e) => sum + e.amount, 0);
      data.push({ name: mLabel, spent: mSpent, budget: budget.amount });
    }
    return data;
  }, [expenses, budget.amount]);

  const scatterData = useMemo(() => {
    const sentiments: Record<string, number> = { 'Essential': 3, 'Joyful': 4, 'Neutral': 2, 'Regret': 1 };
    return currentMonthExpenses.map(e => ({ x: e.amount, y: sentiments[e.sentiment || 'Neutral'], name: e.description, sentiment: e.sentiment || 'Neutral' }));
  }, [currentMonthExpenses]);

  const refreshAI = useCallback(async () => {
    if (budget.income === 0 && budget.amount === 0) return;
    setIsLoading(true);
    try {
      const results = await Promise.all([
        getFinancialInsight(budget, currentMonthExpenses),
        analyzeSubscriptions(currentMonthExpenses),
        getSpendingForecast(budget, currentMonthExpenses),
        calculateWealthScore(budget, currentMonthExpenses, goal),
        detectAnomalies(budget, currentMonthExpenses),
        getFreedomHorizon(budget, currentMonthExpenses),
        getValueAudit(currentMonthExpenses),
        generateSavingsQuest(currentMonthExpenses),
        getSpendingPersona(currentMonthExpenses)
      ]);
      
      setInsight(results[0]);
      setSubAudit(results[1]);
      setForecast(results[2]);
      setWealthScore(results[3]);
      setAlerts(results[4]);
      setFreedomProjection(results[5]);
      setValueAudit(results[6]);
      if (!quest || quest.status === 'Available') {
        setQuest(results[7]);
        db.saveActiveQuest(results[7]);
      }
      if (results[8]) {
        setPersona(results[8]);
        db.savePersona(results[8]);
      }
      if (goal) {
        const strat = await getGoalStrategy(budget, currentMonthExpenses, goal);
        setGoalStrategy(strat);
      }
    } finally {
      setIsLoading(false);
    }
  }, [budget, currentMonthExpenses, goal, quest]);

  useEffect(() => {
    if (currentMonthExpenses.length > 0 && !insight) refreshAI();
  }, [currentMonthExpenses.length, refreshAI, insight]);

  const handleQuestAccept = () => {
    if (quest) {
      const activeQuest = { ...quest, status: 'Active' as const };
      setQuest(activeQuest);
      db.saveActiveQuest(activeQuest);
    }
  };

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp = db.addExpense(exp);
    setExpenses([...expenses, newExp]);
    setInsight(null);
  };

  const handleDeleteExpense = (id: string) => {
    db.deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
    setInsight(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Psychological Command</h2>
          <p className="text-slate-500 text-sm font-medium">Month: <span className="font-bold text-indigo-600 uppercase">{budget.month}</span></p>
        </div>
        {wealthScore && (
          <div className="bg-white border border-slate-200 rounded-3xl px-6 py-3 flex items-center gap-5 shadow-xl">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Score</p>
              <p className="text-sm font-black" style={{ color: wealthScore.color }}>{wealthScore.label}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-base border-4" style={{ backgroundColor: wealthScore.color, borderColor: wealthScore.color + '15' }}>
              {wealthScore.score}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {persona && <SpendingPersonaCard persona={persona} isLoading={isLoading} />}
        {quest && <SavingsQuests quest={quest} isLoading={isLoading} onRefresh={refreshAI} onAccept={handleQuestAccept} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-2">Income</p><p className="text-3xl font-black text-slate-900">${budget.income.toLocaleString()}</p></div>
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-2">Capacity</p><p className="text-3xl font-black text-slate-900">${totalAvailableBudget.toLocaleString()}</p></div>
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm"><p className="text-xs font-black text-slate-400 uppercase mb-2">Outflow</p><p className="text-3xl font-black text-indigo-600">${totalSpent.toLocaleString()}</p></div>
        <div className={`p-7 rounded-[2rem] border shadow-sm ${currentNetSavings < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}><p className="text-xs font-black text-slate-400 uppercase mb-2">Surplus</p><p className={`text-3xl font-black ${currentNetSavings < 0 ? 'text-red-600' : 'text-emerald-600'}`}>${currentNetSavings.toLocaleString()}</p></div>
      </div>

      {freedomProjection && <FreedomHorizon projection={freedomProjection} isLoading={isLoading} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black tracking-tighter mb-8">Happiness ROI Audit</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart><XAxis type="number" dataKey="x" hide /><YAxis type="number" dataKey="y" hide domain={[0, 5]} /><ZAxis range={[50, 400]} /><Tooltip content={({ active, payload }) => { if (active && payload && payload.length) { const data = payload[0].payload; return (<div className="bg-white p-4 rounded-2xl shadow-xl text-slate-900"><p className="text-xs font-black uppercase text-slate-400 mb-1">{data.sentiment}</p><p className="text-sm font-bold">{data.name}</p><p className="text-lg font-black text-indigo-600 mt-1">${data.x}</p></div>); } return null; }} /><Scatter name="Expenses" data={scatterData}>{scatterData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.sentiment === 'Regret' ? '#ef4444' : entry.sentiment === 'Joyful' ? '#10b981' : entry.sentiment === 'Essential' ? '#6366f1' : '#94a3b8'} />))}</Scatter></ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          <CategoryBudgetManager budget={budget} expenses={currentMonthExpenses} onUpdateLimits={(l) => { const nb = { ...budget, categoryLimits: l }; db.saveBudget(nb); setBudget(nb); refreshAI(); }} />
          <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden"><h3 className="text-3xl font-black tracking-tighter mb-6">Behavioral Audit</h3><p className="text-2xl font-bold leading-tight italic text-indigo-50">{valueAudit || "Add sentiments to unlock."}</p></div>
        </div>
        <div className="space-y-8">
          <SavingsGoalForm currentGoal={goal} onUpdate={(g) => { db.saveGoal(g); setGoal(g); refreshAI(); }} />
          <IncomeForm currentIncome={budget.income} onUpdate={(i) => { const nb = { ...budget, income: i }; db.saveBudget(nb); setBudget(nb); refreshAI(); }} />
          <BudgetForm currentBudget={budget.amount} onUpdate={(a) => { const nb = { ...budget, amount: a }; db.saveBudget(nb); setBudget(nb); refreshAI(); }} />
          <ExpenseForm onAdd={handleAddExpense} />
        </div>
      </div>
      <ChatAssistant budget={budget} expenses={expenses} />
    </div>
  );
};

export default Dashboard;
