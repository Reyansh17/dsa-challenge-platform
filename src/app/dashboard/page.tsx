'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import type { Challenge } from '@/types/challenge';

interface UserStreak {
  current: number;
  longest: number;
  lastCompleted: string;
}

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  totalProblemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  avatar: string;
  avatarStyle: string;
}

// Update the AVATARS constant to use DiceBear styles
const AVATAR_STYLES = [
  { id: 1, style: 'adventurer', alt: 'Adventurer Style' },
  { id: 2, style: 'avataaars', alt: 'Avataaars Style' },
  { id: 3, style: 'bottts', alt: 'Bottts Style' },
  { id: 4, style: 'funEmoji', alt: 'Fun Emoji Style' },
  { id: 5, style: 'lorelei', alt: 'Lorelei Style' },
  { id: 6, style: 'notionists', alt: 'Notionists Style' },
  { id: 7, style: 'openPeeps', alt: 'Open Peeps Style' },
  { id: 8, style: 'personas', alt: 'Personas Style' }
];

// Helper function to generate DiceBear URL
function getDiceBearUrl(style: string, seed: string) {
  const baseUrl = 'https://api.dicebear.com/7.x';
  const options = 'backgroundColor=b6e3f4,c0aede,d1d4f9';
  return `${baseUrl}/${style}/svg?seed=${encodeURIComponent(seed)}&${options}`;
}

