'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getPostBySlugOrId } from '@/lib/community-api';
import { CommunityPost } from '@/types/community';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { CategoryChip } from '@/components/community/CategoryChip';
import { TagChip } from '@/components/community/TagChip';
import { AuthorCard } from '@/components/community/AuthorCard';
import { ShareButton } from '@/components/community/ShareButton';
import { ReactionBar } from '@/components/community/ReactionBar';
import { CommentSection } from '@/components/community/CommentSection';
import { LoadingSkeleton } from '@/components/community/LoadingSkeleton';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft, Clock, Eye, Calendar, Sparkles, Image as ImageIcon, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPostBySlugOrId(id);
        setPost(data);
      } catch (err: any) {
        console.error('Failed to load post detail:', err);
        setError('Community post not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPost();
    }
  }, [id]);

  const scrollToComments = () => {
    const el = document.getElementById('comments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 space-y-8">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Community Feed</span>
            </Link>

            <div className="flex items-center gap-2">
              {post && (
                <Link href={`/community/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-zinc-200 dark:border-zinc-800">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Story</span>
                  </Button>
                </Link>
              )}
              {post && <ShareButton title={post.title} />}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton type="detail" />
          ) : error || !post ? (
            <div className="p-12 text-center space-y-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Story Not Found</h2>
              <p className="text-sm text-zinc-500">{error || 'This post may have been archived or removed.'}</p>
              <Link href="/community">
                <Button variant="outline" className="mt-2">
                  Return to Feed
                </Button>
              </Link>
            </div>
          ) : (
            <article className="space-y-8 bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg shadow-zinc-200/30 dark:shadow-none">
              {/* Category & Tags Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {post.categories?.map((cat) => (
                    <CategoryChip key={cat.id} name={cat.name} slug={cat.slug} />
                  ))}
                  {post.tags?.map((tag) => (
                    <TagChip key={tag.id} name={tag.name} slug={tag.slug} />
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                )}

                {/* Author Card & Meta Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <AuthorCard author={post.author} createdDate={post.createdAt} className="border-none p-0 bg-transparent shadow-none" />

                  <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readingTime} min read</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.viewCount} views</span>
                    </span>
                  </div>
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
                onCommentClick={scrollToComments}
              />

              {/* Main Cover Image */}
              {post.coverImageUrl && (
                <div className="relative w-full max-h-[480px] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Main Story Content Body */}
              <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
                {post.content}
              </div>

              {/* Additional Post Images Gallery */}
              {post.images && post.images.length > 0 && (
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <h3>Unboxing Gallery</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 h-64 group"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.altText || 'Unboxing gallery photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {img.altText && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-2 text-xs text-white">
                            {img.altText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-purple-950/30 p-6 rounded-2xl">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-base">Inspired by this gift story?</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Use Presently AI to match gifts tailored to your recipient&apos;s taste.</p>
                </div>
                <Link href="/survey">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Find Similar Gifts</span>
                  </Button>
                </Link>
              </div>

              {/* Comment Section */}
              <CommentSection postId={post.id} initialCommentsCount={post.commentsCount} />
            </article>
          )}
        </main>
      </div>
    </PageLayout>
  );
}
