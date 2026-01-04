
import React, { useState } from 'react';
import { Expense, ExpenseSentiment } from '../types';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Health', 'Other'];
const SENTIMENTS: ExpenseSentiment[] = ['Essential', 'Joyful', 'Neutral', 'Regret'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sentiment, setSentiment] = useState<ExpenseSentiment>('Neutral');
  const [notes, setNotes] = useState('');
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
        frequency: isRecurring ? frequency : undefined,
        sentiment,
        notes: notes.trim() || undefined
      });
      setDesc('');
      setAmount('');
      setSentiment('Neutral');
      setNotes('');
      setIsRecurring(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Record Outflow</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Descriptor</label>
          <input
            type="text"
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Daily Coffee, Rent, Gas"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Value ($)</label>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-black"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold appearance-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Emotional Impact (Vibe)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SENTIMENTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSentiment(s)}
                className={`px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${sentiment === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 border-slate-200"
              />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recurring Pattern</span>
            </label>
            {isRecurring && (
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="text-[10px] font-black text-indigo-600 bg-indigo-50 border-none rounded-xl px-3 py-1.5 outline-none tracking-widest"
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
          className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-[1.5rem] transition-all shadow-xl shadow-slate-100 text-xs uppercase tracking-[0.2em] active:scale-95 mt-4"
        >
          Confirm Transaction
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
