'use client';

import React from 'react';
import { OccasionType } from '@/types/survey';
import { Cake, Heart, HeartHandshake, GraduationCap, Gift, Flame, Sun, Users, Award, Sparkles, HelpCircle } from 'lucide-react';

interface Step1OccasionProps {
  selected: OccasionType;
  customOccasion?: string;
  onChange: (occasion: OccasionType, custom?: string) => void;
}

export function Step1Occasion({ selected, customOccasion = '', onChange }: Step1OccasionProps) {
  const occasions: { type: OccasionType; label: string; icon: any; color: string }[] = [
    { type: 'Birthday', label: 'Birthday', icon: Cake, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
    { type: 'Anniversary', label: 'Anniversary', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' },
    { type: 'Wedding', label: 'Wedding', icon: HeartHandshake, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
    { type: 'Graduation', label: 'Graduation', icon: GraduationCap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' },
    { type: "Valentine's Day", label: "Valentine's Day", icon: Flame, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/60' },
    { type: 'Christmas', label: 'Christmas & Holidays', icon: Gift, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
    { type: "Mother's Day", label: "Mother's Day", icon: Sun, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' },
    { type: "Father's Day", label: "Father's Day", icon: Award, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60' },
    { type: 'Friendship', label: 'Friendship', icon: Users, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60' },
    { type: 'Congratulations', label: 'Congratulations', icon: Sparkles, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/60' },
    { type: 'Other', label: 'Other Special Event', icon: HelpCircle, color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          What is the occasion for this gift?
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Select the milestone or event you are celebrating.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {occasions.map((occ) => {
          const Icon = occ.icon;
          const isSelected = selected === occ.type;
          return (
            <button
              key={occ.type}
              type="button"
              onClick={() => onChange(occ.type, customOccasion)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-md scale-[1.02]'
                  : 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`p-3 rounded-xl ${occ.color} mb-2.5 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                {occ.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected === 'Other' && (
        <div className="pt-2 max-w-md">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
            Specify Custom Occasion Name
          </label>
          <input
            type="text"
            placeholder="e.g. Promotion, Housewarming, Retirement"
            value={customOccasion}
            onChange={(e) => onChange('Other', e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
