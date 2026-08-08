'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';
import { recordShare } from '@/lib/community-api';
import { Button } from '@/components/ui/button';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  title: string;
}

export function ShareDialog({ isOpen, onClose, postId, title }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/community/posts/${postId}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      recordShare(postId).catch(() => {});
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    recordShare(postId).catch(() => {});
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(`Check out this gift story on Presently: "${title}"`);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this unboxing story on Presently: ${title}`,
          url: postUrl,
        });
        recordShare(postId).catch(() => {});
      } catch (e) {
        // Share cancelled
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-lg">
            <Share2 className="w-5 h-5 text-indigo-500" />
            <span>Share Gift Story</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Spread inspiration with friends, family, or social channels.
        </p>

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <button
            onClick={() => shareToSocial('twitter')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-zinc-800 dark:text-zinc-200 hover:text-sky-500 transition-all text-xs font-semibold"
          >
            <span className="text-base font-bold">𝕏</span>
            <span>X / Twitter</span>
          </button>
          <button
            onClick={() => shareToSocial('whatsapp')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-800 dark:text-zinc-200 hover:text-emerald-500 transition-all text-xs font-semibold"
          >
            <Send className="w-5 h-5 text-emerald-500" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => shareToSocial('facebook')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-800 dark:text-zinc-200 hover:text-blue-500 transition-all text-xs font-semibold"
          >
            <span className="text-base font-bold text-blue-600">f</span>
            <span>Facebook</span>
          </button>
          <button
            onClick={() => shareToSocial('linkedin')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 transition-all text-xs font-semibold"
          >
            <span className="text-base font-bold text-indigo-600">in</span>
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Copy Story Link
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
            <input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 px-2 text-xs font-mono bg-transparent text-zinc-700 dark:text-zinc-300 outline-none truncate"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Native Share Fallback */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="w-full rounded-2xl text-xs gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>More Sharing Options</span>
          </Button>
        )}
      </div>
    </div>
  );
}
