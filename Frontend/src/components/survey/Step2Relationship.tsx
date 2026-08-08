'use client';

import React from 'react';
import { RelationshipType } from '@/types/survey';
import { Heart, User, Users, Briefcase, GraduationCap, HelpCircle } from 'lucide-react';

interface Step2RelationshipProps {
  selected: RelationshipType;
  customRelationship?: string;
  onChange: (relationship: RelationshipType, custom?: string) => void;
}

export function Step2Relationship({ selected, customRelationship = '', onChange }: Step2RelationshipProps) {
  const relationships: { type: RelationshipType; label: string; icon: any; category: string }[] = [
    { type: 'Girlfriend', label: 'Girlfriend', icon: Heart, category: 'Partner' },
    { type: 'Boyfriend', label: 'Boyfriend', icon: Heart, category: 'Partner' },
    { type: 'Wife', label: 'Wife', icon: Heart, category: 'Partner' },
    { type: 'Husband', label: 'Husband', icon: Heart, category: 'Partner' },
    { type: 'Friend', label: 'Friend', icon: Users, category: 'Personal' },
    { type: 'Mother', label: 'Mother', icon: User, category: 'Family' },
    { type: 'Father', label: 'Father', icon: User, category: 'Family' },
    { type: 'Sister', label: 'Sister', icon: User, category: 'Family' },
    { type: 'Brother', label: 'Brother', icon: User, category: 'Family' },
    { type: 'Child', label: 'Child / Teen', icon: User, category: 'Family' },
    { type: 'Colleague', label: 'Colleague', icon: Briefcase, category: 'Work' },
    { type: 'Boss', label: 'Boss / Manager', icon: Briefcase, category: 'Work' },
    { type: 'Teacher', label: 'Teacher / Mentor', icon: GraduationCap, category: 'Work' },
    { type: 'Other', label: 'Other Relation', icon: HelpCircle, category: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          What is your relationship to the recipient?
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          This helps the AI tune recommendation tone, sentiment, and appropriateness.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {relationships.map((rel) => {
          const Icon = rel.icon;
          const isSelected = selected === rel.type;
          return (
            <button
              key={rel.type}
              type="button"
              onClick={() => onChange(rel.type, customRelationship)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 shadow-md scale-[1.02]'
                  : 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`p-3 rounded-xl mb-2.5 transition-transform ${isSelected ? 'bg-indigo-600 text-white scale-110' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                {rel.label}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                {rel.category}
              </span>
            </button>
          );
        })}
      </div>

      {selected === 'Other' && (
        <div className="pt-2 max-w-md">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
            Specify Custom Relationship
          </label>
          <input
            type="text"
            placeholder="e.g. In-law, Neighbor, Client"
            value={customRelationship}
            onChange={(e) => onChange('Other', e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
