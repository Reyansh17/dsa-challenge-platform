'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ADMIN_CREDENTIALS } from '@/config/admin';
import Image from 'next/image';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.email === ADMIN_CREDENTIALS.email) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: adminEmail,
        password: adminPassword,
        redirect: false,
        callbackUrl: '/admin'
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/leetcode.svg"
              alt="Leet Daily Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Leet
              </span>
              <span className="text-2xl font-semibold text-gray-700">
                Daily
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-center">
            Daily coding challenges to improve your problem-solving skills
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 rounded-lg px-6 py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <Image
            src="/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <span className="text-pink-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Daily Challenges</h3>
              <p className="text-sm text-gray-600">
                New coding problems every day to keep you sharp
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <span className="text-pink-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Monitor your improvement with detailed statistics
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <span className="text-pink-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Compete & Learn</h3>
              <p className="text-sm text-gray-600">
                Join the leaderboard and learn from others
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 