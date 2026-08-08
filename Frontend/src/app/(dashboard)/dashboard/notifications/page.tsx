'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Gift, Calendar, Sparkles, MessageSquare, Info, Trash2, CheckCircle, Circle, Check, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api-client';

function formatDistanceToNow(dateInput: Date | string, options?: { addSuffix?: boolean }) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  let result = '';
  if (diffSec < 60) result = 'just now';
  else if (diffMin < 60) result = `${diffMin}m`;
  else if (diffHours < 24) result = `${diffHours}h`;
  else result = `${diffDays}d`;

  return options?.addSuffix && result !== 'just now' ? `${result} ago` : result;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  link_url?: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchNotifications = async (pageNum = 1, shouldAppend = false) => {
    setLoading(true);
    try {
      const limit = 10;
      const offset = (pageNum - 1) * limit;
      
      const res = await apiClient.get('/notifications', {
        params: {
          limit,
          offset,
          is_read: filter === 'all' ? undefined : filter === 'read'
        }
      });

      const fetchedList: NotificationItem[] = res.data;
      if (fetchedList.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (shouldAppend) {
        setNotifications((prev) => [...prev, ...fetchedList]);
      } else {
        setNotifications(fetchedList);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filter changes
  useEffect(() => {
    setPage(1);
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [filter]);

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleMarkAsRead = async (id: string, isCurrentlyRead: boolean) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !isCurrentlyRead } : n))
    );
    setUnreadCount((prev) => (isCurrentlyRead ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (isCurrentlyRead) {
        await apiClient.post(`/notifications/${id}/unread`);
      } else {
        await apiClient.post(`/notifications/${id}/read`);
      }
    } catch (err) {
      console.error('Failed to update notification read status', err);
    }
  };

  const handleDeleteNotification = async (id: string, isUnread: boolean) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (isUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await apiClient.post('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'gift_plan_reminder':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Gift className="h-5 w-5" />
          </div>
        );
      case 'occasion_reminder':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Calendar className="h-5 w-5" />
          </div>
        );
      case 'recommendation_ready':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
        );
      case 'community_notification':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400">
            <Info className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="Notification Center"
      subtitle="Stay up to date with occasion reminders, planning steps, and recommendations."
      actionButton={
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Mark all read</span>
            </button>
          )}
          <Link
            href="/dashboard/settings/notifications"
            className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters bar */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4.5 py-3 text-sm font-semibold border-b-2 transition-colors capitalize ${
                filter === tab
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab} {tab === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 mb-4">
                <Bell className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">No notifications found</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1">
                {filter === 'unread'
                  ? "You don't have any unread notifications. All caught up!"
                  : filter === 'read'
                  ? "You haven't read any notifications yet."
                  : "You're all caught up! Check back later for gift planner reminders and recommendations."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-850 dark:bg-zinc-900 transition-all hover:shadow relative overflow-hidden group ${
                    !item.is_read ? 'border-l-4 border-l-indigo-600 dark:border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4 min-w-0 flex-1">
                    {getNotificationIcon(item.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h2 className={`text-sm font-bold truncate ${
                          !item.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {item.title}
                        </h2>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        !item.is_read ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-450'
                      }`}>
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center justify-end gap-3 mt-4 sm:mt-0 sm:ml-6 pl-14 sm:pl-0">
                    {item.link_url && (
                      <Link
                        href={item.link_url}
                        className="inline-flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-750 px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Action
                      </Link>
                    )}
                    <button
                      onClick={() => handleMarkAsRead(item.id, item.is_read)}
                      className={`p-2 rounded-xl border transition-colors ${
                        item.is_read
                          ? 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                          : 'border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50 dark:border-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-400'
                      }`}
                      title={item.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {item.is_read ? <Circle className="h-4.5 w-4.5" /> : <CheckCircle className="h-4.5 w-4.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(item.id, !item.is_read)}
                      className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loader */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && notifications.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Load more notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
