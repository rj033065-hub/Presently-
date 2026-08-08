'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/nextjs';
import { User, Mail, Calendar, Edit3, ShieldCheck, DollarSign, Palette } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { profileUpdateSchema, ProfileUpdateInput } from '@/lib/validations';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response: any = await apiClient.get('/users/profile');
        if (response) {
          setProfileData(response);
          setValue('fullName', response.full_name || clerkUser?.fullName || '');
          setValue('avatarUrl', response.avatar_url || clerkUser?.imageUrl || '');
          setValue('bio', response.bio || '');
          setValue('preferredCurrency', response.preferred_currency || 'USD');
          setValue('themePreference', response.theme_preference || 'system');
        }
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [setValue, clerkUser]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated: any = await apiClient.put('/users/profile', {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        bio: data.bio,
        preferred_currency: data.preferredCurrency,
        theme_preference: data.themePreference,
      });
      setProfileData(updated);
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const avatar = profileData?.avatar_url || clerkUser?.imageUrl || '/avatar-placeholder.png';
  const fullName = profileData?.full_name || clerkUser?.fullName || 'Gifter';
  const username = profileData?.username || clerkUser?.username || clerkUser?.firstName?.toLowerCase() || 'gifter';
  const email = clerkUser?.primaryEmailAddress?.emailAddress || profileData?.email || 'user@example.com';
  const memberSince = clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString() : 'August 2026';

  return (
    <DashboardLayout
      title="User Profile & Settings"
      subtitle="Manage your identity, bio, display preferences, and account metadata."
      actionButton={
        <Button
          onClick={() => setEditing(!editing)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={avatar}
              alt={fullName}
              className="w-24 h-24 rounded-full border-4 border-indigo-500/20 object-cover shadow-md"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{fullName}</h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">@{username}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-center sm:self-auto">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Account</span>
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                {profileData?.bio || 'No bio added yet. Add a short bio to let gifters know your style.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Member since {memberSince}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {errorMessage}
          </div>
        )}

        {/* Profile Edit Form */}
        {editing && (
          <Card className="p-6 border-indigo-200/80 dark:border-indigo-900/50">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Edit Profile Information</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <Input placeholder="Alex Mercer" {...register('fullName')} />
                {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Avatar Image URL (Cloudinary)</label>
                <Input placeholder="https://res.cloudinary.com/..." {...register('avatarUrl')} />
                {errors.avatarUrl && <p className="mt-1 text-xs text-rose-500">{errors.avatarUrl.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="Share a bit about your gift style..."
                  {...register('bio')}
                />
                {errors.bio && <p className="mt-1 text-xs text-rose-500">{errors.bio.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Preferred Currency</label>
                  <select
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    {...register('preferredCurrency')}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Theme Preference</label>
                  <select
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    {...register('themePreference')}
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
