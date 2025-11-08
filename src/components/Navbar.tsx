'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only check authentication on client side after hydration
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Don't render until we know if user is authenticated (prevents hydration mismatch)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left - Brand */}
          <div className="flex shrink-0 items-center gap-2">
            <svg
              className="h-6 w-6 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5 5 0 10-9.78 2.096A4 4 0 003 15z"
              />
            </svg>
            <Link
              href="/dashboard"
              className="text-lg sm:text-xl font-bold text-black hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
            >
              <span className="sm:inline">PocketCloud</span>
            </Link>
          </div>

          {/* Middle - Navigation */}
          <div className="hidden sm:flex items-center justify-center flex-1 px-2 ml-6">
            <div className="flex space-x-2">
              <Link
                href="/dashboard"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-teal-500 text-white dark:bg-teal-500 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/files"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/files'
                    ? 'bg-teal-500 text-white dark:bg-teal-500 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                }`}
              >
                Your Files
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center justify-center flex-1 px-2">
            <div className="flex space-x-1">
              <Link
                href="/dashboard"
                className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-teal-500 text-white dark:bg-teal-500 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/files"
                className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                  pathname === '/files'
                    ? 'bg-teal-500 text-white dark:bg-teal-500 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                }`}
              >
                Files
              </Link>
            </div>
          </div>

          {/* Right - Logout */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleLogout}
              className="rounded-md bg-teal-500 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
