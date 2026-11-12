import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { X, TrendingUp, TrendingDown, CheckCircle, ShieldAlert } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MarketAsset;
  onExecuteTrade: (trade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
  }) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  asset,
  onExecuteTrade,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(asset.price);
  const [enableTP, setEnableTP] = useState(false);
  const [takeProfit, setTakeProfit] = useState<number>(Number((asset.price * 1.05).toFixed(2)));
  const [enableSL, setEnableSL] = useState(false);
  const [stopLoss, setStopLoss] = useState<number>(Number((asset.price * 0.95).toFixed(2)));
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const executionPrice = orderType === 'MARKET' ? asset.price : limitPrice;
  const totalValue = quantity * executionPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteTrade({
      symbol: asset.symbol,
      side,
      quantity,
      price: executionPrice,
      total: totalValue,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between bg-slate-50/70 dark:bg-[#181c27]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Place Paper Order
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-[#2962ff]/20 text-[#2962ff]">
                {asset.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#787b86]">
              Market: ${asset.price.toFixed(2)} {asset.currency}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#089981]/20 text-[#089981] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Order Executed Successfully!
            </h4>
            <p className="text-xs font-mono text-slate-500 dark:text-[#787b86]">
              {side} {quantity} {asset.symbol} @ ${executionPrice.toFixed(2)} (${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  side === 'BUY'
                    ? 'bg-[#089981] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Buy / Long
              </button>

              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  side === 'SELL'
                    ? 'bg-[#f23645] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
                }`}
              >
                <TrendingDown className="w-4 h-4" /> Sell / Short
              </button>
            </div>

            {/* Order Type */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-[#787b86]">Order Type</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#131722] rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    orderType === 'MARKET'
                      ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                    orderType === 'LIMIT'
                      ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* Limit Price Input (if LIMIT) */}
            {orderType === 'LIMIT' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#787b86]">Limit Price</span>
                <input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2.5 py-1 text-right font-mono font-bold bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-[#787b86]">Units / Quantity</span>
              <div className="flex items-center gap-2">
                {[1, 10, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`px-2 py-1 text-[11px] font-mono rounded border ${
                      quantity === q
                        ? 'border-[#2962ff] bg-blue-50 dark:bg-[#2962ff]/10 text-[#2962ff]'
                        : 'border-slate-200 dark:border-[#2a2e39] text-slate-500'
                    }`}
                  >
                    {q}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 text-right font-mono font-bold bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Take Profit & Stop Loss Toggles */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#2a2e39] space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-[#d1d4dc]">
                  <input
                    type="checkbox"
                    checked={enableTP}
                    onChange={(e) => setEnableTP(e.target.checked)}
                    className="rounded text-[#089981] focus:ring-[#089981]"
                  />
                  <span>Take Profit (+5%)</span>
                </label>
                {enableTP && (
                  <input
                    type="number"
                    step="0.01"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-0.5 text-right font-mono text-[11px] bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-[#d1d4dc]">
                  <input
                    type="checkbox"
                    checked={enableSL}
                    onChange={(e) => setEnableSL(e.target.checked)}
                    className="rounded text-[#f23645] focus:ring-[#f23645]"
                  />
                  <span>Stop Loss (-5%)</span>
                </label>
                {enableSL && (
                  <input
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-0.5 text-right font-mono text-[11px] bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded"
                  />
                )}
              </div>
            </div>

            {/* Total Order Summary */}
            <div className="p-3 bg-slate-50 dark:bg-[#131722] rounded-xl border border-slate-200 dark:border-[#2a2e39] flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-[#787b86]">Total Order Value</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold text-white shadow-md transition-all cursor-pointer ${
                side === 'BUY'
                  ? 'bg-[#089981] hover:bg-[#067a67]'
                  : 'bg-[#f23645] hover:bg-[#d02533]'
              }`}
            >
              {side === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
