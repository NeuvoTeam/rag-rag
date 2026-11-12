import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GLOBAL_INDICES,
  TOP_STOCKS,
  CRYPTO_ASSETS,
  FOREX_PAIRS,
  COMMODITIES_FUTURES,
  BONDS_DATA,
  MARKET_OVERVIEW_DATA
} from './data/marketData';
import { MarketAsset, AssetClass } from './types/market';
import { Header } from './components/Header';
import { MarketTabs } from './components/MarketTabs';
import { GlobalIndicesStrip } from './components/GlobalIndicesStrip';
import { Superchart } from './components/Superchart';
import { MoversSection } from './components/MoversSection';
import { HeatmapView } from './components/HeatmapView';
import { MarketScreener } from './components/MarketScreener';
import { CryptoDashboard } from './components/CryptoDashboard';
import { ForexDashboard } from './components/ForexDashboard';
import { BondsDashboard } from './components/BondsDashboard';
import { CalendarNewsSection } from './components/CalendarNewsSection';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';
import { TradeModal } from './components/TradeModal';
import { TrendingUp, Activity, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export default function App() {
  // Theme state: default dark mode (TradingView signature)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AssetClass>('overview');

  // Selected asset for Superchart
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(TOP_STOCKS[0]); // NVDA default

  // Watchlist
  const [watchlist, setWatchlist] = useState<MarketAsset[]>([
    TOP_STOCKS[0], // NVDA
    TOP_STOCKS[1], // AAPL
    TOP_STOCKS[5], // TSLA
    CRYPTO_ASSETS[0], // BTC
    GLOBAL_INDICES[0], // SPX
  ]);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Trade Modal
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeToast, setTradeToast] = useState<string | null>(null);

  // Market Region
  const [selectedRegion, setSelectedRegion] = useState('US');

  // Live mutable asset state to simulate real-time market ticking
  const [liveStocks, setLiveStocks] = useState<MarketAsset[]>(TOP_STOCKS);
  const [liveCrypto, setLiveCrypto] = useState<MarketAsset[]>(CRYPTO_ASSETS);
  const [liveIndices, setLiveIndices] = useState<MarketAsset[]>(GLOBAL_INDICES);
  const [liveForex, setLiveForex] = useState<MarketAsset[]>(FOREX_PAIRS);
  const [liveFutures, setLiveFutures] = useState<MarketAsset[]>(COMMODITIES_FUTURES);
  const [liveBonds, setLiveBonds] = useState<MarketAsset[]>(BONDS_DATA);

  // Master asset catalog
  const allAssets = useMemo(() => {
    return [
      ...liveStocks,
      ...liveCrypto,
      ...liveIndices,
      ...liveForex,
      ...liveFutures,
      ...liveBonds,
    ];
  }, [liveStocks, liveCrypto, liveIndices, liveForex, liveFutures, liveBonds]);

  // Sync selectedAsset when live values update
  useEffect(() => {
    const fresh = allAssets.find((a) => a.symbol === selectedAsset.symbol);
    if (fresh) {
      setSelectedAsset(fresh);
    }
  }, [allAssets, selectedAsset.symbol]);

  // Toggle Dark/Light Theme on <html>
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Ensure dark class is initially attached
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulated live market price ticking engine (every 2.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random stock to tick
      setLiveStocks((prev) => {
        const next = [...prev];
        const randIdx = Math.floor(Math.random() * next.length);
        const item = next[randIdx];
        const delta = (Math.random() - 0.49) * (item.price * 0.003);
        const newPrice = Math.max(1, Number((item.price + delta).toFixed(2)));
        const newChange = Number((item.change + delta).toFixed(2));
        const newChangePct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        const newSparkline = [...item.sparkline.slice(1), newPrice];

        next[randIdx] = {
          ...item,
          price: newPrice,
          change: newChange,
          changePercent: newChangePct,
          sparkline: newSparkline,
        };
        return next;
      });

      // Pick random crypto to tick
      setLiveCrypto((prev) => {
        const next = [...prev];
        const randIdx = Math.floor(Math.random() * next.length);
        const item = next[randIdx];
        const delta = (Math.random() - 0.48) * (item.price * 0.004);
        const newPrice = Math.max(0.0001, Number((item.price + delta).toFixed(item.price < 1 ? 4 : 2)));
        const newChange = Number((item.change + delta).toFixed(2));
        const newChangePct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        const newSparkline = [...item.sparkline.slice(1), newPrice];

        next[randIdx] = {
          ...item,
          price: newPrice,
          change: newChange,
          changePercent: newChangePct,
          sparkline: newSparkline,
        };
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Watchlist handlers
  const handleToggleWatchlist = (asset: MarketAsset) => {
    setWatchlist((prev) => {
      const exists = prev.some((w) => w.symbol === asset.symbol);
      if (exists) {
        return prev.filter((w) => w.symbol !== asset.symbol);
      } else {
        return [...prev, asset];
      }
    });
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
  };

  const handleAddToWatchlist = (asset: MarketAsset) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.symbol === asset.symbol)) return prev;
      return [...prev, asset];
    });
  };

  const isWatchlisted = watchlist.some((w) => w.symbol === selectedAsset.symbol);

  // Execute trade callback
  const handleExecuteTrade = (trade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
  }) => {
    setTradeToast(
      `${trade.side} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)} executed!`
    );
    setTimeout(() => setTradeToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#131722] text-slate-900 dark:text-[#d1d4dc] transition-colors flex flex-col">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlist.length}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {/* 2. Market Tabs Sub-Navigation */}
      <MarketTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Global Indices Live Strip */}
      <GlobalIndicesStrip
        indices={liveIndices}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
        selectedSymbol={selectedAsset.symbol}
      />

      {/* 4. Main Viewport Content */}
      <main className="max-w-[1720px] w-full mx-auto px-4 lg:px-6 py-6 space-y-6 flex-1">
        {/* Trade Execution Feedback Toast */}
        {tradeToast && (
          <div className="p-3 bg-[#089981] text-white rounded-xl shadow-lg flex items-center justify-between font-mono text-xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{tradeToast}</span>
            </div>
            <button
              onClick={() => setTradeToast(null)}
              className="text-white/80 hover:text-white text-xs px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Routing */}

        {/* TAB: OVERVIEW (The flagship TradingView Markets experience) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Split: Interactive Superchart for Selected Instrument */}
            <section aria-label="Interactive Chart">
              <Superchart
                asset={selectedAsset}
                onTrade={() => setIsTradeOpen(true)}
                isWatchlisted={isWatchlisted}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </section>

            {/* Movers Grid (Gainers, Losers, Most Active) */}
            <section aria-label="Market Movers">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Market Movers Today
                </h2>
                <span className="text-xs text-slate-500 dark:text-[#787b86]">
                  Click any stock to inspect chart
                </span>
              </div>
              <MoversSection
                stocks={liveStocks}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
                selectedSymbol={selectedAsset.symbol}
              />
            </section>

            {/* Visual Heatmap Preview */}
            <section aria-label="Heatmap">
              <HeatmapView
                onSelectAsset={(asset) => {
                  setSelectedAsset(asset);
                }}
              />
            </section>

            {/* Economic Calendar, Market News & Trade Ideas */}
            <section aria-label="Calendars, News and Ideas">
              <CalendarNewsSection />
            </section>
          </div>
        )}

        {/* TAB: STOCKS */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <Superchart
              asset={selectedAsset}
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={handleToggleWatchlist}
            />
            <MoversSection
              stocks={liveStocks}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
            <MarketScreener
              stocks={liveStocks}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* TAB: CRYPTO */}
        {activeTab === 'crypto' && (
          <div className="space-y-6">
            <Superchart
              asset={
                selectedAsset.assetClass === 'crypto'
                  ? selectedAsset
                  : liveCrypto[0]
              }
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={watchlist.some(
                (w) =>
                  w.symbol ===
                  (selectedAsset.assetClass === 'crypto'
                    ? selectedAsset.symbol
                    : liveCrypto[0].symbol)
              )}
              onToggleWatchlist={handleToggleWatchlist}
            />
            <CryptoDashboard
              cryptoAssets={liveCrypto}
              overview={MARKET_OVERVIEW_DATA}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* TAB: FOREX */}
        {activeTab === 'forex' && (
          <div className="space-y-6">
            <Superchart
              asset={
                selectedAsset.assetClass === 'forex'
                  ? selectedAsset
                  : liveForex[0]
              }
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={watchlist.some(
                (w) =>
                  w.symbol ===
                  (selectedAsset.assetClass === 'forex'
                    ? selectedAsset.symbol
                    : liveForex[0].symbol)
              )}
              onToggleWatchlist={handleToggleWatchlist}
            />
            <ForexDashboard
              forexPairs={liveForex}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* TAB: INDICES */}
        {activeTab === 'indices' && (
          <div className="space-y-6">
            <Superchart
              asset={
                selectedAsset.assetClass === 'indices'
                  ? selectedAsset
                  : liveIndices[0]
              }
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={watchlist.some(
                (w) =>
                  w.symbol ===
                  (selectedAsset.assetClass === 'indices'
                    ? selectedAsset.symbol
                    : liveIndices[0].symbol)
              )}
              onToggleWatchlist={handleToggleWatchlist}
            />
            <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  World Major Benchmark Indices
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#181c27] text-[11px] text-slate-500 uppercase">
                      <th className="py-3 px-4">Index</th>
                      <th className="py-3 px-4 text-right">Last Price</th>
                      <th className="py-3 px-4 text-right">Change</th>
                      <th className="py-3 px-4 text-right">Change %</th>
                      <th className="py-3 px-4 text-center">Technical Rating</th>
                      <th className="py-3 px-4 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
                    {liveIndices.map((idx) => {
                      const isPos = idx.changePercent >= 0;
                      return (
                        <tr
                          key={idx.symbol}
                          onClick={() => setSelectedAsset(idx)}
                          className="hover:bg-slate-50 dark:hover:bg-[#1e222d] cursor-pointer"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {idx.symbol}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              {idx.name} ({idx.exchange})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                            {isPos ? '+' : ''}{idx.change.toFixed(2)}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]">
                              {idx.technicalRating}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedAsset(idx)}
                              className="px-2.5 py-1 text-[11px] font-medium text-[#2962ff] hover:bg-[#2962ff]/10 rounded border border-[#2962ff]/30"
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
        )}

        {/* TAB: FUTURES */}
        {activeTab === 'futures' && (
          <div className="space-y-6">
            <Superchart
              asset={
                selectedAsset.assetClass === 'futures'
                  ? selectedAsset
                  : liveFutures[0]
              }
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={watchlist.some(
                (w) =>
                  w.symbol ===
                  (selectedAsset.assetClass === 'futures'
                    ? selectedAsset.symbol
                    : liveFutures[0].symbol)
              )}
              onToggleWatchlist={handleToggleWatchlist}
            />
            <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Energy, Metals & Commodity Futures (Continuous 1!)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#181c27] text-[11px] text-slate-500 uppercase">
                      <th className="py-3 px-4">Contract</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-right">Change</th>
                      <th className="py-3 px-4 text-right">Change %</th>
                      <th className="py-3 px-4 text-right hidden sm:table-cell">Volume</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
                    {liveFutures.map((fut) => {
                      const isPos = fut.changePercent >= 0;
                      return (
                        <tr
                          key={fut.symbol}
                          onClick={() => setSelectedAsset(fut)}
                          className="hover:bg-slate-50 dark:hover:bg-[#1e222d] cursor-pointer"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {fut.symbol}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              {fut.name} ({fut.exchange})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            ${fut.price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-900 dark:text-white tabular-nums">
                            {isPos ? '+' : ''}{fut.change.toFixed(2)}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {isPos ? '+' : ''}{fut.changePercent.toFixed(2)}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500 hidden sm:table-cell tabular-nums">
                            {fut.volume}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedAsset(fut)}
                              className="px-2.5 py-1 text-[11px] font-medium text-[#2962ff] hover:bg-[#2962ff]/10 rounded border border-[#2962ff]/30"
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
        )}

        {/* TAB: BONDS */}
        {activeTab === 'bonds' && (
          <div className="space-y-6">
            <BondsDashboard
              bonds={liveBonds}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* TAB: HEATMAP */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <HeatmapView
              onSelectAsset={(asset) => {
                setSelectedAsset(asset);
                setActiveTab('stocks');
              }}
            />
          </div>
        )}
      </main>

      {/* 5. Minimal Clean Editorial Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#131722] py-6 px-4 lg:px-6 text-xs text-slate-500 dark:text-[#787b86] transition-colors mt-auto">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white">
              TradingView Markets
            </span>
            <span>·</span>
            <span>Real-time global market quotes & financial analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">UTC-5 New York</span>
            <span>·</span>
            <span>Data powered by simulated institutional feed</span>
          </div>
        </div>
      </footer>

      {/* 6. Side Watchlist Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
          setIsWatchlistOpen(false);
        }}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onAddToWatchlist={handleAddToWatchlist}
        allAssets={allAssets}
        selectedSymbol={selectedAsset.symbol}
      />

      {/* 7. Universal Search Modal (Command Palette) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allAssets={allAssets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* 8. Paper Trade Order Simulator Modal */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        asset={selectedAsset}
        onExecuteTrade={handleExecuteTrade}
      />
    </div>
  );
}
