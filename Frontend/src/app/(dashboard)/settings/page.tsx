'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout } from '@/components/ui/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { settingsUpdateSchema, SettingsUpdateInput } from '@/lib/validations';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SettingsUpdateInput>({
    resolver: zodResolver(settingsUpdateSchema),
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response: any = await apiClient.get('/users/settings');
        if (response) {
          setValue('emailNotifications', response.email_notifications);
          setValue('marketingEmails', response.marketing_emails);
          setValue('privacyLevel', response.privacy_level || 'public');
        }
      } catch (err: any) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [setValue]);

  const onSubmit = async (data: SettingsUpdateInput) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await apiClient.put('/users/settings', {
        email_notifications: data.emailNotifications,
        marketing_emails: data.marketingEmails,
        privacy_level: data.privacyLevel,
      });
      setSuccessMessage('Settings saved successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings.');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage notifications, email preferences, and privacy controls.</p>

        <Card className="mt-6">
          {successMessage && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Notifications</h2>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  {...register('emailNotifications')}
                />
                <span className="text-sm font-medium">Occasion & Birthday Reminders (Email)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  {...register('marketingEmails')}
                />
                <span className="text-sm font-medium">Product Updates & Gifting Tips</span>
              </label>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Privacy Settings</h2>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Profile & Wishlist Privacy</label>
                <select
                  className="mt-1 flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register('privacyLevel')}
                >
                  <option value="public">Public (Visible to community)</option>
                  <option value="private">Private (Only visible to you)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
