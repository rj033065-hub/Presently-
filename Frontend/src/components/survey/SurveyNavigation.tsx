'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save, FastForward, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SurveyNavigationProps {
  currentStep: number;
  totalSteps?: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSkipOptional?: () => void;
  onSubmit?: () => void;
  isOptionalStep?: boolean;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  canNext?: boolean;
}

export function SurveyNavigation({
  currentStep,
  totalSteps = 12,
  onPrev,
  onNext,
  onSaveDraft,
  onSkipOptional,
  onSubmit,
  isOptionalStep = false,
  isSavingDraft = false,
  isSubmitting = false,
  canNext = true,
}: SurveyNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80">
      {/* Left Action: Prev */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
        <Button
          onClick={onPrev}
          disabled={isFirstStep || isSubmitting}
          variant="secondary"
          size="md"
          className="rounded-xl border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
          type="button"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          <span>Back</span>
        </Button>

        {/* Save Draft Action */}
        <button
          onClick={onSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          type="button"
          className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
        >
          {isSavingDraft ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </>
          )}
        </button>
      </div>

      {/* Right Actions: Skip Optional or Next / Submit */}
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
        {isOptionalStep && onSkipOptional && !isLastStep && (
          <button
            onClick={onSkipOptional}
            type="button"
            className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <FastForward className="h-3.5 w-3.5 mr-1" />
            <span>Skip for Now</span>
          </button>
        )}

        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={!canNext || isSubmitting}
            size="md"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6"
            type="button"
          >
            <span>Next Step</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-extrabold rounded-xl px-8 shadow-lg shadow-indigo-500/20"
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Submitting Survey...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                <span>Submit & Match AI Gifts</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
