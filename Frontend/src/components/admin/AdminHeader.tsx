'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, Bell, Shield, X, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export function AdminHeader() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get('/admin/search', { params: { query: searchQuery } });
        setSearchResults(res.data);
      } catch (err) {
        console.error('Failed to perform admin search', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      {/* Search Input Trigger */}
      <div className="relative w-72 sm:w-96">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Global search users, gifts, posts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowModal(true);
            }}
            onFocus={() => setShowModal(true)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-4 py-2 text-xs font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Global Search Results Dropdown Modal */}
        {showModal && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 top-12 w-full rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Search Results</span>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-900">
              {isSearching ? (
                <p className="p-4 text-center text-xs text-zinc-500">Searching platform database...</p>
              ) : searchResults.length === 0 ? (
                <p className="p-4 text-center text-xs text-zinc-500">No matching entities found.</p>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={
                      item.type === 'user'
                        ? `/admin/users?query=${encodeURIComponent(item.title)}`
                        : item.type === 'gift'
                        ? `/admin/gifts?query=${encodeURIComponent(item.title)}`
                        : '/admin/community'
                    }
                    onClick={() => setShowModal(false)}
                    className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors rounded-lg"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{item.title}</h4>
                      <p className="text-[10px] text-zinc-400 capitalize">{item.type} &bull; {item.subtitle}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <div className="flex items-center space-x-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <img
            src={user?.imageUrl || '/avatar-placeholder.png'}
            alt="Admin Avatar"
            className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover"
          />
          <div className="hidden sm:block text-left">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
              {user?.fullName || user?.firstName || 'Admin'}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              <Shield className="h-3 w-3" /> Privileged User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
