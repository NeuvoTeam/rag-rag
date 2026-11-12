import React from 'react';
import { MarketAsset, MarketOverviewData } from '../types/market';
import { ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, Zap, Gauge } from 'lucide-react';

interface CryptoDashboardProps {
  cryptoAssets: MarketAsset[];
  overview: MarketOverviewData;
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({
  cryptoAssets,
  overview,
  onSelectAsset,
  selectedSymbol,
}) => {
  const fg = overview.fearAndGreedIndex;

  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 64;
    const height = 22;

    const pathData = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#089981' : '#f23645';

    return (
      <svg width={width} height={height} className="overflow-visible">
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
    <div className="space-y-6">
      {/* Macro Crypto Metrics & Fear & Greed Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Cap */}
        <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#787b86]">
            <span>Total Crypto Market Cap</span>
            <span className="text-[#089981] font-mono font-semibold">+2.18%</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {overview.globalStats.totalCryptoMarketCap}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across 14,200+ tracked digital assets
          </p>
        </div>

        {/* BTC Dominance */}
        <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#787b86]">
            <span>Bitcoin Dominance (BTC.D)</span>
            <span className="text-[#2962ff] font-mono font-semibold">Macro Core</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {overview.globalStats.btcDominance}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#f59e0b] h-full rounded-full"
              style={{ width: `${overview.globalStats.btcDominance}%` }}
            />
          </div>
        </div>

        {/* 24h Volume */}
        <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#787b86]">
            <span>24h Global Volume</span>
            <span className="text-slate-400 font-mono">Spot + Perps</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            $84.2 Billion
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            High liquidity on major spot exchanges
          </p>
        </div>

        {/* Crypto Fear & Greed Index Gauge */}
        <div className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#787b86]">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#089981]" /> Fear & Greed Index
            </span>
            <span className="text-xs font-semibold text-[#089981]">{fg.rating}</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {fg.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-right font-mono text-slate-500 dark:text-[#787b86]">
              <div>Prev: <strong className="text-slate-700 dark:text-[#d1d4dc]">{fg.previousClose}</strong></div>
              <div>Last Wk: <strong className="text-slate-700 dark:text-[#d1d4dc]">{fg.lastWeek}</strong></div>
            </div>
          </div>

          {/* Color meter gradient */}
          <div className="w-full h-2 rounded-full mt-2 bg-gradient-to-r from-[#f23645] via-amber-400 to-[#089981] relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-900 rounded-full shadow-sm"
              style={{ left: `calc(${fg.score}% - 6px)` }}
            />
          </div>
        </div>
      </div>

      {/* Crypto Assets Table */}
      <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Leading Cryptocurrencies
          </h3>
          <span className="text-xs text-slate-500 dark:text-[#787b86]">
            Ranked by Market Capitalization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] text-[11px] font-semibold text-slate-500 dark:text-[#787b86] uppercase tracking-wider">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">24h Volume</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Market Cap</th>
                <th className="py-3 px-4 hidden lg:table-cell">7D Trend</th>
                <th className="py-3 px-4 text-center">Technical Rating</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
              {cryptoAssets.map((asset) => {
                const isPos = asset.changePercent >= 0;
                const isSelected = selectedSymbol === asset.symbol;

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => onSelectAsset(asset)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1e222d]'
                    }`}
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[10px]">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {asset.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-[#787b86]">
                              {asset.symbol.replace('USDT', '')}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-[#787b86]">
                            {asset.exchange}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 1 ? 4 : 2 })}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`inline-flex items-center font-mono font-semibold tabular-nums ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {isPos ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-[#d1d4dc] hidden sm:table-cell tabular-nums">
                      ${asset.volume || '1.2B'}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white hidden md:table-cell tabular-nums">
                      ${asset.marketCap || '—'}
                    </td>

                    {/* Sparkline */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      {renderSparkline(asset.sparkline, isPos)}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          asset.technicalRating?.includes('Buy')
                            ? 'bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]'
                            : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
                        }`}
                      >
                        {asset.technicalRating || 'Buy'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
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
