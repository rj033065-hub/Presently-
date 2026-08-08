'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiClient } from '@/lib/api-client';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/activity');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Audit Activity Feed</h1>
            <p className="text-xs text-zinc-400 mt-1">Immutable security audit log of all privileged actions, role changes, and content moderation.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No activity logs recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 text-zinc-400 font-mono text-[11px]">
                        {l.created_at ? new Date(l.created_at).toLocaleString() : ''}
                      </td>
                      <td className="p-4 font-bold text-white">{l.admin_name}</td>
                      <td className="p-4 font-bold text-indigo-400">{l.action}</td>
                      <td className="p-4 text-zinc-400 font-mono text-[10px] max-w-xs truncate">
                        {JSON.stringify(l.payload || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
