
import React, { useState, useEffect } from 'react';
import { Budget, Expense, CategoryOptimization } from '../types';
import { getCategoryOptimization } from '../services/gemini';

interface CategoryBudgetManagerProps {
  budget: Budget;
  expenses: Expense[];
  onUpdateLimits: (limits: Record<string, number>) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];

const CategoryBudgetManager: React.FC<CategoryBudgetManagerProps> = ({ budget, expenses, onUpdateLimits }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState<Record<string, number>>(budget.categoryLimits || {});
  const [suggestion, setSuggestion] = useState<CategoryOptimization | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    setLocalLimits(budget.categoryLimits || {});
  }, [budget.categoryLimits]);

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(budget.month));
  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const res = await getCategoryOptimization(budget, expenses);
    setSuggestion(res);
    setIsSuggesting(false);
  };

  const applySuggestion = () => {
    if (suggestion) {
      setLocalLimits(suggestion.suggestedLimits);
      setSuggestion(null);
    }
  };

  const handleSave = () => {
    onUpdateLimits(localLimits);
    setIsEditing(false);
  };

  const totalAllocated = Object.values(localLimits).reduce((a, b) => a + b, 0);
  const isOverBudget = totalAllocated > budget.amount;

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Smart Category Targets</h3>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Allocation Optimizer</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Edit Limits
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSuggest}
                disabled={isSuggesting}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-indigo-100"
              >
                {isSuggesting ? 'Thinking...' : 'AI Suggest'}
              </button>
              <button 
                onClick={handleSave}
                disabled={isOverBudget}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Save Limits
              </button>
            </div>
          )}
        </div>
      </div>

      {suggestion && isEditing && (
        <div className="mb-8 p-6 bg-indigo-600 rounded-3xl text-white animate-in zoom-in duration-300 shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-sm font-bold mb-4 italic leading-relaxed">"{suggestion.reasoning}"</p>
          <div className="flex gap-4">
            <button onClick={applySuggestion} className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">Apply AI Targets</button>
            <button onClick={() => setSuggestion(null)} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">Dismiss</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {CATEGORIES.map(cat => {
          const limit = localLimits[cat] || 0;
          const spent = categoryTotals[cat] || 0;
          const percent = limit > 0 ? (spent / limit) * 100 : 0;
          const colorClass = percent > 90 ? 'bg-red-500' : percent > 60 ? 'bg-amber-500' : 'bg-indigo-500';

          return (
            <div key={cat} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{cat}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Spent: ${spent.toLocaleString()}</p>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">$</span>
                    <input 
                      type="number"
                      value={limit || ''}
                      onChange={(e) => setLocalLimits({ ...localLimits, [cat]: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-black text-slate-700 tracking-tight">${spent.toLocaleString()} / <span className="text-slate-400">${limit.toLocaleString()}</span></span>
                )}
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${colorClass}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {isEditing && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Allocated</p>
            <p className={`text-xl font-black ${isOverBudget ? 'text-red-500' : 'text-slate-800'}`}>${totalAllocated.toLocaleString()} / ${budget.amount.toLocaleString()}</p>
          </div>
          {isOverBudget && <p className="text-[10px] font-black text-red-500 uppercase">Over Total Budget!</p>}
        </div>
      )}
    </div>
  );
};

export default CategoryBudgetManager;
