'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
      aria-label={`Toggle theme. Current theme is ${theme}`}
      title={`Theme: ${theme ?? 'system'}`}
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500 transition-transform hover:rotate-45" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:-rotate-12" />}
      {theme === 'system' && <Monitor className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
    </button>
  );
}
