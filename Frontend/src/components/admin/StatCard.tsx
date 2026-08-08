'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  colorTheme?: 'indigo' | 'rose' | 'amber' | 'emerald' | 'zinc';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendType = 'positive',
  colorTheme = 'indigo',
}: StatCardProps) {
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'zinc':
        return 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${getThemeStyles()}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>

      {trend && (
        <div className="pt-2 border-t border-zinc-800/80 flex items-center text-[11px] font-semibold">
          <span
            className={
              trendType === 'positive'
                ? 'text-emerald-400'
                : trendType === 'negative'
                ? 'text-rose-400'
                : 'text-zinc-400'
            }
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
