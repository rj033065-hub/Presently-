'use client';

import React from 'react';
import { Gift, Smile, Clock, Star, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { SectionTitle } from './SectionTitle';

export function TrustSection() {
  const stats = [
    {
      icon: Gift,
      value: '50,000+',
      label: 'Gifts Recommended',
      description: 'Accurately matched across 120+ occasions, relationships, and taste parameters.',
    },
    {
      icon: Smile,
      value: '99.4%',
      label: 'Recipient Delight',
      description: 'Based on post-unboxing feedback and recipient satisfaction surveys.',
    },
    {
      icon: Clock,
      value: '< 2 Mins',
      label: 'Average Survey Time',
      description: 'Dynamic questionnaire adapts instantly to your answers to eliminate fatigue.',
    },
    {
      icon: Star,
      value: '4.9 / 5.0',
      label: 'Verified Community Rating',
      description: 'Thousands of community gift givers rating unboxing success and AI match fidelity.',
    },
  ];

  return (
    <section className="relative py-16 lg:py-24 bg-zinc-100/50 dark:bg-zinc-900/40 border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="TRUST & INTELLIGENCE"
          title="Powered by Deep AI Reasoning &"
          highlight="Real Sentiment Data."
          description="We combine cutting-edge Large Language Models with authentic community unboxing reviews to deliver recommendations that genuinely hit the mark."
        />

        {/* Stats Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <StatsCard key={stat.label} index={idx} {...stat} />
          ))}
        </div>

        {/* AI & Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Cpu className="h-4 w-4 text-indigo-500" />
            <span>Multi-LLM Engine (GPT-4o & Claude 3.5 Sonnet)</span>
          </div>

          <div className="inline-flex items-center space-x-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
            <Sparkles className="h-4 w-4 text-rose-500" />
            <span>Psychometric Recipient Profiling</span>
          </div>

          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Unbiased & Transparent Recommendations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
