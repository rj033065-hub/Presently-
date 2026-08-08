'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '@/components/ui/layout';
import { SurveyStateData, SurveyRecord } from '@/types/survey';
import { getDefaultSurveyState } from '@/lib/survey-logic';
import {
  createSurveyDraft,
  updateSurveyDraft,
  getActiveDraft,
  getSurveyById,
  submitSurvey,
  deleteSurvey,
} from '@/lib/survey-api';

import { SurveyProgressBar } from '@/components/survey/SurveyProgressBar';
import { SurveyNavigation } from '@/components/survey/SurveyNavigation';
import { DraftRecoveryBanner } from '@/components/survey/DraftRecoveryBanner';

import { Step1Occasion } from '@/components/survey/Step1Occasion';
import { Step2Relationship } from '@/components/survey/Step2Relationship';
import { Step3RecipientProfile } from '@/components/survey/Step3RecipientProfile';
import { Step4Budget } from '@/components/survey/Step4Budget';
import { Step5Interests } from '@/components/survey/Step5Interests';
import { Step6Personality } from '@/components/survey/Step6Personality';
import { Step7Favorites } from '@/components/survey/Step7Favorites';
import { Step8Lifestyle } from '@/components/survey/Step8Lifestyle';
import { Step9Preferences } from '@/components/survey/Step9Preferences';
import { Step10Memories } from '@/components/survey/Step10Memories';
import { Step11Notes } from '@/components/survey/Step11Notes';
import { Step12Review } from '@/components/survey/Step12Review';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const STEP_TITLES: Record<number, string> = {
  1: 'Occasion & Event',
  2: 'Recipient Relationship',
  3: 'Demographics & Location',
  4: 'Budget Guardrails',
  5: 'Interests & Hobbies',
  6: 'Personality Vibe',
  7: 'Favorite Things',
  8: 'Daily Lifestyle',
  9: 'Format Preferences',
  10: 'Shared Memories',
  11: 'AI Concierge Notes',
  12: 'Review & Submit',
};

