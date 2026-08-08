'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CommentItem as CommentType } from '@/types/community';
import { getComments, createComment } from '@/lib/community-api';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialCommentsCount?: number;
}

export function CommentSection({ postId, initialCommentsCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(initialCommentsCount);

  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(
    async (targetPage: number = 1, append: boolean = false) => {
      try {
        if (!append) setLoading(true);
        const res = await getComments(postId, targetPage, 10);
        if (append) {
          setComments((prev) => [...prev, ...res.items]);
        } else {
          setComments(res.items);
        }
        setTotalPages(res.pages);
        setTotalComments(res.total);
        setPage(res.page);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    loadComments(1, false);
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const content = newCommentText.trim();
    setNewCommentText('');

    try {
      setSubmitting(true);
      const created = await createComment(postId, content);
      // Optimistic addition to list
      setComments((prev) => [created, ...prev]);
      setTotalComments((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadComments(page + 1, true);
    }
  };

  return (
    <div id="comments-section" className="space-y-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-lg">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h2>Community Discussion ({totalComments})</h2>
        </div>
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs focus-within:border-indigo-500 transition-colors">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your unboxing thoughts, advice, or questions about this gift story..."
            className="w-full p-4 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 bg-transparent focus:outline-none resize-none min-h-[90px]"
          />
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400">Be respectful and helpful</span>
            <Button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 gap-1.5 shadow-sm shadow-indigo-500/20"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Comment</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-8 flex justify-center text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No comments yet</p>
          <p className="text-[11px] text-zinc-400 mt-1">Be the first to share your thoughts on this gift experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentUpdated={() => loadComments(1, false)}
            />
          ))}

          {/* Pagination Load More */}
          {page < totalPages && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                className="rounded-full text-xs px-6 border-zinc-200 dark:border-zinc-800"
              >
                Load More Comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
