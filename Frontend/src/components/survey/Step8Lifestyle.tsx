'use client';

import React from 'react';
import { LifestyleData } from '@/types/survey';
import { Home, GraduationCap, Plane, Dog, Coffee, Flame, Dumbbell, Leaf, Gem, Wrench, Check } from 'lucide-react';

interface Step8LifestyleProps {
  data: LifestyleData;
  onChange: (updated: LifestyleData) => void;
}

export function Step8Lifestyle({ data, onChange }: Step8LifestyleProps) {
  const habits: { key: keyof LifestyleData; label: string; icon: any; desc: string }[] = [
    { key: 'works_from_home', label: 'Works From Home', icon: Home, desc: 'Desk accessories, ergonomics & home office gear' },
    { key: 'is_student', label: 'Student / Academic', icon: GraduationCap, desc: 'Study supplies, backpacks & tech organizers' },
    { key: 'is_traveler', label: 'Frequent Traveler', icon: Plane, desc: 'Travel accessories, luggage & portable items' },
    { key: 'is_pet_owner', label: 'Pet Owner', icon: Dog, desc: 'Dog/cat parent accessories & pet keepsakes' },
    { key: 'coffee_lover', label: 'Coffee Enthusiast', icon: Coffee, desc: 'Espresso gear, roasts & pour-over kettles' },
    { key: 'tea_lover', label: 'Tea Lover', icon: Flame, desc: 'Loose leaf teas, teapots & ceremony sets' },
    { key: 'fitness_enthusiast', label: 'Fitness Enthusiast', icon: Dumbbell, desc: 'Gym gear, recovery tools & activewear' },
    { key: 'eco_friendly', label: 'Eco-Friendly & Sustainable', icon: Leaf, desc: 'Zero-waste items, organic & recycled materials' },
    { key: 'luxury_buyer', label: 'Luxury & Artisan Buyer', icon: Gem, desc: 'Premium materials, designer & heirloom quality' },
    { key: 'diy_lover', label: 'DIY & Crafter', icon: Wrench, desc: 'Craft kits, tools & workshop accessories' },
  ];

  const toggleHabit = (key: keyof LifestyleData) => {
    onChange({
      ...data,
      [key]: !data[key],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          What is their daily lifestyle like?
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Lifestyle habits help identify practical everyday gifts they will actually use.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {habits.map((h) => {
          const Icon = h.icon;
          const isSelected = !!data[h.key];
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => toggleHabit(h.key)}
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
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{h.label}</h4>
                  {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{h.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
