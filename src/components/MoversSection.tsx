import React from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MoversSectionProps {
  stocks: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const MoversSection: React.FC<MoversSectionProps> = ({
  stocks,
  onSelectAsset,
  selectedSymbol,
}) => {
  // Sort gainers
  const gainers = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  // Sort losers
  const losers = [...stocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  // Sort most active (by volume or percent volatility)
  const mostActive = [...stocks]
    .sort((a, b) => parseFloat(b.volume || '0') - parseFloat(a.volume || '0'))
    .slice(0, 5);

  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 48;
    const height = 18;

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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderColumn = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    items: MarketAsset[],
    accentColor: string
  ) => {
    return (
      <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden flex flex-col">
        {/* Column Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${accentColor}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#787b86]">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60 flex-1">
          {items.map((stock) => {
            const isPos = stock.changePercent >= 0;
            const isSelected = selectedSymbol === stock.symbol;

            return (
              <button
                key={stock.symbol}
                onClick={() => onSelectAsset(stock)}
                className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                    : 'hover:bg-slate-50 dark:hover:bg-[#202533]'
                }`}
              >
                {/* Symbol & Name */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2962ff] transition-colors">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#787b86]">
                      {stock.exchange}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#787b86] truncate max-w-[130px]">
                    {stock.name}
                  </p>
                </div>

                {/* Sparkline */}
                <div className="hidden sm:block">
                  {renderSparkline(stock.sparkline, isPos)}
                </div>

                {/* Price & Change */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-medium flex items-center justify-end tabular-nums ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    {isPos ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderColumn(
        'Top Gainers',
        'Highest percentage change today',
        <TrendingUp className="w-4 h-4 text-[#089981]" />,
        gainers,
        'bg-emerald-50 dark:bg-[#089981]/15 text-[#089981]'
      )}
      {renderColumn(
        'Top Losers',
        'Steepest declines today',
        <TrendingDown className="w-4 h-4 text-[#f23645]" />,
        losers,
        'bg-rose-50 dark:bg-[#f23645]/15 text-[#f23645]'
      )}
      {renderColumn(
        'Most Active',
        'Highest trading volume today',
        <Zap className="w-4 h-4 text-[#2962ff]" />,
        mostActive,
        'bg-blue-50 dark:bg-[#2962ff]/15 text-[#2962ff]'
      )}
    </div>
  );
};
