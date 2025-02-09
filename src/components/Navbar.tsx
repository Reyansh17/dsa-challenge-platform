'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session, status, update: updateSession } = useSession();
  const pathname = usePathname();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  const refreshProfile = useCallback(async () => {
    if (status === 'authenticated') {
      try {
        const updatedSession = await updateSession();
        setProfileVersion(v => v + 1);
        return updatedSession;
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  }, [status, updateSession]);

  // Refresh on mount and pathname change
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile, pathname]);

  // Continuous refresh on profile page
  useEffect(() => {
    if (pathname === '/profile') {
      const interval = setInterval(refreshProfile, 500); // More frequent updates
      return () => clearInterval(interval);
    }
  }, [pathname, refreshProfile]);

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Handle profile menu click
  const handleProfileClick = async () => {
    await refreshProfile();
    setShowProfileMenu(!showProfileMenu);
  };

  // Handle profile link click
  const handleProfileLinkClick = async () => {
    setShowProfileMenu(false);
    await refreshProfile();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-pink-300 backdrop-blur-sm border-b border-gray-700/50 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={status === 'authenticated' ? '/dashboard' : '/'}
              className="text-white font-bold text-xl hover:text-blue-400 transition-colors"
            >
              DSA Challenge
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {status === 'authenticated' && session?.user ? (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-gray-700 overflow-hidden">
                    {session?.user?.image ? (
                      <Image
                        key={`${profileVersion}-${session.user.image}`}
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        priority
                        unoptimized={true}
                      />
                    ) : (
                      <span key={profileVersion} className="text-white text-sm font-medium">
                        {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 group-hover:bg-gray-800 group-hover:text-white'
                  }`}>
                    {session?.user?.name || 'Profile'}
                  </span>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleProfileLinkClick}
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
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                  </>
                )}
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
} 