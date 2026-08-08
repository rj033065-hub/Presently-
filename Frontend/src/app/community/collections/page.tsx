'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Collection } from '@/types/community';
import { getCollections } from '@/lib/community-api';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { CollectionCard } from '@/components/community/CollectionCard';
import { LoadingSkeleton } from '@/components/community/LoadingSkeleton';
import { PageLayout } from '@/components/ui/layout';
import { FolderHeart, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getCollections(page, 12);
        setCollections(res.items);
        setTotalPages(res.pages);
      } catch (err) {
        console.error('Failed to load collections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-3 max-w-2xl">
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Community Feed</span>
              </Link>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Curated Gift Collections
              </h1>
              <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
                Explore handpicked unboxing stories, recipient wishlists, and gift guides assembled by the Presently community.
              </p>
            </div>

            <FolderHeart className="absolute right-6 bottom-4 w-48 h-48 text-white/5 pointer-events-none" />
          </div>

          {/* Collections Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={6} />
          ) : collections.length === 0 ? (
            <div className="p-12 text-center space-y-3 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Public Collections Yet</h3>
              <p className="text-xs text-zinc-500">Be the first to assemble a public gift collection!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <CollectionCard key={col.id} collection={col} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full text-xs"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
}
