'use client';

import { useState } from 'react';

interface PostChallengeModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PostChallengeModal({ onClose, onSuccess }: PostChallengeModalProps) {
  const [leetcodeLink, setLeetcodeLink] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateInput = () => {
    if (!leetcodeLink.trim()) {
      setError('LeetCode link is required');
      return false;
    }

    const leetcodeUrlPattern = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[\w-]+(\/description\/?)?$/;


    if (!leetcodeUrlPattern.test(leetcodeLink)) {
      setError('Please enter a valid LeetCode problem URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInput()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leetcodeLink: leetcodeLink.trim(),
          difficulty
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'Failed to create challenge');
        console.error('Error details:', data.details);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Post New Challenge</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leetcodeLink" className="block text-sm font-medium text-gray-700">
              LeetCode Problem Link
            </label>
            <input
              type="url"
              id="leetcodeLink"
              value={leetcodeLink}
              onChange={(e) => setLeetcodeLink(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 