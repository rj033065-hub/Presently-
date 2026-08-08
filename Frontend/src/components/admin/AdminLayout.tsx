'use client';

import React from 'react';
import { AdminGuard } from './AdminGuard';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8 bg-zinc-950 overflow-y-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
