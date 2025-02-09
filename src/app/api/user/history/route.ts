import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find all challenges where the user has submitted
    const challenges = await Challenge.find({
      'submissions.user': session.user.id
    })
    .sort({ 'submissions.submittedAt': -1 })
    .limit(10)
    .select('leetcodeLink difficulty submissions');

    // Format the challenges to include only the user's submissions
    const userHistory = challenges.map(challenge => {
      const userSubmission = challenge.submissions.find(
        (s: any) => s.user.toString() === session.user.id
      );
      return {
        _id: challenge._id,
        leetcodeLink: challenge.leetcodeLink,
        difficulty: challenge.difficulty,
        completed: userSubmission.completed,
        submittedAt: userSubmission.submittedAt,
      };
    });

    return NextResponse.json(userHistory);
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    );
  }
} 