'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/ui/layout';
import { GiftItem, GiftCategory, GiftTag } from '@/types/gift';
import { getGifts, getCategories, getTags } from '@/lib/gift-api';

import { GiftCard } from '@/components/gift/GiftCard';
import { GiftFilterSidebar } from '@/components/gift/GiftFilterSidebar';
import { Sparkles, Search, Gift, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function GiftCatalogPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [categories, setCategories] = useState<GiftCategory[]>([]);
  const [tags, setTags] = useState<GiftTag[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isHandmade, setIsHandmade] = useState<boolean | undefined>(undefined);
  const [giftType, setGiftType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('trending');
  const [page, setPage] = useState<number>(1);
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGifts({
        category: selectedCategory,
        tag: selectedTag,
        q: searchQuery || undefined,
        is_handmade: isHandmade,
        gift_type: giftType,
        sort_by: sortBy,
        page,
        limit: 12,
      });
      setGifts(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load gift catalog items:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedTag, searchQuery, isHandmade, giftType, sortBy, page]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats || []);
        setTags(tgs || []);
      } catch (err) {
        console.error('Failed to load categories/tags:', err);
      }
    }
    loadMeta();
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setIsHandmade(undefined);
    setGiftType(undefined);
    setSortBy('trending');
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-6">
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>GIFT CATALOG ENGINE</span>
              </div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
                Explore Gift Catalog
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Discover verified products ranked by our AI recommendation engine.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search gifts by keyword, brand, or tag..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Main Layout: Sidebar & Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <GiftFilterSidebar
                categories={categories}
                tags={tags}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                isHandmade={isHandmade}
                giftType={giftType}
                sortBy={sortBy}
                onFilterChange={(f) => {
                  if (f.category !== undefined) setSelectedCategory(f.category);
                  if (f.tag !== undefined) setSelectedTag(f.tag);
                  if (f.isHandmade !== undefined) setIsHandmade(f.isHandmade);
                  if (f.giftType !== undefined) setGiftType(f.giftType);
                  if (f.sortBy !== undefined) setSortBy(f.sortBy);
                  setPage(1);
                }}
                onReset={handleResetFilters}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between">
              <Button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                variant="secondary"
                size="sm"
                className="rounded-xl border-zinc-200 dark:border-zinc-800"
              >
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                <span>Filters</span>
              </Button>
              <span className="text-xs font-semibold text-zinc-500">{total} Products</span>
            </div>

            {showMobileFilter && (
              <div className="lg:hidden col-span-1">
                <GiftFilterSidebar
                  categories={categories}
                  tags={tags}
                  selectedCategory={selectedCategory}
                  selectedTag={selectedTag}
                  isHandmade={isHandmade}
                  giftType={giftType}
                  sortBy={sortBy}
                  onFilterChange={(f) => {
                    if (f.category !== undefined) setSelectedCategory(f.category);
                    if (f.tag !== undefined) setSelectedTag(f.tag);
                    if (f.isHandmade !== undefined) setIsHandmade(f.isHandmade);
                    if (f.giftType !== undefined) setGiftType(f.giftType);
                    if (f.sortBy !== undefined) setSortBy(f.sortBy);
                    setPage(1);
                  }}
                  onReset={handleResetFilters}
                />
              </div>
            )}

            {/* Catalog Grid */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-72 rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse"
                    />
                  ))}
                </div>
              ) : gifts.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Gift className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    No Catalog Matches Found
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                    Try clearing search query terms or adjusting your filter settings.
                  </p>
                  <Button onClick={handleResetFilters} variant="secondary" className="rounded-xl">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {gifts.map((gift, idx) => (
                      <GiftCard key={gift.id} gift={gift} index={idx} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-semibold text-zinc-500">
                        Page {page} of {totalPages} ({total} Items)
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                        >
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
