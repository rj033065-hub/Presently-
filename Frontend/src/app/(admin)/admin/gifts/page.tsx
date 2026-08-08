'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle, RefreshCw, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { apiClient } from '@/lib/api-client';

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: 'Generic',
    category_id: '',
    estimated_price: 50,
    currency: 'USD',
    primary_image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800',
    affiliate_url: 'https://amazon.com',
    description: '',
    is_verified: true,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, giftId: '', title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/gifts', {
        params: {
          query: search || undefined,
          category_id: selectedCat || undefined,
        },
      });
      setGifts(res.data.gifts);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch admin gifts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [selectedCat]);

  const handleOpenCreate = () => {
    setEditingGift(null);
    setFormData({
      title: '',
      brand: 'Generic',
      category_id: categories.length > 0 ? categories[0].id : '',
      estimated_price: 50,
      currency: 'USD',
      primary_image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800',
      affiliate_url: 'https://amazon.com',
      description: '',
      is_verified: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (gift: any) => {
    setEditingGift(gift);
    setFormData({
      title: gift.title,
      brand: gift.brand,
      category_id: categories.find((c) => c.name === gift.category_name)?.id || '',
      estimated_price: gift.estimated_price,
      currency: gift.currency,
      primary_image_url: gift.primary_image_url,
      affiliate_url: 'https://amazon.com',
      description: gift.title,
      is_verified: gift.is_verified,
    });
    setShowModal(true);
  };

  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingGift) {
        await apiClient.put(`/admin/gifts/${editingGift.id}`, formData);
      } else {
        await apiClient.post('/admin/gifts', formData);
      }
      setShowModal(false);
      fetchGifts();
    } catch (err) {
      console.error('Failed to save gift item', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/gifts/${deleteConfirm.giftId}`);
      fetchGifts();
    } catch (err) {
      console.error('Failed to delete gift item', err);
    } finally {
      setActionLoading(false);
      setDeleteConfirm({ ...deleteConfirm, isOpen: false });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gift Catalog Management</h1>
            <p className="text-xs text-zinc-400 mt-1">Add, update, verify, or soft-delete gift items in the catalog.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Gift</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchGifts();
            }}
            className="relative w-full sm:w-80"
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search catalog title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2 text-xs font-medium text-white shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </form>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No gifts found in catalog.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Verified</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {gifts.map((g) => (
                    <tr key={g.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={g.primary_image_url}
                            alt={g.title}
                            className="h-10 w-10 rounded-xl object-cover border border-zinc-800"
                          />
                          <div>
                            <div className="font-bold text-white max-w-xs truncate">{g.title}</div>
                            <div className="text-[11px] text-zinc-500">{g.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300">{g.category_name || 'Uncategorized'}</td>
                      <td className="p-4 font-bold text-white">
                        {g.currency} {g.estimated_price.toFixed(2)}
                      </td>
                      <td className="p-4">
                        {g.is_verified ? (
                          <span className="inline-flex items-center text-emerald-400 font-bold gap-1 text-[11px]">
                            <CheckCircle className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-indigo-400 hover:bg-indigo-950/40"
                          title="Edit Gift"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, giftId: g.id, title: g.title })}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-rose-400 hover:bg-rose-950/40"
                          title="Delete Gift"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingGift ? 'Edit Gift Item' : 'Create Gift Item'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGift} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Estimated Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.estimated_price}
                    onChange={(e) => setFormData({ ...formData, estimated_price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Primary Image URL</label>
                <input
                  type="text"
                  required
                  value={formData.primary_image_url}
                  onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500"
                >
                  {actionLoading ? 'Saving...' : 'Save Gift Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Gift Item"
        description={`Are you sure you want to soft-delete "${deleteConfirm.title}" from the catalog?`}
        confirmText="Delete Gift"
        isDangerous={true}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
