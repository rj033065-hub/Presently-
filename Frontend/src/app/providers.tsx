'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ui/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const envKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsucHJlc2VudGx5LmFpJA';
  const isDemoKey = envKey.includes('PASTE_') || envKey.includes('placeholder') || envKey.includes('Y2xlcmsucHJlc2VudGx5LmFpJA');

  return (
    <ClerkProvider publishableKey={envKey}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {isDemoKey && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs text-amber-600 dark:text-amber-400 font-medium z-50 relative">
            ⚠️ <strong>Clerk Setup Notice:</strong> Replace <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code>Frontend/.env.local</code> with your real key from <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="underline font-bold">dashboard.clerk.com</a> to enable sign in.
          </div>
        )}
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
