'use client';

import React from 'react';
import Link from 'next/link';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { PostForm } from '@/components/community/PostForm';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft } from 'lucide-react';

export default function CreatePostPage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 space-y-6">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Community Feed</span>
          </Link>

          <PostForm isEdit={false} />
        </main>
      </div>
    </PageLayout>
  );
}
