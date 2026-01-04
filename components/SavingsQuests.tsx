
import React from 'react';
import { SavingsQuest } from '../types';

interface SavingsQuestsProps {
  quest: SavingsQuest;
  isLoading: boolean;
  onRefresh: () => void;
  onAccept: () => void;
}

const SavingsQuests: React.FC<SavingsQuestsProps> = ({ quest, isLoading, onRefresh, onAccept }) => {
  const isActive = quest.status === 'Active';

  return (
    <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isActive ? 'Mission In Progress' : 'Weekly Potential Quest'}
            </div>
            <h3 className="text-3xl font-black tracking-tighter italic">{isLoading ? "Designing Quest..." : quest.title}</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest mb-1 ${quest.difficulty === 'Easy' ? 'bg-emerald-400 text-emerald-900' : quest.difficulty === 'Medium' ? 'bg-amber-400 text-amber-900' : 'bg-red-400 text-red-900'}`}>
              {quest.difficulty} Mode
            </span>
            {!isActive && (
              <button onClick={onRefresh} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">
          <p className="text-lg font-bold leading-tight mb-4">"{quest.description}"</p>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Reward Capacity</p>
              <p className={`text-2xl font-black ${isActive ? 'text-indigo-200' : 'text-emerald-200'}`}>+${quest.potentialSavings}</p>
            </div>
            {!isActive ? (
              <button 
                onClick={onAccept}
                className="px-6 py-2.5 bg-white text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Accept Mission
              </button>
            ) : (
              <div className="px-6 py-2.5 bg-indigo-500/50 border border-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Active
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsQuests;
