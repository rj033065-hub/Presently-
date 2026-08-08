'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MessageSquare, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { apiClient } from '@/lib/api-client';

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/community');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch community posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleHidePost = async (postId: string, isCurrentlyPublished: boolean) => {
    try {
      if (isCurrentlyPublished) {
        await apiClient.post(`/admin/community/posts/${postId}/hide`);
      } else {
        await apiClient.post(`/admin/community/posts/${postId}/restore`);
      }
      fetchPosts();
    } catch (err) {
      console.error('Failed to toggle post visibility', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Community Platform Moderation</h1>
            <p className="text-xs text-zinc-400 mt-1">Review user community posts, hide inappropriate content, and log moderation actions.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No community posts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Post Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Engagement</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {posts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white max-w-sm truncate">{p.title}</td>
                      <td className="p-4 text-zinc-400">{p.author}</td>
                      <td className="p-4 text-zinc-400">
                        {p.likes_count} Likes &bull; {p.comments_count} Comments
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.is_published ? 'Published' : 'Hidden'} type="post_status" />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleHidePost(p.id, p.is_published)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold ${
                            p.is_published
                              ? 'border-zinc-800 bg-zinc-950 text-amber-400 hover:bg-amber-950/40'
                              : 'border-zinc-800 bg-zinc-950 text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                          title={p.is_published ? 'Hide Post' : 'Restore Post'}
                        >
                          {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
    </AdminLayout>
  );
}
