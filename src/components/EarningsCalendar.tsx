import React from 'react';
import { EARNINGS_CALENDAR } from '../data/marketData';
import { Calendar, ArrowUpRight, Clock } from 'lucide-react';

interface EarningsCalendarProps {
  onSelectSymbol?: (symbol: string) => void;
}

export const EarningsCalendar: React.FC<EarningsCalendarProps> = ({ onSelectSymbol }) => {
  return (
    <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2a2e39]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2962ff]" />
            Corporate Earnings Calendar
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#787b86]">
            Wall Street quarterly consensus estimates and reported surprises
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">Q3 / Q4 Season</span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#2a2e39] text-slate-500 dark:text-[#787b86] text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-center">Timing</th>
              <th className="py-2.5 px-3 text-right">EPS Est.</th>
              <th className="py-2.5 px-3 text-right">EPS Reported</th>
              <th className="py-2.5 px-3 text-right">Surprise</th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">Revenue Est.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60 font-mono">
            {EARNINGS_CALENDAR.map((item) => {
              const hasSurprise = item.surprise !== undefined;
              const isPosSurprise = (item.surprise || 0) >= 0;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
                  className="hover:bg-slate-50 dark:hover:bg-[#1e222d] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 font-sans">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.symbol}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-[#d1d4dc] tabular-nums">
                    {item.date}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#2a2e39] text-[10px] font-semibold text-slate-600 dark:text-[#868993]">
                      {item.time === 'BMO' ? 'Pre-Market' : 'After-Hours'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-[#868993] tabular-nums">
                    ${item.epsEstimated.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {item.epsReported !== undefined ? `$${item.epsReported.toFixed(2)}` : 'Pending'}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {hasSurprise ? (
                      <span
                        className={`font-semibold tabular-nums ${
                          isPosSurprise ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPosSurprise ? '+' : ''}
                        {item.surprise?.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-[#d1d4dc] hidden sm:table-cell tabular-nums">
                    {item.revenueEst}
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
