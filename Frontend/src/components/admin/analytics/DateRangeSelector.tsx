'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  selectedRange: string;
  onChangeRange: (range: string) => void;
}

export function DateRangeSelector({ selectedRange, onChangeRange }: DateRangeSelectorProps) {
  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'This Year', value: 'this_year' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 shadow-sm overflow-x-auto">
      <div className="flex items-center space-x-1 px-2 text-zinc-500 text-xs font-semibold">
        <Calendar className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Range:</span>
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChangeRange(opt.value)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            selectedRange === opt.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
