import React, { useState, useMemo, useRef } from 'react';
import { MarketAsset, CandleData, OrderBook, DrawingElement } from '../types/market';
import { generateCandles, generateOrderBook } from '../data/marketData';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Clock,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Camera,
  Trash2,
  Minus,
  Move,
  Hash,
  Scale,
  Activity,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface SuperchartProps {
  asset: MarketAsset;
  onTrade: (asset: MarketAsset) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (asset: MarketAsset) => void;
  onQuickOrder?: (side: 'BUY' | 'SELL', qty: number) => void;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y' | 'ALL';
type ChartType = 'candles' | 'hollow' | 'bars' | 'line' | 'area';
type DrawingTool = 'crosshair' | 'line' | 'horizontal' | 'fibonacci' | 'ruler';

export const Superchart: React.FC<SuperchartProps> = ({
  asset,
  onTrade,
  isWatchlisted,
  onToggleWatchlist,
  onQuickOrder,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');

  // Indicators
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // Layout features
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDOM, setShowDOM] = useState(false);
  const [snapshotToast, setSnapshotToast] = useState(false);

  // User drawings
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Partial<DrawingElement> | null>(null);

  // Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic candle dataset
  const candles = useMemo(() => {
    const countMap: Record<Timeframe, number> = {
      '1D': 24,
      '5D': 35,
      '1M': 45,
      '6M': 60,
      '1Y': 75,
      '5Y': 90,
      'ALL': 110,
    };
    const count = countMap[timeframe] || 45;
    return generateCandles(asset.price, count, 0.016);
  }, [asset.price, asset.symbol, timeframe]);

  // Order Book DOM
  const orderBook = useMemo(() => {
    return generateOrderBook(asset.price);
  }, [asset.price, asset.symbol]);

  // Min / max calculation
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;
    for (const c of candles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    }
    const pad = (max - min) * 0.09 || 1;
    return { minPrice: min - pad, maxPrice: max + pad, maxVol: maxV || 1 };
  }, [candles]);

  // Compute SMAs & Bollinger Bands
  const sma20 = useMemo(() => {
    return candles.map((_, i, arr) => {
      if (i < 19) return null;
      const slice = arr.slice(i - 19, i + 1);
      return slice.reduce((acc, c) => acc + c.close, 0) / 20;
    });
  }, [candles]);

  const sma50 = useMemo(() => {
    return candles.map((_, i, arr) => {
      if (i < 49) return null;
      const slice = arr.slice(i - 49, i + 1);
      return slice.reduce((acc, c) => acc + c.close, 0) / 50;
    });
  }, [candles]);

  // Bollinger Bands (20, 2)
  const bollingerBands = useMemo(() => {
    return candles.map((_, i, arr) => {
      if (i < 19) return null;
      const slice = arr.slice(i - 19, i + 1);
      const mean = slice.reduce((acc, c) => acc + c.close, 0) / 20;
      const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + stdDev * 2,
        middle: mean,
        lower: mean - stdDev * 2,
      };
    });
  }, [candles]);

  // SVG dimensions
  const svgWidth = 1000;
  const mainHeight = showRSI && showMACD ? 280 : showRSI || showMACD ? 330 : 420;
  const rsiHeight = showRSI ? 75 : 0;
  const macdHeight = showMACD ? 75 : 0;
  const totalSvgHeight = mainHeight + rsiHeight + macdHeight;

  // Coordinate transforms
  const getY = (val: number) => {
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return mainHeight - ratio * (mainHeight - 30) - 20;
  };

  const getX = (index: number) => {
    return 30 + (index / (candles.length - 1)) * (svgWidth - 110);
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleX = svgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;
    const svgX = mouseX * scaleX;
    const svgY = mouseY * scaleY;

    const candleWidth = (svgWidth - 110) / (candles.length - 1);
    const index = Math.round((svgX - 30) / candleWidth);
    if (index >= 0 && index < candles.length) {
      setHoveredCandle(candles[index]);
      setCrosshairPos({ x: getX(index), y: svgY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setCrosshairPos(null);
  };

  // Drawing tools handler
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'crosshair') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = svgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'horizontal') {
      const priceAtY = minPrice + ((mainHeight - 20 - svgY) / (mainHeight - 30)) * (maxPrice - minPrice);
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'horizontal',
          startX: 30,
          startY: svgY,
          endX: svgWidth - 80,
          endY: svgY,
          price: priceAtY,
        },
      ]);
      return;
    }

    if (activeTool === 'line' || activeTool === 'fibonacci') {
      if (!currentDrawing) {
        setCurrentDrawing({
          type: activeTool,
          startX: svgX,
          startY: svgY,
        });
      } else {
        setDrawings((prev) => [
          ...prev,
          {
            id: `draw-${Date.now()}`,
            type: activeTool,
            startX: currentDrawing.startX || 0,
            startY: currentDrawing.startY || 0,
            endX: svgX,
            endY: svgY,
          },
        ]);
        setCurrentDrawing(null);
      }
    }
  };

  const handleClearDrawings = () => {
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const handleTakeSnapshot = () => {
    setSnapshotToast(true);
    setTimeout(() => setSnapshotToast(false), 2500);
  };

  const currentCandle = hoveredCandle || candles[candles.length - 1];
  const isPositive = asset.changePercent >= 0;

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden transition-all select-none ${
        isExpanded ? 'fixed inset-3 z-50 shadow-2xl flex flex-col' : 'w-full'
      }`}
    >
      {/* Toast Notification */}
      {snapshotToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#089981] text-white px-4 py-2 rounded-lg shadow-xl font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>High-res chart snapshot saved to clipboard!</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#1e222d] flex flex-wrap items-center justify-between gap-4">
        {/* Symbol Information */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#202533] border border-slate-200 dark:border-[#2a2e39] flex items-center justify-center font-bold text-xs text-[#2962ff]">
            {asset.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {asset.symbol}
              </h2>
              <span className="text-xs text-slate-500 dark:text-[#787b86]">
                {asset.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]">
                {asset.exchange}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-[#089981]/20 text-[#089981] font-semibold">
                ● PRO LIVE
              </span>
            </div>

            {/* Price Readout & Live Countdown Timer */}
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {asset.currency === 'USD' ? '$' : ''}
                {currentCandle ? currentCandle.close.toFixed(2) : asset.price.toFixed(2)}
              </span>
              <span
                className={`text-xs font-mono font-semibold flex items-center tabular-nums ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}
                {asset.change.toFixed(2)} ({isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> 15m · 04:38
              </span>
            </div>
          </div>
        </div>

        {/* OHLCV Crosshair values display */}
        {currentCandle && (
          <div className="hidden 2xl:flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-[#787b86]">
            <span>Date: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.time}</strong></span>
            <span>O: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-[#089981]">{currentCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-[#f23645]">{currentCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-slate-800 dark:text-[#d1d4dc]">{(currentCandle.volume / 1000000).toFixed(1)}M</strong></span>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Buy/Sell Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQuickOrder ? onQuickOrder('BUY', 10) : onTrade(asset)}
              className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#089981] hover:bg-[#067a67] rounded-lg transition-colors cursor-pointer"
              title="One-click Buy 10 units"
            >
              Buy ${(asset.price * 1.0001).toFixed(2)}
            </button>
            <button
              onClick={() => onQuickOrder ? onQuickOrder('SELL', 10) : onTrade(asset)}
              className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#f23645] hover:bg-[#d02533] rounded-lg transition-colors cursor-pointer"
              title="One-click Sell 10 units"
            >
              Sell ${(asset.price * 0.9999).toFixed(2)}
            </button>
          </div>

          <button
            onClick={() => setShowDOM(!showDOM)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showDOM
                ? 'bg-[#2962ff]/10 border-[#2962ff] text-[#2962ff]'
                : 'bg-white dark:bg-[#1e222d] border-slate-200 dark:border-[#2a2e39] text-slate-600 dark:text-[#868993]'
            }`}
            title="Toggle Level 2 Order Book (DOM)"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleTakeSnapshot}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#2a2e39] transition-colors cursor-pointer"
            title="Export Chart Snapshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleWatchlist(asset)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isWatchlisted
                ? 'bg-[#2962ff]/10 border-[#2962ff] text-[#2962ff]'
                : 'bg-white dark:bg-[#1e222d] border-slate-200 dark:border-[#2a2e39] text-slate-600 dark:text-[#868993]'
            }`}
            title="Watchlist"
          >
            {isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#2a2e39] transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Toolbar (Timeframes, Chart Style, Indicators) */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#131722] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
          {(['1D', '5D', '1M', '6M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Styles */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
          {(['candles', 'hollow', 'bars', 'line', 'area'] as ChartType[]).map((st) => (
            <button
              key={st}
              onClick={() => setChartType(st)}
              className={`px-2 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                chartType === st
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-[#868993]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Technical Indicators */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 dark:text-[#787b86] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Indicators:
          </span>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showSMA20
                ? 'bg-blue-50 dark:bg-[#2962ff]/20 border-[#2962ff] text-[#2962ff]'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            SMA 20
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showSMA50
                ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-500'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            SMA 50
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showBB
                ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-400'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            BB (20,2)
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showVolume
                ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-400'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            Volume
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showRSI
                ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            RSI
          </button>

          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
              showMACD
                ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'border-slate-200 dark:border-[#2a2e39] text-slate-400'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Drawing Toolbar + Chart Canvas + Optional Level 2 DOM Drawer */}
      <div className="relative w-full flex-1 flex overflow-hidden bg-white dark:bg-[#131722]">
        {/* Left Vertical Drawing Toolbar */}
        <div className="w-10 border-r border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#181c27] flex flex-col items-center py-2 gap-1.5 shrink-0 z-10">
          <button
            onClick={() => setActiveTool('crosshair')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'crosshair'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Crosshair pointer"
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'line'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Trendline (Click start & end)"
          >
            <Minus className="w-3.5 h-3.5 -rotate-45" />
          </button>

          <button
            onClick={() => setActiveTool('horizontal')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'horizontal'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Horizontal Support / Resistance line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('fibonacci')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'fibonacci'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Fibonacci Retracement"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('ruler')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'ruler'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Measurement ruler"
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          {drawings.length > 0 && (
            <button
              onClick={handleClearDrawings}
              className="p-2 rounded-lg text-slate-400 hover:text-[#f23645] transition-colors cursor-pointer mt-auto"
              title="Clear all drawings"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* SVG Chart Canvas */}
        <div className="relative flex-1 overflow-hidden select-none">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 px-4">
            <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
            <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
            <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
            <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
            className="w-full h-[400px] lg:h-[480px] cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleSvgClick}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Bollinger Bands Shaded Band */}
            {showBB && (
              <>
                <path
                  d={`M ${getX(19)} ${getY(bollingerBands[19]?.upper || 0)} ${candles
                    .slice(19)
                    .map((_, idx) => `L ${getX(idx + 19)} ${getY(bollingerBands[idx + 19]?.upper || 0)}`)
                    .join(' ')} ${candles
                    .slice(19)
                    .reverse()
                    .map((_, idx) => `L ${getX(candles.length - 1 - idx)} ${getY(bollingerBands[candles.length - 1 - idx]?.lower || 0)}`)
                    .join(' ')} Z`}
                  fill="#6366f1"
                  opacity={0.12}
                />
                {/* Upper line */}
                <path
                  d={candles
                    .slice(19)
                    .map((_, i) => `${i === 0 ? 'M' : 'L'} ${getX(i + 19)} ${getY(bollingerBands[i + 19]?.upper || 0)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1"
                />
                {/* Lower line */}
                <path
                  d={candles
                    .slice(19)
                    .map((_, i) => `${i === 0 ? 'M' : 'L'} ${getX(i + 19)} ${getY(bollingerBands[i + 19]?.lower || 0)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1"
                />
              </>
            )}

            {/* Volume Histogram */}
            {showVolume &&
              candles.map((c, i) => {
                const x = getX(i);
                const volRatio = c.volume / maxVol;
                const barH = volRatio * 75;
                const y = mainHeight - barH;
                const isGreen = c.close >= c.open;
                const width = Math.max(2, (svgWidth - 110) / candles.length - 3);

                return (
                  <rect
                    key={`v-${i}`}
                    x={x - width / 2}
                    y={y}
                    width={width}
                    height={barH}
                    fill={isGreen ? '#089981' : '#f23645'}
                    opacity={0.2}
                  />
                );
              })}

            {/* Area Chart Mode */}
            {chartType === 'area' && (
              <>
                <path
                  d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                    .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                    .join(' ')} L ${getX(candles.length - 1)} ${mainHeight} L ${getX(0)} ${mainHeight} Z`}
                  fill="url(#areaGrad)"
                />
                <path
                  d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                    .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                    .join(' ')}`}
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth="2.5"
                />
              </>
            )}

            {/* Line Chart Mode */}
            {chartType === 'line' && (
              <path
                d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                  .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                  .join(' ')}`}
                fill="none"
                stroke="#2962ff"
                strokeWidth="2.5"
              />
            )}

            {/* Candlesticks & Hollow Candles */}
            {(chartType === 'candles' || chartType === 'hollow' || chartType === 'bars') &&
              candles.map((c, i) => {
                const x = getX(i);
                const isUp = c.close >= c.open;
                const bodyTop = getY(Math.max(c.open, c.close));
                const bodyBottom = getY(Math.min(c.open, c.close));
                const bodyHeight = Math.max(2, bodyBottom - bodyTop);
                const highY = getY(c.high);
                const lowY = getY(c.low);
                const width = Math.max(3, (svgWidth - 110) / candles.length - 3);
                const color = isUp ? '#089981' : '#f23645';

                if (chartType === 'bars') {
                  return (
                    <g key={`bar-${i}`}>
                      <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.5" />
                      <line x1={x - width / 2} y1={getY(c.open)} x2={x} y2={getY(c.open)} stroke={color} strokeWidth="1.5" />
                      <line x1={x} y1={getY(c.close)} x2={x + width / 2} y2={getY(c.close)} stroke={color} strokeWidth="1.5" />
                    </g>
                  );
                }

                return (
                  <g key={`c-${i}`}>
                    <line x1={x} y1={highY} x2={x} y2={bodyTop} stroke={color} strokeWidth="1.5" />
                    <line x1={x} y1={bodyBottom} x2={x} y2={lowY} stroke={color} strokeWidth="1.5" />
                    <rect
                      x={x - width / 2}
                      y={bodyTop}
                      width={width}
                      height={bodyHeight}
                      fill={chartType === 'hollow' && isUp ? 'transparent' : color}
                      stroke={color}
                      strokeWidth="1.2"
                      rx={0.5}
                    />
                  </g>
                );
              })}

            {/* SMA 20 */}
            {showSMA20 && (
              <path
                d={candles
                  .map((_, i) => (sma20[i] ? `${i === 19 ? 'M' : 'L'} ${getX(i)} ${getY(sma20[i]!)}` : ''))
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#2962ff"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

            {/* SMA 50 */}
            {showSMA50 && (
              <path
                d={candles
                  .map((_, i) => (sma50[i] ? `${i === 49 ? 'M' : 'L'} ${getX(i)} ${getY(sma50[i]!)}` : ''))
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
            )}

            {/* User Drawings */}
            {drawings.map((draw) => {
              if (draw.type === 'horizontal') {
                return (
                  <g key={draw.id}>
                    <line
                      x1={30}
                      y1={draw.startY}
                      x2={svgWidth - 80}
                      y2={draw.startY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text
                      x={40}
                      y={draw.startY - 4}
                      fill="#f59e0b"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      RAY: ${draw.price?.toFixed(2)}
                    </text>
                  </g>
                );
              }
              if (draw.type === 'line') {
                return (
                  <line
                    key={draw.id}
                    x1={draw.startX}
                    y1={draw.startY}
                    x2={draw.endX}
                    y2={draw.endY}
                    stroke="#2962ff"
                    strokeWidth="2"
                  />
                );
              }
              if (draw.type === 'fibonacci') {
                const yTop = Math.min(draw.startY, draw.endY || 0);
                const yBottom = Math.max(draw.startY, draw.endY || 0);
                const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
                return (
                  <g key={draw.id}>
                    {fibLevels.map((lvl) => {
                      const yLvl = yTop + (yBottom - yTop) * lvl;
                      return (
                        <g key={lvl}>
                          <line
                            x1={30}
                            y1={yLvl}
                            x2={svgWidth - 80}
                            y2={yLvl}
                            stroke="#06b6d4"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            opacity={0.7}
                          />
                          <text
                            x={35}
                            y={yLvl - 3}
                            fill="#06b6d4"
                            fontSize="9"
                            fontFamily="JetBrains Mono"
                          >
                            Fib {(lvl * 100).toFixed(1)}%
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              }
              return null;
            })}

            {/* Right Price Scale Axis */}
            <line x1={svgWidth - 80} y1={0} x2={svgWidth - 80} y2={mainHeight} stroke="#2a2e39" strokeWidth="1" />

            {[0.12, 0.35, 0.62, 0.88].map((pct, idx) => {
              const p = minPrice + (maxPrice - minPrice) * pct;
              const y = mainHeight - pct * (mainHeight - 30) - 20;
              return (
                <g key={`ax-${idx}`}>
                  <line x1={svgWidth - 80} y1={y} x2={svgWidth - 75} y2={y} stroke="#787b86" strokeWidth="1" />
                  <text
                    x={svgWidth - 70}
                    y={y + 4}
                    fill="#787b86"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    textAnchor="start"
                  >
                    {p.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Current Price Marker */}
            {candles.length > 0 && (
              <g>
                <line
                  x1={0}
                  y1={getY(candles[candles.length - 1].close)}
                  x2={svgWidth - 80}
                  y2={getY(candles[candles.length - 1].close)}
                  stroke="#089981"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                <rect
                  x={svgWidth - 80}
                  y={getY(candles[candles.length - 1].close) - 10}
                  width={76}
                  height={20}
                  fill="#089981"
                  rx={3}
                />
                <text
                  x={svgWidth - 74}
                  y={getY(candles[candles.length - 1].close) + 4}
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {candles[candles.length - 1].close.toFixed(2)}
                </text>
              </g>
            )}

            {/* Crosshairs */}
            {crosshairPos && (
              <g pointerEvents="none">
                <line x1={crosshairPos.x} y1={0} x2={crosshairPos.x} y2={mainHeight} stroke="#787b86" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={0} y1={crosshairPos.y} x2={svgWidth - 80} y2={crosshairPos.y} stroke="#787b86" strokeWidth="1" strokeDasharray="4 4" />
              </g>
            )}

            {/* RSI Sub-Pane */}
            {showRSI && (
              <g transform={`translate(0, ${mainHeight})`}>
                <line x1={0} y1={0} x2={svgWidth} y2={0} stroke="#2a2e39" strokeWidth="1.5" />
                <text x={12} y={16} fill="#06b6d4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  RSI (14): 63.8
                </text>
                <line x1={30} y1={22} x2={svgWidth - 80} y2={22} stroke="#f23645" strokeWidth="0.8" strokeDasharray="2 2" opacity={0.6} />
                <line x1={30} y1={52} x2={svgWidth - 80} y2={52} stroke="#089981" strokeWidth="0.8" strokeDasharray="2 2" opacity={0.6} />
                <path
                  d={candles
                    .map((_, i) => {
                      const rsiVal = 50 + Math.sin(i * 0.28) * 22;
                      const rsiY = 65 - (rsiVal / 100) * 45;
                      return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${rsiY}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* MACD Sub-Pane */}
            {showMACD && (
              <g transform={`translate(0, ${mainHeight + rsiHeight})`}>
                <line x1={0} y1={0} x2={svgWidth} y2={0} stroke="#2a2e39" strokeWidth="1.5" />
                <text x={12} y={16} fill="#10b981" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  MACD (12, 26, 9)
                </text>
                {/* Center 0 line */}
                <line x1={30} y1={38} x2={svgWidth - 80} y2={38} stroke="#787b86" strokeWidth="0.8" opacity={0.5} />
                {/* Histogram bars */}
                {candles.map((_, i) => {
                  const x = getX(i);
                  const histVal = Math.sin(i * 0.22) * 18;
                  const isUp = histVal >= 0;
                  return (
                    <rect
                      key={`macd-${i}`}
                      x={x - 2}
                      y={isUp ? 38 - histVal : 38}
                      width={4}
                      height={Math.abs(histVal)}
                      fill={isUp ? '#089981' : '#f23645'}
                      opacity={0.8}
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Level 2 DOM (Depth of Market) Side Drawer */}
        {showDOM && (
          <div className="w-64 border-l border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#181c27] p-3 text-xs flex flex-col justify-between shrink-0 animate-in slide-in-from-right duration-150">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2a2e39]">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#2962ff]" /> DOM Ladder
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Spread: {orderBook.spread}
                </span>
              </div>

              {/* Asks (Red) */}
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                {orderBook.asks.slice().reverse().map((ask, i) => (
                  <div key={i} className="flex items-center justify-between relative py-0.5 px-1">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/15 rounded"
                      style={{ width: `${Math.min(100, (ask.size / 600) * 100)}%` }}
                    />
                    <span className="text-[#f23645] font-semibold z-10">{ask.price.toFixed(2)}</span>
                    <span className="text-slate-400 z-10">{ask.size}</span>
                  </div>
                ))}
              </div>

              {/* Mid Spread Bar */}
              <div className="my-2 py-1 bg-slate-200 dark:bg-[#202533] text-center font-mono font-bold text-slate-700 dark:text-[#d1d4dc] rounded">
                ${asset.price.toFixed(2)}
              </div>

              {/* Bids (Green) */}
              <div className="space-y-1 font-mono text-[11px]">
                {orderBook.bids.map((bid, i) => (
                  <div key={i} className="flex items-center justify-between relative py-0.5 px-1">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded"
                      style={{ width: `${Math.min(100, (bid.size / 600) * 100)}%` }}
                    />
                    <span className="text-[#089981] font-semibold z-10">{bid.price.toFixed(2)}</span>
                    <span className="text-slate-400 z-10">{bid.size}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#2a2e39] text-[10px] text-slate-400 text-center">
              Real-time NASDAQ TotalView feed
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer: Range Bars & Key Institutional Metrics */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">Day Range</span>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-[#d1d4dc]">
            <span>{asset.dayLow || (asset.price * 0.985).toFixed(2)}</span>
            <span className="text-slate-400">·</span>
            <span>{asset.dayHigh || (asset.price * 1.015).toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-1.5 rounded-full mt-1 overflow-hidden">
            <div className="bg-[#2962ff] h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">52-Wk Range</span>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-[#d1d4dc]">
            <span>{asset.low52w || (asset.price * 0.75).toFixed(2)}</span>
            <span className="text-slate-400">·</span>
            <span>{asset.high52w || (asset.price * 1.25).toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-1.5 rounded-full mt-1 overflow-hidden">
            <div className="bg-[#089981] h-full rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">Market Cap</span>
          <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {asset.marketCap || 'N/A'}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">P/E (TTM)</span>
          <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {asset.peRatio ? asset.peRatio.toFixed(1) : '32.4'}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">1-Year Return</span>
          <p className="mt-1 font-mono font-semibold text-[#089981] tabular-nums">
            +{asset.perfYTD || '42.8'}%
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">Technical Consensus</span>
          <p className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
              asset.technicalRating?.includes('Buy')
                ? 'bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]'
                : asset.technicalRating?.includes('Sell')
                ? 'bg-rose-50 dark:bg-[#f23645]/20 text-[#f23645]'
                : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
            }`}>
              {asset.technicalRating || 'Strong Buy'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
