'use client';

import React from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Gift, Home as HomeIcon, Search, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const quickLinks = [
    { label: 'Home Page', href: '/', icon: HomeIcon },
    { label: 'Start AI Survey', href: '/survey', icon: Gift },
    { label: 'Explore Features', href: '/features', icon: Search },
    { label: 'FAQ Knowledge Base', href: '/faq', icon: HelpCircle },
  ];

  return (
    <PageLayout>
      <div className="relative mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        {/* Ambient glow */}
        <div className="absolute -z-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Badge */}
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
            ERROR 404
          </span>

          <h1 className="text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Unboxed Somewhere Else!
            </h2>
            <p className="mx-auto max-w-md text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The page, gift collection, or recommendation link you are looking for does not exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home Page
              </Button>
            </Link>
          </div>

          {/* Quick Navigation Links */}
          <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Popular Destinations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center rounded-xl border border-zinc-200/80 bg-white p-3 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  >
                    <Icon className="h-4 w-4 mb-1 text-indigo-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
