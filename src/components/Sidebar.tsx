'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ffd4d4] rounded-lg flex items-center justify-center">
            <span className="text-[#ff6b6b] text-lg">🎯</span>
          </div>
          <span className="text-xl font-semibold text-[#2d3436]">DSA Challenge</span>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-gray-700 overflow-hidden">
              {session?.user?.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-700 text-sm font-medium">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-700">
                {session?.user?.name}
              </div>
              <div className="text-xs text-gray-500">
                {session?.user?.email}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg py-1 z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileMenu(false)}
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/dashboard'
                ? 'bg-[#ff6b6b] text-white'
                : 'text-gray-600 hover:bg-[#f0f9f6]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/leaderboard'
                ? 'bg-[#ff6b6b] text-white'
                : 'text-gray-600 hover:bg-[#f0f9f6]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Leaderboard</span>
          </Link>
        </nav>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#2d3436] mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="bg-[#f0f9f6] p-4 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Your Rank</div>
              <div className="text-2xl font-bold text-[#0ca678]">#1</div>
            </div>
            <div className="bg-[#f0f9f6] p-4 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Problems Solved</div>
              <div className="text-2xl font-bold text-[#0ca678]">42</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 