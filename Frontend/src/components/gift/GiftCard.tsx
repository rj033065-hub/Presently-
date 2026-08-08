'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GiftItem } from '@/types/gift';
import { Star, ExternalLink, ShieldCheck, HeartHandshake, Sparkles, Tag } from 'lucide-react';
import Link from 'next/link';

interface GiftCardProps {
  gift: GiftItem;
  index?: number;
}

export function GiftCard({ gift, index = 0 }: GiftCardProps) {
  const currencySymbol = gift.currency === 'INR' ? '₹' : gift.currency === 'EUR' ? '€' : gift.currency === 'GBP' ? '£' : '$';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900 transition-all duration-300 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Product Image & Badges */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/60">
          <img
            src={gift.primary_image_url}
            alt={gift.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {gift.is_handmade && (
              <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                <HeartHandshake className="mr-1 h-3 w-3" /> Handmade
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md dark:bg-white/80 dark:text-zinc-900">
              {gift.gift_type}
            </span>
          </div>

          {gift.is_verified && (
            <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 p-1 text-white shadow-sm" title="Verified Merchant">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {gift.category?.name || 'Gift Catalog'}
          </span>
          <span className="font-medium text-zinc-400">
            {gift.brand || 'Generic'}
          </span>
        </div>

        {/* Title */}
        <Link href={`/gifts/${gift.id}`}>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {gift.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {gift.short_description || gift.description}
        </p>
      </div>

      {/* Footer: Rating, Price, & Action */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{gift.rating_avg > 0 ? gift.rating_avg.toFixed(1) : '4.9'}</span>
            <span className="text-zinc-400 font-normal">({gift.rating_count || 42})</span>
          </div>
          <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
            {currencySymbol}{gift.estimated_price.toLocaleString()}
          </div>
        </div>

        <Link
          href={`/gifts/${gift.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-white transition-all shadow-sm"
        >
          <span>View Details</span>
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
