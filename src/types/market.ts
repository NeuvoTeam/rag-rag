export type AssetClass =
  | 'overview'
  | 'stocks'
  | 'crypto'
  | 'forex'
  | 'indices'
  | 'futures'
  | 'bonds'
  | 'heatmap'
  | 'multichart';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  exchange: string;
  assetClass: 'stocks' | 'crypto' | 'forex' | 'indices' | 'futures' | 'bonds';
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  sparkline: number[];
  volume?: string;
  marketCap?: string;
  peRatio?: number;
  high52w?: number;
  low52w?: number;
  dayHigh?: number;
  dayLow?: number;
  technicalRating?: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  sector?: string;
  spread?: number;
  bid?: number;
  ask?: number;
  perf1W?: number;
  perf1M?: number;
  perfYTD?: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  openTime: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'CROSSES_ABOVE' | 'CROSSES_BELOW';
  createdAt: string;
  triggered: boolean;
}

export interface EarningsItem {
  id: string;
  symbol: string;
  name: string;
  date: string;
  time: 'BMO' | 'AMC'; // Before Market Open / After Market Close
  epsEstimated: number;
  epsReported?: number;
  revenueEst: string;
  surprise?: number;
}

export interface SectorPerformance {
  name: string;
  code: string;
  d1: number;
  w1: number;
  m1: number;
  m3: number;
  ytd: number;
  topStock: string;
}

export interface DrawingElement {
  id: string;
  type: 'line' | 'horizontal' | 'fibonacci' | 'text';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  label?: string;
  price?: number;
}

export interface SectorItem {
  id: string;
  name: string;
  changePercent: number;
  marketCap: string;
  stocks: {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    weight: number;
    marketCap: string;
  }[];
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous: string;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
  url?: string;
}

export interface TradeIdea {
  id: string;
  title: string;
  author: string;
  symbol: string;
  sentiment: 'Long' | 'Short' | 'Neutral';
  timeframe: string;
  likes: number;
  comments: number;
  previewUrl: string;
  description: string;
}

export interface MarketOverviewData {
  fearAndGreedIndex: {
    score: number;
    rating: string;
    previousClose: number;
    lastWeek: number;
  };
  globalStats: {
    totalCryptoMarketCap: string;
    btcDominance: number;
    dxyIndex: number;
    dxyChange: number;
    us10yYield: number;
    us10yChange: number;
    vixIndex: number;
    vixChange: number;
    sp500Breadth: number; // % above 200 SMA
  };
}
