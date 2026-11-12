import React from 'react';
import { Position } from '../types/market';
import { X, Briefcase, TrendingUp, TrendingDown, RefreshCw, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  positions: Position[];
  cashBalance: number;
  onClosePosition: (id: string) => void;
  onResetPortfolio: () => void;
  onSelectSymbol: (symbol: string) => void;
}

export const PortfolioDrawer: React.FC<PortfolioDrawerProps> = ({
  isOpen,
  onClose,
  positions,
  cashBalance,
  onClosePosition,
  onResetPortfolio,
  onSelectSymbol,
}) => {
  if (!isOpen) return null;

  // Calculate totals
  const totalInvested = positions.reduce((acc, p) => acc + p.quantity * p.currentPrice, 0);
  const totalUnrealizedPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalNetEquity = cashBalance + totalInvested;
  const isOverallPos = totalUnrealizedPnL >= 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-[#131722] border-l border-slate-200 dark:border-[#2a2e39] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between bg-slate-50/70 dark:bg-[#181c27]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2962ff]/10 text-[#2962ff]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Paper Trading Portfolio
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#787b86]">
                Simulated Institutional Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPortfolio}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#202533] transition-colors"
              title="Reset Portfolio to $100k"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#202533] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Equity Overview Strip */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] grid grid-cols-3 gap-3 bg-slate-50/50 dark:bg-[#181c27]/50 text-xs">
          <div>
            <span className="text-[11px] text-slate-400">Total Net Equity</span>
            <p className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ${totalNetEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Unrealized P&L</span>
            <p
              className={`mt-1 text-base font-bold font-mono flex items-center tabular-nums ${
                isOverallPos ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {isOverallPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isOverallPos ? '+' : ''}${totalUnrealizedPnL.toFixed(2)}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Cash Available</span>
            <p className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Positions Table */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Open Positions ({positions.length})
            </h4>
            <span className="text-[11px] text-slate-400">Mark to Market Real-Time</span>
          </div>

          {positions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No open positions. Use the "Trade Order" button on any chart to execute simulated paper trades!
            </div>
          ) : (
            <div className="space-y-2.5">
              {positions.map((pos) => {
                const isPos = pos.pnl >= 0;

                return (
                  <div
                    key={pos.id}
                    className="p-3 bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectSymbol(pos.symbol);
                            onClose();
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-[#2962ff] transition-colors"
                        >
                          {pos.symbol}
                        </button>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            pos.side === 'BUY'
                              ? 'bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]'
                              : 'bg-rose-50 dark:bg-[#f23645]/20 text-[#f23645]'
                          }`}
                        >
                          {pos.side}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {pos.quantity} units
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500 dark:text-[#787b86]">
                        <span>Entry: ${pos.entryPrice.toFixed(2)}</span>
                        <span>·</span>
                        <span>Current: ${pos.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`font-mono font-bold tabular-nums ${
                            isPos ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}${pos.pnl.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-mono tabular-nums ${
                            isPos ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-[#868993] hover:text-[#f23645] bg-slate-100 dark:bg-[#131722] hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-[#2a2e39] rounded transition-colors cursor-pointer"
                        title="Close this position at market price"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
