'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Sparkles,
  Gift,
  MessageSquare,
  Bookmark,
  Calendar,
  Bell,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { DateRangeSelector } from '@/components/admin/analytics/DateRangeSelector';
import { AnalyticsAreaChart } from '@/components/admin/analytics/AnalyticsAreaChart';
import { AnalyticsFunnelChart } from '@/components/admin/analytics/AnalyticsFunnelChart';
import { ExportButton } from '@/components/admin/analytics/ExportButton';
import { apiClient } from '@/lib/api-client';

export default function AdminAnalyticsPage() {
  const [rangeKey, setRangeKey] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [overviewData, setOverviewData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [surveysData, setSurveysData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [giftsData, setGiftsData] = useState<any>(null);
  const [communityData, setCommunityData] = useState<any>(null);
  const [wishlistsData, setWishlistsData] = useState<any>(null);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [notifData, setNotifData] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await apiClient.get('/admin/analytics/overview', { params: { range_key: rangeKey } });
        setOverviewData(res.data);
      } else if (activeTab === 'users') {
        const res = await apiClient.get('/admin/analytics/users', { params: { range_key: rangeKey } });
        setUsersData(res.data);
      } else if (activeTab === 'surveys') {
        const res = await apiClient.get('/admin/analytics/surveys', { params: { range_key: rangeKey } });
        setSurveysData(res.data);
      } else if (activeTab === 'ai') {
        const res = await apiClient.get('/admin/analytics/ai', { params: { range_key: rangeKey } });
        setAiData(res.data);
      } else if (activeTab === 'gifts') {
        const res = await apiClient.get('/admin/analytics/gifts', { params: { range_key: rangeKey } });
        setGiftsData(res.data);
      } else if (activeTab === 'community') {
        const res = await apiClient.get('/admin/analytics/community', { params: { range_key: rangeKey } });
        setCommunityData(res.data);
      } else if (activeTab === 'wishlists') {
        const res = await apiClient.get('/admin/analytics/wishlists', { params: { range_key: rangeKey } });
        setWishlistsData(res.data);
      } else if (activeTab === 'planner') {
        const res = await apiClient.get('/admin/analytics/planner', { params: { range_key: rangeKey } });
        setPlannerData(res.data);
      } else if (activeTab === 'notifications') {
        const res = await apiClient.get('/admin/analytics/notifications', { params: { range_key: rangeKey } });
        setNotifData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, rangeKey]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & DAU', icon: Users },
    { id: 'surveys', label: 'Surveys & Funnel', icon: TrendingUp },
    { id: 'ai', label: 'AI Engine & Cost', icon: Sparkles },
    { id: 'gifts', label: 'Gift Catalog', icon: Gift },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'wishlists', label: 'Wishlists', icon: Bookmark },
    { id: 'planner', label: 'Gift Planner', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const dummyGrowthTimeline = [
    { label: 'Week 1', value: 120 },
    { label: 'Week 2', value: 190 },
    { label: 'Week 3', value: 310 },
    { label: 'Week 4', value: 450 },
    { label: 'Current', value: overviewData?.total_users || 580 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
              <span>Platform Analytics & AI Insights</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Real-time metrics, user growth, AI token costs, and conversion funnels.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <DateRangeSelector selectedRange={rangeKey} onChangeRange={setRangeKey} />
            <ExportButton categoryType={activeTab} rangeKey={rangeKey} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-zinc-800 overflow-x-auto pb-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Registered Users"
                    value={overviewData?.total_users || 0}
                    icon={Users}
                    subtitle={`+${overviewData?.new_users || 0} in selected range`}
                    colorTheme="indigo"
                  />
                  <StatCard
                    title="Surveys Processed"
                    value={overviewData?.total_surveys || 0}
                    icon={TrendingUp}
                    subtitle="Gift questionnaires"
                    colorTheme="emerald"
                  />
                  <StatCard
                    title="Est. OpenAI API Cost"
                    value={`$${overviewData?.estimated_ai_cost_usd || 0}`}
                    icon={DollarSign}
                    subtitle="Token consumption"
                    colorTheme="amber"
                  />
                  <StatCard
                    title="Wishlist Saves"
                    value={overviewData?.wishlist_items || 0}
                    icon={Bookmark}
                    subtitle="Items saved by users"
                    colorTheme="rose"
                  />
                </div>

                <AnalyticsAreaChart
                  title="User Base Growth Trajectory"
                  subtitle="Accumulated registered accounts over time"
                  data={dummyGrowthTimeline}
                  colorHex="#6366f1"
                />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Daily Active Users (DAU)" value={usersData?.dau || 0} icon={Users} colorTheme="indigo" />
                  <StatCard title="Weekly Active (WAU)" value={usersData?.wau || 0} icon={Users} colorTheme="emerald" />
                  <StatCard title="Monthly Active (MAU)" value={usersData?.mau || 0} icon={Users} colorTheme="amber" />
                  <StatCard title="User Retention Rate" value={`${usersData?.retention_rate_pct || 0}%`} icon={CheckCircle2} colorTheme="rose" />
                </div>
              </div>
            )}

            {activeTab === 'surveys' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard title="Surveys Started" value={surveysData?.total_surveys || 0} icon={TrendingUp} colorTheme="indigo" />
                  <StatCard title="Surveys Completed" value={surveysData?.completed_surveys || 0} icon={CheckCircle2} colorTheme="emerald" />
                  <StatCard title="Completion Rate" value={`${surveysData?.completion_rate_pct || 0}%`} icon={Clock} colorTheme="amber" />
                </div>

                {surveysData?.funnel && (
                  <AnalyticsFunnelChart title="Gift Survey Conversion Funnel" steps={surveysData.funnel} />
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total AI Requests" value={aiData?.total_requests || 0} icon={Sparkles} colorTheme="indigo" />
                  <StatCard title="Total Tokens Used" value={(aiData?.total_tokens || 0).toLocaleString()} icon={Sparkles} colorTheme="amber" />
                  <StatCard title="Avg Latency" value={`${aiData?.avg_latency_sec || 0}s`} icon={Clock} colorTheme="emerald" />
                  <StatCard title="Est. Token Cost" value={`$${aiData?.estimated_cost_usd || 0}`} icon={DollarSign} colorTheme="rose" />
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white">AI Model Breakdown</h3>
                  <div className="divide-y divide-zinc-800 text-xs">
                    {aiData?.model_breakdown?.map((m: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <span className="font-bold text-white font-mono">{m.model}</span>
                        <span className="text-zinc-400">
                          {m.requests} requests &bull; {m.tokens.toLocaleString()} tokens &bull; <span className="text-emerald-400 font-bold">${m.cost_usd}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gifts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard title="Catalog Size" value={giftsData?.total_gifts_in_catalog || 0} icon={Gift} colorTheme="indigo" />
                  <StatCard title="Catalog Wishlist Saves" value={giftsData?.total_wishlist_saves || 0} icon={Bookmark} colorTheme="emerald" />
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white">Most Saved Gifts in Catalog</h3>
                  <div className="divide-y divide-zinc-800 text-xs">
                    {giftsData?.top_saved_gifts?.map((item: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[11px] text-zinc-500">{item.brand} &bull; ${item.price}</p>
                        </div>
                        <span className="font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-3 py-1 rounded-xl">
                          {item.saves} saves
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Posts" value={communityData?.total_posts || 0} icon={MessageSquare} colorTheme="indigo" />
                <StatCard title="Total Comments" value={communityData?.total_comments || 0} icon={MessageSquare} colorTheme="emerald" />
                <StatCard title="Engagement Rate" value={`${communityData?.engagement_rate_pct || 0}%`} icon={TrendingUp} colorTheme="amber" />
              </div>
            )}

            {activeTab === 'wishlists' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Wishlists Created" value={wishlistsData?.total_wishlists || 0} icon={Bookmark} colorTheme="indigo" />
                <StatCard title="Items Added" value={wishlistsData?.total_wishlist_items || 0} icon={Gift} colorTheme="emerald" />
                <StatCard title="Avg Wishlist Size" value={wishlistsData?.avg_wishlist_size || 0} icon={Bookmark} colorTheme="amber" />
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Gift Plans Created" value={plannerData?.total_plans_created || 0} icon={Calendar} colorTheme="indigo" />
                <StatCard title="Plans Completed" value={plannerData?.completed_plans || 0} icon={CheckCircle2} colorTheme="emerald" />
                <StatCard title="Plan Completion Rate" value={`${plannerData?.completion_rate_pct || 0}%`} icon={TrendingUp} colorTheme="amber" />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Notifications Dispatched" value={notifData?.total_notifications || 0} icon={Bell} colorTheme="indigo" />
                <StatCard title="Read Rate" value={`${notifData?.read_rate_pct || 0}%`} icon={CheckCircle2} colorTheme="emerald" />
                <StatCard title="Email Success Rate" value={`${notifData?.email_success_rate_pct || 0}%`} icon={CheckCircle2} colorTheme="amber" />
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
