'use client';

import React from 'react';
import { SectionTitle } from './SectionTitle';
import { TestimonialCard } from './TestimonialCard';

export function Testimonials() {
  const testimonials = [
    {
      quote:
        'I usually spend hours stressing over what to buy my wife for our anniversary. Presently matched her subtle tea & pottery hobbies in under 2 minutes. She cried tears of joy!',
      author: 'Marcus Vance',
      role: 'Verified Gift Giver',
      relationTag: 'Anniversary Gift',
      initials: 'MV',
      rating: 5,
    },
    {
      quote:
        'Finding corporate milestone gifts for a team of 40 people used to take a whole week. Presently gave us personalized budget-friendly ideas that everyone actually loved.',
      author: 'Elena Rostova',
      role: 'Head of People & Operations',
      relationTag: 'Corporate Team',
      initials: 'ER',
      rating: 5,
    },
    {
      quote:
        'The AI match explanations are brilliant. It doesn’t just show random items; it tells you WHY your brother will love a specific espresso tamper based on his routine.',
      author: 'David Chen',
      role: 'Community Member',
      relationTag: 'Brother’s Birthday',
      initials: 'DC',
      rating: 5,
    },
    {
      quote:
        'The wishlists and community unboxing reviews make it super easy to check whether a gift is actually high quality before spending your hard-earned money.',
      author: 'Sophia Martinez',
      role: 'Product Designer',
      relationTag: 'Best Friend',
      initials: 'SM',
      rating: 5,
    },
    {
      quote:
        'I had a strict $75 budget for a housewarming gift. The AI found a gorgeous hand-blown oil dispenser that looked like it cost $250. 10/10 platform!',
      author: 'Julian Thorne',
      role: 'Verified Purchaser',
      relationTag: 'Housewarming',
      initials: 'JT',
      rating: 5,
    },
    {
      quote:
        'No spam, zero hidden markups, and pure thoughtful recommendations. As a minimal aesthetic enthusiast, Presently is my absolute go-to for all holiday gifts.',
      author: 'Aria Montgomery',
      role: 'Verified User',
      relationTag: 'Holiday Gifting',
      initials: 'AM',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-zinc-100/50 dark:bg-zinc-900/40 border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="REAL STORIES"
          title="Loved by Thousands of"
          highlight="Gift Givers."
          description="Read how Presently helps people build deeper connections through thoughtful, highly tailored gifts."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={t.author} index={idx} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
