import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-extrabold text-indigo-500">401</h1>
        <h2 className="mt-4 text-2xl font-bold">Authentication Required</h2>
        <p className="mt-2 text-sm text-zinc-500">
          You must be signed in to access this page.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/login">
            <Button>Sign In Now</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
