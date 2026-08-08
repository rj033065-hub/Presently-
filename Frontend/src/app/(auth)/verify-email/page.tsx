import React from 'react';
import { PageLayout } from '@/components/ui/layout';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            ✉️
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Verify Your Email</h1>
          <p className="mt-2 text-sm text-zinc-500">
            We've sent a verification code to your email address. Please check your inbox and verify your account.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button className="w-full">Continue to Sign In</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
