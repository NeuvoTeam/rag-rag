import React from 'react';
import { AssetClass } from '../types/market';
import { LayoutGrid, BarChart2, Bitcoin, DollarSign, Activity, Flame, ShieldAlert, Grid, Columns } from 'lucide-react';

interface MarketTabsProps {
  activeTab: AssetClass;
  setActiveTab: (tab: AssetClass) => void;
}

export const MarketTabs: React.FC<MarketTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: AssetClass; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'stocks', label: 'Stocks', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'multichart', label: 'Multi-Chart', icon: <Columns className="w-4 h-4" /> },
    { id: 'crypto', label: 'Crypto', icon: <Bitcoin className="w-4 h-4" /> },
    { id: 'forex', label: 'Forex', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'indices', label: 'Indices', icon: <Activity className="w-4 h-4" /> },
    { id: 'futures', label: 'Futures', icon: <Flame className="w-4 h-4" /> },
    { id: 'bonds', label: 'Bonds', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'heatmap', label: 'Heatmaps', icon: <Grid className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/50 dark:bg-[#181c27] transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-[#d1d4dc] hover:bg-slate-200/60 dark:hover:bg-[#202533]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
