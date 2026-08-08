'use client';

import React from 'react';
import { BudgetData, CurrencyCode } from '@/types/survey';
import { DollarSign, Tag, ShieldCheck } from 'lucide-react';

interface Step4BudgetProps {
  data: BudgetData;
  onChange: (updated: BudgetData) => void;
}

export function Step4Budget({ data, onChange }: Step4BudgetProps) {
  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'USD', label: 'USD ($)', symbol: '$' },
    { code: 'INR', label: 'INR (₹)', symbol: '₹' },
    { code: 'EUR', label: 'EUR (€)', symbol: '€' },
    { code: 'GBP', label: 'GBP (£)', symbol: '£' },
    { code: 'CAD', label: 'CAD ($)', symbol: '$' },
    { code: 'AUD', label: 'AUD ($)', symbol: '$' },
  ];

  const currentSymbol = currencies.find((c) => c.code === data.currency)?.symbol || '$';

  const presetsByCurrency: Record<CurrencyCode, { label: string; min: number; max: number }[]> = {
    USD: [
      { label: 'Budget ($15 – $50)', min: 15, max: 50 },
      { label: 'Sweet Spot ($50 – $150)', min: 50, max: 150 },
      { label: 'Premium ($150 – $500)', min: 150, max: 500 },
      { label: 'Luxury ($500+)', min: 500, max: 2000 },
    ],
    INR: [
      { label: 'Budget (₹1,000 – ₹5,000)', min: 1000, max: 5000 },
      { label: 'Sweet Spot (₹5,000 – ₹15,000)', min: 5000, max: 15000 },
      { label: 'Premium (₹15,000 – ₹50,000)', min: 15000, max: 50000 },
      { label: 'Luxury (₹50,000+)', min: 50000, max: 200000 },
    ],
    EUR: [
      { label: 'Budget (€15 – €50)', min: 15, max: 50 },
      { label: 'Sweet Spot (€50 – €150)', min: 50, max: 150 },
      { label: 'Premium (€150 – €500)', min: 150, max: 500 },
      { label: 'Luxury (€500+)', min: 500, max: 2000 },
    ],
    GBP: [
      { label: 'Budget (£15 – £50)', min: 15, max: 50 },
      { label: 'Sweet Spot (£50 – £150)', min: 50, max: 150 },
      { label: 'Premium (£150 – £500)', min: 150, max: 500 },
      { label: 'Luxury (£500+)', min: 500, max: 2000 },
    ],
    CAD: [
      { label: 'Budget ($20 – $75)', min: 20, max: 75 },
      { label: 'Sweet Spot ($75 – $200)', min: 75, max: 200 },
      { label: 'Premium ($200 – $600)', min: 200, max: 600 },
      { label: 'Luxury ($600+)', min: 600, max: 2500 },
    ],
    AUD: [
      { label: 'Budget ($20 – $75)', min: 20, max: 75 },
      { label: 'Sweet Spot ($75 – $200)', min: 75, max: 200 },
      { label: 'Premium ($200 – $600)', min: 200, max: 600 },
      { label: 'Luxury ($600+)', min: 600, max: 2500 },
    ],
  };

  const currentPresets = presetsByCurrency[data.currency] || presetsByCurrency.USD;

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    const defaultPresets = presetsByCurrency[newCurrency] || presetsByCurrency.USD;
    onChange({
      ...data,
      currency: newCurrency,
      min: defaultPresets[1].min,
      max: defaultPresets[1].max,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
          What is your target budget range?
        </h3>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Strict price guardrails ensure all recommended gifts fall within your comfortable range.
        </p>
      </div>

      {/* Currency Selector Bar */}
      <div className="flex items-center space-x-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Select Currency:
        </label>
        <div className="flex flex-wrap gap-2">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCurrencyChange(c.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                data.currency === c.code
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Budget Chips */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2.5">
          Preset Budget Windows
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentPresets.map((preset) => {
            const isSelected =
              data.min === preset.min && data.max === preset.max && !data.is_custom;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange({
                    ...data,
                    min: preset.min,
                    max: preset.max,
                    is_custom: false,
                  })
                }
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-500/40 shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                <span className="flex items-center">
                  <Tag className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                  {preset.label}
                </span>
                {isSelected && (
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Budget Slider & Number Inputs */}
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Custom Budget Range
          </span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {currentSymbol}{data.min.toLocaleString()} – {currentSymbol}{data.max.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Minimum Price ({currentSymbol})
            </label>
            <input
              type="number"
              min={0}
              value={data.min}
              onChange={(e) =>
                onChange({
                  ...data,
                  min: Math.max(0, parseFloat(e.target.value) || 0),
                  is_custom: true,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Maximum Price ({currentSymbol})
            </label>
            <input
              type="number"
              min={data.min}
              value={data.max}
              onChange={(e) =>
                onChange({
                  ...data,
                  max: Math.max(data.min, parseFloat(e.target.value) || 0),
                  is_custom: true,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center text-xs text-zinc-500 pt-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500 mr-1.5 flex-shrink-0" />
          <span>Zero affiliate price markups guaranteed.</span>
        </div>
      </div>
    </div>
  );
}
