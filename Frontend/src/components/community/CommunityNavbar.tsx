'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, PlusCircle, FolderHeart, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSearchModal } from './GlobalSearchModal';

interface CommunityNavbarProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function CommunityNavbar({ searchTerm = '', onSearchChange }: CommunityNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Link */}
          <div className="flex items-center gap-6">
            <Link href="/community" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                  Presently
                </span>
                <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  Community
                </span>
              </div>
            </Link>

            {/* Quick Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <Link
                href="/community"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Explore Feed
              </Link>
              <Link
                href="/community/collections"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <FolderHeart className="w-4 h-4 text-indigo-500" />
                <span>Collections</span>
              </Link>
              <Link
                href="/survey"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                AI Gift Matcher
              </Link>
            </nav>
          </div>

          {/* Search Trigger Input Bar */}
          <div className="flex-1 max-w-md hidden sm:block relative cursor-pointer" onClick={() => setIsSearchOpen(true)}>
            <div className="relative pointer-events-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                readOnly
                placeholder="Search stories, categories, tags, gift ideas..."
                value={searchTerm}
                className="pl-10 pr-4 h-10 rounded-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-sm transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/community/create">
              <Button size="sm" variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-full px-3.5">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Write Story</span>
              </Button>
            </Link>

            <Link href="/survey">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 shadow-sm shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Get Gift Ideas</span>
                <span className="sm:hidden">Ideas</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
