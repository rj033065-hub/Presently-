'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Search, ArrowRight, Trash2, MessageSquare, ThumbsUp } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/spinner';
import { getSavedContent, SavedItem } from '@/lib/dashboard-api';

export default function SavedContentPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'post' | 'collection' | 'gift'>('all');

  useEffect(() => {
    loadSaved();
  }, []);

  async function loadSaved() {
    try {
      setLoading(true);
      const items = await getSavedContent();
      setSavedItems(items);
    } catch (err) {
      console.error('Failed to load saved content:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = savedItems.filter((item) => {
    const matchesSearch = `${item.title} ${item.subtitle || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.item_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Saved Community Content"
      subtitle="Access your bookmarked unboxing posts, community advice, and curated gift collections."
    >
      <div className="space-y-6">
        {/* Search & Type Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search saved posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start">
            {(['all', 'post', 'collection', 'gift'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {type}s
              </button>
            ))}
          </div>
        </div>

        {/* Saved Content List */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                      📖
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase">
                      {item.item_type}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2">{item.title}</h3>
                    {item.subtitle && <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.subtitle}</p>}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Saved {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Link href={item.target_url}>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <span>View Post</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-zinc-300 dark:border-zinc-800">
            <Bookmark className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No saved community content</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Explore unboxing stories and gift guides in our community feed to bookmark your favorites.</p>
            <Link href="/community" className="inline-block mt-4">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
                Browse Community
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
