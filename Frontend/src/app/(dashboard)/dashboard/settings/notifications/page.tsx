'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, AppWindow, Calendar, Gift, Users, Sparkles, Megaphone, ArrowLeft, Save, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function NotificationSettingsPage() {
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [occasionReminders, setOccasionReminders] = useState(true);
  const [giftPlanReminders, setGiftPlanReminders] = useState(true);
  const [communityNotifications, setCommunityNotifications] = useState(true);
  const [recommendationNotifications, setRecommendationNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [frequency, setFrequency] = useState('immediate');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch current preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/notifications/preferences');
        const data = res.data;
        setInAppEnabled(data.in_app_enabled);
        setEmailEnabled(data.email_enabled);
        setOccasionReminders(data.occasion_reminders);
        setGiftPlanReminders(data.gift_plan_reminders);
        setCommunityNotifications(data.community_notifications);
        setRecommendationNotifications(data.recommendation_notifications);
        setMarketingNotifications(data.marketing_notifications);
        setFrequency(data.frequency);
      } catch (err) {
        console.error('Failed to load notification preferences', err);
        setError('Failed to load notification preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    const payload = {
      in_app_enabled: inAppEnabled,
      email_enabled: emailEnabled,
      occasion_reminders: occasionReminders,
      gift_plan_reminders: giftPlanReminders,
      community_notifications: communityNotifications,
      recommendation_notifications: recommendationNotifications,
      marketing_notifications: marketingNotifications,
      frequency,
    };

    try {
      await apiClient.put('/notifications/preferences', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences', err);
      setError('Failed to save preferences. Please check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Notification Settings"
      subtitle="Customize how and when you receive reminders, updates, and announcements."
    >
      <div className="max-w-3xl space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Notification Center</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
              <p className="text-sm text-zinc-500">Loading your preferences...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Status alerts */}
            {success && (
              <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 text-sm font-semibold shadow-sm transition-all">
                <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                <span>Notification preferences saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 text-sm font-semibold shadow-sm">
                {error}
              </div>
            )}

            {/* Channels Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900 space-y-5">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Notification Channels</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Choose where you want to receive notifications.</p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* In-app toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <AppWindow className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="in-app-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        In-App Notifications
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Show a notification badge in the header navigation menu while using the app.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="in-app-toggle"
                    onClick={() => setInAppEnabled(!inAppEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      inAppEnabled ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        inAppEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Email toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="email-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        Email Notifications
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Send notifications and summaries directly to your registered email address.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="email-toggle"
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailEnabled ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        emailEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900 space-y-5">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Notification Categories</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Choose which types of alerts you want to subscribe to.</p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Occasion reminders toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="occasions-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        Upcoming Occasion Reminders
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Get alerts when your custom occasions or friend birthdays are coming up.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="occasions-toggle"
                    onClick={() => setOccasionReminders(!occasionReminders)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      occasionReminders ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        occasionReminders ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Gift planner reminders toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="tasks-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        Gift Planner Task Reminders
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Get step-based planning reminders (e.g. choose gift, wrap gift, prepare delivery).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="tasks-toggle"
                    onClick={() => setGiftPlanReminders(!giftPlanReminders)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      giftPlanReminders ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        giftPlanReminders ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Recommendation notifications toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="recs-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        AI Recommendation Notifications
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Get notified when your customized AI recommendation boards are processed and ready.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="recs-toggle"
                    onClick={() => setRecommendationNotifications(!recommendationNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      recommendationNotifications ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        recommendationNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Community notifications toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="community-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        Community Platform Activity
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Get notified when someone interacts with your posts, replies, or leaves feedback.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="community-toggle"
                    onClick={() => setCommunityNotifications(!communityNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      communityNotifications ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        communityNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing notifications toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start space-x-3.5 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <label htmlFor="marketing-toggle" className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                        Product Announcements & Promos
                      </label>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                        Receive updates on new catalog releases, trending gift articles, and special promotional offers.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="marketing-toggle"
                    onClick={() => setMarketingNotifications(!marketingNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      marketingNotifications ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        marketingNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Frequency Select Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900 space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Email Digest Frequency</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Choose how often we summarize and deliver notification digests.</p>
              </div>

              <div className="max-w-md">
                <label htmlFor="frequency-select" className="sr-only">Select frequency</label>
                <select
                  id="frequency-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none"
                >
                  <option value="immediate">Immediate (Default)</option>
                  <option value="daily_digest">Daily Digest</option>
                  <option value="weekly_digest">Weekly Digest</option>
                  <option value="disabled">Disable All Emails</option>
                </select>
              </div>
            </div>

            {/* Actions Form Footer */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Link
                href="/dashboard/notifications"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <>
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
