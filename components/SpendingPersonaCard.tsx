
import React from 'react';
import { SpendingPersona } from '../types';

interface SpendingPersonaCardProps {
  persona: SpendingPersona;
  isLoading: boolean;
}

const SpendingPersonaCard: React.FC<SpendingPersonaCardProps> = ({ persona, isLoading }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-[3] rotate-12 transition-transform group-hover:scale-[3.5]">
        {persona.icon}
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-indigo-100">
            {persona.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Financial Alter-Ego</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isLoading ? "Analyzing Mindset..." : persona.name}</h3>
          </div>
        </div>

        <div className="py-4 border-t border-b border-slate-50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dominant Trait</p>
          <p className="text-sm font-bold text-slate-700">{persona.trait}</p>
        </div>

        <div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">"{persona.description}"</p>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100 mt-2">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Behavioral Pivot</p>
          <p className="text-xs font-bold leading-snug">{persona.advice}</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingPersonaCard;
