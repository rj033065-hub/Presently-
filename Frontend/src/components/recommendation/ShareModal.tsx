'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, X, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out these AI personalized gift recommendations on Presently: ${shareUrl}`
  )}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    'AI Gift Recommendations from Presently'
  )}&body=${encodeURIComponent(
    `I generated personalized gift recommendations on Presently! Take a look: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Share2 className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Share Recommendation Link
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Anyone with this link can view these AI-curated gift recommendations.
          </p>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Public Share Link
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-mono text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-4"
              type="button"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Social Share Shortcuts */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Quick Share Options
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <a
              href={emailUrl}
              className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-zinc-500" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
