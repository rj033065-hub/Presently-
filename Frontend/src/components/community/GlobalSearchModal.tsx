'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AutocompleteSuggestion } from '@/types/community';
import { autocompleteSearch } from '@/lib/community-api';
import { Search, X, History, Sparkles, Folder, Hash, Gift, User as UserIcon, ArrowRight, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'presently_recent_searches_v1';
const POPULAR_SEARCHES = ['Mechanical Keyboards', 'Father\'s Day Gifts', 'Coffee Machine', 'Ergonomic Desk', 'Luxury Watch'];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  // Debounced Autocomplete Fetching (300ms)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await autocompleteSearch(query.trim());
        setSuggestions(results);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = [searchTerm, ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {}
  };

  const handleSelectSuggestion = (url: string, term: string) => {
    saveRecentSearch(term);
    onClose();
    window.location.href = url;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'category':
        return <Folder className="w-4 h-4 text-rose-500" />;
      case 'tag':
        return <Hash className="w-4 h-4 text-amber-500" />;
      case 'gift':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search unboxing stories, categories, tags, or gift ideas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Autocomplete Suggestions */}
          {query.trim().length >= 2 ? (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {loading ? 'Searching...' : suggestions.length > 0 ? 'Top Matching Results' : 'No matches found'}
              </h4>

              <div className="space-y-1">
                {suggestions.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectSuggestion(item.url, item.title)}
                    className="p-3 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {getSuggestionIcon(item.type)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h5>
                        {item.subtitle && <p className="text-[11px] text-zinc-400">{item.subtitle}</p>}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 text-xs font-medium transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Popular Gifting Topics</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/50 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
