'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';
import { Feed } from '@/components/community/Feed';
import { Category, Tag } from '@/types/community';
import { getCategories, getTags } from '@/lib/community-api';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft, Hash } from 'lucide-react';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default function TagPage({ params }: TagPageProps) {
  const { slug } = use(params);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);

        const found = tgs.find((t) => t.slug === slug);
        if (found) {
          setCurrentTag(found);
        }
      } catch (e) {
        console.error('Failed to load tag taxonomy:', e);
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

          {/* Tag Banner Header */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-900 via-purple-950 to-indigo-950 text-white shadow-xl shadow-rose-950/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <Hash className="w-5 h-5 text-rose-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Topic Tag</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              #{currentTag ? currentTag.name : slug}
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              Exploring all community unboxing stories tagged with #{currentTag ? currentTag.name : slug}.
            </p>
          </section>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Feed
                tagId={currentTag?.id}
                categories={categories}
                tags={tags}
              />
            </div>

            <div className="lg:col-span-1">
              <CommunitySidebar
                categories={categories}
                tags={tags}
                selectedTagId={currentTag?.id}
              />
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
