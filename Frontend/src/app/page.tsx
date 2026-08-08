'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { Hero } from '@/components/landing/Hero';
import { TrustSection } from '@/components/landing/TrustSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQSection } from '@/components/landing/FAQSection';
import { NewsletterForm } from '@/components/landing/NewsletterForm';
import { CTASection } from '@/components/landing/CTASection';

export default function Home() {
  return (
    <PageLayout>
      <div className="space-y-0">
        {/* Hero Section */}
        <Hero />

        {/* Trust & Key Statistics Section */}
        <TrustSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Product Showcase Section */}
        <ShowcaseSection />

        {/* Testimonials Section */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQSection />

        {/* Newsletter Signup UI */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <NewsletterForm />
          </div>
        </section>

        {/* Final CTA Section */}
        <CTASection />
      </div>
    </PageLayout>
  );
}
