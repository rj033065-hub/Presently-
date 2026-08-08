'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  accentColor?: 'indigo' | 'rose' | 'emerald' | 'purple' | 'amber' | 'cyan';
  index?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  category,
  accentColor = 'indigo',
  index = 0,
}: FeatureCardProps) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-600 dark:text-indigo-400',
      badge: 'border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300',
      border: 'hover:border-indigo-400 dark:hover:border-indigo-700',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300',
      border: 'hover:border-rose-400 dark:hover:border-rose-700',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
      border: 'hover:border-emerald-400 dark:hover:border-emerald-700',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-600 dark:text-purple-400',
      badge: 'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300',
      border: 'hover:border-purple-400 dark:hover:border-purple-700',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300',
      border: 'hover:border-amber-400 dark:hover:border-amber-700',
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      text: 'text-cyan-600 dark:text-cyan-400',
      badge: 'border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300',
      border: 'hover:border-cyan-400 dark:hover:border-cyan-700',
    },
  };

  const theme = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900/90 ${theme.border}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.bg} ${theme.text} transition-transform group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.badge}`}>
            {category}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center text-xs font-semibold text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>Learn more about this capability</span>
        <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </motion.div>
  );
}
