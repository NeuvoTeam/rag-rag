import React, { useState } from 'react';
import { PriceAlert, MarketAsset } from '../types/market';
import { Bell, X, Trash2, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MarketAsset;
  alerts: PriceAlert[];
  onCreateAlert: (alert: PriceAlert) => void;
  onDeleteAlert: (id: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  asset,
  alerts,
  onCreateAlert,
  onDeleteAlert,
}) => {
  const [targetPrice, setTargetPrice] = useState<number>(Number((asset.price * 1.03).toFixed(2)));
  const [condition, setCondition] = useState<'CROSSES_ABOVE' | 'CROSSES_BELOW'>('CROSSES_ABOVE');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: asset.symbol,
      targetPrice,
      condition,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggered: false,
    };
    onCreateAlert(newAlert);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2a2e39] flex items-center justify-between bg-slate-50/70 dark:bg-[#181c27]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Price Alerts Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#787b86]">
                Target notifications for {asset.symbol} (${asset.price.toFixed(2)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-200 dark:border-[#2a2e39] space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 dark:text-[#787b86] mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white font-medium"
              >
                <option value="CROSSES_ABOVE">Crosses Above</option>
                <option value="CROSSES_BELOW">Crosses Below</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-[#787b86] mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Set Alert
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="p-4 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Active Alerts ({alerts.length})
          </h4>

          {alerts.map((al) => (
            <div
              key={al.id}
              className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-[#131722]/50 rounded px-1"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {al.symbol}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {al.condition === 'CROSSES_ABOVE' ? '≥' : '≤'} ${al.targetPrice.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Set at {al.createdAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    al.triggered
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-[#089981]'
                  }`}
                >
                  {al.triggered ? 'Triggered' : 'Active'}
                </span>
                <button
                  onClick={() => onDeleteAlert(al.id)}
                  className="p-1 text-slate-400 hover:text-[#f23645] rounded"
                  title="Remove alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No active alerts. Add one above to get notified on breakout levels.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
