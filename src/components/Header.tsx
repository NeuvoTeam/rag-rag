import React, { useState } from 'react';
import { Search, Sun, Moon, Bookmark, Globe, ChevronDown, TrendingUp } from 'lucide-react';
import { AssetClass } from '../types/market';

interface HeaderProps {
  activeTab: AssetClass;
  setActiveTab: (tab: AssetClass) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  selectedRegion,
  setSelectedRegion,
}) => {
  const [showRegionMenu, setShowRegionMenu] = useState(false);

  const regions = [
    { code: 'US', label: 'United States (NYSE / NASDAQ)' },
    { code: 'EU', label: 'Europe (LSE / Euronext / Xetra)' },
    { code: 'ASIA', label: 'Asia-Pacific (Tokyo / HK / SG)' },
    { code: 'GLOBAL', label: 'World Macro' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39] dark:border-[#2a2e39] bg-white dark:bg-[#131722] text-[#131722] dark:text-[#d1d4dc] transition-colors">
      {/* Top 3-Zone Bar */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white shadow-sm shadow-[#2962ff]/30">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              TradingView <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-[#2962ff]/20 text-[#2962ff] ml-1">MARKETS</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-[#868993]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'overview' ? 'text-[#2962ff] dark:text-[#2962ff] font-semibold' : ''
            }`}
          >
            Markets Today
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'stocks' ? 'text-[#2962ff] dark:text-[#2962ff] font-semibold' : ''
            }`}
          >
            Supercharts
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'heatmap' ? 'text-[#2962ff] dark:text-[#2962ff] font-semibold' : ''
            }`}
          >
            Heatmaps
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'crypto' ? 'text-[#2962ff] dark:text-[#2962ff] font-semibold' : ''
            }`}
          >
            Crypto Screener
          </button>
          <button
            onClick={() => setActiveTab('forex')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'forex' ? 'text-[#2962ff] dark:text-[#2962ff] font-semibold' : ''
            }`}
          >
            Forex Crosses
          </button>
        </nav>

        {/* Zone 3: Functional Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-[#868993] bg-slate-100 dark:bg-[#1e222d] hover:bg-slate-200 dark:hover:bg-[#2a2e39] border border-slate-200 dark:border-[#2a2e39] rounded-lg transition-colors cursor-pointer"
            title="Search tickers and markets"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search markets</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#131722] border border-slate-300 dark:border-[#363a45] rounded text-slate-500 dark:text-[#787b86]">
              ⌘K
            </kbd>
          </button>

          {/* Region Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRegionMenu(!showRegionMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-[#d1d4dc] bg-slate-100 dark:bg-[#1e222d] hover:bg-slate-200 dark:hover:bg-[#2a2e39] border border-slate-200 dark:border-[#2a2e39] rounded-lg transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-[#868993]" />
              <span className="font-semibold">{selectedRegion}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRegionMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowRegionMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-64 p-1 bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl shadow-xl z-40">
                  <div className="px-3 py-2 text-[11px] font-medium text-slate-400 dark:text-[#787b86] uppercase tracking-wider">
                    Select Market Region
                  </div>
                  {regions.map((reg) => (
                    <button
                      key={reg.code}
                      onClick={() => {
                        setSelectedRegion(reg.code);
                        setShowRegionMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        selectedRegion === reg.code
                          ? 'bg-[#2962ff]/10 text-[#2962ff] font-semibold'
                          : 'text-slate-700 dark:text-[#d1d4dc] hover:bg-slate-100 dark:hover:bg-[#2a2e39]'
                      }`}
                    >
                      <span>{reg.label}</span>
                      {selectedRegion === reg.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2962ff]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e222d] hover:bg-slate-200 dark:hover:bg-[#2a2e39] border border-slate-200 dark:border-[#2a2e39] rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Watchlist Drawer Toggle */}
          <button
            onClick={onToggleWatchlist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#2962ff] hover:bg-[#1e53e5] rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-[#2962ff]/30 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Watchlist</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-white/20 rounded-full">
              {watchlistCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
