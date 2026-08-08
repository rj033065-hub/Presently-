'use client';

import React from 'react';
import { SurveyStateData } from '@/types/survey';
import { Edit2, Sparkles, CheckCircle2, Clock, ShieldCheck, Heart, Tag, User, Gift, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step12ReviewProps {
  data: SurveyStateData;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function Step12Review({ data, onEditStep, onSubmit, isSubmitting = false }: Step12ReviewProps) {
  const currencySymbol = data.budget.currency === 'INR' ? '₹' : '$';

  const sections = [
    {
      step: 1,
      title: 'Occasion & Event',
      value: data.occasion === 'Other' && data.custom_occasion ? data.custom_occasion : data.occasion,
      icon: Gift,
    },
    {
      step: 2,
      title: 'Relationship',
      value: data.relationship === 'Other' && data.custom_relationship ? data.custom_relationship : data.relationship,
      icon: Heart,
    },
    {
      step: 3,
      title: 'Recipient Profile',
      value: `${data.profile.name ? data.profile.name + ', ' : ''}${data.profile.age || 28} yrs (${data.profile.country})`,
      icon: User,
    },
    {
      step: 4,
      title: 'Target Budget',
      value: `${currencySymbol}${data.budget.min} – ${currencySymbol}${data.budget.max} (${data.budget.currency})`,
      icon: Tag,
    },
    {
      step: 5,
      title: 'Interests & Hobbies',
      value: data.interests.length > 0 ? data.interests.join(', ') : 'None selected',
      icon: Sliders,
    },
    {
      step: 6,
      title: 'Personality Traits',
      value: data.personality.length > 0 ? data.personality.join(', ') : 'None selected',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-3 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>STEP 12 OF 12 – FINAL REVIEW</span>
        </div>
        <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
          Review Your Survey Answers
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Verify all information before sending structured data to our AI Recommendation Engine.
        </p>
      </div>

      {/* Summary Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.step}
              className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 flex justify-between items-start space-x-3"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Step {sec.step} • {sec.title}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {sec.value}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEditStep(sec.step)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                title={`Edit Step ${sec.step}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Extra Detail Summary */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            Preferences & Personal Notes
          </h4>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            Steps 7 - 11
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Gift Formats:
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {(data.preferences.gift_types || []).join(', ') || 'Standard'}
            </span>
          </div>

          <div>
            <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Lifestyle Tags:
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {Object.entries(data.lifestyle)
                .filter(([_, v]) => v)
                .map(([k]) => k.replace(/_/g, ' '))
                .join(', ') || 'Standard'}
            </span>
          </div>

          {data.preferences.dislikes_and_restrictions && (
            <div className="sm:col-span-2">
              <span className="font-bold text-amber-500 uppercase tracking-wider block mb-1">
                Dislikes / Restrictions:
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200 italic">
                {data.preferences.dislikes_and_restrictions}
              </span>
            </div>
          )}

          {data.additional_notes && (
            <div className="sm:col-span-2">
              <span className="font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                Custom AI Notes:
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {data.additional_notes}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Processing Time Pill & Trust Note */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 p-5 dark:border-indigo-900/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
              Estimated AI Processing Time: 30 – 45 Seconds
            </h5>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              GPT-4o & Sonnet 3.5 will calculate match scores and explain reasoning.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          <span>Zero PII Storage</span>
        </div>
      </div>
    </div>
  );
}
