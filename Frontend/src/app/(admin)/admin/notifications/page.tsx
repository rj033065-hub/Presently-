'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { apiClient } from '@/lib/api-client';

export default function AdminNotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifLogs() {
      try {
        const res = await apiClient.get('/admin/notifications');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch notification logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Notification System Telemetry</h1>
            <p className="text-xs text-zinc-400 mt-1">Monitor background reminder execution logs and email delivery metrics.</p>
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
                title="Reminder Executions"
                value={data?.total_reminder_executions || 0}
                icon={Bell}
                subtitle="Occasions & Tasks matched"
                colorTheme="indigo"
              />
              <StatCard
                title="Dispatched Notifications"
                value={data?.total_notifications_dispatched || 0}
                icon={CheckCircle}
                subtitle="In-app alerts created"
                colorTheme="emerald"
              />
              <StatCard
                title="Email Delivery Rate"
                value={data?.email_delivery_success_rate || '100%'}
                icon={Mail}
                subtitle="SMTP log status"
                colorTheme="amber"
              />
              <StatCard
                title="Failed Executions"
                value={data?.failed_executions_count || 0}
                icon={Bell}
                subtitle="Requires retry"
                colorTheme="rose"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
