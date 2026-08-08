'use client';

import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'detail' | 'sidebar';
}

export function LoadingSkeleton({ count = 3, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'detail') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-4">
        {/* Cover Skeleton */}
        <div className="w-full h-80 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Title & Author */}
        <div className="space-y-4">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-3/4" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
            </div>
          </div>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className="space-y-6 animate-pulse p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm animate-pulse flex flex-col h-[380px]"
        >
          {/* Card Header Image */}
          <div className="h-48 bg-zinc-200 dark:bg-zinc-800 w-full" />

          {/* Card Body */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-20" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16" />
              </div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-4/5" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              </div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
