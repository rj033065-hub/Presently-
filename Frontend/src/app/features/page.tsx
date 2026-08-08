'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Check, X, Sparkles, Zap, ShieldCheck, Heart, Sliders, DollarSign, Calendar, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  const comparison = [
    { feature: 'Psychometric Recipient Profiling', presently: true, generic: false },
    { feature: 'Multi-LLM Reasoning (GPT-4o & Sonnet 3.5)', presently: true, generic: false },
    { feature: 'Explainable AI Match Rationales', presently: true, generic: false },
    { feature: 'Strict Budget Price Guardrails', presently: true, generic: false },
    { feature: 'Zero Affiliate Markup Bias', presently: true, generic: false },
    { feature: 'Verified Community Unboxing Reviews', presently: true, generic: false },
    { feature: 'Collaborative Group-Gifting Wishlists', presently: true, generic: false },
    { feature: 'Automated Occasion & Birthday Reminders', presently: true, generic: false },
  ];

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-20">
        {/* Header Hero */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle
            badge="PLATFORM CAPABILITIES"
            title="Engineered for Precision &"
            highlight="Unmatched Taste."
            description="Explore the full suite of AI matching features, dynamic survey profiling engines, and community tools built into Presently."
          />
        </section>

        {/* Feature Grid */}
        <FeaturesSection />

        {/* Feature Comparison Table */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              How Presently Compares
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Why AI-driven recipient profiling beats generic blog posts and affiliate lists.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase font-bold text-zinc-500">
                <tr>
                  <th className="p-4 sm:p-6">Feature / Capability</th>
                  <th className="p-4 sm:p-6 text-center text-indigo-600 dark:text-indigo-400">Presently AI</th>
                  <th className="p-4 sm:p-6 text-center text-zinc-400">Generic Gift Lists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {comparison.map((row) => (
                  <tr key={row.feature} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-4 sm:p-6 font-semibold text-zinc-900 dark:text-zinc-100">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      {row.presently ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <X className="h-5 w-5 text-zinc-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      {row.generic ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 mx-auto">
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center mx-auto max-w-3xl px-4">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Ready to test our features live?
          </h3>
          <div className="mt-6">
            <Link href="/survey">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700">
                Start Free Survey Now
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
