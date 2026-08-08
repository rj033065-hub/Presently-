'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { ShieldCheck, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CommunityOverviewPage() {
  const stories = [
    {
      quote:
        'The AI suggested a custom leather-bound journal with archival ink pens. My daughter literally cried opening it for her graduation.',
      author: 'Rebecca Miller',
      role: 'Gifted for College Graduation',
      relationTag: 'Daughter',
      initials: 'RM',
      rating: 5,
    },
    {
      quote:
        'I needed a non-cliché corporate gift for our lead architect. The artisanal brass desk compass was a huge hit.',
      author: 'Marcus Brody',
      role: 'Executive Assistant',
      relationTag: 'Colleague',
      initials: 'MB',
      rating: 5,
    },
    {
      quote:
        'Matched my husband’s obscure passion for specialty pour-over coffees. He uses the ceramic kettle every single morning.',
      author: 'Hannah Zhao',
      role: '5th Anniversary Gift',
      relationTag: 'Husband',
      initials: 'HZ',
      rating: 5,
    },
  ];

  const categories = [
    { name: '☕ Specialty Coffee & Teas', count: '1,420 Stories', growth: '+24% Gifting Rate' },
    { name: '📚 Modern Fiction & Rare Editions', count: '980 Stories', growth: '+18% Gifting Rate' },
    { name: '🎨 Artisan Crafts & Ceramics', count: '850 Stories', growth: '+32% Gifting Rate' },
    { name: '🌿 Minimalist Home & Decor', count: '1,150 Stories', growth: '+15% Gifting Rate' },
    { name: '🎵 Vintage Audio & Record Care', count: '640 Stories', growth: '+40% Gifting Rate' },
    { name: '🧘 Wellness & Aromatherapy', count: '920 Stories', growth: '+12% Gifting Rate' },
  ];

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-20">
        {/* Header Hero */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <SectionTitle
            badge="COMMUNITY HUB"
            title="Real Unboxing Stories & Verified"
            highlight="Gifting Wisdom."
            description="Discover how real gift givers use Presently AI to create unforgettable moments. Browse community ratings, photo reviews, and unboxing reaction stories."
          />

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/community">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-full px-8 shadow-lg shadow-indigo-500/20">
                <Users className="w-5 h-5 mr-2" />
                <span>Explore Live Community Feed</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Unboxing Stories */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Trending Unboxing Stories
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Verified gift givers sharing real recipient reaction ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <TestimonialCard key={story.author} index={idx} {...story} />
            ))}
          </div>
        </section>

        {/* Popular Gift Categories */}
        <section className="bg-zinc-100/60 dark:bg-zinc-900/40 py-16 border-y border-zinc-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                Most Popular Community Categories
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Explore recipient taste themes loved by our community.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">{cat.name}</h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{cat.count}</span>
                  </div>
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {cat.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Guidelines & Trust */}
        <section className="mx-auto max-w-4xl px-4 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Authentic & Moderated Community
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Every unboxing story and review is verified to maintain high social proof standards. We enforce strict anti-spam guidelines to keep the community inspiring and helpful.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