const formatProblemName = (url: string): string => {
  try {
    // Extract problem name from LeetCode URL
    const problemName = url.split('/problems/')[1]?.split('/')[0];
    if (!problemName) return 'Unknown Problem';
    
    // Convert kebab-case to Title Case
    return problemName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Unknown Problem';
  }
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState<UserStreak>({ current: 0, longest: 0, lastCompleted: '' });
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState({
    total: 0,
    completed: 0
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/student-1.png');
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  });
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.email) {
      fetchTodayChallenges();
      fetchUserStreak();
      fetchLeaderboard();
    }
  }, [status, session, router]);

  const fetchTodayChallenges = async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/challenges/today', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch challenges');
      }

      const data = await res.json();
      if (data.success) {
        // Use the isCompleted flag from the backend
        const completed = data.challenges.filter(c => c.isCompleted);
        const active = data.challenges.filter(c => !c.isCompleted);

        setCompletedChallenges(completed);
        setActiveChallenges(active);
        setChallenges(data.challenges);

        setDailyProgress({
          total: data.challenges.length,
          completed: completed.length
        });
      } else {
        throw new Error(data.error || 'Failed to fetch challenges');
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to fetch today\'s challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStreak = async () => {
    try {
      const res = await fetch('/api/user/streak', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      } else {
        console.error('Failed to fetch streak');
        setStreak({ current: 0, longest: 0, lastCompleted: '' });
      }
    } catch (error) {
      console.error('Error fetching user streak:', error);
      setStreak({ current: 0, longest: 0, lastCompleted: '' });
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLeaderboardLoading(true);
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const handleChallengeComplete = async (challengeId: string) => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to complete challenge');
      }

      // Refresh challenges after completion
      await fetchTodayChallenges();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (style: string) => {
    try {
      const res = await fetch('/api/users/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatarStyle: style }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update avatar');
      }

      const data = await res.json();
      if (data.success) {
        // Update session with new avatar
        await fetch('/api/auth/session', { method: 'GET' });
        // Close modal and show success message
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert(error instanceof Error ? error.message : 'Failed to update avatar');
    }
  };

  // Filter challenges based on completion status
  const filteredChallenges = challenges.filter(c => showCompleted ? c.completed : !c.completed);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#e8f4f0]">
        {/* Add Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-64 p-8">
          {/* Progress Bar Section */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#2d3436]">Today's Progress</h1>
                <p className="text-gray-500 mt-1">
                  {completedChallenges.length} of {challenges.length} challenges completed
                </p>
              </div>
              <div className="text-2xl font-bold text-[#ff6b6b]">
                {Math.round((completedChallenges.length / Math.max(challenges.length, 1)) * 100)}%
              </div>
            </div>
            <div className="h-3 bg-[#f0f9f6] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#ff6b6b] to-[#ffd4d4] transition-all duration-500"
                style={{ 
                  width: `${(completedChallenges.length / Math.max(challenges.length, 1)) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2d3436] mb-2">Today's Challenges</h1>
            <p className="text-gray-600">Complete daily challenges to improve your problem-solving abilities</p>
          </div>

          {/* Challenges Section */}
          <div className="space-y-8">
            {/* Active Challenges */}
            <div>
              <h2 className="text-xl font-semibold text-[#2d3436] mb-6">Today's Challenges</h2>
              <div className="grid grid-cols-2 gap-6">
                {activeChallenges.map((challenge) => {
                  const isCompleted = challenge.isCompleted;

                  const cardColors = {
                    Easy: { bg: 'bg-[#c3fae8]', text: 'text-[#0ca678]', hover: 'hover:bg-[#96f2d7]' },
                    Medium: { bg: 'bg-[#fff3bf]', text: 'text-[#f08c00]', hover: 'hover:bg-[#ffe066]' },
                    Hard: { bg: 'bg-[#ffe3e3]', text: 'text-[#f03e3e]', hover: 'hover:bg-[#ffc9c9]' }
                  };

                  const colors = cardColors[challenge.difficulty];

                  return (
                    <motion.div
                      key={challenge._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl p-6 ${
                        isCompleted ? 'border-2 border-[#0ca678]' : ''
                      } hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors.bg} ${colors.text}`}>
                          {challenge.difficulty === 'Easy' ? '⚡' :
                           challenge.difficulty === 'Medium' ? '🔥' : '💪'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#2d3436] mb-1">
                            {formatProblemName(challenge.leetcodeLink)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>45 min</span>
                            <span>•</span>
                            <span>{challenge.difficulty}</span>
                            {isCompleted && (
                              <span className="text-[#0ca678] flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <a
                          href={challenge.leetcodeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#ff6b6b] text-white rounded-xl text-center hover:bg-[#ff5252] transition-colors"
                        >
                          View Problem
                        </a>
                        {!isCompleted && (
                          <button
                            onClick={() => handleChallengeComplete(challenge._id)}
                            className={`w-10 h-10 ${colors.bg} ${colors.text} ${colors.hover} rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ca678]`}
                          >
                            <svg 
                              className="w-6 h-6" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4"
                        >
                          <div className="text-[#0ca678]">
                            <svg 
                              className="w-6 h-6" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-[#2d3436] mb-6">
                  Completed Challenges
                  <span className="ml-2 text-sm text-gray-500">
                    ({completedChallenges.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {completedChallenges.map((challenge) => {
                    const cardColors = {
                      Easy: { bg: 'bg-[#c3fae8]', text: 'text-[#0ca678]', hover: 'hover:bg-[#96f2d7]' },
                      Medium: { bg: 'bg-[#fff3bf]', text: 'text-[#f08c00]', hover: 'hover:bg-[#ffe066]' },
                      Hard: { bg: 'bg-[#ffe3e3]', text: 'text-[#f03e3e]', hover: 'hover:bg-[#ffc9c9]' }
                    };

                    return (
                      <motion.div
                        key={challenge._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 border-2 border-[#0ca678] hover:shadow-lg transition-all opacity-75"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            cardColors[challenge.difficulty].bg
                          } ${cardColors[challenge.difficulty].text}`}>
                            {challenge.difficulty === 'Easy' ? '⚡' :
                             challenge.difficulty === 'Medium' ? '🔥' : '💪'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#2d3436] mb-1">
                              {formatProblemName(challenge.leetcodeLink)}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>45 min</span>
                              <span>•</span>
                              <span>{challenge.difficulty}</span>
                              <span className="text-[#0ca678] flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <a
                            href={challenge.leetcodeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-[#0ca678] text-white rounded-xl text-center hover:bg-[#099268] transition-colors"
                          >
                            View Solution
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showConfetti && <Confetti />}
    </PageLayout>
  );
}

// Simple Confetti component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-confetti">🎉</div>
        <div className="animate-confetti delay-100"></div>
        <div className="animate-confetti delay-200">✨</div>
      </div>
    </div>
  );
} 