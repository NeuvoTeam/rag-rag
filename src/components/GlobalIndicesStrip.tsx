import React from 'react';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface GlobalIndicesStripProps {
  indices: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const GlobalIndicesStrip: React.FC<GlobalIndicesStripProps> = ({
  indices,
  onSelectAsset,
  selectedSymbol,
}) => {
  // Render mini SVG sparkline
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const pathData = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#089981' : '#f23645';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#131722] py-2.5 overflow-x-auto no-scrollbar">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 flex items-center gap-3">
        {indices.map((idx) => {
          const isPositive = idx.changePercent >= 0;
          const isSelected = selectedSymbol === idx.symbol;

          return (
            <button
              key={idx.symbol}
              onClick={() => onSelectAsset(idx)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left shrink-0 cursor-pointer ${
                isSelected
                  ? 'border-[#2962ff] bg-blue-50/60 dark:bg-[#2962ff]/10 shadow-sm'
                  : 'border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#1e222d] hover:border-slate-300 dark:hover:border-[#363a45]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {idx.symbol}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#787b86] truncate max-w-[90px]">
                    {idx.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-medium flex items-center tabular-nums ${
                      isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 inline" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 inline" />
                    )}
                    {isPositive ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {renderSparkline(idx.sparkline, isPositive)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
