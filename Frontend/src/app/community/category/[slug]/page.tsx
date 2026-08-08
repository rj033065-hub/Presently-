'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';
import { Feed } from '@/components/community/Feed';
import { Category, Tag } from '@/types/community';
import { getCategories, getTags } from '@/lib/community-api';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft, FolderOpen, Tag as CategoryIcon } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);

        const found = cats.find((c) => c.slug === slug);
        if (found) {
          setCurrentCategory(found);
        }
      } catch (e) {
        console.error('Failed to load category taxonomy:', e);
      }
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Back Nav Link */}
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Community Feed</span>
          </Link>

          {/* Category Banner Header */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white shadow-xl shadow-indigo-950/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <CategoryIcon className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Category Archive</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {currentCategory ? currentCategory.name : slug}
            </h1>
            {currentCategory?.description && (
              <p className="mt-2 text-sm text-zinc-300 max-w-2xl">{currentCategory.description}</p>
            )}
          </section>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Feed
                categoryId={currentCategory?.id}
                categories={categories}
                tags={tags}
              />
            </div>

            <div className="lg:col-span-1">
              <CommunitySidebar
                categories={categories}
                tags={tags}
                selectedCategoryId={currentCategory?.id}
              />
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
