'use client';

import React from 'react';
import { MemoriesData } from '@/types/survey';
import { Heart, Calendar, Smile, Sparkles, MessageSquare } from 'lucide-react';

interface Step10MemoriesProps {
  data: MemoriesData;
  onChange: (updated: MemoriesData) => void;
}

export function Step10Memories({ data, onChange }: Step10MemoriesProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          Shared Memories & Personal Touch (Optional)
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Personal anecdotes help the AI suggest deeply sentimental gifts or custom engravings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Favorite Shared Memory */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center">
            <Heart className="h-3.5 w-3.5 text-rose-500 mr-1.5" />
            Favorite Shared Memory
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Our road trip through Big Sur when our car broke down..."
            value={data.shared_memory || ''}
            onChange={(e) => onChange({ ...data, shared_memory: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        {/* Special Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
              Special Date or Anniversary
            </label>
            <input
              type="text"
              placeholder="e.g. October 14, 2021"
              value={data.special_date || ''}
              onChange={(e) => onChange({ ...data, special_date: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
              Nicknames or Inside Jokes
            </label>
            <input
              type="text"
              placeholder="e.g. Captain, Bear"
              value={data.nicknames || ''}
              onChange={(e) => onChange({ ...data, nicknames: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>

        {/* Funny Moment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center">
            <Smile className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
            Funny Moment or Inside Story
          </label>
          <textarea
            rows={2}
            placeholder="e.g. The time he accidentally put salt instead of sugar in his coffee..."
            value={data.funny_moment || ''}
            onChange={(e) => onChange({ ...data, funny_moment: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        {/* Card Message / Special Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center">
            <MessageSquare className="h-3.5 w-3.5 text-purple-500 mr-1.5" />
            Special Message for Gift Card (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Happy 30th Birthday! Here is to many more adventures together..."
            value={data.special_message || ''}
            onChange={(e) => onChange({ ...data, special_message: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
