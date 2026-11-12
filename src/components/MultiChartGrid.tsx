import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { Superchart } from './Superchart';
import { LayoutGrid, Grid, Square, Columns } from 'lucide-react';

interface MultiChartGridProps {
  assets: MarketAsset[];
  onTrade: (asset: MarketAsset) => void;
  watchlist: MarketAsset[];
  onToggleWatchlist: (asset: MarketAsset) => void;
  onQuickOrder?: (side: 'BUY' | 'SELL', qty: number) => void;
}

export const MultiChartGrid: React.FC<MultiChartGridProps> = ({
  assets,
  onTrade,
  watchlist,
  onToggleWatchlist,
  onQuickOrder,
}) => {
  const [layoutMode, setLayoutMode] = useState<'2split' | '4grid'>('2split');

  // Selected tickers for slots
  const [slot1, setSlot1] = useState<string>(assets[0]?.symbol || 'NVDA');
  const [slot2, setSlot2] = useState<string>(assets[1]?.symbol || 'AAPL');
  const [slot3, setSlot3] = useState<string>('BTCUSDT');
  const [slot4, setSlot4] = useState<string>('SPX');

  const getAsset = (symbol: string) => {
    return assets.find((a) => a.symbol === symbol) || assets[0];
  };

  return (
    <div className="space-y-4">
      {/* Top Layout Controls */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-[#2962ff]" /> Multi-Chart Sync View
          </span>
          <span className="text-slate-400">· Real-time multi-asset correlation</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
            <button
              onClick={() => setLayoutMode('2split')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                layoutMode === '2split'
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> 2-Split
            </button>
            <button
              onClick={() => setLayoutMode('4grid')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                layoutMode === '4grid'
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> 4-Grid
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Supercharts */}
      <div
        className={`grid gap-4 ${
          layoutMode === '2split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">Slot 1</span>
            <select
              value={slot1}
              onChange={(e) => setSlot1(e.target.value)}
              className="bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded px-2 py-0.5 text-xs text-slate-900 dark:text-white font-mono"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} - {a.name}
                </option>
              ))}
            </select>
          </div>
          <Superchart
            asset={getAsset(slot1)}
            onTrade={onTrade}
            isWatchlisted={watchlist.some((w) => w.symbol === slot1)}
            onToggleWatchlist={onToggleWatchlist}
            onQuickOrder={onQuickOrder}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">Slot 2</span>
            <select
              value={slot2}
              onChange={(e) => setSlot2(e.target.value)}
              className="bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded px-2 py-0.5 text-xs text-slate-900 dark:text-white font-mono"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} - {a.name}
                </option>
              ))}
            </select>
          </div>
          <Superchart
            asset={getAsset(slot2)}
            onTrade={onTrade}
            isWatchlisted={watchlist.some((w) => w.symbol === slot2)}
            onToggleWatchlist={onToggleWatchlist}
            onQuickOrder={onQuickOrder}
          />
        </div>

        {layoutMode === '4grid' && (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">Slot 3</span>
                <select
                  value={slot3}
                  onChange={(e) => setSlot3(e.target.value)}
                  className="bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded px-2 py-0.5 text-xs text-slate-900 dark:text-white font-mono"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <Superchart
                asset={getAsset(slot3)}
                onTrade={onTrade}
                isWatchlisted={watchlist.some((w) => w.symbol === slot3)}
                onToggleWatchlist={onToggleWatchlist}
                onQuickOrder={onQuickOrder}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">Slot 4</span>
                <select
                  value={slot4}
                  onChange={(e) => setSlot4(e.target.value)}
                  className="bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded px-2 py-0.5 text-xs text-slate-900 dark:text-white font-mono"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <Superchart
                asset={getAsset(slot4)}
                onTrade={onTrade}
                isWatchlisted={watchlist.some((w) => w.symbol === slot4)}
                onToggleWatchlist={onToggleWatchlist}
                onQuickOrder={onQuickOrder}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
