
import React, { useState } from 'react';
import { Expense } from '../types';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Expense['frequency']>('Monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (desc.trim() && !isNaN(num)) {
      onAdd({
        description: desc.trim(),
        amount: num,
        category,
        date: new Date().toISOString(),
        isRecurring,
        frequency: isRecurring ? frequency : undefined
      });
      setDesc('');
      setAmount('');
      setIsRecurring(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Add Expense</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
          <input
            type="text"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Netflix, Rent, Groceries"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-600 uppercase">Recurring / Subscription</span>
            </label>
            {isRecurring && (
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 border-none rounded-lg px-2 py-1 outline-none"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm active:scale-95"
        >
          Record Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
