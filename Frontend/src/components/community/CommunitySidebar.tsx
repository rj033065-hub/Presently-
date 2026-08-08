'use client';

import React from 'react';
import { Category, Tag } from '@/types/community';
import { CategoryChip } from './CategoryChip';
import { TagChip } from './TagChip';
import { ShieldCheck, Sparkles, FolderOpen, Hash } from 'lucide-react';

interface CommunitySidebarProps {
  categories: Category[];
  tags: Tag[];
  selectedCategoryId?: string;
  selectedTagId?: string;
  onSelectCategory?: (id?: string) => void;
  onSelectTag?: (id?: string) => void;
}

export function CommunitySidebar({
  categories = [],
  tags = [],
  selectedCategoryId,
  selectedTagId,
  onSelectCategory,
  onSelectTag,
}: CommunitySidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Categories Widget */}
      <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            <h3>Categories</h3>
          </div>
          {selectedCategoryId && (
            <button
              onClick={() => onSelectCategory?.(undefined)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onSelectCategory?.(undefined)}
            className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              !selectedCategoryId
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center">
              <CategoryChip
                name={cat.name}
                slug={cat.slug}
                isActive={selectedCategoryId === cat.id}
                onClick={onSelectCategory ? () => onSelectCategory(cat.id === selectedCategoryId ? undefined : cat.id) : undefined}
                className="w-full justify-start text-xs py-2 px-3 rounded-xl border-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tags Cloud Widget */}
      {tags.length > 0 && (
        <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Hash className="w-4 h-4 text-rose-500" />
              <h3>Popular Tags</h3>
            </div>
            {selectedTagId && (
              <button
                onClick={() => onSelectTag?.(undefined)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                name={tag.name}
                slug={tag.slug}
                isActive={selectedTagId === tag.id}
                onClick={onSelectTag ? () => onSelectTag(tag.id === selectedTagId ? undefined : tag.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Guidelines & Trust Widget */}
      <div className="p-5 rounded-3xl border border-indigo-200/50 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3>Verified Stories</h3>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Explore genuine unboxing reactions and recipient ratings shared by real gift givers in our community.
        </p>
      </div>
    </aside>
  );
}
