'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { Sparkles, Heart, ShieldCheck, Cpu, Target, Award, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Thoughtful & Empathetic',
      description: 'Gifting is deeply personal. Every interaction in Presently is designed to respect human relationships and emotional nuance.',
    },
    {
      icon: Cpu,
      title: 'Intelligent & Discerning',
      description: 'Our AI recommendations act like a high-taste concierge, filtering out generic clutter to find truly memorable gifts.',
    },
    {
      icon: Target,
      title: 'Minimalist & Craft-Focused',
      description: 'Inspired by Apple, Linear, and Vercel—we prioritize uncluttered typography, deliberate whitespace, and tactile visual polish.',
    },
    {
      icon: ShieldCheck,
      title: 'Trustworthy & Transparent',
      description: 'Zero affiliate markup bias, clear data privacy controls, and authentic community reviews build consumer confidence.',
    },
  ];

  const milestones = [
    { year: 'Q1 2024', title: 'Concept & Prototype', desc: 'Initial research into multi-LLM psychometric profiling for gift matching.' },
    { year: 'Q3 2024', title: 'Beta Launch', desc: 'Over 10,000 recipient surveys analyzed with a 98.2% match satisfaction rate.' },
    { year: 'Q1 2025', title: 'Community Engine', desc: 'Unboxing photo reviews, verified ratings, and collaborative wishlists integrated.' },
    { year: '2026+', title: 'Presently v2.0', desc: 'Full AI concierge platform with real-time occasion planning and zero-markup guarantees.' },
  ];

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-20">
        {/* Header Hero */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <SectionTitle
            badge="OUR MISSION"
            title="We Are Reimagining How People Express"
            highlight="Appreciation."
            description="Presently was founded on a simple premise: gift giving shouldn't feel like a high-stress guessing game. By pairing cutting-edge AI sentiment models with real human stories, we help people celebrate moments that matter."
          />
        </section>

        {/* Core Philosophy Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Our Core Principles
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              The four foundational pillars that guide product decisions at Presently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{v.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Ethics & Transparency Section */}
        <section id="ethics" className="bg-zinc-100/60 dark:bg-zinc-900/50 py-16 border-y border-zinc-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg flex-shrink-0">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  AI Ethics & Affiliate Transparency Statement
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  We hold our AI algorithms to strict ethical standards. Presently does NOT artificially boost product recommendations based on higher affiliate payout percentages. Every match score is calculated objectively based on recipient survey signals, budget guardrails, and real-world rating fidelity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Journey */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Our Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <div key={m.year} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                  {m.year}
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white pt-1">{m.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mx-auto max-w-3xl px-4">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Experience the Future of Gift Giving
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start a free 2-minute survey and receive personalized recommendations today.
          </p>
          <div className="mt-6">
            <Link href="/survey">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700">
                Find a Gift Now
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
