
import React from 'react';

interface RolloverSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  rolloverAmount: number;
}

const RolloverSettings: React.FC<RolloverSettingsProps> = ({ enabled, onToggle, rolloverAmount }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Budget Rollover</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        When enabled, any unspent funds from the previous month will be added to your current spending power.
      </p>

      {enabled && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center">
          <span className="text-xs font-bold text-indigo-700 uppercase">Available Rollover</span>
          <span className="text-sm font-black text-indigo-900">${rolloverAmount.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default RolloverSettings;
