'use client';

import React from 'react';

interface FunnelStep {
  stage: string;
  count: number;
  conversion_pct: number;
}

interface AnalyticsFunnelChartProps {
  title: string;
  steps: FunnelStep[];
}

export function AnalyticsFunnelChart({ title, steps }: AnalyticsFunnelChartProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <h3 className="text-sm font-bold text-white">{title}</h3>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const widthPct = Math.max(15, step.conversion_pct);
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-300">{step.stage}</span>
                <span className="text-zinc-400">
                  <span className="text-white font-bold">{step.count.toLocaleString()}</span> ({step.conversion_pct}%)
                </span>
              </div>

              <div className="h-3.5 w-full rounded-xl bg-zinc-950 overflow-hidden border border-zinc-800 p-0.5">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
