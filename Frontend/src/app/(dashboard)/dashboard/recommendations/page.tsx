'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  ExternalLink,
  Share2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';

export default function SavedRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/recommendations');
      setRecommendations(res || []);
    } catch (err) {
      console.error('Failed to fetch recommendations history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const res: any = await apiClient.post(`/recommendations/${id}/favorite`, {});
      setRecommendations(recommendations.map((r) => (r.id === id ? { ...r, is_favorite: res.is_favorite } : r)));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this recommendation from your history?')) return;
    try {
      await apiClient.delete(`/recommendations/${id}`);
      setRecommendations(recommendations.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const text = `${rec.recipient_name || ''} ${rec.occasion || ''} ${rec.ai_model_used || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="AI Recommendation History"
      subtitle="Browse and manage all previous AI gift runs generated for your friends and family."
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by recipient or occasion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Recommendations List */}
        {filteredRecommendations.length > 0 ? (
          <div className="space-y-6">
            {filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        {rec.occasion || 'Gift Survey'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {rec.recipient_name ? `For ${rec.recipient_name}` : 'Gift Recommendations'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(rec.id)}
                      className={`p-2 rounded-xl border transition-all ${
                        rec.is_favorite
                          ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${rec.is_favorite ? 'fill-rose-600' : ''}`} />
                    </button>
                    <Link href={`/recommendations/${rec.id}`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-xl">
                        View Full Results
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Gift Items Grid preview */}
                {rec.items && rec.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rec.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            🎁
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold text-emerald-600">{item.match_score}% Match</span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</h4>
                          <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">${item.estimated_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-zinc-300 dark:border-zinc-800">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No AI recommendations found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Take our 2-minute survey to generate tailored gift recommendations using AI.</p>
            <Link href="/survey" className="inline-block mt-4">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
                Start AI Survey
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
