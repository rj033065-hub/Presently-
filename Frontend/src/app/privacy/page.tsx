'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          badge="LEGAL & TRANSPARENCY"
          title="Privacy Policy"
          description="Last updated: August 7, 2026. How Presently collects, protects, and handles your data."
        />

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <ShieldCheck className="h-5 w-5 text-indigo-500 mr-2" />
              1. Information We Collect
            </h2>
            <p>
              When you use Presently, we collect minimal data necessary to deliver hyper-personalized gift recommendations:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials managed securely via Clerk.</li>
              <li><strong>Recipient Survey Inputs:</strong> Age ranges, relationship context, hobby keywords, and price bounds provided during quiz flows.</li>
              <li><strong>Usage Telemetry:</strong> Anonymized interaction metrics to improve algorithm precision and page performance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <Lock className="h-5 w-5 text-purple-500 mr-2" />
              2. How We Use Your Data & AI Telemetry
            </h2>
            <p>
              Your survey data is processed by our Multi-LLM engine solely for generating ranked gift recommendations and explaining match rationales.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm">
              <li>We <strong>NEVER</strong> sell your recipient profiles or contact details to third-party ad brokers.</li>
              <li>LLM prompts are sanitized to prevent personal identifiable information (PII) leakage.</li>
              <li>Wishlist choices are encrypted in transit and at rest using AES-256 standards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <Eye className="h-5 w-5 text-rose-500 mr-2" />
              3. User Rights & Data Deletion
            </h2>
            <p>
              You maintain full ownership of your data. You may request account deletion, export your saved wishlists, or erase past recipient surveys at any time directly through your user settings page or by emailing <strong>privacy@presently.ai</strong>.
            </p>
          </section>

          <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 text-emerald-500 mr-2" />
              4. Contact Privacy Officer
            </h2>
            <p className="text-xs text-zinc-500">
              For any questions regarding GDPR, CCPA, or data security compliance, please write to: Data Privacy Officer, Presently AI Inc., 548 Market Street, Suite 900, San Francisco, CA 94104.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
