'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Gift, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/ui/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { getPublicWishlist, Wishlist } from '@/lib/dashboard-api';

export default function PublicWishlistPage() {
  const params = useParams();
  const token = params?.token as string;
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublic() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getPublicWishlist(token);
        setWishlist(res);
      } catch (err: any) {
        console.error('Failed to load public wishlist:', err);
        setError('This wishlist is private or no longer available.');
      } finally {
        setLoading(false);
      }
    }
    loadPublic();
  }, [token]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (error || !wishlist) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
          <Heart className="w-12 h-12 text-zinc-400 mx-auto" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Wishlist Not Found</h1>
          <p className="text-sm text-zinc-500">{error || 'This wishlist could not be accessed.'}</p>
          <Link href="/">
            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
              Go to Presently Home
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60 py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-8">
          {/* Shared Wishlist Header Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
              <Globe className="w-3.5 h-3.5" />
              <span>Shared Wishlist</span>
            </div>
            <h1 className="text-3xl font-extrabold">{wishlist.name}</h1>
            {wishlist.description && <p className="text-sm text-zinc-300 mt-2">{wishlist.description}</p>}
          </div>

          {/* Items Grid */}
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              <span>Wishlist Items ({wishlist.items?.length || 0})</span>
            </h2>

            {wishlist.items && wishlist.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.items.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-start gap-3">
                      {item.gift_image_url ? (
                        <img src={item.gift_image_url} alt={item.gift_title || ''} className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          🎁
                        </div>
                      )}

                      <div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold capitalize ${
                          item.status === 'purchased'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'reserved'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {item.status}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{item.gift_title || 'Gift Item'}</h3>
                        {item.gift_price && <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">${item.gift_price}</p>}
                        {item.notes && <p className="text-xs text-zinc-500 italic mt-1 font-normal">"{item.notes}"</p>}
                      </div>
                    </div>

                    {item.buy_url && (
                      <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800 flex justify-end">
                        <a href={item.buy_url} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <span>Buy Gift</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-6">No items currently in this wishlist.</p>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
