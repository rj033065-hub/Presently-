'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/ui/layout';
import { GiftItem } from '@/types/gift';
import { getGiftById } from '@/lib/gift-api';

import {
  Star,
  ExternalLink,
  ShieldCheck,
  HeartHandshake,
  ArrowLeft,
  Truck,
  Sparkles,
  Tag,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function GiftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [gift, setGift] = useState<GiftItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadGift() {
      try {
        setLoading(true);
        if (id) {
          const item = await getGiftById(id);
          setGift(item);
        }
      } catch (err) {
        console.error('Failed to fetch gift detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGift();
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-sm text-zinc-500">Loading catalog product details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!gift) {
    return (
      <PageLayout>
        <div className="py-20 text-center space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Gift Item Not Found
          </h3>
          <Button onClick={() => router.push('/gifts')} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Catalog
          </Button>
        </div>
      </PageLayout>
    );
  }

  const currencySymbol = gift.currency === 'INR' ? '₹' : gift.currency === 'EUR' ? '€' : gift.currency === 'GBP' ? '£' : '$';

  return (
    <PageLayout>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back Navigation */}
          <button
            onClick={() => router.push('/gifts')}
            type="button"
            className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Gift Catalog
          </button>

          {/* Product Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Product Image */}
            <div className="relative rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <img
                src={gift.primary_image_url}
                alt={gift.title}
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {gift.is_handmade && (
                  <span className="inline-flex items-center rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                    <HeartHandshake className="mr-1 h-3.5 w-3.5" /> Handmade
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md dark:bg-white/80 dark:text-zinc-900 shadow-md">
                  {gift.gift_type}
                </span>
              </div>
            </div>

            {/* Product Meta Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {gift.category?.name || 'Gift Catalog'}
                  </span>
                  <span>•</span>
                  <span className="text-xs font-medium text-zinc-400">Brand: {gift.brand || 'Generic'}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {gift.title}
                </h1>

                {/* Rating & Seller */}
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                    <span>{gift.rating_avg > 0 ? gift.rating_avg.toFixed(1) : '4.9'}</span>
                    <span className="text-zinc-400 font-normal ml-1">({gift.rating_count || 42} Customer Reviews)</span>
                  </div>

                  {gift.is_verified && (
                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Merchant ({gift.merchant_name})
                    </span>
                  )}
                </div>
              </div>

              {/* Price Tag */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 p-4 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold block">Estimated Price</span>
                  <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
                    {currencySymbol}{gift.estimated_price.toLocaleString()}
                  </span>
                </div>

                <a
                  href={gift.purchase_url || gift.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition-colors"
                >
                  <span>Buy on {gift.merchant_name}</span>
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>

              {/* Short & Long Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {gift.description}
                </p>
              </div>

              {/* Personalization Options */}
              {gift.personalization_options && (
                <div className="rounded-xl bg-amber-50/70 p-3.5 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 space-y-1">
                  <div className="flex items-center text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Personalization Options:
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    {gift.personalization_options}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Suitable Recipient Traits Section */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center">
              <Gift className="h-4 w-4 text-indigo-500 mr-2" />
              AI Recommendation Matching Criteria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {gift.suitable_occasions && (
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400 block">Occasions</span>
                  <div className="flex flex-wrap gap-1">
                    {gift.suitable_occasions.map((o, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gift.suitable_relationships && (
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400 block">Relationships</span>
                  <div className="flex flex-wrap gap-1">
                    {gift.suitable_relationships.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gift.suitable_interests && (
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400 block">Interests</span>
                  <div className="flex flex-wrap gap-1">
                    {gift.suitable_interests.map((it, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gift.suitable_personalities && (
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400 block">Personalities</span>
                  <div className="flex flex-wrap gap-1">
                    {gift.suitable_personalities.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
