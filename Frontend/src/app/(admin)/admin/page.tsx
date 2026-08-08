'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Gift,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Bookmark,
  Calendar,
  Bell,
  UserPlus,
  PlusCircle,
  FolderTree,
  Tags,
  CheckCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { apiClient } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiClient.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard overview', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
            <p className="text-xs text-zinc-400 mt-1">Platform monitoring, moderation telemetry, and health overview.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/gifts"
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Gift</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={data?.total_users || 0}
                icon={Users}
                subtitle={`${data?.active_users || 0} active users`}
                colorTheme="indigo"
              />
              <StatCard
                title="Gift Items"
                value={data?.total_gifts || 0}
                icon={Gift}
                subtitle="Verified catalog items"
                colorTheme="emerald"
              />
              <StatCard
                title="Published Posts"
                value={data?.published_posts || 0}
                icon={MessageSquare}
                subtitle="Community discussions"
                colorTheme="amber"
              />
              <StatCard
                title="Pending Reports"
                value={data?.pending_reports || 0}
                icon={ShieldAlert}
                subtitle="Requires moderation"
                colorTheme="rose"
              />
              <StatCard
                title="AI Recommendations"
                value={data?.ai_recommendations_count || 0}
                icon={Sparkles}
                subtitle="Surveys processed"
                colorTheme="indigo"
              />
              <StatCard
                title="Saved Wishlist Items"
                value={data?.saved_gifts_count || 0}
                icon={Bookmark}
                subtitle="User saved gifts"
                colorTheme="emerald"
              />
              <StatCard
                title="Upcoming Plans"
                value={data?.upcoming_gift_plans_count || 0}
                icon={Calendar}
                subtitle="Active planner events"
                colorTheme="amber"
              />
              <StatCard
                title="Unread Alerts"
                value={data?.unread_notifications_count || 0}
                icon={Bell}
                subtitle="System notifications"
                colorTheme="zinc"
              />
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/admin/users"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Manage Users & Roles</span>
                    </div>
                    <span className="text-zinc-500 group-hover:text-white">&rarr;</span>
                  </Link>

                  <Link
                    href="/admin/reports"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
                      <span>Review Moderation Reports</span>
                    </div>
                    <span className="text-zinc-500 group-hover:text-white">&rarr;</span>
                  </Link>

                  <Link
                    href="/admin/categories"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <FolderTree className="h-4.5 w-4.5 text-emerald-400" />
                      <span>Manage Gift Categories</span>
                    </div>
                    <span className="text-zinc-500 group-hover:text-white">&rarr;</span>
                  </Link>

                  <Link
                    href="/admin/tags"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-xs font-semibold text-zinc-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Tags className="h-4.5 w-4.5 text-amber-400" />
                      <span>Manage & Merge Tags</span>
                    </div>
                    <span className="text-zinc-500 group-hover:text-white">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Admin Activity</h3>
                  <Link href="/admin/activity" className="text-xs font-semibold text-indigo-400 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto">
                  {!data?.recent_activity || data.recent_activity.length === 0 ? (
                    <p className="py-8 text-center text-xs text-zinc-500">No recent activity recorded.</p>
                  ) : (
                    data.recent_activity.map((act: any) => (
                      <div key={act.id} className="py-3 flex items-start space-x-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-indigo-400 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-zinc-200">{act.action}</h4>
                            <span className="text-[10px] text-zinc-500">{act.created_at ? new Date(act.created_at).toLocaleString() : ''}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Executed by <span className="text-white font-semibold">{act.admin_name}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
