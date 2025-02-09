'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ADMIN_CREDENTIALS } from '@/config/admin';
import PostChallengeModal from '@/components/PostChallengeModal';
import type { Challenge } from '@/types/challenge';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      if (session?.user?.email !== ADMIN_CREDENTIALS.email) {
        router.push('/dashboard');
      } else {
        fetchChallenges();
      }
    }
  }, [status, session, router]);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/challenges', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch challenges');
      }

      const data = await res.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to fetch challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSuccess = () => {
    setShowPostModal(false);
    fetchChallenges();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session || session.user.email !== ADMIN_CREDENTIALS.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Post and manage daily challenges</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              Post New Challenge
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Challenge List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Posted Challenges</h2>
            <div className="text-sm text-gray-500">
              Total: {challenges.length} challenges
            </div>
          </div>

          {error && (
            <div className="text-red-600 mb-4 text-center">{error}</div>
          )}

          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <a
                      href={challenge.leetcodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {challenge.leetcodeLink}
                    </a>
                    <div className="text-sm text-gray-500 mt-1">
                      Posted on {formatDate(challenge.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">
                      {challenge.submissions?.length || 0} submissions
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {challenges.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No challenges posted yet</div>
                <div className="text-gray-500 text-sm">
                  Click the "Post New Challenge" button to add your first challenge
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Challenge Modal */}
      {showPostModal && (
        <PostChallengeModal 
          onClose={() => setShowPostModal(false)} 
          onSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
} 
