'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSession } from '@/components/AppSessionContext';
import type { UserRole } from '@/lib/types/user';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function navItems(role: UserRole): NavItem[] {
  if (role === 'END_USER') {
    return [
      { href: '/dashboard', label: 'Overview', icon: <HomeIcon /> },
      { href: '/dashboard/tickets', label: 'My Tickets', icon: <TicketIcon /> },
      { href: '/dashboard/profile', label: 'Profile', icon: <UserIcon /> },
    ];
  }
  if (role === 'STAFF') {
    return [
      { href: '/staff', label: 'Overview', icon: <HomeIcon /> },
      { href: '/staff/tickets', label: 'Tickets', icon: <TicketIcon /> },
      { href: '/staff/profile', label: 'Profile', icon: <UserIcon /> },
    ];
  }
  // ADMIN
  return [
    { href: '/admin', label: 'Dashboard', icon: <HomeIcon /> },
    { href: '/admin/queue', label: 'Queue', icon: <QueueIcon /> },
    { href: '/admin/tickets', label: 'Tickets', icon: <TicketIcon /> },
    { href: '/admin/users', label: 'Users', icon: <UsersIcon /> },
  ];
}

const roleLabel: Record<UserRole, string> = {
  END_USER: 'Player',
  STAFF: 'Staff',
  ADMIN: 'Admin',
};

const roleRoot: Record<UserRole, string> = {
  END_USER: '/dashboard',
  STAFF: '/staff',
  ADMIN: '/admin',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { role, displayName, isLoading } = useAppSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if user lands on a section they don't belong to
  useEffect(() => {
    if (isLoading || !role) return;
    const root = roleRoot[role];
    if (!pathname.startsWith(root)) {
      router.replace(root);
    }
  }, [role, isLoading, pathname, router]);

  const effectiveRole: UserRole = role ?? 'END_USER';
  const items = navItems(effectiveRole);


  const handleSignOut = async () => {
    const res = await fetch('/api/auth/signout', { method: 'POST' });
    const { logoutUrl } = await res.json();
    // Clear sessionStorage then redirect to WSO2 logout which clears the SSO session
    sessionStorage.clear();
    window.location.href = logoutUrl;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-700/60">
        <Link href="/" className="text-xl font-black tracking-tighter text-white">
          AXIO<span className="text-blue-400">M</span>
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">Support Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/staff' && item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/60',
              ].join(' ')}
            >
              <span className="w-5 h-5 shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/60">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-slate-200 truncate">
            {displayName ?? '—'}
          </p>
          <p className="text-xs text-slate-500">{roleLabel[effectiveRole]}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-300 hover:bg-red-300/10 transition-colors"
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-bg-base">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-700/60">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700/60 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-900/90 backdrop-blur border-b border-slate-700/60">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-black tracking-tighter text-white">
            AXIO<span className="text-blue-400">M</span>
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Icon components
function HomeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
