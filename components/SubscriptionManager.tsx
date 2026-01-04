
import React from 'react';
import { Expense } from '../types';

interface SubscriptionManagerProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  auditInsight: string | null;
  isLoading: boolean;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ expenses, onDelete, auditInsight, isLoading }) => {
  const recurring = expenses.filter(e => e.isRecurring);
  
  const annualTotal = recurring.reduce((sum, e) => {
    const multiplier = e.frequency === 'Weekly' ? 52 : e.frequency === 'Monthly' ? 12 : 1;
    return sum + (e.amount * multiplier);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Subscription Cost</p>
            <p className="text-3xl font-black text-white">${annualTotal.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
            <span className="text-xl">🦇</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🛡️</span>
            <h4 className="text-xs font-bold text-indigo-300 uppercase">Subscription Audit</h4>
          </div>
          <p className="text-sm text-indigo-50 leading-relaxed font-medium">
            {isLoading ? "Auditing your vampire costs..." : (auditInsight || "No recurring expenses to audit yet.")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">Recurring Payments</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
            {recurring.length}
          </span>
        </div>
        <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
          {recurring.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm italic">No recurring payments tracked.</p>
              <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Mark expenses as recurring to see them here</p>
            </div>
          ) : (
            recurring.map(exp => (
              <div key={exp.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{exp.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold uppercase">
                      {exp.frequency}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{exp.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">${exp.amount}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">~${(exp.amount * (exp.frequency === 'Weekly' ? 52 : exp.frequency === 'Monthly' ? 12 : 1)).toLocaleString()}/yr</p>
                  </div>
                  <button 
                    onClick={() => onDelete(exp.id)} 
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
