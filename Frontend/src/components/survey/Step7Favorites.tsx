'use client';

import React, { useState } from 'react';
import { FavoritesData } from '@/types/survey';
import { Heart, Plus, X, Sparkles } from 'lucide-react';

interface Step7FavoritesProps {
  data: FavoritesData;
  onChange: (updated: FavoritesData) => void;
}

export function Step7Favorites({ data, onChange }: Step7FavoritesProps) {
  const [activeCategory, setActiveCategory] = useState<keyof FavoritesData>('brands');
  const [inputVal, setInputVal] = useState('');

  const categories: { key: keyof FavoritesData; label: string; placeholder: string }[] = [
    { key: 'brands', label: 'Favorite Brands', placeholder: 'e.g. Apple, Nike, Fellow, Sony' },
    { key: 'colors', label: 'Favorite Colors', placeholder: 'e.g. Sage Green, Obsidian, Rose Gold' },
    { key: 'foods', label: 'Favorite Foods / Treats', placeholder: 'e.g. Dark Chocolate, Italian Pastas, Tacos' },
    { key: 'drinks', label: 'Favorite Drinks', placeholder: 'e.g. Espresso, Matcha, Craft IPA, Pinot Noir' },
    { key: 'movies', label: 'Favorite Movies', placeholder: 'e.g. Interstellar, Studio Ghibli, Inception' },
    { key: 'music', label: 'Favorite Music / Artists', placeholder: 'e.g. Indie Rock, Jazz Vinyl, Taylor Swift' },
    { key: 'games', label: 'Favorite Games', placeholder: 'e.g. Zelda, Catan, Chess, Cyberpunk' },
    { key: 'hobbies', label: 'Favorite Hobbies', placeholder: 'e.g. Pottery, Bouldering, Plant care' },
    { key: 'animals', label: 'Favorite Animals', placeholder: 'e.g. Golden Retrievers, Cats, Owls' },
    { key: 'flowers', label: 'Favorite Flowers', placeholder: 'e.g. Peonies, Sunflowers, Orchids' },
    { key: 'tv_shows', label: 'Favorite TV Shows', placeholder: 'e.g. Succession, Ted Lasso, Friends' },
    { key: 'celebrities', label: 'Favorite Celebrities (Optional)', placeholder: 'e.g. Pedro Pascal, Zendaya' },
  ];

  const currentCategory = categories.find((c) => c.key === activeCategory) || categories[0];
  const currentItems = data[activeCategory] || [];

  const addItem = () => {
    if (!inputVal.trim()) return;
    const trimmed = inputVal.trim();
    if (!currentItems.includes(trimmed)) {
      onChange({
        ...data,
        [activeCategory]: [...currentItems, trimmed],
      });
    }
    setInputVal('');
  };

  const removeItem = (itemToRemove: string) => {
    onChange({
      ...data,
      [activeCategory]: currentItems.filter((i) => i !== itemToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          What are their favorite things?
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Specific brands, colors, treats, and media give the AI ultra-fine matching precision.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const count = (data[c.key] || []).length;
          const isActive = activeCategory === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActiveCategory(c.key);
                setInputVal('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              <span>{c.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-indigo-800 text-white' : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Input Box for Selected Category */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4 max-w-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Add {currentCategory.label}
          </label>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={currentCategory.placeholder}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Add</span>
          </button>
        </div>

        {/* Existing Items Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="ml-1.5 text-indigo-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-zinc-400 italic">No items added yet for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
