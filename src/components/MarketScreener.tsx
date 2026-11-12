import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types/market';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

interface MarketScreenerProps {
  stocks: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type SortOrder = 'asc' | 'desc';

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  stocks,
  onSelectAsset,
  selectedSymbol,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Available sectors from stocks
  const sectors = useMemo(() => {
    const list = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector) list.add(s.sector);
    });
    return ['All', ...Array.from(list)];
  }, [stocks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & sort logic
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchesSearch =
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = sectorFilter === 'All' || s.sector === sectorFilter;
        const matchesRating =
          ratingFilter === 'All' ||
          (ratingFilter === 'Buy' && s.technicalRating?.includes('Buy')) ||
          (ratingFilter === 'Sell' && s.technicalRating?.includes('Sell')) ||
          (ratingFilter === 'Neutral' && s.technicalRating === 'Neutral');

        return matchesSearch && matchesSector && matchesRating;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortField === 'symbol') {
          valA = a.symbol;
          valB = b.symbol;
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        } else if (sortField === 'price') {
          valA = a.price;
          valB = b.price;
        } else if (sortField === 'changePercent') {
          valA = a.changePercent;
          valB = b.changePercent;
        } else if (sortField === 'volume') {
          valA = parseFloat(a.volume || '0');
          valB = parseFloat(b.volume || '0');
        } else if (sortField === 'marketCap') {
          valA = parseFloat(a.marketCap || '0');
          valB = parseFloat(b.marketCap || '0');
        } else if (sortField === 'peRatio') {
          valA = a.peRatio || 0;
          valB = b.peRatio || 0;
        }

        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stocks, searchQuery, sectorFilter, ratingFilter, sortField, sortOrder]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#2962ff]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#2962ff]" />
    );
  };

  return (
    <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden flex flex-col">
      {/* Screener Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Stock Screener
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e222d] text-slate-600 dark:text-[#868993] border border-slate-200 dark:border-[#2a2e39]">
            {filteredStocks.length} Results
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2962ff] w-48 sm:w-56"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-[#787b86]">Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Technical Rating Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-[#787b86]">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2962ff]"
            >
              <option value="All">All Ratings</option>
              <option value="Buy">Buy & Strong Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell & Strong Sell</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screener Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] text-[11px] font-semibold text-slate-500 dark:text-[#787b86] uppercase tracking-wider">
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-1 group focus:outline-none"
                >
                  <span>Ticker</span>
                  {renderSortIndicator('symbol')}
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 ml-auto group focus:outline-none"
                >
                  <span>Price (USD)</span>
                  {renderSortIndicator('price')}
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('changePercent')}
                  className="flex items-center gap-1 ml-auto group focus:outline-none"
                >
                  <span>Change %</span>
                  {renderSortIndicator('changePercent')}
                </button>
              </th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">
                <button
                  onClick={() => handleSort('volume')}
                  className="flex items-center gap-1 ml-auto group focus:outline-none"
                >
                  <span>Volume</span>
                  {renderSortIndicator('volume')}
                </button>
              </th>
              <th className="py-3 px-4 text-right hidden md:table-cell">
                <button
                  onClick={() => handleSort('marketCap')}
                  className="flex items-center gap-1 ml-auto group focus:outline-none"
                >
                  <span>Market Cap</span>
                  {renderSortIndicator('marketCap')}
                </button>
              </th>
              <th className="py-3 px-4 text-right hidden lg:table-cell">
                <button
                  onClick={() => handleSort('peRatio')}
                  className="flex items-center gap-1 ml-auto group focus:outline-none"
                >
                  <span>P/E</span>
                  {renderSortIndicator('peRatio')}
                </button>
              </th>
              <th className="py-3 px-4 hidden xl:table-cell">52-Week Range</th>
              <th className="py-3 px-4 text-center">Tech Rating</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
            {filteredStocks.map((stock) => {
              const isPos = stock.changePercent >= 0;
              const isSelected = selectedSymbol === stock.symbol;

              return (
                <tr
                  key={stock.symbol}
                  onClick={() => onSelectAsset(stock)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-[#2962ff]/10'
                      : 'hover:bg-slate-50 dark:hover:bg-[#1e222d]'
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] flex items-center justify-center font-bold text-[10px] text-slate-800 dark:text-[#d1d4dc]">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#787b86]">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#787b86] truncate max-w-[150px]">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ${stock.price.toFixed(2)}
                  </td>

                  {/* Change % */}
                  <td className="py-3.5 px-4 text-right">
                    <div
                      className={`inline-flex items-center font-mono font-semibold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {isPos ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-[#d1d4dc] hidden sm:table-cell tabular-nums">
                    {stock.volume || '—'}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white hidden md:table-cell tabular-nums">
                    {stock.marketCap || '—'}
                  </td>

                  {/* P/E */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-[#868993] hidden lg:table-cell tabular-nums">
                    {stock.peRatio && stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                  </td>

                  {/* 52-Week Range Bar */}
                  <td className="py-3.5 px-4 hidden xl:table-cell">
                    <div className="w-28">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{stock.low52w || (stock.price * 0.7).toFixed(0)}</span>
                        <span>{stock.high52w || (stock.price * 1.3).toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-[#2a2e39] h-1.5 rounded-full mt-0.5 overflow-hidden">
                        <div
                          className="bg-[#2962ff] h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                10,
                                (((stock.price - (stock.low52w || stock.price * 0.7)) /
                                  ((stock.high52w || stock.price * 1.3) -
                                    (stock.low52w || stock.price * 0.7))) *
                                  100) || 50
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Technical Rating */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                        stock.technicalRating?.includes('Buy')
                          ? 'bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]'
                          : stock.technicalRating?.includes('Sell')
                          ? 'bg-rose-50 dark:bg-[#f23645]/20 text-[#f23645]'
                          : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
                      }`}
                    >
                      {stock.technicalRating || 'Neutral'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(stock);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium text-[#2962ff] hover:bg-[#2962ff]/10 rounded border border-[#2962ff]/30 transition-colors cursor-pointer"
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
  );
};
