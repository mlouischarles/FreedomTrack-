
import React, { useState } from 'react';

interface BudgetFormProps {
  currentBudget: number;
  onUpdate: (amount: number) => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ currentBudget, onUpdate }) => {
  const [val, setVal] = useState(currentBudget === 0 ? '' : currentBudget.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdate(num);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Update Budget</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          Set
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
