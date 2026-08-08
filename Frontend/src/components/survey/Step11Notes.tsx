'use client';

import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

interface Step11NotesProps {
  value: string;
  onChange: (notes: string) => void;
}

export function Step11Notes({ value, onChange }: Step11NotesProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl flex items-center">
          <Cpu className="h-6 w-6 text-indigo-500 mr-2" />
          Additional AI Concierge Instructions (Optional)
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Anything else you want our AI recommendation engine to know before calculating gift match scores?
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          rows={6}
          placeholder="e.g. She recently moved into a new apartment with a small balcony. Prefers compact items. Already owns a Kindle and Nintendo Switch..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />

        <div className="rounded-xl bg-indigo-50/70 p-3.5 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 flex items-center space-x-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-500 flex-shrink-0" />
          <span>Our AI engine parses free-text notes alongside recipient psychometrics to refine rankings.</span>
        </div>
      </div>
    </div>
  );
}
