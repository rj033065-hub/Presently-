'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Sparkles,
  ClipboardList,
  Bookmark,
  Heart,
  CalendarCheck,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  Gift,
  Bell
} from 'lucide-react';
import { PageLayout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Find a Gift', href: '/survey', icon: Sparkles, badge: 'AI' },
  { name: 'Survey History', href: '/dashboard/surveys', icon: ClipboardList },
  { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: Gift },
  { name: 'Wishlists', href: '/wishlist', icon: Heart },
  { name: 'Saved Content', href: '/dashboard/saved', icon: Bookmark },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Gift Planner', href: '/dashboard/planner', icon: CalendarCheck },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export function DashboardLayout({
  children,
  title,
  subtitle,
  actionButton,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userAvatar = user?.imageUrl || '/avatar-placeholder.png';
  const userName = user?.fullName || user?.firstName || 'Gifter';
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <PageLayout>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              {/* User Mini Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover border border-indigo-500/20"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {userName}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Navigation Card */}
              <nav className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-1">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Workspace
                </div>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* Mobile Header Toggle */}
            <div className="lg:hidden col-span-1 flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{userName}</span>
              </div>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
              <div className="lg:hidden col-span-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Main Content Area */}
            <main className="col-span-1 lg:col-span-9 space-y-6">
              {(title || actionButton) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    {title && <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>}
                    {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
                  </div>
                  {actionButton && <div>{actionButton}</div>}
                </div>
              )}

              {children}
            </main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
