'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getPostBySlugOrId } from '@/lib/community-api';
import { CommunityPost } from '@/types/community';
import { CommunityNavbar } from '@/components/community/CommunityNavbar';
import { PostForm } from '@/components/community/PostForm';
import { LoadingSkeleton } from '@/components/community/LoadingSkeleton';
import { PageLayout } from '@/components/ui/layout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
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
        console.error('Failed to load post for editing:', err);
        setError('Post not found or you are not authorized to edit this story.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPost();
    }
  }, [id]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 pb-20">
        <CommunityNavbar />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 space-y-6">
          <Link
            href={post ? `/community/posts/${post.slug || post.id}` : '/community'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Return</span>
          </Link>

          {loading ? (
            <LoadingSkeleton type="detail" />
          ) : error || !post ? (
            <div className="p-12 text-center space-y-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Cannot Edit Story</h2>
              <p className="text-sm text-zinc-500">{error || 'Post unavailable for editing.'}</p>
              <Link href="/community">
                <Button variant="outline" className="mt-2">
                  Return to Feed
                </Button>
              </Link>
            </div>
          ) : (
            <PostForm initialPost={post} isEdit={true} />
          )}
        </main>
      </div>
    </PageLayout>
  );
}
