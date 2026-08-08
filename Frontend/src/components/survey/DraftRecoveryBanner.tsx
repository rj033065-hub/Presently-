'use client';

import React from 'react';
import { Clock, RefreshCw, ArrowRight, Trash2 } from 'lucide-react';
import { SurveyRecord } from '@/types/survey';

interface DraftRecoveryBannerProps {
  draft: SurveyRecord;
  onResume: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryBanner({ draft, onResume, onDiscard }: DraftRecoveryBannerProps) {
  const occasion = draft.survey_payload?.occasion || draft.occasion || 'Saved Gift Survey';
  const updatedDate = draft.updated_at
    ? new Date(draft.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 sm:p-5 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white flex-shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            Unfinished Survey Draft Found ({occasion})
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Saved on {updatedDate} at Step {draft.current_step || 1} of 12.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
        <button
          onClick={onDiscard}
          type="button"
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Discard</span>
        </button>

        <button
          onClick={onResume}
          type="button"
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow transition-colors"
        >
          <span>Resume Draft</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
