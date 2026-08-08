'use client';

import React from 'react';
import { Gamepad2, Music, BookOpen, Plane, Cpu, Dumbbell, Shirt, Camera, Utensils, Palette, Trophy, Film, Tv, Car, Dog, Flower2, Check } from 'lucide-react';

interface Step5InterestsProps {
  selected: string[];
  onChange: (updated: string[]) => void;
}

export function Step5Interests({ selected, onChange }: Step5InterestsProps) {
  const options = [
    { name: 'Gaming', icon: Gamepad2, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
    { name: 'Music', icon: Music, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' },
    { name: 'Books', icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
    { name: 'Travel', icon: Plane, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60' },
    { name: 'Technology', icon: Cpu, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' },
    { name: 'Fitness', icon: Dumbbell, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
    { name: 'Fashion', icon: Shirt, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' },
    { name: 'Photography', icon: Camera, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60' },
    { name: 'Cooking', icon: Utensils, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/60' },
    { name: 'Art', icon: Palette, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/60' },
    { name: 'Sports', icon: Trophy, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/60' },
    { name: 'Movies', icon: Film, color: 'text-red-500 bg-red-50 dark:bg-red-950/60' },
    { name: 'Anime', icon: Tv, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/60' },
    { name: 'Cars', icon: Car, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    { name: 'Pets', icon: Dog, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
    { name: 'Gardening', icon: Flower2, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60' },
  ];

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((item) => item !== interest));
    } else {
      onChange([...selected, interest]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
            What are their primary interests & hobbies?
          </h3>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Select all that apply to help the AI cross-reference product categories.
          </p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full hidden sm:inline">
          {selected.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected.includes(opt.name);
          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => toggleInterest(opt.name)}
              className={`relative flex items-center space-x-3 p-3.5 rounded-2xl border transition-all text-left ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40 shadow-sm scale-[1.02]'
                  : 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${opt.color} flex-shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate flex-1">
                {opt.name}
              </span>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
