'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sliders, Heart, ShieldCheck, Tag, ThumbsUp, Eye, Check } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'match' | 'survey' | 'community' | 'budget'>('match');

  const tabs = [
    { id: 'match', label: 'AI Match Engine', icon: Sparkles },
    { id: 'survey', label: 'Smart Profiler', icon: Sliders },
    { id: 'community', label: 'Community Reviews', icon: Heart },
    { id: 'budget', label: 'Budget Guardrail', icon: Tag },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="PRODUCT SHOWCASE"
          title="See Presently in"
          highlight="Action."
          description="Explore interactive previews of our core platform modules—crafted with Apple-level precision and Linear-level speed."
        />

        {/* Tab Navigation Pill Bar */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  type="button"
                  className={`relative flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Simulated UI Preview */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 overflow-hidden min-h-[380px] flex items-center">
            <AnimatePresence mode="wait">
              {activeTab === 'match' && (
                <motion.div
                  key="match"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                        <Sparkles className="h-5 w-5 text-indigo-500 mr-2" />
                        AI Recommendation Matrix
                      </h4>
                      <p className="text-xs text-zinc-500">Evaluated 4,200 gifts for: Partner (Anniversary)</p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300">
                      GPT-4o + Sentiment V2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">99.1% Match</span>
                        <span className="text-xs text-zinc-400">#1 Top Choice</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Smart Wooden Record Player & Vinyl Club</h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Fits recipient taste: Retro aesthetics, vintage music, cozy evening lounge setup.
                      </p>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white pt-1">$149.00</div>
                    </div>

                    <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">94.5% Match</span>
                        <span className="text-xs text-zinc-400">#2 Alternate</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Handcrafted Leather Weekend Duffle</h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Fits recipient taste: Weekend getaways, durable artisan leather, minimal branding.
                      </p>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white pt-1">$185.00</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'survey' && (
                <motion.div
                  key="survey"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                      <Sliders className="h-5 w-5 text-purple-500 mr-2" />
                      Dynamic Psychometric Profiler
                    </h4>
                    <span className="text-xs text-zinc-400">Question 3 of 5</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      How would you describe your recipient&apos;s weekend downtime vibe?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                        <span>🏔 Outdoor & Active</span>
                        <Check className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400">
                        ☕ Cozy & Bookish
                      </div>
                      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400">
                        🎨 Creative & Crafty
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                      <Heart className="h-5 w-5 text-rose-500 mr-2 fill-rose-500/20" />
                      Verified Unboxing Story
                    </h4>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      Verified Recipient Gifted
                    </span>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                          SJ
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">Sarah Jenkins</div>
                          <div className="text-[10px] text-zinc-400">Gifted to Husband for 5th Anniversary</div>
                        </div>
                      </div>
                      <div className="flex text-amber-400 text-xs font-bold">★★★★★</div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 italic pt-1 leading-relaxed">
                      &quot;The AI recommended the custom espresso tampered setup. He literally teared up opening it. Best gift recommendation platform ever!&quot;
                    </p>
                    <div className="flex items-center space-x-4 pt-2 text-[11px] text-zinc-500">
                      <span className="flex items-center"><ThumbsUp className="h-3.5 w-3.5 mr-1 text-indigo-500" /> 124 helpful votes</span>
                      <span className="flex items-center"><Eye className="h-3.5 w-3.5 mr-1" /> 1.2k views</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'budget' && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                      <Tag className="h-5 w-5 text-emerald-500 mr-2" />
                      Budget Guardrails & Zero-Markup Assurance
                    </h4>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      Strict Bounds Enforced
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-600 dark:text-zinc-400">Target Budget Window</span>
                      <span className="text-emerald-600 dark:text-emerald-400">$50 – $100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 w-[65%]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Strict filter bounds active</span>
                      <span className="flex items-center text-emerald-500 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> No price inflations detected
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
