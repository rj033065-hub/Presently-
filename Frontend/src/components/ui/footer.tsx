'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Sparkles, Twitter, Github, Linkedin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { APP_NAME, FOOTER_NAV_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 text-white shadow-md">
                <Gift className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {APP_NAME}
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <Sparkles className="mr-1 h-3 w-3" /> AI Concierge
              </span>
            </Link>
            <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The modern AI gift recommendation platform. Discover thoughtful, tailored gift ideas backed by advanced LLM sentiment reasoning and real community reviews.
            </p>

            {/* System Operational Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>All AI Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Product
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV_LINKS.product.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Company
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV_LINKS.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV_LINKS.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Divider & Socials */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-zinc-200/80 pt-8 dark:border-zinc-800/80 sm:flex-row space-y-4 sm:space-y-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            © {new Date().getFullYear()} {APP_NAME} Inc. All rights reserved. Crafting memorable moments with artificial intelligence.
          </p>

          <div className="flex items-center space-x-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
              aria-label="Twitter / X"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
              aria-label="Discord"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
