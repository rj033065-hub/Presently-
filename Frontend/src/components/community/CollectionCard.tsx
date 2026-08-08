'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Collection } from '@/types/community';
import { FolderHeart, Lock, Globe, User as UserIcon } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const authorName = collection.author?.username || 'Community Curator';
  const defaultGradient = 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link
        href={`/community/collections/${collection.slug || collection.id}`}
        className="group relative flex flex-col h-full rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 overflow-hidden p-5 space-y-4"
      >
        {/* Collection Banner Header */}
        <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {collection.coverImageUrl ? (
            <img
              src={collection.coverImageUrl}
              alt={collection.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full ${defaultGradient} flex items-center justify-center p-4 text-center relative overflow-hidden`}>
              <FolderHeart className="w-10 h-10 text-white/80 group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Privacy Badge & Count */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
              {collection.isPublic ? (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Private</span>
                </>
              )}
            </span>

            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
              {collection.postsCount} {collection.postsCount === 1 ? 'Story' : 'Stories'}
            </span>
          </div>
        </div>

        {/* Info Body */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {collection.title}
            </h3>

            {collection.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          {/* Author Footer */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[1px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                {collection.author?.avatarUrl ? (
                  <img src={collection.author.avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3 h-3 text-zinc-400" />
                )}
              </div>
            </div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {authorName}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
