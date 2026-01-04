
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/db';
import { getFinancialInsight, getMarketSavings, getGoalStrategy, analyzeSubscriptions, getSpendingForecast, calculateWealthScore } from '../services/gemini';
import { User, Budget, Expense, SavingsTip, SavingsGoal, WealthScore } from '../types';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import IncomeForm from './IncomeForm';
import SavingsGoalForm from './SavingsGoalForm';
import GoalProgress from './GoalProgress';
import SubscriptionManager from './SubscriptionManager';
import RolloverSettings from './RolloverSettings';
import ChatAssistant from './ChatAssistant';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  YAxis,
  CartesianGrid
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
  const [savingsTip, setSavingsTip] = useState<SavingsTip | null>(null);
  const [subAudit, setSubAudit] = useState<string | null>(null);
  const [wealthScore, setWealthScore] = useState<WealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(budget.month));
  }, [expenses, budget.month]);

  const totalSpent = useMemo(() => currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0), [currentMonthExpenses]);
  const rolloverAmount = useMemo(() => db.getRolloverAmount(budget.month), [budget.month, budget.rolloverEnabled, expenses]);
  
  const totalAvailableBudget = budget.amount + (budget.rolloverEnabled ? rolloverAmount : 0);
  const currentNetSavings = budget.income - totalSpent;

  // Historical Trends Calculation (Last 4 months)
  const historicalData = useMemo(() => {
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7);
      const mLabel = d.toLocaleString('default', { month: 'short' });
      const mExpenses = expenses.filter(e => e.date.startsWith(mStr));
      const mSpent = mExpenses.reduce((sum, e) => sum + e.amount, 0);
      data.push({ name: mLabel, spent: mSpent, budget: budget.amount });
    }
    return data;
  }, [expenses, budget.amount]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [currentMonthExpenses]);

  const refreshAI = useCallback(async () => {
    if (budget.income === 0 && budget.amount === 0) return;
    setIsLoading(true);
    try {
      const promises: Promise<any>[] = [
        getFinancialInsight(budget, currentMonthExpenses, budget.rolloverEnabled ? rolloverAmount : 0),
        getMarketSavings(currentMonthExpenses),
        analyzeSubscriptions(currentMonthExpenses),
        getSpendingForecast(budget, currentMonthExpenses, budget.rolloverEnabled ? rolloverAmount : 0),
        calculateWealthScore(budget, currentMonthExpenses, goal)
      ];
      
      if (goal) {
        promises.push(getGoalStrategy(budget, currentMonthExpenses, goal, budget.rolloverEnabled ? rolloverAmount : 0));
      }

      const results = await Promise.all(promises);
      setInsight(results[0]);
      setSavingsTip(results[1]);
      setSubAudit(results[2]);
      setForecast(results[3]);
      setWealthScore(results[4]);
      if (goal) setGoalStrategy(results[5]);
    } finally {
      setIsLoading(false);
    }
  }, [budget, currentMonthExpenses, goal, rolloverAmount]);

  useEffect(() => {
    const checkMonth = () => {
      const currentDbBudget = db.getBudget();
      if (currentDbBudget.month !== budget.month) {
        setBudget(currentDbBudget);
        setInsight(null);
        setForecast(null);
      }
    };
    checkMonth();
    window.addEventListener('focus', checkMonth);
    return () => window.removeEventListener('focus', checkMonth);
  }, [budget.month]);

  useEffect(() => {
    if (currentMonthExpenses.length > 0 && !insight) {
      refreshAI();
    }
  }, [currentMonthExpenses.length, refreshAI, insight]);

  const handleBudgetUpdate = (newAmount: number) => {
    const newBudget = { ...budget, amount: newAmount };
    db.saveBudget(newBudget);
    setBudget(newBudget);
    setInsight(null);
  };

  const handleIncomeUpdate = (newIncome: number) => {
    const newBudget = { ...budget, income: newIncome };
    db.saveBudget(newBudget);
    setBudget(newBudget);
    setInsight(null);
  };

  const handleRolloverToggle = (enabled: boolean) => {
    const newBudget = { ...budget, rolloverEnabled: enabled };
    db.saveBudget(newBudget);
    setBudget(newBudget);
    setInsight(null);
  };

  const handleGoalUpdate = (newGoal: SavingsGoal) => {
    db.saveGoal(newGoal);
    setGoal(newGoal);
    setGoalStrategy(null);
    refreshAI();
  };

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp = db.addExpense(exp);
    setExpenses([...expenses, newExp]);
    setInsight(null);
    setForecast(null);
    setGoalStrategy(null);
    setSubAudit(null);
  };

  const handleDeleteExpense = (id: string) => {
    db.deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
    setInsight(null);
    setForecast(null);
    setGoalStrategy(null);
    setSubAudit(null);
  };

  const monthName = useMemo(() => {
    const [year, month] = budget.month.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [budget.month]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Command Center</h2>
          <p className="text-slate-500 text-sm">Active Period: <span className="font-semibold text-indigo-600">{monthName}</span></p>
        </div>
        <div className="flex items-center gap-4">
          {wealthScore && (
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm transition-transform hover:scale-105">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Wealth Score</p>
                <p className="text-sm font-bold" style={{ color: wealthScore.color }}>{wealthScore.label}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs border-2" 
                style={{ backgroundColor: wealthScore.color, borderColor: wealthScore.color + '44' }}
              >
                {wealthScore.score}
              </div>
            </div>
          )}
        </div>
      </div>

      {goal && (
        <GoalProgress 
          goal={goal} 
          currentSavings={currentNetSavings + (budget.rolloverEnabled ? rolloverAmount : 0)} 
          strategy={goalStrategy}
          isLoading={isLoading}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-100 transition-colors">
          <p className="text-sm font-medium text-slate-500">Gross Income</p>
          <p className="text-2xl font-bold text-slate-900">${budget.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500">Total Credit</p>
          <p className="text-2xl font-bold text-slate-900">${totalAvailableBudget.toLocaleString()}</p>
          {budget.rolloverEnabled && rolloverAmount > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Includes Rollover</span>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Spent to Date</p>
          <p className="text-2xl font-bold text-indigo-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm transition-all ${currentNetSavings < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-sm font-medium text-slate-500">Projected Surplus</p>
          <p className={`text-2xl font-bold ${currentNetSavings < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ${currentNetSavings.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-800">Historical Trends</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="budget" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
               <p className="text-xs font-bold text-slate-400 uppercase mb-4">Category Allocation</p>
               <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                      {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
               </div>
            </div>
            {forecast && (
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Month-End Forecast</h4>
                  <p className="text-sm font-medium leading-relaxed italic text-indigo-50">{forecast}</p>
                </div>
              </div>
            )}
          </div>

          <SubscriptionManager expenses={currentMonthExpenses} onDelete={handleDeleteExpense} auditInsight={subAudit} isLoading={isLoading} />

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">✨</div>
                  <h3 className="text-xl font-black tracking-tight">AI Monthly Insight</h3>
                </div>
                <button onClick={refreshAI} disabled={isLoading} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all border border-white/10">
                  {isLoading ? 'Thinking...' : 'Refresh'}
                </button>
              </div>
              <p className="text-lg font-medium leading-relaxed italic text-indigo-100">
                {insight ? `"${insight}"` : "Input data for a personalized financial audit."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <RolloverSettings enabled={budget.rolloverEnabled} onToggle={handleRolloverToggle} rolloverAmount={rolloverAmount} />
          <SavingsGoalForm currentGoal={goal} onUpdate={handleGoalUpdate} />
          <IncomeForm currentIncome={budget.income} onUpdate={handleIncomeUpdate} />
          <BudgetForm currentBudget={budget.amount} onUpdate={handleBudgetUpdate} />
          <ExpenseForm onAdd={handleAddExpense} />
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Activity Log</h3>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{currentMonthExpenses.length}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto scrollbar-hide">
              {currentMonthExpenses.length === 0 ? (
                <div className="p-12 text-center opacity-40">
                  <p className="text-slate-400 text-xs italic">No entries recorded.</p>
                </div>
              ) : (
                currentMonthExpenses.slice().reverse().map(exp => (
                  <div key={exp.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-6 rounded-full ${exp.isRecurring ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{exp.description}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">{exp.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-slate-700 text-sm tracking-tight">${exp.amount.toLocaleString()}</span>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatAssistant budget={budget} expenses={expenses} />
    </div>
  );
};

export default Dashboard;
