import React, { useState, useEffect } from 'react';
import { MarketAsset, AssetClass } from '../types/market';
import { Search, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAssets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allAssets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = allAssets.filter((a) => {
    const matchesQuery =
      a.symbol.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase());
    const matchesClass = filterClass === 'all' || a.assetClass === filterClass;
    return matchesQuery && matchesClass;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search markets, stocks, crypto, forex, indices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-[#131722] border border-slate-300 dark:border-[#363a45] rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Filter Badges */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#181c27] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {['all', 'stocks', 'crypto', 'forex', 'indices', 'futures', 'bonds'].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                filterClass === cls
                  ? 'bg-[#2962ff] text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-[#868993] hover:bg-slate-200 dark:hover:bg-[#202533]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-[#2a2e39]/60 p-2">
          {filtered.map((asset) => {
            const isPos = asset.changePercent >= 0;
            return (
              <button
                key={asset.symbol}
                onClick={() => {
                  onSelectAsset(asset);
                  onClose();
                }}
                className="w-full p-3 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#2a2e39]/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white">
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#2962ff] transition-colors text-xs sm:text-sm">
                        {asset.symbol}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#131722] text-slate-500 uppercase">
                        {asset.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#787b86] truncate max-w-xs">
                      {asset.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-semibold flex items-center justify-end tabular-nums ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    {isPos ? '+' : ''}
                    {asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching assets found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
