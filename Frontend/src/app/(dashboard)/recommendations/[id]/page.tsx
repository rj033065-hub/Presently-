'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/ui/layout';
import { AIRecommendationRecord } from '@/types/recommendation';
import {
  getRecommendationById,
  toggleFavorite,
  regenerateRecommendation,
  shareRecommendation,
} from '@/lib/recommendation-api';

import { AIThinkingAnimation } from '@/components/recommendation/AIThinkingAnimation';
import { RecommendationCard } from '@/components/recommendation/RecommendationCard';
import { CategoryFilterBar } from '@/components/recommendation/CategoryFilterBar';
import { ShareModal } from '@/components/recommendation/ShareModal';

import {
  Sparkles,
  Heart,
  Share2,
  RefreshCw,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function RecommendationDetailPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [recommendation, setRecommendation] = useState<AIRecommendationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const rec = await getRecommendationById(id, token);
      setRecommendation(rec);
      setIsFavorite(rec.is_favorite || false);
      if (rec.share_token) {
        setShareUrl(`http://localhost:3000/share/${rec.share_token}`);
      }
    } catch (err) {
      console.error('Failed to load recommendation details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]);

  const handleToggleFavorite = async () => {
    try {
      const token = await getToken();
      const updated = await toggleFavorite(id, token);
      setIsFavorite(updated.is_favorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const token = await getToken();
      const updated = await regenerateRecommendation(id, token);
      setRecommendation(updated);
    } catch (err) {
      console.error('Failed to regenerate recommendations:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenShare = async () => {
    try {
      if (!shareUrl) {
        const token = await getToken();
        const res = await shareRecommendation(id, token);
        setShareUrl(res.share_url);
      }
      setShareModalOpen(true);
    } catch (err) {
      console.error('Failed to generate share URL:', err);
    }
  };

  if (loading || isRegenerating) {
    return (
      <PageLayout>
        <div className="py-16 sm:py-24">
          <AIThinkingAnimation />
        </div>
      </PageLayout>
    );
  }

  if (!recommendation) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Recommendation Results Not Found
          </h3>
          <Button onClick={() => router.push('/survey')} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Survey Engine
          </Button>
        </div>
      </PageLayout>
    );
  }

  const items = recommendation.items || [];
  const summary = recommendation.summary?.recipient_summary;
  const followUps = recommendation.summary?.suggested_follow_up_questions || [];

  // Filter items
  const filteredItems =
    selectedFilter === 'All'
      ? items
      : items.filter((i) => i.strategy_label === selectedFilter);

  // Compute counts
  const counts: Record<string, number> = { All: items.length };
  items.forEach((i) => {
    counts[i.strategy_label] = (counts[i.strategy_label] || 0) + 1;
  });

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                onClick={() => router.push('/survey')}
                type="button"
                className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors mb-1"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Survey Engine
              </button>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
                Gift Recommendations for {recommendation.recipient_name || 'Recipient'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center space-x-2">
                <span>Occasion: <strong>{recommendation.occasion || 'Special Event'}</strong></span>
                <span>•</span>
                <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                  <Cpu className="h-3.5 w-3.5 mr-1" /> {recommendation.ai_model_used}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" /> {recommendation.execution_time_ms}ms
                </span>
              </p>
            </div>

            {/* Action Bar Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              <Button
                onClick={handleToggleFavorite}
                variant="secondary"
                size="sm"
                className={`rounded-xl border-zinc-200 dark:border-zinc-800 ${
                  isFavorite ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-900' : ''
                }`}
                type="button"
              >
                <Heart className={`mr-1.5 h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </Button>

              <Button
                onClick={handleOpenShare}
                variant="secondary"
                size="sm"
                className="rounded-xl border-zinc-200 dark:border-zinc-800"
                type="button"
              >
                <Share2 className="mr-1.5 h-4 w-4" />
                <span>Share</span>
              </Button>

              <Button
                onClick={handleRegenerate}
                variant="secondary"
                size="sm"
                className="rounded-xl border-zinc-200 dark:border-zinc-800"
                type="button"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                <span>Regenerate</span>
              </Button>

              <Button
                onClick={() => window.print()}
                variant="secondary"
                size="sm"
                className="rounded-xl border-zinc-200 dark:border-zinc-800 hidden sm:inline-flex"
                type="button"
              >
                <Printer className="mr-1.5 h-4 w-4" />
                <span>Print / PDF</span>
              </Button>
            </div>
          </div>

          {/* AI Recipient Psychometrics Summary Banner */}
          {summary && (
            <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-rose-50/90 p-6 shadow-sm dark:border-indigo-900/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    AI Recipient Psychometric Strategy
                  </h3>
                </div>

                {summary.confidence_score && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                    {summary.confidence_score}% Match Confidence
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {summary.gifting_angle}
              </p>

              {summary.key_traits && summary.key_traits.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-zinc-500 mr-1">Key Traits:</span>
                  {summary.key_traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Strategy & Category Filter Bar */}
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

          {/* Follow Up Questions Section */}
          {followUps.length > 0 && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Suggested Follow-Up Questions to Refine Choice:
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {followUps.map((q, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-indigo-500 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </PageLayout>
  );
}
