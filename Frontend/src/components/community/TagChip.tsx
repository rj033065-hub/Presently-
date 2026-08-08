'use client';

import React from 'react';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagChipProps {
  name: string;
  slug: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TagChip({
  name,
  slug,
  isActive = false,
  onClick,
  className,
}: TagChipProps) {
  const content = (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer select-none border',
        isActive
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold'
          : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200',
        className
      )}
    >
      <Hash className="w-3 h-3 opacity-60" />
      <span>{name}</span>
    </span>
  );

  if (onClick) {
    return content;
  }

  return <Link href={`/community/tag/${slug}`}>{content}</Link>;
}
