'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'role' | 'user_status' | 'report_status' | 'post_status';
}

export function StatusBadge({ status, type = 'user_status' }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();

    if (type === 'role') {
      if (s === 'super_admin') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      if (s === 'admin') return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      if (s === 'moderator') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }

    if (type === 'user_status') {
      if (s === 'active' || status === 'true' || status === 'Active')
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }

    if (type === 'report_status') {
      if (s === 'pending') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      if (s === 'actioned') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }

    if (type === 'post_status') {
      if (s === 'published' || status === 'true') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }

    return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getBadgeStyle()}`}>
      {status}
    </span>
  );
}
