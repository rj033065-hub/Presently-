'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SectionTitle({
  badge,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  const alignmentClass =
    align === 'center'
      ? 'text-center mx-auto'
      : align === 'right'
      ? 'text-right ml-auto'
      : 'text-left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`max-w-3xl ${alignmentClass} ${className}`}
    >
      {badge && (
        <span className="inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400 mb-4 shadow-sm">
          {badge}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-zinc-900 dark:text-white font-sans leading-tight">
        {title}{' '}
        {highlight && (
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-rose-400">
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 sm:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
