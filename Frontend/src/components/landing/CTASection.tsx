'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 px-6 py-16 sm:px-12 sm:py-20 shadow-2xl overflow-hidden text-center text-white">
          {/* Glowing ambient background spots */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>START IN UNDER 2 MINUTES</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl font-sans leading-tight">
              Ready to Find the Perfect Gift with AI Precision?
            </h2>

            <p className="text-base text-indigo-100 sm:text-lg max-w-2xl mx-auto leading-relaxed">
              No registration required to try your first recipient survey. Discover hyper-personalized gift recommendations backed by AI sentiment matching today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/survey" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-white text-indigo-950 hover:bg-zinc-100 shadow-lg rounded-xl transition-transform hover:scale-[1.02]"
                >
                  <span>Start Free Survey</span>
                  <ArrowRight className="ml-2 h-5 w-5 text-indigo-600" />
                </Button>
              </Link>

              <Link href="/community-overview" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-13 px-7 text-base font-semibold border-indigo-400/30 bg-indigo-900/40 text-white hover:bg-indigo-900/70 rounded-xl backdrop-blur-sm"
                >
                  <Heart className="mr-2 h-4 w-4 text-rose-400 fill-rose-400" />
                  <span>Explore Community</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
