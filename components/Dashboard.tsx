
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/db';
import { getFinancialInsight, getMarketSavings } from '../services/gemini';
import { User, Budget, Expense, SavingsTip } from '../types';
import ExpenseForm from './ExpenseForm';
import BudgetForm from './BudgetForm';
import IncomeForm from './IncomeForm';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  user: User;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [budget, setBudget] = useState<Budget>(db.getBudget());
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [insight, setInsight] = useState<string | null>(null);
  const [savingsTip, setSavingsTip] = useState<SavingsTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalSpent = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const netSavings = budget.income - totalSpent;
  const remainingBudget = budget.amount - totalSpent;
  const progressPercent = budget.amount > 0 ? Math.min((totalSpent / budget.amount) * 100, 100) : 0;

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const refreshAI = useCallback(async () => {
    if (budget.income === 0 && budget.amount === 0) return;
    setIsLoading(true);
    try {
      const [newInsight, newTip] = await Promise.all([
        getFinancialInsight(budget, expenses),
        getMarketSavings(expenses)
      ]);
      setInsight(newInsight);
      setSavingsTip(newTip);
    } finally {
      setIsLoading(false);
    }
  }, [budget, expenses]);

  useEffect(() => {
    if (expenses.length > 0 && !insight) {
      refreshAI();
    }
  }, [expenses.length, insight, refreshAI]);

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

  const barData = [
    { name: 'Budget', amount: budget.amount, fill: '#6366f1' },
    { name: 'Actual', amount: totalSpent, fill: totalSpent > budget.amount ? '#ef4444' : '#10b981' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monthly Income</p>
          <p className="text-2xl font-bold text-slate-900">${budget.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Expense Budget</p>
          <p className="text-2xl font-bold text-slate-900">${budget.amount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Spent</p>
          <p className="text-2xl font-bold text-indigo-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-2xl border border-slate-200 shadow-sm ${netSavings < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-sm font-medium text-slate-500">Net Savings</p>
          <p className={`text-2xl font-bold ${netSavings < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ${netSavings.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualizations & Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Financial Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bar Chart */}
              <div className="h-64 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Budget vs Actual</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Chart */}
              <div className="h-64 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Spend by Category</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Budget Progress</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${progressPercent > 100 ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-bold">Personalized Insight</h3>
              </div>
              <button onClick={refreshAI} disabled={isLoading} className="text-xs font-bold text-indigo-200 hover:text-white transition-colors">
                {isLoading ? 'Thinking...' : 'Refresh'}
              </button>
            </div>
            <p className="text-indigo-50 font-medium leading-relaxed italic">
              {insight ? `"${insight}"` : "Add more data to see how your income and expenses balance out."}
            </p>
          </div>

          {/* Smart Savings Section (Grounded Search) */}
          {savingsTip && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔍</span>
                <h3 className="text-lg font-bold text-amber-900">Smart Savings (Grounded Search)</h3>
              </div>
              <p className="text-amber-800 text-sm mb-4 leading-relaxed">{savingsTip.text}</p>
              {savingsTip.links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Resources Found</p>
                  <div className="flex flex-wrap gap-2">
                    {savingsTip.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-200 rounded-full text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        {link.title}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Forms & List */}
        <div className="space-y-6">
          <IncomeForm currentIncome={budget.income} onUpdate={handleIncomeUpdate} />
          <BudgetForm currentBudget={budget.amount} onUpdate={handleBudgetUpdate} />
          <ExpenseForm onAdd={handleAddExpense} />
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Expense List</h3>
              <span className="text-xs font-medium text-slate-400">{expenses.length}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {expenses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">No entries yet.</div>
              ) : (
                expenses.slice().reverse().map(exp => (
                  <div key={exp.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: COLORS[CATEGORIES.indexOf(exp.category) % COLORS.length] }} 
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{exp.description}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{exp.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-700">${exp.amount}</span>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for finding index for category color
const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];

export default Dashboard;
