import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-extrabold text-rose-500">403</h1>
        <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-zinc-500">
          You do not have the required permissions to view this resource.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
