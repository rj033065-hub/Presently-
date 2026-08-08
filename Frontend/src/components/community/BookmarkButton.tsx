'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { savePost, unsavePost } from '@/lib/community-api';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  postId: string;
  initialIsSaved?: boolean;
  onToggleSaved?: (isSaved: boolean) => void;
  variant?: 'icon' | 'badge';
}

export function BookmarkButton({
  postId,
  initialIsSaved = false,
  onToggleSaved,
  variant = 'icon',
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isSaved;
    const nextState = !isSaved;

    // Optimistic UI Update
    setIsSaved(nextState);
    if (onToggleSaved) onToggleSaved(nextState);

    try {
      setLoading(true);
      if (nextState) {
        await savePost(postId);
      } else {
        await unsavePost(postId);
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
      // Revert on error
      setIsSaved(previousState);
      if (onToggleSaved) onToggleSaved(previousState);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
          isSaved
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-amber-500'
        )}
      >
        <Bookmark className={cn('w-4 h-4', isSaved && 'fill-amber-500 text-amber-500')} />
        <span>{isSaved ? 'Bookmarked' : 'Save Story'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'p-2 rounded-xl transition-all cursor-pointer',
        isSaved
          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-500'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-amber-500'
      )}
      title={isSaved ? 'Remove bookmark' : 'Bookmark story'}
    >
      <Bookmark className={cn('w-4 h-4', isSaved && 'fill-amber-500 text-amber-500')} />
    </button>
  );
}
