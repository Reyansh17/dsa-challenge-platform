import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import User from '@/models/user';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all challenges completed by the user
    const completedChallenges = await Challenge.find({
      'submissions.user': user._id,
      'submissions.completed': true
    }).sort({ createdAt: -1 });

    return NextResponse.json(completedChallenges);
  } catch (error) {
    console.error('Error fetching challenge history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge history' },
      { status: 500 }
    );
  }
} 