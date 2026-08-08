'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Database, CheckCircle2 } from 'lucide-react';

const PHASES = [
  { text: 'Parsing recipient psychometrics & lifestyle traits...', icon: Sparkles, color: 'text-amber-500' },
  { text: 'Querying catalog database for price & category matches...', icon: Database, color: 'text-indigo-500' },
  { text: 'Synthesizing OpenAI GPT-4o sentiment reasoning...', icon: Cpu, color: 'text-rose-500' },
  { text: 'Calculating match scores (0–100) & personalization tips...', icon: CheckCircle2, color: 'text-emerald-500' },
];

export function AIThinkingAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PHASES[phaseIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6">
      {/* Pulse Outer Ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 blur-lg opacity-40"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CurrentIcon className={`h-8 w-8 ${PHASES[phaseIndex].color} animate-pulse`} />
        </div>
      </div>

      {/* Dynamic Animated Status Line */}
      <div className="min-h-[50px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5"
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Generating Personalized Gift Matches
            </h3>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {PHASES[phaseIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Line */}
      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 rounded-full"
          animate={{ width: ['10%', '45%', '80%', '98%'] }}
          transition={{ duration: 8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-[11px] text-zinc-400 font-mono">
        Average generation time: 10 - 25 seconds
      </p>
    </div>
  );
}
