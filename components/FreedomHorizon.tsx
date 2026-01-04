
import React from 'react';
import { FreedomProjection } from '../types';

interface FreedomHorizonProps {
  projection: FreedomProjection;
  isLoading: boolean;
}

const FreedomHorizon: React.FC<FreedomHorizonProps> = ({ projection, isLoading }) => {
  if (!projection && !isLoading) return null;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-3xl shadow-slate-200 overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[100px] transition-transform duration-1000 group-hover:scale-110"></div>
      
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
              Freedom Engine v1.0
            </div>
            <h3 className="text-4xl font-black tracking-tighter italic">Horizon Projection</h3>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Freedom Point</p>
            <p className="text-3xl font-black text-indigo-400 tracking-tight">{isLoading ? "---" : projection.freedomDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-white/10 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            projection.milestones.map((ms, i) => (
              <div key={i} className="bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-6 transition-all group/card">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${ms.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {ms.confidence} Confidence
                  </span>
                  <span className="text-xs font-black text-slate-500">{Math.ceil(ms.etaMonths / 12)}y {ms.etaMonths % 12}m</span>
                </div>
                <h4 className="text-lg font-black text-slate-100 mb-2">{ms.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed italic">" {ms.actionItem} "</p>
              </div>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Yearly Velocity</p>
              <p className="text-xl font-black text-indigo-400">${isLoading ? "---" : projection.yearlyGrowth.toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Projection Basis</p>
              <p className="text-xs font-bold text-slate-300">Net Compounding Savings</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 max-w-xs text-center md:text-right leading-relaxed font-medium">
            Projected milestones are algorithmic estimates based on current trailing behavior. Stay consistent to compress the timeline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreedomHorizon;
