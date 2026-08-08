'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { Scale, DollarSign, ShieldAlert, BookOpen } from 'lucide-react';

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          badge="TERMS OF SERVICE"
          title="Terms & Conditions"
          description="Last updated: August 7, 2026. Legal terms governing your use of Presently."
        />

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <Scale className="h-5 w-5 text-indigo-500 mr-2" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Presently website, mobile apps, or AI recommendation services, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access the service.
            </p>
          </section>

          <section id="affiliate" className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
              2. Affiliate Disclaimer & Transparency Disclosure
            </h2>
            <p className="text-xs sm:text-sm">
              Presently participates in affiliate marketing programs with trusted retail partners. This means we may earn a small referral commission if you click through and purchase an item recommended by our platform.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs font-semibold text-indigo-950 dark:text-indigo-200">
              <li>Affiliate links do <strong>NOT</strong> increase the price you pay. Retail prices remain identical.</li>
              <li>Our AI recommendation ranking algorithm is <strong>100% unbiased</strong> and does not prioritize products based on higher commission rates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <ShieldAlert className="h-5 w-5 text-amber-500 mr-2" />
              3. AI Recommendation Disclaimer
            </h2>
            <p>
              Presently uses generative artificial intelligence to suggest product matches. While we strive for extreme accuracy and high satisfaction, product availability, third-party pricing, and shipping times are controlled by independent merchants and are subject to change.
            </p>
          </section>

          <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 text-purple-500 mr-2" />
              4. Intellectual Property
            </h2>
            <p className="text-xs text-zinc-500">
              All website content, branding, UI designs, graphics, code, and proprietary prompt engines are the intellectual property of Presently AI Inc.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
