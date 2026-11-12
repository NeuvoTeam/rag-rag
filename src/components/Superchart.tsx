import React, { useState, useMemo, useRef } from 'react';
import { MarketAsset, CandleData } from '../types/market';
import { generateCandles } from '../data/marketData';
import {
  TrendingUp,
  BarChart2,
  Clock,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  Layers
} from 'lucide-react';

interface SuperchartProps {
  asset: MarketAsset;
  onTrade: (asset: MarketAsset) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (asset: MarketAsset) => void;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y' | 'ALL';
type ChartType = 'candles' | 'line' | 'area';

export const Superchart: React.FC<SuperchartProps> = ({
  asset,
  onTrade,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate candle data dynamically based on timeframe
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
    return generateCandles(asset.price, count, 0.018);
  }, [asset.price, asset.symbol, timeframe]);

  // Active or hovered data point
  const currentCandle = hoveredCandle || candles[candles.length - 1];

  // Min and max for scaling
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;
    for (const c of candles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    }
    const pad = (max - min) * 0.08 || 1;
    return { minPrice: min - pad, maxPrice: max + pad, maxVol: maxV || 1 };
  }, [candles]);

  // Compute SMAs
  const sma20 = useMemo(() => {
    return candles.map((_, i, arr) => {
      if (i < 19) return null;
      const slice = arr.slice(i - 19, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 20;
    });
  }, [candles]);

  const sma50 = useMemo(() => {
    return candles.map((_, i, arr) => {
      if (i < 49) return null;
      const slice = arr.slice(i - 49, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 50;
    });
  }, [candles]);

  // SVG dimensions
  const svgWidth = 1000;
  const mainHeight = showRSI ? 320 : 420;
  const rsiHeight = showRSI ? 90 : 0;
  const totalSvgHeight = mainHeight + rsiHeight;

  // Coordinate transforms
  const getY = (val: number) => {
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return mainHeight - ratio * (mainHeight - 30) - 20;
  };

  const getX = (index: number) => {
    return 30 + (index / (candles.length - 1)) * (svgWidth - 110);
  };

  // Mouse move handler for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouseX to SVG coordinates
    const scaleX = svgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;
    const svgX = mouseX * scaleX;
    const svgY = mouseY * scaleY;

    // Find nearest candle
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

  const isPositive = asset.changePercent >= 0;

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden transition-all ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'w-full'
      }`}
    >
      {/* Chart Top Bar Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#1e222d] flex flex-wrap items-center justify-between gap-4">
        {/* Symbol Info */}
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
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]">
                {asset.exchange}
              </span>
            </div>
            {/* Live Price readout */}
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
              <span className="text-[11px] text-slate-500 dark:text-[#787b86]">
                · Real-time Market
              </span>
            </div>
          </div>
        </div>

        {/* OHLCV Crosshair values display */}
        {currentCandle && (
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-[#787b86]">
            <span>Date: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.time}</strong></span>
            <span>O: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-[#089981]">{currentCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-[#f23645]">{currentCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className="text-slate-800 dark:text-[#d1d4dc]">{currentCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-slate-800 dark:text-[#d1d4dc]">{(currentCandle.volume / 1000000).toFixed(1)}M</strong></span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleWatchlist(asset)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isWatchlisted
                ? 'bg-[#2962ff]/10 border-[#2962ff] text-[#2962ff]'
                : 'bg-white dark:bg-[#1e222d] border-slate-200 dark:border-[#2a2e39] text-slate-700 dark:text-[#d1d4dc] hover:border-slate-300 dark:hover:border-[#363a45]'
            }`}
          >
            {isWatchlisted ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
          </button>

          <button
            onClick={() => onTrade(asset)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#089981] hover:bg-[#067a67] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trade Order</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#2a2e39] transition-colors"
            title={isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Toolbar (Timeframes, Indicators, Chart Styles) */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#131722] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
          {(['1D', '5D', '1M', '6M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style (Candles / Line / Area) */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#1e222d] rounded-lg border border-slate-200 dark:border-[#2a2e39]">
          <button
            onClick={() => setChartType('candles')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              chartType === 'candles'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] dark:text-[#2962ff] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              chartType === 'line'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] dark:text-[#2962ff] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              chartType === 'area'
                ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] dark:text-[#2962ff] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Area
          </button>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-[#787b86] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Indicators:
          </span>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
              showSMA20
                ? 'bg-blue-50 dark:bg-[#2962ff]/20 border-[#2962ff] text-[#2962ff]'
                : 'bg-transparent border-slate-200 dark:border-[#2a2e39] text-slate-400 dark:text-[#787b86]'
            }`}
          >
            SMA 20
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
              showSMA50
                ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'bg-transparent border-slate-200 dark:border-[#2a2e39] text-slate-400 dark:text-[#787b86]'
            }`}
          >
            SMA 50
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
              showVolume
                ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'bg-transparent border-slate-200 dark:border-[#2a2e39] text-slate-400 dark:text-[#787b86]'
            }`}
          >
            Volume
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
              showRSI
                ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'bg-transparent border-slate-200 dark:border-[#2a2e39] text-slate-400 dark:text-[#787b86]'
            }`}
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Canvas / SVG Viewport */}
      <div className="relative w-full overflow-hidden bg-white dark:bg-[#131722] flex-1 select-none">
        {/* Subtle background price grid */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 px-4">
          <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
          <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
          <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
          <div className="w-full border-b border-dashed border-slate-100 dark:border-[#1e222d]" />
        </div>

        {/* SVG Renderer */}
        <svg
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="w-full h-[400px] lg:h-[460px] cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Volume bars (behind candles) */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const volRatio = c.volume / maxVol;
              const barH = volRatio * 80;
              const y = mainHeight - barH;
              const isGreen = c.close >= c.open;
              const width = Math.max(2, (svgWidth - 110) / candles.length - 3);

              return (
                <rect
                  key={`vol-${i}`}
                  x={x - width / 2}
                  y={y}
                  width={width}
                  height={barH}
                  fill={isGreen ? '#089981' : '#f23645'}
                  opacity={0.22}
                />
              );
            })}

          {/* Area / Line Render */}
          {chartType === 'area' && (
            <>
              {/* Area path */}
              <path
                d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                  .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                  .join(' ')} L ${getX(candles.length - 1)} ${mainHeight} L ${getX(0)} ${mainHeight} Z`}
                fill="url(#areaGradient)"
              />
              {/* Line path */}
              <path
                d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                  .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                  .join(' ')}`}
                fill="none"
                stroke="#2962ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {chartType === 'line' && (
            <path
              d={`M ${getX(0)} ${getY(candles[0].close)} ${candles
                .map((c, i) => `L ${getX(i)} ${getY(c.close)}`)
                .join(' ')}`}
              fill="none"
              stroke="#2962ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Candlesticks Render */}
          {chartType === 'candles' &&
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

              return (
                <g key={`candle-${i}`}>
                  {/* Upper wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={bodyTop}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Lower wick */}
                  <line
                    x1={x}
                    y1={bodyBottom}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Candle body */}
                  <rect
                    x={x - width / 2}
                    y={bodyTop}
                    width={width}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.5"
                    rx={0.5}
                  />
                </g>
              );
            })}

          {/* SMA 20 Overlay */}
          {showSMA20 && (
            <path
              d={candles
                .map((_, i) => {
                  const val = sma20[i];
                  if (val === null) return '';
                  return `${i === 19 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`;
                })
                .filter(Boolean)
                .join(' ')}
              fill="none"
              stroke="#2962ff"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* SMA 50 Overlay */}
          {showSMA50 && (
            <path
              d={candles
                .map((_, i) => {
                  const val = sma50[i];
                  if (val === null) return '';
                  return `${i === 49 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`;
                })
                .filter(Boolean)
                .join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
          )}

          {/* Right Price Scale Axis */}
          <line
            x1={svgWidth - 80}
            y1={0}
            x2={svgWidth - 80}
            y2={mainHeight}
            stroke="#2a2e39"
            strokeWidth="1"
          />

          {/* Price Labels on Right Scale */}
          {[0.15, 0.38, 0.62, 0.85].map((pct, idx) => {
            const p = minPrice + (maxPrice - minPrice) * pct;
            const y = mainHeight - pct * (mainHeight - 30) - 20;
            return (
              <g key={`axis-${idx}`}>
                <line
                  x1={svgWidth - 80}
                  y1={y}
                  x2={svgWidth - 75}
                  y2={y}
                  stroke="#787b86"
                  strokeWidth="1"
                />
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

          {/* Current Price Marker on Axis */}
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

          {/* Interactive Crosshairs */}
          {crosshairPos && (
            <g pointerEvents="none">
              {/* Vertical line */}
              <line
                x1={crosshairPos.x}
                y1={0}
                x2={crosshairPos.x}
                y2={mainHeight}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Horizontal line */}
              <line
                x1={0}
                y1={crosshairPos.y}
                x2={svgWidth - 80}
                y2={crosshairPos.y}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Optional RSI Sub-Pane */}
          {showRSI && (
            <g transform={`translate(0, ${mainHeight})`}>
              <line
                x1={0}
                y1={0}
                x2={svgWidth}
                y2={0}
                stroke="#2a2e39"
                strokeWidth="1.5"
              />
              <text
                x={12}
                y={18}
                fill="#06b6d4"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                RSI (14): 64.28
              </text>
              {/* Overbought 70 line */}
              <line
                x1={30}
                y1={25}
                x2={svgWidth - 80}
                y2={25}
                stroke="#f23645"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity={0.5}
              />
              {/* Oversold 30 line */}
              <line
                x1={30}
                y1={65}
                x2={svgWidth - 80}
                y2={65}
                stroke="#089981"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity={0.5}
              />
              {/* RSI Curve */}
              <path
                d={candles
                  .map((_, i) => {
                    const rsiVal = 50 + Math.sin(i * 0.3) * 22;
                    const rsiY = 85 - (rsiVal / 100) * 60;
                    return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${rsiY}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer: Day & 52-Week Range + Key Financial Stats */}
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
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">P/E Ratio</span>
          <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {asset.peRatio ? asset.peRatio.toFixed(1) : '32.4'}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">24h Volume</span>
          <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {asset.volume || '38.4M'}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-[#787b86]">Technical Rating</span>
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
