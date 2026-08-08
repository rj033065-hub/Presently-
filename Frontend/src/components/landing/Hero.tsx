'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Gift, Heart, ShieldCheck, Star, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Ambient background glowing gradients */}
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl opacity-30 dark:opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-[450px] w-[900px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 opacity-60 rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Announcement Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm backdrop-blur-md dark:border-indigo-900/60 dark:bg-zinc-900/80 dark:text-zinc-100"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">New</span>
            <span className="text-zinc-400 dark:text-zinc-600">|</span>
            <span>Next-Gen AI Gift Recommendation Engine v2.0</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500 ml-1" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl font-sans text-zinc-900 dark:text-white leading-[1.1]"
          >
            Gift Giving,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-rose-400">
              Reimagined by AI.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 sm:text-xl leading-relaxed"
          >
            Stop guessing. Discover hyper-personalized gift recommendations powered by advanced artificial intelligence, recipient psychometrics, and verified community unboxing reviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/survey" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-13 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/25 rounded-xl border border-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find a Gift in 2 Mins</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto h-13 px-7 text-base font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>See How It Works</span>
              </Button>
            </Link>
          </motion.div>

          {/* Trust Highlights below CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400"
          >
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span>100% Privacy Protection</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>4.9/5 Star Community Rating</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Interactive Mockup Showcase Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          {/* Decorative frame lighting */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-25 blur-lg" />

          {/* Main Card Container */}
          <div className="relative rounded-2xl border border-zinc-200/80 bg-white/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 overflow-hidden">
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400">presently.ai/concierge/live-demo</span>
              </div>
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300">
                <Zap className="mr-1 h-3 w-3" /> Live Recommendation Stream
              </div>
            </div>

            {/* Mockup Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column: Simulated Survey Input */}
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <span>Recipient Profile</span>
                  <span className="text-indigo-500">Step 3/3</span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Target: Sister (30th Birthday)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      ☕ Specialty Coffee
                    </span>
                    <span className="rounded-md bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      📚 Modern Fiction
                    </span>
                    <span className="rounded-md bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      🧘 Minimalist Aesthetics
                    </span>
                  </div>
                  <div className="pt-2 text-xs text-zinc-500 flex items-center justify-between">
                    <span>Budget Range:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">$75 – $150</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Recommended Gift Card (Featured Result) */}
              <div className="md:col-span-2 rounded-xl bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/30 p-4 sm:p-5 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-200/60 dark:border-indigo-900/60 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="mr-1 h-3 w-3 text-emerald-500" /> 98.4% Match Score
                  </span>
                  <span className="text-xs text-zinc-400">Rank #1 Choice</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold text-xs text-center p-2">
                    <Gift className="h-8 w-8 text-indigo-500" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      Artisan Pour-Over Ceramic Set & Micro-Roast Beans
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      AI Reasoning: Matches her love for morning rituals, aesthetic minimalism, and specialty coffee. 142 community unboxings rate this 4.9/5.
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">$120.00</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                        <Heart className="h-3.5 w-3.5 mr-1 fill-rose-500 text-rose-500" /> 84 Saves
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
