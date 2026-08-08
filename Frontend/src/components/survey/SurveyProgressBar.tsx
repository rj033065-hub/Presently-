'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface SurveyProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  isAutoSaving?: boolean;
  lastSavedAt?: Date | null;
}

export function SurveyProgressBar({
  currentStep,
  totalSteps = 12,
  stepTitle,
  isAutoSaving = false,
  lastSavedAt = null,
}: SurveyProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-3 pb-6">
      {/* Step Info & Save Status Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-zinc-900 dark:text-white font-bold text-sm sm:text-base hidden sm:inline">
            {stepTitle}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400 text-xs">
          {isAutoSaving ? (
            <span className="flex items-center text-indigo-500 font-semibold animate-pulse">
              <Clock className="mr-1 h-3.5 w-3.5" /> Auto-saving draft...
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Draft saved
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500" /> Auto-save enabled
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="relative h-2.5 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Mobile Step Title */}
      <div className="text-sm font-bold text-zinc-900 dark:text-white sm:hidden">
        {stepTitle}
      </div>
    </div>
  );
}
