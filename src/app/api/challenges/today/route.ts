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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's challenges
    const challenges = await Challenge.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'submissions.userId',
      select: 'name email avatar'
    })
    .lean();

    // Format challenges and check completion status
    const formattedChallenges = challenges.map(challenge => ({
      _id: (challenge._id as { toString(): string }).toString(),
      leetcodeLink: challenge.leetcodeLink,
      difficulty: challenge.difficulty,
      createdAt: (challenge.createdAt as Date).toISOString(),
      submissions: challenge.submissions || [],
      isCompleted: challenge.submissions?.some(
        (sub: { userId?: { email?: string } }) => sub.userId?.email === session.user.email
      ) || false
    }));

    return NextResponse.json({
      success: true,
      challenges: formattedChallenges
    });
  } catch (error) {
    console.error('Error fetching today\'s challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
} 