'use client';

import React from 'react';
import { Smile, Heart, Sparkles, Compass, Gem, Feather, Wrench, Laugh, Shield, Check } from 'lucide-react';

interface Step6PersonalityProps {
  selected: string[];
  onChange: (updated: string[]) => void;
}

export function Step6Personality({ selected, onChange }: Step6PersonalityProps) {
  const traits = [
    { name: 'Introvert', icon: Shield, desc: 'Enjoys cozy downtime & personal hobbies' },
    { name: 'Extrovert', icon: Smile, desc: 'Thrives in social & high-energy settings' },
    { name: 'Romantic', icon: Heart, desc: 'Loves sentimental & affectionate gifts' },
    { name: 'Funny', icon: Laugh, desc: 'Appreciates humor, witty gags & novelty' },
    { name: 'Creative', icon: Sparkles, desc: 'Values artistic, custom & DIY gifts' },
    { name: 'Adventurous', icon: Compass, desc: 'Enjoys outdoor quests & new experiences' },
    { name: 'Luxury Lover', icon: Gem, desc: 'Appreciates high-end artisan craftsmanship' },
    { name: 'Minimalist', icon: Feather, desc: 'Prefers uncluttered, clean & useful items' },
    { name: 'Practical', icon: Wrench, desc: 'Loves highly functional & everyday items' },
    { name: 'Emotional', icon: Heart, desc: 'Deeply touched by meaningful keepsakes' },
  ];

  const toggleTrait = (trait: string) => {
    if (selected.includes(trait)) {
      onChange(selected.filter((t) => t !== trait));
    } else {
      onChange([...selected, trait]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
            What is their personality vibe?
          </h3>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Select personality traits to guide the AI match sentiment.
          </p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full hidden sm:inline">
          {selected.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {traits.map((t) => {
          const Icon = t.icon;
          const isSelected = selected.includes(t.name);
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => toggleTrait(t.name)}
              className={`p-4 rounded-2xl border transition-all text-left flex items-start space-x-3.5 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40 shadow-sm scale-[1.01]'
                  : 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{t.name}</h4>
                  {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
