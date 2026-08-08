'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { PageLayout } from '@/components/ui/layout';

export default function LoginPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-1 text-sm text-zinc-500">Sign in to your Presently account</p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0 w-full',
              },
            }}
            path="/login"
            routing="path"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </PageLayout>
  );
}
