'use client';

import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsAreaChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  colorHex?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function AnalyticsAreaChart({
  title,
  subtitle,
  data,
  colorHex = '#6366f1',
  valuePrefix = '',
  valueSuffix = '',
}: AnalyticsAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-xs text-zinc-500">
        No chart data available.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 600;
  const height = 200;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (d.value / maxValue) * (height - 2 * padding);
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#27272a" strokeDasharray="4 4" />
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#27272a"
            strokeDasharray="4 4"
          />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#3f3f46" />

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${title.replace(/\s+/g, '-')})`} />

          {/* Line path */}
          <path d={pathD} fill="none" stroke={colorHex} strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="4" fill={colorHex} className="transition-all group-hover:r-6" />
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fill="#71717a"
                className="text-[10px] font-medium"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
