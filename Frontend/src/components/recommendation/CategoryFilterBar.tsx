'use client';

import React from 'react';

interface CategoryFilterBarProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  counts: Record<string, number>;
}

export function CategoryFilterBar({
  selectedFilter,
  onSelectFilter,
  counts,
}: CategoryFilterBarProps) {
  const filters = [
    { key: 'All', label: 'All Matches' },
    { key: 'Top Pick', label: 'Top Picks' },
    { key: 'Best Value', label: 'Best Value' },
    { key: 'Most Personalized', label: 'Personalized' },
    { key: 'Luxury Choice', label: 'Luxury' },
    { key: 'Experience Gift', label: 'Experiences' },
    { key: 'AI Generated Idea', label: 'AI Fallback Ideas' },
  ];

  return (
    <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
      {filters.map((f) => {
        const count = f.key === 'All' ? counts['All'] || 0 : counts[f.key] || 0;
        const isSelected = selectedFilter === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelectFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            <span>{f.label}</span>
            {count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-indigo-800 text-white'
                    : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
