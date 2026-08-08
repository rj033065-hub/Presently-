'use client';

import React, { useState } from 'react';
import { CommentItem as CommentType } from '@/types/community';
import { createComment, updateComment, deleteComment } from '@/lib/community-api';
import { ReportModal } from './ReportModal';
import { Button } from '@/components/ui/button';

import {
  MessageSquare,
  Edit2,
  Trash2,
  CornerDownRight,
  Send,
  X,
  User as UserIcon,
  Flag,
} from 'lucide-react';

interface CommentItemProps {
  comment: CommentType;
  postId: string;
  onCommentUpdated?: () => void;
}

export function CommentItem({ comment, postId, onCommentUpdated }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const formattedDate = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      await createComment(postId, replyText.trim(), comment.id);
      setReplyText('');
      setIsReplying(false);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Failed to create reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;

    try {
      setSubmittingEdit(true);
      await updateComment(comment.id, editText.trim());
      setIsEditing(false);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setSubmittingDelete(true);
      await deleteComment(comment.id);
      if (onCommentUpdated) onCommentUpdated();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Comment Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
          {/* Author Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {comment.author?.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  comment.author?.username?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="font-bold text-xs text-zinc-900 dark:text-white">
                  {comment.author?.username || 'Giver'}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>{formattedDate}</span>
                  {comment.updatedAt && <span className="italic">(edited)</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs font-semibold flex items-center gap-1"
                title="Reply"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reply</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 transition-colors"
                title="Report comment"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit comment"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDelete}
                disabled={submittingDelete}
                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-zinc-500 hover:text-rose-600 transition-colors"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 pt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-7 text-[11px] px-2.5 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingEdit || !editText.trim()}
                  className="h-7 text-[11px] px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {comment.content}
            </p>
          )}

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleCreateReply} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Replying to ${comment.author?.username || 'user'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReplying(false)}
                className="h-9 px-2.5 rounded-xl text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingReply || !replyText.trim()}
                className="h-9 px-3 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </Button>
            </form>
          )}
        </div>

        {/* Nested Reply Threads */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-4 sm:pl-6 border-l-2 border-indigo-100 dark:border-zinc-800 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <CornerDownRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-3" />
                <div className="flex-1">
                  <CommentItem comment={reply} postId={postId} onCommentUpdated={onCommentUpdated} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="comment"
        targetId={comment.id}
      />
    </>
  );
}
