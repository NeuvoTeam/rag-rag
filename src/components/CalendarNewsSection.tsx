import React, { useState } from 'react';
import { ECONOMIC_EVENTS, MARKET_NEWS, TRADE_IDEAS } from '../data/marketData';
import { Calendar, Newspaper, Lightbulb, ThumbsUp, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';

export const CalendarNewsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'news' | 'ideas'>('calendar');

  return (
    <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] rounded-xl overflow-hidden">
      {/* Subheader Tabs */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50/70 dark:bg-[#181c27] flex items-center justify-between">
        <div className="flex items-center gap-2 p-0.5 bg-slate-200/70 dark:bg-[#1e222d] rounded-lg">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Economic Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Market News</span>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'ideas'
                ? 'bg-white dark:bg-[#2962ff] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#868993] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Community Ideas</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-[#787b86] hidden sm:inline">
          Live Catalyst Feed
        </span>
      </div>

      {/* Tab 1: Economic Calendar */}
      {activeTab === 'calendar' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2a2e39] text-slate-500 dark:text-[#787b86] text-[11px] uppercase">
                <th className="py-2.5 px-4">Time (EST)</th>
                <th className="py-2.5 px-4">Country</th>
                <th className="py-2.5 px-4">Event</th>
                <th className="py-2.5 px-4 text-center">Impact</th>
                <th className="py-2.5 px-4 text-right">Actual</th>
                <th className="py-2.5 px-4 text-right">Forecast</th>
                <th className="py-2.5 px-4 text-right">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60 font-mono">
              {ECONOMIC_EVENTS.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-[#1e222d]/60">
                  <td className="py-3 px-4 text-slate-500 dark:text-[#787b86]">
                    {event.time}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                    <span className="mr-1.5">{event.flag}</span>
                    {event.country}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-800 dark:text-[#d1d4dc]">
                    {event.event}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.impact === 'High'
                          ? 'bg-rose-50 dark:bg-rose-500/15 text-[#f23645]'
                          : event.impact === 'Medium'
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-500'
                          : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-500'
                      }`}
                    >
                      {event.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {event.actual || '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-[#d1d4dc] tabular-nums">
                    {event.forecast || '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 dark:text-[#787b86] tabular-nums">
                    {event.previous}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Market News */}
      {activeTab === 'news' && (
        <div className="divide-y divide-slate-100 dark:divide-[#2a2e39]/60">
          {MARKET_NEWS.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-[#1e222d]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#787b86]">
                  <span className="font-semibold text-slate-700 dark:text-[#d1d4dc]">
                    {item.source}
                  </span>
                  <span>·</span>
                  <span>{item.time}</span>
                  <span>·</span>
                  <span>{item.readTime}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1 hover:text-[#2962ff] transition-colors cursor-pointer">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    item.sentiment === 'bullish'
                      ? 'bg-emerald-50 dark:bg-[#089981]/15 text-[#089981]'
                      : item.sentiment === 'bearish'
                      ? 'bg-rose-50 dark:bg-[#f23645]/15 text-[#f23645]'
                      : 'bg-slate-100 dark:bg-[#2a2e39] text-slate-600 dark:text-[#868993]'
                  }`}
                >
                  {item.sentiment.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Community Trade Ideas */}
      {activeTab === 'ideas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {TRADE_IDEAS.map((idea) => (
            <div
              key={idea.id}
              className="bg-slate-50 dark:bg-[#181c27] border border-slate-200 dark:border-[#2a2e39] rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-[#2a2e39]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {idea.symbol}
                    </span>
                    <span className="text-[11px] text-slate-400">· {idea.timeframe}</span>
                  </div>
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded ${
                      idea.sentiment === 'Long'
                        ? 'bg-emerald-50 dark:bg-[#089981]/20 text-[#089981]'
                        : 'bg-rose-50 dark:bg-[#f23645]/20 text-[#f23645]'
                    }`}
                  >
                    {idea.sentiment}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">
                  {idea.title}
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-[#868993] mt-2 line-clamp-3">
                  {idea.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-[#2a2e39] text-[11px] text-slate-500 dark:text-[#787b86]">
                <span>by <strong className="text-slate-700 dark:text-[#d1d4dc]">{idea.author}</strong></span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {idea.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {idea.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
