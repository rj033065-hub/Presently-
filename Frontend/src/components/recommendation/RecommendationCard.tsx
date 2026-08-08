'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RecommendationItem } from '@/types/recommendation';
import { Sparkles, ExternalLink, ThumbsUp, AlertCircle, Lightbulb, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  item: RecommendationItem;
  index?: number;
}

export function RecommendationCard({ item, index = 0 }: RecommendationCardProps) {
  const currencySymbol = item.currency === 'INR' ? '₹' : item.currency === 'EUR' ? '€' : item.currency === 'GBP' ? '£' : '$';

  const badgeColor =
    item.strategy_label === 'Top Pick'
      ? 'bg-amber-500 text-white'
      : item.strategy_label === 'Best Value'
      ? 'bg-emerald-600 text-white'
      : item.strategy_label === 'Luxury Choice'
      ? 'bg-purple-600 text-white'
      : item.is_fallback
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
      : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm backdrop-blur-xl hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:hover:border-indigo-800 transition-all duration-300 flex flex-col justify-between space-y-5"
    >
      <div className="space-y-4">
        {/* Card Header: Strategy Badge & Match Score Gauge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${badgeColor}`}>
            {item.is_fallback ? '✨ AI Generated Idea' : item.strategy_label}
          </span>

          <div className="flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{item.match_score}% Match</span>
          </div>
        </div>

        {/* Product Image & Meta */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          {item.image_url && (
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200/60 dark:border-zinc-800/60">
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {item.category}
            </span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
              {item.title}
            </h4>
            <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
              {currencySymbol}{item.estimated_price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI Reasoning Box */}
        <div className="rounded-2xl bg-indigo-50/70 p-4 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 space-y-1.5">
          <div className="flex items-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
            Why This Gift Matches:
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {item.ai_reasoning}
          </p>
        </div>

        {/* Pros & Cons Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {item.pros && item.pros.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" /> Pros:
              </span>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                {item.pros.map((pro, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-emerald-500">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.cons && item.cons.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Considerations:
              </span>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                {item.cons.map((con, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-amber-500">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Personalization Tip Callout */}
        {item.personalization_tips && (
          <div className="rounded-xl bg-amber-50/70 p-3 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/50 flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200">
            <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Personalization Tip: </span>
              <span>{item.personalization_tips}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-medium">
          {item.is_fallback ? 'AI Suggested Idea' : 'Verified Merchant Item'}
        </span>

        {item.buy_url && (
          <a
            href={item.buy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <span>Where to Buy</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
