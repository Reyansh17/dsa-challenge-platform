'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { AVATAR_STYLES, generateAvatarUrl } from '@/config/avatars';

interface UserStats {
  totalProblemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: {
    current: number;
    longest: number;
  };
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchUserStats();
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setCurrentName(session.user.name || '');
      setDisplayName(session.user.name || '');
      setNewName(session.user.name || '');
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.avatar) {
      setCurrentAvatar(session.user.avatar);
    }
  }, [session?.user?.avatar]);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    setSelectedStyle(session?.user?.avatarStyle || AVATAR_STYLES[0].id);
    setShowAvatarModal(true);
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    setPreviewAvatar(generateAvatarUrl(style, session?.user?.id || ''));
  };

  const handleAvatarUpdate = async () => {
    try {
      // Generate and show preview immediately
      const previewUrl = generateAvatarUrl(selectedStyle, session?.user?.id || '');
      setCurrentAvatar(previewUrl);

      const res = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarStyle: selectedStyle }),
      });

      if (res.ok) {
        const data = await res.json();
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            avatar: data.user.avatar,
            avatarStyle: data.user.avatarStyle
          }
        });
        setShowAvatarModal(false);
      } else {
        // Revert on error
        setCurrentAvatar(session?.user?.avatar || '');
        const error = await res.json();
        alert(error.error || 'Failed to update avatar');
      }
    } catch (error) {
      // Revert on error
      setCurrentAvatar(session?.user?.avatar || '');
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    }
  };

  const handleUpdateName = async () => {
    try {
      if (!newName.trim() || newName.trim().length < 2) {
        alert('Name must be at least 2 characters long');
        return;
      }

      setIsUpdating(true);
      
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: newName.trim()
          }
        });
        setIsEditingName(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName(currentName);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <div className="flex items-center gap-8">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={currentAvatar || '/default-avatar.png'}
                  alt={session?.user?.name || 'Profile'}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-pink-200 group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black bg-opacity-50 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-gray-100 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {displayName}
                      </h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-500">{session?.user?.email}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="px-4 py-2 bg-pink-100 rounded-full">
                    <span className="text-sm font-medium text-pink-600">
                      {stats?.totalProblemsSolved || 0} Problems Solved
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-yellow-100 rounded-full">
                    <span className="text-sm font-medium text-yellow-600">
                      {stats?.streak?.current || 0} Day Streak
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-green-500 text-lg font-semibold mb-2">Easy</div>
              <div className="text-3xl font-bold text-gray-900">{stats?.easySolved || 0}</div>
              <div className="text-sm text-gray-500">problems solved</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-yellow-500 text-lg font-semibold mb-2">Medium</div>
              <div className="text-3xl font-bold text-gray-900">{stats?.mediumSolved || 0}</div>
              <div className="text-sm text-gray-500">problems solved</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-red-500 text-lg font-semibold mb-2">Hard</div>
              <div className="text-3xl font-bold text-gray-900">{stats?.hardSolved || 0}</div>
              <div className="text-sm text-gray-500">problems solved</div>
            </div>
          </div>

          {/* Streak Info */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Streak Stats</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Current Streak</div>
                <div className="text-3xl font-bold text-yellow-500">
                  {stats?.streak?.current || 0} days
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Longest Streak</div>
                <div className="text-3xl font-bold text-pink-500">
                  {stats?.streak?.longest || 0} days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Edit Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Choose Avatar Style</h2>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    selectedStyle === style.id
                      ? 'bg-pink-100 ring-2 ring-pink-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={generateAvatarUrl(style.id, session?.user?.id || '')}
                    alt={style.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{style.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAvatarUpdate}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
} 