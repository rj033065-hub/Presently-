'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { FAQAccordion } from './FAQAccordion';

export function FAQSection() {
  const faqs = [
    {
      id: 'ai-accuracy',
      question: 'How does Presently generate gift recommendations?',
      answer:
        'Presently utilizes advanced Large Language Models (such as GPT-4o and Claude 3.5 Sonnet) combined with custom psychometric prompt chains. We analyze recipient relationship dynamics, occasion sentiment, age, interest keywords, and budget constraints to generate ranked gifts complete with step-by-step match explanations.',
      defaultOpen: true,
    },
    {
      id: 'survey-time',
      question: 'How long does the recipient survey take?',
      answer:
        'Our dynamic survey takes less than 2 minutes to complete. Questions adjust adaptively based on your previous answers to prevent fatigue while capturing deep taste signals.',
    },
    {
      id: 'affiliate-bias',
      question: 'Are recommendations biased by retailer commissions?',
      answer:
        'No. Presently enforces zero affiliate markup bias. Our ranking algorithm prioritizes genuine match score and recipient delight above all else. We match across thousands of independent artisans and trusted retailers transparently.',
    },
    {
      id: 'privacy',
      question: 'Is recipient data stored securely and privately?',
      answer:
        'Absolutely. All recipient survey responses and personal wishlists are protected using industry-standard AES-256 encryption. We never sell your personal data or survey responses to third-party ad networks.',
    },
    {
      id: 'pricing-cost',
      question: 'Is Presently free to use?',
      answer:
        'Yes! You can run recipient surveys, receive AI match recommendations, and save wishlists for free. We also offer Pro Curator plans for frequent gift givers and corporate concierges with advanced features like occasion tracking and automated reminders.',
    },
    {
      id: 'community-reviews',
      question: 'How do community unboxing reviews work?',
      answer:
        'Community members can upload unboxing photos, rate gift match accuracy, and share real recipient reaction stories. All reviews undergo automated and human moderation to ensure authentic social proof.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="FREQUENTLY ASKED QUESTIONS"
          title="Got Questions? We’ve Got"
          highlight="Answers."
          description="Everything you need to know about our AI gift matcher, data privacy, and community guidelines."
        />

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <FAQAccordion key={faq.id} {...faq} />
          ))}
        </div>

        {/* View All FAQ CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Have more questions? View our full FAQ Knowledge Base</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
