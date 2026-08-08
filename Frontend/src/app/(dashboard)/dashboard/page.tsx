'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Sparkles,
  ClipboardList,
  Heart,
  Users,
  CalendarCheck,
  ArrowRight,
  Clock,
  ExternalLink,
  Plus,
  Gift,
  CheckCircle2,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import {
  getDashboardOverview,
  DashboardOverview,
  UserActivity
} from '@/lib/dashboard-api';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const overview = await getDashboardOverview();
        setData(overview);
      } catch (err: any) {
        console.error('Failed to load dashboard overview:', err);
        setError('Failed to load dashboard overview data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) {
      loadDashboard();
    }
  }, [isLoaded]);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const userName = user?.firstName || data?.user_name || 'Gifter';
  const userAvatar = user?.imageUrl || data?.user_avatar || '/avatar-placeholder.png';

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const metrics = data?.metrics || {
    total_wishlists: 0,
    saved_gifts: 0,
    saved_recommendations: 0,
    upcoming_occasions: 0,
    community_posts: 0,
    completed_surveys: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={userAvatar}
                alt={userName}
                className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shadow-inner"
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentDateStr}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                  Welcome back, {userName}! 👋
                </h1>
                <p className="text-sm text-zinc-300 mt-1">
                  Ready to discover thoughtful gifts for your special people?
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/survey">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                  <Sparkles className="w-4 h-4" />
                  <span>Find a Gift</span>
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>View Wishlist</span>
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Browse Community</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Overview Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/wishlist" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Wishlists</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.total_wishlists}</p>
            </Card>
          </Link>

          <Link href="/wishlist" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Saved Gifts</span>
                <Gift className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.saved_gifts}</p>
            </Card>
          </Link>

          <Link href="/dashboard/recommendations" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">AI Ideas</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.saved_recommendations}</p>
            </Card>
          </Link>

          <Link href="/dashboard/planner" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Occasions</span>
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.upcoming_occasions}</p>
            </Card>
          </Link>

          <Link href="/dashboard/saved" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Saved Posts</span>
                <Bookmark className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.community_posts}</p>
            </Card>
          </Link>

          <Link href="/dashboard/surveys" className="block group">
            <Card className="p-4 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Surveys</span>
                <ClipboardList className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{metrics.completed_surveys}</p>
            </Card>
          </Link>
        </section>

        {/* Continue Where You Left Off (Active Draft Surveys) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Continue Where You Left Off</span>
            </h2>
            <Link href="/dashboard/surveys" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all surveys
            </Link>
          </div>

          {data?.unfinished_surveys && data.unfinished_surveys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.unfinished_surveys.map((survey) => (
                <Card key={survey.id} className="p-5 flex flex-col justify-between border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                      <span>Draft Survey</span>
                      <span>Step {survey.current_step} of 12</span>
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                      {survey.recipient_name ? `Gift for ${survey.recipient_name}` : 'Gift Recommendation'}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Occasion: {survey.occasion}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mt-4 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${survey.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Saved {new Date(survey.updated_at).toLocaleDateString()}
                    </span>
                    <Link href={`/survey?resumeId=${survey.id}`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <span>Resume</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center border-dashed border-zinc-300 dark:border-zinc-800">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No unfinished survey drafts</p>
              <p className="text-xs text-zinc-500 mt-1">Start a 2-minute survey to generate tailored AI gift recommendations.</p>
              <Link href="/survey" className="inline-block mt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
                  Start New Survey
                </Button>
              </Link>
            </Card>
          )}
        </section>

        {/* Recommended For You & Upcoming Occasions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recommended For You */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Recommended For You</span>
              </h2>
              <Link href="/dashboard/recommendations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View history
              </Link>
            </div>

            {data?.recommended_for_you && data.recommended_for_you.length > 0 ? (
              <div className="space-y-3">
                {data.recommended_for_you.map((item) => (
                  <Card key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.gift_image_url ? (
                        <img src={item.gift_image_url} alt={item.gift_title} className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                          🎁
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                            {item.match_score}% Match
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">${item.estimated_price}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-1">{item.gift_title}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.ai_reasoning}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link href={`/recommendations/${item.recommendation_id}`}>
                        <Button variant="outline" className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <span>View</span>
                        </Button>
                      </Link>
                      {item.buy_url && (
                        <a href={item.buy_url} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <span>Buy</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center border-dashed border-zinc-300 dark:border-zinc-800">
                <Gift className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No saved AI recommendations yet</p>
                <p className="text-xs text-zinc-500 mt-1">Complete your first survey to get personalized recommendations.</p>
              </Card>
            )}
          </section>

          {/* Upcoming Occasions */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-500" />
                <span>Upcoming Occasions</span>
              </h2>
              <Link href="/dashboard/planner" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Planner
              </Link>
            </div>

            {data?.upcoming_occasions && data.upcoming_occasions.length > 0 ? (
              <div className="space-y-3">
                {data.upcoming_occasions.map((plan) => (
                  <Card key={plan.id} className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{plan.days_remaining} Days Left</span>
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-medium text-zinc-600 capitalize">
                          {plan.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {plan.recipient_name}'s {plan.occasion}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {new Date(plan.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Budget: ${plan.planned_budget}
                      </p>
                    </div>

                    <Link href="/dashboard/planner">
                      <Button variant="outline" className="text-xs px-2.5 py-1.5 rounded-lg">
                        Plan
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center border-dashed border-zinc-300 dark:border-zinc-800">
                <CalendarCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No upcoming events planned</p>
                <p className="text-xs text-zinc-500 mt-1">Add birthdays, anniversaries, or holidays to track budgets.</p>
                <Link href="/dashboard/planner" className="inline-block mt-3">
                  <Button variant="outline" className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Plan</span>
                  </Button>
                </Link>
              </Card>
            )}

            {/* Recent Activity Timeline */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recent Activity Log</h3>
              {data?.recent_activities && data.recent_activities.length > 0 ? (
                <div className="space-y-2">
                  {data.recent_activities.map((act) => (
                    <div key={act.id} className="text-xs p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{act.title}</p>
                        <p className="text-[10px] text-zinc-400">{new Date(act.created_at).toLocaleString()}</p>
                      </div>
                      {act.target_url && (
                        <Link href={act.target_url}>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 hover:text-indigo-600" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No recent activity recorded.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
