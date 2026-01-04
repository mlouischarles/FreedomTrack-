
import React, { useState } from 'react';
import { SavingsGoal } from '../types';

interface SavingsGoalFormProps {
  currentGoal: SavingsGoal | null;
  onUpdate: (goal: SavingsGoal) => void;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ currentGoal, onUpdate }) => {
  const [title, setTitle] = useState(currentGoal?.title || '');
  const [target, setTarget] = useState(currentGoal?.targetAmount.toString() || '');
  const [isOpen, setIsOpen] = useState(!currentGoal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(target);
    if (title && !isNaN(num)) {
      onUpdate({
        title,
        targetAmount: num,
        deadline: new Date().toISOString() // Monthly context
      });
      setIsOpen(false);
    }
  };

  if (!isOpen && currentGoal) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all text-sm"
      >
        + Update Savings Goal
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">What are you saving for?</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Hawaii Trip, New Laptop"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
        />
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target amount"
            className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition-all text-sm"
          >
            Start Goal
          </button>
          {currentGoal && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-slate-500 font-bold text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SavingsGoalForm;
