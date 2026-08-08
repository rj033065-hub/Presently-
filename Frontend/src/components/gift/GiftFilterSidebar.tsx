'use client';

import React from 'react';
import { GiftCategory, GiftTag } from '@/types/gift';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GiftFilterSidebarProps {
  categories: GiftCategory[];
  tags: GiftTag[];
  selectedCategory?: string;
  selectedTag?: string;
  minPrice?: number;
  maxPrice?: number;
  isHandmade?: boolean;
  giftType?: string;
  sortBy?: string;
  onFilterChange: (filters: {
    category?: string;
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    isHandmade?: boolean;
    giftType?: string;
    sortBy?: string;
  }) => void;
  onReset: () => void;
}

export function GiftFilterSidebar({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  minPrice,
  maxPrice,
  isHandmade,
  giftType,
  sortBy = 'trending',
  onFilterChange,
  onReset,
}: GiftFilterSidebarProps) {
  const giftTypes = ['Physical', 'Digital', 'Experience', 'Subscription'];

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center space-x-2 font-bold text-zinc-900 dark:text-white text-sm">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Filter Catalog</span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors flex items-center"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Sort Results By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        >
          <option value="trending">🔥 Trending & Popularity</option>
          <option value="rating">★ Highest Customer Rating</option>
          <option value="price_asc">💵 Price: Low to High</option>
          <option value="price_desc">💎 Price: High to Low</option>
          <option value="newest">✨ Newest Arrivals</option>
        </select>
      </div>

      {/* Categories Dropdown */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gift Format Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Gift Format
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {giftTypes.map((gt) => {
            const isSelected = giftType === gt;
            return (
              <button
                key={gt}
                type="button"
                onClick={() =>
                  onFilterChange({ giftType: isSelected ? undefined : gt })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                }`}
              >
                {gt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Chips */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Tags & Attributes
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const isSelected = selectedTag === t.slug;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({ tag: isSelected ? undefined : t.slug })
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                  }`}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Handmade Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Handmade & Artisan Only
        </span>
        <input
          type="checkbox"
          checked={!!isHandmade}
          onChange={(e) => onFilterChange({ isHandmade: e.target.checked || undefined })}
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
