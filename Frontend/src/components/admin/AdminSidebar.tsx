'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Users,
  Gift,
  FolderTree,
  Tags,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Bell,
  Activity,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Gift Catalog', href: '/admin/gifts', icon: Gift },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Tags', href: '/admin/tags', icon: Tags },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'Reports Queue', href: '/admin/reports', icon: ShieldAlert },
  { name: 'AI Telemetry', href: '/admin/recommendations', icon: Sparkles },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">Presently</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Management
          </div>
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Shortcuts */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-zinc-500" />
          <span>Back to Main Website</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
