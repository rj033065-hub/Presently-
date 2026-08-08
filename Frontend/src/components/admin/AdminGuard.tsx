'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        if (isMounted) {
          setIsAuthorized(false);
          router.push('/login?redirect_url=/admin');
        }
        return;
      }

      try {
        const res = await apiClient.get('/users/me');
        const role = res.data.role;
        
        if (isMounted) {
          if (role === 'admin' || role === 'super_admin' || role === 'moderator') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            router.push('/unauthorized');
          }
        }
      } catch (err) {
        console.error('Failed to verify admin status', err);
        if (isMounted) {
          setIsAuthorized(false);
          router.push('/unauthorized');
        }
      }
    }

    checkAdminAccess();

    // Fallback timer if authentication takes longer than 2.5 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted && isAuthorized === null) {
        setIsAuthorized(false);
        router.push('/login?redirect_url=/admin');
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isAuthorized === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
