import React, { useState } from 'react';
import { GICS_SECTORS } from '../data/marketData';
import { SectorPerformance } from '../types/market';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface SectorMatrixProps {
  onSelectSymbol?: (symbol: string) => void;
}

type Period = 'd1' | 'w1' | 'm1' | 'm3' | 'ytd';

export const SectorMatrix: React.FC<SectorMatrixProps> = ({ onSelectSymbol }) => {
  const [period, setPeriod] = useState<Period>('d1');

  const periodLabels: Record<Period, string> = {
    d1: '1 Day',
    w1: '1 Week',
    m1: '1 Month',
    m3: '3 Months',
    ytd: 'Year to Date',
  };

  const sorted = [...GICS_SECTORS].sort((a, b) => b[period] - a[period]);

  return (
    <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#2a2e39]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              S&P 500 Sector Performance Matrix
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#2962ff]/10 text-[#2962ff]">
              11 GICS Sectors
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#787b86] mt-0.5">
            Cross-industry capital rotation and performance
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39] text-xs">
          {(['d1', 'w1', 'm1', 'm3', 'ytd'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                period === p
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
        {sorted.map((sec) => {
          const val = sec[period];
          const isPos = val >= 0;

          return (
            <div
              key={sec.code}
              className="p-3 rounded-lg border border-slate-100 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] hover:border-slate-300 dark:hover:border-[#363a45] transition-all"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {sec.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-[#787b86]">
                  {sec.code}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span
                  className={`text-sm font-bold font-mono flex items-center tabular-nums ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? (
                    <ArrowUpRight className="w-3.5 h-3.5 inline" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 inline" />
                  )}
                  {isPos ? '+' : ''}
                  {val.toFixed(2)}%
                </span>

                {onSelectSymbol && (
                  <button
                    onClick={() => onSelectSymbol(sec.topStock)}
                    className="text-[11px] text-[#2962ff] hover:underline font-medium cursor-pointer"
                  >
                    Top: {sec.topStock}
                  </button>
                )}
              </div>

              {/* Progress bar visually representing performance */}
              <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPos ? 'bg-[#089981]' : 'bg-[#f23645]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(8, Math.abs(val) * 3))}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
