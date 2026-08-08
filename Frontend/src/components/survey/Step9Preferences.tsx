'use client';

import React from 'react';
import { PreferencesData } from '@/types/survey';
import { HeartHandshake, Laptop, Compass, Gem, Wrench, Sparkles, Repeat, AlertTriangle, Check } from 'lucide-react';

interface Step9PreferencesProps {
  data: PreferencesData;
  onChange: (updated: PreferencesData) => void;
}

export function Step9Preferences({ data, onChange }: Step9PreferencesProps) {
  const giftTypes = [
    { name: 'Handmade gifts', icon: HeartHandshake, desc: 'Artisan, crafted & unique' },
    { name: 'Digital gifts', icon: Laptop, desc: 'Gift cards, e-learning, digital software' },
    { name: 'Experiences', icon: Compass, desc: 'Events, concert tickets, travel vouchers' },
    { name: 'Luxury items', icon: Gem, desc: 'High-end brands & designer items' },
    { name: 'Practical gifts', icon: Wrench, desc: 'Useful everyday tools & essentials' },
    { name: 'Personalized gifts', icon: Sparkles, desc: 'Engraved, custom printed or monogrammed' },
    { name: 'Subscription gifts', icon: Repeat, desc: 'Coffee, book, or snack monthly boxes' },
  ];

  const toggleGiftType = (type: string) => {
    const current = data.gift_types || [];
    if (current.includes(type)) {
      onChange({ ...data, gift_types: current.filter((t) => t !== type) });
    } else {
      onChange({ ...data, gift_types: [...current, type] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          Gift Format Preferences & Restrictions
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Specify preferred gift styles and strict dislikes or allergies.
        </p>
      </div>

      {/* Preferred Gift Formats */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
          Preferred Gift Formats (Select All That Apply)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {giftTypes.map((gt) => {
            const Icon = gt.icon;
            const isSelected = (data.gift_types || []).includes(gt.name);
            return (
              <button
                key={gt.name}
                type="button"
                onClick={() => toggleGiftType(gt.name)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start space-x-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40 shadow-sm scale-[1.01]'
                    : 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{gt.name}</h4>
                    {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{gt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dislikes & Restrictions Area */}
      <div className="pt-2 max-w-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
          Dislikes, Restrictions & Allergies (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="e.g. No alcohol, allergic to nuts, hates plastic items, dislikes clothing/shoes..."
          value={data.dislikes_and_restrictions || ''}
          onChange={(e) => onChange({ ...data, dislikes_and_restrictions: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />
      </div>
    </div>
  );
}
