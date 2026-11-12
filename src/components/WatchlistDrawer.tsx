import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { X, Trash2, Plus, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onAddToWatchlist: (asset: MarketAsset) => void;
  allAssets: MarketAsset[];
  selectedSymbol: string;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  onSelectAsset,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  allAssets,
  selectedSymbol,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const candidateAssets = allAssets.filter(
    (a) =>
      !watchlist.some((w) => w.symbol === a.symbol) &&
      (a.symbol.toLowerCase().includes(filterQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-white dark:bg-[#131722] border-l border-slate-200 dark:border-[#2a2e39] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between bg-slate-50/70 dark:bg-[#181c27]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Watchlist
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#787b86]">
              {watchlist.length} tracked instruments · Real-time ticks
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-1.5 text-slate-600 dark:text-[#868993] hover:text-[#2962ff] dark:hover:text-[#2962ff] rounded-lg hover:bg-slate-200 dark:hover:bg-[#202533] transition-colors cursor-pointer"
              title="Add symbol to watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#202533] transition-colors cursor-pointer"
              title="Close Watchlist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Symbol Input dropdown */}
        {showAddMenu && (
          <div className="p-3 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-100/70 dark:bg-[#1e222d]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search symbol to add..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
                autoFocus
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
              {candidateAssets.slice(0, 5).map((asset) => (
                <div
                  key={asset.symbol}
                  className="py-1.5 px-2 flex items-center justify-between text-xs hover:bg-slate-200/60 dark:hover:bg-[#2a2e39] rounded"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 truncate">
                      {asset.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToWatchlist(asset);
                      setShowAddMenu(false);
                      setFilterQuery('');
                    }}
                    className="px-2 py-0.5 text-[11px] font-semibold text-white bg-[#2962ff] rounded hover:bg-[#1e53e5] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ))}
              {candidateAssets.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-2">
                  No matching un-tracked symbols found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Watchlist Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
          {watchlist.map((asset) => {
            const isPos = asset.changePercent >= 0;
            const isSelected = selectedSymbol === asset.symbol;

            return (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                    : 'hover:bg-slate-50 dark:hover:bg-[#1e222d]'
                }`}
              >
                {/* Left: Symbol & Exchange */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2962ff] transition-colors">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#787b86]">
                      {asset.exchange}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#787b86] truncate max-w-[140px]">
                    {asset.name}
                  </p>
                </div>

                {/* Right: Price & Change & Delete */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-[11px] font-mono font-semibold flex items-center justify-end tabular-nums ${
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
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(asset.symbol);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#f23645] rounded transition-opacity"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {watchlist.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No items in watchlist. Click the "+" button or "Watchlist" on any chart to track symbols.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
