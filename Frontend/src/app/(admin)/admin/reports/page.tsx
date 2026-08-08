'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { apiClient } from '@/lib/api-client';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/reports', {
        params: { status_filter: filter || undefined },
      });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleResolveReport = async (action: 'actioned' | 'dismissed') => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/reports/${selectedReport.id}/resolve`, {
        action,
        moderation_note: moderationNote,
      });
      setSelectedReport(null);
      setModerationNote('');
      fetchReports();
    } catch (err) {
      console.error('Failed to resolve report', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Report Management & Moderation Queue</h1>
            <p className="text-xs text-zinc-400 mt-1">Review flagged community items, harassment reports, and spam complaints.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                filter === '' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                filter === 'pending' ? 'bg-amber-600 text-white border-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('actioned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                filter === 'actioned' ? 'bg-rose-600 text-white border-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Actioned
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No reports found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Reporter</th>
                    <th className="p-4">Target Type</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{r.reporter_name}</td>
                      <td className="p-4 text-zinc-400 capitalize">{r.target_type}</td>
                      <td className="p-4 text-zinc-300">{r.reason}</td>
                      <td className="p-4">
                        <StatusBadge status={r.status} type="report_status" />
                      </td>
                      <td className="p-4 text-zinc-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-indigo-400 hover:bg-indigo-950/40"
                        >
                          Review Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Review Moderation Report</span>
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-semibold">Reported Reason:</span>
                  <span className="font-bold text-rose-400">{selectedReport.reason}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed pt-1">{selectedReport.details || 'No additional details provided.'}</p>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Moderation Audit Note:</label>
                <textarea
                  rows={2}
                  placeholder="Reason for decision..."
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleResolveReport('dismissed')}
                  disabled={actionLoading}
                  className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 font-bold text-zinc-400 hover:bg-zinc-800"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Dismiss Report</span>
                </button>
                <button
                  onClick={() => handleResolveReport('actioned')}
                  disabled={actionLoading}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-500"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Take Action (Resolve)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
