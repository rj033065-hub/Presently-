'use client';

import React, { useState, useEffect } from 'react';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';
import { Feed } from '@/components/community/Feed';
import { CommunityErrorBoundary } from '@/components/community/CommunityErrorBoundary';
import { Category, Tag } from '@/types/community';
import { getCategories, getTags } from '@/lib/community-api';
import { PageLayout } from '@/components/ui/layout';
import { MessageSquareHeart } from 'lucide-react';

export default function CommunityPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);
      } catch (e) {
        console.error('Failed to load categories/tags:', e);
      }
    }
    loadTaxonomy();
  }, []);

  const handleClearFilters = () => {
    setSelectedCategoryId(undefined);
    setSelectedTagId(undefined);
    setSearchTerm('');
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header Banner */}
          <section className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white overflow-hidden shadow-xl shadow-indigo-950/20">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>Verified Unboxing Wisdom</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Real Stories & Recipient Reaction Ratings
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Browse authentic gift unwrapping experiences, discover what recipient tastes matched best, and find inspiration for your next special moment.
              </p>
            </div>
          </section>

          {/* Main Grid: Feed + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CommunityErrorBoundary fallbackTitle="Error Loading Community Feed">
                <Feed
                  categoryId={selectedCategoryId}
                  tagId={selectedTagId}
                  searchTerm={searchTerm}
                  categories={categories}
                  tags={tags}
                  onClearFilters={handleClearFilters}
                />
              </CommunityErrorBoundary>
            </div>

            <div className="lg:col-span-1">
              <CommunitySidebar
                categories={categories}
                tags={tags}
                selectedCategoryId={selectedCategoryId}
                selectedTagId={selectedTagId}
                onSelectCategory={setSelectedCategoryId}
                onSelectTag={setSelectedTagId}
              />
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
