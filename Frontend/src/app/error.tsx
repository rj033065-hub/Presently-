'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error('Unhandled Client Error:', error);
  }, [error]);

  return (
    <PageLayout>
      <div className="relative mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        {/* Ambient background glow */}
        <div className="absolute -z-10 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              500 INTERNAL ERROR
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans sm:text-4xl">
              Something Went Wrong
            </h1>
            <p className="mx-auto max-w-md text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We encountered an unexpected issue while rendering this page. Our engineering team has been notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              size="lg"
              className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto font-semibold rounded-xl"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Link href="/contact" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              <span>Report this issue to support</span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
