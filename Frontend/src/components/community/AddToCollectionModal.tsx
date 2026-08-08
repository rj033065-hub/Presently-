'use client';

import React, { useState, useEffect } from 'react';
import { Collection } from '@/types/community';
import { getMyCollections, createCollection, addPostToCollection, removePostFromCollection } from '@/lib/community-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, X, Check, Plus, Loader2, Lock, Globe } from 'lucide-react';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function AddToCollectionModal({ isOpen, onClose, postId }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  useEffect(() => {
    async function loadCollections() {
      if (!isOpen) return;
      try {
        setLoading(true);
        const res = await getMyCollections(1, 50);
        setCollections(res.items);
      } catch (err) {
        console.error('Failed to load user collections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePostInCollection = async (collection: Collection) => {
    const isCurrentlyIn = collection.posts?.some((p) => p.id === postId);

    // Optimistic UI Update
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collection.id) {
          const updatedPosts = isCurrentlyIn
            ? c.posts.filter((p) => p.id !== postId)
            : [...c.posts, { id: postId } as any];
          return { ...c, posts: updatedPosts, postsCount: updatedPosts.length };
        }
        return c;
      })
    );

    try {
      if (isCurrentlyIn) {
        await removePostFromCollection(collection.id, postId);
      } else {
        await addPostToCollection(collection.id, postId);
      }
    } catch (err) {
      console.error('Failed to toggle post in collection:', err);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmittingCreate(true);
      const created = await createCollection({
        title: newTitle.trim(),
        is_public: newIsPublic,
      });
      // Automatically add post to newly created collection
      await addPostToCollection(created.id, postId);

      setCollections((prev) => [created, ...prev]);
      setNewTitle('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setSubmittingCreate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-lg">
            <FolderPlus className="w-5 h-5 text-indigo-500" />
            <span>Save to Collection</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Collections List */}
        {loading ? (
          <div className="py-8 flex justify-center text-indigo-600 dark:text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {collections.map((col) => {
              const isIncluded = col.posts?.some((p) => p.id === postId);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleTogglePostInCollection(col)}
                  className="w-full p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 flex items-center justify-between transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {col.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{col.title}</h4>
                      <p className="text-[11px] text-zinc-400">{col.postsCount || 0} stories</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isIncluded ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                    {isIncluded && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Inline Create Collection Form */}
        {isCreating ? (
          <form onSubmit={handleCreateCollection} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">New Collection</h4>
            <Input
              type="text"
              placeholder="e.g. Dream Tech Setup Gifts"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-700"
              autoFocus
            />

            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Public Collection</span>
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingCreate || !newTitle.trim()}
                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="w-full rounded-2xl text-xs gap-2 border-dashed"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Collection</span>
          </Button>
        )}
      </div>
    </div>
  );
}
