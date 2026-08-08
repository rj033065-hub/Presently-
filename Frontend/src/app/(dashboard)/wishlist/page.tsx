'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Plus,
  Share2,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Tag,
  DollarSign,
  Copy,
  Globe,
  Lock,
  Star,
  ShoppingBag
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/spinner';
import {
  getWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addWishlistItem,
  updateWishlistItem,
  removeWishlistItem,
  generateWishlistShareToken,
  disableWishlistSharing,
  Wishlist,
  WishlistItem
} from '@/lib/dashboard-api';

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New wishlist dialog
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistDesc, setNewWishlistDesc] = useState('');
  const [newWishlistPublic, setNewWishlistPublic] = useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  async function loadWishlists() {
    try {
      setLoading(true);
      const lists = await getWishlists();
      setWishlists(lists);
      if (lists.length > 0 && !selectedWishlistId) {
        setSelectedWishlistId(lists[0].id);
      }
    } catch (err) {
      console.error('Failed to load wishlists:', err);
    } finally {
      setLoading(false);
    }
  }

  const selectedWishlist = wishlists.find((w) => w.id === selectedWishlistId) || wishlists[0];

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishlistName.trim()) return;
    try {
      const created = await createWishlist({
        name: newWishlistName,
        description: newWishlistDesc,
        is_public: newWishlistPublic,
      });
      setWishlists([created, ...wishlists]);
      setSelectedWishlistId(created.id);
      setNewWishlistName('');
      setNewWishlistDesc('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create wishlist:', err);
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;
    try {
      await deleteWishlist(id);
      const remaining = wishlists.filter((w) => w.id !== id);
      setWishlists(remaining);
      if (remaining.length > 0) {
        setSelectedWishlistId(remaining[0].id);
      } else {
        setSelectedWishlistId(null);
      }
    } catch (err) {
      console.error('Failed to delete wishlist:', err);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: any) => {
    if (!selectedWishlist) return;
    try {
      const updatedItem = await updateWishlistItem(selectedWishlist.id, itemId, { status: newStatus });
      setWishlists(
        wishlists.map((w) => {
          if (w.id === selectedWishlist.id) {
            return {
              ...w,
              items: w.items.map((i) => (i.id === itemId ? updatedItem : i)),
            };
          }
          return w;
        })
      );
    } catch (err) {
      console.error('Failed to update item status:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedWishlist) return;
    try {
      await removeWishlistItem(selectedWishlist.id, itemId);
      setWishlists(
        wishlists.map((w) => {
          if (w.id === selectedWishlist.id) {
            return {
              ...w,
              items: w.items.filter((i) => i.id !== itemId),
            };
          }
          return w;
        })
      );
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleShareWishlist = async () => {
    if (!selectedWishlist) return;
    try {
      const shareData = await generateWishlistShareToken(selectedWishlist.id);
      const fullUrl = `${window.location.origin}${shareData.share_url}`;
      setShareUrl(fullUrl);
      setShowShareModal(true);
      // update local state
      setWishlists(
        wishlists.map((w) => (w.id === selectedWishlist.id ? { ...w, is_public: true, share_token: shareData.share_token } : w))
      );
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Wishlists & Saved Gifts"
      subtitle="Organize, prioritize, and share your favorite gift ideas with friends and family."
      actionButton={
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Wishlist</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Wishlist Selector Tabs */}
        {wishlists.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {wishlists.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWishlistId(w.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedWishlist?.id === w.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${selectedWishlist?.id === w.id ? 'text-white' : 'text-rose-500'}`} />
                <span>{w.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[10px]">
                  {w.items?.length || 0}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-zinc-300 dark:border-zinc-800">
            <Heart className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No wishlists created yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Create your first wishlist to save gifts for birthdays, holidays, or personal inspiration.</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl"
            >
              Create First Wishlist
            </Button>
          </Card>
        )}

        {/* Selected Wishlist Content */}
        {selectedWishlist && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{selectedWishlist.name}</h2>
                  {selectedWishlist.is_public ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </span>
                  )}
                </div>
                {selectedWishlist.description && (
                  <p className="text-xs text-zinc-500 mt-1">{selectedWishlist.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleShareWishlist}
                  variant="outline"
                  className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Share Link</span>
                </Button>
                <Button
                  onClick={() => handleDeleteWishlist(selectedWishlist.id)}
                  variant="outline"
                  className="text-xs px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Wishlist Items List */}
            {selectedWishlist.items && selectedWishlist.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWishlist.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.gift_image_url ? (
                        <img src={item.gift_image_url} alt={item.gift_title || ''} className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          🎁
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold capitalize ${
                            item.priority === 'high'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : item.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {item.priority} priority
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-zinc-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                          {item.gift_title || 'Saved Gift Item'}
                        </h4>
                        {item.gift_price && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            ${item.gift_price}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-zinc-500 italic mt-1 line-clamp-2">"{item.notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Status Toggle Bar */}
                    <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800 flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateItemStatus(item.id, e.target.value)}
                        className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                      >
                        <option value="considering">Considering</option>
                        <option value="planned">Planned</option>
                        <option value="reserved">Reserved</option>
                        <option value="purchased">Purchased ✅</option>
                      </select>

                      {item.buy_url && (
                        <a href={item.buy_url} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <span>Buy</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-dashed border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">This wishlist is empty</p>
                <p className="text-xs text-zinc-500 mt-1">Browse AI recommendations or community posts to add gifts here.</p>
                <Link href="/survey" className="inline-block mt-3">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-xl">
                    Find Gifts with AI
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Create Wishlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-zinc-900 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create New Wishlist</h3>
            <form onSubmit={handleCreateWishlist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Wishlist Name</label>
                <Input
                  placeholder="e.g. Birthday Wishlist 2026"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Description (Optional)</label>
                <Input
                  placeholder="e.g. Gift ideas for my upcoming milestone birthday"
                  value={newWishlistDesc}
                  onChange={(e) => setNewWishlistDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publicCheck"
                  checked={newWishlistPublic}
                  onChange={(e) => setNewWishlistPublic(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="publicCheck" className="text-xs text-zinc-700 dark:text-zinc-300">
                  Make this wishlist public & shareable
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                  Create Wishlist
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Share Wishlist Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-zinc-900 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-600">
              <Share2 className="w-5 h-5" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Share Wishlist</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Anyone with this link will be able to view items in this wishlist without seeing your private details.
            </p>

            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="text-xs font-mono bg-zinc-50 dark:bg-zinc-800" />
              <Button onClick={handleCopyShareUrl} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3">
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button variant="outline" onClick={() => setShowShareModal(false)} className="text-xs">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
