'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { PageLayout } from '@/components/ui/layout';

export default function RegisterPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="mt-1 text-sm text-zinc-500">Get started with AI-powered gift recommendations</p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0 w-full',
              },
            }}
            path="/register"
            routing="path"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </PageLayout>
  );
}
