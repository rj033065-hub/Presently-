'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Collection } from '@/types/community';
import { getCollectionBySlugOrId } from '@/lib/community-api';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { PostCard } from '@/components/community/PostCard';
import { AuthorCard } from '@/components/community/AuthorCard';
import { LoadingSkeleton } from '@/components/community/LoadingSkeleton';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft, FolderHeart, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCollectionBySlugOrId(slug);
        setCollection(data);
      } catch (err: any) {
        console.error('Failed to load collection:', err);
        setError('Collection not found or access restricted.');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadCollection();
    }
  }, [slug]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          <Link
            href="/community/collections"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Collections</span>
          </Link>

          {loading ? (
            <LoadingSkeleton type="detail" />
          ) : error || !collection ? (
            <div className="p-12 text-center space-y-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Collection Unavailable</h2>
              <p className="text-sm text-zinc-500">{error || 'This collection could not be found.'}</p>
              <Link href="/community/collections">
                <Button variant="outline" className="mt-2">
                  View Collections
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Collection Header Banner */}
              <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-8 sm:p-10 shadow-lg space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                    {collection.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{collection.isPublic ? 'Public Collection' : 'Private Collection'}</span>
                  </span>

                  <span className="text-xs font-bold text-zinc-500">
                    {collection.posts?.length || 0} Stories Included
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {collection.title}
                  </h1>
                  {collection.description && (
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                      {collection.description}
                    </p>
                  )}
                </div>

                <AuthorCard author={collection.author} createdDate={collection.createdAt} className="border-none p-0 bg-transparent shadow-none" />
              </div>

              {/* Contained Posts Grid */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-indigo-500" />
                  <span>Stories in this Collection</span>
                </h2>

                {collection.posts && collection.posts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 text-zinc-500">
                    No stories added to this collection yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
}
