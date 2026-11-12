export type AssetClass = 'overview' | 'stocks' | 'crypto' | 'forex' | 'indices' | 'futures' | 'bonds' | 'heatmap';

export interface CandleData {
  time: string;
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
  spread?: number; // For forex
  bid?: number;
  ask?: number;
  history?: CandleData[];
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
    weight: number; // For relative sizing in treemap
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
  };
}
