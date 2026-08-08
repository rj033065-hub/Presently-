'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/ui/layout';
import { AIRecommendationRecord } from '@/types/recommendation';
import { getUserRecommendations, deleteRecommendation } from '@/lib/recommendation-api';

import { Sparkles, Heart, ArrowRight, Trash2, Calendar, Gift, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function RecommendationHistoryPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [recommendations, setRecommendations] = useState<AIRecommendationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const token = await getToken();
        if (token) {
          const list = await getUserRecommendations(token);
          setRecommendations(list);
        }
      } catch (err) {
        console.error('Failed to load recommendation history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [getToken]);

  const handleDelete = async (recId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = await getToken();
      await deleteRecommendation(recId, token);
      setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
    }
  };

  const filtered = filterFavorite
    ? recommendations.filter((r) => r.is_favorite)
    : recommendations;

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>AI MATCH HISTORY</span>
              </div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
                Recommendation History
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                View, favorite, share, or re-open past AI gift matches.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setFilterFavorite(!filterFavorite)}
                variant="secondary"
                size="sm"
                className={`rounded-xl border-zinc-200 dark:border-zinc-800 ${
                  filterFavorite ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:border-rose-900' : ''
                }`}
                type="button"
              >
                <Heart className={`mr-1.5 h-4 w-4 ${filterFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{filterFavorite ? 'Showing Favorites' : 'Favorites Only'}</span>
              </Button>

              <Button
                onClick={() => router.push('/survey')}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5"
                type="button"
              >
                <span>New Survey</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Gift className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                No Recommendation Runs Found
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Complete a recipient survey in our Intelligent Survey Engine to generate personalized AI gift recommendations.
              </p>
              <Button
                onClick={() => router.push('/survey')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6"
              >
                Start Gift Survey
              </Button>
            </div>
          ) : (
            /* Recommendations History Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((rec) => {
                const dateStr = rec.created_at
                  ? new Date(rec.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recently';

                return (
                  <div
                    key={rec.id}
                    onClick={() => router.push(`/recommendations/${rec.id}`)}
                    className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center">
                          <Gift className="h-3.5 w-3.5 mr-1" />
                          {rec.occasion || 'Special Event'}
                        </span>
                        {rec.is_favorite && (
                          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        For {rec.recipient_name || 'Recipient'}
                      </h3>

                      <div className="flex items-center space-x-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3.5 w-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Cpu className="mr-1 h-3.5 w-3.5 text-indigo-500" />
                          {(rec.items || []).length} Matches
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center">
                        <span>View Results</span>
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>

                      <button
                        onClick={(e) => handleDelete(rec.id, e)}
                        type="button"
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors"
                        title="Delete Recommendation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
