
import React from 'react';
import { SavingsGoal } from '../types';

interface GoalProgressProps {
  goal: SavingsGoal;
  currentSavings: number;
  strategy: string | null;
  isLoading: boolean;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal, currentSavings, strategy, isLoading }) => {
  const percent = Math.min(Math.max((currentSavings / goal.targetAmount) * 100, 0), 100);
  
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-bold uppercase tracking-wider">
            Active Mission
          </div>
          <h2 className="text-3xl font-black">{goal.title}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">${currentSavings.toLocaleString()}</span>
            <span className="text-indigo-300 font-medium">/ ${goal.targetAmount.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <div className="h-3 w-full bg-indigo-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-right text-xs font-bold text-indigo-300">{percent.toFixed(0)}% Complete</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:max-w-xs w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h4 className="text-sm font-bold text-indigo-100 uppercase tracking-wide">Gemini Strategy</h4>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-indigo-50 font-medium">
              {strategy || "Add a goal to see your daily safe spending strategy."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;
