'use client';

import React from 'react';
import { Author } from '@/types/community';
import { User as UserIcon, ShieldCheck } from 'lucide-react';

interface AuthorCardProps {
  author?: Author;
  createdDate?: string;
  className?: string;
}

export function AuthorCard({ author, createdDate, className }: AuthorCardProps) {
  const username = author?.username || 'Community Giver';
  const avatarUrl = author?.avatarUrl;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm ${className}`}>
      <div className="relative flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[2px] shadow-sm">
        <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-5.5 h-5.5 text-zinc-400" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {username}
          </h4>
          <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          Verified Giver {createdDate ? `• ${new Date(createdDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
        </p>
      </div>
    </div>
  );
}
