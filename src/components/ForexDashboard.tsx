import React from 'react';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface ForexDashboardProps {
  forexPairs: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const ForexDashboard: React.FC<ForexDashboardProps> = ({
  forexPairs,
  onSelectAsset,
  selectedSymbol,
}) => {
  // Cross rates matrix
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  const matrix: Record<string, Record<string, number>> = {
    USD: { USD: 1.0, EUR: 0.9238, GBP: 0.7701, JPY: 152.45, CAD: 1.3842 },
    EUR: { USD: 1.0824, EUR: 1.0, GBP: 0.8335, JPY: 165.02, CAD: 1.4982 },
    GBP: { USD: 1.2985, EUR: 1.1997, GBP: 1.0, JPY: 197.95, CAD: 1.7974 },
    JPY: { USD: 0.00656, EUR: 0.00606, GBP: 0.00505, JPY: 1.0, CAD: 0.00908 },
    CAD: { USD: 0.7224, EUR: 0.6675, GBP: 0.5563, JPY: 110.13, CAD: 1.0 },
  };

  return (
    <div className="space-y-6">
      {/* Forex Cross Rates Matrix */}
      <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#2a2e39]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Forex Cross Rates Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#787b86]">
              Real-time exchange matrix between G5 major reserve currencies
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2a2e39] text-slate-500 dark:text-[#787b86] font-semibold">
                <th className="py-2.5 px-3 text-left">Base / Quote</th>
                {currencies.map((c) => (
                  <th key={c} className="py-2.5 px-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60 font-mono">
              {currencies.map((base) => (
                <tr key={base} className="hover:bg-slate-50 dark:hover:bg-[#1e222d]/60">
                  <td className="py-3 px-3 text-left font-bold text-slate-900 dark:text-white">
                    {base}
                  </td>
                  {currencies.map((quote) => {
                    const isDiag = base === quote;
                    const val = matrix[base]?.[quote] || 1;
                    return (
                      <td
                        key={quote}
                        className={`py-3 px-3 tabular-nums ${
                          isDiag
                            ? 'text-slate-400 bg-slate-50 dark:bg-[#181c27]'
                            : 'text-slate-800 dark:text-[#d1d4dc] font-medium'
                        }`}
                      >
                        {isDiag ? '1.0000' : val > 10 ? val.toFixed(2) : val.toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Major Forex Pairs Live Table */}
      <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Major Currency Pairs
          </h3>
          <span className="text-xs text-slate-500 dark:text-[#787b86]">
            Live interbank bid/ask spreads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] text-[11px] font-semibold text-slate-500 dark:text-[#787b86] uppercase tracking-wider">
                <th className="py-3 px-4">Pair</th>
                <th className="py-3 px-4 text-right">Bid</th>
                <th className="py-3 px-4 text-right">Ask</th>
                <th className="py-3 px-4 text-center">Spread</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 hidden md:table-cell">Day Range (L - H)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
              {forexPairs.map((pair) => {
                const isPos = pair.changePercent >= 0;
                const isSelected = selectedSymbol === pair.symbol;

                return (
                  <tr
                    key={pair.symbol}
                    onClick={() => onSelectAsset(pair)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1e222d]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pair.symbol.slice(0, 3)}/{pair.symbol.slice(3)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#787b86] hidden sm:inline">
                          {pair.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {pair.bid ? pair.bid.toFixed(pair.bid > 10 ? 3 : 5) : pair.price.toFixed(4)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {pair.ask ? pair.ask.toFixed(pair.ask > 10 ? 3 : 5) : (pair.price + 0.0001).toFixed(4)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-500 dark:text-[#868993] tabular-nums">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#2a2e39] text-[11px]">
                        {pair.spread || 0.8} pips
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`inline-flex items-center font-mono font-semibold tabular-nums ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPos ? '+' : ''}
                        {pair.changePercent.toFixed(2)}%
                      </div>
                    </td>

                    {/* Day Range Bar */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{pair.dayLow?.toFixed(4) || '1.0815'}</span>
                          <span>{pair.dayHigh?.toFixed(4) || '1.0855'}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-1.5 rounded-full mt-0.5 overflow-hidden">
                          <div className="bg-[#2962ff] h-full rounded-full" style={{ width: '58%' }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(pair);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#2962ff] hover:bg-[#2962ff]/10 rounded border border-[#2962ff]/30 transition-colors"
                      >
                        Chart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
