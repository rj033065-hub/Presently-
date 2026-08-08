'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
  index?: number;
}

export function StatsCard({ icon: Icon, value, label, description, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:hover:border-indigo-800"
    >
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
          {value}
        </span>
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">{label}</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
