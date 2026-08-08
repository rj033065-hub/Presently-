'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Brain, Gift, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Take the Survey',
      shortDesc: 'Fill a 2-minute dynamic quiz about your recipient.',
      fullDesc: 'Answer quick questions covering recipient age, relationship, occasion, personality traits, hobbies, and budget bounds. Our smart survey adjusts questions on the fly.',
      icon: ClipboardList,
      highlight: '2 Mins Quiz',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      number: '02',
      title: 'AI Analysis',
      shortDesc: 'Multi-LLM reasoning engine matches parameters.',
      fullDesc: 'Our AI engine analyzes thousands of curated products, recipient sentiment, psychometrics, and community unboxing reviews to find high-affinity matches.',
      icon: Brain,
      highlight: 'Multi-LLM Intelligence',
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: '03',
      title: 'Receive Recommendations',
      shortDesc: 'Get ranked matches with clear AI match scores.',
      fullDesc: 'Browse top-ranked gift matches accompanied by step-by-step AI match rationales, price checks, and recipient delight probability scores.',
      icon: Gift,
      highlight: 'Ranked & Explained',
      color: 'from-rose-500 to-rose-600',
    },
    {
      number: '04',
      title: 'Save & Share',
      shortDesc: 'Organize into wishlists or buy with confidence.',
      fullDesc: 'Add items to personal wishlists, share collaborative group-gifting links with friends, or buy directly from verified retail partners with zero affiliate markups.',
      icon: Share2,
      highlight: 'Collaborative Wishlists',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-zinc-50/70 dark:bg-zinc-950/60 border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="FOUR SIMPLE STEPS"
          title="From Survey to Unboxing"
          highlight="In Minutes."
          description="How Presently removes decision fatigue and delivers memorable gifting experiences every time."
        />

        {/* Step Indicator Navigation Tabs */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <motion.button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(idx)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative text-left rounded-2xl p-6 transition-all duration-300 border ${
                  isSelected
                    ? 'border-indigo-500 bg-white dark:bg-zinc-900 shadow-xl scale-[1.02]'
                    : 'border-zinc-200/80 bg-white/60 dark:border-zinc-800/80 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900'
                }`}
              >
                {/* Step Number Tag */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-mono font-extrabold px-3 py-1 rounded-full text-white bg-gradient-to-r ${step.color}`}>
                    STEP {step.number}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                    {step.highlight}
                  </span>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.shortDesc}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Step Expanded Detail Showcase */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 rounded-2xl border border-indigo-200/60 bg-white p-6 sm:p-8 shadow-lg backdrop-blur-xl dark:border-indigo-900/60 dark:bg-zinc-900"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Step {steps[activeStep].number} Deep Dive</span>
              </div>
              <h4 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {steps[activeStep].title}
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {steps[activeStep].fullDesc}
              </p>
            </div>

            <div className="w-full md:w-auto flex-shrink-0">
              <a
                href="/survey"
                className="inline-flex items-center justify-center w-full md:w-auto rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-md"
              >
                <span>Try Step {steps[activeStep].number} Live</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
