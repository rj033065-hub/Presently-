'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Merge, RefreshCw, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiClient } from '@/lib/api-client';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [sourceTagId, setSourceTagId] = useState('');
  const [targetTagId, setTargetTagId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/tags');
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleMergeTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTagId || !targetTagId || sourceTagId === targetTagId) return;
    setActionLoading(true);
    try {
      await apiClient.post('/admin/tags/merge', {
        source_tag_id: sourceTagId,
        target_tag_id: targetTagId,
      });
      setShowMergeModal(false);
      fetchTags();
    } catch (err) {
      console.error('Failed to merge tags', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Tag Management & De-duplication</h1>
            <p className="text-xs text-zinc-400 mt-1">Monitor tag usage metrics and merge duplicate or legacy catalog tags.</p>
          </div>
          <button
            onClick={() => {
              if (tags.length >= 2) {
                setSourceTagId(tags[0].id);
                setTargetTagId(tags[1].id);
                setShowMergeModal(true);
              }
            }}
            className="inline-flex items-center space-x-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors shadow-sm"
          >
            <Merge className="h-4 w-4" />
            <span>Merge Duplicate Tags</span>
          </button>
        </div>

        {/* Tags Grid */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : tags.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No tags found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {tags.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Tags className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{t.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {t.usage_count} uses
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Merge Duplicate Tags</h3>
              <button onClick={() => setShowMergeModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleMergeTags} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Source Tag (Will be Deleted):</label>
                <select
                  value={sourceTagId}
                  onChange={(e) => setSourceTagId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                >
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.usage_count} uses)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Target Tag (Will Receive All Relations):</label>
                <select
                  value={targetTagId}
                  onChange={(e) => setTargetTagId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                >
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.usage_count} uses)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || sourceTagId === targetTagId}
                  className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Merging...' : 'Merge Tags'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
