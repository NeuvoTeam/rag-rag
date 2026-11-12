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
import { MarketAsset, AssetClass, Position, PriceAlert } from './types/market';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketTabs } from './components/MarketTabs';
import { GlobalIndicesStrip } from './components/GlobalIndicesStrip';
import { Superchart } from './components/Superchart';
import { MoversSection } from './components/MoversSection';
import { HeatmapView } from './components/HeatmapView';
import { MarketScreener } from './components/MarketScreener';
import { SectorMatrix } from './components/SectorMatrix';
import { EarningsCalendar } from './components/EarningsCalendar';
import { MultiChartGrid } from './components/MultiChartGrid';
import { CryptoDashboard } from './components/CryptoDashboard';
import { ForexDashboard } from './components/ForexDashboard';
import { BondsDashboard } from './components/BondsDashboard';
import { CalendarNewsSection } from './components/CalendarNewsSection';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';
import { TradeModal } from './components/TradeModal';
import { PortfolioDrawer } from './components/PortfolioDrawer';
import { AlertsModal } from './components/AlertsModal';
import { CheckCircle2, Bell, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<AssetClass>('overview');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(TOP_STOCKS[0]); // NVDA default
  const [selectedRegion, setSelectedRegion] = useState('US');

  // Watchlist
  const [watchlist, setWatchlist] = useState<MarketAsset[]>([
    TOP_STOCKS[0], // NVDA
    TOP_STOCKS[1], // AAPL
    TOP_STOCKS[5], // TSLA
    CRYPTO_ASSETS[0], // BTC
    GLOBAL_INDICES[0], // SPX
  ]);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [tradeToast, setTradeToast] = useState<string | null>(null);

  // Paper Trading Portfolio State
  const [cashBalance, setCashBalance] = useState<number>(100000.0);
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos-1',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      side: 'BUY',
      quantity: 50,
      entryPrice: 138.2,
      currentPrice: 141.54,
      pnl: (141.54 - 138.2) * 50,
      pnlPercent: ((141.54 - 138.2) / 138.2) * 100,
      openTime: '10:14 AM',
    },
    {
      id: 'pos-2',
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      side: 'BUY',
      quantity: 0.5,
      entryPrice: 67100.0,
      currentPrice: 68420.5,
      pnl: (68420.5 - 67100.0) * 0.5,
      pnlPercent: ((68420.5 - 67100.0) / 67100.0) * 100,
      openTime: '09:45 AM',
    },
  ]);

  // Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'al-1',
      symbol: 'NVDA',
      targetPrice: 145.0,
      condition: 'CROSSES_ABOVE',
      createdAt: '10:00 AM',
      triggered: false,
    },
    {
      id: 'al-2',
      symbol: 'BTCUSDT',
      targetPrice: 70000.0,
      condition: 'CROSSES_ABOVE',
      createdAt: '09:30 AM',
      triggered: false,
    },
  ]);

  // Live mutable asset states for realistic ticking
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

  // Update selectedAsset and portfolio positions on ticks
  useEffect(() => {
    const fresh = allAssets.find((a) => a.symbol === selectedAsset.symbol);
    if (fresh) {
      setSelectedAsset(fresh);
    }

    // Update mark-to-market positions
    setPositions((prev) =>
      prev.map((pos) => {
        const item = allAssets.find((a) => a.symbol === pos.symbol);
        if (!item) return pos;
        const curPrice = item.price;
        const pnl =
          pos.side === 'BUY'
            ? (curPrice - pos.entryPrice) * pos.quantity
            : (pos.entryPrice - curPrice) * pos.quantity;
        const pnlPercent = (pnl / (pos.entryPrice * pos.quantity)) * 100;
        return {
          ...pos,
          currentPrice: curPrice,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      })
    );
  }, [allAssets, selectedAsset.symbol]);

  // Calculate Net Equity
  const netEquity = useMemo(() => {
    const totalPosValue = positions.reduce((acc, p) => acc + p.quantity * p.currentPrice, 0);
    return cashBalance + totalPosValue;
  }, [cashBalance, positions]);

  // Dark/Light Theme toggle
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

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
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

  // Ticking Engine & Alert Evaluator
  useEffect(() => {
    const interval = setInterval(() => {
      // Tick stock
      setLiveStocks((prev) => {
        const next = [...prev];
        const randIdx = Math.floor(Math.random() * next.length);
        const item = next[randIdx];
        const delta = (Math.random() - 0.49) * (item.price * 0.003);
        const newPrice = Math.max(1, Number((item.price + delta).toFixed(2)));
        const newChange = Number((item.change + delta).toFixed(2));
        const newChangePct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        const newSparkline = [...item.sparkline.slice(1), newPrice];

        // Check alerts
        alerts.forEach((al) => {
          if (al.symbol === item.symbol && !al.triggered) {
            if (
              (al.condition === 'CROSSES_ABOVE' && newPrice >= al.targetPrice) ||
              (al.condition === 'CROSSES_BELOW' && newPrice <= al.targetPrice)
            ) {
              setTradeToast(`🔔 ALERT: ${al.symbol} reached target $${al.targetPrice}!`);
              setAlerts((aList) =>
                aList.map((a) => (a.id === al.id ? { ...a, triggered: true } : a))
              );
            }
          }
        });

        next[randIdx] = {
          ...item,
          price: newPrice,
          change: newChange,
          changePercent: newChangePct,
          sparkline: newSparkline,
        };
        return next;
      });

      // Tick crypto
      setLiveCrypto((prev) => {
        const next = [...prev];
        const randIdx = Math.floor(Math.random() * next.length);
        const item = next[randIdx];
        const delta = (Math.random() - 0.485) * (item.price * 0.004);
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
    }, 2400);

    return () => clearInterval(interval);
  }, [alerts]);

  // Watchlist handlers
  const handleToggleWatchlist = (asset: MarketAsset) => {
    setWatchlist((prev) => {
      const exists = prev.some((w) => w.symbol === asset.symbol);
      return exists ? prev.filter((w) => w.symbol !== asset.symbol) : [...prev, asset];
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

  // Paper Trade execution
  const handleExecuteTrade = (trade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
  }) => {
    if (cashBalance < trade.total && trade.side === 'BUY') {
      setTradeToast('⚠️ Insufficient paper cash balance.');
      return;
    }

    // Deduct cash if Buy, add if Sell
    setCashBalance((prev) => (trade.side === 'BUY' ? prev - trade.total : prev + trade.total));

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: trade.symbol,
      name: selectedAsset.name,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.price,
      currentPrice: trade.price,
      pnl: 0,
      pnlPercent: 0,
      openTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPositions((prev) => [newPosition, ...prev]);
    setTradeToast(`PRO ORDER: ${trade.side} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)} executed!`);
    setTimeout(() => setTradeToast(null), 4000);
  };

  // Close position
  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const returnCash = pos.quantity * pos.currentPrice;
    setCashBalance((prev) => prev + returnCash);
    setPositions((prev) => prev.filter((p) => p.id !== id));
    setTradeToast(`Closed ${pos.symbol} position with ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)} P&L`);
    setTimeout(() => setTradeToast(null), 4000);
  };

  const handleResetPortfolio = () => {
    setCashBalance(100000.0);
    setPositions([]);
    setTradeToast('Paper Portfolio reset to $100,000 cash balance.');
    setTimeout(() => setTradeToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#131722] text-slate-900 dark:text-[#d1d4dc] transition-colors flex flex-col font-sans">
      {/* 1. Top Running Ticker Tape Ribbon */}
      <TickerTape
        assets={allAssets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
        selectedSymbol={selectedAsset.symbol}
      />

      {/* 2. Top Header (Top Bar Contract + Pro Controls) */}
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
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        netEquity={netEquity}
        alertCount={alerts.filter((a) => !a.triggered).length}
      />

      {/* 3. Sub-Header Asset Class Tabs */}
      <MarketTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 4. Global Indices Live Strip */}
      <GlobalIndicesStrip
        indices={liveIndices}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
        selectedSymbol={selectedAsset.symbol}
      />

      {/* 5. Main Content Viewport */}
      <main className="max-w-[1720px] w-full mx-auto px-4 lg:px-6 py-6 space-y-6 flex-1">
        {/* Dynamic Trade / Alert Toast */}
        {tradeToast && (
          <div className="p-3 bg-[#089981] text-white rounded-xl shadow-xl flex items-center justify-between font-mono text-xs animate-in slide-in-from-top duration-200">
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

        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Interactive Pro Superchart */}
            <section aria-label="Pro Superchart">
              <Superchart
                asset={selectedAsset}
                onTrade={() => setIsTradeOpen(true)}
                isWatchlisted={isWatchlisted}
                onToggleWatchlist={handleToggleWatchlist}
                onQuickOrder={(side, qty) =>
                  handleExecuteTrade({
                    symbol: selectedAsset.symbol,
                    side,
                    quantity: qty,
                    price: selectedAsset.price,
                    total: selectedAsset.price * qty,
                  })
                }
              />
            </section>

            {/* Movers Grid */}
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

            {/* S&P 500 11 GICS Sector Performance Matrix */}
            <section aria-label="Sector Matrix">
              <SectorMatrix
                onSelectSymbol={(sym) => {
                  const found = allAssets.find((a) => a.symbol === sym);
                  if (found) setSelectedAsset(found);
                }}
              />
            </section>

            {/* Visual Heatmaps (Treemap) */}
            <section aria-label="Heatmaps">
              <HeatmapView
                onSelectAsset={(asset) => {
                  setSelectedAsset(asset);
                }}
              />
            </section>

            {/* Earnings Calendar Preview */}
            <section aria-label="Earnings Calendar">
              <EarningsCalendar
                onSelectSymbol={(sym) => {
                  const found = allAssets.find((a) => a.symbol === sym);
                  if (found) setSelectedAsset(found);
                }}
              />
            </section>

            {/* Calendars, News & Trade Ideas */}
            <section aria-label="Catalysts and News">
              <CalendarNewsSection />
            </section>
          </div>
        )}

        {/* VIEW: MULTI-CHART GRID */}
        {activeTab === 'multichart' && (
          <MultiChartGrid
            assets={allAssets}
            onTrade={() => setIsTradeOpen(true)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onQuickOrder={(side, qty) =>
              handleExecuteTrade({
                symbol: selectedAsset.symbol,
                side,
                quantity: qty,
                price: selectedAsset.price,
                total: selectedAsset.price * qty,
              })
            }
          />
        )}

        {/* VIEW: STOCKS */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <Superchart
              asset={selectedAsset}
              onTrade={() => setIsTradeOpen(true)}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={handleToggleWatchlist}
              onQuickOrder={(side, qty) =>
                handleExecuteTrade({
                  symbol: selectedAsset.symbol,
                  side,
                  quantity: qty,
                  price: selectedAsset.price,
                  total: selectedAsset.price * qty,
                })
              }
            />
            <MoversSection
              stocks={liveStocks}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
            <SectorMatrix
              onSelectSymbol={(sym) => {
                const found = allAssets.find((a) => a.symbol === sym);
                if (found) setSelectedAsset(found);
              }}
            />
            <MarketScreener
              stocks={liveStocks}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* VIEW: CRYPTO */}
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
              onQuickOrder={(side, qty) =>
                handleExecuteTrade({
                  symbol: selectedAsset.symbol,
                  side,
                  quantity: qty,
                  price: selectedAsset.price,
                  total: selectedAsset.price * qty,
                })
              }
            />
            <CryptoDashboard
              cryptoAssets={liveCrypto}
              overview={MARKET_OVERVIEW_DATA}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* VIEW: FOREX */}
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
              onQuickOrder={(side, qty) =>
                handleExecuteTrade({
                  symbol: selectedAsset.symbol,
                  side,
                  quantity: qty,
                  price: selectedAsset.price,
                  total: selectedAsset.price * qty,
                })
              }
            />
            <ForexDashboard
              forexPairs={liveForex}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* VIEW: INDICES */}
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
              onQuickOrder={(side, qty) =>
                handleExecuteTrade({
                  symbol: selectedAsset.symbol,
                  side,
                  quantity: qty,
                  price: selectedAsset.price,
                  total: selectedAsset.price * qty,
                })
              }
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
                      <th className="py-3 px-4 text-center">Technical Consensus</th>
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

        {/* VIEW: FUTURES */}
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
              onQuickOrder={(side, qty) =>
                handleExecuteTrade({
                  symbol: selectedAsset.symbol,
                  side,
                  quantity: qty,
                  price: selectedAsset.price,
                  total: selectedAsset.price * qty,
                })
              }
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

        {/* VIEW: BONDS */}
        {activeTab === 'bonds' && (
          <div className="space-y-6">
            <BondsDashboard
              bonds={liveBonds}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              selectedSymbol={selectedAsset.symbol}
            />
          </div>
        )}

        {/* VIEW: HEATMAP */}
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

      {/* 6. Clean Institutional Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#131722] py-5 px-4 lg:px-6 text-xs text-slate-500 dark:text-[#787b86] transition-colors mt-auto">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white">
              TradingView Pro Terminal
            </span>
            <span>·</span>
            <span>Sub-millisecond simulated market quotes & institutional analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">UTC-5 New York · Session: Active</span>
            <span>·</span>
            <span className="text-[#089981] font-semibold">● Feed Online</span>
          </div>
        </div>
      </footer>

      {/* 7. Watchlist Drawer */}
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

      {/* 8. Search Modal (⌘K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allAssets={allAssets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* 9. Paper Trading Order Modal */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        asset={selectedAsset}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* 10. Paper Portfolio Drawer */}
      <PortfolioDrawer
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        positions={positions}
        cashBalance={cashBalance}
        onClosePosition={handleClosePosition}
        onResetPortfolio={handleResetPortfolio}
        onSelectSymbol={(sym) => {
          const found = allAssets.find((a) => a.symbol === sym);
          if (found) setSelectedAsset(found);
        }}
      />

      {/* 11. Price Alerts Manager Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        asset={selectedAsset}
        alerts={alerts}
        onCreateAlert={(al) => {
          setAlerts((prev) => [al, ...prev]);
          setTradeToast(`Alert set: ${al.symbol} ${al.condition === 'CROSSES_ABOVE' ? '≥' : '≤'} $${al.targetPrice}`);
          setIsAlertsOpen(false);
        }}
        onDeleteAlert={(id) => {
          setAlerts((prev) => prev.filter((a) => a.id !== id));
        }}
      />
    </div>
  );
}
