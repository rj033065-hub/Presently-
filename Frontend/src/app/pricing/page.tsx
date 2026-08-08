'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Hobbyist',
      badge: 'Always Free',
      description: 'Perfect for individuals looking for thoughtful gifts for family and friends.',
      monthlyPrice: '$0',
      annualPrice: '$0',
      period: 'forever free',
      highlighted: false,
      ctaText: 'Start Free Survey',
      ctaLink: '/survey',
      features: [
        '3 AI Gift Recommendations per survey',
        'Dynamic 2-minute Recipient Survey',
        'Standard Psychometric Matching',
        'Save up to 10 Gifts in Wishlists',
        'Access to Public Community Reviews',
      ],
    },
    {
      name: 'Pro Curator',
      badge: 'Most Popular',
      description: 'Ideal for frequent gift givers who want unlimited AI queries and occasion reminders.',
      monthlyPrice: '$9',
      annualPrice: '$7',
      period: 'per month, billed annually',
      highlighted: true,
      ctaText: 'Get Started with Pro',
      ctaLink: '/register',
      features: [
        'Unlimited AI Gift Recommendations',
        'Deep Multi-LLM Reasoning Engine',
        'Explainable Match Rationales',
        'Unlimited Wishlists & Shared Links',
        'Automated Occasion & Birthday Alerts',
        'Exportable PDF Gift Briefs',
        'Priority Customer Support',
      ],
    },
    {
      name: 'Premier Concierge',
      badge: 'Corporate & Teams',
      description: 'For corporate teams, executive assistants, and event planners matching bulk gifts.',
      monthlyPrice: '$29',
      annualPrice: '$24',
      period: 'per month, billed annually',
      highlighted: false,
      ctaText: 'Contact Concierge Team',
      ctaLink: '/contact',
      features: [
        'Everything in Pro Curator',
        'Bulk Recipient Survey Uploads (CSV)',
        'Custom Corporate Branding on Links',
        'Dedicated Human Concierge Reviewer',
        'SLA & Enterprise Privacy Guarantees',
      ],
    },
  ];

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-16">
        {/* Page Header */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <SectionTitle
            badge="TRANSPARENT PRICING"
            title="Simple Plans for Every"
            highlight="Gifting Need."
            description="Start completely free. Upgrade anytime to unlock unlimited AI queries, occasion tracking, and collaborative wishlists."
          />

          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              type="button"
              className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center space-x-1.5">
              <span className={`text-sm font-semibold ${isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                Annual Billing
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Save 20%
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col justify-between rounded-3xl p-8 shadow-sm transition-all duration-300 ${
                    plan.highlighted
                      ? 'border-2 border-indigo-500 bg-white dark:bg-zinc-900 shadow-2xl scale-[1.03] z-10'
                      : 'border border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/80'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-rose-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {plan.badge}
                      </span>
                      <h3 className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white font-sans">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[36px]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-zinc-900 dark:text-white font-sans">
                        {displayPrice}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        / {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-6 text-xs text-zinc-600 dark:text-zinc-300">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link href={plan.ctaLink} className="w-full">
                      <Button
                        size="lg"
                        className={`w-full font-semibold rounded-xl ${
                          plan.highlighted
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                            : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
                        }`}
                      >
                        {plan.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Guarantee */}
        <section className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 flex items-center space-x-4">
            <ShieldCheck className="h-8 w-8 text-emerald-500 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                30-Day Happiness Guarantee
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cancel your Pro plan anytime within 30 days for a full refund—no questions asked.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
