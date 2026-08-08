'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email address');

interface NewsletterInputs {
  email: string;
}

export function NewsletterForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterInputs>();

  const onSubmit = async (data: NewsletterInputs) => {
    setErrorMessage(null);
    const result = emailSchema.safeParse(data.email);
    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || 'Invalid email');
      return;
    }

    setIsLoading(true);
    // Simulate UI API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
  };

  return (
    <div className="relative rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/80 to-white p-8 sm:p-12 shadow-xl backdrop-blur-xl dark:border-indigo-900/60 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden">
      {/* Decorative background sparkle glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>WEEKLY GIFT INSIDER</span>
        </div>

        <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">
          Never Miss a Memorable Gift Idea.
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Join 25,000+ subscribers receiving our curated seasonal gift guides, AI recommendations, and exclusive community unboxing stories.
        </p>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-semibold">
                You&apos;re in! We&apos;ve sent a welcome gift guide straight to your inbox.
              </span>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 1 }}
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto text-left"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  {...register('email', { required: 'Email address is required' })}
                  disabled={isLoading}
                  className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 ${
                    errorMessage || errors.email
                      ? 'border-red-500 focus:ring-red-500/40'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                />
                {(errorMessage || errors.email) && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errorMessage || errors.email?.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-2">
          Zero spam guarantee. Unsubscribe at any time with one click.
        </p>
      </div>
    </div>
  );
}
