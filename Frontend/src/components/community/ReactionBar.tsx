'use client';

import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Eye } from 'lucide-react';
import { likePost, unlikePost } from '@/lib/community-api';
import { BookmarkButton } from './BookmarkButton';
import { ShareDialog } from './ShareDialog';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  postId: string;
  title: string;
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  initialIsLiked?: boolean;
  initialIsSaved?: boolean;
  onCommentClick?: () => void;
}

export function ReactionBar({
  postId,
  title,
  likesCount: initialLikesCount,
  commentsCount,
  viewCount,
  initialIsLiked = false,
  initialIsSaved = false,
  onCommentClick,
}: ReactionBarProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousLiked = isLiked;
    const previousCount = likesCount;

    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    // Optimistic UI Update
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      setLoading(true);
      if (nextLiked) {
        const res = await likePost(postId);
        setLikesCount(res.likesCount);
      } else {
        const res = await unlikePost(postId);
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xs">
        {/* Left Reactions: Like, Comment, Share */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={loading}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer group',
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
            )}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-transform group-hover:scale-110',
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
              )}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={onCommentClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Right Actions: View Counter & Bookmark Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-zinc-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{viewCount} views</span>
          </div>

          <BookmarkButton
            postId={postId}
            initialIsSaved={initialIsSaved}
            variant="icon"
          />
        </div>
      </div>

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postId={postId}
        title={title}
      />
    </>
  );
}
