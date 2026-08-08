'use client';

import React from 'react';
import Link from 'next/link';
import { Tag as CategoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryChipProps {
  name: string;
  slug: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({
  name,
  slug,
  isActive = false,
  onClick,
  className,
}: CategoryChipProps) {
  const content = (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none border',
        isActive
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 dark:bg-indigo-500 dark:border-indigo-500'
          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white',
        className
      )}
    >
      <CategoryIcon className="w-3 h-3 text-current opacity-80" />
      <span>{name}</span>
    </span>
  );

  if (onClick) {
    return content;
  }

  return <Link href={`/community/category/${slug}`}>{content}</Link>;
}
