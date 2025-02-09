import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import { authOptions } from '@/config/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all completed challenges for the user
    const completedChallenges = await Challenge.find({
      'submissions.userId.email': session.user.email
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompleted = '';

    if (completedChallenges.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if completed any challenge today
      const completedToday = completedChallenges.some(challenge => {
        const challengeDate = new Date(challenge.createdAt);
        challengeDate.setHours(0, 0, 0, 0);
        return challengeDate.getTime() === today.getTime();
      });

      // Check if completed any challenge yesterday
      const completedYesterday = completedChallenges.some(challenge => {
        const challengeDate = new Date(challenge.createdAt);
        challengeDate.setHours(0, 0, 0, 0);
        return challengeDate.getTime() === yesterday.getTime();
      });

      if (completedToday) {
        currentStreak = 1;
        lastCompleted = today.toISOString();
      }

      if (completedYesterday && completedToday) {
        currentStreak = 2;
      }

      longestStreak = Math.max(currentStreak, completedChallenges.length);
    }

    return NextResponse.json({
      current: currentStreak,
      longest: longestStreak,
      lastCompleted
    });
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
} 