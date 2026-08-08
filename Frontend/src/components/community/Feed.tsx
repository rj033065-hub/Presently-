'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CommunityPost, Category, Tag, CommunityPostFilterParams } from '@/types/community';
import { getPosts } from '@/lib/community-api';
import { PostCard } from './PostCard';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { RefreshCw, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedProps {
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  searchTerm?: string;
  categories?: Category[];
  tags?: Tag[];
  onClearFilters?: () => void;
}

export function Feed({
  categoryId,
  tagId,
  authorId,
  searchTerm = '',
  categories = [],
  tags = [],
  onClearFilters,
}: FeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filterParams, setFilterParams] = useState<CommunityPostFilterParams>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const data = await getPosts({
          page: pageNum,
          limit: 9,
          status: 'Published',
          visibility: 'Public',
          categoryId,
          tagId,
          authorId,
          search: searchTerm || undefined,
          sortBy: filterParams.sortBy || 'created_at',
          sortOrder: filterParams.sortOrder || 'desc',
          dateRange: filterParams.dateRange,
          readingTimeBucket: filterParams.readingTimeBucket,
        });

        if (append) {
          setPosts((prev) => [...prev, ...data.items]);
        } else {
          setPosts(data.items);
        }

        setPage(data.page);
        setTotalPages(data.pages);
      } catch (err: any) {
        console.error('Failed to load community feed:', err);
        setError('Unable to load unboxing stories. Please verify backend connection.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryId, tagId, authorId, searchTerm, filterParams]
  );

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handleResetAll = () => {
    setFilterParams({ sortBy: 'created_at', sortOrder: 'desc' });
    if (onClearFilters) onClearFilters();
  };

  const activeCategory = categories.find((c) => c.id === categoryId);
  const activeTag = tags.find((t) => t.id === tagId);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm">
        {/* Active Filters Display */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Stories Feed
          </span>

          {activeCategory && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Cat: {activeCategory.name}
            </span>
          )}

          {activeTag && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
              #{activeTag.name}
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Search: &quot;{searchTerm}&quot;
            </span>
          )}

          {(activeCategory || activeTag || searchTerm || filterParams.dateRange || filterParams.readingTimeBucket) && (
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>

        {/* Toggle Advanced Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`rounded-xl text-xs gap-1.5 ${showAdvanced ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border-indigo-200' : ''}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Filters' : 'Filter & Sort'}</span>
        </Button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <AdvancedFilterPanel
          categories={categories}
          tags={tags}
          filters={filterParams}
          onFilterChange={(newFilters) => setFilterParams(newFilters)}
          onReset={handleResetAll}
        />
      )}

      {/* Main Feed Content Stream */}
      {loading ? (
        <LoadingSkeleton count={6} type="card" />
      ) : error ? (
        <div className="p-8 text-center space-y-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <Button onClick={() => fetchPosts(1, false)} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState onReset={handleResetAll} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} priority={index < 3} />
            ))}
          </div>

          {/* Infinite Pagination Load More */}
          {page < totalPages && (
            <div className="pt-8 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading More Stories...
                  </span>
                ) : (
                  <span>Load More Unboxing Stories</span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
