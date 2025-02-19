'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Sidebar from '@/components/Sidebar';

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  totalProblemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  points: number;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all-time'); // 'all-time', 'this-week', 'this-month'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else {
      fetchLeaderboard();
    }
  }, [status, timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leaderboard?filter=${timeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        {/* Add Sidebar */}
        <Sidebar />

        {/* Main Content - Add margin to account for sidebar */}
        <div className="ml-64 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setTimeFilter('all-time')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === 'all-time'
                      ? 'bg-white text-purple-900'
                      : 'bg-purple-800 text-white hover:bg-purple-700'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter('this-week')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === 'this-week'
                      ? 'bg-white text-purple-900'
                      : 'bg-purple-800 text-white hover:bg-purple-700'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeFilter('this-month')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === 'this-month'
                      ? 'bg-white text-purple-900'
                      : 'bg-purple-800 text-white hover:bg-purple-700'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {leaderboard.map((user, index) => {
                    const isCurrentUser = user.email === session?.user?.email;
                    const isTopThree = index < 3;

                    return (
                      <div
                        key={user._id}
                        className={`p-6 transition-colors ${
                          isCurrentUser ? 'bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          {/* Rank */}
                          <div className="w-16 text-center">
                            {isTopThree ? (
                              <div className={`text-2xl ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-yellow-700'
                              }`}>
                                {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-gray-400">
                                #{index + 1}
                              </span>
                            )}
                          </div>

                          {/* Avatar */}
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100"
                            />
                            {isCurrentUser && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {user.name}
                              </h3>
                              {isCurrentUser && (
                                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                              <span>{user.totalProblemsSolved} problems solved</span>
                              <div className="flex items-center gap-3">
                                <span className="text-green-600">{user.easySolved} Easy</span>
                                <span className="text-yellow-600">{user.mediumSolved} Medium</span>
                                <span className="text-red-600">{user.hardSolved} Hard</span>
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {user.points}
                            </div>
                            <div className="text-sm text-gray-500">points</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 