'use client';

import React from 'react';
import { Category, Tag, CommunityPostFilterParams } from '@/types/community';
import { Filter, Calendar, Clock, Flame, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdvancedFilterPanelProps {
  categories: Category[];
  tags: Tag[];
  filters: CommunityPostFilterParams;
  onFilterChange: (filters: CommunityPostFilterParams) => void;
  onReset: () => void;
}

export function AdvancedFilterPanel({
  categories,
  tags,
  filters,
  onFilterChange,
  onReset,
}: AdvancedFilterPanelProps) {
  const handleDateChange = (val?: string) => {
    onFilterChange({ ...filters, dateRange: val as any, page: 1 });
  };

  const handleReadingTimeChange = (val?: string) => {
    onFilterChange({ ...filters, readingTimeBucket: val as any, page: 1 });
  };

  const handleSortChange = (val: string) => {
    onFilterChange({ ...filters, sortBy: val as any, page: 1 });
  };

  const activeFiltersCount =
    (filters.categoryId ? 1 : 0) +
    (filters.tagId ? 1 : 0) +
    (filters.dateRange ? 1 : 0) +
    (filters.readingTimeBucket ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>Advanced Discovery Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Date Range Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span>Publication Date</span>
          </label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) => handleDateChange(e.target.value || undefined)}
            className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">All Time</option>
            <option value="today">Past 24 Hours</option>
            <option value="this_week">Past Week</option>
            <option value="this_month">Past Month</option>
            <option value="this_year">Past Year</option>
          </select>
        </div>

        {/* Reading Time Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>Reading Length</span>
          </label>
          <select
            value={filters.readingTimeBucket || ''}
            onChange={(e) => handleReadingTimeChange(e.target.value || undefined)}
            className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">Any Length</option>
            <option value="short">Quick Read (1–3 min)</option>
            <option value="medium">Medium Read (4–7 min)</option>
            <option value="long">Deep Story (8+ min)</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-indigo-500" />
            <span>Sort Feed By</span>
          </label>
          <select
            value={filters.sortBy || 'created_at'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="created_at">Latest Stories</option>
            <option value="view_count">Most Viewed</option>
            <option value="likes_count">Most Popular Likes</option>
            <option value="reading_time">Reading Time</option>
          </select>
        </div>
      </div>
    </div>
  );
}