function SurveyPageContent() {
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSurveyId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [surveyData, setSurveyData] = useState<SurveyStateData>(getDefaultSurveyState());
  const [activeDraft, setActiveDraft] = useState<SurveyRecord | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(null);

  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const isDirtyRef = useRef<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load & Draft Recovery
  useEffect(() => {
    async function initSurvey() {
      try {
        const token = await getToken();
        if (editSurveyId) {
          const existing = await getSurveyById(editSurveyId, token);
          if (existing && existing.survey_payload) {
            setSurveyId(existing.id);
            setSurveyData(existing.survey_payload);
            setCurrentStep(existing.current_step || 1);
          }
        } else {
          const draft = await getActiveDraft(token);
          if (draft && draft.survey_payload && draft.status === 'draft') {
            setActiveDraft(draft);
          }
        }
      } catch (err) {
        console.error('Failed to load initial survey draft:', err);
      }
    }
    initSurvey();
  }, [getToken, editSurveyId]);

  // 2. Draft Save Helper
  const persistDraft = useCallback(
    async (stepToSave = currentStep, dataToSave = surveyData) => {
      try {
        setIsAutoSaving(true);
        const token = await getToken();
        if (surveyId) {
          await updateSurveyDraft(surveyId, dataToSave, stepToSave, token);
        } else {
          const created = await createSurveyDraft(token, dataToSave);
          setSurveyId(created.id);
        }
        setLastSavedAt(new Date());
        isDirtyRef.current = false;
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [getToken, surveyId, currentStep, surveyData]
  );

  // 3. Auto-Save Debounce (4 Seconds)
  useEffect(() => {
    if (!isDirtyRef.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      persistDraft(currentStep, surveyData);
    }, 4000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [surveyData, currentStep, persistDraft]);

  // 4. Unsaved Changes Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);

  // 5. Update Handler with Dirty Flag
  const updateData = (newFields: Partial<SurveyStateData>) => {
    isDirtyRef.current = true;
    setSurveyData((prev) => ({ ...prev, ...newFields }));
  };

  // 6. Navigation Handlers
  const handleNext = () => {
    if (currentStep < 12) {
      setSlideDirection('right');
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistDraft(nextStep, surveyData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setSlideDirection('left');
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
    }
  };

  const handleSkipOptional = () => {
    handleNext();
  };

  const handleResumeDraft = () => {
    if (activeDraft && activeDraft.survey_payload) {
      setSurveyId(activeDraft.id);
      setSurveyData(activeDraft.survey_payload);
      setCurrentStep(activeDraft.current_step || 1);
      setActiveDraft(null);
    }
  };

  const handleDiscardDraft = async () => {
    if (activeDraft) {
      const token = await getToken();
      await deleteSurvey(activeDraft.id, token);
      setActiveDraft(null);
    }
  };

  // 7. Submit Handler
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await getToken();
      let targetId = surveyId;
      if (!targetId) {
        const created = await createSurveyDraft(token, surveyData);
        targetId = created.id;
        setSurveyId(created.id);
      } else {
        await updateSurveyDraft(targetId, surveyData, 12, token, 'submitted');
      }

      await submitSurvey(targetId, token);
      setIsSubmittedSuccess(true);
    } catch (err) {
      console.error('Survey submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Active Draft Recovery Alert */}
          {activeDraft && currentStep === 1 && (
            <div className="mb-6">
              <DraftRecoveryBanner
                draft={activeDraft}
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
              />
            </div>
          )}

          {/* Submitted Success Confirmation View */}
          {isSubmittedSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-indigo-200/80 bg-white p-8 sm:p-12 shadow-2xl backdrop-blur-xl dark:border-indigo-900/60 dark:bg-zinc-900 text-center space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Structured Data Ready for AI Matching
                </span>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  Survey Submitted Successfully!
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Your recipient profiling parameters have been stored securely. Estimated AI matching time: 30–45 seconds.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push('/')}
                  type="button"
                  className="w-full sm:w-auto rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => {
                    setSurveyData(getDefaultSurveyState());
                    setCurrentStep(1);
                    setSurveyId(null);
                    setIsSubmittedSuccess(false);
                  }}
                  type="button"
                  className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition-colors"
                >
                  Start Another Survey
                </button>
              </div>
            </motion.div>
          ) : (
            /* Main Wizard Card Container */
            <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 sm:p-10 shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 space-y-8">
              {/* Header & Progress Bar */}
              <SurveyProgressBar
                currentStep={currentStep}
                totalSteps={12}
                stepTitle={STEP_TITLES[currentStep] || 'Gift Profiling'}
                isAutoSaving={isAutoSaving}
                lastSavedAt={lastSavedAt}
              />

              {/* Step Dynamic Content with Framer Motion */}
              <div className="min-h-[360px]">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentStep}
                    custom={slideDirection}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    {currentStep === 1 && (
                      <Step1Occasion
                        selected={surveyData.occasion}
                        customOccasion={surveyData.custom_occasion}
                        onChange={(occasion, custom) =>
                          updateData({ occasion, custom_occasion: custom })
                        }
                      />
                    )}

                    {currentStep === 2 && (
                      <Step2Relationship
                        selected={surveyData.relationship}
                        customRelationship={surveyData.custom_relationship}
                        onChange={(relationship, custom) =>
                          updateData({ relationship, custom_relationship: custom })
                        }
                      />
                    )}

                    {currentStep === 3 && (
                      <Step3RecipientProfile
                        data={surveyData.profile}
                        onChange={(profile) => updateData({ profile })}
                      />
                    )}

                    {currentStep === 4 && (
                      <Step4Budget
                        data={surveyData.budget}
                        onChange={(budget) => updateData({ budget })}
                      />
                    )}

                    {currentStep === 5 && (
                      <Step5Interests
                        selected={surveyData.interests}
                        onChange={(interests) => updateData({ interests })}
                      />
                    )}

                    {currentStep === 6 && (
                      <Step6Personality
                        selected={surveyData.personality}
                        onChange={(personality) => updateData({ personality })}
                      />
                    )}

                    {currentStep === 7 && (
                      <Step7Favorites
                        data={surveyData.favorites}
                        onChange={(favorites) => updateData({ favorites })}
                      />
                    )}

                    {currentStep === 8 && (
                      <Step8Lifestyle
                        data={surveyData.lifestyle}
                        onChange={(lifestyle) => updateData({ lifestyle })}
                      />
                    )}

                    {currentStep === 9 && (
                      <Step9Preferences
                        data={surveyData.preferences}
                        onChange={(preferences) => updateData({ preferences })}
                      />
                    )}

                    {currentStep === 10 && (
                      <Step10Memories
                        data={surveyData.memories}
                        onChange={(memories) => updateData({ memories })}
                      />
                    )}

                    {currentStep === 11 && (
                      <Step11Notes
                        value={surveyData.additional_notes}
                        onChange={(additional_notes) => updateData({ additional_notes })}
                      />
                    )}

                    {currentStep === 12 && (
                      <Step12Review
                        data={surveyData}
                        onEditStep={(stepNum) => setCurrentStep(stepNum)}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Wizard Navigation Footer */}
              <SurveyNavigation
                currentStep={currentStep}
                totalSteps={12}
                onPrev={handlePrev}
                onNext={handleNext}
                onSaveDraft={() => persistDraft(currentStep, surveyData)}
                onSkipOptional={handleSkipOptional}
                onSubmit={handleSubmit}
                isOptionalStep={currentStep === 10 || currentStep === 11}
                isSavingDraft={isAutoSaving}
                isSubmitting={isSubmitting}
                canNext={true}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-zinc-500">Loading Intelligent Survey Engine...</p>
          </div>
        </PageLayout>
      }
    >
      <SurveyPageContent />
    </Suspense>
  );
}
