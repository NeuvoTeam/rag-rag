import React, { useState } from 'react';
import { SECTOR_HEATMAP, CRYPTO_ASSETS, TOP_STOCKS } from '../data/marketData';
import { MarketAsset } from '../types/market';
import { Grid, Eye, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface HeatmapViewProps {
  onSelectAsset: (asset: MarketAsset) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ onSelectAsset }) => {
  const [activeMarket, setActiveMarket] = useState<'stocks' | 'crypto'>('stocks');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<{
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    marketCap: string;
  } | null>(null);

  // Color generator based on TradingView's distinct green-red palette
  const getPerformanceColor = (change: number) => {
    if (change >= 3) return 'bg-[#089981] hover:brightness-110 text-white';
    if (change >= 1) return 'bg-[#15803d] hover:brightness-110 text-white';
    if (change >= 0) return 'bg-[#1e3a2f] hover:brightness-110 text-white';
    if (change >= -1) return 'bg-[#3b2326] hover:brightness-110 text-white';
    if (change >= -3) return 'bg-[#be123c] hover:brightness-110 text-white';
    return 'bg-[#f23645] hover:brightness-110 text-white';
  };

  const handleStockClick = (symbol: string) => {
    const found = TOP_STOCKS.find((s) => s.symbol === symbol) || {
      symbol,
      name: symbol,
      exchange: 'NASDAQ',
      assetClass: 'stocks' as const,
      price: 150.0,
      change: 2.5,
      changePercent: 1.6,
      currency: 'USD',
      sparkline: [146, 148, 149, 150],
      marketCap: '500B',
      technicalRating: 'Buy' as const,
    };
    onSelectAsset(found);
  };

  const handleCryptoClick = (symbol: string) => {
    const found = CRYPTO_ASSETS.find((c) => c.symbol.startsWith(symbol)) || CRYPTO_ASSETS[0];
    onSelectAsset(found);
  };

  const filteredSectors =
    selectedSectorFilter === 'all'
      ? SECTOR_HEATMAP
      : SECTOR_HEATMAP.filter((s) => s.id === selectedSectorFilter);

  return (
    <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden p-4 sm:p-6">
      {/* Heatmap Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#2a2e39]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Market Heatmap
            </h2>
            <span className="text-xs text-slate-500 dark:text-[#787b86]">
              · Sized by Market Cap, Colored by Daily Performance
            </span>
          </div>
        </div>

        {/* Market Switcher & Sector Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
            <button
              onClick={() => setActiveMarket('stocks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeMarket === 'stocks'
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              S&P 500 Stocks
            </button>
            <button
              onClick={() => setActiveMarket('crypto')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeMarket === 'crypto'
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top Crypto Assets
            </button>
          </div>

          {activeMarket === 'stocks' && (
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-700 dark:text-[#d1d4dc] focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
            >
              <option value="all">All Sectors</option>
              {SECTOR_HEATMAP.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center justify-between py-3 text-xs text-slate-500 dark:text-[#787b86]">
        <div className="flex items-center gap-2">
          <span>Legend:</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#f23645] text-white">-3%+</span>
            <span className="px-1.5 py-0.5 rounded bg-[#be123c] text-white">-1%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#3b2326] text-white">0%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e3a2f] text-white">0%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#15803d] text-white">+1%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#089981] text-white">+3%+</span>
          </div>
        </div>

        {hoveredItem && (
          <div className="flex items-center gap-3 font-mono text-xs bg-slate-100 dark:bg-[#1e222d] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#2a2e39]">
            <strong className="text-slate-900 dark:text-white">{hoveredItem.symbol}</strong>
            <span className="text-slate-500 dark:text-[#787b86]">{hoveredItem.name}</span>
            <span className="text-slate-900 dark:text-white">${hoveredItem.price.toFixed(2)}</span>
            <span className={hoveredItem.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
              {hoveredItem.changePercent >= 0 ? '+' : ''}{hoveredItem.changePercent.toFixed(2)}%
            </span>
            <span className="text-slate-400">Cap: {hoveredItem.marketCap}</span>
          </div>
        )}
      </div>

      {/* S&P 500 Stocks Treemap Grid */}
      {activeMarket === 'stocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {filteredSectors.map((sector) => {
            const isPos = sector.changePercent >= 0;
            return (
              <div
                key={sector.id}
                className="bg-slate-50 dark:bg-[#181c27] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-3 flex flex-col"
              >
                {/* Sector header */}
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sector.name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#787b86]">
                      {sector.marketCap}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {sector.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Treemap Blocks */}
                <div className="grid grid-cols-3 gap-1.5 flex-1 min-h-[140px]">
                  {sector.stocks.map((stk) => {
                    const colSpan = stk.weight >= 35 ? 'col-span-2 row-span-2' : stk.weight >= 20 ? 'col-span-1 row-span-2' : 'col-span-1';
                    const colorClass = getPerformanceColor(stk.changePercent);

                    return (
                      <button
                        key={stk.symbol}
                        onClick={() => handleStockClick(stk.symbol)}
                        onMouseEnter={() => setHoveredItem(stk)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`${colSpan} ${colorClass} p-2.5 rounded-lg transition-all flex flex-col justify-between text-left cursor-pointer shadow-xs border border-white/10`}
                      >
                        <div className="flex items-baseline justify-between w-full">
                          <span className="text-xs sm:text-sm font-bold tracking-tight">
                            {stk.symbol}
                          </span>
                          <span className="text-[10px] opacity-75 hidden sm:inline">
                            {stk.marketCap}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="block text-xs sm:text-sm font-mono font-semibold tabular-nums">
                            {stk.changePercent >= 0 ? '+' : ''}
                            {stk.changePercent.toFixed(2)}%
                          </span>
                          <span className="text-[10px] opacity-80 block truncate">
                            ${stk.price.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crypto Heatmap Grid */}
      {activeMarket === 'crypto' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-2 min-h-[280px]">
          {CRYPTO_ASSETS.map((coin) => {
            const isPos = coin.changePercent >= 0;
            const colorClass = getPerformanceColor(coin.changePercent);

            return (
              <button
                key={coin.symbol}
                onClick={() => handleCryptoClick(coin.symbol)}
                onMouseEnter={() =>
                  setHoveredItem({
                    symbol: coin.symbol,
                    name: coin.name,
                    price: coin.price,
                    changePercent: coin.changePercent,
                    marketCap: coin.marketCap || 'N/A',
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
                className={`${colorClass} p-4 rounded-xl transition-all flex flex-col justify-between text-left cursor-pointer border border-white/10 shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{coin.name}</span>
                    <span className="text-[10px] opacity-80 font-mono">{coin.symbol.replace('USDT', '')}</span>
                  </div>
                  <span className="text-[11px] opacity-75 mt-0.5 block">
                    Cap: {coin.marketCap}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-base font-bold font-mono tabular-nums">
                    {isPos ? '+' : ''}{coin.changePercent.toFixed(2)}%
                  </div>
                  <div className="text-xs opacity-90 font-mono">
                    ${coin.price.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
