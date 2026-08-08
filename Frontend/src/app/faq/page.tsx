'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { Search, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'ai', label: 'AI Engine' },
    { id: 'privacy', label: 'Privacy & Data' },
    { id: 'pricing', label: 'Pricing & Wishlists' },
  ];

  const allFaqs = [
    {
      id: '1',
      category: 'ai',
      question: 'How does Presently generate gift recommendations?',
      answer:
        'Presently uses state-of-the-art Large Language Models (GPT-4o and Claude 3.5 Sonnet) combined with customized psychometric prompt chains. We analyze recipient relationship dynamics, occasion sentiment, age, interest keywords, and budget constraints to generate ranked gifts complete with step-by-step match explanations.',
    },
    {
      id: '2',
      category: 'ai',
      question: 'How long does the recipient survey take?',
      answer:
        'Our dynamic survey takes less than 2 minutes to complete. Questions adjust adaptively based on your previous answers to prevent fatigue while capturing deep taste signals.',
    },
    {
      id: '3',
      category: 'ai',
      question: 'What if I don’t know all the details about my recipient?',
      answer:
        'That is completely fine! You can skip optional questions. Our AI recommendation algorithm works effectively even with minimal signals like relationship type and general budget range.',
    },
    {
      id: '4',
      category: 'privacy',
      question: 'Is recipient data stored securely and privately?',
      answer:
        'Absolutely. All recipient survey responses and personal wishlists are protected using industry-standard AES-256 encryption. We never sell your personal data or survey responses to third-party ad networks.',
    },
    {
      id: '5',
      category: 'privacy',
      question: 'Are recommendations biased by retailer commissions?',
      answer:
        'No. Presently enforces zero affiliate markup bias. Our ranking algorithm prioritizes genuine match score and recipient delight above all else. We match across thousands of independent artisans and trusted retailers transparently.',
    },
    {
      id: '6',
      category: 'pricing',
      question: 'Is Presently free to use?',
      answer:
        'Yes! You can run recipient surveys, receive AI match recommendations, and save wishlists for free. We also offer Pro Curator plans for frequent gift givers and corporate concierges with advanced features like occasion tracking and automated reminders.',
    },
    {
      id: '7',
      category: 'pricing',
      question: 'How do wishlists work and can I share them?',
      answer:
        'Wishlists allow you to organize gift recommendations into custom collections. You can generate private or public share links so family members or co-workers can collaborate and claim items for group gifting.',
    },
    {
      id: '8',
      category: 'pricing',
      question: 'What is your refund policy for Pro plans?',
      answer:
        'We offer a 30-day money-back guarantee for Pro Curator and Premier Concierge subscriptions. If you are not satisfied, contact support within 30 days for a full refund.',
    },
  ];

  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-12">
        {/* Page Header */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <SectionTitle
            badge="KNOWLEDGE BASE"
            title="Frequently Asked"
            highlight="Questions."
            description="Find detailed information about our AI recommendation engine, data privacy controls, and wishlist features."
          />

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search questions (e.g. privacy, survey time, AI match)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <FAQAccordion key={faq.id} {...faq} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <HelpCircle className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white">
                No matching questions found
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Try adjusting your search query or category filter.
              </p>
            </div>
          )}
        </section>

        {/* Need More Help Box */}
        <section className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-8 dark:border-indigo-900/60 dark:bg-indigo-950/40 space-y-3">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Still have questions?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Our support team is available 24/7 to help you with survey customization and account questions.
            </p>
            <div className="pt-2">
              <Link href="/contact">
                <button
                  type="button"
                  className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Customer Support</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
