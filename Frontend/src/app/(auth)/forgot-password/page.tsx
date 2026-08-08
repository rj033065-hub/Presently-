'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout } from '@/components/ui/layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // In production, Clerk handles reset code requests
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Enter your email address and we'll send you a password reset link.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <p>Check your email inbox for password reset instructions.</p>
              <Link href="/login" className="mt-4 inline-block font-medium underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  className="mt-1"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              </Button>

              <div className="mt-4 text-center text-xs text-zinc-500">
                Remember your password?{' '}
                <Link href="/login" className="font-medium underline text-zinc-900 dark:text-zinc-100">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
