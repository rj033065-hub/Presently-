'use client';

import React from 'react';
import { RecipientProfileData } from '@/types/survey';
import { User, Globe, MessageSquare } from 'lucide-react';

interface Step3RecipientProfileProps {
  data: RecipientProfileData;
  onChange: (updated: RecipientProfileData) => void;
}

export function Step3RecipientProfile({ data, onChange }: Step3RecipientProfileProps) {
  const genders = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
  const countries = [
    'United States',
    'India',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'Brazil',
    'Singapore',
    'United Arab Emirates',
    'Other',
  ];
  const languages = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Japanese', 'Other'];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          Recipient Demographics & Location
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Basic demographic details help filter age-appropriate and location-available products.
        </p>
      </div>

      <div className="space-y-5">
        {/* Name (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
            Recipient First Name or Nickname (Optional)
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="e.g. Sarah"
              value={data.name || ''}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>

        {/* Age Slider / Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Recipient Age *
            </label>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-lg">
              {data.age || 28} years old
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={data.age || 28}
            onChange={(e) => onChange({ ...data, age: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-800"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 pt-1 font-mono">
            <span>1 yr</span>
            <span>25 yrs</span>
            <span>50 yrs</span>
            <span>75 yrs</span>
            <span>100 yrs</span>
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
            Gender (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {genders.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...data, gender: g })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  data.gender === g
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Country & Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Country / Region *
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <select
                value={data.country || 'United States'}
                onChange={(e) => onChange({ ...data, country: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Preferred Language *
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <select
                value={data.language || 'English'}
                onChange={(e) => onChange({ ...data, language: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
