'use client';

import React from 'react';
import { PackageOpen, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

export function EmptyState({
  title = 'No Stories Found',
  description = 'There are no unboxing stories matching your selected criteria. Try adjusting your filters or search term.',
  onReset,
  resetText = 'Reset Filters',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
        <PackageOpen className="w-8 h-8 opacity-90" />
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          <span>{resetText}</span>
        </Button>
      )}
    </div>
  );
}
