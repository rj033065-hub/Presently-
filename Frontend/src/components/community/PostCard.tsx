'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CommunityPost } from '@/types/community';
import { CategoryChip } from './CategoryChip';
import { TagChip } from './TagChip';
import { BookmarkButton } from './BookmarkButton';
import { ReactionBar } from './ReactionBar';
import { ReportModal } from './ReportModal';
import { Clock, Eye, User as UserIcon, Flag } from 'lucide-react';

interface PostCardProps {
  post: CommunityPost;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const primaryCategory = post.categories?.[0];
  const tags = post.tags?.slice(0, 2) || [];
  const authorName = post.author?.username || 'Community Giver';

  const defaultCoverGradient =
    'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-rose-500/20';

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="group relative flex flex-col h-full rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 overflow-hidden"
      >
        {/* Cover Image Container */}
        <Link href={`/community/posts/${post.slug || post.id}`} className="relative block h-48 sm:h-52 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className={`w-full h-full ${defaultCoverGradient} flex items-center justify-center p-6 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <span className="text-xl font-bold text-zinc-700 dark:text-zinc-300 opacity-80 group-hover:scale-105 transition-transform duration-300">
                🎁 Story
              </span>
            </div>
          )}

          {/* Category Chip Badge */}
          {primaryCategory && (
            <div className="absolute top-3 left-3 z-10">
              <CategoryChip category={primaryCategory} />
            </div>
          )}

          {/* Top Right Action Buttons (Bookmark & Report) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReportOpen(true);
              }}
              title="Report Story"
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/80 hover:text-rose-400 transition-colors border border-white/20"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
            <BookmarkButton postId={post.id} initialIsSaved={post.isSaved} />
          </div>
        </Link>

        {/* Content Body */}
        <div className="flex-1 flex flex-col justify-between p-5 space-y-4">
          <div className="space-y-2">
            <Link href={`/community/posts/${post.slug || post.id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug tracking-tight">
                {post.title}
              </h3>
            </Link>

            {post.excerpt && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Footer Metadata & Tags */}
          <div className="space-y-3 pt-2">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
              {/* Author Info */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[1px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {post.author?.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">
                  {authorName}
                </span>
              </div>

              {/* Reading Time */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>

            {/* Reaction Bar */}
            <ReactionBar
              postId={post.id}
              title={post.title}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              viewCount={post.viewCount}
              initialIsLiked={post.isLiked}
              initialIsSaved={post.isSaved}
            />
          </div>
        </div>
      </motion.article>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="post"
        targetId={post.id}
        targetTitle={post.title}
      />
    </>
  );
}
