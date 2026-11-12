import React from 'react';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight, ShieldAlert, TrendingUp } from 'lucide-react';

interface BondsDashboardProps {
  bonds: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const BondsDashboard: React.FC<BondsDashboardProps> = ({
  bonds,
  onSelectAsset,
  selectedSymbol,
}) => {
  // Yield curve maturities
  const yieldCurve = [
    { tenor: '1M', yield: 4.85 },
    { tenor: '3M', yield: 4.62 },
    { tenor: '6M', yield: 4.45 },
    { tenor: '1Y', yield: 4.22 },
    { tenor: '2Y', yield: 4.08 },
    { tenor: '5Y', yield: 4.05 },
    { tenor: '10Y', yield: 4.24 },
    { tenor: '20Y', yield: 4.58 },
    { tenor: '30Y', yield: 4.51 },
  ];

  const minYield = 3.8;
  const maxYield = 5.0;

  const getCurveY = (y: number) => {
    return 160 - ((y - minYield) / (maxYield - minYield)) * 120;
  };

  const getCurveX = (index: number) => {
    return 50 + (index / (yieldCurve.length - 1)) * 520;
  };

  return (
    <div className="space-y-6">
      {/* Yield Curve & Macro Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* US Treasury Yield Curve SVG */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2a2e39]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                US Treasury Yield Curve
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#787b86]">
                Benchmark yields across short-term bills to 30-year sovereign bonds
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-[#2962ff] bg-blue-50 dark:bg-[#2962ff]/10 px-2.5 py-1 rounded-lg">
              10Y - 2Y Spread: +16 bps (Normalizing)
            </span>
          </div>

          {/* Curve Graphic */}
          <div className="mt-4 overflow-x-auto">
            <svg viewBox="0 0 620 200" className="w-full h-[200px]">
              {/* Horizontal gridlines */}
              {[4.0, 4.3, 4.6, 4.9].map((lvl) => {
                const y = getCurveY(lvl);
                return (
                  <g key={lvl}>
                    <line x1={40} y1={y} x2={580} y2={y} stroke="#2a2e39" strokeDasharray="3 3" opacity={0.6} />
                    <text x={10} y={y + 4} fill="#787b86" fontSize="10" fontFamily="JetBrains Mono">
                      {lvl.toFixed(1)}%
                    </text>
                  </g>
                );
              })}

              {/* Curve line */}
              <path
                d={yieldCurve
                  .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getCurveX(i)} ${getCurveY(pt.yield)}`)
                  .join(' ')}
                fill="none"
                stroke="#2962ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {yieldCurve.map((pt, i) => {
                const cx = getCurveX(i);
                const cy = getCurveY(pt.yield);
                return (
                  <g key={pt.tenor}>
                    <circle cx={cx} cy={cy} r="4" fill="#2962ff" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={cx}
                      y={cy - 9}
                      fill="#d1d4dc"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pt.yield.toFixed(2)}%
                    </text>
                    <text
                      x={cx}
                      y={185}
                      fill="#787b86"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {pt.tenor}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Macro Monetary Bar */}
        <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Central Bank Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#787b86] mt-0.5">
              Current benchmark policy rates
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2a2e39]">
                <span className="font-sans text-slate-700 dark:text-[#d1d4dc]">US Federal Reserve</span>
                <span className="font-bold text-slate-900 dark:text-white">4.75% - 5.00%</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2a2e39]">
                <span className="font-sans text-slate-700 dark:text-[#d1d4dc]">European Central Bank</span>
                <span className="font-bold text-slate-900 dark:text-white">3.25%</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2a2e39]">
                <span className="font-sans text-slate-700 dark:text-[#d1d4dc]">Bank of England</span>
                <span className="font-bold text-slate-900 dark:text-white">5.00%</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2a2e39]">
                <span className="font-sans text-slate-700 dark:text-[#d1d4dc]">Bank of Japan</span>
                <span className="font-bold text-slate-900 dark:text-white">0.25%</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-[#2962ff]/10 border border-[#2962ff]/20 text-[11px] text-slate-600 dark:text-[#868993] mt-4">
            Yield curve inverted regime ended in late 2024 as market anticipates gradual rate normalization.
          </div>
        </div>
      </div>

      {/* Global Sovereign Bonds Table */}
      <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Global 10-Year Government Bond Yields
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] text-[11px] font-semibold text-slate-500 dark:text-[#787b86] uppercase tracking-wider">
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4 text-right">Yield</th>
                <th className="py-3 px-4 text-right">Change (bps)</th>
                <th className="py-3 px-4 text-right">Change %</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">52W High</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">52W Low</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
              {bonds.map((bond) => {
                const isPos = bond.changePercent >= 0;
                const isSelected = selectedSymbol === bond.symbol;

                return (
                  <tr
                    key={bond.symbol}
                    onClick={() => onSelectAsset(bond)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1e222d]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {bond.symbol}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-[#787b86]">
                          {bond.name}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {bond.price.toFixed(2)}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                      {isPos ? '+' : ''}{(bond.change * 100).toFixed(0)} bps
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`inline-flex items-center font-mono font-semibold tabular-nums ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPos ? '+' : ''}
                        {bond.changePercent.toFixed(2)}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-[#787b86] hidden sm:table-cell tabular-nums">
                      {bond.high52w ? `${bond.high52w.toFixed(2)}%` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-[#787b86] hidden sm:table-cell tabular-nums">
                      {bond.low52w ? `${bond.low52w.toFixed(2)}%` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(bond);
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
