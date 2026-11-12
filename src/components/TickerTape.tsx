import React from 'react';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  assets,
  onSelectAsset,
  selectedSymbol,
}) => {
  // Duplicate assets to produce infinite seamless ticker loop
  const displayAssets = [...assets, ...assets];

  return (
    <div className="w-full bg-[#0d1017] dark:bg-[#0c0e15] border-b border-[#2a2e39] py-1.5 overflow-hidden select-none">
      <div className="flex items-center gap-6 whitespace-nowrap animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
        {displayAssets.map((asset, index) => {
          const isPos = asset.changePercent >= 0;
          const isSelected = selectedSymbol === asset.symbol;

          return (
            <button
              key={`${asset.symbol}-${index}`}
              onClick={() => onSelectAsset(asset)}
              className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#2962ff]/20 text-white font-bold'
                  : 'hover:bg-[#1e222d] text-slate-300'
              }`}
            >
              <span className="font-bold text-slate-200">{asset.symbol}</span>
              <span className="font-mono text-slate-400 tabular-nums">
                ${asset.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: asset.price < 1 ? 4 : 2,
                })}
              </span>
              <span
                className={`inline-flex items-center font-mono text-[11px] font-semibold tabular-nums ${
                  isPos ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPos ? (
                  <ArrowUpRight className="w-3 h-3 inline" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 inline" />
                )}
                {isPos ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
