'use client';

import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { SectionTitle } from '@/components/landing/SectionTitle';
import { Cookie, Settings, CheckCircle2 } from 'lucide-react';

export default function CookiesPage() {
  const cookieTypes = [
    {
      type: 'Essential Cookies',
      purpose: 'Required for core website security, Clerk session authentication, and theme persistence.',
      status: 'Always Active',
    },
    {
      type: 'Functional Cookies',
      purpose: 'Remembers your temporary survey progress so you do not lose answers if refreshed.',
      status: 'Active by Default',
    },
    {
      type: 'Analytics & Performance',
      purpose: 'Helps us measure page load speeds and identify navigation bottlenecks anonymously.',
      status: 'Optional',
    },
  ];

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          badge="COOKIES & STORAGE"
          title="Cookies Policy"
          description="Last updated: August 7, 2026. How we use cookies to provide a fluid user experience."
        />

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <Cookie className="h-5 w-5 text-amber-500 mr-2" />
              What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit websites. They help us remember your preferences (like light or dark theme mode) and authenticate your user session securely.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <Settings className="h-5 w-5 text-indigo-500 mr-2" />
              Cookies We Use
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {cookieTypes.map((c) => (
                <div
                  key={c.type}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">{c.type}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.purpose}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0 self-start sm:self-auto">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Managing Your Cookie Preferences
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You can control or disable cookies through your web browser settings. Note that disabling essential cookies may impact Clerk sign-in functionality and survey state memory.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
