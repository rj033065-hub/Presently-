'use client';

import React from 'react';
import { Sparkles, Sliders, Users, Bookmark, DollarSign, Calendar } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Gift Recommendations',
      description: 'Deep LLM matching evaluates recipient hobbies, relationship tone, and sentiment to deliver ranked recommendations with explainable AI reasoning.',
      category: 'AI Engine',
      accentColor: 'indigo' as const,
    },
    {
      icon: Sliders,
      title: 'Personalized Surveys',
      description: 'Dynamic 2-minute recipient survey that adapts questions in real-time to avoid question fatigue and pinpoint exact taste preferences.',
      category: 'Profiling',
      accentColor: 'purple' as const,
    },
    {
      icon: Users,
      title: 'Community Gift Ideas',
      description: 'Discover real unboxing reviews, photo ratings, and community-verified recommendations shared by real gift givers around the world.',
      category: 'Social Proof',
      accentColor: 'rose' as const,
    },
    {
      icon: Bookmark,
      title: 'Smart Wishlists',
      description: 'Organize recommendations into curated wishlists, share private or public links, and collaborate with family and friends for group gifts.',
      category: 'Organization',
      accentColor: 'cyan' as const,
    },
    {
      icon: DollarSign,
      title: 'Budget Filters & Price Tracker',
      description: 'Set hard minimum and maximum price guardrails. Experience zero affiliate bias with unbiased matching across trusted retailers.',
      category: 'Value',
      accentColor: 'emerald' as const,
    },
    {
      icon: Calendar,
      title: 'Occasion Planning',
      description: 'Never miss an important date. Automated reminders for birthdays, anniversaries, corporate holidays, and special milestones.',
      category: 'Automation',
      accentColor: 'amber' as const,
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="EVERYTHING YOU NEED"
          title="Designed for Thoughtful"
          highlight="Gift Concierges."
          description="Everything from dynamic survey profiling to real-world community unboxing ratings—built to guarantee recipient delight."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} index={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
