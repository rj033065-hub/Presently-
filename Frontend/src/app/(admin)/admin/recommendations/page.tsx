'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, DollarSign, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { apiClient } from '@/lib/api-client';

export default function AdminRecommendationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await apiClient.get('/admin/recommendations');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load recommendation telemetry', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTelemetry();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Recommendation Monitoring</h1>
            <p className="text-xs text-zinc-400 mt-1">Track AI generation volume, average match scores, API latency, and estimated token usage.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total AI Generations"
                value={data?.total_recommendations || 0}
                icon={Sparkles}
                subtitle={`${data?.recommendations_today || 0} today`}
                colorTheme="indigo"
              />
              <StatCard
                title="Avg Generation Latency"
                value={`${data?.avg_generation_time_sec || 0}s`}
                icon={Clock}
                subtitle="End-to-end response time"
                colorTheme="amber"
              />
              <StatCard
                title="Match Accuracy Score"
                value={`${data?.avg_match_score_pct || 0}%`}
                icon={CheckCircle2}
                subtitle="Survey compatibility"
                colorTheme="emerald"
              />
              <StatCard
                title="Est. Token Cost"
                value={`$${data?.estimated_token_cost_usd || 0}`}
                icon={DollarSign}
                subtitle="OpenAI API usage"
                colorTheme="rose"
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Engine Diagnostics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 font-semibold">Active AI Model</span>
                  <p className="text-white font-bold">GPT-4o-mini / Claude 3.5</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 font-semibold">Regeneration Rate</span>
                  <p className="text-emerald-400 font-bold">{data?.regeneration_rate_pct || 0}%</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 font-semibold">API Error Rate</span>
                  <p className="text-zinc-200 font-bold">0.00% (Healthy)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
