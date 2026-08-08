'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { Mail, MapPin, MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  category: z.string().min(1, 'Please select a topic category'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setFormErrors({});
    const validation = contactSchema.safeParse(data);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0].toString()] = err.message;
      });
      setFormErrors(errMap);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
  };

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 space-y-16">
        {/* Header Hero */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <SectionTitle
            badge="GET IN TOUCH"
            title="We’d Love to Hear From"
            highlight="You."
            description="Have questions about our AI gift matcher, corporate concierges, or press inquiries? Send us a message and our team will get back to you within 24 hours."
          />
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Email Us</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Direct support and general inquiries:
                </p>
                <a
                  href="mailto:support@presently.ai"
                  className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  support@presently.ai
                </a>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Discord Community</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Chat with other gift givers and our product engineering team:
                </p>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Join Presently Discord →
                </a>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Headquarters</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Presently AI Inc.
                  <br />
                  548 Market Street, Suite 900
                  <br />
                  San Francisco, CA 94104
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12 space-y-4"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                        Thank you for reaching out. A support concierge has received your request and will reply via email shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        type="button"
                        className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Alex Morgan"
                            {...register('name')}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder="alex@example.com"
                            {...register('email')}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                            Topic Category *
                          </label>
                          <select
                            {...register('category')}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                          >
                            <option value="">Select a topic...</option>
                            <option value="general">General Support</option>
                            <option value="technical">AI Survey Technical Question</option>
                            <option value="corporate">Corporate Concierge & Bulk Gifting</option>
                            <option value="press">Press & Media</option>
                          </select>
                          {formErrors.category && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            placeholder="How can we help?"
                            {...register('subject')}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                          />
                          {formErrors.subject && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.subject}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                          Message Details *
                        </label>
                        <textarea
                          rows={5}
                          placeholder="Tell us a little about what you need assistance with..."
                          {...register('message')}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                        />
                        {formErrors.message && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
