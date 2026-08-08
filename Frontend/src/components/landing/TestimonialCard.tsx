'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Heart } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  relationTag: string;
  rating?: number;
  initials: string;
  index?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  relationTag,
  rating = 5,
  initials,
  index = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md hover:border-indigo-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:hover:border-indigo-800 transition-all duration-300"
    >
      <div className="space-y-4">
        {/* Rating Stars & Relationship Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-amber-400">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <Heart className="mr-1 h-3 w-3 fill-indigo-500 text-indigo-500" />
            {relationTag}
          </span>
        </div>

        {/* Quote text */}
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
          &quot;{quote}&quot;
        </p>
      </div>

      {/* Author Footer */}
      <div className="mt-6 flex items-center space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-white text-xs shadow-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
              {author}
            </h4>
            <span title="Verified Gift Giver">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
