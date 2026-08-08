'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/ui/layout';
import { AIRecommendationRecord } from '@/types/recommendation';
import { getSharedRecommendation } from '@/lib/recommendation-api';

import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { CategoryFilterBar } from '@/components/recommendation/CategoryFilterBar';
import { Sparkles, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function SharedRecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [recommendation, setRecommendation] = useState<AIRecommendationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  useEffect(() => {
    async function loadShared() {
      try {
        setLoading(true);
        if (token) {
          const rec = await getSharedRecommendation(token);
          setRecommendation(rec);
        }
      } catch (err) {
        console.error('Failed to load shared recommendation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [token]);

  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-sm text-zinc-500">Loading shared AI gift recommendations...</p>
        </div>
      </PageLayout>
    );
  }

  if (!recommendation) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Shared Recommendation Link Invalid or Expired
          </h3>
          <Button onClick={() => router.push('/')} variant="secondary">
            Return to Presently Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  const items = recommendation.items || [];
  const summary = recommendation.summary?.recipient_summary;

  const filteredItems =
    selectedFilter === 'All'
      ? items
      : items.filter((i) => i.strategy_label === selectedFilter);

  const counts: Record<string, number> = { All: items.length };
  items.forEach((i) => {
    counts[i.strategy_label] = (counts[i.strategy_label] || 0) + 1;
  });

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Shared Header Banner */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Shared AI Recommendation</span>
              </span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Gift Matches for {recommendation.recipient_name || 'Recipient'}
              </h1>
              <p className="text-sm text-indigo-100">
                Curated for <strong>{recommendation.occasion || 'Special Event'}</strong> using Presently&apos;s AI Concierge Engine.
              </p>
            </div>

            <Button
              onClick={() => router.push('/survey')}
              className="bg-white text-indigo-700 hover:bg-zinc-100 font-extrabold rounded-xl px-6 py-3 shadow-lg"
            >
              <span>Create Your Own Survey</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Strategy Summary */}
          {summary && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                  <Gift className="h-4 w-4 text-indigo-500 mr-2" />
                  AI Matching Strategy Summary
                </h3>
                {summary.confidence_score && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                    {summary.confidence_score}% Confidence
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                {summary.gifting_angle}
              </p>
            </div>
          )}

          {/* Filter Bar */}
          <CategoryFilterBar
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            counts={counts}
          />

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item, idx) => (
              <RecommendationCard key={item.id || idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
