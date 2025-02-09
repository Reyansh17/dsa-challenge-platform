'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  email: string;
  name: string;
  isEligibleForAdmin: boolean;
  totalProblemsSolved: number;
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/manage-eligibility');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setIsLoading(false);
  };

  const toggleEligibility = async (userEmail: string, isEligible: boolean) => {
    setIsUpdating(userEmail);
    try {
      const res = await fetch('/api/admin/manage-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, isEligible }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update eligibility');
      }
    } catch (error) {
      console.error('Error updating eligibility:', error);
      alert('Failed to update eligibility');
    }
    setIsUpdating(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Manage Admin Eligibility</h1>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-semibold">{user.name}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-sm">
                      Problems Solved: {user.totalProblemsSolved}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleEligibility(user.email, !user.isEligibleForAdmin)}
                    disabled={isUpdating === user.email}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      user.isEligibleForAdmin
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white ${isUpdating === user.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpdating === user.email
                      ? 'Updating...'
                      : user.isEligibleForAdmin
                      ? 'Remove Eligibility'
                      : 'Make Eligible'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 